import type {
  ConfigFormState,
  ResolvedChoice,
  ResolvedCustomizerConfig,
  SupportedProductType,
  SupportedUnitSelector,
} from '@/lib/customizer-runtime'

export interface PriceCalculationRequestBody {
  productId: string | number
  productType: SupportedProductType
  unitSelector: SupportedUnitSelector
  material: string
  color?: string
  dimensions: Partial<Record<
    | 'lengthACm'
    | 'heightRightBCm'
    | 'heightLeftCCm'
    | 'trailerWidthCm'
    | 'trailerLengthCm'
    | 'trailerHeightCm'
    | 'rectangularLengthCm'
    | 'rectangularWidthCm'
    | 'rectangularHeightCm'
    | 'sideACm'
    | 'sideBCm'
    | 'sideCCm'
    | 'sideFCm'
    | 'sideHCm',
    string
  >>
  selections: {
    topSide?: string
    leftSide?: string
    rightSide?: string
    bottomSide?: string
    eyeletEdge?: string
    closureType?: string
    frontClosure?: string
    backClosure?: string
    doorExtras: string[]
    extrasSelected: string[]
    frontClosureExtras: string[]
    backClosureExtras: string[]
  }
  toggles: {
    hasWindow: boolean
    hasDoor: boolean
    hasExtras: boolean
    windowSplit: boolean
  }
  window: {
    widthCm?: string
    heightCm?: string
    distanceSideCm?: string
    distanceBottomCm?: string
    splitLeftWidthCm?: string
    splitRightWidthCm?: string
  }
  door: {
    widthCm?: string
    heightCm?: string
    distanceLeftCm?: string
  }
  notes: {
    extras?: string
  }
}

export interface PriceCalculationResult {
  total: number
  formatted: string
  price: string
}

export interface ConfigurationSummaryEntry {
  label: string
  value: string
}

export interface ConfiguredCartPayload {
  extraData: Record<string, string>
  summary: ConfigurationSummaryEntry[]
}

function resolveLabels(ids: string[], choices: ResolvedChoice[]): string[] {
  const choiceMap = new Map(choices.map((choice) => [choice.id, choice.label]))
  return ids
    .map((id) => choiceMap.get(id) ?? id)
    .filter((label) => typeof label === 'string' && label.trim().length > 0)
}

function selectionKey(prefix: string, label: string): string {
  return `${prefix}${label.replace(/\s/g, '_')}`
}

function readNumericPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim().length > 0) {
    const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '')
    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export function buildPriceCalculationRequest(
  productId: number | string,
  form: ConfigFormState,
  resolvedConfig: ResolvedCustomizerConfig,
): PriceCalculationRequestBody {
  return {
    productId,
    productType: resolvedConfig.productType,
    unitSelector: resolvedConfig.unitSelector,
    material: form.material,
    color: form.color || undefined,
    dimensions: {
      lengthACm: form.lengthACm || undefined,
      heightRightBCm: form.heightRightBCm || undefined,
      heightLeftCCm: form.heightLeftCCm || undefined,
      trailerWidthCm: form.trailerWidthCm || undefined,
      trailerLengthCm: form.trailerLengthCm || undefined,
      trailerHeightCm: form.trailerHeightCm || undefined,
      rectangularLengthCm: form.rectangularLengthCm || undefined,
      rectangularWidthCm: form.rectangularWidthCm || undefined,
      rectangularHeightCm: form.rectangularHeightCm || undefined,
      sideACm: form.sideACm || undefined,
      sideBCm: form.sideBCm || undefined,
      sideCCm: form.sideCCm || undefined,
      sideFCm: form.sideFCm || undefined,
      sideHCm: form.sideHCm || undefined,
    },
    selections: {
      topSide: form.topSide || undefined,
      leftSide: form.leftSide || undefined,
      rightSide: form.rightSide || undefined,
      bottomSide: form.bottomSide || undefined,
      eyeletEdge: form.eyeletEdge || undefined,
      closureType: form.closureType || undefined,
      frontClosure: form.frontClosure || undefined,
      backClosure: form.backClosure || undefined,
      doorExtras: resolveLabels(form.doorExtras, resolvedConfig.options.doorExtras),
      extrasSelected: resolveLabels(form.extrasSelected, resolvedConfig.options.extras),
      frontClosureExtras: resolveLabels(form.frontClosureExtras, resolvedConfig.options.frontClosureExtras),
      backClosureExtras: resolveLabels(form.backClosureExtras, resolvedConfig.options.backClosureExtras),
    },
    toggles: {
      hasWindow: form.hasWindow === 'yes',
      hasDoor: form.hasDoor === 'yes',
      hasExtras: form.hasExtras === 'yes',
      windowSplit: form.windowSplit === 'yes',
    },
    window: {
      widthCm: form.windowWidthCm || undefined,
      heightCm: form.windowHeightCm || undefined,
      distanceSideCm: form.windowDistanceSideCm || undefined,
      distanceBottomCm: form.windowDistanceBottomCm || undefined,
      splitLeftWidthCm: form.windowSplitLeftWidthCm || undefined,
      splitRightWidthCm: form.windowSplitRightWidthCm || undefined,
    },
    door: {
      widthCm: form.doorWidthCm || undefined,
      heightCm: form.doorHeightCm || undefined,
      distanceLeftCm: form.doorDistanceLeftCm || undefined,
    },
    notes: {
      extras: form.extras || undefined,
    },
  }
}

export function buildWordPressPriceFormData(body: PriceCalculationRequestBody): URLSearchParams {
  const params = new URLSearchParams()
  params.set('action', 'prices_update_request')
  params.set('product_id', String(body.productId))
  params.set('fabric', body.material || '')

  switch (body.productType) {
    case 'lounge':
      params.set('side_a', body.dimensions.sideACm || '0')
      params.set('side_b', body.dimensions.sideBCm || '0')
      params.set('side_c', body.dimensions.sideCCm || '0')
      params.set('side_f', body.dimensions.sideFCm || '0')
      params.set('side_h', body.dimensions.sideHCm || '0')
      params.set('eyelet_edge', body.selections.eyeletEdge || 'Ohne Öse')
      params.set('closureType', body.selections.closureType || 'Ohne Verschluss')
      break
    case 'trailer':
      params.set('trailer_width', body.dimensions.trailerWidthCm || '0')
      params.set('trailer_length', body.dimensions.trailerLengthCm || '0')
      params.set('trailer_height', body.dimensions.trailerHeightCm || '0')
      params.set('front_clouser', body.selections.frontClosure || 'Without front clouser')
      params.set('back_clouser', body.selections.backClosure || 'Without back clouser')
      params.set('eyelet_edge', body.selections.eyeletEdge || 'Ohne Ã–se')
      params.set('front_clouser_accessories', '')
      params.set('back_clouser_accessories', '')
      for (const extra of body.selections.frontClosureExtras) {
        params.set(selectionKey('Zubehör_für_den_Frontverschluss_', extra), extra)
      }
      for (const extra of body.selections.backClosureExtras) {
        params.set(selectionKey('Zubehör_für_den_Rückenverschluss_', extra), extra)
      }
      break
    case 'rectangular':
      params.set('rectangular_length', body.dimensions.rectangularLengthCm || '0')
      params.set('rectangular_width', body.dimensions.rectangularWidthCm || '0')
      params.set('rectangular_height', body.dimensions.rectangularHeightCm || '0')
      params.set('eyelet_edge', body.selections.eyeletEdge || 'Ohne Öse')
      params.set('closureType', body.selections.closureType || 'Ohne Verschluss')
      break
    case 'tarpaulins':
    default:
      params.set('width', body.dimensions.lengthACm || '0')
      params.set('height_right', body.dimensions.heightRightBCm || '0')
      params.set('height_left', body.dimensions.heightLeftCCm || body.dimensions.heightRightBCm || '0')
      params.set('has_top_edge', body.selections.topSide || 'Ohne Extras')
      params.set('has_edge_left_0', body.selections.leftSide || 'Ohne Extras')
      params.set('has_edge_right_0', body.selections.rightSide || 'Ohne Extras')
      params.set('has_edge_bottom_0', body.selections.bottomSide || 'Ohne Extras')

      if (body.toggles.hasWindow) {
        if (body.window.widthCm) params.set('window_width', body.window.widthCm)
        if (body.window.heightCm) params.set('window_height', body.window.heightCm)
        if (body.toggles.windowSplit) {
          let splitCount = 0
          if (body.window.splitLeftWidthCm) splitCount += 1
          if (body.window.splitRightWidthCm) splitCount += 1
          if (splitCount > 0) params.set('window_split_num', String(splitCount))
        }
      }

      if (body.toggles.hasDoor) {
        if (body.door.widthCm) params.set('door_width', body.door.widthCm)
        if (body.door.heightCm) params.set('door_height', body.door.heightCm)
        for (const extra of body.selections.doorExtras) {
          params.set(selectionKey('Door_Extra_', extra), extra)
        }
      }
      break
  }

  if (body.toggles.hasExtras) {
    for (const extra of body.selections.extrasSelected) {
      params.set(selectionKey('Extra_', extra), extra)
    }
  }

  return params
}

function addSummaryEntry(
  entries: ConfigurationSummaryEntry[],
  label: string,
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    const normalized = value.map((entry) => entry.trim()).filter((entry) => entry.length > 0)
    if (normalized.length === 0) return
    entries.push({ label, value: normalized.join(', ') })
    return
  }

  if (!value) return
  const normalized = value.trim()
  if (!normalized) return
  entries.push({ label, value: normalized })
}

export function buildConfigurationSummary(
  body: PriceCalculationRequestBody,
  sketchFileName?: string,
): ConfigurationSummaryEntry[] {
  const entries: ConfigurationSummaryEntry[] = []

  addSummaryEntry(entries, 'Material', body.material)
  addSummaryEntry(entries, 'Farbe', body.color)

  switch (body.productType) {
    case 'lounge':
      addSummaryEntry(entries, 'Seite A', body.dimensions.sideACm ? `${body.dimensions.sideACm} cm` : undefined)
      addSummaryEntry(entries, 'Seite B', body.dimensions.sideBCm ? `${body.dimensions.sideBCm} cm` : undefined)
      addSummaryEntry(entries, 'Seite C', body.dimensions.sideCCm ? `${body.dimensions.sideCCm} cm` : undefined)
      addSummaryEntry(entries, 'Seite F', body.dimensions.sideFCm ? `${body.dimensions.sideFCm} cm` : undefined)
      addSummaryEntry(entries, 'Hoehe H', body.dimensions.sideHCm ? `${body.dimensions.sideHCm} cm` : undefined)
      break
    case 'trailer':
      addSummaryEntry(entries, 'Anhaengerbreite A', body.dimensions.trailerWidthCm ? `${body.dimensions.trailerWidthCm} cm` : undefined)
      addSummaryEntry(entries, 'Anhaengerlaenge B', body.dimensions.trailerLengthCm ? `${body.dimensions.trailerLengthCm} cm` : undefined)
      addSummaryEntry(entries, 'Planenhoehe C', body.dimensions.trailerHeightCm ? `${body.dimensions.trailerHeightCm} cm` : undefined)
      break
    case 'rectangular':
      addSummaryEntry(entries, 'Laenge A', body.dimensions.rectangularLengthCm ? `${body.dimensions.rectangularLengthCm} cm` : undefined)
      addSummaryEntry(entries, 'Breite B', body.dimensions.rectangularWidthCm ? `${body.dimensions.rectangularWidthCm} cm` : undefined)
      addSummaryEntry(entries, 'Hoehe C', body.dimensions.rectangularHeightCm ? `${body.dimensions.rectangularHeightCm} cm` : undefined)
      break
    case 'tarpaulins':
    default:
      addSummaryEntry(entries, 'Laenge A', body.dimensions.lengthACm ? `${body.dimensions.lengthACm} cm` : undefined)
      addSummaryEntry(entries, 'Hoehe rechts B', body.dimensions.heightRightBCm ? `${body.dimensions.heightRightBCm} cm` : undefined)
      addSummaryEntry(entries, 'Hoehe links C', body.dimensions.heightLeftCCm ? `${body.dimensions.heightLeftCCm} cm` : undefined)
      break
  }

  addSummaryEntry(entries, 'Obere Seite', body.selections.topSide)
  addSummaryEntry(entries, 'Linke Seite', body.selections.leftSide)
  addSummaryEntry(entries, 'Rechte Seite', body.selections.rightSide)
  addSummaryEntry(entries, 'Untere Seite', body.selections.bottomSide)
  addSummaryEntry(entries, 'Oesen', body.selections.eyeletEdge)
  addSummaryEntry(entries, 'Verschlussart', body.selections.closureType)
  addSummaryEntry(entries, 'Frontverschluss', body.selections.frontClosure)
  addSummaryEntry(entries, 'Rueckenverschluss', body.selections.backClosure)

  if (body.toggles.hasWindow) {
    addSummaryEntry(entries, 'Fenster', 'Ja')
    addSummaryEntry(entries, 'Fensterbreite', body.window.widthCm ? `${body.window.widthCm} cm` : undefined)
    addSummaryEntry(entries, 'Fensterhoehe', body.window.heightCm ? `${body.window.heightCm} cm` : undefined)
  }

  if (body.toggles.hasDoor) {
    addSummaryEntry(entries, 'Tuer', 'Ja')
    addSummaryEntry(entries, 'Tuerbreite', body.door.widthCm ? `${body.door.widthCm} cm` : undefined)
    addSummaryEntry(entries, 'Tuerhoehe', body.door.heightCm ? `${body.door.heightCm} cm` : undefined)
    addSummaryEntry(entries, 'Tuerabstand links', body.door.distanceLeftCm ? `${body.door.distanceLeftCm} cm` : undefined)
    addSummaryEntry(entries, 'Tuer-Extras', body.selections.doorExtras)
  }

  if (body.toggles.hasExtras) {
    addSummaryEntry(entries, 'Extras', body.selections.extrasSelected)
  }

  addSummaryEntry(entries, 'Frontverschluss-Zubehoer', body.selections.frontClosureExtras)
  addSummaryEntry(entries, 'Rueckenverschluss-Zubehoer', body.selections.backClosureExtras)
  addSummaryEntry(entries, 'Hinweise', body.notes.extras)
  addSummaryEntry(entries, 'Skizze', sketchFileName)

  return entries
}

export function buildConfiguredCartPayload(
  body: PriceCalculationRequestBody,
  uniqueKey: string,
  sketchFileName?: string,
): ConfiguredCartPayload {
  const extraData = Object.fromEntries(buildWordPressPriceFormData(body).entries())
  delete extraData.action
  delete extraData.product_id

  extraData.custom_option = 'configured'
  extraData.unique_key = uniqueKey
  extraData.planenadler_configuration_id = uniqueKey

  const summary = buildConfigurationSummary(body, sketchFileName)
  extraData.planenadler_configuration_summary = JSON.stringify(summary)

  if (sketchFileName?.trim()) {
    extraData.planenadler_sketch_file_name = sketchFileName.trim()
  }

  return {
    extraData,
    summary,
  }
}

export function parsePriceCalculationResponse(rawPrice: unknown): PriceCalculationResult {
  const total =
    readNumericPrice(rawPrice) ??
    (typeof rawPrice === 'object' && rawPrice !== null
      ? readNumericPrice(
          'price' in rawPrice
            ? (rawPrice as { price?: unknown }).price
            : 'total' in rawPrice
              ? (rawPrice as { total?: unknown }).total
              : 'data' in rawPrice
                ? (rawPrice as { data?: unknown }).data
                : undefined,
        )
      : null)

  if (total === null || !Number.isFinite(total)) {
    throw new Error('WordPress hat keinen gueltigen Preis zurueckgegeben.')
  }

  const formatted = `${total.toFixed(2).replace('.', ',')} €`

  return {
    total,
    formatted,
    price: formatted,
  }
}
