import { and, asc, desc, eq, gte, lte, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  properties,
  propertyImages,
  enquiries,
  emailSubscriptions,
  adminUsers,
  adminSessions,
  contactInquiries,
  InsertProperty,
  InsertPropertyImage,
  InsertEnquiry,
  InsertEmailSubscription,
  InsertAdminUser,
  InsertAdminSession,
  InsertContactInquiry,
  propertyInquiries,
  InsertPropertyInquiry,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Properties ───────────────────────────────────────────────────────────────

export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  bedrooms?: number;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function getProperties(filters: PropertyFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters.status) {
    conditions.push(eq(properties.status, filters.status as "available" | "under_offer" | "sold" | "draft"));
  } else {
    // Public: only show non-draft by default
    conditions.push(
      or(
        eq(properties.status, "available"),
        eq(properties.status, "under_offer"),
        eq(properties.status, "sold")
      )!
    );
  }

  if (filters.location) {
    conditions.push(like(properties.location, `%${filters.location}%`));
  }
  if (filters.type) {
    conditions.push(eq(properties.type, filters.type as "house" | "apartment" | "villa" | "penthouse" | "land" | "commercial"));
  }
  if (filters.bedrooms) {
    conditions.push(gte(properties.bedrooms, filters.bedrooms));
  }
  if (filters.minPrice) {
    conditions.push(gte(properties.price, String(filters.minPrice)));
  }
  if (filters.maxPrice) {
    conditions.push(lte(properties.price, String(filters.maxPrice)));
  }
  if (filters.featured) {
    conditions.push(eq(properties.featured, 1));
  }

  const rows = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  // Fetch cover image for each property
  const propertiesWithImages = await Promise.all(
    rows.map(async (prop) => {
      const images = await getPropertyImages(prop.id);
      return {
        ...prop,
        coverImage: images[0]?.url ?? null,
      };
    })
  );

  return propertiesWithImages;
}

export async function getAllPropertiesAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(properties).values(data);
  return result[0];
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(properties).set(data).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete images first
  await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));
  await db.delete(properties).where(eq(properties.id, id));
}

// ─── Property Images ──────────────────────────────────────────────────────────

export async function getPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(asc(propertyImages.displayOrder));
}

export async function addPropertyImage(data: InsertPropertyImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(propertyImages).values(data);
}

export async function deletePropertyImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(propertyImages).where(eq(propertyImages.id, id)).limit(1);
  await db.delete(propertyImages).where(eq(propertyImages.id, id));
  return rows[0];
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function createEnquiry(data: InsertEnquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(enquiries).values(data);
}

export async function getAllEnquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
}

// ─── Email Subscriptions ──────────────────────────────────────────────────────

export async function subscribeEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already subscribed to email_subscriptions
  const existing = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email)).limit(1);
  
  // Always save to enquiries table for tracking (even if already subscribed)
  try {
    await db.insert(enquiries).values({
      name: "Coming Soon Subscriber",
      email: email,
      message: "Subscribed to coming soon page",
    });
    console.log("[subscribeEmail] Saved to enquiries:", email);
  } catch (error) {
    console.error("[subscribeEmail] Error saving to enquiries:", error);
  }
  
  // Only insert to email_subscriptions if new
  if (existing.length === 0) {
    try {
      await db.insert(emailSubscriptions).values({ email });
      console.log("[subscribeEmail] Saved to email_subscriptions:", email);
    } catch (error) {
      console.error("[subscribeEmail] Error saving to email_subscriptions:", error);
    }
  }
  
  return { email, subscribedAt: new Date() };
}

export async function getAllEmailSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscriptions).orderBy(desc(emailSubscriptions.subscribedAt));
}

// ─── Admin Authentication ──────────────────────────────────────────────────────

export async function getAdminUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createAdminSession(
  userId: number,
  token: string,
  expiresAt: Date,
  rememberMe: boolean = false
) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const session: InsertAdminSession = {
    userId,
    token,
    expiresAt,
    rememberMe,
  };
  
  await db.insert(adminSessions).values(session);
  return session;
}

export async function getAdminSession(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSessionActivity(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminSessions).set({ lastActivityAt: new Date() }).where(eq(adminSessions.token, token));
}

export async function deleteAdminSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function addAdminUser(email: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const user: InsertAdminUser = {
    email,
    passwordHash,
    isActive: true,
  };
  
  const result = await db.insert(adminUsers).values(user);
  // Get the inserted user
  const inserted = await getAdminUserByEmail(email);
  return inserted || { email, isActive: true };
}

export async function updateAdminUserLastLogin(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, userId));
}

// ─── Contact Inquiries ────────────────────────────────────────────────────────

export async function createContactInquiry(data: InsertContactInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactInquiries).values(data);
  return result[0];
}

export async function getAllContactInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
}

export async function getContactInquiriesByStatus(status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactInquiries).where(eq(contactInquiries.status, status)).orderBy(desc(contactInquiries.createdAt));
}

export async function updateContactInquiryStatus(id: number, status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) return;
  await db.update(contactInquiries).set({ status }).where(eq(contactInquiries.id, id));
}

// ─── Property Inquiries ───────────────────────────────────────────────────────

export async function createPropertyInquiry(data: InsertPropertyInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(propertyInquiries).values(data);
  return result[0];
}

export async function getAllPropertyInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyInquiries).orderBy(desc(propertyInquiries.createdAt));
}

export async function getPropertyInquiriesByPropertyId(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyInquiries).where(eq(propertyInquiries.propertyId, propertyId)).orderBy(desc(propertyInquiries.createdAt));
}

export async function getPropertyInquiriesByStatus(status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyInquiries).where(eq(propertyInquiries.status, status)).orderBy(desc(propertyInquiries.createdAt));
}

export async function updatePropertyInquiryStatus(id: number, status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) return;
  await db.update(propertyInquiries).set({ status }).where(eq(propertyInquiries.id, id));
}
