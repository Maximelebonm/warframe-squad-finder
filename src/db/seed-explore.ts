import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { mods, resources } from './schema'

config({ path: '.env.local' })

const client = neon(process.env.DATABASE_URL!)
const db = drizzle(client)

const MOD_TYPES = [
  'Primary Mod', 'Secondary Mod', 'Melee Mod', 'Rifle Mod',
  'Shotgun Mod', 'Pistol Mod', 'Companion Mod', 'Archwing Mod',
  'Arch-Gun Mod', 'Arch-Melee Mod', 'K-Drive Mod', 'Necramech Mod',
  'Railjack Mod', 'Parazon Mod', 'Peculiar Mod', 'Mod Set Mod',
  'Plexus Mod', 'Posture Mod',
]

const RESOURCE_TYPES = [
  'Resource', 'Alloy', 'Gem', 'Cut Gem', 'Fish Part',
  'Orokin', 'Grineer', 'Corpus', 'Infestation', 'Sentient',
  'Neutral', 'Plant', 'Pet Resource', 'Eidolon Shard',
]

async function seed() {
  const res = await fetch('https://api.warframestat.us/items?language=fr')
  const data = await res.json()

  // Mods
  const modItems = []
  const seenMods = new Set<string>()

  for (const item of data) {
    if (!MOD_TYPES.includes(item.type)) continue
    if (!item.name || seenMods.has(item.name)) continue
    seenMods.add(item.name)
    modItems.push({ name: item.name })
  }

  console.log(`Inserting ${modItems.length} mods...`)
  for (let i = 0; i < modItems.length; i += 100) {
    await db.insert(mods).values(modItems.slice(i, i + 100)).onConflictDoNothing()
    console.log(`Mods: ${Math.min(i + 100, modItems.length)}/${modItems.length}`)
  }

  // Ressources
  const resourceItems = []
  const seenResources = new Set<string>()

  for (const item of data) {
    if (!RESOURCE_TYPES.includes(item.type)) continue
    if (!item.name || seenResources.has(item.name)) continue
    seenResources.add(item.name)
    resourceItems.push({
      name: item.name,
      category: item.type,
    })
  }

  console.log(`Inserting ${resourceItems.length} resources...`)
  for (let i = 0; i < resourceItems.length; i += 100) {
    await db.insert(resources).values(resourceItems.slice(i, i + 100)).onConflictDoNothing()
    console.log(`Resources: ${Math.min(i + 100, resourceItems.length)}/${resourceItems.length}`)
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})