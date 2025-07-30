import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { GameItem, ItemStat, ItemProfession } from "./schema";

// Types for API parameters
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

// Action to fetch items from external API
export const fetchItemsFromAPI = action({
  args: {
    params: v.optional(v.object({
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
    }))
  },
  handler: async (ctx, args) => {
    const baseUrl = "https://api.ashescodex.com/items";
    const params = args.params || {};
    
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response
      await ctx.runMutation(api.items.cacheAPIResponse, {
        endpoint: baseUrl,
        params: JSON.stringify(params),
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes cache
      });
      
      return data;
    } catch (error) {
      console.error("Error fetching from API:", error);
      throw error;
    }
  }
});

// Mutation to cache API responses
export const cacheAPIResponse = mutation({
  args: {
    endpoint: v.string(),
    params: v.string(),
    data: v.any(),
    timestamp: v.number(),
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    // Remove old cache entries
    const oldCache = await ctx.db
      .query("apiCache")
      .withIndex("by_endpoint_params", (q) => 
        q.eq("endpoint", args.endpoint).eq("params", args.params)
      )
      .collect();
    
    for (const cache of oldCache) {
      await ctx.db.delete(cache._id);
    }
    
    // Insert new cache entry
    await ctx.db.insert("apiCache", {
      endpoint: args.endpoint,
      params: args.params,
      data: args.data,
      timestamp: args.timestamp,
      expiresAt: args.expiresAt
    });
  }
});

// Query to get cached API response
export const getCachedAPIResponse = query({
  args: {
    endpoint: v.string(),
    params: v.string()
  },
  handler: async (ctx, args) => {
    const cache = await ctx.db
      .query("apiCache")
      .withIndex("by_endpoint_params", (q) => 
        q.eq("endpoint", args.endpoint).eq("params", args.params)
      )
      .first();
    
    if (cache && cache.expiresAt > Date.now()) {
      return cache.data;
    }
    
    return null;
  }
});

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
    let itemsQuery = ctx.db.query("items");
    
    // Apply filters
    if (args.category) {
      itemsQuery = itemsQuery.withIndex("by_category", (q) => q.eq("category", args.category));
    }
    
    if (args.itemType) {
      itemsQuery = itemsQuery.withIndex("by_item_type", (q) => q.eq("itemType", args.itemType));
    }
    
    if (args.learnable !== undefined) {
      itemsQuery = itemsQuery.withIndex("by_learnable", (q) => q.eq("learnable", args.learnable));
    }
    
    if (args.minLevel) {
      itemsQuery = itemsQuery.withIndex("by_min_level", (q) => q.gte("minLevel", args.minLevel));
    }
    
    // Collect and apply additional filters
    let items = await itemsQuery.collect();
    
    // Apply additional filters that don't have indexes
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
      const stats = item.stats.filter(stat => {
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
      const professions = item.professions.filter(prof => {
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
    const syncedItems = [];
    
    for (const itemData of args.items) {
      // Check if item already exists
      const existingItem = await ctx.db
        .query("items")
        .withIndex("by_api_id", (q) => q.eq("apiId", itemData.apiId))
        .first();
      
      if (existingItem) {
        // Update existing item
        await ctx.db.patch(existingItem._id, {
          ...itemData,
          lastSynced: Date.now()
        });
        syncedItems.push(existingItem._id);
      } else {
        // Insert new item
        const itemId = await ctx.db.insert("items", {
          ...itemData,
          lastSynced: Date.now()
        });
        syncedItems.push(itemId);
      }
    }
    
    return syncedItems;
  }
});

// Mutation to add a single item
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
    await ctx.db.patch(id, updates);
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