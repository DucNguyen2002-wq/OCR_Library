import api from './client';

export const getProfile = async () => {
  return await api.get('/profile');
};

export const updateProfile = async (data) => {
  return await api.put('/profile', data);
};

export const changePassword = async (data) => {
  return await api.put('/profile/password', data);
};
