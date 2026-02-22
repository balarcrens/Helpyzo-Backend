# Home Service Backend API

This is a complete backend for a home service website built with Express.js, MongoDB, and JWT authentication.

## Project Structure

```
Home-service-backend/
├── config/           # Database and environment configuration
├── models/           # Mongoose schemas (User, Partner, Category, Booking)
├── controllers/      # Business logic handlers
├── routes/           # API endpoint definitions
├── middleware/       # Auth, validation, error handling, logging
├── .env              # Environment variables
├── package.json      # Dependencies
└── server.js         # Entry point
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Ensure MongoDB is running on your local machine:

```bash
mongod
```

3. The database "Helpyzo" will be created automatically on first connection.

## Running the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### User Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `PUT /api/users/change-password` - Change password (Protected)
- `GET /api/users/all` - Get all users (Superadmin only)
- `DELETE /api/users/:id` - Delete user (Superadmin only)

### Partner Management

- `POST /api/partners/register` - Register new partner
- `POST /api/partners/login` - Login partner
- `GET /api/partners` - Get all partners (Public)
- `GET /api/partners/:id` - Get partner details (Public)
- `GET /api/partners/profile` - Get partner profile (Protected)
- `PUT /api/partners/profile` - Update partner profile (Protected)
- `POST /api/partners/service` - Add service (Protected)
- `PUT /api/partners/service/:serviceId` - Update service (Protected)
- `DELETE /api/partners/service/:serviceId` - Delete service (Protected)
- `DELETE /api/partners/:id` - Delete partner (Superadmin only)

### Categories

- `GET /api/categories` - Get all categories (Public)
- `GET /api/categories/:id` - Get category by ID (Public)
- `POST /api/categories` - Create category (Superadmin only)
- `PUT /api/categories/:id` - Update category (Superadmin only)
- `DELETE /api/categories/:id` - Delete category (Superadmin only)

### Bookings

- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings` - Get all bookings (Protected)
- `GET /api/bookings/my-bookings` - Get user bookings (Protected)
- `GET /api/bookings/partner/bookings` - Get partner bookings (Protected)
- `GET /api/bookings/:id` - Get booking by ID (Protected)
- `PUT /api/bookings/:id` - Update booking (Protected)
- `PUT /api/bookings/:id/status` - Update booking status (Protected)
- `DELETE /api/bookings/:id` - Delete booking (Protected)

## Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Role-Based Access Control** - Client, Partner, and Superadmin roles
- **Input Validation** - express-validator for request validation
- **Global Error Handler** - Centralized error handling
- **Request Logging** - Morgan middleware for HTTP request logging
- **CORS** - Cross-origin resource sharing enabled
- **Data URL Support** - Images stored as Base64 data URLs
- **MongoDB Integration** - Mongoose ODM with proper schema design

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://balarcrens:Crens446@cluster0.tepwhhp.mongodb.net/Helpyzo?retryWrites=true&w=majority
JWT_SECRET=Helpyzo-Backend-JWT
JWT_EXPIRE=7d
NODE_ENV=development
```

## Authentication

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token is generated on user/partner registration and login and expire in 7 days.

## Models

### User

- name, email, phone, password
- address (street, landmark, city, state, pincode, country)
- role (client, superadmin)
- profileImage (data URL)

### Partner

- name, email, phone, password
- address (street, landmark, city, state, pincode, country)
- business (name, phone, contact)
- services (name, visitingFees, category, price, duration, description, image)
- workingHours (days, fromTime, toTime)
- isActive (boolean)
- paymentMethods (cash, card, online)
- profileImage (data URL)

### Category

- name, description, image (data URL)

### Booking

- serviceId, partner, user
- status (pending, confirmed, in-progress, completed, cancelled)
- notes, paymentMethod, amount
- bookedDate

## Next Steps

1. Install dependencies: `npm install`
2. Start MongoDB
3. Run `npm run dev` to start the development server
4. Use Postman or similar tool to test API endpoints
5. Connect this backend to your React frontend

## License

ISC