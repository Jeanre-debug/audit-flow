'use client'

import { useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createAsset, updateAsset, type AssetFormState } from '@/actions/assets'

const assetTypes = [
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'thermometer', label: 'Thermometer' },
  { value: 'oven', label: 'Oven' },
  { value: 'grill', label: 'Grill' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'prep_table', label: 'Prep Table' },
  { value: 'hot_holding', label: 'Hot Holding Unit' },
  { value: 'cold_holding', label: 'Cold Holding Unit' },
  { value: 'other', label: 'Other' },
]

interface AssetFormProps {
  asset?: {
    id: string
    name: string
    type: string
    siteId: string | null
    manufacturer: string | null
    model: string | null
    serialNumber: string | null
    minTemp: number | null
    maxTemp: number | null
    notes: string | null
  }
  sites: { id: string; name: string }[]
}

const initialState: AssetFormState = {}

export function AssetForm({ asset, sites }: AssetFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultSiteId = searchParams.get('siteId') || asset?.siteId || ''
  const isEditing = !!asset

  const boundAction = isEditing
    ? updateAsset.bind(null, asset.id)
    : createAsset

  const [state, formAction, pending] = useActionState(boundAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/assets')
    }
  }, [state.success, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={asset?.name}
                placeholder="e.g., Walk-in Cooler #1"
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select name="type" defaultValue={asset?.type || ''} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.type && (
                <p className="text-sm text-red-500">{state.errors.type[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteId">Site</Label>
            <Select name="siteId" defaultValue={defaultSiteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select site (optional)" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                defaultValue={asset?.manufacturer || ''}
                placeholder="e.g., True, Traulsen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                defaultValue={asset?.model || ''}
                placeholder="Model number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              defaultValue={asset?.serialNumber || ''}
              placeholder="Serial number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minTemp">Min Temperature (°F)</Label>
              <Input
                id="minTemp"
                name="minTemp"
                type="number"
                step="0.1"
                defaultValue={asset?.minTemp ?? ''}
                placeholder="e.g., 32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTemp">Max Temperature (°F)</Label>
              <Input
                id="maxTemp"
                name="maxTemp"
                type="number"
                step="0.1"
                defaultValue={asset?.maxTemp ?? ''}
                placeholder="e.g., 40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={asset?.notes || ''}
              placeholder="Additional notes about this asset"
              rows={3}
            />
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
            {isEditing ? 'Save Changes' : 'Create Asset'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
