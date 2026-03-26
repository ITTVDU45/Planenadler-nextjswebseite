export interface CustomizerMaterial {
  name: string
  price: number | string
}

export interface CustomizerColor {
  color: string
  subtitle: string
  image_url?: string
}

export interface CustomizerDimensions {
  dimension_image_url?: string
  dimension_b_image_url?: string
  dimension_c_image_url?: string
  dimension_description?: string
  description_b?: string
  description_c?: string
  minimum_value?: number
  weight_per_csm?: number
  price_per_square_meter?: number
}

export interface CustomizerEdgeOption {
  subtitle: string
  price: number | string
  cm?: string
  pl_handler?: 'by length' | 'per meter' | 'fixed' | string
  weight?: number
  image_url?: string
}

export type CustomizerTopEdge = CustomizerEdgeOption & {
  top_tarpaulin_price?: number | string
  top_tarpaulin__subtitle?: string
  select_top_cm?: string
  top_pl_handler?: string
  top_tarpaulin_weight?: number
}

export type CustomizerLeftEdge = CustomizerEdgeOption & {
  left_tarpaulin_price?: number | string
  left_tarpaulin__subtitle?: string
  select_left_cm?: string
  left_pl_handler?: string
  left_tarpaulin_weight?: number
}

export type CustomizerRightEdge = CustomizerEdgeOption & {
  right_tarpaulin_price?: number | string
  right_tarpaulin__subtitle?: string
  select_right_cm?: string
  right_pl_handler?: string
  right_tarpaulin_weight?: number
}

export type CustomizerBottomEdge = CustomizerEdgeOption & {
  bottom_tarpaulin_price?: number | string
  bottom_tarpaulin__subtitle?: string
  select_bottom_cm?: string
  bottom_pl_handler?: string
  bottom_tarpaulin_weight?: number
}

export interface CustomizerEyelet {
  eyelet_tarpaulin_price?: number | string
  eyelet_tarpaulin__subtitle?: string
  select_eyelet_cm?: string
  eyelet_pl_handler?: string
  eyelet_weight?: number
  image_url?: string
}

export interface CustomizerClosureType {
  closure_type_tarpaulin_price?: number | string
  closure_type_tarpaulin__subtitle?: string
  select_closure_type_cm?: string
  closure_type_pl_handler?: string
  closure_type_weight?: number
  image_url?: string
}

export interface CustomizerWindowData {
  split_window_image?: string
  window_dimention_image?: string
  window_dimention_description?: string
  window_price_per_square_meter?: number
  window_full_price_square_meter?: number
  split_max_pieces?: number
  price_per_window?: number
  window_price_of_empoly?: number
}

export interface CustomizerDoorData {
  door_dimention_image?: string
  door_dimention_description?: string
  door_price?: number
}

export interface CustomizerDoorExtra {
  door_extras_price?: number | string
  door_extras__subtitle?: string
  door_extra_indluded?: string
  door_extra_weight?: number
  door_extra_per_piece?: string
  door_extra_pl?: string
  image_url?: string
}

export interface CustomizerMainExtra {
  main_extras_price?: number | string
  main_extras__subtitle?: string
  main_extra_indluded?: string
  main_extra_per_piece?: string
  main_extra_pl?: string
  main_extra_weight?: number | string
  main_extra_required?: string
  image_url?: string
}

export interface CustomizerClosure {
  front_closure_price?: number | string
  front_closure_price_two?: number | string
  front_closure__subtitle?: string
  front_clouser_cm?: string
  front_clouser_weight?: number
  front_clouser_pl_handler?: string
  image_url?: string
}

export interface CustomizerBackClosure {
  back_closure_price?: number | string
  back_closure_price_two?: number | string
  back_closure__subtitle?: string
  back_clouser_cm?: string
  back_clouser_weight?: number
  back_clouser_pl_handler?: string
  image_url?: string
}

export interface CustomizerClosureExtra {
  price?: number | string
  subtitle?: string
  included?: string
  cm_selector?: string
  pl_handler?: string
  weight?: number
  image_url?: string
  front_clouser_extra__subtitle?: string
  front_clouser_extra_price?: number | string
  back_clouser_extra__subtitle?: string
  back_clouser_extra_price?: number | string
  [key: string]: unknown
}

export interface CustomizerCalculationUnit {
  product_type: 'tarpulin' | 'lounge' | 'trailer' | string
  unit_selector: 'squaremeter' | 'cubicmeter' | string
}

export interface CustomizerConfig {
  id: number
  product_id: string
  product_title: string
  material: CustomizerMaterial[] | null
  colors: CustomizerColor[] | null
  dimentions: CustomizerDimensions | null
  top_tarpaulin: CustomizerTopEdge[] | null
  left_tarpaulin: CustomizerLeftEdge[] | null
  right_tarpaulin: CustomizerRightEdge[] | null
  bottom_tarpaulin: CustomizerBottomEdge[] | null
  window_data: CustomizerWindowData | null
  door_data: CustomizerDoorData | null
  extras: CustomizerDoorExtra[] | null
  main_extra: CustomizerMainExtra[] | null
  calculation_unit: CustomizerCalculationUnit | null
  front_side: unknown
  back_side: unknown
  eyelets: CustomizerEyelet[] | null
  closure_type: CustomizerClosureType[] | null
  front_clouser: CustomizerClosure[] | null
  back_clouser: CustomizerBackClosure[] | null
  front_clouser_extra: CustomizerClosureExtra[] | null
  back_clouser_extra: CustomizerClosureExtra[] | null
}

export interface CustomizerApiResponse {
  success: boolean
  data?: CustomizerConfig
  message?: string
}
