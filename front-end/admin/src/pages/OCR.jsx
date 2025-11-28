import { useEffect, useState } from 'react'
import Sidebar from '../components/Layout/Sidebar'
import Topbar from '../components/Layout/Topbar'
import { checkStatus, processImage } from '../api/ocr'

export default function OCR() {
  const [service, setService] = useState('checking...')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    (async()=>{
      try {
        const res = await checkStatus()
        setService(res?.status || 'unknown')
      } catch { setService('unknown') }
    })()
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setResult('')
    try {
      const res = await processImage(file)
      if (res?.success) {
        setResult(res.text || JSON.stringify(res, null, 2))
      } else {
        setResult(res?.message || 'OCR thất bại')
      }
    } catch (e) {
      setResult(e?.response?.data?.message || 'Lỗi OCR')
    } finally { setLoading(false) }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Topbar title="OCR Service" />

        <div className="panel">
          <div className="panel-header">Trạng thái dịch vụ: <span className="badge info">{service}</span></div>
          <div className="upload">
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            <button className="btn primary" onClick={handleUpload} disabled={!file || loading}>{loading? 'Đang xử lý…' : 'Nhận dạng'}</button>
          </div>
          <textarea className="ocr-output" rows={12} value={result} onChange={()=>{}} placeholder="Kết quả OCR sẽ hiển thị ở đây"></textarea>
        </div>
      </main>
    </div>
  )
}
