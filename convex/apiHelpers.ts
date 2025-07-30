import { GameItem, ItemStat, ItemProfession } from "./schema";

// Interface for the external API response
export interface APIItemResponse {
  id?: string;
  name: string;
  description?: string;
  itemType?: string;
  category?: string;
  subCategory?: string;
  subType?: string;
  minLevel?: number;
  learnable?: boolean;
  stats?: {
    name: string;
    value: number;
    type?: string;
  }[];
  professions?: {
    name: string;
    level: number;
  }[];
  // Add any other fields that might come from the API
  [key: string]: any;
}

// Transform API response to Convex schema
export function transformAPIItemToConvex(apiItem: APIItemResponse): Omit<GameItem, '_id' | '_creationTime'> {
  return {
    name: apiItem.name,
    description: apiItem.description,
    itemType: apiItem.itemType || 'unknown',
    category: apiItem.category,
    subCategory: apiItem.subCategory,
    subType: apiItem.subType,
    minLevel: apiItem.minLevel || 1,
    learnable: apiItem.learnable || false,
    stats: transformStats(apiItem.stats || []),
    professions: transformProfessions(apiItem.professions || []),
    apiId: apiItem.id,
    lastSynced: Date.now()
  };
}

// Transform stats array
function transformStats(stats: any[]): ItemStat[] {
  return stats.map(stat => ({
    name: stat.name,
    value: typeof stat.value === 'number' ? stat.value : parseFloat(stat.value) || 0,
    type: determineStatType(stat.type, stat.name)
  }));
}

// Transform professions array
function transformProfessions(professions: any[]): ItemProfession[] {
  return professions.map(prof => ({
    name: prof.name,
    level: typeof prof.level === 'number' ? prof.level : parseInt(prof.level) || 1
  }));
}

// Determine stat type based on type field or stat name
function determineStatType(type?: string, name?: string): "core" | "primary" | "general" {
  if (type) {
    switch (type.toLowerCase()) {
      case 'core':
        return 'core';
      case 'primary':
        return 'primary';
      default:
        return 'general';
    }
  }
  
  // Fallback: determine by stat name patterns
  if (name) {
    const coreStats = ['attack', 'defense', 'health', 'mana', 'stamina', 'durability'];
    const primaryStats = ['strength', 'agility', 'intelligence', 'wisdom', 'charisma'];
    
    const lowerName = name.toLowerCase();
    if (coreStats.some(stat => lowerName.includes(stat))) {
      return 'core';
    }
    if (primaryStats.some(stat => lowerName.includes(stat))) {
      return 'primary';
    }
  }
  
  return 'general';
}

// Build query parameters for API requests
export function buildQueryParams(params: {
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
}): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  return queryParams;
}

// Validate API response
export function validateAPIResponse(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check if it's an array of items or has items property
  if (Array.isArray(data)) {
    return data.every(item => validateItem(item));
  }
  
  if (data.items && Array.isArray(data.items)) {
    return data.items.every((item: any) => validateItem(item));
  }
  
  return false;
}

// Validate individual item
function validateItem(item: any): boolean {
  return item && 
         typeof item === 'object' && 
         typeof item.name === 'string' && 
         item.name.trim() !== '';
}

// Extract items from API response
export function extractItemsFromResponse(data: any): APIItemResponse[] {
  if (Array.isArray(data)) {
    return data.filter(validateItem);
  }
  
  if (data.items && Array.isArray(data.items)) {
    return data.items.filter(validateItem);
  }
  
  return [];
}

// Create sample item for testing
export function createSampleItem(): Omit<GameItem, '_id' | '_creationTime'> {
  return {
    name: "Sword of Power",
    description: "A mighty sword with magical properties",
    itemType: "weapon",
    category: "combat",
    subCategory: "sword",
    subType: "magical",
    minLevel: 10,
    learnable: false,
    stats: [
      { name: "attack_power", value: 150, type: "core" },
      { name: "durability", value: 100, type: "core" },
      { name: "magic_resistance", value: 25, type: "primary" },
      { name: "critical_chance", value: 15, type: "general" }
    ],
    professions: [
      { name: "warrior", level: 5 },
      { name: "paladin", level: 3 }
    ],
    apiId: "sword_power_001",
    lastSynced: Date.now()
  };
} 