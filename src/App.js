import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import './App.css'

// นำเข้าหน้าต่างๆ
import Home from './pages/Home'
import BookDetail from './pages/BookDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    
    // Clean up subscription
    return () => unsubscribe()
  }, [])

  // ส่วนป้องกันการเข้าถึงหน้าที่ต้องล็อกอิน
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>กำลังโหลด...</div>
    if (!user) return <Navigate to="/login" />
    return children
  }

  // ส่วนป้องกันการเข้าถึงหน้า Admin
  const AdminRoute = ({ children }) => {
    if (loading) return <div>กำลังโหลด...</div>
    if (!user) return <Navigate to="/login" />
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่ (ตัวอย่างง่ายๆ - ในการใช้งานจริงควรตรวจสอบกับฐานข้อมูล)
    if (user.email !== 'admin@example.com') return <Navigate to="/" />
    return children
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </div>
  )
}

export default App