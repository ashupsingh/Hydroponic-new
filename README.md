# 🌱 GreevaTech Hydroponic Management System

A modern, full-stack IoT dashboard for monitoring and managing hydroponic systems with real-time sensor data visualization, user management, and issue tracking.

![Dashboard Preview](https://img.shields.io/badge/Status-Production-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

### User Dashboard
- **Real-time Sensor Monitoring**: Track temperature, humidity, pH, EC, water level, and light intensity
- **24-Hour Historical Data**: Interactive charts showing sensor trends
- **Device Management**: Rename devices and customize device order
- **Issue Reporting**: Report problems directly from the dashboard
- **Responsive Design**: Glassmorphic UI with dark theme optimized for all devices

### Admin Panel
- **User Management**: View all users, assign/unassign devices, manage roles
- **Device Assignment**: Register new devices and assign them to users
- **Issue Management**: View, respond to, and resolve user-reported issues
- **Real-time Notifications**: Badge alerts for new users and open issues
- **Analytics Dashboard**: Overview of system statistics and widgets

### Authentication & Security
- **Email OTP Verification**: Secure signup with email verification
- **Role-based Access Control**: Separate admin and user dashboards
- **Password Reset**: OTP-based password recovery
- **JWT Authentication**: Secure token-based sessions

## 🛠️ Tech Stack

### Frontend
- **React** (Vite) - Fast, modern UI framework
- **React Router** - Client-side routing
- **Recharts** - Interactive data visualization
- **React Icons** - Beautiful icon library

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **Nodemailer** - Email service for OTP
- **bcryptjs** - Password hashing

### Deployment
- **Vercel** - Serverless deployment platform
- **MongoDB Atlas** - Cloud database

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account (for email service)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashupsingh/Hydroponic-new.git
   cd Hydroponic-new
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   EMAIL_FROM=Your Name <noreply@yourdomain.com>
   ```

   **Note**: For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833)

4. **Run the development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   node index.js
   ```

   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

   Terminal 3 (Sensor Simulator - Optional):
   ```bash
   cd server
   node simulator.js
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🌐 Production Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel deploy --prod
   ```

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Project Settings → Environment Variables, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`

4. **MongoDB Atlas Network Access**
   
   Allow Vercel's dynamic IPs:
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere)

### Generating Demo Sensor Data

For production demos without running a local simulator:

1. **Open `sensor-generator.html`** in your browser
2. **Keep the tab open** during your demo
3. Sensor data will update automatically every 2 seconds

Alternatively, manually trigger updates:
```
GET https://your-app.vercel.app/api/update-sensors
```

## 📱 Usage

### First Time Setup

1. **Sign Up** as a new user
2. **Verify Email** using the OTP sent to your email
3. **Login** with your credentials
4. **Admin Access**: Contact system administrator for admin role assignment

### User Workflow

1. **View Dashboard**: See all assigned devices and their current sensor readings
2. **Monitor History**: Click on any device to view 24-hour historical data
3. **Report Issues**: Use the "Raise Issue" button to report problems
4. **Manage Devices**: Rename devices or reorder them via drag-and-drop

### Admin Workflow

1. **User Management**: View all users, see registration dates, assign devices
2. **Device Registration**: Register new IoT devices with unique IDs
3. **Issue Resolution**: Respond to user issues and mark them as resolved
4. **System Monitoring**: Track overall system health and statistics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### User Routes
- `GET /api/user/devices` - Get user's devices
- `PUT /api/user/device/:id/rename` - Rename device
- `PUT /api/user/device-order` - Update device order
- `GET /api/user/device/:id/history` - Get sensor history
- `POST /api/user/issue` - Report an issue
- `GET /api/user/issues` - Get user's issues

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/devices` - Get all devices
- `POST /api/admin/device` - Register new device
- `POST /api/admin/assign-device` - Assign device to user
- `DELETE /api/admin/unassign-device/:deviceId` - Unassign device
- `GET /api/admin/issues` - Get all issues
- `PUT /api/admin/issue/:id/respond` - Respond to issue

### Utility
- `GET /api/health` - Health check
- `GET /api/update-sensors` - Manually update sensor data (demo)

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: 'user' | 'admin',
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date,
  deviceOrder: [ObjectId],
  userNumber: Number (auto-increment)
}
```

### Device
```javascript
{
  deviceId: String (unique),
  deviceName: String,
  assignedTo: ObjectId (User),
  sensors: {
    temperature: Number,
    humidity: Number,
    ph: Number,
    ec: Number,
    waterLevel: Number,
    lightIntensity: Number
  }
}
```

### SensorReading (TTL: 30 minutes)
```javascript
{
  deviceId: ObjectId,
  temperature: Number,
  humidity: Number,
  ph: Number,
  ec: Number,
  waterLevel: Number,
  lightIntensity: Number,
  timestamp: Date (expires after 1800s)
}
```

### Issue
```javascript
{
  userId: ObjectId,
  deviceId: ObjectId,
  subject: String,
  description: String,
  status: 'open' | 'in-progress' | 'resolved',
  adminResponse: String,
  respondedAt: Date
}
```

## 🎨 Design Features

- **Glassmorphism**: Modern frosted glass effect UI
- **Dark Theme**: Eye-friendly dark color scheme
- **Responsive Layout**: Mobile-first design
- **Smooth Animations**: Micro-interactions for better UX
- **Real-time Updates**: Auto-refresh every 2 seconds
- **Interactive Charts**: Hover effects and tooltips

## 🔐 Security Best Practices

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 1-hour expiration
- Email OTP verification (5-minute validity)
- Role-based access control
- Environment variables for sensitive data
- CORS enabled for API security

## 🐛 Troubleshooting

### Issue: 500 Error on Login/Signup
**Solution**: Check MongoDB Atlas Network Access allows `0.0.0.0/0`

### Issue: OTP Email Not Received
**Solution**: Verify Gmail App Password is correct and 2FA is enabled

### Issue: Sensor Values Not Updating
**Solution**: 
- For local: Run `node server/simulator.js`
- For production: Open `sensor-generator.html` in browser

### Issue: 404 on Page Refresh
**Solution**: Vercel routing is configured for SPA - should work automatically

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Ashutosh Pratap Singh**
- GitHub: [@ashupsingh](https://github.com/ashupsingh)

## 🙏 Acknowledgments

- Built with ❤️ for GreevaTech
- Inspired by modern IoT dashboards
- Special thanks to the open-source community

---

**Live Demo**: [https://hydroponic-new.vercel.app](https://hydroponic-new.vercel.app)

**Note**: This is a demonstration project. For production use, implement additional security measures and monitoring.
