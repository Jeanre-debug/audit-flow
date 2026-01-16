'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, PlayCircle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import { updateIssueStatus, deleteIssue } from '@/actions/issues'

interface IssueActionsProps {
  issue: {
    id: string
    status: string
  }
}

export function IssueActions({ issue }: IssueActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [resolution, setResolution] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [preventiveAction, setPreventiveAction] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    await updateIssueStatus(issue.id, newStatus)
    setLoading(false)
    router.refresh()
  }

  const handleResolve = async () => {
    setLoading(true)
    await updateIssueStatus(issue.id, 'resolved', {
      resolution,
      rootCause,
      preventiveAction,
    })
    setLoading(false)
    setShowResolveDialog(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteIssue(issue.id)
    if (result.success) {
      router.push('/issues')
    } else {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {issue.status === 'open' && (
            <Button
              className="w-full"
              onClick={() => handleStatusChange('in_progress')}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              Start Working
            </Button>
          )}

          {issue.status === 'in_progress' && (
            <Button
              className="w-full"
              onClick={() => setShowResolveDialog(true)}
              disabled={loading}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Resolved
            </Button>
          )}

          {issue.status === 'resolved' && (
            <Button
              className="w-full"
              onClick={() => handleStatusChange('verified')}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Verify Resolution
            </Button>
          )}

          {issue.status === 'verified' && (
            <Button
              className="w-full"
              onClick={() => handleStatusChange('closed')}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Close Issue
            </Button>
          )}

          {['open', 'in_progress'].includes(issue.status) && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-950">or</span>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Issue
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mark as Resolved</DialogTitle>
            <DialogDescription>
              Provide details about how this issue was resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution *</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the issue was resolved"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rootCause">Root Cause</Label>
              <Textarea
                id="rootCause"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="What caused this issue? (optional)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preventiveAction">Preventive Action</Label>
              <Textarea
                id="preventiveAction"
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                placeholder="What will prevent this from happening again? (optional)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={loading || !resolution.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
