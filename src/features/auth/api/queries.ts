import { gql } from '@apollo/client'

export const GET_CURRENT_USER = gql`
  query GET_CURRENT_USER {
    customer {
      id
      firstName
      lastName
      email
    }
  }
`

export const GET_CUSTOMER_ORDERS = gql`
  query GET_CUSTOMER_ORDERS {
    customer {
      orders {
        nodes {
          id
          orderNumber
          status
          total
          date
        }
      }
    }
  }
`

/** Vollständige Konto-Daten für Mein Konto (Dashboard, Bestellungen, Adressen, etc.). */
export const GET_CUSTOMER_ACCOUNT = gql`
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
