'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { createSite, updateSite, type SiteFormState } from '@/actions/sites'

interface SiteFormProps {
  site?: {
    id: string
    name: string
    address: string | null
    city: string | null
    state: string | null
    postalCode: string | null
    country: string | null
    phone: string | null
    email: string | null
  }
}

const initialState: SiteFormState = {}

export function SiteForm({ site }: SiteFormProps) {
  const router = useRouter()
  const isEditing = !!site

  const boundAction = isEditing
    ? updateSite.bind(null, site.id)
    : createSite

  const [state, formAction, pending] = useActionState(boundAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/sites')
    }
  }, [state.success, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Site' : 'Add New Site'}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Site Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={site?.name}
              placeholder="e.g., Main Kitchen, Downtown Location"
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={site?.address || ''}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={site?.city || ''}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                name="state"
                defaultValue={site?.state || ''}
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={site?.postalCode || ''}
                placeholder="Postal code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={site?.country || ''}
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={site?.phone || ''}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={site?.email || ''}
                placeholder="Contact email"
              />
              {state.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Site'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
