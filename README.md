# Game Items API - Convex Backend

This project provides a Convex backend integration for the [Ashes Codex API](https://api.ashescodex.com/items) with caching, filtering, and real-time capabilities.

## Features

- **API Integration**: Direct integration with the external game items API
- **Caching System**: Intelligent caching to reduce API calls
- **Real-time Queries**: Live data updates with Convex subscriptions
- **Flexible Filtering**: Support for all API query parameters
- **Type Safety**: Full TypeScript support with proper interfaces
- **Performance Optimized**: Indexed queries for fast data retrieval
- **Dokploy Deployment**: Ready for production deployment with environment configuration

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Convex CLI installed: `npm install -g convex`
- Dokploy account and CLI (for deployment)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd game-items-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example env
   # Edit env file with your configuration
   ```

4. **Start Convex development server**:
   ```bash
   npm run dev
   # or
   npx convex dev
   ```

### Deployment to Dokploy
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Parameters Supported

All query parameters from the original API are supported:
- `category` - Item category classification
- `coreStats` - Core statistics for the item
- `itemType` - Type of item (weapon, armor, consumable, etc.)
- `learnable` - Whether the item can be learned/taught
- `minLevel` - Minimum level requirement
- `page` - Pagination parameter
- `per_page` - Items per page
- `primaryStats` - Primary statistics
- `profession` - Profession requirement
- `stats` - General statistics
- `subCategory` - Sub-category classification
- `subType` - Sub-type classification

## Database Schema

### Tables

1. **`items`** - Main items table with all game item data
2. **`apiCache`** - Caching table for API responses

### Indexes

The schema includes optimized indexes for common query patterns:
- `by_item_type` - Filter by item type
- `by_category` - Filter by category
- `by_min_level` - Filter by minimum level
- `by_learnable` - Filter by learnable status
- `by_api_id` - Lookup by external API ID
- `by_category_item_type` - Combined category and item type queries
- `by_min_level_item_type` - Combined level and item type queries
- `by_learnable_category` - Combined learnable and category queries

## Convex Functions

### Queries

#### `getItems` - Get items with filtering
```typescript
const items = await convex.query(api.items.getItems, {
  itemType: "weapon",
  minLevel: 10,
  limit: 20
});
```

#### `getItemsByStats` - Get items by statistics
```typescript
const highAttackItems = await convex.query(api.items.getItemsByStats, {
  statName: "attack_power",
  statType: "core",
  minValue: 100
});
```

#### `getItemsByProfession` - Get items by profession
```typescript
const warriorItems = await convex.query(api.items.getItemsByProfession, {
  profession: "warrior",
  maxLevel: 5
});
```

#### `getCachedAPIResponse` - Get cached API response
```typescript
const cached = await convex.query(api.items.getCachedAPIResponse, {
  endpoint: "https://api.ashescodex.com/items",
  params: JSON.stringify({ page: 1, per_page: 10 })
});
```

### Actions

#### `fetchItemsFromAPI` - Fetch from external API
```typescript
const data = await convex.action(api.items.fetchItemsFromAPI, {
  params: {
    category: "combat",
    itemType: "weapon",
    page: 1,
    per_page: 50
  }
});
```

### Mutations

#### `addItem` - Add new item
```typescript
const itemId = await convex.mutation(api.items.addItem, {
  name: "Sword of Power",
  description: "A mighty sword",
  itemType: "weapon",
  category: "combat",
  minLevel: 10,
  learnable: false,
  stats: [
    { name: "attack_power", value: 150, type: "core" },
    { name: "durability", value: 100, type: "core" }
  ],
  professions: [
    { name: "warrior", level: 5 }
  ]
});
```

#### `updateItem` - Update existing item
```typescript
await convex.mutation(api.items.updateItem, {
  id: itemId,
  name: "Updated Sword Name",
  minLevel: 15
});
```

#### `deleteItem` - Delete item
```typescript
await convex.mutation(api.items.deleteItem, { id: itemId });
```

#### `syncItemsFromAPI` - Sync items from API
```typescript
const syncedIds = await convex.mutation(api.items.syncItemsFromAPI, {
  items: transformedItems
});
```

#### `cacheAPIResponse` - Cache API response
```typescript
await convex.mutation(api.items.cacheAPIResponse, {
  endpoint: "https://api.ashescodex.com/items",
  params: JSON.stringify(params),
  data: responseData,
  timestamp: Date.now(),
  expiresAt: Date.now() + 300000 // 5 minutes
});
```

## Usage

### Self-Hosted Setup

1. **Start the Convex services**:
```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

2. **Access the dashboard**:
   - Open http://localhost:6791 in your browser
   - Navigate to the "Functions" tab
   - Upload your `convex/` folder

3. **Test the functions**:
   - Use the dashboard to test API calls
   - Monitor logs and performance
   - Check cache hit rates

### Cloud Setup (Alternative)

1. Install Convex CLI:
```bash
npm install -g convex
```

2. Initialize your Convex project:
```bash
npx convex dev
```

3. Deploy the schema and functions:
```bash
npx convex deploy
```

## Caching Strategy

The system implements a smart caching strategy:

1. **API Response Caching**: External API responses are cached for 5 minutes
2. **Automatic Cache Invalidation**: Old cache entries are automatically removed
3. **Cache Lookup**: Queries first check cache before making API calls
4. **Fallback to API**: If cache is expired or missing, fresh API calls are made

## Performance Features

- **Indexed Queries**: All common filter combinations are indexed
- **Pagination Support**: Built-in pagination for large datasets
- **Efficient Filtering**: Server-side filtering reduces data transfer
- **Real-time Updates**: Live data updates with minimal latency

## Error Handling

The system includes comprehensive error handling:

- **API Failures**: Graceful handling of external API errors
- **Validation**: Input validation for all mutations
- **Type Safety**: TypeScript ensures data consistency
- **Fallback Strategies**: Cache fallbacks when API is unavailable

## Development

### Local Development
```bash
# Start Convex dev server
npm run dev

# Test functions in the dashboard
# Navigate to http://localhost:8000
```

### Testing
```typescript
// Test API integration
const testAPI = async () => {
  const result = await convex.action(api.items.fetchItemsFromAPI, {
    params: { page: 1, per_page: 10 }
  });
  console.log("API Test Result:", result);
};
```

### Monitoring

#### Self-Hosted Monitoring
- **Dashboard**: Access http://localhost:6791 for the Convex dashboard
- **Logs**: Check `docker-compose logs backend` for backend logs
- **Health**: Monitor service health with `docker-compose ps`
- **API Testing**: Use the dashboard's "Functions" tab to test API calls

#### Cloud Monitoring
- Use the Convex dashboard to monitor queries and performance
- Check the logs for API integration issues
- Monitor cache hit rates for optimization

## Environment Configuration

### Environment Variables

The project uses environment variables for configuration. Create an `env` file based on `env.example`:

```bash
# Copy the example file
cp env.example env

# Edit with your actual values
nano env
```

### Required Variables

- `INSTANCE_SECRET` - Secure random string for Convex instance (set in Dokploy dashboard)

### Optional Variables (for custom domains)

- `NEXT_PUBLIC_DEPLOYMENT_URL` - Custom domain for backend access
- `CONVEX_CLOUD_ORIGIN` - Custom domain for backend API  
- `CONVEX_SITE_ORIGIN` - Custom domain for dashboard

## Deployment

### Local Development
```bash
npm run dev
```

### Dokploy Deployment
1. **Deploy to Dokploy**:
```bash
dokploy login
dokploy deploy
```

2. **Configure Environment Variables** in Dokploy dashboard:
   - Set `INSTANCE_SECRET` (required)
   - Configure custom domains (optional)

3. **Monitor Deployment**:
```bash
dokploy logs
dokploy status
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling for new functions
3. Update indexes when adding new query patterns
4. Test API integration thoroughly

## License

This project is licensed under the MIT License. 
