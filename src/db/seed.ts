import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { relics } from './schema'

config({ path: '.env.local' })

const client = neon(process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  console.log('Fetching relics from Warframe API...')
  
  const res = await fetch('https://api.warframestat.us/items?language=en')
  const data = await res.json()

  const seen = new Set<string>()
  const relicItems = []

  for (const item of data) {
    if (item.type !== 'Relic') continue

    const baseName = item.name
      .replace(/ (Intact|Exceptional|Flawless|Radiant)$/, '')
      .trim()

    if (seen.has(baseName)) continue
    seen.add(baseName)

    const tier = baseName.split(' ')[0]

    relicItems.push({
      name: baseName,
      tier,
      vaulted: item.vaulted ?? false,
      imageUrl: item.imageName
        ? `https://cdn.warframestat.us/img/${item.imageName}`
        : null,
    })
  }

  console.log(`Inserting ${relicItems.length} unique relics...`)

  for (let i = 0; i < relicItems.length; i += 100) {
    const batch = relicItems.slice(i, i + 100)
    await db.insert(relics).values(batch).onConflictDoNothing()
    console.log(`Inserted ${Math.min(i + 100, relicItems.length)}/${relicItems.length}`)
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})