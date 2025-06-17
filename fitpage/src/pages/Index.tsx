import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
}

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  reviewText: string;
  photoUrl?: string;
  createdAt: string;
}

const productsData: Product[] = [
  {
    id: 1,
    name: 'Gaming Laptop',
    description: 'High-performance laptop for gaming enthusiasts.',
    category: 'electronics',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1560179724-654a0ca408c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 2,
    name: 'Summer Dress',
    description: 'Elegant summer dress for women.',
    category: 'clothing',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1585346374669-935a69c61999?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 3,
    name: 'Ergonomic Office Chair',
    description: 'Comfortable chair for long working hours.',
    category: 'home',
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1562447834-85e143d0e967?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 4,
    name: 'The Great Gatsby',
    description: 'Classic novel by F. Scott Fitzgerald.',
    category: 'books',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d669a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 5,
    name: 'Basketball',
    description: 'Official size and weight basketball.',
    category: 'sports',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1554909474-3a68e6a06b7c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 6,
    name: 'Noise Cancelling Headphones',
    description: 'Over-ear headphones with active noise cancellation.',
    category: 'electronics',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1583394842264-10b2e4659d56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
  },
  {
    id: 7,
    name: 'Leather Jacket',
    description: 'Classic leather jacket for men.',
    category: 'clothing',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1588075592484-393b04cbb75a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 8,
    name: 'Garden Tool Set',
    description: 'Set of essential tools for gardening.',
    category: 'home',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1618224435344-958c71484091?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 9,
    name: 'Harry Potter and the Sorcerer\'s Stone',
    description: 'The first book in the Harry Potter series.',
    category: 'books',
    price: 20,
    imageUrl: 'https://images.unsplash.com/photo-1610587542394-2c6e5ba16863?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
  {
    id: 10,
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat for exercise.',
    category: 'sports',
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load products from local storage or use default data
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(productsData);
      localStorage.setItem('products', JSON.stringify(productsData));
    }

    // Load reviews from local storage
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  useEffect(() => {
    // Apply search and category filters
    let tempProducts = [...products];

    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      tempProducts = tempProducts.filter(product => product.category === categoryFilter);
    }

    // Apply sorting
    if (sortBy === 'name') {
      tempProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-low') {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      tempProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      tempProducts.sort((a, b) => {
        const ratingA = getProductRating(a.id).average;
        const ratingB = getProductRating(b.id).average;
        return ratingB - ratingA;
      });
    }

    setFilteredProducts(tempProducts);
  }, [searchTerm, categoryFilter, sortBy, products, reviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : index < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300 dark:text-gray-500'
        }`}
      />
    ));
  };

  const getProductRating = (productId: number) => {
    const productReviews = reviews.filter(review => review.productId === productId);
    if (productReviews.length === 0) return { average: 0, count: 0 };
    
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / productReviews.length;
    return { average: Math.round(average * 10) / 10, count: productReviews.length };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header without theme toggle */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Product Reviews
          </h1>
        </div>
      </div>

      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const { average, count } = getProductRating(product.id);
            return (
              <div key={product.id} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(average)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {average > 0 ? average.toFixed(1) : 'No ratings'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({count})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${product.price}
                      </span>
                      <Link to={`/product/${product.id}`}>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 group-hover:shadow-lg"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No products found matching your criteria.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
