import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')||'null') } catch { return null }
  })()
  const isAdmin = user?.role === 'admin'
  return (
    <aside className="sidebar">
      <div className="brand">📚 Library</div>
      <nav>
        <NavLink to="/admin/dashboard" className={({isActive})=>isActive?'active':''}>Dashboard</NavLink>
        <NavLink to="/admin/books" className={({isActive})=>isActive?'active':''}>Books</NavLink>
        <NavLink to="/admin/ocr" className={({isActive})=>isActive?'active':''}>OCR</NavLink>
        {isAdmin && (
          <NavLink to="/admin/users" className={({isActive})=>isActive?'active':''}>Users</NavLink>
        )}
        <NavLink to="/admin/profile" className={({isActive})=>isActive?'active':''}>Profile</NavLink>
      </nav>
      <div className="sidebar-footer">
        <small>{user?.email}</small>
        <span className={`role-badge ${isAdmin?'admin':'user'}`}>{user?.role||'user'}</span>
      </div>
    </aside>
  )
}
