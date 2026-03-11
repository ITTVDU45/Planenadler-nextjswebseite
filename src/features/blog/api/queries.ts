/**
 * WPGraphQL queries for WordPress posts (blog).
 */

/** WPGraphQL: Standardmäßig nur veröffentlichte Posts; where weggelassen für Kompatibilität. */
export const POSTS_LIST_QUERY = /* GraphQL */ `
  query PostsList($first: Int!, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        id
        databaseId
        slug
        title
        excerpt
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
    }
  }
`

export const POST_BY_SLUG_QUERY = /* GraphQL */ `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      slug
      title
      excerpt
      date
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          name
        }
      }
    }
  }
`
