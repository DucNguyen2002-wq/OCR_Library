#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Image Preprocessing Service
Module tiền xử lý ảnh để cải thiện OCR
"""

import cv2
import numpy as np
import sys
import os

# Fix encoding cho Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


class ImagePreprocessor:
    """Service tiền xử lý ảnh cho OCR"""
    
    def __init__(self):
        pass
    
    def preprocess(self, image_path, method='auto'):
        """
        Tiền xử lý ảnh cho OCR
        
        Args:
            image_path: Đường dẫn đến file ảnh
            method: Phương pháp xử lý ('auto', 'grayscale', 'threshold', 'denoise', 'all')
            
        Returns:
            np.array: Ảnh đã được xử lý
        """
        # Đọc ảnh
        image = cv2.imread(image_path)
        
        if image is None:
            raise ValueError(f"Không thể đọc ảnh: {image_path}")
        
        print(f"[ImagePreprocessor] Ảnh gốc: {image.shape}", file=sys.stderr)
        
        if method == 'auto' or method == 'all':
            # Áp dụng tất cả các bước xử lý
            image = self.enhance_image(image)
        elif method == 'grayscale':
            image = self.to_grayscale(image)
        elif method == 'threshold':
            image = self.apply_threshold(image)
        elif method == 'denoise':
            image = self.denoise(image)
        
        return image
    
    def enhance_image(self, image):
        """
        Tăng cường chất lượng ảnh (auto mode)
        """
        # 1. Chuyển sang grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # 2. Giảm noise
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # 3. Tăng contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)
        
        # 4. Adaptive threshold để làm rõ chữ
        thresh = cv2.adaptiveThreshold(
            enhanced, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 
            11, 2
        )
        
        # 5. Morphology để loại bỏ nhiễu nhỏ
        kernel = np.ones((1,1), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        print(f"[ImagePreprocessor] Đã xử lý: grayscale → denoise → contrast → threshold → morphology", file=sys.stderr)
        
        return processed
    
    def to_grayscale(self, image):
        """Chuyển sang ảnh xám"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            print(f"[ImagePreprocessor] Chuyển sang grayscale", file=sys.stderr)
            return gray
        return image
    
    def apply_threshold(self, image):
        """Áp dụng threshold để tách chữ và nền"""
        gray = self.to_grayscale(image)
        
        # Otsu's thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        print(f"[ImagePreprocessor] Áp dụng Otsu threshold", file=sys.stderr)
        return thresh
    
    def denoise(self, image):
        """Giảm nhiễu ảnh"""
        gray = self.to_grayscale(image)
        
        # Non-local means denoising
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        print(f"[ImagePreprocessor] Giảm nhiễu", file=sys.stderr)
        return denoised
    
    def draw_character_boxes(self, image, characters, output_path=None):
        """
        Vẽ bounding box xung quanh mỗi ký tự
        
        Args:
            image: np.array hoặc đường dẫn ảnh
            characters: List các character từ OCR (có bbox)
            output_path: Nơi lưu ảnh đã vẽ (optional)
            
        Returns:
            np.array: Ảnh đã vẽ boxes
        """
        # Đọc ảnh nếu là đường dẫn
        if isinstance(image, str):
            image = cv2.imread(image)
        
        # Copy để không thay đổi ảnh gốc
        annotated = image.copy()
        
        # Đảm bảo ảnh có màu
        if len(annotated.shape) == 2:
            annotated = cv2.cvtColor(annotated, cv2.COLOR_GRAY2BGR)
        
        # Vẽ từng character box
        for idx, char in enumerate(characters):
            bbox = char['bbox']
            text = char['text']
            confidence = char.get('confidence', 0)
            
            # Convert bbox thành integer points
            points = np.array([[int(x), int(y)] for x, y in bbox], dtype=np.int32)
            
            # Màu box: xanh lá cho confidence cao, vàng cho confidence thấp
            if confidence > 0.8:
                color = (0, 255, 0)  # Green
            elif confidence > 0.6:
                color = (0, 255, 255)  # Yellow
            else:
                color = (0, 165, 255)  # Orange
            
            # Vẽ bounding box
            cv2.polylines(annotated, [points], True, color, 2)
            
            # Vẽ text label (character + confidence)
            label = f"{text} {confidence:.2f}"
            label_pos = (int(bbox[0][0]), int(bbox[0][1]) - 5)
            
            # Background cho text
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
            cv2.rectangle(annotated, 
                         (label_pos[0], label_pos[1] - label_h - 5),
                         (label_pos[0] + label_w, label_pos[1]),
                         color, -1)
            
            # Text
            cv2.putText(annotated, label, label_pos, 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
        
        # Lưu nếu có output_path
        if output_path:
            cv2.imwrite(output_path, annotated)
            print(f"[ImagePreprocessor] Đã lưu ảnh với {len(characters)} character boxes: {output_path}", file=sys.stderr)
        
        return annotated
    
    def draw_word_boxes(self, image, words, output_path=None):
        """
        Vẽ bounding box xung quanh mỗi từ (merged characters)
        
        Args:
            image: np.array hoặc đường dẫn ảnh
            words: List các word từ OCR (có bbox)
            output_path: Nơi lưu ảnh đã vẽ (optional)
            
        Returns:
            np.array: Ảnh đã vẽ boxes
        """
        # Đọc ảnh nếu là đường dẫn
        if isinstance(image, str):
            image = cv2.imread(image)
        
        # Copy để không thay đổi ảnh gốc
        annotated = image.copy()
        
        # Đảm bảo ảnh có màu
        if len(annotated.shape) == 2:
            annotated = cv2.cvtColor(annotated, cv2.COLOR_GRAY2BGR)
        
        # Vẽ từng word box
        for idx, word in enumerate(words):
            bbox = word['bbox']
            text = word['text']
            confidence = word.get('confidence', 0)
            num_chars = word.get('num_chars', 1)
            
            # Convert bbox thành integer points
            points = np.array([[int(x), int(y)] for x, y in bbox], dtype=np.int32)
            
            # Màu box: xanh dương cho word-level
            color = (255, 0, 0)  # Blue
            
            # Vẽ bounding box (thicker)
            cv2.polylines(annotated, [points], True, color, 3)
            
            # Vẽ text label (word + num chars + confidence)
            label = f"{text} ({num_chars}ch) {confidence:.2f}"
            label_pos = (int(bbox[0][0]), int(bbox[0][1]) - 10)
            
            # Background cho text
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(annotated, 
                         (label_pos[0], label_pos[1] - label_h - 5),
                         (label_pos[0] + label_w, label_pos[1]),
                         color, -1)
            
            # Text
            cv2.putText(annotated, label, label_pos, 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Lưu nếu có output_path
        if output_path:
            cv2.imwrite(output_path, annotated)
            print(f"[ImagePreprocessor] Đã lưu ảnh với {len(words)} word boxes: {output_path}", file=sys.stderr)
        
        return annotated
    
    def deskew(self, image):
        """
        Xoay ảnh để chữ thẳng (deskew)
        """
        gray = self.to_grayscale(image)
        
        # Tìm góc nghiêng
        coords = np.column_stack(np.where(gray > 0))
        angle = cv2.minAreaRect(coords)[-1]
        
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        
        # Xoay ảnh
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        print(f"[ImagePreprocessor] Xoay ảnh {angle:.2f}°", file=sys.stderr)
        return rotated
    
    def resize_if_needed(self, image, min_height=800):
        """
        Resize ảnh nếu quá nhỏ
        """
        (h, w) = image.shape[:2]
        
        if h < min_height:
            scale = min_height / h
            new_w = int(w * scale)
            new_h = int(h * scale)
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
            print(f"[ImagePreprocessor] Resize từ {w}x{h} lên {new_w}x{new_h}", file=sys.stderr)
            return resized
        
        return image
    
    def save_processed(self, image, output_path):
        """
        Lưu ảnh đã xử lý
        """
        cv2.imwrite(output_path, image)
        print(f"[ImagePreprocessor] Đã lưu: {output_path}", file=sys.stderr)
    
    def auto_rotate(self, image):
        """
        Tự động xoay ảnh về góc đúng bằng Hough Lines
        """
        try:
            gray = self.to_grayscale(image)
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
            
            if lines is not None:
                angles = []
                for rho, theta in lines[:, 0]:
                    angle = np.degrees(theta) - 90
                    angles.append(angle)
                
                median_angle = np.median(angles)
                
                # Chỉ xoay nếu góc lệch đáng kể
                if abs(median_angle) > 0.5:
                    (h, w) = image.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
                    rotated = cv2.warpAffine(image, M, (w, h), 
                                            flags=cv2.INTER_CUBIC,
                                            borderMode=cv2.BORDER_REPLICATE)
                    print(f"[ImagePreprocessor] Auto-rotate: {median_angle:.2f}°", file=sys.stderr)
                    return rotated
            
            return image
        except Exception as e:
            print(f"[ImagePreprocessor] Auto-rotation failed: {str(e)}", file=sys.stderr)
            return image
    
    def sharpen(self, image):
        """
        Làm sắc nét ảnh bằng kernel
        """
        kernel = np.array([[-1, -1, -1],
                          [-1,  9, -1],
                          [-1, -1, -1]])
        sharpened = cv2.filter2D(image, -1, kernel)
        print(f"[ImagePreprocessor] Làm sắc nét", file=sys.stderr)
        return sharpened
    
    def adjust_brightness(self, image, factor=1.2):
        """
        Điều chỉnh độ sáng
        """
        if len(image.shape) == 3:
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            v = cv2.add(v, int(factor * 50))
            v = np.clip(v, 0, 255)
            final_hsv = cv2.merge((h, s, v))
            adjusted = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
        else:
            adjusted = cv2.convertScaleAbs(image, alpha=factor, beta=0)
        
        print(f"[ImagePreprocessor] Điều chỉnh độ sáng x{factor}", file=sys.stderr)
        return adjusted
    
    def draw_text_boxes(self, image_path, boxes, output_path):
        """
        Vẽ khung chữ nhật xung quanh text đã phát hiện
        
        Args:
            image_path: Đường dẫn ảnh gốc
            boxes: Danh sách boxes [[x1,y1,x2,y2,x3,y3,x4,y4], ...]
            output_path: Đường dẫn lưu ảnh có khung
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Không thể đọc ảnh: {image_path}")
            
            # Vẽ từng box
            for box in boxes:
                if len(box) >= 8:
                    # Box dạng 4 điểm (x1,y1,x2,y2,x3,y3,x4,y4)
                    points = np.array([
                        [int(box[0]), int(box[1])],
                        [int(box[2]), int(box[3])],
                        [int(box[4]), int(box[5])],
                        [int(box[6]), int(box[7])]
                    ], dtype=np.int32)
                    
                    # Vẽ polygon màu xanh lá
                    cv2.polylines(img, [points], True, (0, 255, 0), 2)
                elif len(box) == 4:
                    # Box dạng rectangle [x, y, width, height]
                    x, y, w, h = [int(v) for v in box]
                    cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            cv2.imwrite(output_path, img)
            print(f"[ImagePreprocessor] Đã vẽ {len(boxes)} boxes → {output_path}", file=sys.stderr)
            return img
            
        except Exception as e:
            print(f"[ImagePreprocessor] Lỗi vẽ boxes: {str(e)}", file=sys.stderr)
            return None
    
    def optimize_for_ocr(self, image_path, output_path=None):
        """
        Tối ưu toàn diện cho OCR: auto-rotate + denoise + CLAHE + sharpen
        
        Returns:
            np.array: Ảnh đã tối ưu
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Không thể đọc ảnh: {image_path}")
            
            # Bước 1: Auto-rotate
            rotated = self.auto_rotate(img)
            
            # Bước 2: Resize nếu quá lớn
            height, width = rotated.shape[:2]
            max_dimension = 2000
            if max(height, width) > max_dimension:
                scale = max_dimension / max(height, width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                rotated = cv2.resize(rotated, (new_width, new_height), 
                                   interpolation=cv2.INTER_AREA)
                print(f"[ImagePreprocessor] Resize {width}x{height} → {new_width}x{new_height}", file=sys.stderr)
            
            # Bước 3: Chuyển grayscale
            if len(rotated.shape) == 3:
                gray = cv2.cvtColor(rotated, cv2.COLOR_BGR2GRAY)
            else:
                gray = rotated
            
            # Bước 4: Denoise
            denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
            
            # Bước 5: CLAHE contrast enhancement
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            contrast = clahe.apply(denoised)
            
            # Bước 6: Sharpen
            kernel = np.array([[-1, -1, -1],
                              [-1,  9, -1],
                              [-1, -1, -1]])
            sharpened = cv2.filter2D(contrast, -1, kernel)
            
            if output_path:
                cv2.imwrite(output_path, sharpened)
                print(f"[ImagePreprocessor] Tối ưu OCR → {output_path}", file=sys.stderr)
            
            print(f"[ImagePreprocessor] Pipeline: rotate → resize → denoise → CLAHE → sharpen", file=sys.stderr)
            return sharpened
            
        except Exception as e:
            print(f"[ImagePreprocessor] Lỗi tối ưu: {str(e)}", file=sys.stderr)
            return None


def main():
    # """Test preprocessing"""
    # if len(sys.argv) < 3:
    #     print("Usage: python imagePreprocessor.py <input_image> <output_image> [method]")
    #     print("Methods: auto, grayscale, threshold, denoise, all")
    #     sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    method = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    
    if not os.path.exists(input_path):
        print(f"Error: File không tồn tại: {input_path}")
        sys.exit(1)
    
    try:
        preprocessor = ImagePreprocessor()
        processed_image = preprocessor.preprocess(input_path, method)
        preprocessor.save_processed(processed_image, output_path)
        
        print(f"✅ Xử lý thành công: {input_path} → {output_path}")
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
