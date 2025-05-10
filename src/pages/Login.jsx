import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../services/firebase';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // Signup logic
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: formData.displayName
        });
      }

      // Redirect after successful auth
      navigate('/');
    } catch (err) {
      console.error('Authentication error:', err);
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else {
        setError(`Authentication error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>{isLogin ? 'Log In' : 'Sign Up'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="displayName">Your Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="or-divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleSignIn} 
          className="google-button"
          disabled={loading}
        >
          Continue with Google
        </button>
        
        <div className="auth-toggle">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setIsLogin(false)}
                className="toggle-button"
                disabled={loading}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setIsLogin(true)}
                className="toggle-button"
                disabled={loading}
              >
                Log In
              </button>
            </p>
          )}
        </div>
        
        <div className="back-to-home">
          <Link to="/">Back to Home</Link>
        </div>
      </div>
      
      <div className="auth-info">
        <h2>Welcome to BookHub</h2>
        <p>Join our community of book lovers to discover, review, and share your favorite books.</p>
        
        <div className="features-list">
          <div className="feature">
            <h3>Track Your Reading</h3>
            <p>Keep a record of books you've read, want to read, or are currently reading.</p>
          </div>
          
          <div className="feature">
            <h3>Share Reviews</h3>
            <p>Help others discover great books by sharing your honest reviews.</p>
          </div>
          
          <div className="feature">
            <h3>Build Your Profile</h3>
            <p>Create your reader profile and connect with like-minded book enthusiasts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;