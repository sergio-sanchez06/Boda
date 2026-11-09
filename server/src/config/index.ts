import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(import.meta.dirname, '../../data')
fs.mkdirSync(dataDir, { recursive: true })

const dbPath = process.env.DB_PATH ?? path.join(dataDir, 'wedding.db')

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')   // mejor concurrencia lectura/escritura
db.pragma('foreign_keys = ON')    // SQLite las desactiva por defecto
db.pragma('busy_timeout = 5000')  // espera hasta 5 s si la BD esta bloqueada

/** Aplica las migraciones pendientes (archivos NNN_nombre.sql) usando PRAGMA user_version. */
function runMigrations(): void {
  const dir = path.join(import.meta.dirname, 'migrations')
  const files = fs.readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort()
  const current = db.pragma('user_version', { simple: true }) as number

  for (const file of files) {
    const version = parseInt(file, 10)
    if (version <= current) continue

    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    db.transaction(() => {
      db.exec(sql)
      db.pragma(`user_version = ${version}`)
    })()
    console.log(`[db] Migracion aplicada: ${file}`)
  }
}

runMigrations()
