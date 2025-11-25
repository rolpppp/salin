# 💰 Salin - Personal Money Tracker

> A modern, intelligent web-based money tracker designed specifically for college students to manage their finances effortlessly.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://salinmt.netlify.app)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org)

---

## 📖 About

**salin** (Bisaya word for "remaining" -- in this context, remaining balance/money) is a Progressive Web App (PWA) that helps college students track their daily expenses, monitor their budgets, and gain insights into their spending habits. Built with simplicity and efficiency in mind, Salin provides an intuitive interface for managing multiple accounts, categorizing transactions, and even parsing transaction details from text using AI.

### Why Salin?

- **Student-Focused**: Designed with the needs of college students in mind
- **Privacy-First**: Your financial data stays secure with Supabase authentication
- **Intelligent Parsing**: AI-powered transaction parsing using Google Gemini
- **Multi-Account**: Track multiple accounts (cash, bank cards, digital wallets)
- **Budget Tracking**: Set and monitor budgets by category
- **Offline-Ready**: Works offline as a PWA with service worker caching
- **Mobile-First**: Responsive design optimized for mobile devices

---

## ✨ Core Features

### 💳 Account Management

- Create and manage multiple accounts (Cash, Bank, E-Wallet)
- Real-time balance tracking
- Account type categorization with custom icons

### 📊 Transaction Tracking

- Add income and expense transactions
- Edit and delete transactions with balance recalculation
- Search and filter transactions by date, type, or category
- Transaction history with detailed view

### 🏷️ Category System

- Pre-defined categories (Food, Transportation, Shopping, etc.)
- Custom category creation
- Category-based spending analysis
- Visual indicators with emojis

### 📈 Budget Management

- Set monthly budgets by category
- Real-time budget progress tracking
- Visual alerts for budget thresholds
- Spending analytics and insights

### 🤖 AI-Powered Parsing

- Parse transaction details from text using Google Gemini
- Automatic extraction of:
  - Transaction amount
  - Description/title
  - Category
  - Date
- Review and edit parsed transactions before saving

### 📱 Dashboard

- Quick overview of all accounts
- Recent transactions
- Budget summaries
- Spending insights
- Send feedback directly to developers

### 🔐 Authentication

- Secure email/password authentication
- Password reset functionality
- JWT-based session management
- Protected routes and API endpoints

### 💬 Feedback System

- In-app feedback form
- Multiple feedback types (Bug, Feature, Improvement, General)
- Email notifications via Resend API
- User-friendly modal interface

---

## 🛠️ How It Works

### Architecture

Salin follows a modern client-server architecture:

```
┌─────────────────────────────────────────────┐
│           Client (Vanilla JS PWA)           │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Pages  │ │Components│ │Service Worker│  │
│  └─────────┘ └──────────┘ └──────────────┘  │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────┐
│         Backend (Node.js/Express)           │
│  ┌───────────┐ ┌──────────┐ ┌─────────────┐ │
│  │Controllers│ │Middleware│ │   Services  │ │
│  └───────────┘ └──────────┘ └─────────────┘ │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐  ┌────────▼────────┐
│   Supabase     │  │  Google Gemini  │
│  (PostgreSQL)  │  │   (AI Parsing)  │
└────────────────┘  └─────────────────┘
```

### Technology Stack

**Frontend:**

- Vanilla JavaScript (ES6+ modules)
- HTML5 & CSS3
- Service Worker for PWA functionality
- Local Storage for offline data

**Backend:**

- Node.js with Express 5.x
- RESTful API architecture
- JWT authentication
- Serverless deployment (Netlify Functions)

**Database & Services:**

- Supabase (PostgreSQL with Row Level Security)
- Google Gemini API (AI text parsing)
- Resend (Email notifications)

**Deployment:**

- Netlify (Frontend & Serverless Functions)
- GitHub Actions for CI/CD

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account
- Google Gemini API key (optional, for parsing feature)
- Resend API key (optional, for feedback emails)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rolpppp/salin.git
   cd salin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key

   # JWT Secret
   JWT_SECRET=your_jwt_secret

   # Google Gemini (Optional)
   GEMINI_API_KEY=your_gemini_api_key

   # Server Configuration
   PORT=3000
   CLIENT_URL=http://localhost:8080

   # Resend Email (Optional)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=Salin Feedback <onboarding@resend.dev>
   FEEDBACK_EMAIL=your_email@example.com
   ```

4. **Set up Supabase database**

   Run the SQL migrations in your Supabase SQL Editor:
   - Create tables for users, accounts, categories, transactions, and budgets
   - Set up Row Level Security policies
   - Create database triggers for balance updates

5. **Run the development server**

   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on `http://localhost:3000`
   - Frontend client on `http://localhost:8080`

6. **Open the app**

   Navigate to `http://localhost:8080` in your browser

---

## 👨‍💻 For Developers

### Project Structure

```
salin/
├── api/                        # Backend API
│   ├── index.js               # Main entry point & serverless handler
│   └── _app/
│       ├── config/            # Configuration files
│       │   └── supabase.js    # Supabase client setup
│       ├── controllers/       # Request handlers
│       │   ├── auth.controller.js
│       │   ├── account.controller.js
│       │   ├── transaction.controller.js
│       │   ├── category.controller.js
│       │   ├── budget.controller.js
│       │   ├── dashboard.controller.js
│       │   ├── parsing.controller.js
│       │   ├── feedback.controller.js
│       │   └── user.controller.js
│       ├── middleware/         # Express middleware
│       │   └── auth.js        # JWT authentication
│       ├── routes/            # API routes
│       │   ├── auth.routes.js
│       │   ├── account.routes.js
│       │   ├── transaction.routes.js
│       │   ├── category.routes.js
│       │   ├── budget.routes.js
│       │   ├── dashboard.routes.js
│       │   ├── parsing.routes.js
│       │   └── feedback.routes.js
│       └── services/          # Business logic services
│           ├── email.service.js
│           └── gemini.services.js
│
├── client/                    # Frontend application
│   └── public/
│       ├── index.html         # Main HTML entry
│       ├── manifest.json      # PWA manifest
│       ├── sw.js             # Service worker
│       ├── assets/           # Static assets
│       │   ├── icons/        # App icons
│       │   └── svg/          # SVG images
│       └── src/
│           ├── js/
│           │   ├── app.js            # Main app logic & router
│           │   ├── api.js            # API client
│           │   ├── utils.js          # Utility functions
│           │   ├── components/       # Reusable components
│           │   │   ├── BudgetForm.js
│           │   │   ├── FeedbackForm.js
│           │   │   ├── Modal.js
│           │   │   ├── ParseReview.js
│           │   │   ├── Toast.js
│           │   │   └── TransactionForm.js
│           │   └── pages/            # Page modules
│           │       ├── dashboard.js
│           │       ├── account.js
│           │       ├── categories.js
│           │       ├── transaction.js
│           │       ├── onboarding.js
│           │       └── auth/
│           │           ├── login.js
│           │           ├── callback.js
│           │           ├── forgotPassword.js
│           │           └── resetPassword.js
│           └── styles/
│               ├── main.css          # Main styles
│               ├── reset.css         # CSS reset
│               └── variables.css     # CSS variables
│
├── .env                       # Environment variables (not in git)
├── .env.example              # Example env file
├── netlify.toml              # Netlify configuration
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

### Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run server

# Start client with live-server
npm run client

# Run both server and client concurrently
npm run dev

# Format code with Prettier
npm run format
```

### API Endpoints

#### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### User

- `GET /api/user` - Get current user profile
- `PUT /api/user` - Update user profile

#### Accounts

- `GET /api/accounts` - Get all user accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

#### Transactions

- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

#### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Budgets

- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

#### Dashboard

- `GET /api/dashboard` - Get dashboard data

#### Parsing

- `POST /api/parsing/parse-text` - Parse transaction from text

#### Feedback

- `POST /api/feedback` - Submit feedback

### Database Schema

**Key Tables:**

- `users` - User profiles (synced with Supabase Auth)
- `accounts` - User financial accounts
- `categories` - Transaction categories
- `transactions` - Income/expense records
- `budgets` - Budget allocations

**Features:**

- Row Level Security (RLS) policies
- Database triggers for automatic balance updates
- Indexes for query optimization
- Foreign key constraints for data integrity

### Adding New Features

1. **Create a controller** in `api/_app/controllers/`
2. **Define routes** in `api/_app/routes/`
3. **Register routes** in `api/index.js`
4. **Create frontend page/component** in `client/public/src/js/`
5. **Update router** in `client/public/src/js/app.js`
6. **Add API client methods** in `client/public/src/js/api.js`

### Code Style

- Use ES6+ features (arrow functions, async/await, destructuring)
- Follow modular architecture
- Write descriptive commit messages
- Use Prettier for code formatting
- Keep functions small and focused
- Add JSDoc comments for complex functions

### Testing Locally

1. Start the dev server: `npm run dev`
2. Test authentication flow
3. Test all CRUD operations
4. Test offline functionality (disable network in DevTools)
5. Test on mobile viewport
6. Check console for errors

### Deployment

**Automatic Deployment:**

- Push to `main` branch triggers Netlify deployment
- Build time: ~1-2 minutes
- Environment variables configured in Netlify dashboard

**Manual Deployment:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

### Environment Variables (Production)

Set these in Netlify dashboard:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `GEMINI_API_KEY` (optional)
- `RESEND_API_KEY` (optional)
- `RESEND_FROM_EMAIL` (optional)
- `FEEDBACK_EMAIL` (optional)

### Debugging

**Backend Issues:**

- Check Netlify function logs
- Add `console.log` statements
- Test endpoints with Postman/curl
- Verify environment variables

**Frontend Issues:**

- Open browser DevTools Console
- Check Network tab for API calls
- Verify token in localStorage
- Test in incognito mode

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Common Issues & Solutions

**502 Bad Gateway on Netlify:**

- Check if all required environment variables are set
- Verify Supabase credentials are correct
- Check function logs in Netlify dashboard

**Authentication not working:**

- Verify JWT_SECRET is set
- Check token expiration
- Clear localStorage and try again

**Transactions not updating balance:**

- Check database triggers are enabled
- Verify RLS policies allow the operation
- Check console for SQL errors

**AI Parsing not working:**

- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Test with simpler text input

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Google Gemini](https://ai.google.dev) - AI-powered text parsing
- [Resend](https://resend.com) - Email API
- [Netlify](https://netlify.com) - Hosting and deployment
- [Feather Icons](https://feathericons.com) - Beautiful open-source icons

---

## 📞 Support

For issues, questions, or suggestions:

- Open an [issue](https://github.com/rolpppp/salin/issues)
- Use the feedback form in the app
- Contact: proj.salin@gmail.com

---

**Made with ❤️ for college students managing their finances**
