import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookshelf, updateBookStatus } from '../services/bookService';
import { auth } from '../services/firebase';

function UserShelf() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reading');

  useEffect(() => {
    const fetchUserShelf = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const shelfData = await getUserBookshelf(auth.currentUser.uid);
        setBooks(shelfData);
      } catch (err) {
        console.error('Error fetching user bookshelf:', err);
        setError('Failed to load your bookshelf. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserShelf();
  }, []);

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      await updateBookStatus(auth.currentUser.uid, bookId, newStatus);
      
      // Update local state to reflect the change
      setBooks(books.map(book => 
        book.id === bookId ? { ...book, status: newStatus } : book
      ));
    } catch (err) {
      console.error('Error updating book status:', err);
      alert('Failed to update book status. Please try again.');
    }
  };

  const filteredBooks = books.filter(book => book.status === activeTab);

  if (!auth.currentUser) {
    return (
      <div className="user-shelf-container">
        <p className="login-prompt">
          Please <Link to="/login">log in</Link> to view your bookshelf.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your bookshelf...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-shelf-container">
      <h2>My Bookshelf</h2>
      
      <div className="shelf-tabs">
        <button 
          className={activeTab === 'reading' ? 'active' : ''} 
          onClick={() => setActiveTab('reading')}
        >
          Currently Reading
        </button>
        <button 
          className={activeTab === 'want-to-read' ? 'active' : ''} 
          onClick={() => setActiveTab('want-to-read')}
        >
          Want to Read
        </button>
        <button 
          className={activeTab === 'read' ? 'active' : ''} 
          onClick={() => setActiveTab('read')}
        >
          Read
        </button>
      </div>
      
      <div className="shelf-books">
        {filteredBooks.length === 0 ? (
          <p className="empty-shelf">No books in this shelf yet.</p>
        ) : (
          <ul className="book-list">
            {filteredBooks.map(book => (
              <li key={book.id} className="shelf-book-item">
                <Link to={`/book/${book.id}`} className="book-title">
                  {book.title}
                </Link>
                <span className="book-author">by {book.author}</span>
                
                <div className="book-status-controls">
                  <select 
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                  >
                    <option value="reading">Currently Reading</option>
                    <option value="want-to-read">Want to Read</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserShelf;