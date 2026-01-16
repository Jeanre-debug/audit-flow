'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
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
import { createIssue, updateIssue, type IssueFormState } from '@/actions/issues'

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const types = [
  { value: 'non_conformance', label: 'Non-Conformance' },
  { value: 'observation', label: 'Observation' },
  { value: 'recommendation', label: 'Recommendation' },
]

interface IssueFormProps {
  issue?: {
    id: string
    title: string
    description: string | null
    type: string
    priority: string
    siteId: string | null
    assignedToId: string | null
    dueDate: Date | null
  }
  sites: { id: string; name: string }[]
  users: { id: string; name: string | null }[]
}

const initialState: IssueFormState = {}

export function IssueForm({ issue, sites, users }: IssueFormProps) {
  const router = useRouter()
  const isEditing = !!issue

  const boundAction = isEditing
    ? updateIssue.bind(null, issue.id)
    : createIssue

  const [state, formAction, pending] = useActionState(boundAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/issues')
    }
  }, [state.success, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Issue' : 'Create New Issue'}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={issue?.title}
              placeholder="Brief description of the issue"
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-red-500">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={issue?.description || ''}
              placeholder="Detailed description of the issue"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={issue?.type || 'non_conformance'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={issue?.priority || 'medium'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteId">Site</Label>
              <Select name="siteId" defaultValue={issue?.siteId || ''}>
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

            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assign To</Label>
              <Select name="assignedToId" defaultValue={issue?.assignedToId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={
                issue?.dueDate
                  ? new Date(issue.dueDate).toISOString().split('T')[0]
                  : ''
              }
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
            {isEditing ? 'Save Changes' : 'Create Issue'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
