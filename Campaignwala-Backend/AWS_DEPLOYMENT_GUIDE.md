# AWS Elastic Beanstalk Deployment Guide

## Changes Made for AWS EB Deployment

### 1. **Node.js Version Configuration**
- Updated `package.json` to require Node.js >= 20.x (required by `resend` package)
- Created `.nvmrc` file with Node 20
- Added EB configuration to use Node.js 20.x

### 2. **Elastic Beanstalk Configuration Files**
Created `.ebextensions/` directory with the following configs:

- **01_environment.config**: Sets NODE_ENV, PORT, and Node.js version
- **02_healthcheck.config**: Configures health check endpoint
- **03_nginx.config**: Configures nginx proxy settings
- **04_logs.config**: Enables CloudWatch logs
- **05_package_install.config**: Removes package-lock.json and installs dependencies
- **06_healthcheck_fix.config**: Enhanced health check configuration

### 3. **Application Improvements**
- Enhanced database connection with better error handling
- Added `/health` endpoint for AWS health checks
- Improved `/api/status` endpoint with database status
- Added graceful shutdown handling
- Better error handling for server startup

## Health Check Endpoints

AWS EB will check these endpoints:
- `/health` - Simple health check (returns 200 OK)
- `/api/status` - Detailed status with database connection info

## Environment Variables Required in AWS EB

Make sure these are set in your EB environment configuration:

1. **MONGODB_URI** - Your MongoDB connection string
2. **NODE_ENV** - Set to `production` (or let EB set it)
3. **PORT** - Will be set automatically by EB (default: 8080)
4. **JWT_SECRET** - Your JWT secret key
5. **FRONTEND_URL** - Your frontend URL for CORS
6. Any other environment variables your app needs

## Deployment Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix AWS EB deployment configuration"
   git push
   ```

2. **In AWS Elastic Beanstalk Console:**
   - Go to your environment
   - Click "Upload and Deploy"
   - Or use EB CLI: `eb deploy`

3. **Verify Environment Variables:**
   - Go to Configuration → Software → Environment properties
   - Ensure all required variables are set

4. **Check Health:**
   - Monitor the environment health in the EB dashboard
   - Check CloudWatch logs if issues persist

## Troubleshooting

### If deployment still fails:

1. **Check CloudWatch Logs:**
   - Go to AWS Console → CloudWatch → Log groups
   - Look for `/aws/elasticbeanstalk/[your-env-name]/var/log/nodejs/nodejs.log`

2. **Verify Node.js Version:**
   - EB should use Node.js 20.x automatically
   - Check in Configuration → Software → Node.js version

3. **Check Health Check:**
   - Ensure `/health` endpoint returns 200 OK
   - Test manually: `curl http://your-eb-url/health`

4. **Database Connection:**
   - Verify MONGODB_URI is correct
   - Check if MongoDB allows connections from AWS IPs
   - Check security group/firewall settings

5. **Port Configuration:**
   - EB automatically sets PORT environment variable
   - App listens on 0.0.0.0:PORT (correct for EB)

## Common Issues

### Issue: "None of the instances are sending data"
- **Solution**: Check if the app is starting correctly. Look at logs for startup errors.
- Verify health check endpoint is accessible
- Check if database connection is blocking startup

### Issue: "Application update failed"
- **Solution**: Check CloudWatch logs for specific error messages
- Verify all environment variables are set
- Ensure Node.js version is compatible (20.x)

### Issue: "Health check failed"
- **Solution**: Verify `/health` endpoint is working
- Check if app is listening on correct port
- Verify nginx proxy configuration

## Notes

- The app will start even if database connection fails initially (non-blocking)
- Health check endpoint doesn't require database connection
- All logs are sent to CloudWatch for debugging
- Package-lock.json is removed during deployment to avoid conflicts

