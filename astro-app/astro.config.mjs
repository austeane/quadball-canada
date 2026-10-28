// Loading environment variables from .env files
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
import { loadEnv } from "vite";
const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
} = loadEnv(import.meta.env.MODE, process.cwd(), "");
import { defineConfig } from "astro/config";

// Format dates the same way on every machine. CI builds run in UTC, and stored event
// times are shown as stored, so a laptop in another timezone must not shift them.
process.env.TZ = "UTC";
import sitemap from "@astrojs/sitemap";

// Different environments use different variables
const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID;
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET;

import sanity from "@sanity/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://www.quadballcanada.ca",
  output: "static",
  // Astro 7 defaults to JSX whitespace rules, which drop the spaces that line breaks used to
  // create between inline elements. Keep the lossless compression the site was built with.
  compressHTML: true,
  trailingSlash: "always",
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false,
      apiVersion: "2024-12-08",
      // Builds only ever show published content, even if a token with draft access is added later
      perspective: "published",
    }),
    sitemap({
      entryLimit: 45000,
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
