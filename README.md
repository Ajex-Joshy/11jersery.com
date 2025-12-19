# 11jersey.com - E-commerce Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://example.com/build-status) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) for selling football jerseys online. Includes features for both customers and administrators.

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **AI-powered support agent** built using **LangGraph** for stateful, multi-step conversational workflows
- **Full observability stack** with **Prometheus (metrics)**, **Grafana (dashboards)**, and **Loki (centralized logging)**
- Fully **Dockerized services** for consistent development and production environments
- Frontend data management using **TanStack Query** for caching, synchronization,optimistic updates and performance optimization
- **CI/CD pipelines implemented using GitHub Actions** for automated build, test, and deployment workflows
- **Redis** used for caching and performance optimization
- **Concurrency Control:** Leveraged MongoDB ACID transactions and atomic operations to ensure data integrity during high-concurrency order processing, effectively preventing race conditions and inventory over-selling.
- **Socket.IO** used for real-time communication with the AI support agent
- **JWT token blacklisting** for secure logout and compromised token invalidation

## Technology Stack

### Frontend

- React
- Redux Toolkit
- TanStack Query
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- JWT authentication with token blacklisting
- Redis (caching)
- Socket.IO (real-time communication)

### AI & Data

- LangGraph (AI support agent orchestration)
- Pinecone (vector database)

### Infrastructure & DevOps

- Nginx reverse proxy
- Docker & Docker Compose
- AWS EC2 (backend hosting)
- AWS Amplify (frontend hosting)
- AWS S3 (image storage)
- GitHub Actions (CI/CD)
- Prometheus, Grafana, Loki (observability)

## Project Structure

```
11jersey/
├── client/                        # Frontend (React + Vite)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── api/                   # API clients & service wrappers
│   │   ├── app/                   # App-level providers & store config
│   │   ├── components/            # Reusable UI components
│   │   ├── features/              # Feature-based modules (Redux slices)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── routes/                # Application routing
│   │   ├── utils/                 # Helper utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example               # Frontend environment variables
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── ai/                        # AI support agent
│   ├── config/                    # Configuration (DB, Redis, S3, etc.)
│   ├── controllers/               # Request handlers
│   ├── middlewares/               # Auth, validation, error handling
│   ├── models/                    # Mongoose schemas & models
│   ├── routes/                    # API route definitions
│   ├── services/                  # Business logic & integrations
│   ├── utils/                     # Shared utilities & helpers
│   ├── socket/                    # Socket.IO handlers (support agent)
│   ├── jobs/                      # Background jobs / schedulers
│   ├── validations/               # Request validation schemas
│   ├── .env.example               # Backend environment variables
│   ├── package.json
│   └── server.js
│
├── docker-compose.yml             # Multi-service orchestration
├── .github/
│   └── workflows/                # GitHub Actions CI/CD pipelines
│
├── .gitignore
├── LICENSE
└── README.md
```

## Prerequisites

Ensure the following are installed and configured before running the application:

- Node.js (LTS recommended)
- MongoDB (local or managed instance)
- Redis
- Docker & Docker Compose (optional but recommended)
- AWS account (for S3, EC2, Amplify integrations)
- Git

## Installation

Clone the repository and install dependencies for both backend and frontend:

```bash
git clone https://github.com/Ajex-Joshy/11jersery.com.git
cd 11jersey.com
```

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Environment Variables

Create `.env.development` files using the provided `.env.example` files for both backend and frontend:

- `server/.env.example`
- `client/.env.example`

## Running the Application

### Development (Local)

```bash
# Start backend
cd server
npm run dev
```

```bash
# Start frontend
cd client
npm run dev
```

### Docker (Recommended)

```bash
docker-compose up --build
```

## Contributing

Contributions are welcome and appreciated.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes following conventional commits
4. Push to your branch
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
