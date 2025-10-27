import api from './client'

export const getStats = async () => {
  const { data } = await api.get('/profile/stats')
  return data
}

export const updateProfile = async (payload) => {
  const { data } = await api.put('/profile/update', payload)
  return data
}

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put('/profile/change-password', { currentPassword, newPassword })
  return data
}
