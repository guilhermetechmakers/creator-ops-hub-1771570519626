export interface ContentEditor {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  content_body?: string
  channel?: string
  assignee_id?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export type ContentEditorStatus = 'draft' | 'review' | 'scheduled' | 'published'

export interface ContentEditorVersion {
  id: string
  content_editor_id: string
  content_body: string
  version_number: number
  created_at: string
}
