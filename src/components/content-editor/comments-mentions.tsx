import { useState } from 'react'
import { MessageSquare, Check, AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Comment {
  id: string
  author: string
  authorInitials: string
  content: string
  resolved: boolean
  createdAt: string
  replies?: Comment[]
}

export interface CommentsMentionsProps {
  comments?: Comment[]
  onAddComment?: (content: string) => void
  onResolveComment?: (id: string) => void
  onReply?: (parentId: string, content: string) => void
  className?: string
}

export function CommentsMentions({
  comments = [],
  onAddComment,
  onResolveComment,
  onReply,
  className,
}: CommentsMentionsProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmit = () => {
    if (replyingTo) {
      onReply?.(replyingTo, replyContent)
      setReplyingTo(null)
      setReplyContent('')
    } else if (newComment.trim()) {
      onAddComment?.(newComment)
      setNewComment('')
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Comments & mentions</h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <AtSign className="h-4 w-4" />
          Mention
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input p-8 text-center text-small text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Add a comment or @mention a teammate.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className={cn(
                'transition-opacity',
                comment.resolved && 'opacity-60'
              )}
            >
              <CardHeader className="p-3 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-micro bg-primary/10 text-primary">
                        {comment.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-small">{comment.author}</p>
                      <p className="text-micro text-muted-foreground">
                        {comment.createdAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onResolveComment?.(comment.id)}
                    className={cn(
                      'gap-1',
                      comment.resolved && 'text-success'
                    )}
                    aria-label={comment.resolved ? 'Unresolve' : 'Resolve'}
                  >
                    <Check className="h-4 w-4" />
                    {comment.resolved && 'Resolved'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-small">{comment.content}</p>
                {replyingTo === comment.id ? (
                  <div className="mt-2 flex gap-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="min-h-[60px] text-small"
                    />
                    <div className="flex flex-col gap-1">
                      <Button size="sm" onClick={handleSubmit}>
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-small"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="p-4 border-t">
        <Textarea
          value={replyingTo ? replyContent : newComment}
          onChange={(e) =>
            replyingTo ? setReplyContent(e.target.value) : setNewComment(e.target.value)
          }
          placeholder="Add a comment or @mention..."
          className="min-h-[80px] text-small"
        />
        <Button
          className="mt-2"
          size="sm"
          onClick={handleSubmit}
          disabled={!(replyingTo ? replyContent.trim() : newComment.trim())}
        >
          {replyingTo ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </div>
  )
}
