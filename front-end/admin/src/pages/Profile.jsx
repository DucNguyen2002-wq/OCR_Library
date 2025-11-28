import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Layout/Sidebar'
import Topbar from '../components/Layout/Topbar'
import { updateProfile, changePassword } from '../api/profile'

export default function Profile() {
  const user = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem('currentUser')||'null') } catch { return null }
  }, [])

  const [name, setName] = useState(user?.name||'')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState('')

  const save = async (e) => {
    e.preventDefault()
    const res = await updateProfile({ name, phone, address })
    setMsg(res?.message || 'Đã cập nhật')
    const updated = { ...(user||{}), name }
    localStorage.setItem('currentUser', JSON.stringify(updated))
  }

  const changePwd = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const currentPassword = form.get('currentPassword')
    const newPassword = form.get('newPassword')
    const res = await changePassword(currentPassword, newPassword)
    alert(res?.message || 'Đổi mật khẩu thành công')
    e.currentTarget.reset()
  }

  useEffect(()=>{ setMsg('') }, [name, phone, address])

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Topbar title="Profile" />

        {msg && <div className="note">{msg}</div>}

        <div className="panel">
          <div className="panel-header">Thông tin cá nhân</div>
          <form className="form-grid" onSubmit={save}>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tên" required />
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Số điện thoại" />
            <input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Địa chỉ" />
            <button className="btn primary">Lưu</button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">Đổi mật khẩu</div>
          <form className="form-grid" onSubmit={changePwd}>
            <input type="password" name="currentPassword" placeholder="Mật khẩu hiện tại" required />
            <input type="password" name="newPassword" placeholder="Mật khẩu mới (>=6)" required />
            <button className="btn">Đổi mật khẩu</button>
          </form>
        </div>
      </main>
    </div>
  )
}
