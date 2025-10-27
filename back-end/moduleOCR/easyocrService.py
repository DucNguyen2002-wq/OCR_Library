#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EasyOCR Service
Module xử lý OCR bìa sách sử dụng EasyOCR
"""

import easyocr
import sys
import json
import time
import os
from pathlib import Path
import numpy as np
from PIL import Image
import re
import cv2

# Fix encoding cho Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ===== GLOBAL CACHED READER =====
_cached_reader = None
_cached_languages = None

def get_cached_reader(languages=['vi', 'en'], gpu=False):
    """
    Lấy cached EasyOCR reader để tái sử dụng
    Tránh khởi tạo lại reader mỗi lần → tiết kiệm 2-3s
    """
    global _cached_reader, _cached_languages
    
    languages_key = tuple(sorted(languages))
    
    if _cached_reader is None or _cached_languages != languages_key:
        print(f"[EasyOCR] Khởi tạo reader mới với ngôn ngữ: {languages}", file=sys.stderr)
        _cached_reader = easyocr.Reader(languages, gpu=gpu)
        _cached_languages = languages_key
        print("[EasyOCR] ✅ Cached reader sẵn sàng", file=sys.stderr)
    else:
        print("[EasyOCR] ⚡ Sử dụng cached reader (nhanh hơn 3s)", file=sys.stderr)
    
    return _cached_reader


class EasyOCRService:
    """Service xử lý OCR với EasyOCR - Optimized for speed"""
    
    def __init__(self, languages=['vi', 'en'], gpu=False):
        """
        Khởi tạo EasyOCR reader (sử dụng cached reader)
        
        Args:
            languages: Danh sách ngôn ngữ hỗ trợ
            gpu: Sử dụng GPU hay không
        """
        self.languages = languages
        self.gpu = gpu
        self.reader = get_cached_reader(languages, gpu)
    
    def recognize_text(self, image_path, detail=1, preprocess=False, max_size=1600):
        """
        Nhận dạng text từ ảnh - OPTIMIZED
        
        Args:
            image_path: Đường dẫn đến file ảnh
            detail: Mức độ chi tiết (0: chỉ text, 1: text + confidence + bbox)
            preprocess: Có tiền xử lý ảnh không (mặc định: False để nhanh hơn)
            max_size: Kích thước tối đa (giảm để nhanh hơn, mặc định: 1600px)
            
        Returns:
            dict: Kết quả OCR
        """
        try:
            print(f"[EasyOCR] ⚡ OCR nhanh cho: {image_path}", file=sys.stderr)
            
            start_time = time.time()
            
            # Kiểm tra file tồn tại
            if not os.path.exists(image_path):
                return {
                    'success': False,
                    'engine': 'easyocr',
                    'error': f'File không tồn tại: {image_path}'
                }
            
            # Đọc và resize ảnh để tăng tốc
            image = cv2.imread(image_path)
            if image is None:
                return {
                    'success': False,
                    'engine': 'easyocr',
                    'error': 'Không đọc được ảnh'
                }
            
            # Resize nếu ảnh quá lớn
            height, width = image.shape[:2]
            if max(height, width) > max_size:
                scale = max_size / max(height, width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
                print(f"[EasyOCR] ⚡ Resize {width}x{height} → {new_width}x{new_height}", file=sys.stderr)
            
            # Tiền xử lý nhẹ nếu cần (tắt mặc định để nhanh hơn)
            if preprocess:
                image = self._fast_preprocess(image)
                print(f"[EasyOCR] Đã tiền xử lý nhanh", file=sys.stderr)
            
            # Thực hiện OCR
            results = self.reader.readtext(image, detail=detail)
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            print(f"[EasyOCR] ✅ Hoàn thành trong {processing_time:.2f}s", file=sys.stderr)
            
            # Xử lý kết quả
            if detail == 1:
                text_blocks = []
                all_text = []
                total_confidence = 0
                
                for bbox, text, confidence in results:
                    text_blocks.append({
                        'text': text,
                        'confidence': float(confidence),
                        'bbox': [[float(x), float(y)] for x, y in bbox]
                    })
                    all_text.append(text)
                    total_confidence += confidence
                
                avg_confidence = total_confidence / len(results) if results else 0
                
                return {
                    'success': True,
                    'engine': 'easyocr',
                    'text': ' '.join(all_text),
                    'confidence': float(avg_confidence),
                    'processingTime': processing_time,
                    'blocks': text_blocks,
                    'blockCount': len(text_blocks)
                }
            else:
                return {
                    'success': True,
                    'engine': 'easyocr',
                    'text': ' '.join(results),
                    'processingTime': processing_time
                }
                
        except Exception as e:
            print(f"[EasyOCR] Lỗi khi xử lý OCR: {str(e)}", file=sys.stderr)
            return {
                'success': False,
                'engine': 'easyocr',
                'error': str(e)
            }
    
    def _fast_preprocess(self, image):
        """
        Tiền xử lý ảnh NHANH - chỉ làm những gì cần thiết
        
        Args:
            image: OpenCV image (numpy array)
            
        Returns:
            Ảnh đã xử lý
        """
        # 1. Grayscale nếu ảnh màu
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # 2. Chỉ tăng contrast nhẹ (bỏ denoise vì chậm)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        return enhanced
    
    def _preprocess_image(self, image_path):
        """
        Tiền xử lý ảnh ĐẦY ĐỦ để cải thiện OCR (chậm hơn)
        """
        # Đọc ảnh
        image = cv2.imread(image_path)
        
        if image is None:
            return image_path  # Fallback to original
        
        # Chỉ áp dụng những xử lý nhẹ nhàng:
        
        # 1. Resize nếu ảnh quá nhỏ
        (h, w) = image.shape[:2]
        if h < 800:
            scale = 800 / h
            new_w = int(w * scale)
            new_h = int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
            print(f"[EasyOCR] Resize ảnh lên {new_w}x{new_h}", file=sys.stderr)
        
        # 2. Chỉ giảm noise nhẹ (không làm mất chi tiết)
        if len(image.shape) == 3:
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 3, 3, 7, 21)
        else:
            denoised = cv2.fastNlMeansDenoising(image, None, 3, 7, 21)
        
        # 3. Tăng contrast nhẹ
        lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8,8))
        cl = clahe.apply(l)
        enhanced = cv2.merge((cl,a,b))
        final = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        return final
    
    def recognize_with_preprocessing(self, image_path, options=None):
        """
        OCR với tiền xử lý ảnh
        
        Args:
            image_path: Đường dẫn đến file ảnh
            options: Các tùy chọn OCR
            
        Returns:
            dict: Kết quả OCR
        """
        if options is None:
            options = {}
        
        try:
            print(f"[EasyOCR] Bắt đầu OCR với preprocessing: {image_path}", file=sys.stderr)
            
            start_time = time.time()
            
            # Đọc ảnh
            image = Image.open(image_path)
            
            # Tiền xử lý ảnh nếu cần
            if options.get('resize'):
                width, height = image.size
                new_width = options.get('width', width)
                new_height = options.get('height', height)
                image = image.resize((new_width, new_height), Image.LANCZOS)
            
            # Chuyển sang numpy array
            img_array = np.array(image)
            
            # Thực hiện OCR
            results = self.reader.readtext(
                img_array,
                detail=1,
                paragraph=options.get('paragraph', False),
                min_size=options.get('min_size', 10),
                text_threshold=options.get('text_threshold', 0.7),
                low_text=options.get('low_text', 0.4),
                link_threshold=options.get('link_threshold', 0.4),
                canvas_size=options.get('canvas_size', 2560),
                mag_ratio=options.get('mag_ratio', 1.0)
            )
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            # Xử lý kết quả
            text_blocks = []
            all_text = []
            total_confidence = 0
            
            for bbox, text, confidence in results:
                text_blocks.append({
                    'text': text,
                    'confidence': float(confidence),
                    'bbox': [[float(x), float(y)] for x, y in bbox]
                })
                all_text.append(text)
                total_confidence += confidence
            
            avg_confidence = total_confidence / len(results) if results else 0
            full_text = ' '.join(all_text)
            cleaned_text = self.clean_text(full_text)
            
            return {
                'success': True,
                'engine': 'easyocr',
                'text': cleaned_text,
                'rawText': full_text,
                'confidence': float(avg_confidence),
                'processingTime': processing_time,
                'blocks': text_blocks,
                'blockCount': len(text_blocks),
                'metadata': options
            }
            
        except Exception as e:
            print(f"[EasyOCR] Lỗi preprocessing: {str(e)}", file=sys.stderr)
            return {
                'success': False,
                'engine': 'easyocr',
                'error': str(e)
            }
    
    def clean_text(self, text):
        """
        Làm sạch text OCR
        
        Args:
            text: Text cần làm sạch
            
        Returns:
            str: Text đã được làm sạch
        """
        # Loại bỏ khoảng trắng thừa
        text = re.sub(r'\s+', ' ', text)
        # Loại bỏ ký tự đặc biệt không mong muốn
        text = re.sub(r'[^\w\sÀ-ỹ\.,!?;:()\-]', '', text)
        return text.strip()
    
    def extract_book_info(self, text):
        """
        Trích xuất thông tin sách từ text OCR
        
        Args:
            text: Text từ OCR
            
        Returns:
            dict: Thông tin sách
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        return {
            'title': lines[0] if lines else '',
            'author': self.find_author(lines),
            'publisher': self.find_publisher(lines),
            'allText': text,
            'lineCount': len(lines)
        }
    
    def find_author(self, lines):
        """Tìm tên tác giả"""
        patterns = [
            r'(?:tác giả|author|by)\s*[:\-]?\s*([^\n]+)',
            r'([^\n]+)\s+(?:viết)',
        ]
        
        for line in lines:
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
        return ''
    
    def find_publisher(self, lines):
        """Tìm nhà xuất bản"""
        patterns = [
            r'(?:nhà xuất bản|publisher|nxb)\s*[:\-]?\s*([^\n]+)',
            r'(?:xuất bản bởi)\s*[:\-]?\s*([^\n]+)',
        ]
        
        for line in lines:
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
        return ''


def main():
    """Hàm main để chạy từ command line"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Thiếu đường dẫn ảnh'
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    languages = sys.argv[2].split(',') if len(sys.argv) > 2 else ['vi', 'en']
    use_gpu = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else False
    preprocess = sys.argv[4].lower() != 'false' if len(sys.argv) > 4 else True  # Mặc định: True
    
    try:
        service = EasyOCRService(languages=languages, gpu=use_gpu)
        result = service.recognize_text(image_path, preprocess=preprocess)
        
        # In kết quả dưới dạng JSON ra stdout
        print(json.dumps(result, ensure_ascii=False), flush=True)
        
        # Exit với code 0 nếu thành công
        sys.exit(0)
        
    except Exception as e:
        error_result = {
            'success': False,
            'engine': 'easyocr',
            'error': str(e)
        }
        print(json.dumps(error_result, ensure_ascii=False), flush=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
