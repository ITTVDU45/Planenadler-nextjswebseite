import type {
  CustomizerApiResponse,
  CustomizerBackClosure,
  CustomizerCalculationUnit,
  CustomizerClosure,
  CustomizerClosureExtra,
  CustomizerClosureType,
  CustomizerColor,
  CustomizerConfig,
  CustomizerDimensions,
  CustomizerDoorData,
  CustomizerDoorExtra,
  CustomizerEyelet,
  CustomizerMainExtra,
  CustomizerMaterial,
  CustomizerWindowData,
  CustomizerTopEdge,
  CustomizerLeftEdge,
  CustomizerRightEdge,
  CustomizerBottomEdge,
} from '@/lib/customizer-types'
import type {
  ConfigFormField,
  ConfiguratorState,
  ResolvedChoice,
  ResolvedConfiguratorHints,
  ResolvedCustomizerConfig,
  ResolvedDimensionConfig,
  StepId,
  SupportedProductType,
  SupportedUnitSelector,
} from '@/lib/customizer-runtime'

const DEFAULT_HINTS: ResolvedConfiguratorHints = {
  color: 'Waehlen Sie die gewuenschte Planenfarbe passend zu Einsatz und Fahrzeug.',
  size: 'Tragen Sie die benoetigten Masse in Zentimetern ein. Diese Werte werden fuer Fertigung und Preisberechnung verwendet.',
  topSide: 'Waehlen Sie die Verarbeitung fuer die obere Seite der Plane.',
  leftSide: 'Waehlen Sie die Verarbeitung fuer die linke Seite der Plane.',
  rightSide: 'Waehlen Sie die Verarbeitung fuer die rechte Seite der Plane.',
  bottomSide: 'Waehlen Sie die Verarbeitung fuer die untere Seite der Plane.',
  window: 'Definieren Sie Fenstermaeße und Position fuer die exakte Konfektion.',
  door: 'Definieren Sie Tuermasse und Position fuer die exakte Platzierung.',
  eyelets: 'Waehlen Sie aus, ob und wie Oesen an diesem Produkt eingesetzt werden sollen.',
  closureType: 'Waehlen Sie den gewuenschten Verschlusstyp passend zur Konstruktion.',
  frontClosure: 'Waehlen Sie den Frontverschluss und optionales Zubehoer.',
  backClosure: 'Waehlen Sie den Rueckenverschluss und optionales Zubehoer.',
  extras: 'Hier koennen Sie zusaetzliche Ausstattungen und Sonderwuensche definieren.',
  sketch: 'Laden Sie optional eine Skizze hoch, damit Positionen und Masse eindeutig zugeordnet werden koennen.',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasMeaningfulScalar(value: unknown): boolean {
  if (isNonEmptyString(value)) return true
  if (typeof value === 'number') return Number.isFinite(value) && value > 0
  if (typeof value === 'boolean') return value
  return false
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function cleanImageUrl(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) return undefined
  const url = value.trim()
  if (url === 'http://null' || url === 'http://null/' || url.endsWith('/null')) return undefined
  return url
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function hasMeaningfulMap(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false

  return Object.values(value).some((entry) => {
    if (Array.isArray(entry)) return entry.length > 0
    if (isRecord(entry)) return hasMeaningfulMap(entry)
    return hasMeaningfulScalar(entry)
  })
}

function hasWindowConfig(windowData: CustomizerWindowData | null): boolean {
  return hasMeaningfulMap(windowData)
}

function hasDoorConfig(doorData: CustomizerDoorData | null): boolean {
  return hasMeaningfulMap(doorData)
}

function normalizeProductType(value: string | undefined): SupportedProductType {
  const normalized = (value ?? '').trim().toLowerCase()
  if (normalized === 'tarpulin' || normalized === 'tarpaulins') return 'tarpaulins'
  if (normalized === 'trailer') return 'trailer'
  if (normalized === 'rectangular') return 'rectangular'
  if (normalized === 'lounge') return 'lounge'
  return 'unknown'
}

function normalizeUnitSelector(value: string | undefined): SupportedUnitSelector {
  const normalized = (value ?? '').trim().toLowerCase()
  if (normalized === 'squaremeter') return 'squaremeter'
  if (normalized === 'cubicmeter') return 'cubicmeter'
  return 'unknown'
}

function makeChoice(
  id: string,
  label: string | undefined,
  price?: unknown,
  imageSrc?: unknown,
  meta?: Record<string, string | number | boolean | null | undefined>,
): ResolvedChoice | null {
  if (!isNonEmptyString(label)) return null
  return {
    id,
    label: label.trim(),
    price: toNumber(price),
    imageSrc: cleanImageUrl(imageSrc),
    meta,
  }
}

function resolveColorChoices(colors: CustomizerColor[] | null): ResolvedChoice[] {
  return asArray<CustomizerColor>(colors)
    .map((color, index) =>
      makeChoice(`color-${index}`, color.subtitle || color.color, undefined, color.image_url, {
        hex: color.color,
      }),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveMaterialChoices(materials: CustomizerMaterial[] | null): ResolvedChoice[] {
  return asArray<CustomizerMaterial>(materials)
    .map((material, index) => makeChoice(`material-${index}`, material.name, material.price))
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveEdgeChoices<T extends CustomizerTopEdge | CustomizerLeftEdge | CustomizerRightEdge | CustomizerBottomEdge>(
  entries: T[] | null,
  labelKeys: Array<keyof T>,
  priceKey: keyof T,
  imageKey: keyof T | null = null,
): ResolvedChoice[] {
  return asArray<T>(entries)
    .map((entry, index) => {
      const label = labelKeys
        .map((key) => entry[key])
        .find((value) => isNonEmptyString(value))
      const image = imageKey ? entry[imageKey] : undefined
      return makeChoice(`edge-${index}`, typeof label === 'string' ? label : undefined, entry[priceKey], image)
    })
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveDoorExtras(entries: CustomizerDoorExtra[] | null): ResolvedChoice[] {
  return asArray<CustomizerDoorExtra>(entries)
    .map((entry, index) =>
      makeChoice(`door-extra-${index}`, entry.door_extras__subtitle, entry.door_extras_price, entry.image_url, {
        priceMode: entry.door_extra_pl,
      }),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveMainExtras(entries: CustomizerMainExtra[] | null): ResolvedChoice[] {
  return asArray<CustomizerMainExtra>(entries)
    .map((entry, index) =>
      makeChoice(`main-extra-${index}`, entry.main_extras__subtitle, entry.main_extras_price, entry.image_url, {
        priceMode: entry.main_extra_pl,
        required: entry.main_extra_required,
      }),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveEyelets(entries: CustomizerEyelet[] | null): ResolvedChoice[] {
  return asArray<CustomizerEyelet>(entries)
    .map((entry, index) =>
      makeChoice(`eyelet-${index}`, entry.eyelet_tarpaulin__subtitle, entry.eyelet_tarpaulin_price, entry.image_url, {
        priceMode: entry.eyelet_pl_handler,
      }),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveClosureTypes(entries: CustomizerClosureType[] | null): ResolvedChoice[] {
  return asArray<CustomizerClosureType>(entries)
    .map((entry, index) =>
      makeChoice(
        `closure-type-${index}`,
        entry.closure_type_tarpaulin__subtitle,
        entry.closure_type_tarpaulin_price,
        entry.image_url,
      ),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveClosures(entries: CustomizerClosure[] | null): ResolvedChoice[] {
  return asArray<CustomizerClosure>(entries)
    .map((entry, index) =>
      makeChoice(`front-closure-${index}`, entry.front_closure__subtitle, entry.front_closure_price, entry.image_url, {
        priceMode: entry.front_clouser_pl_handler,
      }),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveBackClosures(entries: CustomizerBackClosure[] | null): ResolvedChoice[] {
  return asArray<CustomizerBackClosure>(entries)
    .map((entry, index) =>
      makeChoice(`back-closure-${index}`, entry.back_closure__subtitle, entry.back_closure_price, entry.image_url, {
        priceMode: entry.back_clouser_pl_handler,
      }),
    )
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveClosureExtras(entries: CustomizerClosureExtra[] | null, prefix: string): ResolvedChoice[] {
  return asArray<CustomizerClosureExtra>(entries)
    .map((entry, index) => {
      const label = isNonEmptyString(entry.subtitle)
        ? entry.subtitle
        : isNonEmptyString(entry.front_clouser_extra__subtitle)
          ? entry.front_clouser_extra__subtitle
          : isNonEmptyString(entry.back_clouser_extra__subtitle)
            ? entry.back_clouser_extra__subtitle
            : undefined
      const price =
        entry.price ??
        entry.front_clouser_extra_price ??
        entry.back_clouser_extra_price
      const selector = isNonEmptyString(entry.front_clouser_extra_selector)
        ? entry.front_clouser_extra_selector
        : isNonEmptyString(entry.back_clouser_extra_selector)
          ? entry.back_clouser_extra_selector
          : undefined
      return makeChoice(`${prefix}-${index}`, label, price, entry.image_url, {
        selector: selector?.trim().toLowerCase(),
      })
    })
    .filter((choice): choice is ResolvedChoice => choice !== null)
}

function resolveDimensionConfig(
  productType: SupportedProductType,
  dimensions: CustomizerDimensions | null,
): ResolvedDimensionConfig {
  const minValue = toNumber(dimensions?.minimum_value) ?? 1
  const dimensionDescription = isNonEmptyString(dimensions?.dimension_description)
    ? dimensions.dimension_description
    : DEFAULT_HINTS.size

  const makeField = (
    key: ConfigFormField,
    label: string,
    required = true,
  ) => ({ key, label, min: minValue, required })

  switch (productType) {
    case 'lounge':
      return {
        title: 'Masse waehlen',
        description: dimensionDescription,
        imageSrc: cleanImageUrl(dimensions?.dimension_image_url),
        minimumValue: minValue,
        fields: [
          makeField('sideACm', 'Seite A (cm)'),
          makeField('sideBCm', 'Seite B (cm)'),
          makeField('sideCCm', 'Seite C (cm)'),
          makeField('sideFCm', 'Seite F (cm)'),
          makeField('sideHCm', 'Hoehe H (cm)'),
        ],
      }
    case 'trailer':
      return {
        title: 'Masse waehlen',
        description: dimensionDescription,
        imageSrc: cleanImageUrl(dimensions?.dimension_image_url),
        minimumValue: minValue,
        fields: [
          makeField('trailerWidthCm', 'Anhaengerbreite A (cm)'),
          makeField('trailerLengthCm', 'Anhaengerlaenge B (cm)'),
          makeField('trailerHeightCm', 'Planenhoehe C (cm)'),
        ],
      }
    case 'rectangular':
      return {
        title: 'Masse waehlen',
        description: dimensionDescription,
        imageSrc: cleanImageUrl(dimensions?.dimension_image_url),
        minimumValue: minValue,
        fields: [
          makeField('rectangularLengthCm', 'Laenge A (cm)'),
          makeField('rectangularWidthCm', 'Breite B (cm)'),
          makeField('rectangularHeightCm', 'Hoehe C (cm)'),
        ],
      }
    case 'tarpaulins':
    default:
      return {
        title: 'Masse waehlen',
        description: dimensionDescription,
        imageSrc: cleanImageUrl(dimensions?.dimension_image_url),
        minimumValue: minValue,
        fields: [
          makeField('lengthACm', 'Laenge A (cm)'),
          makeField('heightRightBCm', 'Hoehe rechts B (cm)'),
          makeField('heightLeftCCm', 'Hoehe links C (cm)'),
        ],
      }
  }
}

function buildStepOrder(
  productType: SupportedProductType,
  config: {
    colors: ResolvedChoice[]
    materials: ResolvedChoice[]
    top: ResolvedChoice[]
    left: ResolvedChoice[]
    right: ResolvedChoice[]
    bottom: ResolvedChoice[]
    doorExtras: ResolvedChoice[]
    extras: ResolvedChoice[]
    eyelets: ResolvedChoice[]
    closureTypes: ResolvedChoice[]
    frontClosures: ResolvedChoice[]
    frontClosureExtras: ResolvedChoice[]
    backClosures: ResolvedChoice[]
    backClosureExtras: ResolvedChoice[]
    windowData: CustomizerWindowData | null
    doorData: CustomizerDoorData | null
  },
): StepId[] {
  if (productType === 'unknown') return []

  const steps: StepId[] = []

  if (config.colors.length || config.materials.length) steps.push('color')
  steps.push('size')

  if (productType === 'tarpaulins') {
    if (config.top.length) steps.push('topSide')
    if (config.left.length) steps.push('leftSide')
    if (config.right.length) steps.push('rightSide')
    if (config.bottom.length) steps.push('bottomSide')
    if (hasWindowConfig(config.windowData)) steps.push('window')
    if (hasDoorConfig(config.doorData)) steps.push('door')
  }

  if (productType === 'lounge' || productType === 'rectangular') {
    if (config.eyelets.length) steps.push('eyelets')
    if (config.closureTypes.length) steps.push('closureType')
  }

  if (productType === 'trailer') {
    if (config.frontClosures.length || config.frontClosureExtras.length) steps.push('frontClosure')
    if (config.backClosures.length || config.backClosureExtras.length) steps.push('backClosure')
    if (config.eyelets.length) steps.push('eyelets')
  }

  if (config.extras.length) steps.push('extras')
  steps.push('sketch')

  return steps
}

function uniqueIssues(issues: string[]): string[] {
  return Array.from(new Set(issues.filter((issue) => issue.trim().length > 0)))
}

function buildValidationRules(
  productType: SupportedProductType,
  steps: StepId[],
  sizeFields: ConfigFormField[],
  colors: ResolvedChoice[],
  materials: ResolvedChoice[],
): ResolvedCustomizerConfig['validationRules'] {
  const requiredFields: ConfigFormField[] = [...sizeFields]

  if (materials.length > 1) requiredFields.unshift('material')
  if (colors.length > 0) requiredFields.unshift('color')

  if (steps.includes('topSide')) requiredFields.push('topSide')
  if (steps.includes('leftSide')) requiredFields.push('leftSide')
  if (steps.includes('rightSide')) requiredFields.push('rightSide')
  if (steps.includes('bottomSide')) requiredFields.push('bottomSide')
  if (steps.includes('window')) requiredFields.push('hasWindow')
  if (steps.includes('door')) requiredFields.push('hasDoor')

  if (productType === 'unknown') {
    return { requiredFields: [], minimumForPrice: [] }
  }

    return {
      requiredFields,
      minimumForPrice: [
        ...(materials.length > 0 ? (['material'] as ConfigFormField[]) : []),
        ...(colors.length > 0 ? (['color'] as ConfigFormField[]) : []),
        ...sizeFields,
      ],
    }
}

function toMaybeConfig(response: CustomizerApiResponse | null | undefined): CustomizerConfig | null {
  if (!response?.success || !response.data) return null
  return response.data
}

export function resolveCustomizerConfig(config: CustomizerConfig): ResolvedCustomizerConfig {
  const issues: string[] = []

  const calculationUnit = (config.calculation_unit ?? {}) as CustomizerCalculationUnit
  const productType = normalizeProductType(calculationUnit.product_type)
  const unitSelector = normalizeUnitSelector(calculationUnit.unit_selector)

  const colors = resolveColorChoices(config.colors)
  const materials = resolveMaterialChoices(config.material)
  const top = resolveEdgeChoices(config.top_tarpaulin, ['top_tarpaulin__subtitle', 'subtitle'], 'top_tarpaulin_price', 'image_url')
  const left = resolveEdgeChoices(config.left_tarpaulin, ['left_tarpaulin__subtitle', 'subtitle'], 'left_tarpaulin_price', 'image_url')
  const right = resolveEdgeChoices(config.right_tarpaulin, ['right_tarpaulin__subtitle', 'subtitle'], 'right_tarpaulin_price', 'image_url')
  const bottom = resolveEdgeChoices(config.bottom_tarpaulin, ['bottom_tarpaulin__subtitle', 'subtitle'], 'bottom_tarpaulin_price', 'image_url')
  const doorExtras = resolveDoorExtras(config.extras)
  const extras = resolveMainExtras(config.main_extra)
  const eyelets = resolveEyelets(config.eyelets)
  const closureTypes = resolveClosureTypes(config.closure_type)
  const frontClosures = resolveClosures(config.front_clouser)
  const backClosures = resolveBackClosures(config.back_clouser)
  const frontClosureExtras = resolveClosureExtras(config.front_clouser_extra, 'front-closure-extra')
  const backClosureExtras = resolveClosureExtras(config.back_clouser_extra, 'back-closure-extra')

  if (!colors.length && !materials.length) {
    issues.push('Es wurden keine Farben oder Materialien fuer den Konfigurator gefunden.')
  }

  if (productType === 'unknown') {
    issues.push('Der Produkttyp aus WordPress wird vom Frontend derzeit nicht unterstuetzt.')
  }

  if (unitSelector === 'unknown') {
    issues.push('Die Berechnungseinheit aus WordPress ist unvollstaendig.')
  }

  const dimensions = resolveDimensionConfig(productType, config.dimentions)
  const sizeFields = dimensions.fields.filter((field) => field.required).map((field) => field.key)
  const hasWindowStep = hasWindowConfig(config.window_data)
  const hasDoorStep = hasDoorConfig(config.door_data)
  const steps = buildStepOrder(productType, {
    colors,
    materials,
    top,
    left,
    right,
    bottom,
    doorExtras,
    extras,
    eyelets,
    closureTypes,
    frontClosures,
    frontClosureExtras,
    backClosures,
    backClosureExtras,
    windowData: config.window_data,
    doorData: config.door_data,
  })

  const validationRules = buildValidationRules(productType, steps, sizeFields, colors, materials)
  const livePrice = unitSelector !== 'unknown' && materials.length > 0 && sizeFields.length > 0
  if (!livePrice) {
    issues.push('Die Live-Preisberechnung ist nur eingeschraenkt verfuegbar, weil Material- oder Massdaten fehlen.')
  }

  return {
    configId: config.id,
    productId: config.product_id,
    productTitle: config.product_title,
    productType,
    unitSelector,
    steps,
    dimensions,
    options: {
      colors,
      materials,
      topSide: top,
      leftSide: left,
      rightSide: right,
      bottomSide: bottom,
      doorExtras,
      extras,
      eyelets,
      closureTypes,
      frontClosures,
      frontClosureExtras,
      backClosures,
      backClosureExtras,
    },
    pricingCapabilities: {
      livePrice,
      allowsEdges: productType === 'tarpaulins',
      allowsWindow: productType === 'tarpaulins' && hasWindowStep,
      allowsDoor: productType === 'tarpaulins' && hasDoorStep,
      supportsEyelets: (productType === 'lounge' || productType === 'rectangular' || productType === 'trailer') && eyelets.length > 0,
      supportsClosureType:
        (productType === 'lounge' || productType === 'rectangular') &&
        closureTypes.length > 0,
      supportsFrontBackClosure: productType === 'trailer',
    },
    validationRules,
    hints: DEFAULT_HINTS,
    issues: uniqueIssues(issues),
  }
}

export function resolveCustomizerState(
  response: CustomizerApiResponse | null | undefined,
): { state: ConfiguratorState; resolvedConfig: ResolvedCustomizerConfig | null } {
  const rawConfig = toMaybeConfig(response)

  if (!rawConfig) {
    return {
      state: {
        status: 'missing',
        message: response?.message || 'Fuer dieses Produkt wurde keine Konfiguration in WordPress gefunden.',
      },
      resolvedConfig: null,
    }
  }

  const resolvedConfig = resolveCustomizerConfig(rawConfig)
  if (resolvedConfig.productType === 'unknown') {
    return {
      state: {
        status: 'unsupported',
        message: 'Der Konfigurator fuer diesen Produkttyp wird im Frontend noch nicht sicher unterstuetzt.',
        warnings: resolvedConfig.issues,
      },
      resolvedConfig,
    }
  }

  if (resolvedConfig.issues.length > 0) {
    return {
      state: {
        status: 'partial',
        message: 'Die Konfiguration ist nur teilweise vollstaendig. Fehlende Bereiche wurden defensiv ausgeblendet.',
        warnings: resolvedConfig.issues,
      },
      resolvedConfig,
    }
  }

  return {
    state: {
      status: 'ready',
      warnings: [],
    },
    resolvedConfig,
  }
}
