import { useState } from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardStyle = {
    transition: 'transform 0.3s ease-in-out',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <div 
      className="book-card"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/book/${book.id}`}>
        <div className="book-cover">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={`${book.title} cover`} />
          ) : (
            <div className="no-cover">No Cover Available</div>
          )}
        </div>
        <div className="book-info">
          <h3>{book.title}</h3>
          <p>{book.author}</p>
          <div className="book-rating">
            Rating: {book.rating ? `${book.rating}/5` : 'No ratings yet'}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default BookCard;