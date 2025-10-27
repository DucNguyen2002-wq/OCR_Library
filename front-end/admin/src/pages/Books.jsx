import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Layout/Sidebar'
import Topbar from '../components/Layout/Topbar'
import { listBooks, listPendingBooks, listRejectedBooks, approveBook, rejectBook, removeBook } from '../api/books'

export default function Books() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('approved') // 'approved', 'pending', or 'rejected'
  const [books, setBooks] = useState([])
  const [pendingBooks, setPendingBooks] = useState([])
  const [rejectedBooks, setRejectedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem('currentUser')||'null') } catch { return null }
  }, [])
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    loadBooks()
    if (isAdmin) {
      loadPendingBooks()
      loadRejectedBooks()
    }
  }, [isAdmin])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const res = await listBooks()
      if (res?.success) setBooks(res.books || [])
    } catch (e) {
      console.error('Error loading books:', e)
      setError('Không thể tải sách')
    } finally { 
      setLoading(false) 
    }
  }

  const loadPendingBooks = async () => {
    try {
      const res = await listPendingBooks()
      if (res?.success) setPendingBooks(res.books || [])
    } catch (e) {
      console.error('Error loading pending books:', e)
    }
  }

  const loadRejectedBooks = async () => {
    try {
      const res = await listRejectedBooks()
      if (res?.success) setRejectedBooks(res.books || [])
    } catch (e) {
      console.error('Error loading rejected books:', e)
    }
  }

  const approve = async (id) => {
    try {
      await approveBook(id)
      // Move book from pending to approved
      const book = pendingBooks.find(b => (b._id || b.id) === id)
      if (book) {
        setPendingBooks(prev => prev.filter(b => (b._id || b.id) !== id))
        setBooks(prev => [...prev, { ...book, approval_status: 'approved' }])
      }
      alert('Phê duyệt sách thành công!')
    } catch (e) {
      alert('Lỗi khi phê duyệt: ' + (e.response?.data?.error || e.message))
    }
  }

  const reject = async (id) => {
    const reason = prompt('Lý do từ chối:')
    if (!reason) return
    
    try {
      await rejectBook(id, reason)
      setPendingBooks(prev => prev.map(b => 
        (b._id || b.id) === id ? { ...b, approval_status: 'rejected', rejected_reason: reason } : b
      ))
      alert('Từ chối sách thành công!')
    } catch (e) {
      alert('Lỗi khi từ chối: ' + (e.response?.data?.error || e.message))
    }
  }

  const remove = async (id) => {
    if (!confirm('Xóa sách này?')) return
    
    try {
      await removeBook(id)
      if (activeTab === 'approved') {
        setBooks(prev => prev.filter(b => (b._id || b.id) !== id))
      } else if (activeTab === 'pending') {
        setPendingBooks(prev => prev.filter(b => (b._id || b.id) !== id))
      } else {
        setRejectedBooks(prev => prev.filter(b => (b._id || b.id) !== id))
      }
      alert('Xóa sách thành công!')
    } catch (e) {
      alert('Lỗi khi xóa: ' + (e.response?.data?.error || e.message))
    }
  }

  const getCurrentBooks = () => {
    switch(activeTab) {
      case 'approved': return books
      case 'pending': return pendingBooks
      case 'rejected': return rejectedBooks
      default: return []
    }
  }

  const currentBooks = getCurrentBooks()

  const getTabTitle = () => {
    switch(activeTab) {
      case 'approved': return 'Danh sách sách đã phê duyệt'
      case 'pending': return 'Danh sách sách chờ kiểm duyệt'
      case 'rejected': return 'Danh sách sách bị từ chối'
      default: return 'Danh sách sách'
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Topbar title="Books Management" />
        {error && <div className="alert error">{error}</div>}
        
        <div className="panel">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              <i className="fas fa-check-circle"></i> Đã duyệt ({books.length})
            </button>
            {isAdmin && (
              <>
                <button 
                  className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  <i className="fas fa-clock"></i> Chờ duyệt ({pendingBooks.length})
                </button>
                <button 
                  className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rejected')}
                >
                  <i className="fas fa-times-circle"></i> Từ chối ({rejectedBooks.length})
                </button>
              </>
            )}
          </div>

          <div className="panel-header">
            {getTabTitle()}
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
              <p>Đang tải...</p>
            </div>
          ) : currentBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <p>Chưa có sách nào</p>
            </div>
          ) : (
            <div className="table">
              <div className="thead">
                <div>Tiêu đề</div>
                <div>Tác giả</div>
                {(activeTab === 'pending' || activeTab === 'rejected') && <div>Người tạo</div>}
                {activeTab === 'rejected' && <div>Lý do</div>}
                <div>Trạng thái</div>
                <div>Hành động</div>
              </div>
              {currentBooks.map(b => (
                <div key={b._id || b.id} className="trow">
                  <div>
                    <strong>{b.title}</strong>
                    {b.isbn && <small style={{ display: 'block', color: '#6c757d' }}>ISBN: {b.isbn}</small>}
                  </div>
                  <div>{(b.authors || []).join(', ') || 'N/A'}</div>
                  {(activeTab === 'pending' || activeTab === 'rejected') && (
                    <div>
                      {b.creator_name}
                      <small style={{ display: 'block', color: '#6c757d' }}>{b.creator_email}</small>
                    </div>
                  )}
                  {activeTab === 'rejected' && (
                    <div>
                      <small style={{ color: '#dc3545' }}>{b.rejected_reason || 'Không có lý do'}</small>
                    </div>
                  )}
                  <div>
                    <span className={`badge ${b.approval_status}`}>
                      {b.approval_status === 'approved' && '✓ Đã duyệt'}
                      {b.approval_status === 'pending' && '⏳ Chờ duyệt'}
                      {b.approval_status === 'rejected' && '✗ Từ chối'}
                    </span>
                  </div>
                  <div className="actions">
                    {/* View Detail Button */}
                    <button 
                      className="btn primary" 
                      onClick={() => navigate(`/admin/books/${b._id || b.id}`)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i> Chi tiết
                    </button>
                    
                    {isAdmin && b.approval_status === 'pending' && (
                      <>
                        <button className="btn success" onClick={()=>approve(b._id || b.id)}>
                          <i className="fas fa-check"></i> Duyệt
                        </button>
                        <button className="btn warning" onClick={()=>reject(b._id || b.id)}>
                          <i className="fas fa-times"></i> Từ chối
                        </button>
                      </>
                    )}
                    {isAdmin && (
                      <button className="btn danger" onClick={()=>remove(b._id || b.id)}>
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    )}
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
