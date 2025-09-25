"""
DocTR Module for Vietnamese Text Recognition
"""

from doctr.io import DocumentFile
from doctr.models import ocr_predictor
import numpy as np
import time
from .opencv_module import OpenCVProcessor

class DocTRProcessor:
    def __init__(self, pretrained=True):
        """
        Khởi tạo DocTR processor
        
        Args:
            pretrained: Sử dụng mô hình đã được train trước
        """
        print("Đang khởi tạo DocTR...")
        self.model = ocr_predictor(pretrained=pretrained)
        self.opencv_processor = OpenCVProcessor()
        print("✓ DocTR đã được khởi tạo")
    
    def extract_text(self, image_path, confidence_threshold=0.3):
        """
        Trích xuất văn bản từ ảnh bằng DocTR
        
        Args:
            image_path: Đường dẫn đến ảnh
            confidence_threshold: Ngưỡng độ tin cậy tối thiểu
            
        Returns:
            Dictionary chứa kết quả OCR
        """
        start_time = time.time()
        
        try:
            # Sử dụng OpenCV để tối ưu ảnh cho DocTR
            optimized_path = self.opencv_processor.get_optimized_image_for_ocr(image_path, 'doctr')
            input_path = optimized_path if optimized_path else image_path
            
            # Đọc ảnh
            doc = DocumentFile.from_images(input_path)
            
            # Thực hiện OCR
            result = self.model(doc)
            
            # Trích xuất văn bản
            extracted_text = []
            confidence_scores = []
            
            for page in result.pages:
                for block in page.blocks:
                    for line in block.lines:
                        for word in line.words:
                            if word.confidence > confidence_threshold:
                                extracted_text.append(word.value)
                                confidence_scores.append(word.confidence)
            
            processing_time = time.time() - start_time
            full_text = ' '.join(extracted_text)
            avg_confidence = np.mean(confidence_scores) if confidence_scores else 0
            
            # Tính toán số từ trung bình và tỷ lệ thành công
            word_count = len(extracted_text)
            success_rate = 1.0 if full_text.strip() else 0.0
            avg_words = word_count if word_count > 0 else 0
            accuracy = avg_confidence
            
            # Dọn dẹp file tạm nếu có
            if optimized_path:
                try:
                    import os
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
    
    def extract_text_with_preprocessing(self, image_path, confidence_threshold=0.3):
        """
        Trích xuất văn bản với tiền xử lý ảnh (tương tự extract_text do đã tích hợp OpenCV)
        
        Args:
            image_path: Đường dẫn đến ảnh
            confidence_threshold: Ngưỡng độ tin cậy tối thiểu
            
        Returns:
            Dictionary chứa kết quả OCR
        """
        return self.extract_text(image_path, confidence_threshold)
