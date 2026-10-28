import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {SINGLETON_TYPES, structure} from './src/structure'
import {withAutoGenerateSlug} from './src/actions/autoGenerateSlug'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Page documents can only be published or have their changes discarded
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Quadball Canada',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    // Page documents are opened from the sidebar, never created from "+ Create"
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !SINGLETON_TYPES.has(item.templateId))
        : prev,
    actions: (prev, {schemaType}) => {
      const actions = SINGLETON_TYPES.has(schemaType)
        ? prev.filter(({action}) => action && SINGLETON_ACTIONS.has(action))
        : prev
      // Auto-generate a slug from the title/name on publish when none is set.
      return actions.map((action) =>
        action.action === 'publish' ? withAutoGenerateSlug(action) : action,
      )
    },
  },
})
