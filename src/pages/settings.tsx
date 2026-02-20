import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  User,
  CreditCard,
  Users,
  Bell,
  Shield,
  Loader2,
  Check,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { NotificationPreferences } from '@/types/settings'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
})

type ProfileFormData = z.infer<typeof profileSchema>

const defaultNotifications: NotificationPreferences = {
  email_comments: true,
  email_mentions: true,
  email_publish_status: true,
  in_app_comments: true,
  in_app_mentions: true,
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultNotifications)
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '', email: '' },
  })

  useEffect(() => {
    document.title = 'Settings & Preferences | Creator Ops Hub'
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setValue('full_name', user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '')
          setValue('email', user.email ?? '')
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setIsLoadingProfile(false)
      }
    }
    loadProfile()
  }, [setValue])

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoadingNotifications(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setIsLoadingNotifications(false)
          return
        }
        const { data } = await supabase.functions.invoke('settings-preferences', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (data?.preferences) {
          setNotifications({
            email_comments: data.preferences.email_comments ?? true,
            email_mentions: data.preferences.email_mentions ?? true,
            email_publish_status: data.preferences.email_publish_status ?? true,
            in_app_comments: data.preferences.in_app_comments ?? true,
            in_app_mentions: data.preferences.in_app_mentions ?? true,
          })
        }
      } catch {
        // Silent fail, use defaults
      } finally {
        setIsLoadingNotifications(false)
      }
    }
    loadNotifications()
  }, [])

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: data.full_name },
      })
      if (error) throw error
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const onNotificationChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...notifications, [key]: value }
    setNotifications(next)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      await supabase.functions.invoke('settings-preferences', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: next,
      })
      toast.success('Preferences saved')
    } catch {
      setNotifications(notifications)
      toast.error('Failed to save preferences')
    }
  }

  const handleRemoveMember = async () => {
    if (!deleteMemberId) return
    setIsDeleting(true)
    try {
      // Placeholder - would call Edge Function to remove team member
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Member removed')
      setDeleteMemberId(null)
    } catch {
      toast.error('Failed to remove member')
    } finally {
      setIsDeleting(false)
    }
  }

  const teamMembers = [
    { id: '1', email: 'you@example.com', role: 'owner' as const, status: 'active' as const, joined_at: '2024-01-15' },
    { id: '2', email: 'teammate@example.com', role: 'member' as const, status: 'active' as const, joined_at: '2024-02-01' },
  ]

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-h1 font-bold">Settings & Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Manage account, billing, team, notifications, and security
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2 bg-muted/50">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-0">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Customize your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" className="hover:scale-[1.02] transition-transform">
                        Change avatar
                      </Button>
                      <p className="text-micro text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full name</Label>
                      <Input
                        id="full_name"
                        {...register('full_name')}
                        className="mt-1.5 focus:border-primary/50 transition-colors"
                        placeholder="Your name"
                      />
                      {errors.full_name && (
                        <p className="text-micro text-destructive mt-1">{errors.full_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="mt-1.5 focus:border-primary/50 transition-colors"
                        placeholder="you@example.com"
                        disabled
                      />
                      <p className="text-micro text-muted-foreground mt-1">Email cannot be changed here</p>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="hover:scale-[1.02] transition-transform">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {isSubmitting ? 'Saving...' : 'Save changes'}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6 mt-0">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Billing & Workspace</CardTitle>
              <CardDescription>Manage your plan and add seats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-small text-muted-foreground">1 seat · Limited features</p>
                  </div>
                  <Button className="shrink-0 hover:scale-[1.02] transition-transform">
                    Upgrade or add seats
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 hover:border-primary/30 transition-colors">
                  <p className="font-medium">Pro</p>
                  <p className="text-small text-muted-foreground">Unlimited research, team features</p>
                  <p className="text-h3 font-bold mt-2">$29<span className="text-small font-normal text-muted-foreground">/mo</span></p>
                </div>
                <div className="rounded-lg border p-4 hover:border-primary/30 transition-colors">
                  <p className="font-medium">Team</p>
                  <p className="text-small text-muted-foreground">5+ seats, analytics, integrations</p>
                  <p className="text-h3 font-bold mt-2">$79<span className="text-small font-normal text-muted-foreground">/mo</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-0">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Invite and manage team members</CardDescription>
              </div>
              <Button className="hover:scale-[1.02] transition-transform">Invite member</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((m) => (
                      <TableRow key={m.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">{m.email}</TableCell>
                        <TableCell>
                          <span className="capitalize">{m.role}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-success">{m.status}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {m.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteMemberId(m.id)}
                              aria-label="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNotifications ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="font-medium text-small text-muted-foreground uppercase tracking-wider">Email</p>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">Comments</p>
                        <p className="text-small text-muted-foreground">Get notified when someone comments</p>
                      </div>
                      <Switch
                        checked={notifications.email_comments}
                        onCheckedChange={(v) => onNotificationChange('email_comments', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">Mentions</p>
                        <p className="text-small text-muted-foreground">When you are @mentioned</p>
                      </div>
                      <Switch
                        checked={notifications.email_mentions}
                        onCheckedChange={(v) => onNotificationChange('email_mentions', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">Publish status</p>
                        <p className="text-small text-muted-foreground">Content published or failed</p>
                      </div>
                      <Switch
                        checked={notifications.email_publish_status}
                        onCheckedChange={(v) => onNotificationChange('email_publish_status', v)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="font-medium text-small text-muted-foreground uppercase tracking-wider">In-app</p>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">Comments</p>
                        <p className="text-small text-muted-foreground">In-app comment notifications</p>
                      </div>
                      <Switch
                        checked={notifications.in_app_comments}
                        onCheckedChange={(v) => onNotificationChange('in_app_comments', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">Mentions</p>
                        <p className="text-small text-muted-foreground">In-app mention notifications</p>
                      </div>
                      <Switch
                        checked={notifications.in_app_mentions}
                        onCheckedChange={(v) => onNotificationChange('in_app_mentions', v)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-0">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>2FA, password policy, and sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">Two-factor authentication</p>
                  <p className="text-small text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" className="shrink-0 hover:scale-[1.02] transition-transform">
                  Enable 2FA
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-small text-muted-foreground">Change your password</p>
                </div>
                <Button variant="outline" className="shrink-0 hover:scale-[1.02] transition-transform" asChild>
                  <Link to="/forgot-password">Change password</Link>
                </Button>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Password policy</p>
                <p className="text-small text-muted-foreground mt-1">
                  Minimum 8 characters, at least one letter and one number. We recommend using a password manager.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Active sessions</p>
                <p className="text-small text-muted-foreground mt-1">Manage your active sessions across devices</p>
                <Button variant="ghost" size="sm" className="mt-2">View sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke their access to the workspace. They will no longer be able to view or edit content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
