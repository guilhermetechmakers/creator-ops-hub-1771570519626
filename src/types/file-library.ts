export interface FileFolder {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface FileLibrary {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: string
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
  storage_path?: string | null
  folder_id?: string | null
  tags?: string[]
  last_used_at?: string | null
  version?: number
  created_at: string
  updated_at: string
}

export interface FileLibraryFilters {
  search?: string
  tags?: string[]
  fileType?: string
  status?: string
  dateRange?: string
  dateFrom?: string
  dateTo?: string
  usage?: string
  folderId?: string
  page?: number
  limit?: number
}
