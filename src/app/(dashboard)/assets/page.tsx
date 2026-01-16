import Link from 'next/link'
import { getAssets } from '@/actions/assets'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Package, Thermometer } from 'lucide-react'

export default async function AssetsPage() {
  const assets = await getAssets()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage equipment and track maintenance
          </p>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Link>
        </Button>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No assets yet
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Add equipment like refrigerators, freezers, and thermometers to track their status and maintenance.
            </p>
            <Button asChild>
              <Link href="/assets/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Asset
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Temp Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-medium hover:underline"
                    >
                      {asset.name}
                    </Link>
                    {asset.serialNumber && (
                      <p className="text-xs text-gray-500">S/N: {asset.serialNumber}</p>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{asset.type}</TableCell>
                  <TableCell>
                    {asset.site ? (
                      <Link
                        href={`/sites/${asset.site.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {asset.site.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {asset.minTemp !== null || asset.maxTemp !== null ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Thermometer className="h-4 w-4 text-gray-400" />
                        <span>
                          {asset.minTemp !== null ? `${asset.minTemp}°` : '—'} to{' '}
                          {asset.maxTemp !== null ? `${asset.maxTemp}°` : '—'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/assets/${asset.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
