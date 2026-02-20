import { useState, useRef } from 'react'
import { MessageSquare, Check, AtSign, Loader2 } from 'lucide-react'
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
  onAddComment?: (content: string) => void | Promise<void>
  onResolveComment?: (id: string) => void | Promise<void>
  onReply?: (parentId: string, content: string) => void | Promise<void>
  onMentionClick?: () => void
  className?: string
}

export function CommentsMentions({
  comments = [],
  onAddComment,
  onResolveComment,
  onReply,
  onMentionClick,
  className,
}: CommentsMentionsProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [resolvingCommentId, setResolvingCommentId] = useState<string | null>(null)
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (replyingTo) {
      if (!replyContent.trim()) return
      setIsReplying(true)
      try {
        await Promise.resolve(onReply?.(replyingTo, replyContent))
        setReplyingTo(null)
        setReplyContent('')
      } finally {
        setIsReplying(false)
      }
    } else if (newComment.trim()) {
      setIsAddingComment(true)
      try {
        await Promise.resolve(onAddComment?.(newComment))
        setNewComment('')
      } finally {
        setIsAddingComment(false)
      }
    }
  }

  const handleResolveComment = async (id: string) => {
    setResolvingCommentId(id)
    try {
      await Promise.resolve(onResolveComment?.(id))
    } finally {
      setResolvingCommentId(null)
    }
  }

  const focusCommentInput = (prefix = '') => {
    setReplyingTo(null)
    setReplyContent('')
    setNewComment(prefix)
    commentTextareaRef.current?.focus()
  }

  const handleMentionClick = () => {
    if (onMentionClick) {
      onMentionClick()
    } else {
      focusCommentInput('@')
    }
  }

  const isSubmitting = isAddingComment || isReplying

  return (
    <div className={cn('flex flex-col', className)} role="region" aria-labelledby="comments-heading">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
          <h1 id="comments-heading" className="text-h3 font-semibold">
            Comments & mentions
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleMentionClick}
          aria-label="Mention a teammate"
        >
          <AtSign className="h-4 w-4" aria-hidden />
          Mention
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-input bg-muted/30 p-8 text-center animate-fade-in"
            role="status"
            aria-live="polite"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-7 w-7 text-primary opacity-80" aria-hidden />
            </div>
            <div className="space-y-1">
              <h2 className="text-small font-semibold text-foreground">
                No comments yet
              </h2>
              <p className="text-small text-muted-foreground max-w-[240px]">
                Add a comment or @mention a teammate to start the conversation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                className="gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                onClick={() => focusCommentInput()}
                aria-label="Add a comment"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                Add comment
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleMentionClick}
                aria-label="Mention a teammate"
              >
                <AtSign className="h-4 w-4" aria-hidden />
                Mention teammate
              </Button>
            </div>
          </div>
        ) : (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className={cn(
                'transition-all duration-200 hover:shadow-card-hover',
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
                    onClick={() => handleResolveComment(comment.id)}
                    disabled={resolvingCommentId === comment.id}
                    className={cn(
                      'gap-1 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]',
                      comment.resolved && 'text-success'
                    )}
                    aria-label={comment.resolved ? 'Unresolve comment' : 'Resolve comment'}
                  >
                    {resolvingCommentId === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <>
                        <Check className="h-4 w-4" aria-hidden />
                        {comment.resolved && 'Resolved'}
                      </>
                    )}
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
                      disabled={isReplying}
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!replyContent.trim() || isReplying}
                        className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isReplying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            Replying...
                          </>
                        ) : (
                          'Reply'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                        disabled={isReplying}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-small transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
          ref={commentTextareaRef}
          value={replyingTo ? replyContent : newComment}
          onChange={(e) =>
            replyingTo ? setReplyContent(e.target.value) : setNewComment(e.target.value)
          }
          placeholder="Add a comment or @mention..."
          className="min-h-[80px] text-small"
          disabled={isSubmitting}
          aria-label="Add a comment or mention"
        />
        <Button
          className="mt-2 gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          size="sm"
          onClick={handleSubmit}
          disabled={
            !(replyingTo ? replyContent.trim() : newComment.trim()) || isSubmitting
          }
          aria-busy={isSubmitting}
          aria-label={replyingTo ? 'Submit reply' : 'Add comment'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {replyingTo ? 'Replying...' : 'Adding...'}
            </>
          ) : replyingTo ? (
            'Reply'
          ) : (
            'Comment'
          )}
        </Button>
      </div>
    </div>
  )
}
