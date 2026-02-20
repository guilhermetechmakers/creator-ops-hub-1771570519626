import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type AccountFormData = z.infer<typeof accountSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export interface AccountProfileProps {
  name?: string
  email?: string
  avatarUrl?: string
  isLoading?: boolean
  onSaveAccount?: (data: AccountFormData) => Promise<void>
  onChangePassword?: (data: PasswordFormData) => Promise<void>
}

export function AccountProfile({
  name = '',
  email = '',
  avatarUrl,
  isLoading = false,
  onSaveAccount,
  onChangePassword,
}: AccountProfileProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isSavingAccount, setIsSavingAccount] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name, email },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const handleSaveAccount = async (data: AccountFormData) => {
    setIsSavingAccount(true)
    try {
      await onSaveAccount?.(data)
      toast.success('Account updated successfully')
    } catch {
      toast.error('Failed to update account')
    } finally {
      setIsSavingAccount(false)
    }
  }

  const handleChangePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      await onChangePassword?.(data)
      toast.success('Password changed successfully')
      setShowPasswordForm(false)
      passwordForm.reset()
    } catch {
      toast.error('Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Account
        </CardTitle>
        <CardDescription>
          Manage your profile information and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile picture */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="text-small font-medium">Profile picture</p>
            <p className="text-micro text-muted-foreground">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>

        {/* Name and email form */}
        <form
          onSubmit={accountForm.handleSubmit(handleSaveAccount)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              {...accountForm.register('name')}
              className={cn(
                'transition-colors duration-200 focus:border-primary/50',
                accountForm.formState.errors.name && 'border-destructive focus:border-destructive'
              )}
            />
            {accountForm.formState.errors.name && (
              <p className="text-micro text-destructive animate-shake">
                {accountForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...accountForm.register('email')}
              className={cn(
                'transition-colors duration-200 focus:border-primary/50',
                accountForm.formState.errors.email && 'border-destructive focus:border-destructive'
              )}
            />
            {accountForm.formState.errors.email && (
              <p className="text-micro text-destructive animate-shake">
                {accountForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSavingAccount}
            className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSavingAccount ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save changes'
            )}
          </Button>
        </form>

        {/* Password change */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-small text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
            {!showPasswordForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
                className="transition-transform duration-200 hover:scale-[1.02]"
              >
                Change password
              </Button>
            )}
          </div>
          {showPasswordForm && (
            <form
              onSubmit={passwordForm.handleSubmit(handleChangePassword)}
              className="space-y-4 animate-fade-in"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('currentPassword')}
                  className="focus:border-primary/50"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-micro text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('newPassword')}
                  className="focus:border-primary/50"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-micro text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('confirmPassword')}
                  className="focus:border-primary/50"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-micro text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="transition-transform duration-200 hover:scale-[1.02]"
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Update password'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    passwordForm.reset()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
