# Campus Soko - Campus Marketplace

A modern campus marketplace where comrades can buy and sell items easily within their university.

![Campus Soko](https://via.placeholder.com/800x400?text=Campus+Soko)

## Features

### Authentication System
- User registration (name, email, password)
- JWT-based authentication
- Protected routes
- User profile management

### Marketplace
- Create listings with title, description, price, category, images, location
- Edit and delete your own listings
- View all listings with seller info
- Categories: Electronics, Books, Clothes, Furniture, Others

### Search & Filter
- Search by title/keywords
- Filter by category
- Sort by price (low to high, high to low)
- Sort by latest

### Real-time Chat
- One-on-one chat between buyer and seller
- Real-time messaging using Socket.io
- Online/offline status
- Chat history

### User Dashboard
- View all posted items
- Edit/delete listings
- View messages
- Profile management

## Tech Stack

- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.io
- **Authentication:** JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd campussoko
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Configure environment variables

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campussoko
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

5. Start MongoDB
```bash
# If using local MongoDB
mongod
```

6. Run the backend
```bash
cd server
npm run dev
```

7. Run the frontend (in a new terminal)
```bash
cd client
npm start
```

8. Open http://localhost:3000

## Project Structure

```
campussoko/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   └── messageController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   └── messageRoutes.js
│   └── index.js
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js
    │   │   ├── ListingCard.js
    │   │   ├── Loading.js
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── SocketContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── PostListing.js
    │   │   ├── ListingDetail.js
    │   │   ├── Dashboard.js
    │   │   ├── Messages.js
    │   │   ├── Profile.js
    │   │   └── Chat.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Listing Routes
- `GET /api/listings` - Get all listings (with filters)
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get single listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/my` - Get user's listings

### Message Routes
- `POST /api/messages` - Send message
- `GET /api/messages` - Get all messages
- `GET /api/messages/conversations` - Get conversation list
- `GET /api/messages/conversation/:userId` - Get conversation with user

## Socket Events

- `join` - Join user room
- `send_message` - Send a message
- `receive_message` - Receive a message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `mark_read` - Mark messages as read
- `user_online` - User came online
- `user_offline` - User went offline

## Future Enhancements

- [ ] M-Pesa payment integration
- [ ] Push notifications
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Listing boost with payments
- [ ] Image upload to cloud storage
- [ ] Mobile app

## License

MIT License

## Author

Built for comrades, by comrades 🏫
