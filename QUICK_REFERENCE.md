# Quick Reference Guide

## Quick Commands

### Start Development Environment
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Admin Frontend
cd frontend/admin
npm start
```

### Database Commands
```bash
# Create database
mysql -U mysql -c "CREATE DATABASE salon_db;"

# Run schema
mysql -U mysql -d salon_db -f database/schema.sql

# Connect to database
mysql -U mysql -d salon_db

# Useful SQL commands inside mysql:
\dt              # List all tables
\d users         # Describe users table
SELECT * FROM users;  # View all users
\q               # Quit mysql
```

### Default Credentials
- **Admin Login:**
  - Email: `admin@salon.com`
  - Password: `admin123`

### Port Numbers
- Backend API: `http://localhost:5000`
- Admin Panel: `http://localhost:3000`
- Owner Portal: `http://localhost:3001` (not yet created)
- User Website: `http://localhost:3002` (not yet created)

### Important API Endpoints
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login
GET    /api/auth/me          - Get current user
GET    /api/salons           - Get all salons
POST   /api/salons           - Create salon (auth)
GET    /api/admin/stats      - Get statistics (admin)
```

## File Structure Cheat Sheet

```
salon-project/
├── backend/
│   ├── config/database.js     # Database connection
│   ├── middleware/auth.js     # JWT authentication
│   ├── routes/                # API routes
│   ├── server.js              # Main server file
│   └── .env                   # Configuration (create this)
│
├── frontend/admin/
│   ├── src/
│   │   ├── App.js            # Main component
│   │   ├── App.css           # Styles
│   │   └── index.js          # Entry point
│   └── package.json
│
├── database/
│   └── schema.sql            # Database schema
│
└── SETUP_GUIDE.md            # Full setup instructions
```

## Common Tasks

### Add a New API Endpoint
1. Open appropriate route file in `backend/routes/`
2. Add route:
   ```javascript
   router.get('/new-endpoint', authenticate, async (req, res) => {
     // Your code here
   });
   ```
3. Export route in route file
4. Import in `server.js` if new route file

### Add a New Page to Admin
1. Create component in `frontend/admin/src/`
2. Add route in `App.js`:
   ```javascript
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add link in sidebar

### Test API with curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","firstName":"Test","lastName":"User","role":"user"}'

# Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Use token
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Variables (.env)
```bash
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_db
DB_USER=mysql
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## User Roles & Permissions

### Admin
- Full system access
- View all users and salons
- Access to statistics
- Can manage everything

### Owner
- Create and manage their salon(s)
- Add services and staff
- View appointments for their salon
- Cannot access other salons

### User
- Browse salons
- Book appointments
- Write reviews
- Manage their profile

## Next Features to Build

1. **Appointments System**
   - Calendar view
   - Booking form
   - Email notifications

2. **Services Management**
   - Add/edit services
   - Pricing
   - Duration

3. **Staff Management**
   - Add staff members
   - Assign to services
   - Schedule management

4. **Reviews System**
   - Rating stars
   - Comments
   - Moderation

5. **Payment Integration**
   - Stripe integration
   - Payment history
   - Invoices

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to database | Check MySQL is running, verify credentials in .env |
| Port already in use | Change port in .env or kill process using the port |
| CORS errors | Check backend CORS config matches frontend URL |
| Token expired | Login again to get new token |
| npm install fails | Clear cache: `npm cache clean --force` |

## Useful MySQL Queries

```sql
-- View all tables
\dt

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- View all salons with owners
SELECT s.name, u.first_name || ' ' || u.last_name as owner 
FROM salons s 
JOIN users u ON s.owner_id = u.id;

-- Recent appointments
SELECT * FROM appointments 
ORDER BY created_at DESC LIMIT 10;

-- Reset admin password (run in mysql)
UPDATE users 
SET password_hash = '$2b$10$rKvVYEhQfVEu7Jl0VqG8PuYjO3jMXGZnPLKVE1yHKVNOHWJGKQNGu' 
WHERE email = 'admin@salon.com';
```

## NPM Scripts

```bash
# Backend
npm run dev      # Start with nodemon (auto-restart)
npm start        # Production mode
npm test         # Run tests

# Frontend
npm start        # Development server
npm build        # Production build
npm test         # Run tests
```

## Contact & Resources

- MySQL Docs: https://www.mysqlql.org/docs/
- Express.js Docs: https://expressjs.com/
- React Docs: https://react.dev/
- JWT.io: https://jwt.io/

Happy coding! 🚀
