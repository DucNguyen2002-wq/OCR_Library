import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { logout } from '../api/auth'

export default function Header() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">📚 Thư viện sách</Link>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/books">Danh sách</Link>
          <Link to="/catalog">Dạng lưới</Link>
          {user ? (
            <>
              <Link to="/add" className="btn-primary">+ Thêm sách</Link>
              <span style={{ color: '#64748b', marginLeft: '12px' }}>
                Xin chào, {user.name || user.username}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Đăng nhập</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
