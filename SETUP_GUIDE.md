# Salon Management System - Complete Setup Guide

## Prerequisites

Before starting, make sure you have installed:
- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- MySQL (v12 or higher) - [Download](https://www.mysqlql.org/download/)
- Git (optional) - [Download](https://git-scm.com/)

## Step 1: Database Setup

### 1.1 Create Database
Open your terminal/command prompt and run:

```bash
# Login to MySQL
mysql -U mysql

# Create database
CREATE DATABASE salon_db;

# Exit mysql
\q
```

### 1.2 Run Database Schema
```bash
# Navigate to database folder
cd database

# Run the schema file
mysql -U mysql -d salon_db -f schema.sql
```

You should see: "CREATE TABLE" messages for each table.

**Default Admin Account:**
- Email: `admin@salon.com`
- Password: `admin123`
- **IMPORTANT: Change this password after first login!**

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
# Navigate to backend folder
cd backend

# Install all packages
npm install
```

### 2.2 Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings
# Use any text editor (notepad, nano, vim, etc.)
nano .env
```

Update these values in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_db
DB_USER=mysql
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=your_random_secret_key_here
```

**Generate a secure JWT secret:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Online tool
# Visit: https://randomkeygen.com/
```

### 2.3 Start Backend Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
Server running on port 5000
Environment: development
Database connected successfully
```

**Test the backend:**
Open browser and visit: `http://localhost:5000/health`
You should see: `{"status":"OK","message":"Server is running"}`

## Step 3: Frontend Setup

You have 3 frontend modules. Let's set up the Admin panel first:

### 3.1 Admin Panel Setup
```bash
# Navigate to admin frontend
cd frontend/admin

# Install dependencies
npm install

# Start development server
npm start
```

The admin panel will open at: `http://localhost:3000`

### 3.2 Owner Portal Setup (Optional - for later)
```bash
# In a new terminal
cd frontend/owner

# Copy package.json from admin
cp ../admin/package.json .

# Install dependencies
npm install

# Create src folder and basic files
mkdir -p src public
```

### 3.3 User Website Setup (Optional - for later)
```bash
# In a new terminal
cd frontend/user

# Follow same steps as owner portal
```

## Step 4: Test the System

### 4.1 Login to Admin Panel
1. Open `http://localhost:3000`
2. Use credentials:
   - Email: `admin@salon.com`
   - Password: `admin123`
3. You should see the admin dashboard with statistics

### 4.2 Create Test Data

#### Create a Salon Owner:
```bash
# Using curl (Linux/Mac) or Postman
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "role": "owner"
  }'
```

#### Create a Salon:
```bash
# First, login as owner to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'

# Copy the token from response, then:
curl -X POST http://localhost:5000/api/salons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Beautiful Hair Salon",
    "description": "Professional hair and beauty services",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phone": "555-1234",
    "email": "info@beautifulhair.com",
    "openingTime": "09:00",
    "closingTime": "18:00"
  }'
```

## Step 5: Development Workflow

### Running Everything
You'll need 2 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Admin):**
```bash
cd frontend/admin
npm start
```

### Stopping Services
- Press `Ctrl + C` in each terminal to stop the servers

## Common Issues & Solutions

### Issue 1: Database Connection Failed
**Error:** `Error: connect ECONNREFUSED`

**Solution:**
1. Make sure MySQL is running
2. Check username/password in `.env`
3. Verify database exists: `mysql -U mysql -l`

### Issue 2: Port Already in Use
**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find and kill the process
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue 3: npm install fails
**Error:** Various npm errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 4: CORS errors in browser
**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
1. Make sure backend is running
2. Check CORS configuration in `backend/server.js`
3. Verify frontend URL matches in `.env`

## Next Steps

### 1. Build Owner Portal
- Copy admin structure
- Modify for salon owner features
- Add salon management components

### 2. Build User Website
- Create public-facing design
- Add salon browsing
- Implement booking system

### 3. Add Features
- [ ] Email notifications
- [ ] Payment integration (Stripe)
- [ ] Image uploads
- [ ] Reviews system
- [ ] Appointment calendar
- [ ] SMS notifications

### 4. Deploy to Production
- Set up production database
- Configure environment variables
- Deploy backend (Heroku, AWS, DigitalOcean)
- Deploy frontend (Vercel, Netlify)

## Project Structure Reference

```
salon-project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── owner.js
│   │   ├── salons.js
│   │   └── ...
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── admin/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.js
│   │   │   ├── App.css
│   │   │   └── index.js
│   │   └── package.json
│   ├── owner/
│   └── user/
├── database/
│   └── schema.sql
└── README.md
```

## Getting Help

- Check the error messages carefully
- Review the console logs (both browser and terminal)
- Make sure all services are running
- Verify database connection
- Check API endpoints with Postman or curl

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MySQL Documentation](https://www.mysqlql.org/docs/)
- [JWT.io](https://jwt.io/) - for understanding JWT tokens

Good luck with your salon management system! 🚀
