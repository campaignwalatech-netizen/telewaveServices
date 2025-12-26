# Telewave Services - Campaign Management Platform

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [User Roles & Permissions](#user-roles--permissions)
- [Workflow](#workflow)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

**Telewave Services** (also known as **Campaignwala** or **Freelancerwala**) is a comprehensive campaign and lead management platform designed for managing telemarketing operations, data distribution, user management, and financial transactions. The platform supports three distinct user roles: **Admin**, **Team Leader (TL)**, and **HR Users**, each with specific permissions and dashboards.

### Key Purpose
- **Data Management**: Upload, distribute, and track customer data/leads
- **User Management**: Manage HR users, Team Leaders, and their assignments
- **Lead Tracking**: Track lead status (pending, contacted, converted, rejected, not reachable)
- **Financial Management**: Wallet system, withdrawals, and payment tracking
- **Analytics**: Comprehensive analytics and reporting for data distribution and performance
- **KYC Management**: User KYC verification and approval workflow

---

## 🏗️ Architecture

The project follows a **full-stack architecture** with clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin Panel  │  │  TL Dashboard │  │ User Dashboard│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │   Models     │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Users      │  │     Data     │  │   Leads      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.9.4
- **State Management**: Redux Toolkit 2.9.1 + Redux Persist
- **Styling**: Tailwind CSS 4.1.14
- **UI Components**: Lucide React (Icons)
- **Notifications**: React Hot Toast 2.6.0
- **Charts**: Recharts 3.3.0
- **PDF Generation**: jsPDF 3.0.3
- **Image Processing**: html2canvas 1.4.1
- **Carousel**: Swiper 12.0.3

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 3.0.3
- **File Upload**: Multer 2.0.2
- **Email Service**: Nodemailer 7.0.10 + Resend 6.6.0
- **Excel Processing**: ExcelJS 4.4.0, XLSX 0.18.5
- **API Documentation**: Swagger/OpenAPI 3.0
- **CORS**: cors 2.8.5

---

## 📁 Project Structure

```
telewaveServices/
├── Campaignwala-Backend/          # Backend API Server
│   ├── src/
│   │   ├── config/               # Database & Swagger configuration
│   │   ├── constants/            # HTTP status codes, roles
│   │   ├── middleware/           # Authentication, upload, user middleware
│   │   ├── modules/              # Feature modules (MVC pattern)
│   │   │   ├── adminlogs/        # Admin activity logging
│   │   │   ├── categories/       # Category management
│   │   │   ├── dashboard/        # Dashboard analytics
│   │   │   ├── data/             # Data distribution & management
│   │   │   ├── leads/            # Lead management
│   │   │   ├── notifications/   # Notification system
│   │   │   ├── offers/           # Offer management
│   │   │   ├── queries/          # User queries
│   │   │   ├── slides/           # Banner slides
│   │   │   ├── users/            # User management & authentication
│   │   │   ├── wallet/           # Wallet system
│   │   │   └── withdrawal/       # Withdrawal management
│   │   ├── router/               # Main router
│   │   └── utils/                # Email service, Excel parser
│   ├── index.js                   # Entry point
│   └── package.json
│
├── Campaignwala-Frontend/         # Frontend React Application
│   ├── src/
│   │   ├── adminDashboard/       # Admin panel components & pages
│   │   │   ├── components/       # Reusable admin components
│   │   │   ├── forms/            # Admin forms (offers, categories, etc.)
│   │   │   ├── notifications/   # Admin notification pages
│   │   │   └── pages/            # Admin pages (data, analytics, etc.)
│   │   ├── tlDashboard/           # Team Leader dashboard
│   │   │   ├── Components/        # TL components
│   │   │   └── pages/            # TL pages
│   │   ├── userDashboard/         # HR User dashboard
│   │   │   ├── components/       # User components
│   │   │   ├── layouts/         # User layout pages
│   │   │   └── pages/            # User pages
│   │   ├── components/            # Shared components
│   │   ├── context-api/          # React Context (Auth, Theme)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Auth pages (Login, Register, etc.)
│   │   ├── redux/                  # Redux store & slices
│   │   ├── routes/                 # Routing configuration
│   │   ├── services/               # API service layer
│   │   ├── theme/                  # Theme configuration
│   │   └── utils/                  # Utility functions
│   ├── public/                     # Static assets
│   └── package.json
│
└── README.md                       # This file
```

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-step Registration**: Phone OTP → Email OTP → Admin Approval
- **Role-based Access Control**: Admin, Team Leader (TL), HR User
- **JWT Token Authentication**: Secure session management
- **Password Reset**: OTP-based password recovery
- **Session Management**: Persistent sessions with Redux Persist

### 👥 User Management
- **User Registration**: With phone and email verification
- **Admin Approval Workflow**: Admin reviews and approves/rejects users
- **TL Assignment**: Assign users to Team Leaders
- **User Status Management**: Active, Hold, Dead, Pending Approval
- **KYC Management**: Document upload and verification
- **Attendance Tracking**: Daily attendance marking (00:01 AM - 10:00 AM IST)

### 📊 Data Management
- **Bulk Data Upload**: CSV/Excel file import
- **Data Distribution**: Multiple distribution methods:
  - Present HR Today
  - Present HR without Data Today
  - All Active HR Users
  - To Particular Employee (User or TL)
  - To Team Leaders (bulk)
  - To Specific Team Leader
- **Data Tracking**: Track data status (pending, assigned, contacted, converted, rejected, not reachable)
- **Data Analytics**: Comprehensive analytics dashboard
- **Data Export**: Export data to Excel/CSV

### 📈 Lead Management
- **Lead Status Tracking**: Pending, Contacted, Converted, Rejected, Not Reachable
- **ABC Analytics**: Performance analytics with charts
- **Lead Assignment**: Assign leads to users
- **Lead History**: Track lead interactions and status changes

### 💰 Financial Management
- **Wallet System**: User wallet with balance tracking
- **Withdrawal Requests**: Users can request withdrawals
- **Payment Tracking**: Track payment status
- **Transaction History**: Complete transaction logs

### 📢 Content Management
- **Offers Management**: Create, approve, and manage offers
- **Categories**: Organize offers by categories
- **Banner Slides**: Manage homepage banner slides
- **Notifications**: System-wide and user-specific notifications

### 📱 Dashboard Features
- **Admin Dashboard**: 
  - Data distribution management
  - User management
  - Analytics and reports
  - KYC approval
  - Payment withdrawal approval
- **TL Dashboard**:
  - Team management
  - Data distribution to team members
  - Team performance analytics
  - Withdrawal data management
- **User Dashboard**:
  - Today's assigned data
  - Previous data
  - Closed data
  - Wallet and withdrawals
  - Profile and KYC
  - Digital identity card

### 🎨 UI/UX Features
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-first responsive layout
- **Toast Notifications**: User-friendly notifications
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error handling
- **Form Validation**: Client-side and server-side validation

---

## 👤 User Roles & Permissions

### 🔴 Admin
**Full system access with all permissions:**
- User management (approve/reject, assign TL, change status)
- Data upload and distribution
- Analytics and reporting
- KYC approval
- Payment withdrawal approval
- Offer and category management
- System configuration
- Admin activity logs

### 🟡 Team Leader (TL)
**Team management and data distribution:**
- View and manage assigned team members
- Distribute data to team members
- View team performance analytics
- Withdraw data from team members
- View team statistics
- Manage team assignments

### 🟢 HR User
**Lead management and personal operations:**
- View assigned data/leads
- Update lead status (contacted, converted, rejected, not reachable)
- Mark attendance
- View wallet and request withdrawals
- Submit KYC documents
- View profile and digital identity card
- Submit queries

---

## 🔄 Workflow

### 1. User Registration Flow
```
User Registration
    ↓
Phone OTP Verification
    ↓
Email OTP Verification
    ↓
Admin Approval (Pending Status)
    ↓
Admin Approves/Rejects
    ↓
If Approved → TL Assignment (Optional)
    ↓
User Can Login
```

### 2. Data Distribution Flow
```
Admin Uploads Data (CSV/Excel)
    ↓
Data Stored as "Pending"
    ↓
Admin Distributes Data (Multiple Methods)
    ↓
Data Assigned to Users/TLs
    ↓
Users Work on Data (Update Status)
    ↓
Status: Pending → Contacted → Converted/Rejected/Not Reachable
    ↓
Analytics Updated
```

### 3. Lead Management Flow
```
User Receives Assigned Data
    ↓
User Contacts Lead
    ↓
Update Status: Contacted
    ↓
Lead Response:
    - Converted (Success)
    - Rejected (Not Interested)
    - Not Reachable
    ↓
Statistics Updated
```

### 4. KYC Submission Flow
```
User Submits KYC Details
    ↓
Email OTP Verification
    ↓
KYC Status: Pending
    ↓
Admin Reviews KYC
    ↓
Admin Approves/Rejects
    ↓
If Approved → User Can Request Withdrawals
```

### 5. Withdrawal Flow
```
User Requests Withdrawal
    ↓
Admin Reviews Request
    ↓
Admin Approves/Rejects
    ↓
If Approved → Payment Processed
    ↓
Wallet Balance Updated
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **MongoDB**: v6+ (local or cloud instance)
- **npm** or **yarn**: Package manager

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd Campaignwala-Backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/campaignwala_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
EMAIL_SERVICE_API_KEY=your_email_service_api_key
FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB service:**
```bash
# On macOS/Linux
sudo systemctl start mongod
# or
mongod

# On Windows
net start MongoDB
```

5. **Run the backend:**
```bash
npm run dev
# or
npm start
```

Backend will run on `http://localhost:8080`
API Documentation: `http://localhost:8080/api-docs`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd Campaignwala-Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

4. **Run the frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Build

**Frontend:**
```bash
cd Campaignwala-Frontend
npm run build
```

Build output will be in `dist/` directory.

**Backend:**
```bash
cd Campaignwala-Backend
npm start
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8080/api`
- **Production**: (Configure in environment variables)

### Authentication
Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
- `POST /users/send-otp` - Send OTP to phone number
- `POST /users/register` - Register new user
- `POST /users/verify-otp` - Verify OTP
- `POST /users/login` - User login
- `POST /users/admin/login` - Admin login
- `POST /users/forgot-password` - Request password reset

#### Data Management
- `POST /data/admin/bulk-add` - Upload bulk data (Admin)
- `POST /data/admin/bulk-assign` - Bulk assign data (Admin)
- `GET /data/admin/pending-data` - Get pending data (Admin)
- `GET /data/admin/today-assigned-data` - Get today's assigned data (Admin)
- `GET /data/user/data` - Get user's assigned data
- `GET /data/user/previous-data` - Get user's previous data
- `GET /data/user/closed-data` - Get user's closed data

#### User Management
- `GET /users/admin/users` - Get all users (Admin)
- `PUT /users/admin/approve/:userId` - Approve user (Admin)
- `PUT /users/admin/reject/:userId` - Reject user (Admin)
- `PUT /users/admin/assign-tl/:userId` - Assign TL to user (Admin)

#### Wallet & Withdrawals
- `GET /wallet/balance` - Get wallet balance
- `POST /withdrawal/request` - Request withdrawal
- `GET /withdrawal/admin/pending` - Get pending withdrawals (Admin)
- `PUT /withdrawal/admin/approve/:id` - Approve withdrawal (Admin)

### Complete API Documentation
Access Swagger documentation at: `http://localhost:8080/api-docs`

---

## 🛠️ Development Guidelines

### Code Structure
- **Backend**: Follow MVC pattern (Model-View-Controller)
- **Frontend**: Component-based architecture with hooks
- **Services**: API calls separated into service files
- **Routes**: Centralized routing in `AppRouter.jsx`

### Naming Conventions
- **Components**: PascalCase (e.g., `UserDashboard.jsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### State Management
- **Global State**: Redux Toolkit
- **Local State**: React Hooks (useState, useEffect)
- **Theme State**: Context API
- **Auth State**: Redux + Context API

### Error Handling
- **Frontend**: Toast notifications for user feedback
- **Backend**: Consistent error response format
- **API Errors**: Handled in service layer

### Testing
- **Frontend**: Vitest + React Testing Library
- **Test Files**: Located in `tests/` directory
- **Run Tests**: `npm test`

### Git Workflow
- **Main Branch**: Production-ready code
- **Feature Branches**: Feature development
- **Commit Messages**: Descriptive and clear

### Environment Variables
- **Backend**: `.env` file in `Campaignwala-Backend/`
- **Frontend**: `.env` file in `Campaignwala-Frontend/`
- **Never commit**: `.env` files (in `.gitignore`)

---

## 📝 Important Notes

### Database Models
- **User**: Authentication, profile, KYC, attendance, statistics
- **DataDistribution**: Customer data, assignments, status tracking
- **Lead**: Lead management and tracking
- **Wallet**: User wallet and transactions
- **Withdrawal**: Withdrawal requests and approvals
- **Notification**: System notifications
- **Offer**: Offer management
- **Category**: Category organization

### Key Features Implementation
- **OTP System**: Email-based OTP for authentication and KYC
- **Attendance**: Time-restricted attendance marking (00:01 AM - 10:00 AM IST)
- **Data Distribution**: Multiple distribution algorithms (equal, performance-based, etc.)
- **Analytics**: Real-time analytics with date filtering
- **Dark Mode**: System-wide dark mode with localStorage persistence

### Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configured for specific origins
- **Input Validation**: Server-side and client-side validation
- **File Upload**: Secure file upload with validation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For issues, questions, or contributions, please contact the development team.

---

## 🎯 Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics with ML predictions
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting and exports
- [ ] Integration with third-party services
- [ ] Automated data distribution algorithms
- [ ] Performance optimization

---

**Last Updated**: 2025-01-23
**Version**: 1.0.0
**Maintained By**: Telewave Services Development Team
