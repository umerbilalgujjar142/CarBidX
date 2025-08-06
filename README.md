# 🚗 Scalable Live Car Bidding System

## ✨ Features

- **🎯 Real-time Bidding:** WebSocket Gateway with Socket.IO for instant bid updates
- **💾 Database Integration:** PostgreSQL with Prisma ORM for auctions, bids, and users
- **🔒 Concurrency Management:** Optimistic locking and transactions for high-frequency bidding
- **⚡ Redis Caching & Pub/Sub:** Caches current bids, manages sessions, broadcasts updates
- **📨 RabbitMQ Queues:** Reliable bid processing, notifications, and dead letter queue
- **🛡️ Rate Limiting & DDoS Protection:** Custom NestJS guards with distributed throttling
- **🏆 Winner Selection:** Automatic winner determination and database storage
- **🔄 Auction Management:** Reset, join, bid, and end auction functionality

## 🛠️ Tech Stack

- **Backend:** NestJS, TypeScript
- **Real-time:** Socket.IO
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis (ioredis)
- **Message Queue:** RabbitMQ
- **Infrastructure:** Docker Compose

## 🚀 Getting Started

1. **Clone and Install**

```bash
git clone <repository-url>
cd my-new-project
yarn install
```

2. **Start Infrastructure**

```bash
docker-compose up -d
```

3. **Environment Setup**
   Create a `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/auction_db"
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=auction_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Application Configuration
PORT=4000
NODE_ENV=development
```

4. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Create test users
yarn create-users
```

5. **Start Application**

```bash
yarn start:dev
```

## 🧪 Testing

### Manual Testing

```bash
# Reset auction
yarn test-simple

# Test winner ID storage
yarn manual-test

# Check database state
yarn debug-db
```

### Real-time Testing

```bash
# Run all clients simultaneously
yarn run-all-clients

# Or run individual clients
yarn run-client 1  # User 1 (resetter)
yarn run-client 2  # User 2
yarn run-client 3  # User 3 (ender)
```

### Sequential Testing

```bash
# Run clients one by one
yarn test-sequential
```

## 📁 Project Structure

```
src/
├── modules/
│   └── auction/
│       ├── auction.controller.ts    # REST API endpoints
│       ├── auction.gateway.ts       # WebSocket events
│       ├── auction.service.ts       # Business logic
│       └── dto/
│           └── create-auction.dto.ts
├── rabbitmq/
│   ├── bid.consumer.ts             # Bid processing
│   ├── notification.consumer.ts    # Notifications
│   ├── rabbitmq.module.ts          # Module configuration
│   └── rabbitmq.service.ts         # Message publishing
├── redis/
│   ├── redis.module.ts             # Module configuration
│   └── redis.service.ts            # Caching & pub/sub
├── prisma/
│   ├── prisma.module.ts            # Database module
│   └── prisma.service.ts           # Database service
├── common/
│   └── guards/
│       └── rate-limit.guard.ts     # Rate limiting
└── main.ts                         # Application entry
```

## 🔧 Key Components

### AuctionGateway

- **WebSocket Events:** `joinAuction`, `placeBid`, `resetAuction`, `auctionEnd`
- **Real-time Updates:** Bid confirmations, auction status changes
- **Session Management:** User tracking and room management

### AuctionService

- **Bid Processing:** Optimistic locking for concurrency
- **Winner Selection:** Automatic highest bidder determination
- **Database Operations:** Transaction-based bid storage
- **Auction Management:** Reset, end, and status updates

### RabbitMQ Integration

- **Bid Queue:** Reliable bid processing with error handling
- **Notification Queue:** Real-time notifications to clients
- **Dead Letter Queue:** Failed message handling
- **Message Persistence:** Durable queues for reliability

### Redis Integration

- **Caching:** Current bid amounts and auction state
- **Pub/Sub:** Real-time bid updates across instances
- **Session Storage:** User connection tracking
- **Rate Limiting:** Distributed throttling

## 🔄 How It Works

1. **Auction Setup**
   - Auction is created with starting bid and time limits
   - Users join auction room via WebSocket

2. **Bidding Process**
   - Client places bid via WebSocket
   - Bid is published to RabbitMQ queue
   - Consumer processes bid with database transaction
   - Redis broadcasts update to all connected clients

3. **Concurrency Management**
   - Optimistic locking prevents race conditions
   - Database transactions ensure data consistency
   - Rate limiting prevents abuse

4. **Winner Selection**
   - Auction ends when triggered
   - Highest bidder is automatically determined
   - Winner ID is stored in database
   - All clients receive winner notification

## 🎯 Recent Improvements

### ✅ Fixed Issues

- **Winner ID Storage:** Now properly stored in database
- **Circular Dependencies:** Resolved module import issues
- **Database Schema:** Added proper relations between models
- **Error Handling:** Comprehensive error management
- **Test Client Logic:** Improved real-time testing

### ✅ New Features

- **Manual Testing Scripts:** Easy database verification
- **Sequential Testing:** Controlled auction flow testing
- **Debug Tools:** Database state inspection
- **Reset Functionality:** Auction state management
- **Better Logging:** Detailed process tracking

## 🚀 Available Scripts

```bash
# Development
yarn start:dev          # Start in watch mode
yarn build              # Build for production

# Testing
yarn test-simple        # Reset auction
yarn manual-test        # Test winner storage
yarn debug-db           # Check database state
yarn run-client <id>    # Run test client
yarn run-all-clients    # Run all clients
yarn test-sequential    # Sequential testing

# Database
yarn create-users       # Create test users
yarn reset-auction      # Reset auction state
```
