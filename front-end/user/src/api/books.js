import api from './client'

export const listBooks = async (params) => {
  return await api.get('/books', { params });
}

export const getFeaturedBooks = async () => {
  return await api.get('/books', { 
    params: { 
      limit: 8, 
      sortBy: 'createdAt', 
      order: 'desc',
      approval_status: 'approved'
    } 
  });
}

export const getBook = async (id) => {
  return await api.get(`/books/${id}`);
}

export const createBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
}

export const updateBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
}

export const deleteBook = async (id) => {
  return await api.delete(`/books/${id}`);
}

export const searchBooks = async (query, params) => {
  return await api.get('/books', { 
    params: { 
      search: query, 
      ...params 
    } 
  });
}

export const getMyRejectedBooks = async (params) => {
  return await api.get('/books/my-rejected', { params });
}

export const resubmitBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}/resubmit`, bookData);
  return response.data;
}
