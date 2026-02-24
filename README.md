# Salon Management System

A complete salon management solution with three modules: Admin, Owner, and User Website.

## Project Structure

```
salon-project/
├── backend/          # Node.js + Express API
├── frontend/         # React applications
│   ├── admin/       # Admin dashboard
│   ├── owner/       # Salon owner portal
│   └── user/        # Customer-facing website
├── database/        # Database schemas and migrations
└── docs/            # Documentation
```

## Tech Stack

- **Backend**: Node.js, Express.js, JWT Authentication
- **Frontend**: React.js, Tailwind CSS
- **Database**: MySQL
- **API**: RESTful API

## Features

### Admin Module (Port 3000)
- ✅ Login/Authentication
- ✅ Dashboard with statistics
- ✅ Manage all users and salons
- ✅ View system analytics
- 🔄 Payment oversight (coming soon)

### Owner Module (Port 3001)
- ✅ Owner registration and login
- ✅ Create and manage salons
- ✅ View owned salons
- ✅ Edit salon details
- 🔄 Staff management (coming soon)
- 🔄 Service catalog (coming soon)
- 🔄 Appointment scheduling (coming soon)

### User Website (Port 3002)
- ✅ Modern homepage with features
- ✅ Browse all salons
- ✅ Search salons by city
- ✅ User registration and login
- ✅ View salon details
- 🔄 Book appointments (coming soon)
- 🔄 Reviews and ratings (coming soon)

## Quick Start

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your database in .env
   npm run dev
   ```

2. **Setup Admin Panel (Port 3000)**
   ```bash
   cd frontend/admin
   npm install
   npm start
   ```

3. **Setup Owner Portal (Port 3001)**
   ```bash
   cd frontend/owner
   npm install
   npm start
   ```

4. **Setup User Website (Port 3002)**
   ```bash
   cd frontend/user
   npm install
   npm start
   ```

## Database Setup

```bash
cd database
# Run migrations
mysql -U mysql -d salon_db -f schema.sql
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login
- POST `/auth/refresh` - Refresh token

### User Roles
- `admin` - Full system access
- `owner` - Salon management
- `user` - Book appointments

## Development Roadmap

- [x] Project setup
- [ ] Authentication system
- [ ] Admin dashboard
- [ ] Owner portal
- [ ] User website
- [ ] Payment integration
- [ ] Email notifications
- [ ] Mobile responsive design

## License

MIT
