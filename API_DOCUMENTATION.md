# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

### Register
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "role": "user"  // "user" or "owner"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/auth/login`

Authenticate and receive a token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

Get the currently logged-in user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890",
    "role": "user",
    "avatar_url": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Salons

### Get All Salons
**GET** `/salons`

Get a list of all active salons (public endpoint).

**Query Parameters:**
- `city` (optional) - Filter by city
- `search` (optional) - Search in name and description
- `limit` (optional, default: 10) - Number of results
- `offset` (optional, default: 0) - Pagination offset

**Example:**
```
GET /api/salons?city=New York&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Beautiful Hair Salon",
      "description": "Professional hair and beauty services",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "phone": "555-1234",
      "rating": 4.5,
      "owner_name": "John Doe"
    }
  ],
  "count": 1
}
```

### Get Salon by ID
**GET** `/salons/:id`

Get detailed information about a specific salon.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "name": "Beautiful Hair Salon",
    "description": "Professional hair and beauty services",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "phone": "555-1234",
    "email": "info@beautifulhair.com",
    "opening_time": "09:00:00",
    "closing_time": "18:00:00",
    "rating": 4.5,
    "owner_name": "John Doe",
    "owner_email": "owner@example.com"
  }
}
```

### Create Salon
**POST** `/salons`

Create a new salon (requires owner or admin role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Beautiful Hair Salon",
  "description": "Professional hair and beauty services",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phone": "555-1234",
  "email": "info@beautifulhair.com",
  "openingTime": "09:00",
  "closingTime": "18:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Salon created successfully",
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "name": "Beautiful Hair Salon",
    ...
  }
}
```

### Update Salon
**PUT** `/salons/:id`

Update salon information (owner can only update their own salon).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Salon Name",
  "description": "Updated description",
  "phone": "555-5678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Salon updated successfully",
  "data": {
    ...updated salon data
  }
}
```

### Delete Salon
**DELETE** `/salons/:id`

Delete a salon (owner can only delete their own salon).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Salon deleted successfully"
}
```

## Admin Routes

### Get All Users
**GET** `/admin/users`

Get list of all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "phone": "1234567890",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get All Salons (Admin)
**GET** `/admin/salons`

Get all salons including inactive ones (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### Get Statistics
**GET** `/admin/stats`

Get system-wide statistics (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalOwners": 25,
    "totalSalons": 30,
    "totalAppointments": 500,
    "totalRevenue": 15000.00
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. Consider adding this for production:
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Pagination

For endpoints that return lists, use:
- `limit` - Number of items (default: 10, max: 100)
- `offset` - Skip items (default: 0)

Example:
```
GET /api/salons?limit=20&offset=40
```

This returns items 41-60.

## Future Endpoints (To Be Implemented)

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Services
- `GET /api/services` - Get all services
- `GET /api/salons/:id/services` - Get salon's services
- `POST /api/services` - Create service (owner)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/salons/:id/reviews` - Get salon reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Staff
- `GET /api/salons/:id/staff` - Get salon staff
- `POST /api/staff` - Add staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Remove staff

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "1234567890",
    "role": "user"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get salons:
```bash
curl http://localhost:5000/api/salons
```

### Create salon (replace TOKEN):
```bash
curl -X POST http://localhost:5000/api/salons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Salon",
    "address": "123 Test St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phone": "555-1234"
  }'
```
