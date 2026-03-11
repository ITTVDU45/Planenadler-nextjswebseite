'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GET_CART } from '@/features/cart/api'
import type { ConfiguratorHints, ConfiguratorOptionsFromBackend } from './types'

interface ProductConfiguratorProps {
  productId: number
  productName: string
  price: string
  hints?: ConfiguratorHints
  configuratorOptions?: ConfiguratorOptionsFromBackend | null
  priceEndpoint?: string
}

type ToggleState = '' | 'yes' | 'no'
type StepId =
  | 'color'
  | 'size'
  | 'topSide'
  | 'leftSide'
  | 'rightSide'
  | 'bottomSide'
  | 'window'
  | 'door'
  | 'extras'
  | 'sketch'

interface ConfigFormState {
  color: string
  lengthACm: string
  heightRightBCm: string
  heightLeftCCm: string
  topSide: string
  leftSide: string
  rightSide: string
  bottomSide: string
  hasWindow: ToggleState
  windowWidthCm: string
  windowHeightCm: string
  windowDistanceSideCm: string
  windowDistanceBottomCm: string
  windowSplit: ToggleState
  windowSplitLeftWidthCm: string
  windowSplitLeftHeightCm: string
  windowSplitRightWidthCm: string
  windowSplitRightHeightCm: string
  windowSplitRightDistanceRightCm: string
  windowSplitLeftDistanceLeftCm: string
  windowSplitLeftDistanceBottomCm: string
  windowSplitRightDistanceBottomCm: string
  hasDoor: ToggleState
  doorWidthCm: string
  doorHeightCm: string
  doorDistanceLeftCm: string
  doorExtras: string[]
  hasExtras: ToggleState
  extrasSelected: string[]
  extras: string
}

interface SketchPayload {
  fileName: string
  fileType: string
  fileSize: number
  contentBase64: string
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message?: string }>
}

/** Vor COLOR_OPTIONS definieren, da dort referenziert */
const TRANSPARENT_HEX =
  'linear-gradient(135deg,#DCE9F8 25%,#ffffff 25%,#ffffff 50%,#DCE9F8 50%,#DCE9F8 75%,#ffffff 75%,#ffffff 100%)'

const SIDE_OPTIONS = [
  'Standardsaum',
  'Verstaerkter Saum',
  'Oesen 2-3 cm',
  'Oesen 10 cm',
  'Keder',
  'Ohne Verarbeitung',
]

const COLOR_OPTIONS: Array<{ name: string; value: string; hex: string }> = [
  { name: 'Anthrazit', value: 'Anthrazit', hex: '#3D4652' },
  { name: 'Grau', value: 'Grau', hex: '#A0A7B1' },
  { name: 'Schwarz', value: 'Schwarz', hex: '#202327' },
  { name: 'Blau', value: 'Blau', hex: '#1F5CAB' },
  { name: 'Gruen', value: 'Gruen', hex: '#2E7D4B' },
  { name: 'Rot', value: 'Rot', hex: '#B83A48' },
  { name: 'Beige', value: 'Beige', hex: '#CBB99A' },
  { name: 'Weiss', value: 'Weiss', hex: '#F4F8FE' },
  { name: 'Transparent', value: 'Transparent', hex: TRANSPARENT_HEX },
]

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'

const DOOR_EXTRAS: Array<{ id: string; label: string }> = [
  { id: 'aufrollhaken', label: 'Aufrollhaken' },
  { id: 'magnetverschluss', label: 'Magnetverschluss' },
  { id: 'reissverschluss', label: 'Reissverschluss' },
  { id: 'verstaerkungsband', label: 'Verstaerkungsband' },
]

const EXTRAS_OPTIONS: Array<{ id: string; label: string; imageSrc: string }> = [
  { id: 'aufrollhaken-gesamt', label: 'Aufrollhaken für die gesamte Plane', imageSrc: IMAGE_PLACEHOLDER },
  { id: 'schmutzlappen-15', label: 'Schmutzlappen (15 cm)', imageSrc: IMAGE_PLACEHOLDER },
  { id: 'spannset', label: 'Spannset', imageSrc: IMAGE_PLACEHOLDER },
  { id: 'kantenschutz', label: 'Kantenschutz', imageSrc: IMAGE_PLACEHOLDER },
]

const STEP_ORDER: StepId[] = [
  'color',
  'size',
  'topSide',
  'leftSide',
  'rightSide',
  'bottomSide',
  'window',
  'door',
  'extras',
  'sketch',
]

const STEP_TITLES: Record<StepId, string> = {
  color: 'Farbe auswaehlen',
  size: 'Masse waehlen',
  topSide: 'Obere Seite der Plane',
  leftSide: 'Linke Seite der Plane',
  rightSide: 'Rechte Seite der Plane',
  bottomSide: 'Untere Seite der Plane',
  window: 'Fenster',
  door: 'Tuer',
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

const emptyState: ConfigFormState = {
  color: '',
  lengthACm: '',
  heightRightBCm: '',
  heightLeftCCm: '',
  topSide: '',
  leftSide: '',
  rightSide: '',
  bottomSide: '',
  hasWindow: '',
  windowWidthCm: '',
  windowHeightCm: '',
  windowDistanceSideCm: '',
  windowDistanceBottomCm: '',
  windowSplit: '',
  windowSplitLeftWidthCm: '',
  windowSplitLeftHeightCm: '',
  windowSplitRightWidthCm: '',
  windowSplitRightHeightCm: '',
  windowSplitRightDistanceRightCm: '',
  windowSplitLeftDistanceLeftCm: '',
  windowSplitLeftDistanceBottomCm: '',
  windowSplitRightDistanceBottomCm: '',
  hasDoor: '',
  doorWidthCm: '',
  doorHeightCm: '',
  doorDistanceLeftCm: '',
  doorExtras: [],
  hasExtras: 'no',
  extrasSelected: [],
  extras: '',
}

function createMutationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `cfg-${Date.now()}`
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result)
    }
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsDataURL(file)
  })
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function getSessionHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('woo-session')
    if (!raw) return {}
    const data = JSON.parse(raw) as { token?: string; createdTime?: number }
    if (!data?.token || !data?.createdTime) return {}
    if (Date.now() - data.createdTime > SEVEN_DAYS_MS) {
      localStorage.removeItem('woo-session')
      return {}
    }
    return { 'woocommerce-session': `Session ${data.token}` }
  } catch {
    return {}
  }
}

async function postGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data: T; response: Response }> {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GRAPHQL_URL ist nicht gesetzt')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getSessionHeaders(),
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
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

function applySessionFromResponse(response: Response): void {
  if (typeof window === 'undefined') return
  const session = response.headers.get('woocommerce-session')
  if (!session || session === 'false') {
    if (session === 'false') localStorage.removeItem('woo-session')
    return
  }
  localStorage.setItem(
    'woo-session',
    JSON.stringify({ token: session, createdTime: Date.now() }),
  )
}

function getNextStep(current: StepId): StepId | null {
  const index = STEP_ORDER.indexOf(current)
  if (index < 0 || index >= STEP_ORDER.length - 1) return null
  return STEP_ORDER[index + 1]
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
  children: React.ReactNode
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
  children,
}: {
  id: StepId
  title: string
  openStep: StepId | null
  onToggle: (id: StepId) => void
  children: React.ReactNode
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
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE0F5] text-[#1F5CAB] transition ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen ? <div className="border-t border-[#EAF1FB] p-5">{children}</div> : null}
    </div>
  )
}

function SideOptionPreview({ option }: { option: string }) {
  if (option === 'Oesen 2-3 cm' || option === 'Oesen 10 cm') {
    const spacingClass = option === 'Oesen 2-3 cm' ? 'gap-1' : 'gap-3'
    return (
      <div className={`flex justify-center ${spacingClass}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-2 w-2 rounded-full bg-[#1F5CAB]/75" />
        ))}
      </div>
    )
  }

  if (option === 'Verstaerkter Saum') {
    return <div className="h-9 rounded-md border-4 border-[#1F5CAB]/70 bg-[#EAF3FF]" />
  }

  if (option === 'Keder') {
    return (
      <div className="h-9 rounded-md border border-[#BCD3EE] bg-[#F6FAFF] p-1.5">
        <div className="h-full rounded-full bg-[#1F5CAB]/75" />
      </div>
    )
  }

  if (option === 'Ohne Verarbeitung') {
    return <div className="h-9 rounded-md border-2 border-dashed border-[#BCD3EE] bg-[#F8FBFF]" />
  }

  return <div className="h-9 rounded-md border-2 border-[#BCD3EE] bg-[#F8FBFF]" />
}

function SideOptionGrid({
  value,
  onChange,
  options = SIDE_OPTIONS,
}: {
  value: string
  onChange: (value: string) => void
  options?: string[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border p-3 text-left transition ${
              isSelected
                ? 'border-[#1F5CAB] bg-[#EFF6FF] shadow-[0_8px_18px_rgba(31,92,171,0.18)]'
                : 'border-[#D9E7F8] bg-white hover:border-[#AFC9EA] hover:bg-[#F9FCFF]'
            }`}
          >
            <SideOptionPreview option={option} />
            <p className="mt-2 text-sm font-semibold text-[#0F2B52]">{option}</p>
          </button>
        )
      })}
    </div>
  )
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: ToggleState
  onChange: (value: ToggleState) => void
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

function buildConfigurationPayload(
  productId: number,
  productName: string,
  form: ConfigFormState,
  sketchPayload: SketchPayload | null,
) {
  return {
    product: { id: productId, name: productName },
    configuration: {
      farbe: form.color,
      masse: {
        laengeACm: form.lengthACm,
        hoeheRechtsBCm: form.heightRightBCm,
        hoeheLinksCCm: form.heightLeftCCm,
      },
      seiten: {
        oben: form.topSide,
        links: form.leftSide,
        rechts: form.rightSide,
        unten: form.bottomSide,
      },
      fenster: {
        aktiviert: form.hasWindow === 'yes',
        breiteCm: form.windowWidthCm,
        hoeheCm: form.windowHeightCm,
        entfernungSeitenrandCm: form.windowDistanceSideCm,
        entfernungUnterkanteCm: form.windowDistanceBottomCm,
        fensterTeilen: form.windowSplit === 'yes',
        fensterTeilenMasse:
          form.windowSplit === 'yes'
            ? {
                fensterbreiteLinksCm: form.windowSplitLeftWidthCm,
                fensterhoeheLinksCm: form.windowSplitLeftHeightCm,
                fensterbreiteRechtsCm: form.windowSplitRightWidthCm,
                fensterhoeheRechtsCm: form.windowSplitRightHeightCm,
                entfernungRechtsFensterRechterRandCm: form.windowSplitRightDistanceRightCm,
                entfernungLinksFensterLinkerRandCm: form.windowSplitLeftDistanceLeftCm,
                abstandLinksFensterUntererRandCm: form.windowSplitLeftDistanceBottomCm,
                abstandRechtsFensterRechterUntererRandCm: form.windowSplitRightDistanceBottomCm,
              }
            : undefined,
      },
      tuer: {
        aktiviert: form.hasDoor === 'yes',
        breiteCm: form.doorWidthCm,
        hoeheCm: form.doorHeightCm,
        entfernungLinksCm: form.doorDistanceLeftCm,
        extras: form.doorExtras,
      },
      extras: form.extras,
      extrasAktiviert: form.hasExtras === 'yes',
      extrasAuswahl: form.extrasSelected,
      skizze: sketchPayload,
    },
    createdAt: new Date().toISOString(),
  }
}

const PRICE_DEBOUNCE_MS = 450

export default function ProductConfigurator({
  productId,
  productName,
  price,
  hints,
  configuratorOptions,
  priceEndpoint,
}: ProductConfiguratorProps) {
  const apolloClient = useApolloClient()
  const resolvedHints: ConfiguratorHints = hints ?? {
    color: 'Waehlen Sie die gewuenschte Planenfarbe passend zu Einsatz und Fahrzeug.',
    size: 'Tragen Sie Laenge A, Hoehe rechts B und Hoehe links C in Zentimetern ein. Diese Masse werden fuer die Fertigung verwendet.',
    topSide: 'Waehlen Sie die Verarbeitung fuer die obere Seite der Plane.',
    leftSide: 'Waehlen Sie die Verarbeitung fuer die linke Seite der Plane.',
    rightSide: 'Waehlen Sie die Verarbeitung fuer die rechte Seite der Plane.',
    bottomSide: 'Waehlen Sie die Verarbeitung fuer die untere Seite der Plane.',
    window: 'Definieren Sie Fenstermaße und Position fuer die exakte Konfektion.',
    door: 'Definieren Sie Tuermasse und Position fuer die exakte Platzierung.',
    extras: 'Hier koennen Sie Sonderwuensche und zusaetzliche Anforderungen notieren.',
    sketch: 'Laden Sie optional eine Skizze hoch, damit Positionen und Masse eindeutig zugeordnet werden koennen.',
  }
  const [form, setForm] = useState<ConfigFormState>(emptyState)
  const [openStep, setOpenStep] = useState<StepId | null>('color')
  const [windowSplitAccordionOpen, setWindowSplitAccordionOpen] = useState(true)
  const [doorExtrasAccordionOpen, setDoorExtrasAccordionOpen] = useState(true)
  const [sketch, setSketch] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [calculatedPrice, setCalculatedPrice] = useState<string | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const priceAbortRef = useRef<AbortController | null>(null)

  const colorOptions = useMemo(() => {
    const list = configuratorOptions?.colors ?? COLOR_OPTIONS
    return list.map((c) => ({
      name: c.name,
      value: c.value,
      hex:
        'hex' in c && typeof c.hex === 'string'
          ? c.hex
          : c.value === 'Transparent'
            ? TRANSPARENT_HEX
            : '#9ca3af',
    }))
  }, [configuratorOptions?.colors])

  const sideOptionsList = useMemo(
    () => (configuratorOptions?.sideOptions?.length ? configuratorOptions.sideOptions : SIDE_OPTIONS),
    [configuratorOptions?.sideOptions],
  )

  const doorExtrasList = useMemo(
    () => (configuratorOptions?.doorExtras?.length ? configuratorOptions.doorExtras : DOOR_EXTRAS),
    [configuratorOptions?.doorExtras],
  )

  const extrasOptionsList = useMemo(() => {
    const list = configuratorOptions?.extrasOptions?.length ? configuratorOptions.extrasOptions : EXTRAS_OPTIONS
    return list.map((e) => ({
      id: e.id,
      label: e.label,
      imageSrc: e.imageSrc ?? IMAGE_PLACEHOLDER,
    }))
  }, [configuratorOptions?.extrasOptions])

  const effectiveStepOrder = useMemo(() => {
    const enabled = configuratorOptions?.stepsEnabled
    if (!enabled || Object.keys(enabled).length === 0) return STEP_ORDER
    return STEP_ORDER.filter((step) => enabled[step] !== false)
  }, [configuratorOptions?.stepsEnabled])

  useEffect(() => {
    if (!priceEndpoint?.trim()) return
    const hasRequired =
      form.color &&
      form.lengthACm &&
      form.heightRightBCm &&
      form.heightLeftCCm &&
      form.topSide &&
      form.leftSide &&
      form.rightSide &&
      form.bottomSide
    if (!hasRequired) {
      setCalculatedPrice(null)
      return
    }

    const timer = setTimeout(() => {
      const payload = buildConfigurationPayload(productId, productName, form, null)
      if (priceAbortRef.current) {
        priceAbortRef.current.abort()
      }
      priceAbortRef.current = new AbortController()
      setPriceLoading(true)
      fetch(priceEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, configuration: payload.configuration }),
        signal: priceAbortRef.current.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error('Preisberechnung fehlgeschlagen')
          return res.json()
        })
        .then((data: { price?: string; formatted?: string; total?: number }) => {
          const value =
            typeof data?.price === 'string'
              ? data.price
              : typeof data?.formatted === 'string'
                ? data.formatted
                : typeof data?.total === 'number'
                  ? `${data.total} €`
                  : null
          setCalculatedPrice(value)
        })
        .catch(() => {
          setCalculatedPrice(null)
        })
        .finally(() => {
          setPriceLoading(false)
          priceAbortRef.current = null
        })
    }, PRICE_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      if (priceAbortRef.current) {
        priceAbortRef.current.abort()
      }
    }
  }, [
    priceEndpoint,
    productId,
    productName,
    form.color,
    form.lengthACm,
    form.heightRightBCm,
    form.heightLeftCCm,
    form.topSide,
    form.leftSide,
    form.rightSide,
    form.bottomSide,
    form.hasWindow,
    form.windowWidthCm,
    form.windowHeightCm,
    form.windowDistanceSideCm,
    form.windowDistanceBottomCm,
    form.windowSplit,
    form.hasDoor,
    form.doorWidthCm,
    form.doorHeightCm,
    form.doorDistanceLeftCm,
    form.doorExtras,
    form.hasExtras,
    form.extrasSelected,
    form.extras,
  ])

  const canSubmit = useMemo(() => {
    return Boolean(
      productId > 0 &&
        form.color &&
        form.lengthACm &&
        form.heightRightBCm &&
        form.heightLeftCCm &&
        form.topSide &&
        form.leftSide &&
        form.rightSide &&
        form.bottomSide &&
        form.hasWindow &&
        form.hasDoor,
    )
  }, [form, productId])

  const setField = <K extends keyof ConfigFormState>(key: K, value: ConfigFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleStep = (step: StepId) => {
    setOpenStep((prev) => (prev === step ? null : step))
  }

  const openNextStep = (current: StepId) => {
    const idx = effectiveStepOrder.indexOf(current)
    const nextStep = idx >= 0 && idx < effectiveStepOrder.length - 1 ? effectiveStepOrder[idx + 1] : null
    if (nextStep) setOpenStep(nextStep)
  }

  const handleColorSelect = (color: string) => {
    setField('color', color)
    openNextStep('color')
  }

  const handleSizeChange = (field: 'lengthACm' | 'heightRightBCm' | 'heightLeftCCm', value: string) => {
    setField(field, value)
  }

  const handleSizeBlur = () => {
    if (form.lengthACm && form.heightRightBCm && form.heightLeftCCm) {
      openNextStep('size')
    }
  }

  const handleSideSelect = (step: StepId, field: 'topSide' | 'leftSide' | 'rightSide' | 'bottomSide', value: string) => {
    setField(field, value)
    if (value) openNextStep(step)
  }

  const handleToggleSelect = (step: StepId, field: 'hasWindow' | 'hasDoor', value: ToggleState) => {
    setField(field, value)
    if (value === 'no') openNextStep(step)
  }

  const toggleDoorExtra = (extraId: string) => {
    setForm((prev) => {
      const hasExtra = prev.doorExtras.includes(extraId)
      const nextExtras = hasExtra ? prev.doorExtras.filter((id) => id !== extraId) : [...prev.doorExtras, extraId]
      return { ...prev, doorExtras: nextExtras }
    })
  }

  const setExtrasEnabled = (nextValue: ToggleState) => {
    setForm((prev) => {
      if (nextValue === prev.hasExtras) return prev
      if (nextValue === 'yes') return { ...prev, hasExtras: 'yes' }
      return { ...prev, hasExtras: 'no', extrasSelected: [], extras: '' }
    })
  }

  const toggleExtraOption = (extraId: string) => {
    setForm((prev) => {
      const hasExtra = prev.extrasSelected.includes(extraId)
      const nextExtras = hasExtra ? prev.extrasSelected.filter((id) => id !== extraId) : [...prev.extrasSelected, extraId]
      return { ...prev, extrasSelected: nextExtras }
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSketch(file)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

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
      let sketchPayload: SketchPayload | null = null

      if (sketch) {
        sketchPayload = {
          fileName: sketch.name,
          fileType: sketch.type || 'application/octet-stream',
          fileSize: sketch.size,
          contentBase64: await readFileAsBase64(sketch),
        }
      }

      const configurationPayload = buildConfigurationPayload(productId, productName, form, sketchPayload)

      const { response } = await postGraphQL<{ addToCart: { cartItem: { key: string } } }>(
        ADD_TO_CART_MUTATION,
        {
          input: {
            clientMutationId: createMutationId(),
            productId,
            quantity: 1,
            extraData: JSON.stringify(configurationPayload),
          },
        },
      )

      applySessionFromResponse(response)
      await apolloClient.refetchQueries({ include: [GET_CART] })

      setSuccess('Konfiguration wurde gespeichert und in den Warenkorb gelegt.')
      setForm(emptyState)
      setSketch(null)
      setOpenStep('color')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Konfiguration konnte nicht gesendet werden.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const displayPrice =
    priceLoading ? 'Wird berechnet…' : (calculatedPrice ?? price ?? 'Preis auf Anfrage')

  return (
    <Card className="rounded-3xl border-[#D4E3F7] bg-gradient-to-b from-[#FFFFFF] to-[#FAFCFF] shadow-[0_14px_32px_rgba(15,43,82,0.08)]">
      <CardHeader>
        <CardTitle className="text-3xl text-[#0F2B52]">Konfigurieren Sie Ihre Plane</CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className="fixed left-4 z-[450] md:hidden"
          style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl rounded-bl-none rounded-br-none border border-[#D4E3F7] bg-white/95 px-4 py-3 shadow-[0_12px_30px_rgba(15,43,82,0.18)] backdrop-blur">
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3982DC]">
                Gesamtpreis
              </span>
              <span className="text-sm font-bold text-[#1F5CAB]">{displayPrice}</span>
            </div>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {effectiveStepOrder.includes('color') && (
          <StepAccordionItem id="color" title={STEP_TITLES.color} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.color}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {colorOptions.map((color) => {
                const isSelected = form.color === color.value
                const style = color.value === 'Transparent' ? { backgroundImage: color.hex } : { backgroundColor: color.hex }
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorSelect(color.value)}
                    className={`rounded-xl border p-2 text-center transition ${
                      isSelected
                        ? 'border-[#1F5CAB] bg-[#EFF6FF] shadow-[0_8px_18px_rgba(31,92,171,0.18)]'
                        : 'border-[#D9E7F8] bg-white hover:border-[#AFC9EA]'
                    }`}
                  >
                    <span
                      className="mx-auto mb-2 block h-9 w-9 rounded-full border border-[#CFE0F5]"
                      style={style}
                      aria-hidden
                    />
                    <span className="text-xs font-semibold text-[#0F2B52]">{color.name}</span>
                  </button>
                )
              })}
            </div>
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('size') && (
          <StepAccordionItem id="size" title={STEP_TITLES.size} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.size}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-[#1F5CAB]">Laenge A (cm)</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Laenge A"
                  value={form.lengthACm}
                  onChange={(e) => handleSizeChange('lengthACm', e.target.value)}
                  onBlur={handleSizeBlur}
                  className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm font-medium text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-[#1F5CAB]">Hoehe rechts B (cm)</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Hoehe rechts B"
                  value={form.heightRightBCm}
                  onChange={(e) => handleSizeChange('heightRightBCm', e.target.value)}
                  onBlur={handleSizeBlur}
                  className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm font-medium text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-[#1F5CAB]">Hoehe links C (cm)</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Hoehe links C"
                  value={form.heightLeftCCm}
                  onChange={(e) => handleSizeChange('heightLeftCCm', e.target.value)}
                  onBlur={handleSizeBlur}
                  className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm font-medium text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                  required
                />
              </label>
            </div>
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('topSide') && (
          <StepAccordionItem id="topSide" title={STEP_TITLES.topSide} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.topSide}</p>
            <SideOptionGrid value={form.topSide} onChange={(value) => handleSideSelect('topSide', 'topSide', value)} options={sideOptionsList} />
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('leftSide') && (
          <StepAccordionItem id="leftSide" title={STEP_TITLES.leftSide} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.leftSide}</p>
            <SideOptionGrid value={form.leftSide} onChange={(value) => handleSideSelect('leftSide', 'leftSide', value)} options={sideOptionsList} />
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('rightSide') && (
          <StepAccordionItem id="rightSide" title={STEP_TITLES.rightSide} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.rightSide}</p>
            <SideOptionGrid value={form.rightSide} onChange={(value) => handleSideSelect('rightSide', 'rightSide', value)} options={sideOptionsList} />
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('bottomSide') && (
          <StepAccordionItem id="bottomSide" title={STEP_TITLES.bottomSide} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.bottomSide}</p>
            <SideOptionGrid value={form.bottomSide} onChange={(value) => handleSideSelect('bottomSide', 'bottomSide', value)} options={sideOptionsList} />
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('window') && (
          <StepAccordionItem id="window" title={STEP_TITLES.window} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.window}</p>
            <div className="space-y-3">
              <YesNoToggle value={form.hasWindow} onChange={(value) => handleToggleSelect('window', 'hasWindow', value)} />
              {form.hasWindow === 'yes' ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Fensterbreite (a) in cm</span>
                      <input
                        type="number"
                        min="1"
                        value={form.windowWidthCm}
                        onChange={(e) => setField('windowWidthCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Fensterhoehe (b) in cm</span>
                      <input
                        type="number"
                        min="1"
                        value={form.windowHeightCm}
                        onChange={(e) => setField('windowHeightCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung zum Seitenrand (c) in cm</span>
                      <input
                        type="number"
                        min="0"
                        value={form.windowDistanceSideCm}
                        onChange={(e) => setField('windowDistanceSideCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung zur unteren Seite (d) in cm</span>
                      <input
                        type="number"
                        min="0"
                        value={form.windowDistanceBottomCm}
                        onChange={(e) => setField('windowDistanceBottomCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#1F5CAB]">Fenster Teilen</p>
                    <YesNoToggle value={form.windowSplit} onChange={(value) => setField('windowSplit', value)} />
                  </div>
                  {form.windowSplit === 'yes' ? (
                    <div className="mt-4">
                      <NestedAccordion
                        title="Masse geteiltes Fenster"
                        isOpen={windowSplitAccordionOpen}
                        onToggle={() => setWindowSplitAccordionOpen((prev) => !prev)}
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterbreite links (a) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitLeftWidthCm}
                              onChange={(e) => setField('windowSplitLeftWidthCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterhoehe links (b) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitLeftHeightCm}
                              onChange={(e) => setField('windowSplitLeftHeightCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterbreite rechts (c) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitRightWidthCm}
                              onChange={(e) => setField('windowSplitRightWidthCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Fensterhoehe rechts (d) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitRightHeightCm}
                              onChange={(e) => setField('windowSplitRightHeightCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung des rechten Fensters zum rechten Rand (z) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitRightDistanceRightCm}
                              onChange={(e) => setField('windowSplitRightDistanceRightCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung des linken Fensters zum linken Rand (x) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitLeftDistanceLeftCm}
                              onChange={(e) => setField('windowSplitLeftDistanceLeftCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Abstand des linken Fensters zum unteren Rand (w) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitLeftDistanceBottomCm}
                              onChange={(e) => setField('windowSplitLeftDistanceBottomCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-[#1F5CAB]">Abstand des rechten Fensters zum rechten unteren Rand (y) cm</span>
                            <input
                              type="number"
                              min="0"
                              value={form.windowSplitRightDistanceBottomCm}
                              onChange={(e) => setField('windowSplitRightDistanceBottomCm', e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                            />
                          </label>
                        </div>
                      </NestedAccordion>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('door') && (
          <StepAccordionItem id="door" title={STEP_TITLES.door} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.door}</p>
            <div className="space-y-3">
              <YesNoToggle value={form.hasDoor} onChange={(value) => handleToggleSelect('door', 'hasDoor', value)} />
              {form.hasDoor === 'yes' ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Tuer breite (a) in cm</span>
                      <input
                        type="number"
                        min="1"
                        value={form.doorWidthCm}
                        onChange={(e) => setField('doorWidthCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Tuer hoehe (b) in cm</span>
                      <input
                        type="number"
                        min="1"
                        value={form.doorHeightCm}
                        onChange={(e) => setField('doorHeightCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                    <label className="space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold text-[#1F5CAB]">Entfernung der Tuer zur linken Seite (c) in cm</span>
                      <input
                        type="number"
                        min="0"
                        value={form.doorDistanceLeftCm}
                        onChange={(e) => setField('doorDistanceLeftCm', e.target.value)}
                        className="h-12 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] px-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                      />
                    </label>
                  </div>

                  <NestedAccordion
                    title="Extras zur Tür"
                    isOpen={doorExtrasAccordionOpen}
                    onToggle={() => setDoorExtrasAccordionOpen((prev) => !prev)}
                  >
                    <p className="mb-3 text-xs font-medium text-[#1F5CAB]/80">Mehrfachauswahl moeglich.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {doorExtrasList.map((extra) => {
                        const isSelected = form.doorExtras.includes(extra.id)
                        return (
                          <button
                            key={extra.id}
                            type="button"
                            onClick={() => toggleDoorExtra(extra.id)}
                            aria-pressed={isSelected}
                            className={`group overflow-hidden rounded-xl border text-left transition ${
                              isSelected
                                ? 'border-[#1F5CAB] bg-[#EFF6FF] shadow-[0_10px_22px_rgba(31,92,171,0.18)]'
                                : 'border-[#D9E7F8] bg-white hover:border-[#AFC9EA] hover:bg-[#F9FCFF]'
                            }`}
                          >
                            <div
                              className={`h-28 w-full border-b border-[#EAF1FB] bg-gradient-to-br from-[#F6FAFF] to-[#EAF3FF] ${
                                isSelected ? 'ring-2 ring-inset ring-[#1F5CAB]/15' : ''
                              }`}
                            />
                            <div
                              className={`px-4 py-3 text-sm font-semibold transition ${
                                isSelected ? 'bg-[#1F5CAB] text-white' : 'text-[#0F2B52]'
                              }`}
                            >
                              {extra.label}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </NestedAccordion>
                </div>
              ) : null}
            </div>
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('extras') && (
          <StepAccordionItem id="extras" title={STEP_TITLES.extras} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.extras}</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#0F2B52]">Hinzufügen</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.hasExtras === 'yes'}
                  onClick={() => setExtrasEnabled(form.hasExtras === 'yes' ? 'no' : 'yes')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
                    form.hasExtras === 'yes' ? 'border-emerald-500 bg-emerald-500' : 'border-[#CFE0F5] bg-white'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                      form.hasExtras === 'yes' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {form.hasExtras === 'yes' ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {extrasOptionsList.map((extra) => {
                      const isSelected = form.extrasSelected.includes(extra.id)
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => toggleExtraOption(extra.id)}
                          aria-pressed={isSelected}
                          className={`group overflow-hidden rounded-2xl border text-left transition ${
                            isSelected
                              ? 'border-[#1F5CAB] bg-[#EFF6FF] shadow-[0_10px_22px_rgba(31,92,171,0.18)]'
                              : 'border-[#D9E7F8] bg-white hover:border-[#AFC9EA] hover:bg-[#F9FCFF]'
                          }`}
                        >
                          <div className="relative h-28 w-full overflow-hidden bg-[#F6FAFF]">
                            <img
                              src={extra.imageSrc}
                              alt={extra.label}
                              loading="lazy"
                              className={`h-full w-full object-cover transition ${isSelected ? 'scale-[1.02]' : 'group-hover:scale-[1.02]'}`}
                            />
                          </div>
                          <div className={`px-4 py-3 text-sm font-semibold transition ${isSelected ? 'bg-[#1F5CAB] text-white' : 'text-[#0F2B52]'}`}>
                            {extra.label}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-[#1F5CAB]">Hinweise zu den Extras (optional)</span>
                    <textarea
                      value={form.extras}
                      onChange={(e) => setField('extras', e.target.value)}
                      placeholder="Weitere Anforderungen (Text, Oesenabstaende, Sonderwuensche)"
                      className="min-h-20 w-full rounded-xl border border-[#CFE0F5] bg-gradient-to-b from-white to-[#F8FBFF] p-3 text-sm text-[#0F2B52] outline-none transition focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                    />
                  </label>
                </>
              ) : null}
            </div>
          </StepAccordionItem>
          )}

          {effectiveStepOrder.includes('sketch') && (
          <StepAccordionItem id="sketch" title={STEP_TITLES.sketch} openStep={openStep} onToggle={toggleStep}>
            <p className="mb-3 rounded-xl border border-[#D8E7F8] bg-[#F4F9FF] px-3 py-2 text-sm font-medium text-[#1F5CAB]">{resolvedHints.sketch}</p>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-[#0F2B52] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EAF3FF] file:px-3 file:py-2 file:font-medium file:text-[#1F5CAB]"
              />
              {sketch ? (
                <p className="text-xs text-[#1F5CAB]/80">
                  Datei: {sketch.name} ({Math.ceil(sketch.size / 1024)} KB)
                </p>
              ) : null}
            </div>
          </StepAccordionItem>
          )}

          <Card className="rounded-2xl border-[#D4E3F7] bg-gradient-to-r from-[#F6FAFF] to-[#EEF5FF]">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#3982DC]">Gesamtpreis</p>
                <p className="mt-1 text-2xl font-bold text-[#1F5CAB]">{displayPrice}</p>
              </div>
              <Button type="submit" size="lg" className="rounded-xl" disabled={submitting || !canSubmit}>
                {submitting ? 'Wird gesendet...' : 'In den Warenkorb'}
              </Button>
            </CardContent>
          </Card>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
        </form>
      </CardContent>
    </Card>
  )
}
