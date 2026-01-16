import Link from 'next/link'
import { getLogEntries, getLogTemplates } from '@/actions/logs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ClipboardList, Settings, AlertTriangle, Thermometer } from 'lucide-react'

export default async function LogsPage() {
  const [entries, templates] = await Promise.all([
    getLogEntries(),
    getLogTemplates(),
  ])

  const todayEntries = entries.filter(
    (e) => new Date(e.date).toDateString() === new Date().toDateString()
  )
  const exceptionsToday = todayEntries.flatMap((e) =>
    e.readings.filter((r) => r.isException)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record temperature readings and daily checks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/logs/templates">
              <Settings className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/logs/new">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{todayEntries.length}</div>
                <p className="text-sm text-gray-500">Entries Today</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {exceptionsToday.length}
                </div>
                <p className="text-sm text-gray-500">Exceptions Today</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-sm text-gray-500">Log Templates</p>
              </div>
              <Thermometer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Entry Buttons */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Entry</CardTitle>
            <CardDescription>Start a new log entry from a template</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Button key={template.id} variant="outline" asChild>
                <Link href={`/logs/new?templateId=${template.id}`}>
                  {template.name}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>Latest log entries across all sites</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No log entries yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start recording daily logs to track temperatures and compliance.
              </p>
              {templates.length > 0 ? (
                <Button asChild>
                  <Link href="/logs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Entry
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/logs/templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Log Template
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Readings</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const hasException = entry.readings.some((r) => r.isException)
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.template.name}
                      </TableCell>
                      <TableCell>
                        {entry.site ? (
                          <Link
                            href={`/sites/${entry.site.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {entry.site.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {entry.shift || '—'}
                      </TableCell>
                      <TableCell>{entry.readings.length}</TableCell>
                      <TableCell>{entry.user.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {hasException ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Exception
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Complete</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
