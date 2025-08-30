# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **MongoDB**: 6.0 or higher
- **Git**: Latest version
- **PM2** (for production): `npm install -g pm2`

### Server Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ available space
- **Network**: Stable internet connection

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ibs_v5
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd data-services
npm install
cd ..
```

### 3. Environment Variables
Create `.env` files in appropriate directories:

**Backend** (`data-services/.env`):
```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/ibs_v5
JWT_SECRET=your-secure-jwt-secret-256-bit
PORT=3001
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=AirOps
```

## Database Setup

### 1. MongoDB Installation

**Ubuntu/Debian**:
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**CentOS/RHEL**:
```bash
# Create repo file
sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# Install MongoDB
sudo yum install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Database Configuration
```bash
# Access MongoDB shell
mongosh

# Create database and user
use ibs_v5
db.createUser({
  user: "ibs_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "ibs_v5" }
  ]
})

# Exit MongoDB shell
exit
```

### 3. Seed Database
```bash
cd data-services
npm run seed
```

## Frontend Deployment

### 1. Build Application
```bash
# Build for production
npm run build

# Verify build
npm start
```

### 2. Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Deploy to Netlify
```bash
# Build and deploy
npm run build
# Upload .next folder to Netlify
```

### 4. Manual Server Deployment
```bash
# Build application
npm run build

# Copy files to server
scp -r .next user@server:/var/www/ibs-frontend/
scp -r public user@server:/var/www/ibs-frontend/
scp package.json user@server:/var/www/ibs-frontend/

# On server
cd /var/www/ibs-frontend
npm install --production
npm start
```

## Backend Deployment

### 1. PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ibs-backend',
    script: 'index.js',
    cwd: '/var/www/ibs-backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF
```

### 2. Deploy Backend
```bash
# Copy backend files
scp -r data-services/* user@server:/var/www/ibs-backend/

# On server
cd /var/www/ibs-backend
npm install --production

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/ibs
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ibs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Production Configuration

### 1. Security Hardening
```bash
# Install security packages
sudo apt-get install -y fail2ban ufw

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Environment Optimization
```bash
# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=4096"

# MongoDB optimization
sudo tee /etc/mongod.conf << EOF
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF

sudo systemctl restart mongod
```

## Monitoring & Maintenance

### 1. PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs ibs-backend

# Restart application
pm2 restart ibs-backend

# Update application
pm2 reload ibs-backend
```

### 2. System Monitoring
```bash
# Install monitoring tools
sudo apt-get install -y htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs
```

### 3. Log Management
```bash
# Rotate logs
sudo tee /etc/logrotate.d/ibs << EOF
/var/log/ibs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF
```

### 4. Backup Strategy
```bash
# MongoDB backup script
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db ibs_v5 --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*" -mtime +7 -delete

# Add to crontab
# 0 2 * * * /path/to/backup-script.sh
```

### 5. Health Checks
```bash
# Health check script
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:3000 || exit 1

# Add to monitoring service
sudo tee /etc/systemd/system/ibs-healthcheck.service << EOF
[Unit]
Description=IBS Health Check
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -f http://localhost:3001/health
User=www-data

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ibs-healthcheck.timer
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   sudo netstat -tulpn | grep :3001
   
   # Kill process
   sudo kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **PM2 Process Issues**
   ```bash
   # Reset PM2
   pm2 delete all
   pm2 start ecosystem.config.js
   pm2 save
   ```

4. **Nginx Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Reload configuration
   sudo systemctl reload nginx
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Tuning

1. **Node.js Optimization**
   ```bash
   # Increase memory limit
   export NODE_OPTIONS="--max-old-space-size=8192"
   
   # Use cluster mode
   pm2 start ecosystem.config.js --env production
   ```

2. **MongoDB Optimization**
   ```bash
   # Create indexes
   mongosh ibs_v5 --eval "db.flights.createIndex({status: 1, lastUpdate: -1})"
   mongosh ibs_v5 --eval "db.alerts.createIndex({severity: 1, timestamp: -1})"
   ```

3. **Nginx Optimization**
   ```nginx
   # Enable gzip compression
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   
   # Enable caching
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

---

*This deployment guide provides comprehensive instructions for deploying the IBS v5 system to production. Follow each step carefully and test thoroughly before going live.*
