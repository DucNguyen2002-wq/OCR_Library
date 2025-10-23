# 🔧 Debug Camera Issue - Màn Hình Đen

## Vấn Đề
Camera mở nhưng chỉ hiển thị màn hình đen.

## Đã Sửa

### 1. ✅ Cải thiện startCamera()
- Thêm fallback khi camera sau không khả dụng
- Thêm timeout để đợi state update
- Thêm event listener `onloadedmetadata`
- Thêm console.log để debug
- Thêm muted attribute cho video

### 2. ✅ Thêm Loading State
- State `isCameraLoading` để hiển thị loading
- Loading spinner khi đang khởi tạo camera
- Ẩn video khi đang loading

### 3. ✅ Cải thiện CSS
- Thêm min-height cho camera container
- Thêm styles cho loading indicator
- Cải thiện display logic

### 4. ✅ Error Handling
- Chi tiết hơn về các loại lỗi camera
- Console logs để debug
- Alert messages rõ ràng hơn

## Cách Test

### Step 1: Mở Console (F12)
```
1. Mở DevTools (F12)
2. Tab Console
3. Xem logs khi click "Mở Camera"
```

### Step 2: Click "Mở Camera"
Quan sát console logs:
```
✅ Camera stream obtained: [VideoStreamTrack]
✅ Setting video srcObject
✅ Video metadata loaded
✅ Video playing successfully
```

### Step 3: Kiểm tra Video Element
Trong Console, gõ:
```javascript
document.querySelector('.camera-preview')
```

Kiểm tra:
- srcObject có giá trị không?
- videoWidth và videoHeight có > 0 không?
- readyState = 4 (HAVE_ENOUGH_DATA)?

## Các Lỗi Thường Gặp

### Lỗi 1: NotAllowedError
**Nguyên nhân**: Quyền camera bị từ chối

**Giải pháp**:
1. Click vào icon 🔒 hoặc ℹ️ trên address bar
2. Tìm Camera permissions
3. Chọn "Allow"
4. Refresh trang (F5)

### Lỗi 2: NotFoundError
**Nguyên nhân**: Không có camera

**Giải pháp**:
- Kiểm tra camera có kết nối không
- Thử camera trước (webcam)
- Kiểm tra Device Manager

### Lỗi 3: NotReadableError
**Nguyên nhân**: Camera đang được sử dụng

**Giải pháp**:
1. Đóng các app khác (Zoom, Skype, Teams)
2. Restart browser
3. Thử lại

### Lỗi 4: Màn hình đen (stream OK nhưng không hiển thị)
**Nguyên nhân**: Video element chưa ready

**Đã sửa bằng**:
- Thêm `muted` attribute
- Đợi `onloadedmetadata` event
- Gọi `play()` sau khi metadata loaded
- Thêm timeout cho state update

## Debug Commands

Mở Console và chạy các lệnh sau:

### 1. Kiểm tra camera có sẵn không
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log('Cameras found:', cameras);
  });
```

### 2. Test camera đơn giản
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Stream:', stream);
    console.log('Tracks:', stream.getVideoTracks());
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    document.body.appendChild(video);
  })
  .catch(err => console.error('Error:', err));
```

### 3. Kiểm tra video element
```javascript
const video = document.querySelector('.camera-preview');
console.log('Video element:', video);
console.log('srcObject:', video?.srcObject);
console.log('videoWidth:', video?.videoWidth);
console.log('videoHeight:', video?.videoHeight);
console.log('readyState:', video?.readyState);
console.log('paused:', video?.paused);
```

## Các Thay Đổi Code

### OCRScanner.js

**Thêm state:**
```javascript
const [isCameraLoading, setIsCameraLoading] = useState(false);
```

**Cải thiện startCamera:**
- Fallback constraints nếu 'environment' không khả dụng
- Timeout 100ms cho state update
- Event listeners: onloadedmetadata, onerror
- Console logs chi tiết
- Better error messages

**Video element:**
```javascript
<video 
  ref={videoRef} 
  className="camera-preview" 
  autoPlay 
  playsInline 
  muted  // QUAN TRỌNG!
  style={{ display: isCameraLoading ? 'none' : 'block' }}
/>
```

### OCRScanner.css

**Thêm:**
```css
.camera-loading {
  position: absolute;
  /* ... loading styles ... */
}

.camera-preview {
  /* ... thêm min-height ... */
}
```

## Kiểm Tra Lại

### ✅ Checklist:
- [ ] Console không có error màu đỏ
- [ ] Thấy logs "Camera stream obtained"
- [ ] Thấy logs "Video metadata loaded"
- [ ] Thấy logs "Video playing successfully"
- [ ] Video element có videoWidth > 0
- [ ] Video element có videoHeight > 0
- [ ] Thấy hình ảnh từ camera (không phải màu đen)
- [ ] Controls hiển thị ở dưới video
- [ ] Click "Chụp Ảnh" hoạt động
- [ ] Ảnh được capture rõ ràng

## Nếu Vẫn Màu Đen

### Test 1: Camera Hardware
1. Mở Camera app khác (Windows Camera, Photo Booth)
2. Kiểm tra camera hoạt động không
3. Nếu không → vấn đề hardware

### Test 2: Browser Permissions
1. chrome://settings/content/camera (Chrome)
2. about:preferences#privacy (Firefox)
3. Kiểm tra site có trong allowed list không

### Test 3: Thử Browser Khác
- Chrome ✅
- Firefox ✅
- Edge ✅
- Safari ✅

### Test 4: HTTPS
- Camera chỉ hoạt động trên:
  - https:// 
  - localhost
  - 127.0.0.1

### Test 5: Simple Test Page
Tạo file `test-camera.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <video id="video" autoplay playsinline muted></video>
  <script>
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        document.getElementById('video').srcObject = stream;
      });
  </script>
</body>
</html>
```

Mở file này, nếu hoạt động → vấn đề ở React app.

## Next Steps

1. **Refresh browser** (Ctrl + F5)
2. **Click "Mở Camera"**
3. **Check console** cho logs
4. **Report kết quả**:
   - Browser version?
   - Console logs?
   - Video element properties?
   - Screenshot?

## Contact

Nếu vẫn không hoạt động, cung cấp:
1. Browser version
2. OS version
3. Console logs (toàn bộ)
4. Screenshot màn hình đen
5. Video element properties (từ console)

---

**Code đã được update! Hãy refresh và thử lại! 🔄**
