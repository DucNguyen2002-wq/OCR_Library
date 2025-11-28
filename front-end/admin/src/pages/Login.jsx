import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/client';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        username: email,
        password: password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        const { token, user } = response.data;
        
        if (!user) {
          toast.error('Lỗi: Không nhận được thông tin người dùng');
          return;
        }
        
        // Check if user is admin
        if (user.role !== 'admin') {
          toast.error('Bạn không có quyền truy cập trang quản trị');
          return;
        }

        // Save token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));

        toast.success(`Chào mừng, ${user.name}!`);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <i className="fas fa-user-shield"></i>
            <h1>Admin Dashboard</h1>
            <p>Quản lý hệ thống thư viện</p>
          </div>
          <div className="login-features">
            <div className="feature-item">
              <i className="fas fa-users"></i>
              <span>Quản lý người dùng</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-book"></i>
              <span>Quản lý sách</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-line"></i>
              <span>Thống kê & báo cáo</span>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Đăng nhập quản trị</h2>
              <p>Nhập thông tin để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i> Mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Đăng nhập
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
