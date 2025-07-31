import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { GameItem, ItemStat, ItemProfession } from "./schema";

// Interface for API query parameters
export interface ItemsQueryParams {
  category?: string;
  coreStats?: string;
  itemType?: string;
  learnable?: boolean;
  minLevel?: number;
  page?: number;
  per_page?: number;
  primaryStats?: string;
  profession?: string;
  stats?: string;
  subCategory?: string;
  subType?: string;
}

// Query to get items with filtering
export const getItems = query({
  args: {
    category: v.optional(v.string()),
    itemType: v.optional(v.string()),
    learnable: v.optional(v.boolean()),
    minLevel: v.optional(v.number()),
    subCategory: v.optional(v.string()),
    subType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("items").collect();
    
    // Apply filters
    if (args.category) {
      items = items.filter(item => item.category === args.category);
    }
    
    if (args.itemType) {
      items = items.filter(item => item.itemType === args.itemType);
    }
    
    if (args.learnable !== undefined) {
      items = items.filter(item => item.learnable === args.learnable);
    }
    
    if (args.minLevel) {
      items = items.filter(item => item.minLevel >= args.minLevel!);
    }
    
    if (args.subCategory) {
      items = items.filter(item => item.subCategory === args.subCategory);
    }
    
    if (args.subType) {
      items = items.filter(item => item.subType === args.subType);
    }
    
    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    
    return items.slice(offset, offset + limit);
  }
});

// Query to get items by stats
export const getItemsByStats = query({
  args: {
    statName: v.optional(v.string()),
    statType: v.optional(v.union(v.literal("core"), v.literal("primary"), v.literal("general"))),
    minValue: v.optional(v.number()),
    category: v.optional(v.string()),
    itemType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("items").collect();
    
    // Filter by stats
    items = items.filter(item => {
      const stats = item.stats.filter((stat: ItemStat) => {
        if (args.statName && stat.name !== args.statName) return false;
        if (args.statType && stat.type !== args.statType) return false;
        if (args.minValue && stat.value < args.minValue) return false;
        return true;
      });
      
      return stats.length > 0;
    });
    
    // Apply additional filters
    if (args.category) {
      items = items.filter(item => item.category === args.category);
    }
    
    if (args.itemType) {
      items = items.filter(item => item.itemType === args.itemType);
    }
    
    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    
    return items.slice(offset, offset + limit);
  }
});

// Query to get items by profession
export const getItemsByProfession = query({
  args: {
    profession: v.optional(v.string()),
    maxLevel: v.optional(v.number()),
    category: v.optional(v.string()),
    itemType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("items").collect();
    
    // Filter by profession
    items = items.filter(item => {
      const professions = item.professions.filter((prof: ItemProfession) => {
        if (args.profession && prof.name !== args.profession) return false;
        if (args.maxLevel && prof.level > args.maxLevel) return false;
        return true;
      });
      
      return professions.length > 0;
    });
    
    // Apply additional filters
    if (args.category) {
      items = items.filter(item => item.category === args.category);
    }
    
    if (args.itemType) {
      items = items.filter(item => item.itemType === args.itemType);
    }
    
    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    
    return items.slice(offset, offset + limit);
  }
});

// Query to get cached API response
export const getCachedAPIResponse = query({
  args: {
    endpoint: v.string(),
    params: v.string()
  },
  handler: async (ctx, args) => {
    const cacheEntry = await ctx.db
      .query("apiCache")
      .withIndex("by_endpoint_params", (q) => 
        q.eq("endpoint", args.endpoint).eq("params", args.params)
      )
      .first();
    
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
    
    return null;
  }
});

// Mutation to add a new item
export const addItem = mutation({
  args: {
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
    apiId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      ...args,
      lastSynced: Date.now()
    });
  }
});

// Mutation to update an item
export const updateItem = mutation({
  args: {
    id: v.id("items"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    itemType: v.optional(v.string()),
    category: v.optional(v.string()),
    subCategory: v.optional(v.string()),
    subType: v.optional(v.string()),
    minLevel: v.optional(v.number()),
    learnable: v.optional(v.boolean()),
    stats: v.optional(v.array(v.object({
      name: v.string(),
      value: v.number(),
      type: v.union(v.literal("core"), v.literal("primary"), v.literal("general"))
    }))),
    professions: v.optional(v.array(v.object({
      name: v.string(),
      level: v.number()
    })))
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  }
});

// Mutation to delete an item
export const deleteItem = mutation({
  args: {
    id: v.id("items")
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  }
});

// Mutation to sync items from API
export const syncItemsFromAPI = mutation({
  args: {
    items: v.array(v.object({
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
      apiId: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    const itemIds = [];
    
    for (const item of args.items) {
      const id = await ctx.db.insert("items", {
        ...item,
        lastSynced: Date.now()
      });
      itemIds.push(id);
    }
    
    return itemIds;
  }
});

// Mutation to cache API response
export const cacheAPIResponse = mutation({
  args: {
    endpoint: v.string(),
    params: v.string(),
    data: v.any(),
    timestamp: v.number(),
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("apiCache", args);
  }
});

// Action to fetch items from external API
export const fetchItemsFromAPI = action({
  args: {
    params: v.object({
      category: v.optional(v.string()),
      coreStats: v.optional(v.string()),
      itemType: v.optional(v.string()),
      learnable: v.optional(v.boolean()),
      minLevel: v.optional(v.number()),
      page: v.optional(v.number()),
      per_page: v.optional(v.number()),
      primaryStats: v.optional(v.string()),
      profession: v.optional(v.string()),
      stats: v.optional(v.string()),
      subCategory: v.optional(v.string()),
      subType: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    // This would make an HTTP request to the external API
    // For now, return a mock response
    return {
      items: [],
      total: 0,
      page: args.params.page || 1,
      per_page: args.params.per_page || 50
    };
  }
}); 