/**
 * Maps template IDs to the page title used for JSON storage.
 * Used by the share page to parse and render template content instead of raw JSON.
 */
export const TEMPLATE_PAGE_TITLES: Record<string, string> = {
  'save-the-date': '__save_the_date_template__',
  'tutorial-learn': '__tutorial_learn_template__',
  'planner': '__planner_template__',
  'diary': '__diary_template__',
  'document': '__doc_template__',
  'dashboard': '__dashboard_template__',
  'trip': '__trip_template__',
  'loop': '__loop_template__',
  'project': '__project_template__',
  'prompt-diary': '__prompt_diary_template__',
  'ai-research': '__ai_research_template__',
  'code-notebook': '__code_template__',
  'whiteboard': '__whiteboard_template__',
  'studybook': '__studybook_template__',
}

export function getTemplatePageTitle(templateId: string): string | undefined {
  return TEMPLATE_PAGE_TITLES[templateId]
}

export function isJsonTemplate(templateId: string): boolean {
  return templateId in TEMPLATE_PAGE_TITLES
}
