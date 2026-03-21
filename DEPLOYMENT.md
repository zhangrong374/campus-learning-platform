# 部署指南

本文档提供了校园学习规划平台的详细部署指南。

## 目录

- [系统要求](#系统要求)
- [准备工作](#准备工作)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker部署（可选）](#docker部署可选)
- [常见问题](#常见问题)

## 系统要求

### 最低配置
- **操作系统**: Linux (Ubuntu 20.04+ 推荐)、Windows、macOS
- **Node.js**: 16.x 或更高版本
- **MySQL**: 8.0 或更高版本
- **内存**: 4GB RAM
- **磁盘空间**: 20GB 可用空间

### 推荐配置
- **操作系统**: Linux (Ubuntu 22.04)
- **Node.js**: 18.x LTS
- **MySQL**: 8.0+
- **内存**: 8GB RAM
- **磁盘空间**: 50GB SSD
- **CPU**: 4核心以上

## 准备工作

### 1. 安装Node.js

#### Ubuntu/Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### macOS
```bash
brew install node
```

#### Windows
从 [Node.js官网](https://nodejs.org/) 下载并安装LTS版本。

### 2. 安装MySQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### macOS
```bash
brew install mysql
brew services start mysql
```

#### Windows
从 [MySQL官网](https://dev.mysql.com/downloads/mysql/) 下载并安装。

### 3. 安装Git

#### Ubuntu/Debian
```bash
sudo apt install git
```

#### macOS
```bash
brew install git
```

#### Windows
从 [Git官网](https://git-scm.com/downloads) 下载并安装。

## 开发环境部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd route1
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_learning_platform

# 服务器配置
SERVER_PORT=3000
CLIENT_PORT=5173

# JWT密钥
JWT_SECRET=your_secure_jwt_secret_key_here

# CORS配置
CORS_ORIGIN=http://localhost:5173
```

**重要提示**：
- 在生产环境中，务必使用强密码和安全的JWT密钥
- 不要将 `.env` 文件提交到版本控制系统

### 3. 初始化数据库

```bash
cd backend
npm install
npm run init-db
```

这将：
- 创建数据库
- 创建所有表
- 插入测试数据

### 4. 安装所有依赖

```bash
# 在项目根目录
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd frontend && npm install
```

### 5. 启动开发服务器

#### 方式一：同时启动前后端（推荐）

```bash
# 在项目根目录
npm run dev
```

#### 方式二：分别启动

**终端1 - 启动后端：**
```bash
cd backend
npm run dev
```

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```

### 6. 访问应用

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3000
- API健康检查: http://localhost:3000/api/health

## 生产环境部署

### 1. 准备生产环境

#### 1.1 配置环境变量

创建生产环境配置文件：

```bash
cp .env.example .env.production
```

编辑 `.env.production`：

```env
# 环境设置
NODE_ENV=production

# 数据库配置（使用生产数据库）
DB_HOST=production-db-host
DB_PORT=3306
DB_USER=production_db_user
DB_PASSWORD=secure_production_password
DB_NAME=campus_learning_platform

# 服务器配置
SERVER_PORT=3000

# JWT密钥（务必使用强密钥）
JWT_SECRET=very_long_and_secure_random_string_for_jwt_secret

# CORS配置
CORS_ORIGIN=https://your-domain.com
```

#### 1.2 初始化生产数据库

```bash
cd backend
NODE_ENV=production npm run init-db
```

### 2. 构建前端应用

```bash
cd frontend
npm run build
```

构建完成后，静态文件将生成在 `frontend/dist` 目录。

### 3. 部署前端静态文件

#### 使用Nginx

1. 安装Nginx：

```bash
sudo apt install nginx
```

2. 配置Nginx：

创建配置文件 `/etc/nginx/sites-available/campus-learning`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/campus-learning/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. 启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/campus-learning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. 复制前端文件到Nginx目录：

```bash
sudo mkdir -p /var/www/campus-learning
sudo cp -r frontend/dist /var/www/campus-learning/frontend/
sudo chown -R www-data:www-data /var/www/campus-learning
```

### 4. 部署后端服务

#### 使用PM2（推荐）

1. 安装PM2：

```bash
npm install -g pm2
```

2. 创建PM2配置文件 `ecosystem.config.json`：

```json
{
  "apps": [
    {
      "name": "campus-learning-backend",
      "script": "./backend/src/server.js",
      "cwd": "/var/www/campus-learning",
      "instances": 2,
      "exec_mode": "cluster",
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env_file": "/var/www/campus-learning/.env.production",
      "error_file": "./logs/pm2-error.log",
      "out_file": "./logs/pm2-out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true
    }
  ]
}
```

3. 创建日志目录：

```bash
sudo mkdir -p /var/www/campus-learning/logs
sudo chown -R www-data:www-data /var/www/campus-learning/logs
```

4. 复制后端文件：

```bash
sudo cp -r backend /var/www/campus-learning/
sudo cp .env.production /var/www/campus-learning/.env
sudo chown -R www-data:www-data /var/www/campus-learning/backend
```

5. 启动服务：

```bash
cd /var/www/campus-learning
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

6. 查看服务状态：

```bash
pm2 status
pm2 logs
pm2 monit
```

### 5. 配置HTTPS（使用Let's Encrypt）

1. 安装Certbot：

```bash
sudo apt install certbot python3-certbot-nginx
```

2. 获取SSL证书：

```bash
sudo certbot --nginx -d your-domain.com
```

3. 自动续期：

```bash
sudo certbot renew --dry-run
```

Certbot会自动配置续期任务。

### 6. 配置防火墙

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Docker部署（可选）

### 1. 创建Dockerfile

#### 后端Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

#### 前端Dockerfile (`frontend/Dockerfile`)

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建Docker Compose文件

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: campus_learning_platform
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - DB_NAME=campus_learning_platform
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mysql
    networks:
      - app-network
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  mysql-data:

networks:
  app-network:
    driver: bridge
```

### 3. 构建和启动

```bash
docker-compose up -d --build
```

### 4. 查看日志

```bash
docker-compose logs -f
```

## 监控和维护

### 1. 系统监控

安装监控工具：

```bash
# 安装htop
sudo apt install htop

# 安装iotop
sudo apt install iotop
```

### 2. 日志管理

配置日志轮转：

创建 `/etc/logrotate.d/campus-learning`：

```
/var/www/campus-learning/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
```

### 3. 数据库备份

创建备份脚本 `/usr/local/bin/backup-db.sh`：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
MYSQL_USER="root"
MYSQL_PASSWORD="your_password"
DB_NAME="campus_learning_platform"

mkdir -p $BACKUP_DIR

mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME_$DATE.sql.gz

# 删除30天前的备份
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

设置定时任务：

```bash
crontab -e
```

添加：

```
0 2 * * * /usr/local/bin/backup-db.sh
```

## 常见问题

### 1. 端口被占用

检查端口占用：

```bash
sudo lsof -i :3000
sudo lsof -i :5173
```

### 2. 数据库连接失败

检查MySQL服务状态：

```bash
sudo systemctl status mysql
```

检查数据库连接：

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### 3. PM2服务异常

查看PM2日志：

```bash
pm2 logs
```

重启服务：

```bash
pm2 restart all
```

### 4. Nginx配置错误

测试Nginx配置：

```bash
sudo nginx -t
```

查看Nginx错误日志：

```bash
sudo tail -f /var/log/nginx/error.log
```

## 安全建议

1. **定期更新系统**：保持系统和软件包最新
2. **使用强密码**：数据库、JWT密钥等使用强随机密码
3. **启用防火墙**：只开放必要的端口
4. **配置HTTPS**：使用SSL/TLS加密通信
5. **限制文件上传**：配置合理的文件大小限制
6. **定期备份**：建立数据库和文件备份策略
7. **监控日志**：定期检查系统和应用日志
8. **使用非root用户**：应用运行在非特权用户下

## 性能优化建议

1. **数据库优化**
   - 添加适当的索引
   - 定期优化表
   - 使用连接池

2. **应用优化**
   - 启用Gzip压缩
   - 使用CDN加速静态资源
   - 实现接口缓存

3. **服务器优化**
   - 使用反向代理
   - 启用HTTP/2
   - 配置负载均衡

## 联系支持

如有部署问题，请提交Issue或联系技术支持。
