# 👨‍💼 Inventory Management System - Administrator Guide

**Version:** 2.0  
**Last Updated:** November 26, 2025  
**Audience:** System Administrators, IT Staff

---

## 📑 Table of Contents

1. [System Architecture](#system-architecture)
2. [Installation & Deployment](#installation--deployment)
3. [Database Management](#database-management)
4. [User & Role Administration](#user--role-administration)
5. [Backup & Recovery](#backup--recovery)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Configuration](#security-configuration)

---

## 🏗️ System Architecture

### Technology Stack

```
Frontend:
├── React 19 (UI Framework)
├── Vite (Build tool)
├── Redux (State management)
├── Tailwind CSS (Styling)
└── Axios (HTTP client)

Backend:
├── Spring Boot (Java Framework)
├── PostgreSQL (Database)
├── Flyway (Database migrations)
├── JWT (Authentication)
└── Spring Security (Authorization)

Infrastructure:
├── Nginx (Web server/Reverse proxy)
├── Docker (Containerization)
└── Linux (Ubuntu/CentOS)
```

### System Components

```
┌─────────────────────────────────────────┐
│   User Browser                          │
│   http://27.34.245.92                   │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Nginx (Port 80)                       │
│   - Static files: /assets/*             │
│   - API proxy: /api → localhost:8081    │
│   - React Router: /* → index.html       │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   React App (index.html)                │
│   /var/www/inventory-ui/                │
└────────────┬────────────────────────────┘
             │
      (XHR/Fetch)
             │
┌────────────▼────────────────────────────┐
│   Spring Boot Backend (Port 8081)       │
│   /home/it-admin/be-service/code/       │
│   - Authentication                      │
│   - Business Logic                      │
│   - Data Processing                     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   PostgreSQL Database                   │
│   inventory_db                          │
│   - User data                           │
│   - Medicine stock                      │
│   - Distributions                       │
│   - Reports & Analytics                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Installation & Deployment

### System Requirements

**Server:**

- OS: Ubuntu 20.04+ or CentOS 7+
- RAM: 4GB minimum (8GB recommended)
- Disk: 20GB minimum
- CPU: 2 cores minimum

**Network:**

- Static IP address (e.g., 27.34.245.92)
- Ports: 80 (HTTP), 8081 (Backend), 5432 (Database)

### Initial Installation

#### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx postgresql postgresql-contrib \
                    openjdk-11-jdk nodejs npm git

# Start services
sudo systemctl start nginx postgresql
sudo systemctl enable nginx postgresql
```

#### 2. Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE inventory_db;
CREATE USER your_user WITH PASSWORD 'your_password';
ALTER ROLE your_user SET client_encoding TO 'utf8';
ALTER ROLE your_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_user SET default_transaction_deferrable TO on;
ALTER ROLE your_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO your_user;
\q
```

#### 3. Deploy Frontend

```bash
# Build React app
cd /path/to/inventory-ui-v2
npm install
npm run build

# Deploy to Nginx
sudo mkdir -p /var/www/inventory-ui
sudo cp -r dist/* /var/www/inventory-ui/
sudo chown -R nginx:nginx /var/www/inventory-ui
sudo chmod -R 755 /var/www/inventory-ui
```

#### 4. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/conf.d/inventory-ui.conf

# Content: (see sample config in docs)
# Then test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Deploy Backend

```bash
# Build Spring Boot jar
cd /home/it-admin/be-service/code/inventory_app_v1
./mvnw clean package

# Run backend
java -jar target/inventory-app-0.0.1-SNAPSHOT.jar &

# Or use systemd service (see service setup)
```

### Deployment Checklist

- [ ] Server OS installed and updated
- [ ] Nginx installed and running
- [ ] PostgreSQL installed and running
- [ ] Database created with correct user
- [ ] Java 11+ installed
- [ ] Frontend built and deployed to /var/www/
- [ ] Backend jar available
- [ ] Nginx proxy configured
- [ ] Firewall rules allowing ports 80, 8081
- [ ] SSL certificate installed (if using HTTPS)
- [ ] DNS records pointing to server IP
- [ ] Tested from browser

---

## 💾 Database Management

### Database Backup

#### Manual Backup

```bash
# Full database backup
sudo -u postgres pg_dump inventory_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
sudo -u postgres pg_dump inventory_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Automated Backup

Create cron job:

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup_db.sh

# Create backup script
sudo nano /usr/local/bin/backup_db.sh
```

Script content:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/inventory/"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump inventory_db | \
    gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Database Restore

```bash
# Restore from backup
sudo -u postgres psql inventory_db < backup_20250126_120000.sql

# Restore from compressed backup
gunzip -c backup_20250126_120000.sql.gz | \
    sudo -u postgres psql inventory_db
```

### Database Monitoring

```bash
# Check database size
sudo -u postgres psql -d inventory_db -c "\db+"

# Check table sizes
sudo -u postgres psql -d inventory_db -c "\dt+ public.*"

# Check connection status
sudo -u postgres psql -d inventory_db -c "SELECT * FROM pg_stat_activity;"

# Monitor disk usage
du -sh /var/lib/postgresql/*/main/

# Check database statistics
sudo -u postgres psql -d inventory_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Database Maintenance

```bash
# Vacuum and analyze (weekly)
sudo -u postgres vacuumdb inventory_db
sudo -u postgres analyzedb inventory_db

# Reindex (monthly)
sudo -u postgres reindexdb inventory_db

# Check database integrity
sudo -u postgres pg_dump inventory_db > /dev/null && echo "Database OK"
```

### Migration Issues (Flyway)

**Issue:** "Schema has version X, but no migration could be resolved"

**Solution:**

```bash
# 1. Stop backend
pkill -f inventory-app

# 2. Check Flyway table
sudo -u postgres psql -d inventory_db -c "SELECT * FROM flyway_schema_history;"

# 3. Reset Flyway (careful!)
sudo -u postgres psql -d inventory_db -c "DROP TABLE IF EXISTS flyway_schema_history;"

# 4. Restart backend (migrations auto-run)
cd /home/it-admin/be-service/code/inventory_app_v1
java -jar target/inventory-app-0.0.1-SNAPSHOT.jar &

# 5. Monitor logs
tail -f target/application.log | grep -i "flyway\|migration"
```

---

## 👥 User & Role Administration

### Creating Initial Admin User

```bash
# SSH to backend or run via API
# Using the database directly (if needed):

sudo -u postgres psql -d inventory_db

-- Create admin user
INSERT INTO users (email, password, first_name, last_name, status)
VALUES ('admin@example.com',
        'hashed_password_here',
        'System',
        'Admin',
        'ACTIVE');

-- Assign admin role
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1); -- Assuming admin role_id = 1
```

### User Account Management

#### View All Users

```bash
sudo -u postgres psql -d inventory_db -c "SELECT id, email, first_name, last_name, status FROM users;"
```

#### Disable User

```bash
sudo -u postgres psql -d inventory_db -c "UPDATE users SET status = 'INACTIVE' WHERE email = 'user@example.com';"
```

#### Reset User Password

```bash
sudo -u postgres psql -d inventory_db -c "UPDATE users SET password = 'temporary_hash' WHERE email = 'user@example.com';"
```

### Role Configuration

**Default Roles:**

1. **Admin** - Full access to all features
2. **Manager** - Manage stock and distributions
3. **Operator** - Create distributions only
4. **Viewer** - Read-only access

**Create Custom Role:**

```bash
# Via application UI:
1. Login as admin
2. Settings → Role Management
3. Add Role with custom permissions
```

---

## 🔄 Backup & Recovery

### Full System Backup

```bash
#!/bin/bash
# Full system backup script

BACKUP_DIR="/var/backups/inventory-full/"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting full system backup..."

# 1. Backend source code
tar -czf $BACKUP_DIR/backend_code_$DATE.tar.gz \
    /home/it-admin/be-service/code/

# 2. Frontend source code
tar -czf $BACKUP_DIR/frontend_code_$DATE.tar.gz \
    /path/to/inventory-ui-v2/

# 3. Database
sudo -u postgres pg_dump inventory_db | \
    gzip > $BACKUP_DIR/database_$DATE.sql.gz

# 4. Nginx config
tar -czf $BACKUP_DIR/nginx_config_$DATE.tar.gz \
    /etc/nginx/conf.d/

# 5. Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR"
```

### Disaster Recovery

**Step 1: Restore Database**

```bash
gunzip -c backup_database_YYYYMMDD.sql.gz | \
    sudo -u postgres psql inventory_db
```

**Step 2: Restore Backend**

```bash
tar -xzf backup_backend_code_YYYYMMDD.tar.gz -C /
cd /home/it-admin/be-service/code/inventory_app_v1
./mvnw clean package
java -jar target/inventory-app-0.0.1-SNAPSHOT.jar &
```

**Step 3: Restore Frontend**

```bash
tar -xzf backup_frontend_code_YYYYMMDD.tar.gz -C /
cd /path/to/inventory-ui-v2
npm run build
sudo cp -r dist/* /var/www/inventory-ui/
```

**Step 4: Restore Nginx**

```bash
sudo tar -xzf backup_nginx_config_YYYYMMDD.tar.gz -C /
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Maintenance

### System Health Checks

```bash
#!/bin/bash
# Health check script

echo "=== System Health Check ==="

# 1. Check disk space
echo "Disk Usage:"
df -h | grep -E "^/dev|Filesystem"

# 2. Check memory
echo -e "\nMemory Usage:"
free -h

# 3. Check services
echo -e "\nService Status:"
systemctl is-active nginx && echo "✓ Nginx running" || echo "✗ Nginx stopped"
systemctl is-active postgresql && echo "✓ PostgreSQL running" || echo "✗ PostgreSQL stopped"
pgrep -f "java.*inventory-app" > /dev/null && echo "✓ Backend running" || echo "✗ Backend stopped"

# 4. Check ports
echo -e "\nPort Status:"
netstat -tlnp | grep -E "80|8081|5432"

# 5. Check logs for errors
echo -e "\nRecent Errors:"
tail -20 /var/log/nginx/error.log | grep "error"
```

### Log Monitoring

**Application Logs:**

```bash
# Frontend logs (Nginx)
tail -f /var/log/nginx/inventory-ui-access.log
tail -f /var/log/nginx/inventory-ui-error.log

# Backend logs
tail -f /home/it-admin/be-service/code/inventory_app_v1/target/application.log

# System logs
tail -f /var/log/syslog
journalctl -xe
```

### Performance Optimization

```bash
# 1. Enable Nginx gzip compression (in nginx.conf)
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/javascript application/json;

# 2. Set appropriate PHP pool size
# (Not applicable for Spring Boot)

# 3. Optimize PostgreSQL
sudo -u postgres pg_tune

# 4. Monitor backend heap size
# In application.yml:
# server:
#   tomcat:
#     max-threads: 200
#     min-spare-threads: 10
```

### Scheduled Maintenance

**Daily:**

- Check system health
- Monitor disk space
- Review error logs

**Weekly:**

- Database vacuum and analyze
- Backup verification
- Security patching review

**Monthly:**

- Database reindex
- Full system backup
- Performance analysis
- Log rotation

---

## 🔧 Troubleshooting

### Backend Not Starting

**Issue:** Backend process exits or doesn't listen on port 8081

**Debug:**

```bash
# Check Java version
java -version

# Run backend with verbose logging
java -jar target/inventory-app-0.0.1-SNAPSHOT.jar --debug

# Check logs
tail -50 target/application.log | grep -i "error\|exception"

# Check port
netstat -tlnp | grep 8081

# Verify database connection
sudo -u postgres psql -d inventory_db -U your_user -c "SELECT 1;"
```

**Solutions:**

- Ensure Java 11+ is installed
- Check database credentials in application.properties
- Verify database is running
- Increase heap size: `java -Xmx2g -jar ...`

### Frontend Not Loading

**Issue:** Browser shows blank page or 404

**Debug:**

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx config
sudo nginx -t

# Check files exist
ls -la /var/www/inventory-ui/

# Check Nginx error logs
tail -50 /var/log/nginx/error.log

# Check firewall
sudo ufw status
```

**Solutions:**

- Reload Nginx: `sudo systemctl reload nginx`
- Verify files: `ls -la /var/www/inventory-ui/index.html`
- Check permissions: `sudo chown -R nginx:nginx /var/www/inventory-ui/`

### API Returns 500 Error

**Issue:** API endpoints return HTTP 500

**Debug:**

```bash
# Check backend logs
tail -100 target/application.log | grep -i "error\|exception" | tail -20

# Check database state
sudo -u postgres psql -d inventory_db -c "SELECT COUNT(*) FROM users;"

# Test API directly
curl -s http://localhost:8081/api/v1/health

# Check backend connectivity
curl -v http://localhost:8081/api/v1/locations
```

**Solutions:**

- Check database migrations: `SELECT * FROM flyway_schema_history;`
- Reset Flyway if corrupted
- Check database permissions
- Restart backend

### Slow Performance

**Issue:** Application is slow to load or respond

**Debug:**

```bash
# Check system resources
top -b -n 1 | head -20
free -h
df -h

# Check database queries
sudo -u postgres psql -d inventory_db -c "SELECT query, calls FROM pg_stat_statements ORDER BY calls DESC LIMIT 10;"

# Check Nginx access times
tail -100 /var/log/nginx/access.log | grep "HTTP/1" | awk '{print $NF}' | sort -rn | head -10

# Check backend memory
ps aux | grep java
```

**Solutions:**

- Increase heap size: `java -Xmx4g -jar ...`
- Database optimization: `vacuumdb` and `analyzedb`
- Enable Nginx caching
- Check for slow queries
- Monitor network bandwidth

### Nginx Proxy Not Working

**Issue:** Frontend can't reach backend (/api/ returns error)

**Debug:**

```bash
# Test backend directly
curl -v http://localhost:8081/api/v1/locations

# Test through proxy
curl -v http://localhost/api/v1/locations

# Check Nginx config
sudo nginx -t
cat /etc/nginx/conf.d/inventory-ui.conf

# Check proxy headers
curl -v http://localhost/api/v1/locations | grep -i "x-forwarded"
```

**Solutions:**

- Verify backend is running
- Check Nginx upstream configuration
- Ensure `/api/` block comes before `/` block
- Check firewall rules

---

## 🔒 Security Configuration

### SSL/HTTPS Setup

```bash
# 1. Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. Obtain certificate
sudo certbot certonly --nginx -d your-domain.com

# 3. Update Nginx config
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ... rest of config
}

# 4. Redirect HTTP to HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}

# 5. Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8081/tcp # Backend (internal only recommended)

# Restrict backend to localhost
sudo ufw deny from any to any port 8081
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 8081
```

### Database Security

```bash
# 1. Strong password for database user
ALTER USER your_user WITH PASSWORD 'VeryStrongPassword123!@#';

# 2. Restrict database connections
# Edit /etc/postgresql/*/main/pg_hba.conf
# local   all             all                     peer
# host    all             all     127.0.0.1/32    md5

# 3. Backup important data regularly
sudo -u postgres pg_dump inventory_db | gzip > backup_$(date +%Y%m%d).sql.gz

# 4. Regular security updates
sudo apt update && sudo apt upgrade -y
```

### JWT Secret Configuration

```bash
# In application.properties, ensure strong JWT secret
inventory.app.jwtSecret=YourVeryLongRandomSecretKey.GeneratedUsingRandomAndKeepItSecure!@#$%^&*()

# Example generation:
openssl rand -base64 32
```

### Regular Security Checks

```bash
# Check for open ports
sudo ss -tlnp

# Check user accounts
cat /etc/passwd | grep -v nologin

# Check sudo access
sudo visudo -c

# Check file permissions
ls -la /etc/nginx/
ls -la /var/www/

# Check failed login attempts
grep "Failed password" /var/log/auth.log | wc -l
```

---

## 📋 System Maintenance Checklist

### Monthly

- [ ] Review and archive old logs
- [ ] Check disk space usage
- [ ] Database reindex
- [ ] Security patching
- [ ] Full system backup verification
- [ ] User account review

### Quarterly

- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning
- [ ] Disaster recovery test

### Annually

- [ ] System refresh/upgrade
- [ ] SSL certificate renewal planning
- [ ] Architecture review
- [ ] Compliance check

---

## 📞 Support & Resources

- **Backend Repository:** [URL to GitHub/GitLab]
- **Frontend Repository:** [URL to GitHub/GitLab]
- **Documentation:** Available in-app
- **Support Contact:** [Admin email]

---

## 🆘 Emergency Contacts

| Role           | Contact | Phone   |
| -------------- | ------- | ------- |
| System Admin   | [Name]  | [Phone] |
| Database Admin | [Name]  | [Phone] |
| DevOps         | [Name]  | [Phone] |

---

**Last Updated:** November 26, 2025  
**Document Version:** 2.0

---

_This guide is for authorized system administrators only. Keep credentials and sensitive information secure._
