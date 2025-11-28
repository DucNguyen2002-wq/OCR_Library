import api from './client'

export const getUsers = async () => {
  const { data } = await api.get('/admin/users')
  return data
}

export const getRoles = async () => {
  const { data } = await api.get('/admin/users/roles')
  return data
}

export const updateUserRole = async (userId, roleId) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { roleId })
  return data
}

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/admin/users/${userId}`)
  return data
}

export const createUser = async (payload) => {
  const { data } = await api.post('/admin/users', payload)
  return data
}

export const resetPassword = async (userId, newPassword) => {
  const { data } = await api.put(`/admin/users/${userId}/password`, { newPassword })
  return data
}
