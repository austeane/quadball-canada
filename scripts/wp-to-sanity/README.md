# WordPress → Sanity Migration (News Articles)

This directory contains scripts to migrate WordPress content into the Sanity `newsArticle` schema and to generate redirect maps.

## Prerequisites

- Node 18+
- Environment variables:
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET` (e.g., `production`)
  - `SANITY_TOKEN` (write-enabled)
  - `WP_XML_PATH` (path to WordPress XML export)

## Structure

```
scripts/wp-to-sanity/
├── README.md
├── config.ts
├── migrate-news-articles.ts
├── build-redirects.ts
└── utils/
    ├── parse-xml.ts
    ├── sanitize-html.ts
    ├── link-rewriter.ts
    └── divi-converter.ts
```

## Usage

```
WP_XML_PATH=./WordPress.2025-07-13.xml \
SANITY_PROJECT_ID=xxxx \
SANITY_DATASET=production \
SANITY_TOKEN=xxxx \
node scripts/wp-to-sanity/migrate-news-articles.ts
```

Then build redirects:

```
node scripts/wp-to-sanity/build-redirects.ts > redirects.json
```

