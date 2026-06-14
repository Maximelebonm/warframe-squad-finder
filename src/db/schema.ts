import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---- Better Auth tables ----
export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text().primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text().primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text(),
  password: text(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ---- App tables ----
export const profile = pgTable('profile', {
  id: text().primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  warframeAlias: text('warframe_alias').notNull().unique(),
  platform: text().default('pc'), // pc, ps, xbox, switch
  status: text().default('offline'), // offline, online, available
  statusExpiresAt: timestamp('status_expires_at'), 
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const relics = pgTable('relics', {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  tier: text(),                      // Lith, Meso, Neo, Axi
  vaulted: boolean().default(false),
  imageUrl: text('image_url'),
})

export const mods = pgTable('mods', {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
})

export const resources = pgTable('resources', {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  category: text(),                  // Orokin, Grineer, Infested, Corpus...
})

export const listings = pgTable('listings', {
  id: serial().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  category: text().notNull(),        // 'relic' | 'mod' | 'resource' | 'taxi'
  relicId: integer('relic_id').references(() => relics.id),
  modId: integer('mod_id').references(() => mods.id),
  resourceId: integer('resource_id').references(() => resources.id),          // 'have' | 'want'
  quality: text(),                   // intact/exceptional/flawless/radiant (relics only)
  quantity: integer().default(1),
  isActive: boolean('is_active').default(true),
  note: text(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const listingCategories = pgTable('listing_categories', {
  id: serial().primaryKey(),
  name: text().notNull().unique(),   // 'relic', 'mod', 'resource', 'taxi'
  label: text().notNull(),           // 'Reliques', 'Mods', 'Ressources', 'Taxi'
})

export const taxiListings = pgTable('taxi_listings', {
  id: serial().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  steelPath: boolean('steel_path').default(false),
  isAvailable: boolean('is_available').default(false),
  note: text(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Messagerie
export const conversations = pgTable('conversations', {
  id: serial().primaryKey(),
  user1Id: text('user1_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  user2Id: text('user2_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
})

export const messages = pgTable('messages', {
  id: serial().primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
})
// 

// RELATIONS

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile, {
    fields: [user.id],
    references: [profile.id],
  }),
  listings: many(listings),
    conversationsAsUser1: many(conversations, { relationName: 'user1' }),
    conversationsAsUser2: many(conversations, { relationName: 'user2' }),
}))

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.id],
    references: [user.id],
  }),
}))

export const listingsRelations = relations(listings, ({ one }) => ({
  user: one(user, { fields: [listings.userId], references: [user.id] }),
  relic: one(relics, { fields: [listings.relicId], references: [relics.id] }),
  mod: one(mods, { fields: [listings.modId], references: [mods.id] }),
  resource: one(resources, { fields: [listings.resourceId], references: [resources.id] }),
}))

export const relicsRelations = relations(relics, ({ many }) => ({
  listings: many(listings),
}))

export const modsRelations = relations(mods, ({ many }) => ({
  listings: many(listings),
}))

export const resourcesRelations = relations(resources, ({ many }) => ({
  listings: many(listings),
}))

export const taxiListingsRelations = relations(taxiListings, ({ one }) => ({
  user: one(user, { fields: [taxiListings.userId], references: [user.id] }),
}))


export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1: one(user, { fields: [conversations.user1Id], references: [user.id] }),
  user2: one(user, { fields: [conversations.user2Id], references: [user.id] }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(user, { fields: [messages.senderId], references: [user.id] }),
}))