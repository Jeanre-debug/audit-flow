import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getIssue } from '@/actions/issues'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit,
  MapPin,
  User,
  Calendar,
  ClipboardCheck,
  ImageIcon,
} from 'lucide-react'
import { IssueActions } from './issue-actions'
import { CommentForm } from './comment-form'
import { ImageUpload } from '@/components/issues/image-upload'

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

  const initialMedia = issue.media.filter((m) => m.stage === 'initial')
  const resolutionMedia = issue.media.filter((m) => m.stage === 'resolution')
  const verificationMedia = issue.media.filter((m) => m.stage === 'verification')

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="self-start">
          <Link href="/issues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold break-words">{issue.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {getStatusBadge(issue.status)}
            {getPriorityBadge(issue.priority)}
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
            {issue.site && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <Link href={`/sites/${issue.site.id}`} className="hover:underline truncate">
                  {issue.site.name}
                </Link>
              </span>
            )}
            {issue.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{issue.assignedTo.name}</span>
              </span>
            )}
            {issue.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                Due: {new Date(issue.dueDate).toLocaleDateString()}
              </span>
            )}
            {issue.audit && (
              <span className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4 flex-shrink-0" />
                <Link href={`/audits/${issue.audit.id}`} className="hover:underline truncate">
                  {issue.audit.template.name}
                </Link>
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" asChild className="self-start sm:self-auto">
          <Link href={`/issues/${issue.id}/edit`}>
            <Edit className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <p className="whitespace-pre-wrap text-sm sm:text-base">{issue.description}</p>
              ) : (
                <p className="text-gray-500 text-sm">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Evidence Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Evidence Photos
              </CardTitle>
              <CardDescription>
                Attach photos to document the issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="initial" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="initial" className="text-xs sm:text-sm">
                    Initial ({initialMedia.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolution" className="text-xs sm:text-sm">
                    Resolution ({resolutionMedia.length})
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="text-xs sm:text-sm">
                    Verified ({verificationMedia.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="initial">
                  <ImageUpload issueId={issue.id} media={issue.media} stage="initial" />
                </TabsContent>
                <TabsContent value="resolution">
                  <ImageUpload issueId={issue.id} media={issue.media} stage="resolution" />
                </TabsContent>
                <TabsContent value="verification">
                  <ImageUpload issueId={issue.id} media={issue.media} stage="verification" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Resolution (if resolved) */}
          {issue.resolution && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Resolution</p>
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{issue.resolution}</p>
                </div>
                {issue.rootCause && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Root Cause</p>
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{issue.rootCause}</p>
                  </div>
                )}
                {issue.preventiveAction && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preventive Action</p>
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{issue.preventiveAction}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Comments</CardTitle>
              <CardDescription>
                {issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 sm:gap-3">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {comment.user.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm truncate">
                        {comment.user.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                </div>
              ))}

              {issue.comments.length > 0 && <Separator className="my-4" />}

              <CommentForm issueId={issue.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Shows below on mobile */}
        <div className="space-y-4 sm:space-y-6">
          {/* Actions */}
          <IssueActions issue={issue} />

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="text-sm min-w-0">
                    <p className="font-medium">Created</p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {new Date(issue.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">by {issue.createdBy.name}</p>
                  </div>
                </div>
                {issue.resolvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Resolved</p>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        {new Date(issue.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {issue.verifiedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Verified</p>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        {new Date(issue.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {issue.closedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Closed</p>
                      <p className="text-gray-500 text-xs sm:text-sm">
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
