"""
OpenCV Module for Image Processing and Basic OCR
"""

import cv2
import numpy as np
import time
import os
from typing import Tuple, List, Dict, Optional

class OpenCVProcessor:
    def __init__(self):
        """
        Khởi tạo OpenCV processor
        """
        print("Đang khởi tạo OpenCV processor...")
        print("✓ OpenCV processor đã được khởi tạo")
    
    def load_image(self, image_path: str) -> Optional[np.ndarray]:
        """
        Tải ảnh từ đường dẫn
        
        Args:
            image_path: Đường dẫn đến ảnh
            
        Returns:
            Ảnh dưới dạng numpy array hoặc None nếu lỗi
        """
        if not os.path.exists(image_path):
            return None
        
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        return img
    
    def convert_to_grayscale(self, image: np.ndarray) -> np.ndarray:
        """
        Chuyển ảnh sang grayscale
        
        Args:
            image: Ảnh đầu vào
            
        Returns:
            Ảnh grayscale
        """
        if len(image.shape) == 3:
            return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return image
    
    def apply_gaussian_blur(self, image: np.ndarray, kernel_size: Tuple[int, int] = (5, 5), 
                           sigma: float = 0) -> np.ndarray:
        """
        Áp dụng Gaussian blur để giảm noise
        
        Args:
            image: Ảnh đầu vào
            kernel_size: Kích thước kernel
            sigma: Độ lệch chuẩn Gaussian
            
        Returns:
            Ảnh đã blur
        """
        return cv2.GaussianBlur(image, kernel_size, sigma)
    
    def apply_threshold(self, image: np.ndarray, threshold_type: str = 'otsu') -> np.ndarray:
        """
        Áp dụng thresholding
        
        Args:
            image: Ảnh grayscale đầu vào
            threshold_type: Loại threshold ('otsu', 'adaptive', 'binary')
            
        Returns:
            Ảnh đã threshold
        """
        if threshold_type == 'otsu':
            _, thresh = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        elif threshold_type == 'adaptive':
            thresh = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                         cv2.THRESH_BINARY, 11, 2)
        elif threshold_type == 'binary':
            _, thresh = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)
        else:
            raise ValueError(f"Unsupported threshold type: {threshold_type}")
        
        return thresh
    
    def apply_morphological_operations(self, image: np.ndarray, operation: str = 'close',
                                     kernel_size: Tuple[int, int] = (3, 3)) -> np.ndarray:
        """
        Áp dụng các phép toán morphological
        
        Args:
            image: Ảnh đầu vào
            operation: Loại phép toán ('open', 'close', 'erode', 'dilate')
            kernel_size: Kích thước kernel
            
        Returns:
            Ảnh đã xử lý
        """
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, kernel_size)
        
        if operation == 'open':
            return cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)
        elif operation == 'close':
            return cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
        elif operation == 'erode':
            return cv2.erode(image, kernel, iterations=1)
        elif operation == 'dilate':
            return cv2.dilate(image, kernel, iterations=1)
        else:
            raise ValueError(f"Unsupported morphological operation: {operation}")
    
    def detect_contours(self, image: np.ndarray) -> List[np.ndarray]:
        """
        Phát hiện contours trong ảnh
        
        Args:
            image: Ảnh binary đầu vào
            
        Returns:
            Danh sách các contours
        """
        contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        return contours
    
    def filter_text_regions(self, contours: List[np.ndarray], 
                           min_area: int = 100, max_area: int = 50000,
                           min_aspect_ratio: float = 0.1, max_aspect_ratio: float = 10.0) -> List[np.ndarray]:
        """
        Lọc các vùng có khả năng chứa text
        
        Args:
            contours: Danh sách contours
            min_area: Diện tích tối thiểu
            max_area: Diện tích tối đa
            min_aspect_ratio: Tỷ lệ khung hình tối thiểu
            max_aspect_ratio: Tỷ lệ khung hình tối đa
            
        Returns:
            Danh sách contours đã lọc
        """
        filtered_contours = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if min_area <= area <= max_area:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h if h > 0 else 0
                
                if min_aspect_ratio <= aspect_ratio <= max_aspect_ratio:
                    filtered_contours.append(contour)
        
        return filtered_contours
    
    def preprocess_for_ocr(self, image_path: str, preprocessing_type: str = 'standard') -> Optional[np.ndarray]:
        """
        Tiền xử lý ảnh cho OCR
        
        Args:
            image_path: Đường dẫn ảnh
            preprocessing_type: Loại tiền xử lý ('standard', 'aggressive', 'light')
            
        Returns:
            Ảnh đã tiền xử lý
        """
        # Tải ảnh
        img = self.load_image(image_path)
        if img is None:
            return None
        
        # Chuyển sang grayscale
        gray = self.convert_to_grayscale(img)
        
        if preprocessing_type == 'standard':
            # Tiền xử lý chuẩn
            blurred = self.apply_gaussian_blur(gray, (5, 5))
            thresh = self.apply_threshold(blurred, 'otsu')
            processed = self.apply_morphological_operations(thresh, 'close', (3, 3))
        
        elif preprocessing_type == 'aggressive':
            # Tiền xử lý mạnh
            blurred = self.apply_gaussian_blur(gray, (7, 7))
            thresh = self.apply_threshold(blurred, 'adaptive')
            processed = self.apply_morphological_operations(thresh, 'close', (5, 5))
            processed = self.apply_morphological_operations(processed, 'open', (3, 3))
        
        elif preprocessing_type == 'light':
            # Tiền xử lý nhẹ
            blurred = self.apply_gaussian_blur(gray, (3, 3))
            processed = self.apply_threshold(blurred, 'otsu')
        
        else:
            raise ValueError(f"Unsupported preprocessing type: {preprocessing_type}")
        
        return processed
    
    def enhance_contrast(self, image: np.ndarray, method: str = 'clahe') -> np.ndarray:
        """
        Tăng cường độ tương phản
        
        Args:
            image: Ảnh đầu vào
            method: Phương pháp ('clahe', 'histogram_eq')
            
        Returns:
            Ảnh đã tăng cường
        """
        if method == 'clahe':
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            return clahe.apply(image)
        elif method == 'histogram_eq':
            return cv2.equalizeHist(image)
        else:
            raise ValueError(f"Unsupported contrast enhancement method: {method}")
    
    def denoise_image(self, image: np.ndarray, method: str = 'bilateral') -> np.ndarray:
        """
        Khử nhiễu ảnh
        
        Args:
            image: Ảnh đầu vào
            method: Phương pháp ('bilateral', 'gaussian', 'median')
            
        Returns:
            Ảnh đã khử nhiễu
        """
        if method == 'bilateral':
            return cv2.bilateralFilter(image, 9, 75, 75)
        elif method == 'gaussian':
            return cv2.GaussianBlur(image, (5, 5), 0)
        elif method == 'median':
            return cv2.medianBlur(image, 5)
        else:
            raise ValueError(f"Unsupported denoising method: {method}")
    
    def enhance_image_for_ocr(self, image_path: str, method: str = 'auto') -> Optional[str]:
        """
        Tiền xử lý ảnh tối ưu cho OCR
        
        Args:
            image_path: Đường dẫn ảnh gốc
            method: Phương pháp tiền xử lý ('auto', 'light', 'medium', 'strong')
            
        Returns:
            Đường dẫn ảnh đã được tiền xử lý hoặc None nếu lỗi
        """
        try:
            # Tải ảnh
            img = self.load_image(image_path)
            if img is None:
                return None
            
            # Chuyển sang grayscale
            gray = self.convert_to_grayscale(img)
            
            # Tăng cường độ tương phản trước
            enhanced = self.enhance_contrast(gray, 'clahe')
            
            # Khử nhiễu
            denoised = self.denoise_image(enhanced, 'bilateral')
            
            # Áp dụng tiền xử lý theo phương pháp
            if method == 'auto':
                # Tự động chọn phương pháp dựa trên đặc điểm ảnh
                processed = self._auto_preprocess(denoised)
            elif method == 'light':
                # Tiền xử lý nhẹ - phù hợp với ảnh chất lượng cao
                blurred = self.apply_gaussian_blur(denoised, (3, 3))
                processed = self.apply_threshold(blurred, 'otsu')
            elif method == 'medium':
                # Tiền xử lý trung bình
                blurred = self.apply_gaussian_blur(denoised, (5, 5))
                thresh = self.apply_threshold(blurred, 'otsu')
                processed = self.apply_morphological_operations(thresh, 'close', (3, 3))
            elif method == 'strong':
                # Tiền xử lý mạnh - phù hợp với ảnh chất lượng thấp
                blurred = self.apply_gaussian_blur(denoised, (7, 7))
                thresh = self.apply_threshold(blurred, 'adaptive')
                processed = self.apply_morphological_operations(thresh, 'close', (5, 5))
                processed = self.apply_morphological_operations(processed, 'open', (2, 2))
            else:
                processed = denoised
            
            # Tạo tên file output
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_path = f"temp_processed_{base_name}_{method}.jpg"
            
            # Lưu ảnh đã xử lý
            if self.save_processed_image(processed, output_path):
                return output_path
            else:
                return None
                
        except Exception as e:
            print(f"Lỗi tiền xử lý ảnh: {str(e)}")
            return None
    
    def _auto_preprocess(self, image: np.ndarray) -> np.ndarray:
        """
        Tự động chọn phương pháp tiền xử lý dựa trên đặc điểm ảnh
        
        Args:
            image: Ảnh grayscale đầu vào
            
        Returns:
            Ảnh đã được tiền xử lý
        """
        # Tính toán độ sáng trung bình
        mean_brightness = np.mean(image)
        
        # Tính toán độ tương phản
        contrast = np.std(image)
        
        if mean_brightness < 80 and contrast < 50:
            # Ảnh tối và ít tương phản - xử lý mạnh
            blurred = self.apply_gaussian_blur(image, (7, 7))
            thresh = self.apply_threshold(blurred, 'adaptive')
            processed = self.apply_morphological_operations(thresh, 'close', (5, 5))
        elif mean_brightness > 180:
            # Ảnh sáng - xử lý nhẹ
            blurred = self.apply_gaussian_blur(image, (3, 3))
            processed = self.apply_threshold(blurred, 'otsu')
        else:
            # Ảnh bình thường - xử lý trung bình
            blurred = self.apply_gaussian_blur(image, (5, 5))
            thresh = self.apply_threshold(blurred, 'otsu')
            processed = self.apply_morphological_operations(thresh, 'close', (3, 3))
            
        return processed
    
    def optimize_for_tesseract(self, image_path: str) -> Optional[str]:
        """
        Tối ưu ảnh cho Tesseract OCR
        
        Args:
            image_path: Đường dẫn ảnh gốc
            
        Returns:
            Đường dẫn ảnh đã tối ưu cho Tesseract
        """
        try:
            img = self.load_image(image_path)
            if img is None:
                return None
            
            # Chuyển sang grayscale
            gray = self.convert_to_grayscale(img)
            
            # Tăng kích thước ảnh để cải thiện độ chính xác (Tesseract hoạt động tốt với ảnh lớn)
            height, width = gray.shape
            if height < 300 or width < 300:
                scale_factor = max(300/height, 300/width)
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                gray = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
            
            # Tăng cường độ tương phản
            enhanced = self.enhance_contrast(gray, 'clahe')
            
            # Khử nhiễu nhẹ
            denoised = self.denoise_image(enhanced, 'bilateral')
            
            # Thresholding OTSU (Tesseract hoạt động tốt với ảnh binary)
            _, processed = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations để làm sạch
            processed = self.apply_morphological_operations(processed, 'close', (2, 2))
            
            # Lưu ảnh
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_path = f"temp_tesseract_{base_name}.jpg"
            
            if self.save_processed_image(processed, output_path):
                return output_path
            return None
            
        except Exception as e:
            print(f"Lỗi tối ưu cho Tesseract: {str(e)}")
            return None
    
    def optimize_for_easyocr(self, image_path: str) -> Optional[str]:
        """
        Tối ưu ảnh cho EasyOCR
        
        Args:
            image_path: Đường dẫn ảnh gốc
            
        Returns:
            Đường dẫn ảnh đã tối ưu cho EasyOCR
        """
        try:
            img = self.load_image(image_path)
            if img is None:
                return None
            
            # EasyOCR hoạt động tốt với ảnh màu, nhưng cần tăng cường tương phản
            if len(img.shape) == 3:
                # Tăng cường tương phản cho ảnh màu
                lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                
                # Áp dụng CLAHE cho kênh L (brightness)
                clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
                l = clahe.apply(l)
                
                # Ghép lại
                processed = cv2.merge([l, a, b])
                processed = cv2.cvtColor(processed, cv2.COLOR_LAB2BGR)
            else:
                # Nếu là ảnh grayscale
                processed = self.enhance_contrast(img, 'clahe')
                processed = cv2.cvtColor(processed, cv2.COLOR_GRAY2BGR)
            
            # Khử nhiễu nhẹ
            processed = cv2.bilateralFilter(processed, 9, 75, 75)
            
            # Lưu ảnh
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_path = f"temp_easyocr_{base_name}.jpg"
            
            if cv2.imwrite(output_path, processed):
                return output_path
            return None
            
        except Exception as e:
            print(f"Lỗi tối ưu cho EasyOCR: {str(e)}")
            return None
    
    def optimize_for_doctr(self, image_path: str) -> Optional[str]:
        """
        Tối ưu ảnh cho DocTR
        
        Args:
            image_path: Đường dẫn ảnh gốc
            
        Returns:
            Đường dẫn ảnh đã tối ưu cho DocTR
        """
        try:
            img = self.load_image(image_path)
            if img is None:
                return None
            
            # DocTR hoạt động tốt với ảnh RGB có độ tương phản cao
            if len(img.shape) == 2:
                # Nếu là grayscale, chuyển sang RGB
                processed = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            else:
                processed = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Tăng cường độ sáng và tương phản
            processed = cv2.convertScaleAbs(processed, alpha=1.2, beta=30)
            
            # Khử nhiễu
            processed = cv2.bilateralFilter(processed, 9, 75, 75)
            
            # Sharpen để làm rõ text
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            processed = cv2.filter2D(processed, -1, kernel)
            
            # Lưu ảnh (chuyển về BGR để lưu với OpenCV)
            processed_bgr = cv2.cvtColor(processed, cv2.COLOR_RGB2BGR)
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_path = f"temp_doctr_{base_name}.jpg"
            
            if cv2.imwrite(output_path, processed_bgr):
                return output_path
            return None
            
        except Exception as e:
            print(f"Lỗi tối ưu cho DocTR: {str(e)}")
            return None
    
    def cleanup_temp_files(self):
        """
        Dọn dẹp các file tạm thời
        """
        import glob
        try:
            temp_files = glob.glob("temp_*.jpg")
            for temp_file in temp_files:
                try:
                    os.remove(temp_file)
                except:
                    pass
            print(f"✓ Đã dọn dẹp {len(temp_files)} file tạm")
        except Exception as e:
            print(f"Lỗi dọn dẹp file tạm: {str(e)}")
    
    def get_optimized_image_for_ocr(self, image_path: str, ocr_engine: str) -> Optional[str]:
        """
        Lấy ảnh đã được tối ưu cho engine OCR cụ thể
        
        Args:
            image_path: Đường dẫn ảnh gốc
            ocr_engine: Loại OCR ('tesseract', 'easyocr', 'doctr')
            
        Returns:
            Đường dẫn ảnh đã tối ưu
        """
        if ocr_engine.lower() == 'tesseract' or ocr_engine.lower() == 'pytesseract':
            return self.optimize_for_tesseract(image_path)
        elif ocr_engine.lower() == 'easyocr':
            return self.optimize_for_easyocr(image_path)
        elif ocr_engine.lower() == 'doctr':
            return self.optimize_for_doctr(image_path)
        else:
            # Sử dụng phương pháp tổng quát
            return self.enhance_image_for_ocr(image_path, 'auto')
    
    def save_processed_image(self, image: np.ndarray, output_path: str) -> bool:
        """
        Lưu ảnh đã xử lý
        
        Args:
            image: Ảnh cần lưu
            output_path: Đường dẫn đầu ra
            
        Returns:
            True nếu thành công, False nếu thất bại
        """
        try:
            cv2.imwrite(output_path, image)
            return True
        except Exception:
            return False
    
    def create_preprocessing_comparison(self, image_path: str, output_dir: str = "opencv_results") -> Dict:
        """
        Tạo so sánh các phương pháp tiền xử lý
        
        Args:
            image_path: Đường dẫn ảnh gốc
            output_dir: Thư mục lưu kết quả
            
        Returns:
            Dictionary chứa thông tin so sánh
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        img_name = os.path.splitext(os.path.basename(image_path))[0]
        
        # Tải ảnh gốc
        original = self.load_image(image_path)
        if original is None:
            return {'success': False, 'error': 'Cannot load image'}
        
        results = {
            'original_path': image_path,
            'output_directory': output_dir,
            'preprocessing_methods': {},
            'success': True
        }
        
        # Các phương pháp tiền xử lý
        methods = ['standard', 'aggressive', 'light']
        
        for method in methods:
            try:
                processed = self.preprocess_for_ocr(image_path, method)
                if processed is not None:
                    output_path = os.path.join(output_dir, f"{img_name}_{method}.jpg")
                    success = self.save_processed_image(processed, output_path)
                    
                    if success:
                        # Đơn giản hóa kết quả phân tích
                        results['preprocessing_methods'][method] = {
                            'output_path': output_path,
                            'success': True
                        }
                    else:
                        results['preprocessing_methods'][method] = {
                            'success': False,
                            'error': 'Failed to save processed image'
                        }
            except Exception as e:
                results['preprocessing_methods'][method] = {
                    'success': False,
                    'error': str(e)
                }
        
        return results
    
    def batch_preprocess(self, input_folder: str, output_folder: str, 
                        preprocessing_type: str = 'standard') -> Dict:
        """
        Xử lý hàng loạt ảnh
        
        Args:
            input_folder: Thư mục chứa ảnh đầu vào
            output_folder: Thư mục lưu ảnh đầu ra
            preprocessing_type: Loại tiền xử lý
            
        Returns:
            Dictionary chứa kết quả xử lý
        """
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
        
        results = {
            'input_folder': input_folder,
            'output_folder': output_folder,
            'preprocessing_type': preprocessing_type,
            'processed_images': [],
            'failed_images': [],
            'total_time': 0
        }
        
        start_time = time.time()
        
        for filename in os.listdir(input_folder):
            if any(filename.lower().endswith(ext) for ext in image_extensions):
                input_path = os.path.join(input_folder, filename)
                output_path = os.path.join(output_folder, f"processed_{filename}")
                
                try:
                    processed = self.preprocess_for_ocr(input_path, preprocessing_type)
                    if processed is not None:
                        success = self.save_processed_image(processed, output_path)
                        if success:
                            results['processed_images'].append({
                                'input': input_path,
                                'output': output_path,
                                'filename': filename
                            })
                        else:
                            results['failed_images'].append({
                                'input': input_path,
                                'filename': filename,
                                'error': 'Failed to save'
                            })
                    else:
                        results['failed_images'].append({
                            'input': input_path,
                            'filename': filename,
                            'error': 'Failed to process'
                        })
                        
                except Exception as e:
                    results['failed_images'].append({
                        'input': input_path,
                        'filename': filename,
                        'error': str(e)
                    })
        
        results['total_time'] = time.time() - start_time
        results['success_count'] = len(results['processed_images'])
        results['failure_count'] = len(results['failed_images'])
        
        return results
