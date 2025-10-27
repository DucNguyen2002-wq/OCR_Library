import api from './client'

export const listBooks = async (params) => {
  const { data } = await api.get('/books', { params })
  return data
}

export const listPendingBooks = async (params) => {
  const { data } = await api.get('/books/pending', { params })
  return data
}

export const listRejectedBooks = async (params) => {
  const { data } = await api.get('/books/rejected', { params })
  return data
}

export const getBook = async (id) => {
  const { data } = await api.get(`/books/${id}`)
  return data
}

export const createBook = async (payload) => {
  const { data } = await api.post('/books', payload)
  return data
}

export const updateBook = async (id, payload) => {
  const { data } = await api.put(`/books/${id}`, payload)
  return data
}

export const removeBook = async (id) => {
  const { data } = await api.delete(`/books/${id}`)
  return data
}

export const approveBook = async (id) => {
  const { data } = await api.patch(`/books/${id}/approve`)
  return data
}

export const rejectBook = async (id, reason) => {
  const { data } = await api.patch(`/books/${id}/reject`, { reason })
  return data
}
