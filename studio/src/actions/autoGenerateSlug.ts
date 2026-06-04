import { useDocumentOperation, type DocumentActionComponent } from 'sanity'
import { slugMutations } from '../lib/slugs'

/**
 * Wrap the built-in Publish action so that, when a document has no slug, one is
 * auto-generated from its title/name just before publishing. Applies to every
 * document type that has a slug (see studio/src/lib/slugs.ts). Existing slugs
 * are never overwritten, and any failure falls through to a normal publish.
 */
export function withAutoGenerateSlug(
  originalPublishAction: DocumentActionComponent
): DocumentActionComponent {
  const AutoSlugPublishAction: DocumentActionComponent = (props) => {
    const original = originalPublishAction(props)
    const { patch } = useDocumentOperation(props.id, props.type)

    if (!original) return original

    return {
      ...original,
      onHandle: () => {
        try {
          const doc = props.draft || props.published
          const mutations = slugMutations(props.type, doc)
          if (mutations) patch.execute(mutations)
        } catch (err) {
          // Never block publishing on slug generation.
          console.error('[auto-slug] failed to generate slug:', err)
        }
        original.onHandle?.()
      },
    }
  }

  return AutoSlugPublishAction
}
