import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileLibraryRecord {
  id?: string
  title: string
  description?: string
  file_name?: string
  file_type?: string
  tags?: string[]
  status?: string
}

function parseCSV(content: string): FileLibraryRecord[] {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const records: FileLibraryRecord[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? ''
    })
    const title = row['title'] ?? row['name'] ?? row['file_name'] ?? ''
    if (!title) continue
    const tagsStr = row['tags'] ?? row['tag'] ?? ''
    const tags = tagsStr ? tagsStr.split(/[;,|]/).map((t) => t.trim().toLowerCase()).filter(Boolean) : []
    records.push({
      title,
      description: row['description'] ?? undefined,
      file_name: row['file_name'] ?? row['name'] ?? title,
      file_type: row['file_type'] ?? row['type'] ?? undefined,
      tags: tags.length ? tags : undefined,
      status: 'active',
    })
  }
  return records
}

function parseJSON(content: string): FileLibraryRecord[] {
  const parsed = JSON.parse(content)
  const arr = Array.isArray(parsed) ? parsed : [parsed]
  return arr
    .filter((r: unknown) => r && typeof r === 'object' && 'title' in r)
    .map((r: Record<string, unknown>) => ({
      title: String(r.title ?? r.name ?? ''),
      description: r.description != null ? String(r.description) : undefined,
      file_name: r.file_name ?? r.name != null ? String(r.file_name ?? r.name) : undefined,
      file_type: r.file_type ?? r.type != null ? String(r.file_type ?? r.type) : undefined,
      tags: Array.isArray(r.tags) ? r.tags.map(String) : undefined,
      status: 'active',
    }))
}

function toCSV(records: Record<string, unknown>[]): string {
  const headers = ['title', 'description', 'file_name', 'file_type', 'tags', 'created_at', 'updated_at']
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = records.map((r) => {
    const tags = r.tags
    const tagsStr = Array.isArray(tags) ? tags.join(';') : String(tags ?? '')
    const row: Record<string, unknown> = { ...r, tags: tagsStr }
    return headers.map((h) => escape(row[h])).join(',')
  })
  return [headers.join(','), ...rows].join('\n')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const action = body.action as string

    if (action === 'export') {
      const format = (body.format as string) || 'json'
      const ids = body.ids as string[] | undefined

      let query = supabase
        .from('file_library')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (ids && Array.isArray(ids) && ids.length > 0) {
        query = query.in('id', ids)
      }

      const { data: items, error } = await query
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const records = (items ?? []) as Record<string, unknown>[]
      if (format === 'csv') {
        const csv = toCSV(records)
        return new Response(
          JSON.stringify({ data: csv, format: 'csv' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ data: records, format: 'json' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'import') {
      const format = (body.format as string) || 'json'
      const content = body.content as string
      if (!content || typeof content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'content required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let records: FileLibraryRecord[]
      try {
        if (format === 'csv') {
          records = parseCSV(content)
        } else {
          records = parseJSON(content)
        }
      } catch (e) {
        return new Response(
          JSON.stringify({ error: `Invalid ${format.toUpperCase()}: ${(e as Error).message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (records.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid records to import' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const inserted: string[] = []
      for (const r of records) {
        if (!r.title?.trim()) continue
        const { data, error } = await supabase
          .from('file_library')
          .insert({
            user_id: user.id,
            title: r.title.trim(),
            description: r.description ?? null,
            status: r.status ?? 'active',
            file_name: r.file_name ?? r.title,
            file_type: r.file_type ?? null,
            file_size: null,
            storage_path: null,
            tags: Array.isArray(r.tags) ? r.tags : [],
            version: 1,
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single()
        if (!error && data) {
          inserted.push(data.id as string)
        }
      }

      return new Response(
        JSON.stringify({ success: true, imported: inserted.length, ids: inserted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
