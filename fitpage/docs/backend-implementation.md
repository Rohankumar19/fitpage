
# Backend Implementation Guide

This document provides a complete backend implementation using Node.js, Express.js, and PostgreSQL for the Ratings and Review System.

## 🏗️ Backend Architecture

### Tech Stack
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **Prisma** ORM for database management
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication
- **multer** for file uploads
- **cors** for cross-origin requests

## 📦 Package.json

```json
{
  "name": "ratings-review-backend",
  "version": "1.0.0",
  "description": "Backend API for Ratings and Review System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "npx prisma migrate dev",
    "seed": "node scripts/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.7.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  
  reviews   Review[]
  
  @@map("users")
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  category    String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?  @map("image_url")
  createdAt   DateTime @default(now()) @map("created_at")
  
  reviews     Review[]
  
  @@map("products")
}

model Review {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  productId  Int      @map("product_id")
  rating     Int      @db.SmallInt
  reviewText String?  @map("review_text") @db.Text
  photoUrl   String?  @map("photo_url")
  createdAt  DateTime @default(now()) @map("created_at")
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([userId, productId])
  @@map("reviews")
}
```

## 🚀 Server Setup

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔐 Authentication Routes

```javascript
// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
```

## 📦 Product Routes

```javascript
// routes/products.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with aggregated ratings
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculate average ratings
    const productsWithRatings = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 
        ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
        : 0;
      
      return {
        ...product,
        averageRating,
        reviewCount: product.reviews.length,
        reviews: undefined // Remove reviews from response
      };
    });

    res.json(productsWithRatings);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get specific product with reviews
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate average rating
    const ratings = product.reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : 0;

    // Extract top keywords from reviews
    const allReviewText = product.reviews
      .map(review => review.reviewText)
      .filter(text => text)
      .join(' ')
      .toLowerCase();

    const words = allReviewText.split(/\W+/).filter(word => 
      word.length > 3 && 
      !['this', 'that', 'with', 'have', 'they', 'were', 'been', 'their', 'said', 'each', 'which', 'them', 'very', 'good', 'great', 'nice', 'best', 'love', 'like', 'really'].includes(word)
    );

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const topKeywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    res.json({
      ...product,
      averageRating,
      reviewCount: product.reviews.length,
      topKeywords
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
```

## 📝 Review Routes

```javascript
// routes/reviews.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Submit a review
router.post('/', authMiddleware, upload.single('photo'), [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').optional().trim().isLength({ min: 3 }).withMessage('Review must be at least 3 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, rating, reviewText } = req.body;
    const userId = req.user.userId;

    // Validate that either rating or review text is provided
    if (!rating && !reviewText) {
      return res.status(400).json({ error: 'Either rating or review text must be provided' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: parseInt(productId)
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Create review
    const reviewData = {
      userId: userId,
      productId: parseInt(productId),
      rating: rating ? parseInt(rating) : null,
      reviewText: reviewText || null,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null
    };

    const review = await prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
```

## 🔒 Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

## 🌱 Database Seeding

```javascript
// scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword
      }
    })
  ]);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium quality wireless headphones with noise cancellation',
        category: 'Electronics',
        price: 199.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracking with heart rate monitor',
        category: 'Wearables',
        price: 299.99,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Organic Coffee Beans',
        description: 'Premium arabica coffee beans, fair trade certified',
        category: 'Food & Beverage',
        price: 24.99,
        imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support',
        category: 'Furniture',
        price: 449.99,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Portable Solar Charger',
        description: 'Eco-friendly solar power bank for outdoor adventures',
        category: 'Electronics',
        price: 79.99,
        imageUrl: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop'
      }
    })
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created ${users.length} users and ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 🔧 Environment Variables

```env
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/reviews_db"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## 🚀 Setup Instructions

1. **Initialize the backend project**
   ```bash
   mkdir ratings-review-backend
   cd ratings-review-backend
   npm init -y
   ```

2. **Install dependencies**
   ```bash
   npm install express cors helmet bcrypt jsonwebtoken multer prisma @prisma/client dotenv express-rate-limit express-validator
   npm install -D nodemon
   ```

3. **Setup Prisma**
   ```bash
   npx prisma init
   ```

4. **Create the database schema**
   - Copy the Prisma schema above to `prisma/schema.prisma`

5. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

7. **Start the server**
   ```bash
   npm run dev
   ```

## 📡 API Testing

### Sample API Calls

```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all products
curl http://localhost:3001/api/products

# Get specific product
curl http://localhost:3001/api/products/1

# Submit a review (requires authentication)
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"productId":1,"rating":5,"reviewText":"Great product!"}'
```

This complete backend implementation provides all the functionality needed for a production-ready ratings and review system.
