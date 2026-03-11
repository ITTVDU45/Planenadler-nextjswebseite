/**
 * Typen für die Mein-Konto-Seite (GraphQL Customer / GET_CUSTOMER_ACCOUNT).
 * Angelehnt an WPGraphQL for WooCommerce Customer-Schema.
 */

export interface CustomerAddress {
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  postcode?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
}

export interface CustomerOrder {
  id: string
  databaseId?: number | null
  orderNumber?: number | null
  status?: string | null
  total?: string | null
  date?: string | null
  datePaid?: string | null
}

export interface CustomerDownloadableItem {
  id?: string | null
  url?: string | null
  name?: string | null
  downloadId?: string | null
  downloadsRemaining?: number | null
  accessExpires?: string | null
}

export interface CustomerAccountData {
  id: string
  databaseId?: number | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  username?: string | null
  displayName?: string | null
  billing?: CustomerAddress | null
  shipping?: CustomerAddress | null
  orders?: {
    nodes?: CustomerOrder[] | null
  } | null
  downloadableItems?: {
    nodes?: CustomerDownloadableItem[] | null
  } | null
}

export interface GetCustomerAccountResponse {
  customer: CustomerAccountData | null
}
