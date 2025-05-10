import { useState } from 'react';
import { addReview } from '../services/bookService';
import { auth } from '../services/firebase';

function ReviewForm({ bookId, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError('You must be logged in to leave a review');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await addReview(bookId, {
        rating,
        comment,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        createdAt: new Date()
      });
      
      // Reset form
      setRating(5);
      setComment('');
      
      // Notify parent component that a review was added
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err) {
      console.error('Error adding review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {!auth.currentUser && (
        <p className="login-prompt">
          Please <a href="/login">log in</a> to leave a review.
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="rating">Rating:</label>
          <select 
            id="rating" 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={!auth.currentUser || isSubmitting}
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Your Review:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!auth.currentUser || isSubmitting}
            rows="4"
            placeholder="Share your thoughts about this book..."
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!auth.currentUser || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;