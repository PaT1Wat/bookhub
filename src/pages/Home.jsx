import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import UserShelf from '../components/UserShelf';
import { getAllBooks, searchBooks } from '../services/bookService';
import { auth } from '../services/firebase';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: 'all',
    sortBy: 'title'
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await getAllBooks();
        setBooks(booksData);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search is empty, reset to all books
      const booksData = await getAllBooks();
      setBooks(booksData);
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      setBooks(results);
    } catch (err) {
      console.error('Error searching books:', err);
      setError('Failed to search books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters and sorting
  const filteredBooks = [...books].filter(book => {
    if (filters.genre === 'all') return true;
    return book.genre === filters.genre;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const uniqueGenres = ['all', ...new Set(books.map(book => book.genre))];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>BookHub</h1>
        <p>Discover your next favorite book</p>
        
        {auth.currentUser ? (
          <div className="user-welcome">
            Welcome, {auth.currentUser.displayName || 'Reader'}!{' '}
            <Link to="/profile">My Profile</Link>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="login-btn">Log In</Link>
          </div>
        )}
      </header>

      <div className="content-container">
        <aside className="sidebar">
          <UserShelf />
          
          <div className="filters-container">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label htmlFor="genre">Genre:</label>
              <select 
                id="genre" 
                name="genre" 
                value={filters.genre}
                onChange={handleFilterChange}
              >
                {uniqueGenres.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sortBy">Sort By:</label>
              <select 
                id="sortBy" 
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </aside>
        
        <main className="main-content">
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search books by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
          
          {loading ? (
            <div className="loading">Loading books...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="books-grid">
              {filteredBooks.length > 0 ? (
                filteredBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="no-results">
                  No books found. Try adjusting your search or filters.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import UserShelf from '../components/UserShelf';
import { getAllBooks, searchBooks } from '../services/bookService';
import { auth } from '../services/firebase';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: 'all',
    sortBy: 'title'
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await getAllBooks();
        setBooks(booksData);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search is empty, reset to all books
      const booksData = await getAllBooks();
      setBooks(booksData);
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      setBooks(results);
    } catch (err) {
      console.error('Error searching books:', err);
      setError('Failed to search books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters and sorting
  const filteredBooks = [...books].filter(book => {
    if (filters.genre === 'all') return true;
    return book.genre === filters.genre;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const uniqueGenres = ['all', ...new Set(books.map(book => book.genre))];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>BookHub</h1>
        <p>Discover your next favorite book</p>
        
        {auth.currentUser ? (
          <div className="user-welcome">
            Welcome, {auth.currentUser.displayName || 'Reader'}!{' '}
            <Link to="/profile">My Profile</Link>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="login-btn">Log In</Link>
          </div>
        )}
      </header>

      <div className="content-container">
        <aside className="sidebar">
          <UserShelf />
          
          <div className="filters-container">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label htmlFor="genre">Genre:</label>
              <select 
                id="genre" 
                name="genre" 
                value={filters.genre}
                onChange={handleFilterChange}
              >
                {uniqueGenres.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sortBy">Sort By:</label>
              <select 
                id="sortBy" 
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </aside>
        
        <main className="main-content">
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search books by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
          
          {loading ? (
            <div className="loading">Loading books...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="books-grid">
              {filteredBooks.length > 0 ? (
                filteredBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="no-results">
                  No books found. Try adjusting your search or filters.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;