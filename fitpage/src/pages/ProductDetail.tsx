import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { extractTags } from '@/utils/tagExtraction';

// Import all available images
import gamingLaptop from '@/images/asus-rog-zephyrus-m16-2023-gaming-laptop-1536x864.jpg';
import summerDress from '@/images/summerdress.jpg';
import ergonomicChair from '@/images/ergonomicchair.webp';
import greatGatsby from '@/images/thegreatgatsby.jpg';
import basketball from '@/images/basketball.webp';
import headphones from '@/images/headphones.webp';
import leatherJacket from '@/images/leatherjaket.jpg';
import gardenTools from '@/images/gardentools.jpg';
import harryPotter from '@/images/harrypotter.jpg';
import yogaMat from '@/images/yogamat.jpg';

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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    const storedReviews = localStorage.getItem('reviews');

    if (storedProducts) {
      const products: Product[] = JSON.parse(storedProducts);
      const foundProduct = products.find((p) => p.id === Number(id));
      setProduct(foundProduct);
    }

    if (storedReviews) {
      const reviews: Review[] = JSON.parse(storedReviews);
      const productReviews = reviews.filter((review) => review.productId === Number(id));
      setReviews(productReviews);
    }
  }, [id]);

  useEffect(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const avg = sum / reviews.length;
      setAverageRating(Math.round(avg * 10) / 10);
    } else {
      setAverageRating(0);
    }

    // Check if user has already reviewed
    const userId = 1; // Assuming user ID is 1 for simplicity
    const userReview = reviews.find(review => review.userId === userId);
    setHasUserReviewed(!!userReview);
  }, [reviews]);

  const getProductTags = () => {
    return extractTags(reviews);
  };

  const handleRatingChange = (rating: number) => {
    setNewRating(rating);
  };

  const handleReviewTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReviewText(event.target.value);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPhotoURL(url);
    } else {
      setPhoto(null);
      setPhotoURL(null);
    }
  };

  const handleSubmitReview = () => {
    if (!newReviewText.trim() || newRating === 0) {
      toast({
        title: 'Error',
        description: 'Please provide both a review and a rating.',
        variant: 'destructive',
      });
      return;
    }

    const userId = 1; // Assuming user ID is 1 for simplicity
    const newReview: Review = {
      id: Date.now(),
      userId: userId,
      productId: Number(id),
      rating: newRating,
      reviewText: newReviewText,
      createdAt: new Date().toISOString(),
      photoUrl: photoURL || undefined,
    };

    const storedReviews = localStorage.getItem('reviews');
    let reviewsArray: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    reviewsArray.push(newReview);

    localStorage.setItem('reviews', JSON.stringify(reviewsArray));
    setReviews([...reviews, newReview]);
    setNewReviewText('');
    setNewRating(0);
    setPhoto(null);
    setPhotoURL(null);
    setHasUserReviewed(true);

    toast({
      title: 'Success',
      description: 'Your review has been submitted!',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : index < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300 dark:text-gray-500'
        }`}
      />
    ));
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h1>
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  const tags = getProductTags();

  // All available images for the gallery
  const allImages = [
    { src: gamingLaptop, alt: 'Gaming Laptop', name: 'Gaming Laptop' },
    { src: summerDress, alt: 'Summer Dress', name: 'Summer Dress' },
    { src: ergonomicChair, alt: 'Ergonomic Chair', name: 'Ergonomic Chair' },
    { src: greatGatsby, alt: 'The Great Gatsby', name: 'The Great Gatsby' },
    { src: basketball, alt: 'Basketball', name: 'Basketball' },
    { src: headphones, alt: 'Headphones', name: 'Headphones' },
    { src: leatherJacket, alt: 'Leather Jacket', name: 'Leather Jacket' },
    { src: gardenTools, alt: 'Garden Tools', name: 'Garden Tools' },
    { src: harryPotter, alt: 'Harry Potter', name: 'Harry Potter' },
    { src: yogaMat, alt: 'Yoga Mat', name: 'Yoga Mat' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header without theme toggle */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div>
            <div className="relative rounded-lg overflow-hidden mb-6">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300">
                {product.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(averageRating)}
                </div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-8">
              ${product.price}
            </p>
          </div>

          {/* Review Form and Reviews */}
          <div className="space-y-8">
            {/* Review Form */}
            {!hasUserReviewed && (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="rating" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rating:
                    </Label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleRatingChange(value)}
                          className={`p-1 ${
                            value <= newRating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-500'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reviewText" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Review:
                    </Label>
                    <Textarea
                      id="reviewText"
                      value={newReviewText}
                      onChange={handleReviewTextChange}
                      placeholder="Write your review here..."
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload Photo (Optional, max 10MB):
                    </Label>
                    <div className="flex items-center space-x-5">
                      <Label htmlFor="upload-photo">
                        <div className="relative cursor-pointer rounded-md bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                          <span>Upload file</span>
                          <Upload className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                        </div>
                        <Input
                          type="file"
                          id="upload-photo"
                          className="sr-only"
                          onChange={handlePhotoChange}
                          accept="image/*"
                        />
                      </Label>
                      {photoURL && (
                        <div>
                          <img
                            src={photoURL}
                            alt="Uploaded photo"
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                </CardContent>
              </Card>
            )}

            {hasUserReviewed && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CardContent className="pt-6">
                  <p className="text-green-800 dark:text-green-200 text-center">
                    ✓ You have already reviewed this product
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Reviews ({reviews.length})
              </h2>
              
              {reviews.length === 0 ? (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                U{review.userId}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">User {review.userId}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {review.reviewText && (
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{review.reviewText}</p>
                        )}
                        
                        {review.photoUrl && (
                          <div className="mb-3">
                            <img
                              src={review.photoUrl}
                              alt="Review photo"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
