import { FormEvent, useEffect, useMemo, useState } from 'react'
import './Admin.css'

type BlessingRow = {
  id: string
  name: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: string
  reviewedAt?: string | null
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

const TOKEN_KEY = 'pm-blessings-admin-token'

function loadSavedToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function saveToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export default function AdminBlessings() {
  const [token, setToken] = useState(loadSavedToken)
  const [pass, setPass] = useState(loadSavedToken)
  const [rows, setRows] = useState<BlessingRow[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(Boolean(loadSavedToken()))
  const [busyId, setBusyId] = useState<string | null>(null)

  const headers = (adminToken: string) => ({
    'x-admin-token': adminToken,
    'content-type': 'application/json',
  })

  const load = async (adminToken: string, nextFilter: Filter = filter) => {
    setLoading(true)
    setError('')
    try {
      const query = nextFilter === 'all' ? '' : `?status=${nextFilter}`
      const res = await fetch(`/api/blessings/admin${query}`, {
        headers: headers(adminToken),
      })
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Wrong password' : 'Failed to load blessings')
      }
      const data = (await res.json()) as { blessings: BlessingRow[] }
      setRows(data.blessings || [])
      setUnlocked(true)
      setToken(adminToken)
      saveToken(adminToken)
    } catch (err) {
      setUnlocked(false)
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Blessings wall — Admin'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    const manifest = document.createElement('link')
    manifest.rel = 'manifest'
    manifest.href = '/admin-manifest.json'
    document.head.appendChild(manifest)

    const saved = loadSavedToken()
    if (saved) void load(saved, 'pending')
    return () => {
      meta.remove()
      manifest.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onUnlock = async (e: FormEvent) => {
    e.preventDefault()
    await load(pass.trim(), filter)
  }

  const setStatus = async (id: string, status: BlessingRow['status']) => {
    setBusyId(id)
    setError('')
    try {
      const res = await fetch(`/api/blessings/${id}`, {
        method: 'PATCH',
        headers: headers(token),
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Could not update blessing')
      await load(token, filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this blessing permanently?')) return
    setBusyId(id)
    setError('')
    try {
      const res = await fetch(`/api/blessings/${id}`, {
        method: 'DELETE',
        headers: headers(token),
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Could not delete blessing')
      await load(token, filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  const counts = useMemo(() => {
    const base = { pending: 0, approved: 0, rejected: 0 }
    for (const row of rows) base[row.status] += 1
    return base
  }, [rows])

  if (!unlocked) {
    return (
      <div className="admin admin--gate">
        <form className="admin__gate" onSubmit={(e) => void onUnlock(e)}>
          <h1>Blessings</h1>
          <p className="admin__gate-sub">Approve guest messages before they appear on the wall</p>
          <label>
            Password
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              placeholder="Family password"
              required
            />
          </label>
          {error && <p className="admin__error">{error}</p>}
          <button type="submit" className="btn btn-primary admin__big-btn" disabled={loading}>
            {loading ? 'Opening…' : 'Open inbox'}
          </button>
          <a className="admin__back" href="/">
            ← Wedding site
          </a>
        </form>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <h1>Blessings wall</h1>
          <p className="admin__top-sub">Approve before messages appear publicly</p>
        </div>
        <div className="admin__top-actions">
          <button
            type="button"
            className="admin__mini"
            onClick={() => void load(token, filter)}
            disabled={loading}
          >
            Refresh
          </button>
          <a className="admin__back" href="/">
            ← Wedding site
          </a>
        </div>
      </header>

      <div className="admin__simple">
        <div className="admin__mode admin__mode--family" role="tablist" aria-label="Blessing filter">
          {(
            [
              ['pending', 'Pending'],
              ['approved', 'Approved'],
              ['rejected', 'Rejected'],
              ['all', 'All'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={`admin__mode-btn ${filter === id ? 'is-on' : ''}`}
              onClick={() => {
                setFilter(id)
                void load(token, id)
              }}
            >
              {label}
              {id !== 'all' && filter === 'all' ? ` · ${counts[id]}` : ''}
            </button>
          ))}
        </div>

        {error && <p className="admin__error">{error}</p>}
        {loading && <p className="admin__hint">Loading…</p>}

        <section className="admin__history">
          {!loading && rows.length === 0 && (
            <p className="admin__always">No blessings in this list yet.</p>
          )}
          <ul>
            {rows.map((row) => (
              <li key={row.id}>
                <div>
                  <strong>{row.name}</strong>
                  <span>
                    {row.status}
                    {row.createdAt ? ` · ${new Date(row.createdAt).toLocaleString()}` : ''}
                  </span>
                  <p className="admin__blessing-msg">“{row.message}”</p>
                </div>
                <div className="admin__batch-actions">
                  {row.status !== 'approved' && (
                    <button
                      type="button"
                      className="admin__mini"
                      disabled={busyId === row.id}
                      onClick={() => void setStatus(row.id, 'approved')}
                    >
                      Approve
                    </button>
                  )}
                  {row.status !== 'rejected' && (
                    <button
                      type="button"
                      className="admin__mini"
                      disabled={busyId === row.id}
                      onClick={() => void setStatus(row.id, 'rejected')}
                    >
                      Reject
                    </button>
                  )}
                  {row.status !== 'pending' && (
                    <button
                      type="button"
                      className="admin__mini"
                      disabled={busyId === row.id}
                      onClick={() => void setStatus(row.id, 'pending')}
                    >
                      Back to pending
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin__mini"
                    disabled={busyId === row.id}
                    onClick={() => void remove(row.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
