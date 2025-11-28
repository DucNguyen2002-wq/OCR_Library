import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Router from './router'

export default function App() {
  const location = useLocation()
  const token = localStorage.getItem('token')
  
  // Redirect root to appropriate page based on auth status
  if (location.pathname === '/') {
    if (token) {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/login" replace />
    }
  }
  
  return <Router />
}
