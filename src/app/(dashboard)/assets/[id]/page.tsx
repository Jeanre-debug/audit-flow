import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAsset, deleteAsset } from '@/actions/assets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Edit,
  ArrowLeft,
  MapPin,
  Thermometer,
  Calendar,
  Wrench,
} from 'lucide-react'
import { DeleteAssetButton } from './delete-button'

interface AssetPageProps {
  params: Promise<{ id: string }>
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { id } = await params
  const asset = await getAsset(id)

  if (!asset) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/assets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {asset.name}
            </h1>
            <Badge
              variant={
                asset.status === 'active'
                  ? 'default'
                  : asset.status === 'maintenance'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {asset.status}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 capitalize">
            {asset.type}
            {asset.site && (
              <>
                {' '}
                at{' '}
                <Link href={`/sites/${asset.site.id}`} className="text-blue-600 hover:underline">
                  {asset.site.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/assets/${asset.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {asset.manufacturer && (
              <div>
                <p className="text-sm text-gray-500">Manufacturer</p>
                <p className="font-medium">{asset.manufacturer}</p>
              </div>
            )}
            {asset.model && (
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="font-medium">{asset.model}</p>
              </div>
            )}
            {asset.serialNumber && (
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">{asset.serialNumber}</p>
              </div>
            )}
            {asset.site && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {asset.site.name}
                </p>
              </div>
            )}
            {(asset.minTemp !== null || asset.maxTemp !== null) && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Temperature Range</p>
                <p className="font-medium flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  {asset.minTemp !== null ? `${asset.minTemp}°F` : '—'} to{' '}
                  {asset.maxTemp !== null ? `${asset.maxTemp}°F` : '—'}
                </p>
              </div>
            )}
            {asset.notes && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Notes</p>
                <p>{asset.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calibration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Calibration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Last Calibration</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {asset.lastCalibration
                  ? new Date(asset.lastCalibration).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Calibration Due</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {asset.nextCalibration
                  ? new Date(asset.nextCalibration).toLocaleDateString()
                  : 'Not scheduled'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>Recent maintenance and calibration records</CardDescription>
        </CardHeader>
        <CardContent>
          {asset.maintenanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No maintenance records yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {asset.maintenanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium capitalize">{record.type}</p>
                    {record.description && (
                      <p className="text-sm text-gray-600">{record.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {record.performedBy && `By ${record.performedBy} on `}
                      {new Date(record.performedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {record.nextDueAt && (
                    <Badge variant="outline">
                      Next: {new Date(record.nextDueAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
