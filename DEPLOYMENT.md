# 🚀 Dokploy Deployment Guide - Convex Backend Only

This guide will help you deploy the Game Items API Convex backend to Dokploy.

## 📋 Prerequisites

- Dokploy account and CLI installed
- Docker installed on your system
- Git repository with the Convex backend code

## 🏗️ Project Structure

Your project should have the following structure:

```
game-items-api/
├── convex/
│   ├── schema.ts
│   ├── items.ts
│   └── apiHelpers.ts
├── dokploy.yaml
├── env                    # Environment variables file
└── README.md
```

## 🔧 Configuration Files

### dokploy.yaml
This is your main Dokploy configuration file that defines:
- Convex backend service
- Convex dashboard service
- Environment variables
- Health checks

### Environment Variables
Create an `env` file in your project root with the following variables:

```bash
# Required for Convex instance
INSTANCE_SECRET=your-secret-key-here

# Dokploy deployment URLs (update these with your actual Dokploy URLs)
NEXT_PUBLIC_DEPLOYMENT_URL=http://your-app.dokploy.com:3210
CONVEX_CLOUD_ORIGIN=http://your-app.dokploy.com:3210
CONVEX_SITE_ORIGIN=http://your-app.dokploy.com:6791
```

**Important**: Replace `your-app.dokploy.com` with your actual Dokploy domain.

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Clone or create your repository**:
   ```bash
   git clone <your-repo-url>
   cd game-items-api
   ```

2. **Create your environment file**:
   ```bash
   # Copy the example env file
   cp env.example env
   
   # Edit the env file with your actual values
   nano env
   ```

3. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Add Convex backend for game items API"
   git push origin main
   ```

### Step 2: Deploy to Dokploy

1. **Login to Dokploy**:
   ```bash
   dokploy login
   ```

2. **Deploy your application**:
   ```bash
   dokploy deploy
   ```

3. **Monitor the deployment**:
   ```bash
   dokploy logs
   dokploy status
   ```

### Step 3: Configure Environment Variables in Dokploy Dashboard

1. **Access your Dokploy dashboard**
2. **Navigate to your project settings**
3. **Add the required environment variables**:

   **Required Variables:**
   - `INSTANCE_SECRET`: Generate a secure random string (32+ characters)

   **Optional Variables (for custom domains):**
   - `NEXT_PUBLIC_DEPLOYMENT_URL`: Your custom domain for the backend
   - `CONVEX_CLOUD_ORIGIN`: Your custom domain for the backend
   - `CONVEX_SITE_ORIGIN`: Your custom domain for the dashboard

### Step 4: Access Your Services

Once deployed, you can access:

- **Convex Dashboard**: `https://your-app.dokploy.com:6791`
- **Convex Backend**: `https://your-app.dokploy.com:3210`

**Note**: If you've configured custom domains in Dokploy, use those URLs instead.

## 🔍 Monitoring and Debugging

### Check Service Status
```bash
dokploy ps
```

### View Logs
```bash
# All services
dokploy logs

# Specific service
dokploy logs convex-backend
dokploy logs convex-dashboard
```

### Health Checks
The services include health checks:
- Convex backend: `curl -f http://localhost:3210/version`

## 🛠️ Troubleshooting

### Common Issues

1. **Convex Backend Not Starting**:
   - Check if `INSTANCE_SECRET` is set in Dokploy dashboard
   - Verify port 3210 is available
   - Check logs: `dokploy logs convex-backend`

2. **Dashboard Not Accessible**:
   - Verify convex-backend is healthy
   - Check dashboard logs: `dokploy logs convex-dashboard`
   - Ensure `NEXT_PUBLIC_DEPLOYMENT_URL` is correctly set

3. **Environment Variables Not Working**:
   - Verify all variables are set in Dokploy dashboard
   - Check that variable names match exactly (case-sensitive)
   - Restart services after changing environment variables

### Debug Commands

```bash
# Check service health
dokploy ps

# View detailed logs
dokploy logs --follow

# Access service shell (if needed)
dokploy exec convex-backend sh

# Restart services
dokploy restart convex-backend
dokploy restart convex-dashboard
```

## 🔄 Updates and Maintenance

### Updating Your Backend

1. **Make your changes to the convex/ folder**
2. **Update environment variables if needed**
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update Convex functions"
   git push origin main
   ```

4. **Redeploy**:
   ```bash
   dokploy deploy
   ```

## 📊 Performance Monitoring

### Key Metrics to Monitor

1. **Response Times**: Monitor API response times
2. **Error Rates**: Check for failed requests
3. **Resource Usage**: CPU and memory usage
4. **Convex Performance**: Query execution times

### Monitoring Tools

- **Dokploy Dashboard**: Built-in monitoring
- **Convex Dashboard**: Access at port 6791
- **Application Logs**: Real-time log streaming

## 🔒 Security Considerations

1. **Environment Variables**: Keep secrets secure in Dokploy dashboard
2. **Network Security**: Services communicate internally
3. **Health Checks**: Prevent unhealthy deployments
4. **Resource Limits**: Set appropriate CPU/memory limits

## 📚 Additional Resources

- [Dokploy Documentation](https://docs.dokploy.com)
- [Convex Documentation](https://docs.convex.dev)

## 🆘 Support

If you encounter issues:

1. **Check the logs first**: `dokploy logs`
2. **Review this guide** for common solutions
3. **Contact Dokploy support** if needed
4. **Check Convex documentation** for API-specific issues

---

## 🎯 Quick Start Checklist

- [ ] Repository prepared with convex/ folder
- [ ] Environment file created with correct URLs
- [ ] Dokploy CLI installed and logged in
- [ ] Environment variables configured in Dokploy dashboard
- [ ] Initial deployment completed
- [ ] Services healthy and accessible
- [ ] Convex dashboard accessible
- [ ] Functions tested and working

Your Convex backend for the Game Items API is now ready to use on Dokploy! 🎉 