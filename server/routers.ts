import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getProperties,
  getAllPropertiesAdmin,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyImages,
  addPropertyImage,
  deletePropertyImage,
  createEnquiry,
  getAllEnquiries,
  subscribeEmail,
  getAllEmailSubscriptions,
  getDb,
  getAdminUserByEmail,
  createAdminSession,
  getAdminSession,
  deleteAdminSession,
  updateSessionActivity,
  updateAdminUserLastLogin,
  createContactInquiry,
  getAllContactInquiries,
  getContactInquiriesByStatus,
  updateContactInquiryStatus,
  createPropertyInquiry,
  getAllPropertyInquiries,
  getPropertyInquiriesByPropertyId,
  getPropertyInquiriesByStatus,
  updatePropertyInquiryStatus,
} from "./db";
import {
  verifyPassword,
  generateSessionToken,
  isSessionExpired,
  isSessionTokenExpired,
  calculateSessionExpiration,
} from "./_core/adminAuth";
import { storagePut } from "./storage";
import { sendEmailViaGmail } from "./_core/gmailService";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Admin Authentication ──────────────────────────────────────────────────────
  adminAuth: router({
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
          rememberMe: z.boolean().optional().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { email, password, rememberMe } = input;

        // Find admin user
        const adminUser = await getAdminUserByEmail(email);
        if (!adminUser) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Check if user is active
        if (!adminUser.isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This account has been disabled",
          });
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, adminUser.passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Create session
        const token = generateSessionToken();
        const expiresAt = calculateSessionExpiration(rememberMe);
        await createAdminSession(adminUser.id, token, expiresAt, rememberMe);

        // Update last login
        await updateAdminUserLastLogin(adminUser.id);

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("admin_session", token, {
          ...cookieOptions,
          maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000,
        });

        return {
          success: true,
          email: adminUser.email,
          token,
        };
      }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session;
      if (token) {
        await deleteAdminSession(token);
      }
      ctx.res.clearCookie("admin_session");
      return { success: true } as const;
    }),

    validateSession: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const { token } = input;
        const session = await getAdminSession(token);

        if (!session) {
          return { isValid: false, reason: "Session not found" };
        }

        // Check if token expired
        if (isSessionTokenExpired(session.expiresAt)) {
          await deleteAdminSession(token);
          return { isValid: false, reason: "Session expired" };
        }

        // Check if inactive for 10 minutes
        if (isSessionExpired(session.lastActivityAt)) {
          await deleteAdminSession(token);
          return { isValid: false, reason: "Session inactive" };
        }

        // Update activity
        await updateSessionActivity(token);

        return {
          isValid: true,
          userId: session.userId,
          expiresAt: session.expiresAt,
        };
      }),
  }),

  // ─── Public Property Routes ─────────────────────────────────────────────────
  properties: router({
    list: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          type: z.enum(["house", "apartment", "villa", "penthouse", "land", "commercial"]).optional(),
          bedrooms: z.number().optional(),
          featured: z.boolean().optional(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return getProperties(input ?? {});
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const property = await getPropertyById(input.id);
        if (!property) throw new TRPCError({ code: "NOT_FOUND" });
        const images = await getPropertyImages(input.id);
        return { ...property, images };
      }),

    images: publicProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input }) => {
        return getPropertyImages(input.propertyId);
      }),

    locations: publicProcedure.query(async () => {
      const db = await (await import("./db")).getDb();
      if (!db) return [];
      const { properties: propsTable } = await import("../drizzle/schema");
      const { or, eq } = await import("drizzle-orm");
      const rows = await db
        .selectDistinct({ location: propsTable.location })
        .from(propsTable)
        .where(
          or(
            eq(propsTable.status, "available"),
            eq(propsTable.status, "under_offer"),
            eq(propsTable.status, "sold")
          )
        );
      return rows
        .filter((r) => r.location && r.location.trim())
        .map((r) => r.location!)
        .sort();
    }),

    // Cascading filter: get available locations based on other filters
    availableLocations: publicProcedure
      .input(
        z.object({
          type: z.string().optional(),
          bedrooms: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { properties: propsTable } = await import("../drizzle/schema");
        const { or, eq, gte, lte, and } = await import("drizzle-orm");

        const conditions = [
          or(
            eq(propsTable.status, "available"),
            eq(propsTable.status, "under_offer"),
            eq(propsTable.status, "sold")
          ),
        ];

        if (input.type) conditions.push(eq(propsTable.type, input.type as any));
        if (input.bedrooms && input.bedrooms > 0) conditions.push(gte(propsTable.bedrooms, input.bedrooms));
        if (input.minPrice) conditions.push(gte(propsTable.price, String(input.minPrice)));
        if (input.maxPrice) conditions.push(lte(propsTable.price, String(input.maxPrice)));

        const rows = await db
          .selectDistinct({ location: propsTable.location })
          .from(propsTable)
          .where(and(...conditions));

        return rows
          .filter((r: any) => r.location && r.location.trim())
          .map((r: any) => r.location!)
          .sort();
      }),

    // Cascading filter: get available types based on other filters
    availableTypes: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          bedrooms: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { properties: propsTable } = await import("../drizzle/schema");
        const { or, eq, gte, lte, and, like } = await import("drizzle-orm");

        const conditions = [
          or(
            eq(propsTable.status, "available"),
            eq(propsTable.status, "under_offer"),
            eq(propsTable.status, "sold")
          ),
        ];

        if (input.location) conditions.push(like(propsTable.location, `%${input.location}%`));
        if (input.bedrooms && input.bedrooms > 0) conditions.push(gte(propsTable.bedrooms, input.bedrooms));
        if (input.minPrice) conditions.push(gte(propsTable.price, String(input.minPrice)));
        if (input.maxPrice) conditions.push(lte(propsTable.price, String(input.maxPrice)));

        const rows = await db
          .selectDistinct({ type: propsTable.type })
          .from(propsTable)
          .where(and(...conditions));

        return rows
          .filter((r: any) => r.type && r.type.trim())
          .map((r: any) => r.type!)
          .sort();
      }),

    // Cascading filter: get available bedrooms based on other filters
    availableBedrooms: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          type: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { properties: propsTable } = await import("../drizzle/schema");
        const { or, eq, gte, lte, and, like } = await import("drizzle-orm");

        const conditions = [
          or(
            eq(propsTable.status, "available"),
            eq(propsTable.status, "under_offer"),
            eq(propsTable.status, "sold")
          ),
        ];

        if (input.location) conditions.push(like(propsTable.location, `%${input.location}%`));
        if (input.type) conditions.push(eq(propsTable.type, input.type as any));
        if (input.minPrice) conditions.push(gte(propsTable.price, String(input.minPrice)));
        if (input.maxPrice) conditions.push(lte(propsTable.price, String(input.maxPrice)));

        const rows = await db
          .selectDistinct({ bedrooms: propsTable.bedrooms })
          .from(propsTable)
          .where(and(...conditions));

        return rows
          .map((r: any) => r.bedrooms)
          .filter((b: any) => b !== null && b !== undefined)
          .sort((a: any, b: any) => (a as number) - (b as number));
      }),

    availablePriceRanges: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          type: z.string().optional(),
          bedrooms: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await (await import('./db')).getDb();
        if (!db) return [];
        const { properties: propsTable } = await import('../drizzle/schema');
        const { and, eq, gte, or } = await import('drizzle-orm');

        const conditions: any[] = [
          or(
            eq(propsTable.status, 'available'),
            eq(propsTable.status, 'under_offer'),
            eq(propsTable.status, 'sold')
          ),
        ];

        if (input.location) conditions.push(eq(propsTable.location, input.location));
        if (input.type) conditions.push(eq(propsTable.type as any, input.type));
        if (input.bedrooms && input.bedrooms > 0)
          conditions.push(gte(propsTable.bedrooms, input.bedrooms));

        const rows = await db
          .select({ price: propsTable.price })
          .from(propsTable)
          .where(and(...conditions));

        const prices = rows
          .map((r: any) => r.price)
          .filter((p: any) => p !== null && p !== undefined)
          .sort((a: any, b: any) => (a as number) - (b as number));

        if (prices.length === 0) return [];

        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];

        const priceRanges = [
          { min: undefined, max: undefined, label: 'Any Price' },
          { min: undefined, max: 500000, label: 'Up to £500k' },
          { min: 500000, max: 1000000, label: '£500k – £1M' },
          { min: 1000000, max: 2500000, label: '£1M – £2.5M' },
          { min: 2500000, max: 5000000, label: '£2.5M – £5M' },
          { min: 5000000, max: undefined, label: '£5M+' },
        ];

        return priceRanges
          .map((range, index) => ({
            index,
            ...range,
          }))
          .filter((range, idx) => {
            if (idx === 0) return true;
            const rangeMin = range.min ?? minPrice;
            const rangeMax = range.max ?? maxPrice;
            return rangeMin <= maxPrice && rangeMax >= minPrice;
          });
      }),
  }),

  // ─── Enquiries ──────────────────────────────────────────────────────────────
  enquiries: router({
    submit: publicProcedure
      .input(
        z.object({
          propertyId: z.number().optional(),
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await createEnquiry(input);
        // Return success immediately after saving to database
        // Send email in background without waiting
        const emailBody1 = `New Property Enquiry\n\nFrom: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone ?? "N/A"}\nMessage: ${input.message}`;
        sendEmailViaGmail({
          subject: "New Property Enquiry",
          body: emailBody1,
        }).catch((error) => {
          console.error("[Property Enquiry] Failed to send email:", error);
        });
        return { success: true };
      }),
  }),

  // ─── Admin Routes ───────────────────────────────────────────────────────────
  admin: router({
    listProperties: publicProcedure.query(async () => {
      const props = await getAllPropertiesAdmin();
      const withImages = await Promise.all(
        props.map(async (p) => {
          const images = await getPropertyImages(p.id);
          return { ...p, images };
        })
      );
      return withImages;
    }),

    getProperty: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const property = await getPropertyById(input.id);
        if (!property) throw new TRPCError({ code: "NOT_FOUND" });
        const images = await getPropertyImages(input.id);
        return { ...property, images };
      }),

    createProperty: publicProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          price: z.number().optional(),
          currency: z.enum(["GBP", "USD", "EUR", "AED"]).default("GBP"),
          location: z.string().optional(),
          type: z.enum(["house", "apartment", "villa", "penthouse", "land", "commercial"]).default("house"),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          plotSize: z.string().optional(),
          buildSize: z.string().optional(),
          status: z.enum(["available", "under_offer", "sold", "draft"]).default("available"),
          agentReference: z.string().optional(),
          featured: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await createProperty({
          ...input,
          price: input.price ? String(input.price) : null,
          featured: input.featured ? 1 : 0,
        });
        // Get the last inserted ID
        const { properties: propsTable } = await import("../drizzle/schema");
        const { desc: descOrd } = await import("drizzle-orm");
        const rows = await db.select().from(propsTable).orderBy(descOrd(propsTable.id)).limit(1);
        const newId = rows[0]?.id;
        if (!newId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve new property ID" });
        return { id: newId };
      }),

    updateProperty: publicProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().optional().nullable(),
          currency: z.enum(["GBP", "USD", "EUR", "AED"]).optional(),
          location: z.string().optional(),
          type: z.enum(["house", "apartment", "villa", "penthouse", "land", "commercial"]).optional(),
          bedrooms: z.number().optional().nullable(),
          bathrooms: z.number().optional().nullable(),
          plotSize: z.string().optional(),
          buildSize: z.string().optional(),
          status: z.enum(["available", "under_offer", "sold", "draft"]).optional(),
          agentReference: z.string().optional(),
          featured: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        if (data.price !== undefined) {
          updateData.price = data.price !== null ? String(data.price) : null;
        }
        if (data.featured !== undefined) {
          updateData.featured = data.featured ? 1 : 0;
        }
        await updateProperty(id, updateData as Parameters<typeof updateProperty>[1]);
        return { success: true };
      }),

    deleteProperty: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProperty(input.id);
        return { success: true };
      }),

    uploadImage: publicProcedure
      .input(
        z.object({
          propertyId: z.number(),
          fileName: z.string(),
          mimeType: z.string(),
          base64Data: z.string(),
          displayOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validMimeTypes.includes(input.mimeType)) {
          throw new Error(`Invalid image format: ${input.mimeType}`);
        }

        let buffer: Buffer;
        try {
          buffer = Buffer.from(input.base64Data, "base64");
        } catch (err) {
          throw new Error("Invalid base64 data");
        }

        const maxSize = 10 * 1024 * 1024;
        if (buffer.length > maxSize) {
          throw new Error("Image file too large (max 10MB)");
        }

        if (buffer.length < 1024) {
          throw new Error("Image file appears to be corrupted or too small");
        }

        const validateImageHeader = (buf: Buffer, mimeType: string): boolean => {
          if (mimeType === 'image/jpeg' && buf.length >= 2) {
            return buf[0] === 0xFF && buf[1] === 0xD8;
          }
          if (mimeType === 'image/png' && buf.length >= 8) {
            return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
          }
          if (mimeType === 'image/gif' && buf.length >= 6) {
            return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46;
          }
          if (mimeType === 'image/webp' && buf.length >= 12) {
            return (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
                    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50);
          }
          return true;
        };

        if (!validateImageHeader(buffer, input.mimeType)) {
          throw new Error(`Invalid ${input.mimeType} file: corrupted or wrong format`);
        }

        const key = `properties/${input.propertyId}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await addPropertyImage({
          propertyId: input.propertyId,
          storageKey: key,
          url,
          displayOrder: input.displayOrder,
        });
        return { url, key };
      }),

    deleteImage: publicProcedure
      .input(z.object({ imageId: z.number() }))
      .mutation(async ({ input }) => {
        await deletePropertyImage(input.imageId);
        return { success: true };
      }),

    reorderImages: publicProcedure
      .input(
        z.object({
          updates: z.array(
            z.object({
              imageId: z.number(),
              displayOrder: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { propertyImages } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        for (const update of input.updates) {
          await db
            .update(propertyImages)
            .set({ displayOrder: update.displayOrder })
            .where(eq(propertyImages.id, update.imageId));
        }
        
        return { success: true };
      }),

    listEnquiries: publicProcedure.query(async () => {
      return getAllEnquiries();
    }),



  }),

  emailSubscriptions: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await subscribeEmail(input.email);
        
        // Send confirmation email to user in background without waiting
        const confirmationBody = `Thank you for subscribing to Michael Mackenzie International!\n\nWe're excited to share exclusive luxury property opportunities with you. You'll be among the first to know when we launch.\n\nBest regards,\nMichael Mackenzie International`;
        sendEmailViaGmail({
          subject: "Welcome to Michael Mackenzie International",
          body: confirmationBody,
          recipientEmail: input.email,
        }).catch((error) => {
          console.error("[Email Subscription] Failed to send confirmation email:", error);
        });
        
        // Send owner notification of new subscription
        const ownerNotificationBody = `New Email Subscription\n\nEmail: ${input.email}\n\nSubscribed at: ${new Date().toLocaleString()}`;
        sendEmailViaGmail({
          subject: "New Coming Soon Page Subscription",
          body: ownerNotificationBody,
        }).catch((error) => {
          console.error("[Email Subscription] Failed to send owner notification:", error);
        });
        
        return { success: true };
      }),
  }),

  // ─── Contact Inquiries ──────────────────────────────────────────────────────────
  contact: router({
    submitInquiry: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email"),
          phone: z.string().optional(),
          subject: z.string().min(1, "Subject is required"),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        // Save to database
        const inquiry = await createContactInquiry({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          subject: input.subject,
          message: input.message,
          status: "new",
        });

        // Return success immediately after saving to database
        // Send email in background without waiting
        const emailBody = `New Contact Inquiry\n\nFrom: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone || "N/A"}\nSubject: ${input.subject}\n\nMessage:\n${input.message}`;
        sendEmailViaGmail({
          subject: `New Contact Inquiry: ${input.subject}`,
          body: emailBody,
        }).catch((error) => {
          console.error("[Contact Form] Failed to send email:", error);
        });

        return { success: true };
      }),

    listInquiries: publicProcedure.query(async () => {
      return getAllContactInquiries();
    }),

    getInquiriesByStatus: publicProcedure
      .input(z.object({ status: z.enum(["new", "read", "replied", "archived"]) }))
      .query(async ({ input }) => {
        return getContactInquiriesByStatus(input.status);
      }),

    updateStatus: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "read", "replied", "archived"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateContactInquiryStatus(input.id, input.status);
        return { success: true };
      }),
  }),
  propertyInquiry: router({
    submitInquiry: publicProcedure
      .input(
        z.object({
          propertyId: z.number(),
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email"),
          phone: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const inquiry = await createPropertyInquiry({
          propertyId: input.propertyId,
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          message: input.message || null,
          status: "new",
        });
        // Return success immediately after saving to database
        // Send email in background without waiting
        const emailBody2 = `New Property Inquiry\n\nFrom: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone || "N/A"}\nProperty ID: ${input.propertyId}\n\nMessage:\n${input.message || "No message provided"}`;
        sendEmailViaGmail({
          subject: `New Property Inquiry - Property ${input.propertyId}`,
          body: emailBody2,
        }).catch((error) => {
          console.error("[Property Inquiry] Failed to send email:", error);
        });
        return { success: true };
      }),
    listInquiries: publicProcedure.query(async () => {
      return getAllPropertyInquiries();
    }),
    getByPropertyId: publicProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input }) => {
        return getPropertyInquiriesByPropertyId(input.propertyId);
      }),
    getByStatus: publicProcedure
      .input(z.object({ status: z.enum(["new", "read", "replied", "archived"]) }))
      .query(async ({ input }) => {
        return getPropertyInquiriesByStatus(input.status);
      }),
    updateStatus: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "read", "replied", "archived"]),
        })
      )
      .mutation(async ({ input }) => {
        await updatePropertyInquiryStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
