export const GET_PRODUCTS_BY_CATEGORY = /* GraphQL */ `
  query ProductsByCategory($slug: [String]) {
    products(where: { categoryIn: $slug }, first: 50) {
      nodes {
        id
        slug
        name
        averageRating
        description
        ... on Product {
          modified
        }
        ... on SimpleProduct {
          price
          shortDescription
          attributes {
            nodes {
              name
              options
            }
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
        }
        ... on VariableProduct {
          price
          shortDescription
          attributes {
            nodes {
              name
              options
            }
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
        }
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`

export const GET_PRODUCTS_ALL = /* GraphQL */ `
  query ProductsAll {
    products(first: 100) {
      nodes {
        id
        slug
        name
        averageRating
        description
        ... on Product {
          modified
        }
        ... on SimpleProduct {
          price
          shortDescription
          attributes {
            nodes {
              name
              options
            }
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
        }
        ... on VariableProduct {
          price
          shortDescription
          attributes {
            nodes {
              name
              options
            }
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
        }
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`
