import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/book/:id" element={<BookDetail />} />
    <Route path="/login" element={<Login />} />
  </Routes>
</BrowserRouter>
