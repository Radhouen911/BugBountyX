# Bug Bounty Platform

A full-stack bug bounty platform where companies can post security bounties and researchers can submit vulnerabilities to earn rewards.

## What This Is

This is a working prototype of a bug bounty platform built with Node.js, Express, MongoDB, and React. It handles the complete workflow: companies create bounties, researchers find and report vulnerabilities, and admins review submissions and process payments.

## Quick Start

**Prerequisites:** Node.js and MongoDB installed on your machine.

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Create .env file (or copy from .env.example)
cp .env.example .env

# Start MongoDB
mongod --dbpath data/db

# Seed the database with sample data
npm run seed

# Start the backend (in a new terminal)
npm run dev

# Start the frontend (in another terminal)
cd client && npm start
```

Visit http://localhost:3001 and you're good to go.

## Test Accounts

After seeding, you can log in with:

- **Admin:** admin@bugbounty.local / Admin123!
- **Company:** security@techcorp.com / Company123!
- **Researcher:** researcher@example.com / Researcher123!

## What Works

- User authentication with JWT
- Role-based access (researcher, company, admin)
- Companies can create and manage bounties
- Researchers can browse bounties and submit vulnerabilities
- File uploads for proof of concept
- Admin dashboard for reviewing submissions
- Mock payment system
- Input validation and security middleware

## What's Next

If you wanted to take this further, here are some ideas:

**Security & Production**

- Add refresh tokens for better JWT security
- Implement rate limiting per user (not just per IP)
- Add CSRF protection
- Set up proper logging (Winston or similar)
- Add email notifications for submissions and status updates
- Implement 2FA for admin accounts

**Features**

- Real payment integration (Stripe, PayPal)
- Private messaging between researchers and companies
- Reputation system with badges and leaderboards
- Duplicate detection for submissions
- Bounty templates for common vulnerability types
- Export reports to PDF
- Analytics dashboard with charts
- Public disclosure timeline after fixes

**User Experience**

- Real-time notifications with WebSockets
- Better search with Elasticsearch
- Markdown support for descriptions
- Dark mode
- Mobile app (React Native)

**Infrastructure**

- Add Redis for caching and sessions
- Set up CI/CD pipeline
- Add comprehensive test coverage
- Docker containerization
- Deploy to AWS/Azure/GCP
- CDN for file uploads

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer
**Frontend:** React, React Router, Axios, Context API
**Security:** Helmet, bcrypt, express-validator, rate limiting

## Project Structure

```
├── api/              API routes
├── client/           React frontend
├── config/           Database configuration
├── middleware/       Auth, validation, file upload
├── models/           MongoDB schemas
├── scripts/          Setup and seed scripts
└── uploads/          User-uploaded files
```

## Notes

This is a development setup. For production, you'd want to add proper error tracking, monitoring, backups, and all the usual production stuff. The payment system is mocked out, so you'd need to integrate a real payment provider.

The code is intentionally kept simple and readable. Feel free to refactor, add TypeScript, or restructure however you like.

## License

MIT
