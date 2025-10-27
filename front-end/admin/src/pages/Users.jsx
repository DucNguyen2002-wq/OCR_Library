import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Layout/Sidebar'
import Topbar from '../components/Layout/Topbar'
import { getUsers, getRoles, updateUserRole, deleteUser, createUser, resetPassword } from '../api/users'

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentUser = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem('currentUser')||'null') } catch { return null }
  }, [])

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    (async () => {
      try {
        const [u, r] = await Promise.all([getUsers(), getRoles()])
        console.log('Users response:', u)
        console.log('Roles response:', r)
        if (u?.success) setUsers(u.users)
        if (r?.success) setRoles(r.roles)
      } catch (e) {
        console.error('Error loading users:', e)
        setError('Không thể tải danh sách người dùng')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const changeRole = async (id, roleId) => {
    await updateUserRole(id, roleId)
    setUsers((prev)=> prev.map(u=> u._id===id? { ...u, role_id: roleId, role: roles.find(r=>r._id===roleId)?.name || u.role } : u))
  }

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa người dùng?')) return
    await deleteUser(id)
    setUsers((prev)=> prev.filter(u=> u._id !== id))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      email: form.get('email'),
      name: form.get('name'),
      password: form.get('password'),
      roleId: form.get('roleId') || undefined
    }
    const res = await createUser(payload)
    alert(res?.message || 'Đã tạo user')
    // refresh
    const u = await getUsers(); if (u?.success) setUsers(u.users)
    e.currentTarget.reset()
  }

  const handleResetPwd = async (id) => {
    const newPwd = prompt('Nhập mật khẩu mới (>=6 ký tự):')
    if (!newPwd) return
    await resetPassword(id, newPwd)
    alert('Đã reset mật khẩu')
  }

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Topbar title="User Management" />

        {!isAdmin && <div className="alert">Chỉ Admin mới có quyền truy cập</div>}
        {error && <div className="alert">{error}</div>}

        {isAdmin && (
          <div className="panel">
            <div className="panel-header">Tạo User mới</div>
            <form className="form-grid" onSubmit={handleCreate}>
              <input name="email" type="email" placeholder="Email" required />
              <input name="name" type="text" placeholder="Tên" required />
              <input name="password" type="password" placeholder="Mật khẩu" required />
              <select name="roleId" defaultValue="">
                <option value="">Mặc định: user</option>
                {roles.map(r=> <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
              <button className="btn primary">Tạo</button>
            </form>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">Danh sách người dùng</div>
          {loading? 'Đang tải…' : (
            <div className="table">
              <div className="thead">
                <div>Email</div>
                <div>Tên</div>
                <div>Role</div>
                <div>Hành động</div>
              </div>
              {users.map(u=> (
                <div key={u._id} className="trow">
                  <div>{u.email}</div>
                  <div>{u.name}</div>
                  <div>
                    {isAdmin ? (
                      <select value={u.role_id} onChange={(e)=>changeRole(u._id, e.target.value)}>
                        {roles.map(r=> <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    ) : (
                      <span className="badge">{u.role}</span>
                    )}
                  </div>
                  <div className="actions">
                    {isAdmin && <button className="btn" onClick={()=>handleResetPwd(u._id)}>Reset mật khẩu</button>}
                    {isAdmin && <button className="btn danger" onClick={()=>handleDelete(u._id)}>Xóa</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
