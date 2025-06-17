
# Backend Implementation Guide

## Prerequisites
- Node.js (v18+)
- PostgreSQL or MySQL
- npm or yarn

## Setup Instructions

1. **Initialize Backend Project**
```bash
mkdir backend
cd backend
npm init -y
```

2. **Install Dependencies**
```bash
npm install express cors helmet morgan dotenv
npm install @types/express @types/cors @types/node typescript ts-node nodemon --save-dev
npm install pg @types/pg  # for PostgreSQL
# OR
npm install mysql2 @types/mysql2  # for MySQL
```

3. **TypeScript Configuration**
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

4. **Database Schema (PostgreSQL)**
```sql
-- Create database
CREATE DATABASE ratings_review_system;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Insert sample users
INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Mike Johnson', 'mike@example.com');

-- Insert sample products
INSERT INTO products (name, description, category, price, image_url) VALUES 
('Wireless Bluetooth Headphones', 'Premium quality wireless headphones with noise cancellation', 'Electronics', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'),
('Smart Fitness Watch', 'Advanced fitness tracking with heart rate monitor', 'Wearables', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'),
('Organic Coffee Beans', 'Premium arabica coffee beans, fair trade certified', 'Food & Beverage', 24.99, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop'),
('Ergonomic Office Chair', 'Comfortable office chair with lumbar support', 'Furniture', 449.99, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'),
('Portable Solar Charger', 'Eco-friendly solar power bank for outdoor adventures', 'Electronics', 79.99, 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop');
```

5. **Environment Variables**
Create `.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ratings_review_system
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=development
```

## API Implementation

The backend would include these files:
- `src/server.ts` - Main server setup
- `src/routes/products.ts` - Product routes
- `src/routes/reviews.ts` - Review routes
- `src/middleware/validation.ts` - Input validation
- `src/database/connection.ts` - Database connection
- `src/types/index.ts` - TypeScript interfaces

## Running the Backend
```bash
npm run dev  # Development
npm run build && npm start  # Production
```
