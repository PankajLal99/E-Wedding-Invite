import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const here = dirname(fileURLToPath(import.meta.url))

function loadEnvFile() {
  const path = join(here, '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile()

const PORT = Number(process.env.PORT || 8788)
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/wedding_blessings'
const ADMIN_TOKEN = String(process.env.ADMIN_TOKEN || process.env.BLESSINGS_ADMIN_TOKEN || '').trim()
const pool = new pg.Pool({ connectionString: DATABASE_URL })

const hits = new Map()
const WINDOW_MS = 10 * 60 * 1000
const MAX_POSTS = 8

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket.remoteAddress || 'unknown'
}

function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_POSTS) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

function clean(value, max) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function sameHash(a, b) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function sameToken(provided, expected) {
  if (!expected) return false
  const left = Buffer.from(String(provided || ''))
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function requireAdmin(req) {
  const header = req.headers['x-admin-token']
  const token = typeof header === 'string' ? header : ''
  if (!ADMIN_TOKEN || !sameToken(token, ADMIN_TOKEN)) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
}

function send(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(json)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 16_000) {
        reject(Object.assign(new Error('too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (!chunks.length) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(Object.assign(new Error('bad json'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  }
}

async function ensureSchema() {
  const sql = readFileSync(join(here, 'schema.sql'), 'utf8')
  await pool.query(sql)
}

async function listPublicBlessings() {
  const { rows } = await pool.query(
    `SELECT id, name, message, status, created_at, reviewed_at
     FROM blessings
     WHERE status = 'approved'
     ORDER BY created_at DESC
     LIMIT 200`
  )
  return rows.map(mapRow)
}

async function listAdminBlessings(status) {
  const params = []
  let where = ''
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where = 'WHERE status = $1'
    params.push(status)
  }
  const { rows } = await pool.query(
    `SELECT id, name, message, status, created_at, reviewed_at
     FROM blessings
     ${where}
     ORDER BY
       CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
       created_at DESC
     LIMIT 500`,
    params
  )
  return rows.map(mapRow)
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    const path = url.pathname.replace(/\/$/, '') || '/'

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': 'content-type,x-admin-token',
      })
      res.end()
      return
    }

    if (req.method === 'GET' && path === '/api/blessings/health') {
      await pool.query('SELECT 1')
      send(res, 200, { ok: true, adminConfigured: Boolean(ADMIN_TOKEN) })
      return
    }

    if (req.method === 'GET' && path === '/api/blessings/admin') {
      requireAdmin(req)
      const status = url.searchParams.get('status') || ''
      send(res, 200, { blessings: await listAdminBlessings(status) })
      return
    }

    if (req.method === 'GET' && path === '/api/blessings') {
      send(res, 200, { blessings: await listPublicBlessings() })
      return
    }

    if (req.method === 'POST' && path === '/api/blessings') {
      if (limited(clientIp(req))) {
        send(res, 429, { error: 'Too many blessings from this connection. Please wait a little.' })
        return
      }
      const body = await readBody(req)
      const name = clean(body.name, 60)
      const message = clean(body.message, 400)
      if (!name || !message) {
        send(res, 400, { error: 'Please add your name and a message.' })
        return
      }
      const id = randomUUID()
      const deleteToken = randomBytes(24).toString('hex')
      const { rows } = await pool.query(
        `INSERT INTO blessings (id, name, message, token_hash, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING id, name, message, status, created_at, reviewed_at`,
        [id, name, message, hashToken(deleteToken)]
      )
      send(res, 201, {
        blessing: mapRow(rows[0]),
        deleteToken,
        pending: true,
      })
      return
    }

    const item = path.match(/^\/api\/blessings\/([0-9a-f-]{36})$/i)
    if (item) {
      const id = item[1]

      if (req.method === 'PATCH') {
        requireAdmin(req)
        const body = await readBody(req)
        const status = clean(body.status, 20)
        if (!['approved', 'rejected', 'pending'].includes(status)) {
          send(res, 400, { error: 'Status must be approved, rejected, or pending.' })
          return
        }
        const { rows } = await pool.query(
          `UPDATE blessings
           SET status = $2,
               reviewed_at = CASE WHEN $2 = 'pending' THEN NULL ELSE now() END
           WHERE id = $1
           RETURNING id, name, message, status, created_at, reviewed_at`,
          [id, status]
        )
        if (!rows[0]) {
          send(res, 404, { error: 'Blessing not found.' })
          return
        }
        send(res, 200, { blessing: mapRow(rows[0]) })
        return
      }

      if (req.method === 'DELETE') {
        const body = await readBody(req)
        const adminHeader = req.headers['x-admin-token']
        const asAdmin =
          ADMIN_TOKEN &&
          typeof adminHeader === 'string' &&
          sameToken(adminHeader, ADMIN_TOKEN)

        if (asAdmin) {
          const result = await pool.query('DELETE FROM blessings WHERE id = $1', [id])
          if (!result.rowCount) {
            send(res, 404, { error: 'Blessing not found.' })
            return
          }
          send(res, 200, { ok: true })
          return
        }

        const token = clean(body.token, 80)
        if (!token) {
          send(res, 400, { error: 'Missing delete token.' })
          return
        }
        const { rows } = await pool.query('SELECT token_hash FROM blessings WHERE id = $1', [id])
        if (!rows[0] || !sameHash(rows[0].token_hash, hashToken(token))) {
          send(res, 404, { error: 'That blessing could not be removed.' })
          return
        }
        await pool.query('DELETE FROM blessings WHERE id = $1', [id])
        send(res, 200, { ok: true })
        return
      }
    }

    send(res, 404, { error: 'Not found' })
  } catch (error) {
    const status = error.status || 500
    if (status === 500) console.error(error)
    send(res, status, {
      error:
        status === 401
          ? 'Unauthorized'
          : status === 500
            ? 'The blessings wall is unavailable.'
            : error.message,
    })
  }
})

await ensureSchema()
if (!ADMIN_TOKEN) {
  console.warn('[blessings] ADMIN_TOKEN is not set — admin moderation routes will reject requests')
}
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Blessings API listening on ${PORT}`)
})
