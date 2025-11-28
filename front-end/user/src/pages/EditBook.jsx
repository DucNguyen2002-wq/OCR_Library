import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getBook, updateBook } from '../api/books'

export default function EditBook() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    authors: '',
    publisher: '',
    year_published: '',
    isbn: '',
    cover_front_url: '',
    description: ''
  })

  useEffect(() => {
    (async () => {
      try {
        const res = await getBook(id)
        if (res?.success) {
          const book = res.book
          setForm({
            title: book.title || '',
            authors: (book.authors || []).map(a => a.name).join(', '),
            publisher: book.publisher || '',
            year_published: book.year_published || '',
            isbn: book.isbn || '',
            cover_front_url: book.cover_front_url || '',
            description: book.description || ''
          })
        } else {
          setError(res?.error || 'Không tìm thấy sách')
        }
      } catch (e) {
        setError(e?.response?.data?.error || 'Không tìm thấy sách')
      } finally {
        setFetching(false)
      }
    })()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Tiêu đề là bắt buộc')
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        authors: form.authors.trim().split(',').map(a => ({ name: a.trim() })).filter(a => a.name),
        publisher: form.publisher.trim() || undefined,
        year_published: form.year_published ? parseInt(form.year_published) : undefined,
        isbn: form.isbn.trim() || undefined,
        cover_front_url: form.cover_front_url.trim() || undefined,
        description: form.description.trim() || undefined
      }
      
      const res = await updateBook(id, payload)
      if (res?.success) {
        alert(res.message || 'Đã cập nhật sách')
        navigate(`/books/${id}`)
      } else {
        setError(res?.error || 'Không thể cập nhật sách')
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể cập nhật sách')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <><Header /><div className="container page loading">Đang tải...</div><Footer /></>

  return (
    <>
      <Header />
      <main className="container page">
        <Link to={`/books/${id}`} className="back-link">← Quay lại</Link>
        <h1>Sửa thông tin sách</h1>
        
        {error && <div className="alert error">{error}</div>}
        
        <form className="book-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề <span className="required">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Nhập tiêu đề sách" required />
          </div>

          <div className="form-group">
            <label>Tác giả (phân cách bằng dấu phẩy)</label>
            <input name="authors" value={form.authors} onChange={handleChange} placeholder="Nguyễn Văn A, Trần Thị B" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nhà xuất bản</label>
              <input name="publisher" value={form.publisher} onChange={handleChange} placeholder="Nhà xuất bản" />
            </div>
            <div className="form-group">
              <label>Năm xuất bản</label>
              <input name="year_published" type="number" value={form.year_published} onChange={handleChange} placeholder="2024" />
            </div>
          </div>

          <div className="form-group">
            <label>ISBN</label>
            <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="978-3-16-148410-0" />
          </div>

          <div className="form-group">
            <label>URL ảnh bìa</label>
            <input name="cover_front_url" value={form.cover_front_url} onChange={handleChange} placeholder="https://example.com/cover.jpg" />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Mô tả về sách"></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
            <Link to={`/books/${id}`} className="btn-secondary">Hủy</Link>
          </div>
        </form>
      </main>
      <Footer />
    </>
  )
}
