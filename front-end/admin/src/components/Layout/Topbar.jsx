import { useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'

export default function Topbar({ title }) {
  const navigate = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')||'null') } catch { return null }
  })()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="spacer" />
      <div className="user-info">
        <div className="avatar" aria-label="avatar">{(user?.name||'U').charAt(0).toUpperCase()}</div>
        <div className="meta">
          <div className="name">{user?.name}</div>
          <div className="email">{user?.email}</div>
        </div>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  )
}
