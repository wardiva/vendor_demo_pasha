/**
 * Whether the app is being served locally rather than from the deployment.
 *
 * Two tests because "local" arrives two ways. `import.meta.env.DEV` is true
 * under `vite dev` however the page is reached — including over the network
 * address the dev server also binds, which is not spelled "localhost" but is
 * the same server. The hostname test then covers a production build served
 * locally, `vite preview`, where DEV is false but the page is still not the
 * deployment. Vercel is neither, so it is unaffected.
 *
 * Read once at module scope: a page cannot change the host it was loaded from,
 * and the build folds the DEV half to a constant, so the deployed bundle
 * carries no runtime cost for this.
 *
 * One definition, shared. The Signals page's Profile and Pricing cards and the
 * Prospects page's Profile and Pricing filter options are held back together
 * on local hosts, and a single answer is what keeps them together: a card
 * whose avatar stack opens a filter option, and an option that lists what a
 * card counts, must appear and disappear as a pair.
 */
export const IS_LOCAL =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(window.location.hostname));
