import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getIssue } from '@/actions/issues'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  MapPin,
  User,
  Calendar,
  ClipboardCheck,
  Clock,
} from 'lucide-react'
import { IssueActions } from './issue-actions'
import { CommentForm } from './comment-form'

interface IssuePageProps {
  params: Promise<{ id: string }>
}

function getPriorityBadge(priority: string) {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    critical: 'destructive',
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  }
  return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>
}

function getStatusBadge(status: string) {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    open: 'destructive',
    in_progress: 'default',
    resolved: 'secondary',
    verified: 'outline',
    closed: 'outline',
  }
  return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { id } = await params
  const issue = await getIssue(id)

  if (!issue) {
    notFound()
  }

  const isOverdue =
    issue.dueDate &&
    new Date(issue.dueDate) < new Date() &&
    !['resolved', 'verified', 'closed'].includes(issue.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/issues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            {getStatusBadge(issue.status)}
            {getPriorityBadge(issue.priority)}
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
            {issue.site && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <Link href={`/sites/${issue.site.id}`} className="hover:underline">
                  {issue.site.name}
                </Link>
              </span>
            )}
            {issue.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {issue.assignedTo.name}
              </span>
            )}
            {issue.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due: {new Date(issue.dueDate).toLocaleDateString()}
              </span>
            )}
            {issue.audit && (
              <span className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                <Link href={`/audits/${issue.audit.id}`} className="hover:underline">
                  {issue.audit.template.name}
                </Link>
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/issues/${issue.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <p className="whitespace-pre-wrap">{issue.description}</p>
              ) : (
                <p className="text-gray-500">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Resolution (if resolved) */}
          {issue.resolution && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Resolution</p>
                  <p className="whitespace-pre-wrap">{issue.resolution}</p>
                </div>
                {issue.rootCause && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Root Cause</p>
                    <p className="whitespace-pre-wrap">{issue.rootCause}</p>
                  </div>
                )}
                {issue.preventiveAction && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preventive Action</p>
                    <p className="whitespace-pre-wrap">{issue.preventiveAction}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>
                {issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {comment.user.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.user.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}

              {issue.comments.length > 0 && <Separator className="my-4" />}

              <CommentForm issueId={issue.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <IssueActions issue={issue} />

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="text-sm">
                    <p className="font-medium">Created</p>
                    <p className="text-gray-500">
                      {new Date(issue.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-500">by {issue.createdBy.name}</p>
                  </div>
                </div>
                {issue.resolvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="text-sm">
                      <p className="font-medium">Resolved</p>
                      <p className="text-gray-500">
                        {new Date(issue.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {issue.verifiedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <div className="text-sm">
                      <p className="font-medium">Verified</p>
                      <p className="text-gray-500">
                        {new Date(issue.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {issue.closedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <div className="text-sm">
                      <p className="font-medium">Closed</p>
                      <p className="text-gray-500">
                        {new Date(issue.closedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
