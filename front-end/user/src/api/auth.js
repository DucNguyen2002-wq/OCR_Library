import api from './client'

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export const register = async (fullname, email, password) => {
  const { data } = await api.post('/auth/register', { fullname, email, password })
  return data
}

export const me = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } catch {}
  localStorage.removeItem('token')
  localStorage.removeItem('currentUser')
}
