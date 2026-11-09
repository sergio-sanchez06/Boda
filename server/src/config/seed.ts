import { db } from './index.js'
import { generateCode } from './code.js'

const menus = [
  { name: 'Carne',       description: 'Menú con plato principal de carne',     child: 0 },
  { name: 'Pescado',     description: 'Menú con plato principal de pescado',   child: 0 },
  { name: 'Vegetariano', description: 'Sin carne ni pescado',                  child: 0 },
  { name: 'Vegano',      description: 'Sin productos de origen animal',        child: 0 },
  { name: 'Infantil',    description: 'Menú adaptado para niños',              child: 1 },
]

// Los 14 alérgenos de declaración obligatoria en la UE
const allergens = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Lácteos',
  'Frutos de cáscara', 'Apio', 'Mostaza', 'Sésamo', 'Dióxido de azufre y sulfitos',
  'Altramuces', 'Moluscos',
]

const insertMenu = db.prepare(
  'INSERT OR IGNORE INTO menu_options (name, description, is_child_menu, sort_order) VALUES (?, ?, ?, ?)',
)
const insertAllergen = db.prepare('INSERT OR IGNORE INTO allergens (name, sort_order) VALUES (?, ?)')
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')

db.transaction(() => {
  menus.forEach((m, i) => insertMenu.run(m.name, m.description, m.child, i))
  allergens.forEach((a, i) => insertAllergen.run(a, i))
  insertSetting.run('rsvp_deadline', '2027-05-01')   // cambiar por la fecha real
})()

// Datos de ejemplo solo si se ejecuta: npm run db:seed -- --demo
if (process.argv.includes('--demo')) {
  const code = generateCode()
  const inv = db
    .prepare('INSERT INTO invitations (code, display_name, max_guests) VALUES (?, ?, ?)')
    .run(code, 'Familia García', 3)
  db.prepare('INSERT INTO guests (invitation_id, full_name) VALUES (?, ?)').run(inv.lastInsertRowid, 'Ana García')
  console.log(`[seed] Invitacion de prueba creada: /i/${code}`)
}

console.log('[seed] Datos base cargados')
