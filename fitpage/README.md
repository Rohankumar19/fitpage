
# Ratings and Review System

A full-stack TypeScript web application for product ratings and reviews, built with React, TypeScript, Tailwind CSS, and shadcn/ui. This application allows users to view products, submit ratings and reviews, and see aggregated feedback from other users.

## 🌟 Features

- **Product Listing**: Display of 6 dummy products with ratings and review counts
- **Product Details**: Individual product pages with detailed information
- **Rating System**: Interactive 5-star rating system
- **Review Submission**: Text-based reviews with validation
- **Duplicate Prevention**: Users cannot submit multiple reviews for the same product
- **Average Ratings**: Calculated and displayed for each product
- **Keyword Extraction**: Top keywords extracted from reviews for each product
- **Modern UI**: Animated components with Framer Motion and custom hover effects
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS v4.0

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4.0** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **React Router** for navigation
- **LocalStorage** for data persistence (simulating backend)

### Backend (Implementation Guide)
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** or **MySQL** for database
- **REST API** endpoints

## 📦 Installation & Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ratings-review-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Backend Setup (See docs/backend-setup.md)

For detailed backend implementation instructions, see the `docs/backend-setup.md` file.

## 🗃️ Database Schema

```sql
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
    UNIQUE(user_id, product_id) -- Prevents duplicate reviews
);

-- Indexes for better performance
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

## 📊 Sample Data

The application comes pre-loaded with 6 dummy products:

1. **Wireless Bluetooth Headphones** - $199.99 (Electronics)
2. **Smart Fitness Watch** - $299.99 (Wearables)
3. **Organic Coffee Beans** - $24.99 (Food & Beverage)
4. **Ergonomic Office Chair** - $449.99 (Furniture)
5. **Portable Solar Charger** - $79.99 (Electronics)
6. **Premium Yoga Mat** - $89.99 (Fitness)

## 🎯 API Endpoints (Backend Implementation)

### Products
- `GET /products` - Fetch all products with aggregated ratings
- `GET /product/:id` - Fetch specific product details with reviews

### Reviews
- `POST /review` - Submit a new rating/review
- `GET /product/:id/reviews` - Get all reviews for a product

## ✅ Validation Rules

### Rating Validation
- Must be a number between 1-5
- Cannot be empty if submitting a rating

### Review Text Validation
- Minimum 3 characters if provided
- Cannot be empty string if filled
- Optional field

### Duplicate Prevention
- Users cannot submit multiple reviews for the same product
- Enforced through localStorage checking (simulated unique constraint)

## 🎨 Custom UI Components

### Card Hover Effect
- Interactive hover animations for category cards
- Smooth transitions with Framer Motion
- Professional dark theme with gradient effects

### Flip Words Animation
- Animated text transitions in hero section
- Smooth letter-by-letter animations
- Customizable word lists and timing

## 🧪 Testing

### Manual Testing Steps

1. **Product Listing Page**
   - Verify all 6 products are displayed
   - Check that ratings and review counts are correct
   - Test responsive design on different screen sizes
   - Test hover effects on category cards

2. **Product Detail Page**
   - Navigate to individual product pages
   - Verify product information is displayed correctly
   - Check that existing reviews are shown

3. **Review Submission**
   - Try submitting a rating only
   - Try submitting a review only
   - Try submitting both rating and review
   - Test validation errors (empty review, invalid rating)
   - Verify duplicate prevention works

4. **Rating Calculation**
   - Submit multiple reviews for different products
   - Verify average ratings are calculated correctly
   - Check that review counts update properly

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Follow the prompts

### Backend Deployment

See `docs/backend-setup.md` for detailed backend deployment instructions.

## 🎁 Bonus Features Implemented

- ✅ **Animated UI Components**: Custom hover effects and flip word animations
- ✅ **Modern Hero Section**: Eye-catching design with animated text
- ✅ **Category Showcase**: Interactive category cards with hover effects
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Interactive UI**: Smooth animations and micro-interactions
- ✅ **Form Validation**: Comprehensive client-side validation
- ✅ **TypeScript**: Full type safety throughout the application

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui and custom components
│   │   ├── card-hover-effect.tsx
│   │   ├── flip-words.tsx
│   │   └── ...
│   ├── HeroSection.tsx     # Main hero component
│   ├── card-hover-effect-demo.tsx
│   └── flip-words-demo.tsx
├── pages/
│   ├── Index.tsx          # Product listing page
│   ├── ProductDetail.tsx  # Product detail page
│   └── NotFound.tsx       # 404 page
├── lib/                   # Utility functions
├── hooks/                 # React hooks
├── App.tsx               # Main app component
├── main.tsx             # App entry point
└── index.css           # Global styles

docs/
└── backend-setup.md    # Backend implementation guide
```

## 🔧 Environment Variables (Backend)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ratings_review_system
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify that localStorage is enabled in your browser
3. Try refreshing the page to reset the application state
4. Check the backend setup guide in `docs/backend-setup.md`
5. Open an issue on GitHub for technical support

---

**Note**: This frontend implementation uses localStorage to simulate a backend. For production use, implement a proper backend following the guide in `docs/backend-setup.md`.
