import { gql } from '@apollo/client';

export const GET_SINGLE_PRODUCT = gql`
  query Product($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      averageRating
      slug
      description
      onSale
      image {
        id
        uri
        title
        srcSet
        sourceUrl
      }
      name
      ... on SimpleProduct {
        salePrice
        regularPrice
        price
        id
        stockQuantity
      }
      ... on VariableProduct {
        salePrice
        regularPrice
        price
        id
        variations {
          nodes {
            id
            databaseId
            name
            stockStatus
            stockQuantity
            purchasable
            onSale
            salePrice
            regularPrice
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
      ... on ExternalProduct {
        price
        id
        externalUrl
      }
      ... on GroupProduct {
        products {
          nodes {
            ... on SimpleProduct {
              id
              price
            }
          }
        }
        id
      }
    }
  }
`;

export const FETCH_ALL_PRODUCTS_QUERY = gql`
  query MyQuery {
    products(first: 50) {
      nodes {
        databaseId
        name
        onSale
        slug
        image {
          sourceUrl
        }
        ... on SimpleProduct {
          databaseId
          price
          regularPrice
          salePrice
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          databaseId
          price
          regularPrice
          salePrice
          productCategories {
            nodes {
              name
              slug
            }
          }
          variations {
            nodes {
              price
              regularPrice
              salePrice
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const FETCH_ALL_CATEGORIES_QUERY = gql`
  query Categories {
    productCategories(first: 20) {
      nodes {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PRODUCTS_FROM_CATEGORY = gql`
  query ProductsFromCategory($id: ID!) {
    productCategory(id: $id) {
      id
      name
      products(first: 50) {
        nodes {
          id
          databaseId
          onSale
          averageRating
          slug
          description
          image {
            id
            uri
            title
            srcSet
            sourceUrl
          }
          name
          ... on SimpleProduct {
            salePrice
            regularPrice
            onSale
            price
            id
          }
          ... on VariableProduct {
            salePrice
            regularPrice
            onSale
            price
            id
          }
          ... on ExternalProduct {
            price
            id
            externalUrl
          }
          ... on GroupProduct {
            products {
              nodes {
                ... on SimpleProduct {
                  id
                  price
                }
              }
            }
            id
          }
        }
      }
    }
  }
`;
