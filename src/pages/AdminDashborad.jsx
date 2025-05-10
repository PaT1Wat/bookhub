import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { 
  getAllBooks, 
  getAllUsers, 
  addNewBook, 
  updateBook, 
  deleteBook,
  getBookReviews,
  deleteReview
} from '../services/bookService';

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    publishYear: '',
    coverUrl: ''
  });
  const [bookReviews, setBookReviews] = useState([]);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'

  useEffect(() => {
    // Check if user is logged in and is an admin
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // In a real app, you'd check user claims or a separate admin collection
        // This is a simple example where we're checking email for admin rights
        const isUserAdmin = user.email === 'admin@bookhub.com';
        setIsAdmin(isUserAdmin);
        
        if (isUserAdmin) {
          await fetchData();
        } else {
          // Redirect non-admin users
          navigate('/');
        }
      } else {
        // Redirect to login if not logged in
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch books
      const booksData = await getAllBooks();
      setBooks(booksData);
      
      // Fetch users (if needed)
      if (activeTab === 'users') {
        const usersData = await getAllUsers();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    
    if (tab === 'users' && users.length === 0) {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }
  };

  const handleBookFormChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        // Add new book
        await addNewBook(bookForm);
      } else {
        // Update existing book
        await updateBook(selectedBook.id, bookForm);
      }
      
      // Reset form and refresh books
      resetBookForm();
      await fetchData();
    } catch (err) {
      console.error('Error submitting book:', err);
      alert('Failed to save book. Please try again.');
    }
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      publishYear: book.publishYear,
      coverUrl: book.coverUrl
    });
    setFormMode('edit');
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
        await fetchData();
      } catch (err) {
        console.error('Error deleting book:', err);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      genre: '',
      description: '',
      publishYear: '',
      coverUrl: ''
    });
    setSelectedBook(null);
    setFormMode('add');
  };

  const handleViewReviews = async (bookId) => {
    try {
      const reviews = await getBookReviews(bookId);
      setBookReviews(reviews);
      setSelectedBook(books.find(book => book.id === bookId));
      setActiveTab('reviews');
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(selectedBook.id, reviewId);
        // Refresh reviews
        const reviews = await getBookReviews(selectedBook.id);
        setBookReviews(reviews);
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>Access Denied</h1>
        <p>You don't have permission to access the admin dashboard.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'books' ? 'active' : ''} 
          onClick={() => handleTabChange('books')}
        >
          Books
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => handleTabChange('users')}
        >
          Users
        </button>
        {selectedBook && (
          <button 
            className={activeTab === 'reviews' ? 'active' : ''} 
            onClick={() => handleTabChange('reviews')}
          >
            Reviews for {selectedBook.title}
          </button>
        )}
      </div>
      
      <div className="admin-content">
        {activeTab === 'books' && (
          <div className="admin-books">
            <div className="book-form-container">
              <h2>{formMode === 'add' ? 'Add New Book' : 'Edit Book'}</h2>
              
              <form onSubmit={handleBookSubmit} className="book-form">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="author">Author</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="genre">Genre</label>
                  <input
                    type="text"
                    id="genre"
                    name="genre"
                    value={bookForm.genre}
                    onChange={handleBookFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="publishYear">Publish Year</label>
                  <input
                    type="number"
                    id="publishYear"
                    name="publishYear"
                    value={bookForm.publishYear}
                    onChange={handleBookFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="coverUrl">Cover URL</label>
                  <input
                    type="url"
                    id="coverUrl"
                    name="coverUrl"
                    value={bookForm.coverUrl}
                    onChange={handleBookFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={bookForm.description}
                    onChange={handleBookFormChange}
                    rows="4"
                    required
                  />
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {formMode === 'add' ? 'Add Book' : 'Update Book'}
                  </button>
                  
                  {formMode === 'edit' && (
                    <button
                      type="button"
                      onClick={resetBookForm}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="books-list">
              <h2>All Books</h2>
              
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleEditBook(book)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                        <button 
                          onClick={() => handleViewReviews(book.id)}
                          className="reviews-btn"
                        >
                          Reviews
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>All Users</h2>
            
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Books</th>
                  <th>Reviews</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.displayName || 'Anonymous'}</td>
                    <td>{user.email}</td>
                    <td>{user.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                    <td>{user.bookCount || 0}</td>
                    <td>{user.reviewCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'reviews' && selectedBook && (
          <div className="admin-reviews">
            <h2>Reviews for {selectedBook.title}</h2>
            
            {bookReviews.length > 0 ? (
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookReviews.map(review => (
                    <tr key={review.id}>
                      <td>{review.userName}</td>
                      <td>{review.rating}/5</td>
                      <td className="review-comment">{review.comment}</td>
                      <td>{review.createdAt.toDate().toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No reviews for this book yet.</p>
            )}
            
            <button 
              onClick={() => setActiveTab('books')}
              className="back-btn"
            >
              Back to Books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;