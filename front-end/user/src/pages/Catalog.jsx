import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { listBooks } from '../api/books'
import '../styles/catalog.css'

function BookCard({ book }) {
  const img = book.cover_front_url || book.cover_inner_url || book.cover_back_url || 'https://via.placeholder.com/400x550?text=No+Cover'
  const authors = (book.authors || []).map(a => a.name).join(', ')
  
  return (
    <div className="product-item">
      <div className="product-single">
        <div className="product-img">
          <img src={img} alt={book.title} />
          <div className="product-status">
            {book.year_published && <span>{book.year_published}</span>}
          </div>
        </div>
        <div className="product-content">
          <div className="product-title">
            <h2 title={book.title}>
              <Link to={`/books/${book._id || book.id}`}>{book.title}</Link>
            </h2>
          </div>
          <div className="product-ratting" aria-label="authors">
            {authors || 'Chưa có tác giả'}
          </div>
          <div className="product-price">
            <h2>{book.publisher || 'Chưa có nhà xuất bản'}</h2>
            {book.isbn && (
              <h2 style={{ textDecoration: 'none', color: '#666', fontSize: '13px' }}>
                ISBN: {book.isbn}
              </h2>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Catalog() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await listBooks()
        if (res?.success) {
          setBooks(res.books || [])
        } else {
          setError(res?.error || 'Không thể tải danh sách sách')
        }
      } catch (e) {
        setError(e?.response?.data?.error || 'Không thể tải danh sách sách')
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="grid-title">
          <h2>Thư viện sách - Dạng lưới</h2>
        </div>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Đang tải danh sách sách...
          </div>
        ) : (
          <div className="product-grid grid-1">
            {books.map(b => (
              <BookCard key={b.id || b._id} book={b} />
            ))}
            {books.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', width: '100%' }}>
                Chưa có sách trong thư viện.
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
