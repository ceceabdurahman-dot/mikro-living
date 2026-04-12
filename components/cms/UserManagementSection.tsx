'use client'

import { useEffect, useMemo, useState } from 'react'
import { KeyRound, RefreshCw, Save, Trash2, UserPlus, Users } from 'lucide-react'

import {
  clearLegacyAuthCookies,
  refreshSession,
} from '../../lib/authSession'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ManagedUser = {
  id: number
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'editor'
  avatar_url?: string | null
  is_active: boolean
  last_login?: string | null
  created_at?: string | null
}

type PaginatedMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

type UserFormState = {
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'editor'
  password: string
  is_active: boolean
}

type PasswordFormState = {
  newPassword: string
  confirmPassword: string
}

const emptyUserForm = (): UserFormState => ({
  name: '',
  email: '',
  role: 'editor',
  password: '',
  is_active: true,
})

const emptyPasswordForm = (): PasswordFormState => ({
  newPassword: '',
  confirmPassword: '',
})

const inputClassName =
  'w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-800 outline-none transition focus:border-primary focus:bg-white'

async function authRequest<T>(endpoint: string, options: RequestInit = {}, allowRetry = true): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (response.status === 401) {
    if (allowRetry) {
      const restored = await refreshSession()
      if (restored) {
        return authRequest<T>(endpoint, options, false)
      }
    }

    clearLegacyAuthCookies()
    window.location.replace('/login?redirect=%2Fcms')
    throw new Error('Sesi Anda berakhir. Silakan login ulang.')
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Permintaan ke server gagal.')
  }

  return payload
}

async function authFormRequest<T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT'): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: formData,
    credentials: 'include',
  })

  const payload = await response.json().catch(() => ({}))

  if (response.status === 401) {
    const restored = await refreshSession()
    if (restored) {
      return authFormRequest<T>(endpoint, formData, method)
    }

    clearLegacyAuthCookies()
    window.location.replace('/login?redirect=%2Fcms')
    throw new Error('Sesi Anda berakhir. Silakan login ulang.')
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Permintaan ke server gagal.')
  }

  return payload
}

function formatDate(value?: string | null) {
  if (!value) return 'Belum pernah login'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Belum pernah login'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getInitial(name: string) {
  return String(name || 'U').trim().charAt(0).toUpperCase() || 'U'
}

export default function UserManagementSection({
  currentUserRole,
}: {
  currentUserRole: string
}) {
  const canManageUsers = currentUserRole === 'admin' || currentUserRole === 'superadmin'
  const roleOptions: UserFormState['role'][] =
    currentUserRole === 'superadmin' ? ['admin', 'editor'] : ['editor']

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [page, setPage] = useState(1)
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor'>('all')
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm)
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm)
  const [busyKey, setBusyKey] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [filePickerKey, setFilePickerKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(queryInput.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [queryInput])

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(avatarFile)
    setAvatarPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarFile])

  const loadUsers = async () => {
    if (!canManageUsers) return

    try {
      setLoading(true)
      setError('')
      const search = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })

      if (query) search.set('q', query)
      if (statusFilter !== 'all') search.set('status', statusFilter)
      if (roleFilter !== 'all' && currentUserRole === 'superadmin') search.set('role', roleFilter)

      const payload = await authRequest<{ data: ManagedUser[]; meta: PaginatedMeta }>(
        `/auth/users?${search.toString()}`
      )
      setUsers(payload.data || [])
      setMeta(payload.meta || { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 })
    } catch (err: any) {
      setError(err.message || 'Gagal memuat user.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [page, query, statusFilter, roleFilter, currentUserRole])

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, roleFilter])

  useEffect(() => {
    setSelectedUserIds([])
  }, [page, query, statusFilter, roleFilter])

  const resetEditor = () => {
    setEditingUser(null)
    setUserForm(emptyUserForm())
    setPasswordForm(emptyPasswordForm())
    setAvatarFile(null)
    setAvatarPreviewUrl('')
    setBusyKey('')
    setFilePickerKey((current) => current + 1)
  }

  const startEdit = (user: ManagedUser) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      is_active: user.is_active,
    })
    setPasswordForm(emptyPasswordForm())
    setAvatarFile(null)
    setAvatarPreviewUrl('')
    setFilePickerKey((current) => current + 1)
  }

  const buildUserFormData = () => {
    const normalizedName = userForm.name.trim()
    const normalizedEmail = userForm.email.trim().toLowerCase()
    const formData = new FormData()
    formData.append('name', normalizedName)
    formData.append('email', normalizedEmail)
    formData.append('role', userForm.role)
    formData.append('is_active', userForm.is_active ? 'true' : 'false')

    if (!editingUser) {
      formData.append('password', userForm.password)
    }

    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }

    return formData
  }

  const submitUser = async () => {
    try {
      setSaving(true)
      setBusyKey('user-form')
      setError('')
      setFlash('')

      const normalizedName = userForm.name.trim()
      const normalizedEmail = userForm.email.trim().toLowerCase()

      if (!normalizedName || !normalizedEmail) {
        throw new Error('Nama dan email wajib diisi.')
      }

      if (!EMAIL_PATTERN.test(normalizedEmail)) {
        throw new Error('Format email tidak valid.')
      }

      if (!editingUser && userForm.password.length < 8) {
        throw new Error('Password user baru minimal 8 karakter.')
      }

      const formData = buildUserFormData()

      if (editingUser) {
        await authFormRequest(`/auth/users/${editingUser.id}`, formData, 'PUT')
        setFlash('Profil user berhasil diperbarui.')
      } else {
        await authFormRequest('/auth/users', formData, 'POST')
        setFlash('User baru berhasil dibuat.')
      }

      resetEditor()
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan user.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const removeUser = async (user: ManagedUser) => {
    if (!window.confirm(`Hapus user ${user.name}?`)) return

    try {
      setSaving(true)
      setBusyKey(`delete-${user.id}`)
      setError('')
      await authRequest(`/auth/users/${user.id}`, { method: 'DELETE' })
      setFlash('User berhasil dihapus.')
      if (editingUser?.id === user.id) resetEditor()
      setSelectedUserIds((current) => current.filter((id) => id !== user.id))
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus user.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const toggleActive = async (user: ManagedUser, nextValue: boolean) => {
    try {
      setSaving(true)
      setBusyKey(`active-${user.id}`)
      setError('')
      await authRequest(`/auth/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: nextValue }),
      })
      setFlash(nextValue ? 'User diaktifkan.' : 'User dinonaktifkan.')
      if (editingUser?.id === user.id) {
        setUserForm((current) => ({ ...current, is_active: nextValue }))
      }
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui status user.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const submitPasswordChange = async () => {
    if (!editingUser) return

    try {
      setSaving(true)
      setBusyKey(`password-${editingUser.id}`)
      setError('')
      setFlash('')

      if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
        throw new Error('Password baru dan konfirmasinya wajib diisi.')
      }

      await authRequest(`/auth/users/${editingUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      })
      setFlash('Password user berhasil diperbarui.')
      setPasswordForm(emptyPasswordForm())
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui password user.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const toggleSelection = (userId: number) => {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    )
  }

  const allUsersOnPageSelected = users.length > 0 && users.every((user) => selectedUserIds.includes(user.id))

  const toggleSelectAllOnPage = () => {
    if (allUsersOnPageSelected) {
      setSelectedUserIds([])
      return
    }

    setSelectedUserIds(users.map((user) => user.id))
  }

  const bulkUpdateStatus = async (nextValue: boolean) => {
    if (!selectedUserIds.length) return

    const message = nextValue
      ? `Aktifkan ${selectedUserIds.length} user terpilih?`
      : `Nonaktifkan ${selectedUserIds.length} user terpilih?`

    if (!window.confirm(message)) return

    try {
      setSaving(true)
      setBusyKey(nextValue ? 'bulk-active' : 'bulk-inactive')
      setError('')
      await authRequest('/auth/users/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids: selectedUserIds, is_active: nextValue }),
      })
      setFlash(
        nextValue
          ? 'User terpilih berhasil diaktifkan.'
          : 'User terpilih berhasil dinonaktifkan.'
      )
      setSelectedUserIds([])
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Gagal memproses user terpilih.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const selectedSummary = useMemo(() => {
    if (!selectedUserIds.length) return ''
    return `${selectedUserIds.length} user dipilih`
  }, [selectedUserIds])

  const avatarPreview = avatarPreviewUrl || editingUser?.avatar_url || ''
  const formRoleOptions: UserFormState['role'][] = editingUser?.role === 'superadmin' ? ['superadmin'] : roleOptions
  const isRoleLocked = editingUser?.role === 'superadmin'

  if (!canManageUsers) {
    return (
      <div className="rounded-[22px] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-stone-500">
          Fitur kelola user hanya tersedia untuk role admin dan superadmin.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
      <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-headline text-lg text-stone-900">User list</h3>
              <p className="mt-1 text-sm text-stone-500">Kelola akun admin dan editor CMS.</p>
            </div>
            <button
              onClick={() => void loadUsers()}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-2 text-[13px] font-semibold text-stone-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="mt-4 grid gap-2.5 md:grid-cols-3">
            <input
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              className={inputClassName}
              placeholder="Cari nama atau email"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
              className={inputClassName}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'all' | 'admin' | 'editor')}
              className={inputClassName}
              disabled={currentUserRole !== 'superadmin'}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-3">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
              <input type="checkbox" checked={allUsersOnPageSelected} onChange={toggleSelectAllOnPage} />
              Pilih semua user di halaman ini
            </label>
            {selectedSummary ? <span className="text-xs text-stone-500">{selectedSummary}</span> : null}
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                onClick={() => void bulkUpdateStatus(false)}
                disabled={!selectedUserIds.length || saving}
                className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-40"
              >
                {busyKey === 'bulk-inactive' ? 'Memproses...' : 'Bulk nonaktifkan'}
              </button>
              <button
                onClick={() => void bulkUpdateStatus(true)}
                disabled={!selectedUserIds.length || saving}
                className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-40"
              >
                {busyKey === 'bulk-active' ? 'Memproses...' : 'Bulk aktifkan'}
              </button>
            </div>
          </div>

          {flash ? <p className="mt-3 text-sm text-emerald-700">{flash}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        {loading && !users.length ? (
          <div className="px-5 py-8 text-sm text-stone-500">Memuat user...</div>
        ) : users.length ? (
          <div className="divide-y divide-stone-100 text-sm">
            {users.map((user) => (
              <div key={user.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <label className="mt-1 inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleSelection(user.id)}
                    />
                  </label>
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-12 w-12 rounded-2xl border border-stone-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-sm font-semibold text-stone-600">
                      {getInitial(user.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                        {user.role}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] uppercase tracking-wider ${
                          user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {user.is_active ? 'active' : 'inactive'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-500">{user.email}</p>
                    <p className="mt-2 text-xs text-stone-500">Last login: {formatDate(user.last_login)}</p>
                    <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        disabled={saving && busyKey === `active-${user.id}`}
                        onChange={(event) => void toggleActive(user, event.target.checked)}
                      />
                      Aktifkan user ini
                    </label>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeUser(user)}
                    disabled={saving && busyKey === `delete-${user.id}`}
                    className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {busyKey === `delete-${user.id}` ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-sm text-stone-500">Belum ada user yang bisa dikelola pada role ini.</div>
        )}

        {meta.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm">
            <p className="text-stone-500">
              Page {page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-xl border border-stone-200 px-3 py-2 font-semibold text-stone-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
                disabled={page === meta.totalPages}
                className="rounded-xl border border-stone-200 px-3 py-2 font-semibold text-stone-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-headline text-[22px] text-stone-900">
            {editingUser ? 'Edit user' : 'Tambah user'}
          </h3>
          <button
            onClick={resetEditor}
            className="rounded-xl border border-stone-200 px-3.5 py-2 text-[13px] font-semibold text-stone-700"
          >
            Reset form
          </button>
        </div>

        <div className="mt-5 rounded-[22px] border border-dashed border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={editingUser ? editingUser.name : 'Avatar user baru'}
                className="h-20 w-20 rounded-3xl border border-stone-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-stone-200 bg-white text-xl font-semibold text-stone-500">
                {getInitial(userForm.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900">Avatar user</p>
              <p className="mt-1 text-xs text-stone-500">
                Upload avatar JPG, PNG, atau WebP untuk admin dan editor.
              </p>
              <input
                key={filePickerKey}
                type="file"
                accept="image/*"
                onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                className="mt-3 block w-full text-xs text-stone-500 file:mr-3 file:rounded-xl file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
              {avatarFile ? <p className="mt-2 text-xs text-stone-500">File: {avatarFile.name}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3.5 md:grid-cols-2">
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-[13px] font-semibold text-stone-700">Nama</span>
            <input
              className={inputClassName}
              value={userForm.name}
              onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-[13px] font-semibold text-stone-700">Email</span>
            <input
              type="email"
              className={inputClassName}
              value={userForm.email}
              onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-semibold text-stone-700">Role</span>
            <select
              className={inputClassName}
              value={userForm.role}
              disabled={isRoleLocked}
              onChange={(event) =>
                setUserForm((current) => ({ ...current, role: event.target.value as UserFormState['role'] }))
              }
            >
              {formRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          {isRoleLocked ? (
            <p className="text-xs text-stone-500 md:col-span-2">
              Role superadmin dikunci agar tidak berubah tidak sengaja dari form ini.
            </p>
          ) : null}
          {!editingUser ? (
            <label className="block space-y-1.5">
              <span className="text-[13px] font-semibold text-stone-700">Password awal</span>
              <input
                type="password"
                className={inputClassName}
                value={userForm.password}
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
          ) : null}
        </div>

        {editingUser ? (
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700">
            <input
              type="checkbox"
              checked={userForm.is_active}
              onChange={(event) => setUserForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            User aktif
          </label>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => void submitUser()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {editingUser ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {busyKey === 'user-form' ? 'Menyimpan user...' : editingUser ? 'Update user' : 'Create user'}
          </button>
        </div>

        {editingUser ? (
          <div className="mt-8 rounded-[22px] border border-stone-200 bg-stone-50 p-4">
            <h4 className="text-base font-semibold text-stone-900">Ganti password user</h4>
            <div className="mt-4 grid gap-3.5 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-[13px] font-semibold text-stone-700">Password baru</span>
                <input
                  type="password"
                  className={inputClassName}
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[13px] font-semibold text-stone-700">Konfirmasi password</span>
                <input
                  type="password"
                  className={inputClassName}
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                onClick={() => void submitPasswordChange()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-900 disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {busyKey === `password-${editingUser.id}` ? 'Menyimpan password...' : 'Update password'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-[22px] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
          <div className="flex items-center gap-2 text-stone-700">
            <Users className="h-4 w-4" />
            <p className="font-semibold">Catatan user management</p>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-6 text-stone-500">
            <li>Admin dapat menambah, menghapus, menonaktifkan, dan mengganti password user editor.</li>
            <li>Superadmin tetap dapat mengelola admin dan editor.</li>
            <li>Role superadmin tidak dapat diubah dari form kelola user untuk mencegah self-demotion.</li>
            <li>Reset password email sungguhan siap dipakai begitu konfigurasi SMTP produksi diisi valid.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
