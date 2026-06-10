import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { items } from './schema'

config({ path: '.env.local' })


const client = neon(process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  console.log('Fetching relics from Warframe API...')
  
  const res = await fetch('https://api.warframestat.us/items?language=en')
  const data = await res.json()

  // Filtrer uniquement les reliques uniques (sans la qualité)
  const seen = new Set<string>()
  const relics = []

  for (const item of data) {
    if (item.type !== 'Relic') continue

    // "Axi A1 Intact" → "Axi A1"
    const baseName = item.name
      .replace(/ (Intact|Exceptional|Flawless|Radiant)$/, '')
      .trim()

    if (seen.has(baseName)) continue
    seen.add(baseName)

    // Extraire le tier : "Axi A1" → "Axi"
    const tier = baseName.split(' ')[0] // Lith, Meso, Neo, Axi

    relics.push({
      name: baseName,
      type: 'relic',
      tier,
      vaulted: item.vaulted ?? false,
      imageUrl: item.imageName
        ? `https://cdn.warframestat.us/img/${item.imageName}`
        : null,
    })
  }

  console.log(`Inserting ${relics.length} unique relics...`)

  // Insérer par batch de 100
  for (let i = 0; i < relics.length; i += 100) {
    const batch = relics.slice(i, i + 100)
    await db.insert(items).values(batch).onConflictDoNothing()
    console.log(`Inserted ${Math.min(i + 100, relics.length)}/${relics.length}`)
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})