import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Book Collection
const booksCollection = collection(db, 'books');
const reviewsCollection = (bookId) => collection(db, 'books', bookId, 'reviews');
const userShelvesCollection = collection(db, 'userShelves');
const userReviewsCollection = collection(db, 'userReviews');

// Get all books
export const getAllBooks = async () => {
  const snapshot = await getDocs(booksCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get a specific book
export const getBookById = async (bookId) => {
  const bookDoc = await getDoc(doc(booksCollection, bookId));
  
  if (!bookDoc.exists()) {
    return null;
  }
  
  return {
    id: bookDoc.id,
    ...bookDoc.data()
  };
};

// Search books by title, author, or genre
export const searchBooks = async (searchTerm) => {
  // Note: Firebase doesn't support OR queries directly
  // In a real app, you'd use Cloud Functions or implement separate queries
  
  // Simple approach: Get all books and filter client-side
  const snapshot = await getDocs(booksCollection);
  const allBooks = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  const searchTermLower = searchTerm.toLowerCase();
  
  return allBooks.filter(book => 
    book.title.toLowerCase().includes(searchTermLower) ||
    book.author.toLowerCase().includes(searchTermLower) ||
    book.genre.toLowerCase().includes(searchTermLower)
  );
};

// Add a new book (admin only)
export const addNewBook = async (bookData) => {
  return await addDoc(booksCollection, {
    ...bookData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Update a book (admin only)
export const updateBook = async (bookId, bookData) => {
  const bookRef = doc(booksCollection, bookId);
  return await updateDoc(bookRef, {
    ...bookData,
    updatedAt: serverTimestamp()
  });
};

// Delete a book (admin only)
export const deleteBook = async (bookId) => {
  return await deleteDoc(doc(booksCollection, bookId));
};

// Get reviews for a book
export const getBookReviews = async (bookId) => {
  const snapshot = await getDocs(reviewsCollection(bookId));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Add a review for a book
export const addReview = async (bookId, reviewData) => {
  // Add to book's reviews subcollection
  const reviewRef = await addDoc(reviewsCollection(bookId), {
    ...reviewData,
    createdAt: serverTimestamp()
  });
  
  // Also add to user's reviews collection for easier querying
  await addDoc(userReviewsCollection, {
    reviewId: reviewRef.id,
    bookId,
    userId: reviewData.userId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    createdAt: serverTimestamp()
  });
  
  return reviewRef;
};

// Delete a review (admin only)
export const deleteReview = async (bookId, reviewId) => {
  // Delete from book's reviews subcollection
  await deleteDoc(doc(reviewsCollection(bookId), reviewId));
  
  // Delete from user's reviews collection
  const userReviewQuery = query(
    userReviewsCollection,
    where('reviewId', '==', reviewId)
  );
  
  const snapshot = await getDocs(userReviewQuery);
  if (!snapshot.empty) {
    await deleteDoc(snapshot.docs[0].ref);
  }
};

// Get user's bookshelf
export const getUserBookshelf = async (userId) => {
  const userShelfQuery = query(
    userShelvesCollection,
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(userShelfQuery);
  
  if (snapshot.empty) {
    return [];
  }
  
  const bookIds = snapshot.docs.map(doc => ({
    id: doc.data().bookId,
    status: doc.data().status
  }));
  
  // Fetch book details for each book in the shelf
  const books = await Promise.all(
    bookIds.map(async ({ id, status }) => {
      const bookData = await getBookById(id);
      return {
        ...bookData,
        status
      };
    })
  );
  
  return books;
};

// Get user's reviews
export const getUserReviews = async (userId) => {
  const userReviewsQuery = query(
    userReviewsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(userReviewsQuery);
  
  if (snapshot.empty) {
    return [];
  }
  
  const reviews = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const reviewData = doc.data();
      const bookData = await getBookById(reviewData.bookId);
      
      return {
        id: doc.id,
        ...reviewData,
        bookTitle: bookData ? bookData.title : 'Unknown Book'
      };
    })
  );
  
  return reviews;
};

// Add a book to user's shelf
export const addToUserShelf = async (userId, bookId, status) => {
  // Check if user already has this book in their shelf
  const userShelfQuery = query(
    userShelvesCollection,
    where('userId', '==', userId),
    where('bookId', '==', bookId)
  );
  
  const snapshot = await getDocs(userShelfQuery);
  
  if (snapshot.empty) {
    // Add new entry
    return await addDoc(userShelvesCollection, {
      userId,
      bookId,
      status,
      addedAt: serverTimestamp()
    });
  } else {
    // Update existing entry
    const shelfDoc = snapshot.docs[0];
    return await updateDoc(shelfDoc.ref, {
      status,
      updatedAt: serverTimestamp()
    });
  }
};

// Update book status in user's shelf
export const updateBookStatus = async (userId, bookId, status) => {
  const userShelfQuery = query(
    userShelvesCollection,
    where('userId', '==', userId),
    where('bookId', '==', bookId)
  );
  
  const snapshot = await getDocs(userShelfQuery);
  
  if (snapshot.empty) {
    throw new Error('Book not found in user shelf');
  }
  
  const shelfDoc = snapshot.docs[0];
  return await updateDoc(shelfDoc.ref, {
    status,
    updatedAt: serverTimestamp()
  });
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const usersCollection = collection(db, 'users');
  const snapshot = await getDocs(usersCollection);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};