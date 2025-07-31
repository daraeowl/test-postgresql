import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define interfaces for type safety
export interface GameItem {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string;
  itemType: string;
  category?: string;
  subCategory?: string;
  subType?: string;
  minLevel: number;
  learnable: boolean;
  stats: ItemStat[];
  professions: ItemProfession[];
  apiId?: string; // Reference to external API ID
  lastSynced?: number; // Timestamp of last API sync
}

export interface ItemStat {
  name: string;
  value: number;
  type: "core" | "primary" | "general";
}

export interface ItemProfession {
  name: string;
  level: number;
}

// Define the schema
export default defineSchema({
  items: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    itemType: v.string(),
    category: v.optional(v.string()),
    subCategory: v.optional(v.string()),
    subType: v.optional(v.string()),
    minLevel: v.number(),
    learnable: v.boolean(),
    stats: v.array(v.object({
      name: v.string(),
      value: v.number(),
      type: v.union(v.literal("core"), v.literal("primary"), v.literal("general"))
    })),
    professions: v.array(v.object({
      name: v.string(),
      level: v.number()
    })),
    apiId: v.optional(v.string()),
    lastSynced: v.optional(v.number()) // Timestamp of last API sync
  })
  .index("by_item_type", ["itemType"])
  .index("by_category", ["category"])
  .index("by_min_level", ["minLevel"])
  .index("by_learnable", ["learnable"])
  .index("by_api_id", ["apiId"])
  .index("by_category_item_type", ["category", "itemType"])
  .index("by_min_level_item_type", ["minLevel", "itemType"])
  .index("by_learnable_category", ["learnable", "category"]),

  // Cache for API responses
  apiCache: defineTable({
    endpoint: v.string(),
    params: v.string(), // JSON stringified query parameters
    data: v.any(),
    timestamp: v.number(),
    expiresAt: v.number()
  })
  .index("by_endpoint_params", ["endpoint", "params"])
  .index("by_expires_at", ["expiresAt"])
}); 