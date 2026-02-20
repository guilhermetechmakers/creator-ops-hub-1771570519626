import { useState } from 'react'
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Shield,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Select } from '@/components/ui/select'
import type { TeamMember } from '@/types/settings-preferences'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
]

export interface TeamManagementProps {
  members?: TeamMember[]
  isLoading?: boolean
  onInvite?: (email: string, role: string) => Promise<void>
  onRemoveMember?: (id: string) => Promise<void>
  onUpdateRole?: (id: string, role: string) => Promise<void>
}

export function TeamManagement({
  members = [],
  isLoading = false,
  onInvite,
  onRemoveMember,
  onUpdateRole,
}: TeamManagementProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [isInviting, setIsInviting] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setIsInviting(true)
    try {
      await onInvite?.(inviteEmail.trim(), inviteRole)
      toast.success('Invitation sent')
      setInviteEmail('')
      setShowInviteForm(false)
    } catch {
      toast.error('Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async () => {
    if (!memberToRemove) return
    try {
      await onRemoveMember?.(memberToRemove.id)
      toast.success('Member removed')
      setMemberToRemove(null)
    } catch {
      toast.error('Failed to remove member')
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team
          </CardTitle>
          <CardDescription>
            Invite members, manage roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite */}
          <div>
            {!showInviteForm ? (
              <Button
                variant="outline"
                onClick={() => setShowInviteForm(true)}
                className="w-full sm:w-auto transition-transform duration-200 hover:scale-[1.02]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite member
              </Button>
            ) : (
              <form
                onSubmit={handleInvite}
                className="space-y-4 p-4 rounded-lg border bg-muted/30 animate-fade-in"
              >
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    id="invite-role"
                    options={ROLES}
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isInviting}>
                    {isInviting ? 'Sending...' : 'Send invitation'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowInviteForm(false)
                      setInviteEmail('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Members list */}
          <div className="space-y-2">
            <p className="text-small font-medium">Team members</p>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-small">
                  No team members yet
                </p>
                <p className="text-micro text-muted-foreground mt-1">
                  Invite members to collaborate on your workspace
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowInviteForm(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite your first member
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {member.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-small font-medium">{member.email}</p>
                        <Badge variant="secondary" className="text-micro mt-0.5">
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Member options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onUpdateRole?.(member.id, 'admin')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setMemberToRemove(member)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.email} from the team? They will lose access to this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
