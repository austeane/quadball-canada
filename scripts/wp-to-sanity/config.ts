export const config = {
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN!,
  wpXmlPath: process.env.WP_XML_PATH!,
};

export function assertConfig() {
  for (const [k, v] of Object.entries(config)) {
    if (!v) throw new Error(`Missing env: ${k}`);
  }
}

