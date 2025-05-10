import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, getBookReviews, addToUserShelf } from '../services/bookService';
import ReviewForm from '../components/ReviewForm';
import { auth } from '../services/firebase';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shelfStatus, setShelfStatus] = useState('');

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const bookData = await getBookById(id);
        if (!bookData) {
          setError('Book not found');
        } else {
          setBook(bookData);
          
          // Fetch reviews
          const reviewsData = await getBookReviews(id);
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id]);

  const handleAddToShelf = async (status) => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    try {
      await addToUserShelf(auth.currentUser.uid, id, status);
      setShelfStatus(status);
      alert(`Book added to your "${status}" shelf!`);
    } catch (err) {
      console.error('Error adding book to shelf:', err);
      alert('Failed to add book to shelf. Please try again.');
    }
  };

  const handleReviewAdded = async () => {
    // Refresh reviews after a new one is added
    try {
      const reviewsData = await getBookReviews(id);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading book details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!book) {
    return <div className="not-found">Book not found</div>;
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="book-detail-container">
      <div className="book-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
      </div>
      
      <div className="book-detail-content">
        <div className="book-detail-main">
          <div className="book-cover-large">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={`${book.title} cover`} />
            ) : (
              <div className="no-cover-large">No Cover Available</div>
            )}
          </div>
          
          <div className="book-info-container">
            <h1 className="book-title">{book.title}</h1>
            <h2 className="book-author">by {book.author}</h2>
            
            <div className="book-meta">
              <span className="book-genre">Genre: {book.genre}</span>
              <span className="book-rating">Rating: {averageRating}</span>
              <span className="book-publish">Published: {book.publishYear}</span>
            </div>
            
            <div className="book-actions">
              {auth.currentUser && (
                <div className="shelf-actions">
                  <button onClick={() => handleAddToShelf('reading')}>
                    Currently Reading
                  </button>
                  <button onClick={() => handleAddToShelf('want-to-read')}>
                    Want to Read
                  </button>
                  <button onClick={() => handleAddToShelf('read')}>
                    Read
                  </button>
                </div>
              )}
            </div>
            
            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          </div>
        </div>
        
        <div className="book-reviews">
          <h3>Reviews ({reviews.length})</h3>
          
          <ReviewForm bookId={id} onReviewAdded={handleReviewAdded} />
          
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <span className="review-rating">Rating: {review.rating}/5</span>
                    <span className="review-author">by {review.userName}</span>
                    <span className="review-date">
                      {review.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-content">{review.comment}</div>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;