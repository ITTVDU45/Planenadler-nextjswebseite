import type { GetCustomerAccountResponse } from '../types/customer'

const CUSTOMER_CHECK_QUERY = `
  query GET_CURRENT_USER {
    customer {
      id
      databaseId
    }
  }
`

const GET_CUSTOMER_ACCOUNT_QUERY = `
  query GET_CUSTOMER_ACCOUNT {
    customer {
      id
      databaseId
      firstName
      lastName
      email
      username
      displayName
      billing {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        phone
        email
      }
      shipping {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        phone
      }
      orders(first: 50) {
        nodes {
          id
          databaseId
          orderNumber
          status
          total
          date
          datePaid
        }
      }
    }
  }
`

/**
 * Prüft serverseitig, ob ein eingeloggter Kunde vorhanden ist (Cookie wird mitgegeben).
 * Für Auth-Redirect in Layout/Page.
 */
export async function checkCustomerSession(
  graphqlUrl: string,
  cookie: string
): Promise<boolean> {
  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ query: CUSTOMER_CHECK_QUERY }),
    })
    const json = (await res.json()) as {
      data?: { customer?: { databaseId?: number | null } | null }
    }
    const customer = json?.data?.customer
    return Boolean(customer && typeof customer.databaseId === 'number' && customer.databaseId > 0)
  } catch {
    return false
  }
}

/**
 * Lädt die vollständigen Konto-Daten serverseitig (für Mein-Konto-Seiten).
 * Cookie aus Request-Headers mitgeben, damit die Session erkannt wird.
 */
export async function fetchCustomerAccount(
  graphqlUrl: string,
  cookie: string
): Promise<GetCustomerAccountResponse['customer']> {
  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ query: GET_CUSTOMER_ACCOUNT_QUERY }),
    })
    const json = (await res.json()) as {
      data?: GetCustomerAccountResponse
      errors?: Array<{ message?: string }>
    }
    if (json.errors?.length) {
      return null
    }
    return json.data?.customer ?? null
  } catch {
    return null
  }
}
