# How to Start All Modules

## ⚡ Quick Start (Windows)

### Step 1: Start Backend (Required First!)
```powershell
cd C:\Users\Administrator\Downloads\salon-project\salon-project\backend
npm install
npm run dev
```
Wait for: "Server running on port 5000" ✅

### Step 2: Start Admin Panel (New Terminal)
```powershell
cd C:\Users\Administrator\Downloads\salon-project\salon-project\frontend\admin
npm install
npm start
```
Opens at: http://localhost:3000 🔐

### Step 3: Start Owner Portal (New Terminal)
```powershell
cd C:\Users\Administrator\Downloads\salon-project\salon-project\frontend\owner
npm install
npm start
```
Opens at: http://localhost:3001 💼

### Step 4: Start User Website (New Terminal)
```powershell
cd C:\Users\Administrator\Downloads\salon-project\salon-project\frontend\user
npm install
npm start
```
Opens at: http://localhost:3002 🌐

## 🎯 What Each Module Does

### 1. Admin Panel (localhost:3000)
**Who:** System administrators
**Login:** admin@salon.com / admin123
**Features:**
- Dashboard with statistics
- Manage all users
- Manage all salons
- View system reports

### 2. Owner Portal (localhost:3001)
**Who:** Salon owners
**Login:** Create new account or use existing owner account
**Features:**
- Register as salon owner
- Create and manage your salons
- Add salon details (address, hours, contact)
- View your salons dashboard
- Edit salon information

### 3. User Website (localhost:3002)
**Who:** Customers/End users
**Login:** Create account or browse as guest
**Features:**
- Beautiful homepage
- Browse all salons
- Search salons by city
- View salon details
- Register/Login to book appointments
- User profile management

## 📱 Testing the Complete Flow

### Test 1: Create Owner and Salon
1. Go to http://localhost:3001
2. Click "Register"
3. Fill in owner details
4. Login
5. Click "+ Add New Salon"
6. Fill in salon details
7. Click "Create Salon"
8. ✅ Salon appears in owner dashboard

### Test 2: Browse as User
1. Go to http://localhost:3002
2. Click "Find Salons" or "Browse Salons"
3. See all salons (including the one you just created!)
4. Search by city
5. Click on a salon card to view details

### Test 3: Admin Overview
1. Go to http://localhost:3000
2. Login as admin
3. View dashboard statistics
4. See total users, owners, salons

## 🔧 Troubleshooting

### "npm is not recognized"
- Install Node.js from https://nodejs.org/

### "Port already in use"
**For Port 3000:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**For Port 3001:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**For Port 3002:**
```powershell
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### Backend not connecting
1. Make sure MySQL is running
2. Check .env file has correct database credentials
3. Verify database exists: salon_db

### "Cannot GET /"
- Backend must be running first (port 5000)
- Check terminal for errors

## 🎨 What You'll See

### Admin Panel
![Green/Purple theme with dashboard cards showing statistics]
- Clean admin interface
- Stats cards
- Navigation sidebar
- User and salon management

### Owner Portal
![Teal/Green theme with salon management]
- Registration form for new owners
- Salon cards showing your salons
- Add new salon modal
- Easy salon management

### User Website  
![Pink/Modern theme with beautiful design]
- Eye-catching hero section
- Feature cards (Search, Booking, Ratings, Payment)
- Salon grid with search
- Modern, user-friendly interface

## 📊 Default Accounts

**Admin:**
- Email: admin@salon.com
- Password: admin123
- Portal: localhost:3000

**Create Your Own:**
- Owner: Register at localhost:3001
- User: Register at localhost:3002

## 🚀 Next Steps After Setup

1. ✅ Create an owner account
2. ✅ Add your first salon
3. ✅ Browse salons as a user
4. ⏳ Implement appointment booking (future)
5. ⏳ Add services and staff (future)
6. ⏳ Add payment integration (future)

## 💡 Pro Tips

1. **Open 4 terminals:**
   - Terminal 1: Backend (must run first!)
   - Terminal 2: Admin
   - Terminal 3: Owner
   - Terminal 4: User

2. **Use different browsers for testing:**
   - Chrome: Admin
   - Firefox: Owner
   - Edge: User
   This prevents session conflicts!

3. **Check backend terminal for API logs:**
   - See all requests
   - Debug errors
   - Monitor database queries

4. **Keep backend running:**
   - All frontends need the backend
   - Backend = the brain, frontends = the faces

## ❓ Common Questions

**Q: Do I need all 3 frontends running?**
A: No, you can run just what you need. But backend is always required.

**Q: Can I change the ports?**
A: Yes, edit package.json in each frontend folder.

**Q: Where is the data stored?**
A: MySQL database (salon_db)

**Q: How do I stop everything?**
A: Press Ctrl+C in each terminal window

**Q: Can I deploy this?**
A: Yes! See deployment guides for Heroku, Vercel, or AWS.

---

🎉 **You now have a complete 3-module salon management system running!**

Need help? Check:
- SETUP_GUIDE.md (detailed setup)
- API_DOCUMENTATION.md (API reference)
- QUICK_REFERENCE.md (command cheat sheet)
