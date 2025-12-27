# Deployment Guide

This guide covers deploying the Accounting ERP System to production.

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)
### Option 2: Platform as a Service (Heroku, Railway, Render)
### Option 3: Docker Containers
### Option 4: Vercel (Frontend) + Railway (Backend)

---

## Option 1: VPS Deployment (Ubuntu Server)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone YOUR_REPO_URL accounting-erp
cd accounting-erp

# Install dependencies
sudo npm install
cd frontend
sudo npm install
sudo npm run build
cd ..

# Setup environment
sudo cp .env.example .env
sudo nano .env
# Edit with production values
```

### Step 3: Configure PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'accounting-erp-backend',
    script: './backend/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/accounting-erp
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/accounting-erp/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/accounting-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Option 2: Heroku Deployment

### Step 1: Prepare Application

Create `Procfile` in root:
```
web: node backend/server.js
```

### Step 2: Deploy

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

---

## Option 3: Docker Deployment

### Step 1: Create Dockerfile

Backend Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY backend ./backend
COPY .env .env

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

Frontend Dockerfile:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/accounting_erp
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

### Step 3: Deploy

```bash
docker-compose up -d
```

---

## Option 4: Split Deployment

### Frontend → Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add REACT_APP_API_URL
```

### Backend → Railway

1. Go to railway.app
2. Create new project
3. Add MongoDB plugin
4. Deploy from GitHub
5. Set environment variables

---

## Production Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS/SSL
- [ ] Setup CORS properly
- [ ] Add rate limiting
- [ ] Setup firewall (UFW on Ubuntu)
- [ ] Disable MongoDB remote access (if not needed)
- [ ] Use strong database passwords
- [ ] Setup backup strategy

### Performance
- [ ] Enable Gzip compression
- [ ] Setup CDN for static files
- [ ] Add Redis for caching (optional)
- [ ] Optimize images
- [ ] Minify frontend assets
- [ ] Setup MongoDB indexes
- [ ] Configure PM2 cluster mode

### Monitoring
- [ ] Setup logging (Winston)
- [ ] Setup error tracking (Sentry)
- [ ] Setup uptime monitoring
- [ ] Configure PM2 monitoring
- [ ] Setup database backups
- [ ] Configure alerts

### Environment Variables

```env
# Production .env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/accounting_erp_prod
JWT_SECRET=your_very_long_and_secure_random_string_here
JWT_EXPIRE=7d

# Optional
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your_sentry_dsn
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

---

## Database Backup

### Manual Backup
```bash
# Backup
mongodump --db accounting_erp --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --db accounting_erp /backup/20240101/accounting_erp
```

### Automated Backup Script
```bash
#!/bin/bash
# /opt/backup-mongodb.sh

BACKUP_DIR="/backup/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mongodump --db accounting_erp --out $BACKUP_DIR/$TIMESTAMP

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/backup-mongodb.sh
```

---

## Scaling

### Horizontal Scaling
- Use PM2 cluster mode (already configured)
- Setup load balancer (Nginx)
- Add more server instances
- Use MongoDB replica set

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching layer (Redis)
- Use CDN for static assets

---

## Monitoring Commands

```bash
# Check PM2 status
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check MongoDB status
sudo systemctl status mongod
mongosh --eval "db.adminCommand('serverStatus')"

# Check disk space
df -h

# Check memory
free -m

# Check CPU
top
```

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs accounting-erp-backend

# Check if port is in use
sudo lsof -i :5000

# Restart
pm2 restart accounting-erp-backend
```

### Database connection error
```bash
# Check MongoDB
sudo systemctl status mongod

# Check connection string
mongosh $MONGODB_URI

# Restart MongoDB
sudo systemctl restart mongod
```

### Nginx 502 error
```bash
# Check backend is running
pm2 status

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Maintenance

### Update Application
```bash
cd /var/www/accounting-erp
git pull
npm install
cd frontend
npm install
npm run build
cd ..
pm2 restart all
```

### Update Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update
sudo apt install nodejs
pm2 restart all
```

### Update MongoDB
```bash
# Backup first!
mongodump --db accounting_erp --out /backup/before_update

# Update
sudo apt update
sudo apt upgrade mongodb-org
```

---

## Support & Resources

- MongoDB Atlas (Cloud Database): https://www.mongodb.com/cloud/atlas
- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- Vercel: https://vercel.com/
- Railway: https://railway.app/
- Heroku: https://www.heroku.com/

---

## Cost Estimation (Monthly)

### Small Business (< 100 users)
- VPS (2GB RAM): $10-20
- Domain: $1
- SSL: Free (Let's Encrypt)
- **Total: ~$11-21/month**

### Medium Business (100-500 users)
- VPS (4GB RAM): $20-40
- MongoDB Atlas (M10): $57
- CDN: $10
- **Total: ~$87-107/month**

### Large Business (500+ users)
- VPS Cluster: $100+
- MongoDB Atlas (M30): $250
- Load Balancer: $20
- CDN: $50
- **Total: ~$420+/month**

---

**Remember**: Always test in staging environment before deploying to production!
