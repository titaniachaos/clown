import { TOPICS, TOPIC_NAMES, TOPIC_UI, fill } from '../../.vitepress/topics.ts'

/**
 * A page per topic, generated from the vocabulary rather than written.
 *
 * The posts already carried tags and nothing read them, so nothing could tell
 * that the same post was filed differently in each language. Now a tag is a
 * page: the list is TOPICS, so a new one is a word and three labels, and
 * eleven pages appear in every language.
 */
export default {
  paths() {
    const ui = TOPIC_UI['de']
    return TOPICS.map((topic) => ({
      params: {
        topic,
        name: TOPIC_NAMES['de'][topic],
        title: fill(ui.title, TOPIC_NAMES['de'][topic]),
        description: fill(ui.description, TOPIC_NAMES['de'][topic])
      }
    }))
  }
}
