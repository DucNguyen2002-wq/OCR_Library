"""
Pytesseract Module for Vietnamese Text Recognition
"""

import pytesseract
import numpy as np
from PIL import Image
import time
import os
from .opencv_module import OpenCVProcessor

class PytesseractProcessor:
    def __init__(self, tesseract_cmd=None):
        """
        Khởi tạo Pytesseract processor
        
        Args:
            tesseract_cmd: Đường dẫn đến tesseract executable (None để tự động tìm)
        """
        print("Đang khởi tạo Pytesseract...")
        self.opencv_processor = OpenCVProcessor()
        
        # Thiết lập đường dẫn tesseract nếu cần
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        else:
            # Tự động tìm đường dẫn Tesseract cho Windows
            if os.name == 'nt':  # Windows
                possible_paths = [
                    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                    r'C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
                ]
                
                for path in possible_paths:
                    if os.path.exists(path):
                        pytesseract.pytesseract.tesseract_cmd = path
                        print(f"✓ Tìm thấy Tesseract tại: {path}")
                        break
        
        # Kiểm tra tesseract có hoạt động không
        try:
            pytesseract.get_tesseract_version()
            print("✓ Pytesseract đã được khởi tạo")
        except Exception as e:
            print(f"⚠️ Lỗi khởi tạo Pytesseract: {str(e)}")
            print("💡 Hướng dẫn cài đặt:")
            print("   - Windows: Tải và cài đặt từ https://github.com/UB-Mannheim/tesseract/wiki")
            print("   - Hoặc: choco install tesseract")
            print("   - Hoặc: winget install --id UB-Mannheim.TesseractOCR")
    
    def extract_text(self, image_path, lang='vie+eng', confidence_threshold=30):
        """
        Trích xuất văn bản từ ảnh bằng Pytesseract
        
        Args:
            image_path: Đường dẫn đến ảnh hoặc numpy array
            lang: Ngôn ngữ ('vie+eng' cho tiếng Việt + Anh)
            confidence_threshold: Ngưỡng độ tin cậy tối thiểu
            
        Returns:
            Dictionary chứa kết quả OCR
        """
        start_time = time.time()
        
        try:
            # Sử dụng OpenCV để tối ưu ảnh cho Tesseract
            if isinstance(image_path, str):
                optimized_path = self.opencv_processor.get_optimized_image_for_ocr(image_path, 'tesseract')
                input_path = optimized_path if optimized_path else image_path
                
                if not os.path.exists(input_path):
                    raise ValueError(f"Không tìm thấy file: {input_path}")
                image = Image.open(input_path)
            else:
                # Numpy array - sử dụng trực tiếp
                if len(image_path.shape) == 3:
                    # Chuyển từ OpenCV (BGR) sang PIL (RGB)
                    image = Image.fromarray(image_path[:, :, ::-1])
                else:
                    image = Image.fromarray(image_path)
                optimized_path = None
            
            # Cấu hình Tesseract
            custom_config = r'--oem 3 --psm 6'
            
            # Trích xuất text với confidence
            data = pytesseract.image_to_data(
                image, 
                lang=lang, 
                config=custom_config, 
                output_type=pytesseract.Output.DICT
            )
            
            # Lọc kết quả theo confidence
            extracted_text = []
            confidence_scores = []
            
            for i in range(len(data['text'])):
                text = data['text'][i].strip()
                conf = int(data['conf'][i])
                
                if text and conf > confidence_threshold:
                    extracted_text.append(text)
                    confidence_scores.append(conf / 100.0)  # Chuyển về 0-1
            
            # Trích xuất text đầy đủ (không lọc confidence)
            full_text = pytesseract.image_to_string(image, lang=lang, config=custom_config).strip()
            
            processing_time = time.time() - start_time
            avg_confidence = np.mean(confidence_scores) if confidence_scores else 0
            
            # Tính toán số từ trung bình và tỷ lệ thành công
            word_count = len(extracted_text)
            success_rate = 1.0 if full_text.strip() else 0.0
            avg_words = word_count if word_count > 0 else 0
            accuracy = avg_confidence
            
            # Dọn dẹp file tạm nếu có
            if optimized_path:
                try:
                    os.remove(optimized_path)
                except:
                    pass
            
            return {
                'text': full_text,
                'processing_time': processing_time,
                'success_rate': success_rate,
                'avg_words': avg_words,
                'accuracy': accuracy
            }
            
        except Exception as e:
            return {
                'text': '',
                'processing_time': time.time() - start_time,
                'success_rate': 0.0,
                'avg_words': 0,
                'accuracy': 0.0,
                'error': str(e)
            }
    
    def extract_text_with_preprocessing(self, processed_image, lang='vie+eng', confidence_threshold=30):
        """
        Trích xuất văn bản từ ảnh đã được tiền xử lý
        
        Args:
            processed_image: Ảnh đã được tiền xử lý (numpy array)
            lang: Ngôn ngữ
            confidence_threshold: Ngưỡng độ tin cậy
            
        Returns:
            Dictionary chứa kết quả OCR
        """
        return self.extract_text(processed_image, lang, confidence_threshold)
    
    def get_available_languages(self):
        """
        Lấy danh sách ngôn ngữ có sẵn
        
        Returns:
            List các ngôn ngữ hỗ trợ
        """
        try:
            return pytesseract.get_languages()
        except Exception as e:
            print(f"Lỗi lấy danh sách ngôn ngữ: {str(e)}")
            return []
    
    def extract_text_with_custom_config(self, image_path, custom_config, lang='vie+eng'):
        """
        Trích xuất text với cấu hình tùy chỉnh
        
        Args:
            image_path: Đường dẫn ảnh
            custom_config: Cấu hình Tesseract tùy chỉnh
            lang: Ngôn ngữ
            
        Returns:
            Dictionary chứa kết quả OCR
        """
        start_time = time.time()
        
        try:
            if isinstance(image_path, str):
                image = Image.open(image_path)
            else:
                # Numpy array
                if len(image_path.shape) == 3:
                    # Chuyển từ OpenCV (BGR) sang PIL (RGB)
                    image = Image.fromarray(image_path[:, :, ::-1])
                else:
                    image = Image.fromarray(image_path)
            
            text = pytesseract.image_to_string(image, lang=lang, config=custom_config).strip()
            
            processing_time = time.time() - start_time
            
            # Tính toán số từ trung bình và tỷ lệ thành công
            word_count = len(text.split()) if text else 0
            success_rate = 1.0 if text.strip() else 0.0
            avg_words = word_count if word_count > 0 else 0
            accuracy = 1.0 if text.strip() else 0.0  # Không có confidence score cho method này
            
            return {
                'text': text,
                'processing_time': processing_time,
                'success_rate': success_rate,
                'avg_words': avg_words,
                'accuracy': accuracy
            }
            
        except Exception as e:
            return {
                'text': '',
                'processing_time': time.time() - start_time,
                'success_rate': 0.0,
                'avg_words': 0,
                'accuracy': 0.0,
                'error': str(e)
            }
    
    def test_different_psm_modes(self, image_path, lang='vie+eng'):
        """
        Test các chế độ PSM khác nhau
        
        Args:
            image_path: Đường dẫn ảnh
            lang: Ngôn ngữ
            
        Returns:
            Dictionary chứa kết quả các chế độ PSM
        """
        psm_modes = {
            3: "Fully automatic page segmentation, but no OSD",
            6: "Uniform block of text",
            7: "Single text line",
            8: "Single word",
            11: "Sparse text",
            13: "Raw line. Treat image as single text line"
        }
        
        results = {}
        
        for psm, description in psm_modes.items():
            config = f'--oem 3 --psm {psm}'
            result = self.extract_text_with_custom_config(image_path, config, lang)
            result['description'] = description
            results[f'psm_{psm}'] = result
            
            print(f"PSM {psm} ({description}): "
                  f"{result['avg_words']} từ, "
                  f"{result['processing_time']:.2f}s, "
                  f"Độ chính xác: {result['accuracy']:.2f}")
        
        return results
