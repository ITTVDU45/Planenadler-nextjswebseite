export type ToggleState = '' | 'yes' | 'no'

export type SupportedProductType =
  | 'tarpaulins'
  | 'trailer'
  | 'rectangular'
  | 'lounge'
  | 'unknown'

export type SupportedUnitSelector = 'squaremeter' | 'cubicmeter' | 'unknown'

export type StepId =
  | 'color'
  | 'size'
  | 'topSide'
  | 'leftSide'
  | 'rightSide'
  | 'bottomSide'
  | 'window'
  | 'door'
  | 'eyelets'
  | 'closureType'
  | 'frontClosure'
  | 'backClosure'
  | 'extras'
  | 'sketch'

export type ConfigFormField =
  | 'material'
  | 'color'
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
  | 'sideHCm'
  | 'topSide'
  | 'leftSide'
  | 'rightSide'
  | 'bottomSide'
  | 'hasWindow'
  | 'windowWidthCm'
  | 'windowHeightCm'
  | 'windowDistanceSideCm'
  | 'windowDistanceBottomCm'
  | 'windowSplit'
  | 'windowSplitLeftWidthCm'
  | 'windowSplitLeftHeightCm'
  | 'windowSplitRightWidthCm'
  | 'windowSplitRightHeightCm'
  | 'windowSplitRightDistanceRightCm'
  | 'windowSplitLeftDistanceLeftCm'
  | 'windowSplitLeftDistanceBottomCm'
  | 'windowSplitRightDistanceBottomCm'
  | 'hasDoor'
  | 'doorWidthCm'
  | 'doorHeightCm'
  | 'doorDistanceLeftCm'
  | 'eyeletEdge'
  | 'closureType'
  | 'frontClosure'
  | 'backClosure'

export interface ConfigFormState {
  material: string
  color: string
  lengthACm: string
  heightRightBCm: string
  heightLeftCCm: string
  trailerWidthCm: string
  trailerLengthCm: string
  trailerHeightCm: string
  rectangularLengthCm: string
  rectangularWidthCm: string
  rectangularHeightCm: string
  sideACm: string
  sideBCm: string
  sideCCm: string
  sideFCm: string
  sideHCm: string
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
  eyeletEdge: string
  closureType: string
  frontClosure: string
  frontClosureExtras: string[]
  backClosure: string
  backClosureExtras: string[]
}

export const emptyConfigFormState: ConfigFormState = {
  material: '',
  color: '',
  lengthACm: '',
  heightRightBCm: '',
  heightLeftCCm: '',
  trailerWidthCm: '',
  trailerLengthCm: '',
  trailerHeightCm: '',
  rectangularLengthCm: '',
  rectangularWidthCm: '',
  rectangularHeightCm: '',
  sideACm: '',
  sideBCm: '',
  sideCCm: '',
  sideFCm: '',
  sideHCm: '',
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
  eyeletEdge: '',
  closureType: '',
  frontClosure: '',
  frontClosureExtras: [],
  backClosure: '',
  backClosureExtras: [],
}

export interface ResolvedChoice {
  id: string
  label: string
  imageSrc?: string
  price?: number | null
  meta?: Record<string, string | number | boolean | null | undefined>
}

export interface ResolvedDimensionField {
  key: ConfigFormField
  label: string
  min: number
  required: boolean
}

export interface ResolvedDimensionConfig {
  title: string
  description?: string
  imageSrc?: string
  /** Skizze wenn Hoehe rechts B > Hoehe links C (Customizer: „Image if B greater“) */
  imageSrcWhenBGreater?: string
  /** Skizze wenn Hoehe links C > Hoehe rechts B (Customizer: „Image if C greater“) */
  imageSrcWhenCGreater?: string
  fields: ResolvedDimensionField[]
  minimumValue?: number
}

export interface ResolvedConfiguratorHints {
  color: string
  size: string
  topSide: string
  leftSide: string
  rightSide: string
  bottomSide: string
  window: string
  door: string
  eyelets: string
  closureType: string
  frontClosure: string
  backClosure: string
  extras: string
  sketch: string
}

export interface ResolvedCustomizerConfig {
  configId: number
  productId: string
  productTitle: string
  productType: SupportedProductType
  unitSelector: SupportedUnitSelector
  steps: StepId[]
  dimensions: ResolvedDimensionConfig
  options: {
    colors: ResolvedChoice[]
    materials: ResolvedChoice[]
    topSide: ResolvedChoice[]
    leftSide: ResolvedChoice[]
    rightSide: ResolvedChoice[]
    bottomSide: ResolvedChoice[]
    doorExtras: ResolvedChoice[]
    extras: ResolvedChoice[]
    eyelets: ResolvedChoice[]
    closureTypes: ResolvedChoice[]
    frontClosures: ResolvedChoice[]
    frontClosureExtras: ResolvedChoice[]
    backClosures: ResolvedChoice[]
    backClosureExtras: ResolvedChoice[]
  }
  pricingCapabilities: {
    livePrice: boolean
    allowsEdges: boolean
    allowsWindow: boolean
    allowsDoor: boolean
    supportsEyelets: boolean
    supportsClosureType: boolean
    supportsFrontBackClosure: boolean
  }
  validationRules: {
    requiredFields: ConfigFormField[]
    minimumForPrice: ConfigFormField[]
  }
  hints: ResolvedConfiguratorHints
  issues: string[]
}

export type ConfiguratorStatus =
  | 'ready'
  | 'partial'
  | 'missing'
  | 'error'
  | 'unsupported'

export interface ConfiguratorState {
  status: ConfiguratorStatus
  message?: string
  warnings?: string[]
}
