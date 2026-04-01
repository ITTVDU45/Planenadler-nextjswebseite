'use client'

import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GET_CART } from '@/features/cart/api/queries'
import { AddToCartSuccessModal } from '@/shared/components/AddToCartSuccessModal'
import type { ConfiguratorHints, ConfiguratorOptionsFromBackend } from './types'
import {
  buildConfiguredCartPayload,
  buildPriceCalculationRequest,
  type PriceCalculationResult,
} from '@/lib/customizer-pricing'
import type {
  ConfigFormField,
  ConfigFormState,
  ResolvedChoice,
  ResolvedConfiguratorHints,
  ResolvedCustomizerConfig,
  StepId,
} from '@/lib/customizer-runtime'
import { emptyConfigFormState } from '@/lib/customizer-runtime'
import { cn } from '@/lib/utils'

interface ProductConfiguratorProps {
  productId: number
  productName: string
  price: string
  hints?: ConfiguratorHints
  configuratorOptions?: ConfiguratorOptionsFromBackend | null
  priceEndpoint?: string
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message?: string }>
}

const STEP_TITLES: Record<StepId, string> = {
  color: 'Material und Farbe',
  size: 'Masse waehlen',
  topSide: 'Obere Seite der Plane',
  leftSide: 'Linke Seite der Plane',
  rightSide: 'Rechte Seite der Plane',
  bottomSide: 'Untere Seite der Plane',
  window: 'Fenster',
  door: 'Tuer',
  eyelets: 'Oesen',
  closureType: 'Verschlussart',
  frontClosure: 'Frontverschluss',
  backClosure: 'Rueckenverschluss',
  extras: 'Extras',
  sketch: 'Skizze hochladen',
}

const ADD_TO_CART_MUTATION = /* GraphQL */ `
  mutation AddConfiguredProductToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      cartItem {
        key
        quantity
      }
    }
  }
`

const PRICE_DEBOUNCE_MS = 200

function createInitialFormState(
  resolvedConfig: ResolvedCustomizerConfig | null,
): ConfigFormState {
  const nextState: ConfigFormState = {
    ...emptyConfigFormState,
    doorExtras: [],
    extrasSelected: [],
    frontClosureExtras: [],
    backClosureExtras: [],
  }

  if (!resolvedConfig) {
    return nextState
  }

  if (resolvedConfig.options.materials.length === 1) {
    nextState.material = resolvedConfig.options.materials[0].label
  }

  if (resolvedConfig.options.colors.length === 1) {
    nextState.color = resolvedConfig.options.colors[0].label
  }

  return nextState
}

function createMutationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `cfg-${Date.now()}`
}

async function postGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data: T; response: Response }> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  })

  const json = (await response.json()) as GraphQLResponse<T>
  if (!response.ok || json.errors?.length) {
    throw new Error(json.errors?.[0]?.message || 'GraphQL Anfrage fehlgeschlagen')
  }
  if (!json.data) {
    throw new Error('Leere GraphQL Antwort')
  }

  return { data: json.data, response }
}

/** Woo-Session laeuft ueber HttpOnly-Cookie (siehe /api/graphql); kein localStorage mehr. */
function applySessionFromResponse(_response: Response): void {}

function mergeHints(
  resolvedHints: ResolvedConfiguratorHints,
  hints?: ConfiguratorHints,
): ResolvedConfiguratorHints {
  if (!hints) return resolvedHints

  return {
    ...resolvedHints,
    ...Object.fromEntries(
      Object.entries(hints).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
    ),
  }
}

function isFilled(field: ConfigFormField, form: ConfigFormState): boolean {
  const value = form[field]
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
}

function isValidImageUrl(url?: string | null): boolean {
  return Boolean(url && url !== 'http://null' && url !== 'http://null/' && !url.endsWith('/null'))
}

function getDynamicRequiredFields(
  form: ConfigFormState,
  resolvedConfig: ResolvedCustomizerConfig,
): ConfigFormField[] {
  const dynamic: ConfigFormField[] = []

  if (resolvedConfig.steps.includes('window') && form.hasWindow === 'yes') {
    if (form.windowSplit === 'yes') {
      dynamic.push('windowSplitLeftWidthCm', 'windowSplitRightWidthCm')
    } else {
      dynamic.push('windowWidthCm', 'windowHeightCm')
    }
  }

  if (resolvedConfig.steps.includes('door') && form.hasDoor === 'yes') {
    dynamic.push('doorWidthCm', 'doorHeightCm')
  }

  return dynamic
}

const REQUIRED_FIELD_LABELS: Partial<Record<ConfigFormField, string>> = {
  material: 'Material',
  color: 'Farbe',
  topSide: 'Obere Seite der Plane',
  leftSide: 'Linke Seite der Plane',
  rightSide: 'Rechte Seite der Plane',
  bottomSide: 'Untere Seite der Plane',
  hasWindow: 'Fenster: Bitte Ja oder Nein waehlen',
  windowWidthCm: 'Fensterbreite',
  windowHeightCm: 'Fensterhoehe',
  windowSplitLeftWidthCm: 'Fensterbreite links',
  windowSplitRightWidthCm: 'Fensterbreite rechts',
  hasDoor: 'Tuer: Bitte Ja oder Nein waehlen',
  doorWidthCm: 'Tuerbreite',
  doorHeightCm: 'Tuerhoehe',
  eyeletEdge: 'Oesen',
  closureType: 'Verschlussart',
  frontClosure: 'Frontverschluss',
  backClosure: 'Rueckenverschluss',
}

function getRequiredFieldLabel(
  field: ConfigFormField,
  resolvedConfig: ResolvedCustomizerConfig,
): string {
  const dimensionField = resolvedConfig.dimensions.fields.find((entry) => entry.key === field)
  if (dimensionField) return dimensionField.label
  return REQUIRED_FIELD_LABELS[field] ?? field
}

function getStepIdForField(
  field: ConfigFormField,
  resolvedConfig: ResolvedCustomizerConfig,
): StepId | null {
  if (resolvedConfig.dimensions.fields.some((entry) => entry.key === field)) return 'size'

  switch (field) {
    case 'material':
    case 'color':
      return 'color'
    case 'topSide':
      return 'topSide'
    case 'leftSide':
      return 'leftSide'
    case 'rightSide':
      return 'rightSide'
    case 'bottomSide':
      return 'bottomSide'
    case 'hasWindow':
    case 'windowWidthCm':
    case 'windowHeightCm':
    case 'windowDistanceSideCm':
    case 'windowDistanceBottomCm':
    case 'windowSplit':
    case 'windowSplitLeftWidthCm':
    case 'windowSplitLeftHeightCm':
    case 'windowSplitRightWidthCm':
    case 'windowSplitRightHeightCm':
    case 'windowSplitRightDistanceRightCm':
    case 'windowSplitLeftDistanceLeftCm':
    case 'windowSplitLeftDistanceBottomCm':
    case 'windowSplitRightDistanceBottomCm':
      return 'window'
    case 'hasDoor':
    case 'doorWidthCm':
    case 'doorHeightCm':
    case 'doorDistanceLeftCm':
      return 'door'
    case 'eyeletEdge':
      return 'eyelets'
    case 'closureType':
      return 'closureType'
    case 'frontClosure':
      return 'frontClosure'
    case 'backClosure':
      return 'backClosure'
    default:
      return null
  }
}

function describeStateMessage(
  stateMessage: string | undefined,
  warnings: string[] | undefined,
): string {
  if (stateMessage) return stateMessage
  if (warnings?.length) return warnings[0]
  return 'Der Konfigurator ist fuer dieses Produkt derzeit nicht sicher verfuegbar.'
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&uuml;': 'u',
  '&Uuml;': 'U',
  '&ouml;': 'o',
  '&Ouml;': 'O',
  '&auml;': 'a',
  '&Auml;': 'A',
  '&szlig;': 'ss',
}

function decodeHtmlEntities(value: string): string {
  let decoded = value

  for (const [entity, replacement] of Object.entries(HTML_ENTITY_MAP)) {
    decoded = decoded.split(entity).join(replacement)
  }

  return decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ')
}

function normalizeHintText(value: string): string {
  return decodeHtmlEntities(
    stripHtmlTags(
      value
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p[^>]*>/gi, ''),
    ),
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function extractListItems(value: string): string[] {
  return Array.from(value.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map((match) => normalizeHintText(match[1] ?? ''))
    .filter((item) => item.length > 0)
}

function HintPanel({ text }: { text: string }) {
  const listItems = extractListItems(text)

  if (listItems.length > 0) {
    return (
      <div className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">
        <ul className="list-disc space-y-2 pl-5">
          {listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )
  }

  const normalized = normalizeHintText(text)
  const paragraphs = normalized.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)

  return (
    <div className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-6">
            {paragraph}
          </p>
        ))
      ) : null}
    </div>
  )
}

function NestedAccordion({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D7E6F8] bg-[#FAFCFF] shadow-[0_4px_12px_rgba(15,43,82,0.04)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#F4F9FF]"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-[#0F2B52]">{title}</span>
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#CFE0F5] text-[#1F5CAB] transition ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>
      {isOpen ? <div className="border-t border-[#EAF1FB] p-4">{children}</div> : null}
    </div>
  )
}

function StepAccordionItem({
  id,
  title,
  openStep,
  onToggle,
  showWarning = false,
  children,
}: {
  id: StepId
  title: string
  openStep: StepId | null
  onToggle: (id: StepId) => void
  showWarning?: boolean
  children: ReactNode
}) {
  const isOpen = openStep === id

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D7E6F8] bg-white shadow-[0_8px_24px_rgba(15,43,82,0.05)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-[#FFFFFF] to-[#F7FBFF] px-5 py-4 text-left transition hover:from-[#F8FBFF] hover:to-[#F2F8FF]"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-[#0F2B52]">{title}</span>
        <span className="flex items-center gap-2">
          {showWarning ? (
            <span
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-amber-300 bg-amber-100 px-2 text-sm font-bold text-amber-700"
              aria-label="In diesem Abschnitt fehlen Pflichtangaben"
              title="In diesem Abschnitt fehlen Pflichtangaben"
            >
              !
            </span>
          ) : null}
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE0F5] text-[#1F5CAB] transition ${isOpen ? 'rotate-180' : ''}`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </span>
      </button>
      {isOpen ? <div className="border-t border-[#EAF1FB] p-5">{children}</div> : null}
    </div>
  )
}

function ColorSwatch({ choice }: { choice: ResolvedChoice }) {
  const hex = typeof choice.meta?.hex === 'string' ? choice.meta.hex : undefined
  return (
    <span
      className="mx-auto mb-2 block h-9 w-9 rounded-full border border-[#CFE0F5]"
      style={{ backgroundColor: hex || '#DCE9F8' }}
      aria-hidden
    />
  )
}

function SelectionCheckBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1F5CAB] text-white shadow-[0_4px_14px_rgba(31,92,171,0.45)] ring-[3px] ring-white motion-safe:animate-choice-check-pop',
        className,
      )}
      aria-hidden
    >
      <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
    </span>
  )
}

function PreviewBadge({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      aria-label={`Bildvorschau fuer ${label} anzeigen`}
      className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE0F5] bg-white/95 text-[#1F5CAB] shadow-[0_4px_12px_rgba(15,43,82,0.16)] transition hover:border-[#1F5CAB] hover:text-[#0F2B52]"
    >
      <Search className="h-4 w-4" />
    </button>
  )
}

const choiceCardSelected =
  'border-2 border-[#1F5CAB] bg-gradient-to-br from-[#EFF8FF] to-[#E0EFFF] shadow-[0_12px_32px_rgba(31,92,171,0.28)] ring-2 ring-[#1F5CAB]/30'
const choiceCardUnselected = 'border border-[#D9E7F8] bg-white hover:border-[#AFC9EA] hover:bg-[#F9FCFF]'

function ChoiceGrid({
  choices,
  value,
  onChange,
  onPreview,
  variant = 'default',
}: {
  choices: ResolvedChoice[]
  value: string
  onChange: (value: string) => void
  onPreview?: (choice: ResolvedChoice) => void
  variant?: 'default' | 'color'
}) {
  return (
    <div className={`grid gap-3 ${variant === 'color' ? 'grid-cols-3 sm:grid-cols-5' : 'sm:grid-cols-2'}`}>
      {choices.map((choice) => {
        const isSelected = value === choice.label
        return (
          <div
            key={choice.id}
            className={cn(
              'relative rounded-xl border p-3 transition duration-200',
              isSelected ? choiceCardSelected : choiceCardUnselected,
            )}
          >
            {isSelected ? <SelectionCheckBadge /> : null}
            {!variant && isValidImageUrl(choice.imageSrc) && onPreview ? (
              <PreviewBadge label={choice.label} onClick={() => onPreview(choice)} />
            ) : null}
            <button
              type="button"
              onClick={() => onChange(choice.label)}
              aria-pressed={isSelected}
              className="block w-full text-left"
            >
              {variant === 'color' ? (
                <div className="text-center">
                  <ColorSwatch choice={choice} />
                  <span className="text-xs font-semibold text-[#0F2B52]">{choice.label}</span>
                </div>
              ) : (
                <>
                  <div className="relative h-20 w-full overflow-hidden rounded-lg bg-[#F6FAFF]">
                    {isValidImageUrl(choice.imageSrc) ? (
                      <img
                        src={choice.imageSrc}
                        alt={choice.label}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#F6FAFF] to-[#EAF3FF]" />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#0F2B52]">{choice.label}</p>
                </>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function SideOptionPreview({ option, imageSrc }: { option: string; imageSrc?: string }) {
  if (isValidImageUrl(imageSrc)) {
    return (
      <div className="relative h-24 w-full overflow-hidden rounded-lg bg-white p-2">
        <img
          src={imageSrc}
          alt={option}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  if (option.toLowerCase().includes('oese')) {
    const spacingClass = option.includes('30') ? 'gap-1' : 'gap-3'
    return (
      <div className={`flex justify-center ${spacingClass}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-2 w-2 rounded-full bg-[#1F5CAB]/75" />
        ))}
      </div>
    )
  }

  if (option.toLowerCase().includes('keder')) {
    return (
      <div className="h-9 rounded-md border border-[#BCD3EE] bg-[#F6FAFF] p-1.5">
        <div className="h-full rounded-full bg-[#1F5CAB]/75" />
      </div>
    )
  }

  return <div className="h-9 rounded-md border-2 border-[#BCD3EE] bg-[#F8FBFF]" />
}

function SideOptionGrid({
  value,
  onChange,
  choices,
  onPreview,
}: {
  value: string
  onChange: (value: string) => void
  choices: ResolvedChoice[]
  onPreview?: (choice: ResolvedChoice) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice) => {
        const isSelected = value === choice.label
        return (
          <div
            key={choice.id}
            className={cn(
              'relative rounded-xl border p-3 transition duration-200',
              isSelected ? choiceCardSelected : choiceCardUnselected,
            )}
          >
            {isSelected ? <SelectionCheckBadge /> : null}
            {isValidImageUrl(choice.imageSrc) && onPreview ? (
              <PreviewBadge label={choice.label} onClick={() => onPreview(choice)} />
            ) : null}
            <button
              type="button"
              onClick={() => onChange(choice.label)}
              aria-pressed={isSelected}
              className="block w-full text-left"
            >
              <SideOptionPreview option={choice.label} imageSrc={choice.imageSrc} />
              <p className="mt-2 text-sm font-semibold text-[#0F2B52]">{choice.label}</p>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function MultiChoiceGrid({
  choices,
  selectedIds,
  onToggle,
  onPreview,
}: {
  choices: ResolvedChoice[]
  selectedIds: string[]
  onToggle: (value: string) => void
  onPreview?: (choice: ResolvedChoice) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice) => {
        const isSelected = selectedIds.includes(choice.id)
        return (
          <div
            key={choice.id}
            className={cn(
              'group relative rounded-2xl border transition duration-200',
              isSelected ? choiceCardSelected : choiceCardUnselected,
            )}
          >
            {isValidImageUrl(choice.imageSrc) && onPreview ? (
              <PreviewBadge label={choice.label} onClick={() => onPreview(choice)} />
            ) : null}
            <button
              type="button"
              onClick={() => onToggle(choice.id)}
              aria-pressed={isSelected}
              className="block w-full text-left"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-t-2xl bg-[#F6FAFF]">
                {isSelected ? <SelectionCheckBadge className="right-3 top-3" /> : null}
                {isValidImageUrl(choice.imageSrc) ? (
                  <img
                    src={choice.imageSrc}
                    alt={choice.label}
                    loading="lazy"
                    className={`h-full w-full object-contain transition ${isSelected ? 'scale-[1.02]' : 'group-hover:scale-[1.02]'}`}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#F6FAFF] to-[#EAF3FF]" />
                )}
              </div>
              <div
                className={`rounded-b-2xl px-4 py-3 text-sm font-semibold transition ${isSelected ? 'bg-[#1F5CAB] text-white' : 'bg-white text-[#0F2B52]'}`}
              >
                {choice.label}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: '' | 'yes' | 'no'
  onChange: (value: '' | 'yes' | 'no') => void
}) {
  return (
    <div className="inline-flex rounded-xl border border-[#CFE0F5] bg-[#F8FBFF] p-1">
      <button
        type="button"
        onClick={() => onChange('yes')}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          value === 'yes' ? 'bg-[#1F5CAB] text-white' : 'text-[#1F5CAB] hover:bg-[#EAF3FF]'
        }`}
      >
        Ja
      </button>
      <button
        type="button"
        onClick={() => onChange('no')}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          value === 'no' ? 'bg-[#1F5CAB] text-white' : 'text-[#1F5CAB] hover:bg-[#EAF3FF]'
        }`}
      >
        Nein
      </button>
    </div>
  )
}

export default function ProductConfigurator({
  productId,
  productName,
  price,
  hints,
  configuratorOptions,
  priceEndpoint,
}: ProductConfiguratorProps) {
  const apolloClient = useApolloClient()
  const resolvedConfig = configuratorOptions?.resolvedConfig ?? null
  const configuratorState = configuratorOptions?.state
  const initialFormState = useMemo(() => createInitialFormState(resolvedConfig), [resolvedConfig])

  const [form, setForm] = useState<ConfigFormState>(initialFormState)
  const [openStep, setOpenStep] = useState<StepId | null>(resolvedConfig?.steps[0] ?? null)
  const [doorExtrasAccordionOpen, setDoorExtrasAccordionOpen] = useState(true)
  const [frontClosureExtrasOpen, setFrontClosureExtrasOpen] = useState(true)
  const [backClosureExtrasOpen, setBackClosureExtrasOpen] = useState(true)
  const [sketch, setSketch] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [previewChoice, setPreviewChoice] = useState<ResolvedChoice | null>(null)
  const [calculatedPrice, setCalculatedPrice] = useState<string | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [desktopPricePanelOpen, setDesktopPricePanelOpen] = useState(true)
  const priceAbortRef = useRef<AbortController | null>(null)
  const configuratorCardRef = useRef<HTMLDivElement | null>(null)

  const effectiveHints = useMemo(
    () => mergeHints(resolvedConfig?.hints ?? {
      color: 'Waehlen Sie Material und Farbe passend zum Einsatzzweck.',
      size: 'Tragen Sie die benoetigten Masse in Zentimetern ein.',
      topSide: 'Waehlen Sie die Verarbeitung fuer die obere Seite der Plane.',
      leftSide: 'Waehlen Sie die Verarbeitung fuer die linke Seite der Plane.',
      rightSide: 'Waehlen Sie die Verarbeitung fuer die rechte Seite der Plane.',
      bottomSide: 'Waehlen Sie die Verarbeitung fuer die untere Seite der Plane.',
      window: 'Definieren Sie Fenstermaeße und Position.',
      door: 'Definieren Sie Tuermasse und Position.',
      eyelets: 'Waehlen Sie die Oesenkonfiguration.',
      closureType: 'Waehlen Sie die Verschlussart.',
      frontClosure: 'Waehlen Sie den Frontverschluss.',
      backClosure: 'Waehlen Sie den Rueckenverschluss.',
      extras: 'Definieren Sie zusaetzliche Ausstattungen und Sonderwuensche.',
      sketch: 'Laden Sie optional eine Skizze hoch.',
    }, hints),
    [hints, resolvedConfig],
  )

  const steps = resolvedConfig?.steps ?? []
  const stateMessage = describeStateMessage(configuratorState?.message, configuratorState?.warnings)

  useEffect(() => {
    setForm(initialFormState)
    setOpenStep(resolvedConfig?.steps[0] ?? null)
  }, [initialFormState, resolvedConfig])

  const requiredFields = useMemo(() => {
    if (!resolvedConfig) return []
    return [
      ...resolvedConfig.validationRules.requiredFields,
      ...getDynamicRequiredFields(form, resolvedConfig),
    ]
  }, [form, resolvedConfig])

  const hasMinimumForPrice = useMemo(() => {
    if (!resolvedConfig) return false
    return resolvedConfig.validationRules.minimumForPrice.every((field) => isFilled(field, form))
  }, [form, resolvedConfig])

  const canSubmit = useMemo(() => {
    if (!resolvedConfig) return false
    if (
      configuratorState?.status === 'missing' ||
      configuratorState?.status === 'error' ||
      configuratorState?.status === 'unsupported'
    ) {
      return false
    }
    return requiredFields.every((field) => isFilled(field, form))
  }, [configuratorState?.status, requiredFields, resolvedConfig, form])

  const missingRequiredFields = useMemo(() => {
    if (!resolvedConfig) return []
    return requiredFields.filter((field) => !isFilled(field, form))
  }, [form, requiredFields, resolvedConfig])

  const missingFieldsMessage = useMemo(() => {
    if (!resolvedConfig || canSubmit || missingRequiredFields.length === 0) return null

    const labels = Array.from(
      new Set(
        missingRequiredFields.map((field) => getRequiredFieldLabel(field, resolvedConfig)),
      ),
    )

    const visibleLabels = labels.slice(0, 4)
    const remainingCount = labels.length - visibleLabels.length
    const suffix =
      remainingCount > 0 ? ` und ${remainingCount} weitere Angaben` : ''

    return `Bitte vervollstaendigen Sie zuerst: ${visibleLabels.join(', ')}${suffix}.`
  }, [canSubmit, missingRequiredFields, resolvedConfig])

  const stepsWithMissingFields = useMemo(() => {
    if (!resolvedConfig) return new Set<StepId>()

    return new Set(
      missingRequiredFields
        .map((field) => getStepIdForField(field, resolvedConfig))
        .filter((stepId): stepId is StepId => stepId !== null),
    )
  }, [missingRequiredFields, resolvedConfig])

  useEffect(() => {
    if (!resolvedConfig || !priceEndpoint?.trim()) return
    if (!resolvedConfig.pricingCapabilities.livePrice) return

    if (!hasMinimumForPrice) {
      setCalculatedPrice(null)
      setPriceError(null)
      return
    }

    const timer = setTimeout(() => {
      const payload = buildPriceCalculationRequest(productId, form, resolvedConfig)
      if (priceAbortRef.current) {
        priceAbortRef.current.abort()
      }

      const controller = new AbortController()
      priceAbortRef.current = controller
      setPriceLoading(true)
      setPriceError(null)

      fetch(priceEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null
            throw new Error(data?.error || 'Preisberechnung fehlgeschlagen')
          }
          return res.json() as Promise<PriceCalculationResult>
        })
        .then((data) => {
          setCalculatedPrice(data.price)
        })
        .catch((fetchError) => {
          if (fetchError instanceof Error && fetchError.name === 'AbortError') return
          setCalculatedPrice(null)
          setPriceError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Live-Preis konnte nicht geladen werden.',
          )
        })
        .finally(() => {
          if (priceAbortRef.current === controller) {
            setPriceLoading(false)
            priceAbortRef.current = null
          }
        })
    }, PRICE_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      if (priceAbortRef.current) {
        priceAbortRef.current.abort()
      }
    }
  }, [form, hasMinimumForPrice, priceEndpoint, productId, resolvedConfig])

  const displayPrice = calculatedPrice ?? price ?? 'Preis auf Anfrage'
  const formId = `product-configurator-form-${productId}`

  const setField = <K extends keyof ConfigFormState>(key: K, value: ConfigFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const clearSingleWindowFields = (state: ConfigFormState): ConfigFormState => ({
    ...state,
    windowWidthCm: '',
    windowHeightCm: '',
    windowDistanceSideCm: '',
    windowDistanceBottomCm: '',
  })

  const clearSplitWindowFields = (state: ConfigFormState): ConfigFormState => ({
    ...state,
    windowSplitLeftWidthCm: '',
    windowSplitLeftHeightCm: '',
    windowSplitRightWidthCm: '',
    windowSplitRightHeightCm: '',
    windowSplitRightDistanceRightCm: '',
    windowSplitLeftDistanceLeftCm: '',
    windowSplitLeftDistanceBottomCm: '',
    windowSplitRightDistanceBottomCm: '',
  })

  const preserveConfiguratorScroll = (update: () => void) => {
    const anchor = configuratorCardRef.current
    const beforeTop = anchor?.getBoundingClientRect().top ?? null

    update()

    if (beforeTop === null || typeof window === 'undefined') {
      return
    }

    window.requestAnimationFrame(() => {
      const afterTop = anchor?.getBoundingClientRect().top ?? null
      if (afterTop === null) {
        return
      }

      const delta = afterTop - beforeTop
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior: 'auto' })
      }
    })
  }

  const toggleStep = (step: StepId) => {
    preserveConfiguratorScroll(() => {
      setOpenStep((prev) => (prev === step ? null : step))
    })
  }

  const setWindowEnabled = (value: '' | 'yes' | 'no') => {
    preserveConfiguratorScroll(() => {
      setForm((prev) => {
        let next: ConfigFormState = { ...prev, hasWindow: value }

        if (value !== 'yes') {
          next = clearSingleWindowFields(next)
          next = clearSplitWindowFields(next)
          next.windowSplit = ''
        }

        return next
      })
    })
  }

  const setWindowSplitMode = (value: '' | 'yes' | 'no') => {
    preserveConfiguratorScroll(() => {
      setForm((prev) => {
        let next: ConfigFormState = { ...prev, windowSplit: value }

        if (value === 'yes') {
          next = clearSingleWindowFields(next)
        } else {
          next = clearSplitWindowFields(next)
        }

        return next
      })
    })
  }

  const toggleMultiValue = (
    field: 'doorExtras' | 'extrasSelected' | 'frontClosureExtras' | 'backClosureExtras',
    id: string,
  ) => {
    setForm((prev) => {
      const exists = prev[field].includes(id)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((value) => value !== id) : [...prev[field], id],
      }
    })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSketch(event.target.files?.[0] ?? null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!resolvedConfig) {
      setError(stateMessage)
      return
    }

    if (!canSubmit) {
      setError('Bitte fuellen Sie alle Pflichtfelder aus.')
      return
    }

    if (sketch && sketch.size > 5 * 1024 * 1024) {
      setError('Die Skizze darf maximal 5 MB gross sein.')
      return
    }

    setSubmitting(true)

    try {
      const priceRequest = buildPriceCalculationRequest(productId, form, resolvedConfig)
      const configuredCartPayload = buildConfiguredCartPayload(
        priceRequest,
        createMutationId(),
        sketch?.name,
      )

      const { response } = await postGraphQL<{ addToCart: { cartItem: { key: string } } }>(
        ADD_TO_CART_MUTATION,
        {
          input: {
            clientMutationId: createMutationId(),
            productId,
            quantity: 1,
            extraData: JSON.stringify(configuredCartPayload.extraData),
          },
        },
      )

      applySessionFromResponse(response)
      await apolloClient.refetchQueries({ include: [GET_CART] })

      setSuccess('Konfiguration wurde gespeichert und in den Warenkorb gelegt.')
      setSuccessModalOpen(true)
      setForm(initialFormState)
      setSketch(null)
      setOpenStep(steps[0] ?? null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Konfiguration konnte nicht gesendet werden.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AddToCartSuccessModal
        open={successModalOpen}
        productName={productName}
        onClose={() => setSuccessModalOpen(false)}
      />
      {previewChoice && isValidImageUrl(previewChoice.imageSrc) ? (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-[#0F2B52]/75 px-4 py-8"
          onClick={() => setPreviewChoice(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-[28px] bg-white p-4 shadow-[0_20px_60px_rgba(15,43,82,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewChoice(null)}
              aria-label="Vorschau schliessen"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CFE0F5] bg-white text-[#1F5CAB] transition hover:border-[#1F5CAB] hover:text-[#0F2B52]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-hidden rounded-[22px] bg-[#F6FAFF] p-4 sm:p-6">
              <img
                src={previewChoice.imageSrc!}
                alt={previewChoice.label}
                className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
            <p className="mt-4 text-center text-base font-semibold text-[#0F2B52]">
              {previewChoice.label}
            </p>
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[510] hidden w-[220px] xl:right-6 xl:w-[240px] lg:block">
        <div
          className="pointer-events-auto relative rounded-2xl border border-[#D4E3F7] bg-gradient-to-r from-[#F6FAFF] to-[#EEF5FF] px-4 py-3 shadow-[0_8px_18px_rgba(15,43,82,0.08)] transition-transform duration-300 ease-out"
          style={{
            transform: desktopPricePanelOpen
              ? 'translateX(0)'
              : 'translateX(calc(100% - 3rem))',
          }}
          aria-live="polite"
        >
          <button
            type="button"
            onClick={() => setDesktopPricePanelOpen((prev) => !prev)}
            aria-label={desktopPricePanelOpen ? 'Preiskasten einklappen' : 'Preiskasten ausklappen'}
            aria-expanded={desktopPricePanelOpen}
            className="absolute left-0 top-1/2 flex h-16 w-12 -translate-x-[calc(100%-1px)] -translate-y-1/2 items-center justify-center rounded-l-2xl border border-r-0 border-[#D4E3F7] bg-gradient-to-r from-[#F6FAFF] to-[#EEF5FF] text-[#1F5CAB] shadow-[0_8px_18px_rgba(15,43,82,0.08)] transition hover:text-[#0F2B52]"
          >
            {desktopPricePanelOpen ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3982DC]">
                  {calculatedPrice ? 'Ihr Preis' : 'Grundpreis'}
                </p>
                <p className={`mt-1 text-xl font-bold ${priceLoading ? 'animate-pulse text-[#1F5CAB]/60' : 'text-[#1F5CAB]'}`}>
                  {displayPrice}
                </p>
              </div>
              {priceLoading ? (
                <svg className="h-4 w-4 animate-spin text-[#3982DC]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
              ) : null}
            </div>
            {calculatedPrice && !priceLoading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                Live-Preis
              </span>
            ) : null}
          </div>
          {priceError ? <p className="mt-2 text-xs font-medium text-amber-700">{priceError}</p> : null}
          <Button
            type="submit"
            form={formId}
            className="mt-3 h-10 w-full rounded-xl"
            disabled={submitting || !canSubmit}
          >
            {submitting ? 'Wird gesendet...' : 'In den Warenkorb'}
          </Button>
          {!canSubmit && missingFieldsMessage ? (
            <p className="mt-2 text-xs font-medium text-amber-700">{missingFieldsMessage}</p>
          ) : null}
        </div>
      </div>

      <div
        ref={configuratorCardRef}
        className="lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2"
      >
      <Card className="rounded-3xl border-[#D4E3F7] bg-gradient-to-b from-[#FFFFFF] to-[#FAFCFF] shadow-[0_14px_32px_rgba(15,43,82,0.08)]">
        <CardHeader>
          <CardTitle className="text-3xl text-[#0F2B52]">Konfigurieren Sie Ihre Plane</CardTitle>
        </CardHeader>
        <CardContent>
          {!resolvedConfig ||
          configuratorState?.status === 'missing' ||
          configuratorState?.status === 'error' ||
          configuratorState?.status === 'unsupported' ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              <p className="font-semibold">Konfigurator nicht verfuegbar</p>
              <p className="mt-1">{stateMessage}</p>
            </div>
          ) : (
            <form id={formId} className="space-y-4 lg:pb-36" onSubmit={handleSubmit}>
            {configuratorState?.warnings?.length ? (
              <div className="rounded-2xl border border-[#D8E7F8] bg-[#F4F9FF] px-4 py-3 text-sm text-[#1F5CAB]">
                <p className="font-semibold">Hinweis zur Konfiguration</p>
                <ul className="mt-2 list-disc pl-5">
                  {configuratorState.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {steps.includes('color') ? (
              <StepAccordionItem id="color" title={STEP_TITLES.color} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('color')}>
                <HintPanel text={effectiveHints.color} />
                {resolvedConfig.options.materials.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3982DC]">Material</p>
                    {resolvedConfig.options.materials.length === 1 ? (
                      <div className="rounded-xl border border-[#D9E7F8] bg-[#F9FCFF] px-4 py-3 text-sm font-semibold text-[#0F2B52]">
                        {resolvedConfig.options.materials[0].label}
                      </div>
                    ) : (
                      <ChoiceGrid
                        choices={resolvedConfig.options.materials}
                        value={form.material}
                        onChange={(value) => setField('material', value)}
                        onPreview={setPreviewChoice}
                      />
                    )}
                  </div>
                ) : null}
                {resolvedConfig.options.colors.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3982DC]">Farbe</p>
                      <ChoiceGrid
                        choices={resolvedConfig.options.colors}
                        value={form.color}
                        onChange={(value) => setField('color', value)}
                        variant="color"
                    />
                  </div>
                ) : null}
              </StepAccordionItem>
            ) : null}

            {steps.includes('size') ? (
              <StepAccordionItem id="size" title={STEP_TITLES.size} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('size')}>
                <HintPanel text={resolvedConfig.dimensions.description || effectiveHints.size} />
                <div className={`grid gap-3 ${resolvedConfig.dimensions.fields.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {resolvedConfig.dimensions.fields.map((field) => (
                    <label key={field.key} className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">{field.label}</span>
                      <input
                        type="number"
                        min={field.min}
                        value={form[field.key] as string}
                        onChange={(event) => setField(field.key, event.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm font-medium text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                        required={field.required}
                      />
                    </label>
                  ))}
                </div>
              </StepAccordionItem>
            ) : null}

            {steps.includes('topSide') ? (
              <StepAccordionItem id="topSide" title={STEP_TITLES.topSide} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('topSide')}>
                <HintPanel text={effectiveHints.topSide} />
                <SideOptionGrid value={form.topSide} onChange={(value) => setField('topSide', value)} choices={resolvedConfig.options.topSide} onPreview={setPreviewChoice} />
              </StepAccordionItem>
            ) : null}

            {steps.includes('leftSide') ? (
              <StepAccordionItem id="leftSide" title={STEP_TITLES.leftSide} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('leftSide')}>
                <HintPanel text={effectiveHints.leftSide} />
                <SideOptionGrid value={form.leftSide} onChange={(value) => setField('leftSide', value)} choices={resolvedConfig.options.leftSide} onPreview={setPreviewChoice} />
              </StepAccordionItem>
            ) : null}

            {steps.includes('rightSide') ? (
              <StepAccordionItem id="rightSide" title={STEP_TITLES.rightSide} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('rightSide')}>
                <HintPanel text={effectiveHints.rightSide} />
                <SideOptionGrid value={form.rightSide} onChange={(value) => setField('rightSide', value)} choices={resolvedConfig.options.rightSide} onPreview={setPreviewChoice} />
              </StepAccordionItem>
            ) : null}

            {steps.includes('bottomSide') ? (
              <StepAccordionItem id="bottomSide" title={STEP_TITLES.bottomSide} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('bottomSide')}>
                <HintPanel text={effectiveHints.bottomSide} />
                <SideOptionGrid value={form.bottomSide} onChange={(value) => setField('bottomSide', value)} choices={resolvedConfig.options.bottomSide} onPreview={setPreviewChoice} />
              </StepAccordionItem>
            ) : null}

            {steps.includes('window') ? (
              <StepAccordionItem id="window" title={STEP_TITLES.window} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('window')}>
                <HintPanel text={effectiveHints.window} />
                <div className="space-y-3">
                  <YesNoToggle value={form.hasWindow} onChange={setWindowEnabled} />
                  {form.hasWindow === 'yes' ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-[#1F5CAB]">Fenster teilen</p>
                        <YesNoToggle value={form.windowSplit} onChange={setWindowSplitMode} />
                      </div>
                      {form.windowSplit === 'yes' ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterbreite links (a) cm</span>
                            <input type="number" min="0" value={form.windowSplitLeftWidthCm} onChange={(event) => setField('windowSplitLeftWidthCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterbreite rechts (b) cm</span>
                            <input type="number" min="0" value={form.windowSplitRightWidthCm} onChange={(event) => setField('windowSplitRightWidthCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                          </label>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterbreite (a) in cm</span>
                            <input type="number" min="1" value={form.windowWidthCm} onChange={(event) => setField('windowWidthCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterhoehe (b) in cm</span>
                            <input type="number" min="1" value={form.windowHeightCm} onChange={(event) => setField('windowHeightCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung zum Seitenrand (c) in cm</span>
                            <input type="number" min="0" value={form.windowDistanceSideCm} onChange={(event) => setField('windowDistanceSideCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung zur unteren Seite (d) in cm</span>
                            <input type="number" min="0" value={form.windowDistanceBottomCm} onChange={(event) => setField('windowDistanceBottomCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                          </label>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </StepAccordionItem>
            ) : null}
            {steps.includes('door') ? (
              <StepAccordionItem id="door" title={STEP_TITLES.door} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('door')}>
                <HintPanel text={effectiveHints.door} />
                <div className="space-y-3">
                  <YesNoToggle value={form.hasDoor} onChange={(value) => setField('hasDoor', value)} />
                  {form.hasDoor === 'yes' ? (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-xs font-semibold text-[#1F5CAB]">Tuerbreite (a) in cm</span>
                          <input type="number" min="1" value={form.doorWidthCm} onChange={(event) => setField('doorWidthCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-semibold text-[#1F5CAB]">Tuerhoehe (b) in cm</span>
                          <input type="number" min="1" value={form.doorHeightCm} onChange={(event) => setField('doorHeightCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                        </label>
                        <label className="space-y-1 sm:col-span-2">
                          <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung der Tuer zur linken Seite (c) in cm</span>
                          <input type="number" min="0" value={form.doorDistanceLeftCm} onChange={(event) => setField('doorDistanceLeftCm', event.target.value)} className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15" />
                        </label>
                      </div>
                      {resolvedConfig.options.doorExtras.length > 0 ? (
                        <NestedAccordion title="Extras zur Tuer" isOpen={doorExtrasAccordionOpen} onToggle={() => preserveConfiguratorScroll(() => setDoorExtrasAccordionOpen((prev) => !prev))}>
                          <p className="mb-3 text-xs font-medium text-[#1F5CAB]/80">Mehrfachauswahl moeglich.</p>
                          <MultiChoiceGrid choices={resolvedConfig.options.doorExtras} selectedIds={form.doorExtras} onToggle={(value) => toggleMultiValue('doorExtras', value)} onPreview={setPreviewChoice} />
                        </NestedAccordion>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </StepAccordionItem>
            ) : null}

            {steps.includes('eyelets') ? (
              <StepAccordionItem id="eyelets" title={STEP_TITLES.eyelets} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('eyelets')}>
                <HintPanel text={effectiveHints.eyelets} />
                <ChoiceGrid choices={resolvedConfig.options.eyelets} value={form.eyeletEdge} onChange={(value) => setField('eyeletEdge', value)} onPreview={setPreviewChoice} />
              </StepAccordionItem>
            ) : null}

            {steps.includes('closureType') ? (
              <StepAccordionItem id="closureType" title={STEP_TITLES.closureType} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('closureType')}>
                <HintPanel text={effectiveHints.closureType} />
                <ChoiceGrid choices={resolvedConfig.options.closureTypes} value={form.closureType} onChange={(value) => setField('closureType', value)} onPreview={setPreviewChoice} />
              </StepAccordionItem>
            ) : null}

            {steps.includes('frontClosure') ? (
              <StepAccordionItem id="frontClosure" title={STEP_TITLES.frontClosure} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('frontClosure')}>
                <HintPanel text={effectiveHints.frontClosure} />
                {resolvedConfig.options.frontClosures.length > 0 ? (
                  <ChoiceGrid choices={resolvedConfig.options.frontClosures} value={form.frontClosure} onChange={(value) => setField('frontClosure', value)} onPreview={setPreviewChoice} />
                ) : (
                  <p className="text-sm text-[#1F5CAB]">Es sind nur Frontverschluss-Extras verfuegbar.</p>
                )}
                {resolvedConfig.options.frontClosureExtras.length > 0 ? (
                  <div className="mt-4">
                    <NestedAccordion title="Zubehoer fuer den Frontverschluss" isOpen={frontClosureExtrasOpen} onToggle={() => preserveConfiguratorScroll(() => setFrontClosureExtrasOpen((prev) => !prev))}>
                      <MultiChoiceGrid choices={resolvedConfig.options.frontClosureExtras} selectedIds={form.frontClosureExtras} onToggle={(value) => toggleMultiValue('frontClosureExtras', value)} onPreview={setPreviewChoice} />
                    </NestedAccordion>
                  </div>
                ) : null}
              </StepAccordionItem>
            ) : null}

            {steps.includes('backClosure') ? (
              <StepAccordionItem id="backClosure" title={STEP_TITLES.backClosure} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('backClosure')}>
                <HintPanel text={effectiveHints.backClosure} />
                {resolvedConfig.options.backClosures.length > 0 ? (
                  <ChoiceGrid choices={resolvedConfig.options.backClosures} value={form.backClosure} onChange={(value) => setField('backClosure', value)} onPreview={setPreviewChoice} />
                ) : (
                  <p className="text-sm text-[#1F5CAB]">Es sind nur Rueckenverschluss-Extras verfuegbar.</p>
                )}
                {resolvedConfig.options.backClosureExtras.length > 0 ? (
                  <div className="mt-4">
                    <NestedAccordion title="Zubehoer fuer den Rueckenverschluss" isOpen={backClosureExtrasOpen} onToggle={() => preserveConfiguratorScroll(() => setBackClosureExtrasOpen((prev) => !prev))}>
                      <MultiChoiceGrid choices={resolvedConfig.options.backClosureExtras} selectedIds={form.backClosureExtras} onToggle={(value) => toggleMultiValue('backClosureExtras', value)} onPreview={setPreviewChoice} />
                    </NestedAccordion>
                  </div>
                ) : null}
              </StepAccordionItem>
            ) : null}

            {steps.includes('extras') ? (
              <StepAccordionItem id="extras" title={STEP_TITLES.extras} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('extras')}>
                <HintPanel text={effectiveHints.extras} />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#0F2B52]">Extras hinzufuegen</p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.hasExtras === 'yes'}
                      onClick={() => setField('hasExtras', form.hasExtras === 'yes' ? 'no' : 'yes')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${form.hasExtras === 'yes' ? 'border-emerald-500 bg-emerald-500' : 'border-[#CFE0F5] bg-white'}`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${form.hasExtras === 'yes' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {form.hasExtras === 'yes' ? (
                    <>
                      {resolvedConfig.options.extras.length > 0 ? (
                        <MultiChoiceGrid choices={resolvedConfig.options.extras} selectedIds={form.extrasSelected} onToggle={(value) => toggleMultiValue('extrasSelected', value)} onPreview={setPreviewChoice} />
                      ) : null}
                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-[#1F5CAB]">Hinweise zu den Extras (optional)</span>
                        <textarea
                          value={form.extras}
                          onChange={(event) => setField('extras', event.target.value)}
                          placeholder="Weitere Anforderungen, Hinweise oder Sonderwuensche"
                          className="min-h-20 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] p-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                        />
                      </label>
                    </>
                  ) : null}
                </div>
              </StepAccordionItem>
            ) : null}

            {steps.includes('sketch') ? (
              <StepAccordionItem id="sketch" title={STEP_TITLES.sketch} openStep={openStep} onToggle={toggleStep} showWarning={stepsWithMissingFields.has('sketch')}>
                <HintPanel text={effectiveHints.sketch} />
                <div className="space-y-2">
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="block w-full text-sm text-[#0F2B52] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EAF3FF] file:px-3 file:py-2 file:font-medium file:text-[#1F5CAB]" />
                  {sketch ? (
                    <p className="text-xs text-[#1F5CAB]/80">
                      Datei: {sketch.name} ({Math.ceil(sketch.size / 1024)} KB)
                    </p>
                  ) : null}
                </div>
              </StepAccordionItem>
            ) : null}

            <div className="rounded-2xl border-[#D4E3F7] bg-gradient-to-r from-[#F6FAFF] to-[#EEF5FF]">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0" aria-live="polite">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#3982DC]">
                    {calculatedPrice ? 'Ihr Preis' : 'Grundpreis'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className={`text-2xl font-bold ${priceLoading ? 'animate-pulse text-[#1F5CAB]/60' : 'text-[#1F5CAB]'}`}>
                      {displayPrice}
                    </p>
                    {priceLoading ? (
                      <svg className="h-4 w-4 animate-spin text-[#3982DC]" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                      </svg>
                    ) : null}
                    {calculatedPrice && !priceLoading ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        Live-Preis
                      </span>
                    ) : null}
                  </div>
                  {priceError ? <p className="mt-2 text-xs font-medium text-amber-700">{priceError}</p> : null}
                </div>
                <Button type="submit" size="lg" className="rounded-xl sm:shrink-0" disabled={submitting || !canSubmit}>
                  {submitting ? 'Wird gesendet...' : 'In den Warenkorb'}
                </Button>
              </CardContent>
            </div>

            {!canSubmit && missingFieldsMessage ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                {missingFieldsMessage}
              </div>
            ) : null}

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  )
}
