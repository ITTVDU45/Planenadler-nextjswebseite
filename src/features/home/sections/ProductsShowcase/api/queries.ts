export const GET_PRODUCTS_BY_CATEGORY = /* GraphQL */ `
  query ProductsByCategory($slug: [String]) {
    products(where: { categoryIn: $slug }, first: 9) {
      nodes {
        id
        slug
        name
        averageRating
        description
        ... on SimpleProduct {
          price
          shortDescription
          attributes {
            nodes {
              name
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
    products(first: 9) {
      nodes {
        id
        slug
        name
        averageRating
        description
        ... on SimpleProduct {
          price
          shortDescription
          attributes {
            nodes {
              name
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
