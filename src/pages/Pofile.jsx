import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfile, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserBookshelf, getUserReviews } from '../services/bookService';
import UserShelf from '../components/UserShelf';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userStats, setUserStats] = useState({
    totalBooks: 0,
    booksRead: 0,
    currentlyReading: 0,
    wantToRead: 0,
    reviews: []
  });

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || '');
        await fetchUserData(user.uid);
      } else {
        // Redirect to login if not logged in
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      // Fetch bookshelf data
      const userBooks = await getUserBookshelf(userId);
      
      // Fetch user reviews
      const userReviews = await getUserReviews(userId);
      
      // Calculate statistics
      const booksRead = userBooks.filter(book => book.status === 'read').length;
      const currentlyReading = userBooks.filter(book => book.status === 'reading').length;
      const wantToRead = userBooks.filter(book => book.status === 'want-to-read').length;
      
      setUserStats({
        totalBooks: userBooks.length,
        booksRead,
        currentlyReading,
        wantToRead,
        reviews: userReviews
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });
      
      // Update local state
      setUser({
        ...user,
        displayName
      });
      
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      alert('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="profile-container">
        <p>Please log in to view your profile.</p>
        <Link to="/login" className="login-link">Log In</Link>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
      
      <div className="profile-content">
        <div className="profile-section user-info">
          <div className="avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User avatar" />
            ) : (
              <div className="default-avatar">
                {(user.displayName || user.email || 'User')[0].toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="user-details">
            {editMode ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="name-input"
              />
            ) : (
              <h2>{user.displayName || 'Reader'}</h2>
            )}
            
            <p className="user-email">{user.email}</p>
            
            <div className="profile-actions">
              <button onClick={handleUpdateProfile} className="edit-profile-btn">
                {editMode ? 'Save Profile' : 'Edit Profile'}
              </button>
              <button onClick={handleSignOut} className="sign-out-btn">
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        <div className="profile-section stats">
          <h2>Reading Statistics</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Books</h3>
              <p className="stat-number">{userStats.totalBooks}</p>
            </div>
            
            <div className="stat-card">
              <h3>Books Read</h3>
              <p className="stat-number">{userStats.booksRead}</p>
            </div>
            
            <div className="stat-card">
              <h3>Currently Reading</h3>
              <p className="stat-number">{userStats.currentlyReading}</p>
            </div>
            
            <div className="stat-card">
              <h3>Want to Read</h3>
              <p className="stat-number">{userStats.wantToRead}</p>
            </div>
          </div>
        </div>
        
        <div className="profile-section user-bookshelf">
          <h2>My Bookshelf</h2>
          <UserShelf />
        </div>
        
        <div className="profile-section user-reviews">
          <h2>My Reviews ({userStats.reviews.length})</h2>
          
          {userStats.reviews.length > 0 ? (
            <div className="reviews-list">
              {userStats.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <h3>
                    <Link to={`/book/${review.bookId}`}>{review.bookTitle}</Link>
                  </h3>
                  <div className="review-rating">Rating: {review.rating}/5</div>
                  <div className="review-date">
                    {review.createdAt.toDate().toLocaleDateString()}
                  </div>
                  <p className="review-content">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">You haven't written any reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;