import { computed, type ComputedRef } from 'vue'
import { useData } from 'vitepress'
import { localePrefix, parsePage, toLang, type Lang } from '../locale.ts'

/**
 * The current page's locale, its URL prefix and its slug.
 *
 * Every component that has to answer "which language am I in?" uses this, so
 * the mapping from VitePress's `localeIndex` lives in exactly one place.
 */
export function useLang(): {
  lang: ComputedRef<Lang>
  prefix: ComputedRef<string>
  slug: ComputedRef<string>
} {
  const { localeIndex, page } = useData()

  const lang = computed(() => toLang(localeIndex.value))
  const prefix = computed(() => localePrefix(lang.value))
  const slug = computed(() => parsePage(page.value.relativePath).slug)

  return { lang, prefix, slug }
}
