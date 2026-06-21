# SkillSwap — Freelance Micro-Task Platform

A full-stack marketplace website where clients post small tasks and freelancers apply to complete them. Built with Next.js, Express.js, MongoDB, BetterAuth, and Stripe.

## Live Website

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## Purpose

SkillSwap is a marketplace for fast, one-time micro freelance jobs. Clients post tasks like "make a logo" or "fix a CSS bug", freelancers send proposals, and the best match gets hired and paid through Stripe.

## Key Features

- **Authentication**: Email/Password login + Google OAuth via BetterAuth
- **Role-based Access**: Client, Freelancer, and Admin dashboards
- **Task Management**: Post, edit, delete tasks with categories and budgets
- **Proposal System**: Freelancers can submit proposals with price and timeline
- **Stripe Payments**: Secure checkout for accepted proposals
- **Search & Filter**: Full-text search and category filtering on tasks
- **Server-side Pagination**: Browse tasks with paginated results (9 per page)
- **Reviews & Ratings**: Star ratings and comments after task completion
- **Admin Panel**: Manage users (block/unblock), tasks, and transactions
- **Dark/Light Mode**: Global theme toggle with persistent preference
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **React 18** — UI library
- **Tailwind CSS 3** — Utility-first CSS framework
- **Framer Motion** — Animation library
- **Lucide React** — Icon library
- **Axios** — HTTP client

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MongoDB + Mongoose** — Database and ODM
- **BetterAuth** — Authentication library
- **Stripe** — Payment processing
- **JWT + bcryptjs** — Token-based auth and password hashing
- **Cookie Parser** — Cookie middleware
- **CORS** — Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Google OAuth credentials (optional)

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, Stripe keys, and BetterAuth secrets
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
cp .env.local.example .env.local
# Edit .env.local with your API URL and Stripe publishable key
npm install
npm run dev
```

### Seed Admin Account

```bash
cd server
node seedAdmin.js
```

Default admin credentials:
- **Email:** admin@skillswap.com
- **Password:** Admin123

## Environment Variables

### Backend (.env)
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Secret key for BetterAuth |
| `BETTER_AUTH_URL` | Backend URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `FRONTEND_URL` | Frontend URL for CORS |
| `JWT_SECRET` | JWT signing secret |

### Frontend (.env.local)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## User Roles

| Role | Access |
|---|---|
| **Client** | Post tasks, manage proposals, pay via Stripe |
| **Freelancer** | Browse tasks, submit proposals, track earnings |
| **Admin** | Manage users, tasks, and view all transactions |

## Project Structure

```
skillswap/
├── server/                 # Express.js backend
│   ├── config/             # Database and auth config
│   ├── models/             # Mongoose models
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API route handlers
│   └── server.js           # Entry point
├── client/                 # Next.js frontend
│   ├── app/                # App Router pages
│   │   ├── (auth)/         # Login & Register
│   │   ├── dashboard/      # Client, Freelancer, Admin dashboards
│   │   ├── tasks/          # Browse & task details
│   │   ├── freelancers/    # Browse & profiles
│   │   └── payment/        # Stripe success page
│   ├── components/         # Reusable UI components
│   └── lib/                # Auth context and API helpers
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register-extra | Register new user |
| POST | /api/auth/login | Login with email/password |
| GET | /api/auth/session | Get current user session |
| GET | /api/tasks | Browse tasks (paginated) |
| GET | /api/tasks/latest | Latest open tasks |
| POST | /api/tasks | Create task (client) |
| PUT | /api/tasks/:id | Update task (client) |
| DELETE | /api/tasks/:id | Delete task (client) |
| GET | /api/proposals/freelancer/:email | Get freelancer proposals |
| POST | /api/proposals | Submit proposal (freelancer) |
| PUT | /api/proposals/:id/accept | Accept proposal (client) |
| PUT | /api/proposals/:id/reject | Reject proposal (client) |
| POST | /api/payments/create-checkout | Create Stripe checkout |
| GET | /api/users/freelancers | Browse freelancers |
| GET | /api/users/profile/:email | Get freelancer profile |
| PUT | /api/users/profile | Update profile |
| POST | /api/reviews | Submit review |

## License

MIT
