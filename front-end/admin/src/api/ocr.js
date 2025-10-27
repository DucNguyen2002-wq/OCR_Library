import api from './client'

export const checkStatus = async () => {
  const { data } = await api.get('/ocr/status')
  return data
}

export const processImage = async (file) => {
  const form = new FormData()
  form.append('coverImage', file)
  const { data } = await api.post('/ocr/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
