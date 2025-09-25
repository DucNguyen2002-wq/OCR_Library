"""
EasyOCR Module for Vietnamese Text Recognition
"""

import easyocr
import numpy as np
import time
from .opencv_module import OpenCVProcessor

class EasyOCRProcessor:
    def __init__(self, languages=['vi', 'en'], gpu=False):
        """
        Khởi tạo EasyOCR processor
        
        Args:
            languages: Danh sách ngôn ngữ hỗ trợ
            gpu: Sử dụng GPU hay không
        """
        print("Đang khởi tạo EasyOCR...")
        self.reader = easyocr.Reader(languages, gpu=gpu)
        self.opencv_processor = OpenCVProcessor()
        print("✓ EasyOCR đã được khởi tạo")
    
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
