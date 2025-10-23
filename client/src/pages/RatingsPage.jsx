import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { orderAPI, ratingsAPI } from '../services/api';

const RatingsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [riderRating, setRiderRating] = useState(0);
  const [hoveredRiderRating, setHoveredRiderRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await orderAPI.getById(orderId);
        
        if (response.success) {
          const orderData = response.data.order;
          setOrder({
            id: orderData._id,
            orderNumber: orderData.orderNumber,
            items: orderData.items || [],
            riderName: orderData.riderId?.name || null,
            riderId: orderData.riderId?._id || null,
            completedAt: orderData.completedAt || new Date()
          });

          // Check if already rated
          const ratingResponse = await ratingsAPI.getByOrder(orderId);
          if (ratingResponse.success && ratingResponse.data.rating) {
            const existingRating = ratingResponse.data.rating;
            setRating(existingRating.foodRating || 0);
            setRiderRating(existingRating.riderRating || 0);
            setReview(existingRating.review || '');
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error?.response?.data?.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a food rating');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const ratingData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        foodRating: rating,
        deliveryRating: rating, // Using same rating as food for now
        review: review.substring(0, 500) // Limit to 500 characters
      };

      // Only include rider rating if there was a rider
      if (order.riderId && riderRating > 0) {
        ratingData.riderRating = riderRating;
      }

      const response = await ratingsAPI.create(ratingData);
      
      if (response.success) {
        // Navigate to order history after successful submission
        navigate('/orders/history');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error?.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (stars) => {
    switch (stars) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-[#FF0000] rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Your Order</h1>
          <p className="text-gray-600">Order #{order?.id}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Order Items */}
          {order && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
              {order.items.map((item, index) => (
                <p key={index} className="text-sm text-gray-700">
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
          )}

          {/* Food Rating */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">How was the food?</h2>
            <p className="text-sm text-gray-600 mb-4">Rate the quality and taste of your meal</p>
            
            <div className="flex flex-col items-center">
              <StarRating 
                rating={rating}
                hoveredRating={hoveredRating}
                onRate={setRating}
                onHover={setHoveredRating}
                onLeave={() => setHoveredRating(0)}
              />
              <p className="mt-3 text-sm font-medium text-gray-700">
                {getRatingText(hoveredRating || rating)}
              </p>
            </div>
          </div>

          {/* Rider Rating */}
          {order?.riderName && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Rate the delivery service</h2>
              <p className="text-sm text-gray-600 mb-4">How was your experience with {order.riderName}?</p>
              
              <div className="flex flex-col items-center">
                <StarRating 
                  rating={riderRating}
                  hoveredRating={hoveredRiderRating}
                  onRate={setRiderRating}
                  onHover={setHoveredRiderRating}
                  onLeave={() => setHoveredRiderRating(0)}
                />
                <p className="mt-3 text-sm font-medium text-gray-700">
                  {getRatingText(hoveredRiderRating || riderRating)}
                </p>
              </div>
            </div>
          )}

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Write a review (optional)
            </label>
            <p className="text-sm text-gray-600 mb-4">Share more details about your experience</p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent resize-none"
              placeholder="Tell us about your experience..."
            />
            <p className="mt-2 text-xs text-gray-500">
              {review.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/orders/history')}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 py-3 px-4 bg-[#FF0000] text-white rounded-full font-semibold hover:bg-[#E00000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>

          {/* Thank You Message */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              Thank you for your feedback! It helps us improve our service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsPage;
