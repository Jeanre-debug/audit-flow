'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Loader2,
  UserPlus,
  Inbox,
} from 'lucide-react'
import {
  getAccessRequests,
  updateAccessRequestStatus,
  deleteAccessRequest,
} from '@/actions/access-requests'
import { createUser } from '@/actions/users'

interface AccessRequest {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  status: string
  createdAt: Date
}

const roles = [
  { value: 'member', label: 'Member' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

export function AccessRequestsList() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [approveDialog, setApproveDialog] = useState<AccessRequest | null>(null)
  const [processing, setProcessing] = useState(false)
  const [newUserData, setNewUserData] = useState({
    password: '',
    role: 'member',
  })
  const [error, setError] = useState<string | null>(null)

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await getAccessRequests(activeTab === 'all' ? undefined : activeTab)
      setRequests(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [activeTab])

  const handleApprove = async () => {
    if (!approveDialog || !newUserData.password) return

    setProcessing(true)
    setError(null)

    try {
      // Create the user
      const result = await createUser({
        email: approveDialog.email,
        name: approveDialog.name,
        password: newUserData.password,
        role: newUserData.role,
        phone: approveDialog.phone || undefined,
      })

      if (!result.success) {
        setError(result.error || 'Failed to create user')
        setProcessing(false)
        return
      }

      // Mark request as approved
      await updateAccessRequestStatus(approveDialog.id, 'approved')

      setApproveDialog(null)
      setNewUserData({ password: '', role: 'member' })
      loadRequests()
    } catch (err) {
      setError('Failed to approve request')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return

    setProcessing(true)
    await updateAccessRequestStatus(id, 'rejected')
    setProcessing(false)
    loadRequests()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return

    setProcessing(true)
    await deleteAccessRequest(id)
    setProcessing(false)
    loadRequests()
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewUserData({ ...newUserData, password })
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No {activeTab} requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </span>
                        {request.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.phone}
                          </span>
                        )}
                        {request.company && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {request.company}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          request.status === 'approved'
                            ? 'default'
                            : request.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {request.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {request.message}
                    </p>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setApproveDialog(request)}
                        disabled={processing}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Approve & Create User
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        disabled={processing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(request.id)}
                        disabled={processing}
                        className="text-gray-500"
                      >
                        Delete Request
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User Account</DialogTitle>
            <DialogDescription>
              Create an account for {approveDialog?.name} ({approveDialog?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  placeholder="Enter a temporary password"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this password with the user so they can log in
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) =>
                  setNewUserData({ ...newUserData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing || !newUserData.password}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
