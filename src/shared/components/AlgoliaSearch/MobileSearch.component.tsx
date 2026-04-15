import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState } from 'react';

import SearchResults from './SearchResults.component';

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? ''
const algoliaPublicKey = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY ?? ''
const algoliaIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? ''
const isAlgoliaConfigured =
  Boolean(algoliaAppId && algoliaPublicKey && algoliaIndex) &&
  !['changeme', 'changethis'].includes(algoliaAppId) &&
  !['changeme', 'changethis'].includes(algoliaPublicKey)

const searchClient = isAlgoliaConfigured
  ? algoliasearch(algoliaAppId, algoliaPublicKey)
  : null

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  if (!isAlgoliaConfigured || !searchClient) return null
  return (
    <div className="inline mt-4 md:hidden">
      <InstantSearch indexName={algoliaIndex} searchClient={searchClient}>
        <SearchBox
          translations={{
            submitTitle: 'Søk',
            resetTitle: 'Slett søketekst',
            placeholder: 'Søk etter produkter',
          }}
          className={`px-4 py-2 text-base bg-white border outline-none rounded ${
            hasFocus ? 'border-black' : 'border-gray-400'
          }`}
          onReset={() => {
            setHasFocus(false);
            setSearch(null);
          }}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            setHasFocus(true);
            setSearch(target.value);
          }}
          onKeyDown={(event) => {
            const target = event.target as HTMLInputElement;
            setHasFocus(true);
            setSearch(target.value);
          }}
        />
        {search && <Hits hitComponent={SearchResults} />}
      </InstantSearch>
    </div>
  );
};

export default MobileSearch;
