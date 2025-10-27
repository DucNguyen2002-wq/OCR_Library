#!/usr/bin/env python3
"""
EasyOCR Server - Keep reader in memory for faster processing
Chạy như một server để tránh khởi tạo reader mỗi lần
"""

import sys
import json
import os
import time
import cv2
import numpy as np

# Fix encoding cho Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    import easyocr
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'EasyOCR not installed. Run: pip install easyocr'
    }))
    sys.exit(1)

# Global cached reader
_reader = None
_languages = None

def get_reader(languages=['vi', 'en'], gpu=False):
    """Get or create cached reader"""
    global _reader, _languages
    
    lang_key = tuple(sorted(languages))
    
    if _reader is None or _languages != lang_key:
        print(f"[EasyOCR Server] 🔧 Initializing reader: {languages}", file=sys.stderr)
        _reader = easyocr.Reader(languages, gpu=gpu)
        _languages = lang_key
        print(f"[EasyOCR Server] ✅ Reader ready", file=sys.stderr)
    else:
        print(f"[EasyOCR Server] ⚡ Using cached reader (3s faster!)", file=sys.stderr)
    
    return _reader

def remove_underlines(image):
    """
    Loại bỏ underline (gạch chân) khỏi ảnh để OCR đọc chữ chính xác hơn.
    Phát hiện và xóa các đường ngang mỏng (underline) mà không ảnh hưởng đến text.
    """
    print(f"[EasyOCR Server] 🧹 Detecting and removing underlines...", file=sys.stderr)
    
    # Tạo bản copy để không ảnh hưởng ảnh gốc
    clean = image.copy()
    height, width = clean.shape
    
    # 1. Tạo binary image với Otsu threshold (tự động tìm ngưỡng tốt nhất)
    _, binary = cv2.threshold(clean, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # 2. Phát hiện đường ngang (horizontal lines)
    # Kernel rộng nhưng mỏng để chỉ bắt đường kẻ ngang (underline)
    # Điều chỉnh: width/25 thay vì width/30 để nhạy hơn với underline ngắn
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(width // 25, 40), 1))
    
    # Morphological operation để detect horizontal lines
    detect_horizontal = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
    
    # 3. Lọc bỏ các đường ngang quá dài (có thể là viền bảng/khung)
    # Chỉ giữ underline (dài từ 40px đến width/3)
    contours, _ = cv2.findContours(detect_horizontal, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    underline_mask = np.zeros_like(detect_horizontal)
    
    underline_count = 0
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        # Chỉ lấy đường ngang: rộng (40px - width/3), mỏng (h <= 5px)
        if 40 <= w <= width // 3 and h <= 5:
            cv2.drawContours(underline_mask, [contour], -1, 255, -1)
            underline_count += 1
    
    if underline_count > 0:
        print(f"[EasyOCR Server] ✂️ Found {underline_count} underlines, removing...", file=sys.stderr)
        
        # 4. Dilate nhẹ để cover cả viền của underline
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 3))
        dilated_lines = cv2.dilate(underline_mask, dilate_kernel, iterations=1)
        
        # 5. Xóa underline bằng inpaint (fill với màu nền xung quanh)
        clean = cv2.inpaint(clean, dilated_lines, inpaintRadius=2, flags=cv2.INPAINT_TELEA)
        
        print(f"[EasyOCR Server] ✅ Underlines removed successfully", file=sys.stderr)
    else:
        print(f"[EasyOCR Server] ℹ️ No underlines detected (or too long/short)", file=sys.stderr)
    
    return clean

def fast_preprocess(image, max_size=1600, contrast=1.5, brightness=10, mag_ratio=1.5):
    """
    Enhanced preprocessing với tuỳ chỉnh contrast, brightness và magnification
    @param contrast: Độ tương phản (1.0-3.0), mặc định 1.5
    @param brightness: Độ sáng (0-50), mặc định 10
    @param mag_ratio: Tỷ lệ phóng đại (1.0-3.0), mặc định 1.5
    """
    # 1. Phóng đại ảnh nếu cần (giúp nhận diện chữ nhỏ tốt hơn)
    if mag_ratio > 1.0:
        height, width = image.shape[:2]
        new_width = int(width * mag_ratio)
        new_height = int(height * mag_ratio)
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        print(f"[EasyOCR Server] 🔍 Magnified {mag_ratio}x to {new_width}x{new_height}", file=sys.stderr)
    
    # 2. Resize nếu quá lớn sau khi phóng đại
    height, width = image.shape[:2]
    if max(height, width) > max_size:
        scale = max_size / max(height, width)
        new_width = int(width * scale)
        new_height = int(height * scale)
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        print(f"[EasyOCR Server] ⚡ Resized to {new_width}x{new_height}", file=sys.stderr)
    
    # 3. Grayscale nếu là ảnh màu
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 3.5. **Loại bỏ underline trước khi enhance** - QUAN TRỌNG!
    image = remove_underlines(image)
    
    # 4. Điều chỉnh brightness (độ sáng)
    if brightness != 0:
        image = cv2.convertScaleAbs(image, alpha=1.0, beta=brightness)
        print(f"[EasyOCR Server] ☀️ Brightness adjusted: +{brightness}", file=sys.stderr)
    
    # 5. Tăng contrast với CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clip_limit = max(1.0, min(contrast * 2.0, 4.0))  # Convert contrast to CLAHE clipLimit
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8,8))
    enhanced = clahe.apply(image)
    print(f"[EasyOCR Server] 🎨 Contrast enhanced: {contrast} (CLAHE clipLimit={clip_limit:.1f})", file=sys.stderr)
    
    # 6. (Optional) Làm sắc nét ảnh NHẸ để text rõ hơn - KHÔNG quá mạnh
    # Giảm sharpening để tránh chữ dính liền
    if contrast < 1.9:  # Chỉ sharpen khi contrast không quá cao
        kernel = np.array([[0,-1,0], [-1,5,-1], [0,-1,0]])  # Kernel nhẹ hơn (5 thay vì 9)
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        # Blend ít hơn: 85% enhanced, 15% sharpened (giảm từ 70/30)
        result = cv2.addWeighted(enhanced, 0.85, sharpened, 0.15, 0)
    else:
        # Nếu contrast cao rồi thì không cần sharpen nữa
        result = enhanced
    
    return result

def merge_characters_to_words(characters):
    """
    Merge character-level detections into words based on proximity AND font size
    Supports both horizontal and vertical text layouts
    CHỈ merge các ký tự có kích thước tương đồng (cùng font size)
    """
    if not characters:
        return []
    
    # Bước 1: Phân nhóm theo font size trước (clustering by height)
    # Nhóm các text có kích thước tương tự nhau
    size_groups = []
    for char in characters:
        # Tìm group phù hợp (height tương đồng)
        found_group = False
        for group in size_groups:
            avg_height = sum(c['height'] for c in group) / len(group)
            height_ratio = max(char['height'], avg_height) / min(char['height'], avg_height)
            if height_ratio < 1.3:  # Cùng font size (chênh lệch < 30%)
                group.append(char)
                found_group = True
                break
        
        if not found_group:
            size_groups.append([char])
    
    # Bước 2: Merge trong từng size group
    all_words = []
    for group in size_groups:
        # Sort characters trong group theo position
        sorted_chars = sorted(group, key=lambda x: (x['center_y'], x['center_x']))
        
        words = []
        current_word = {
            'chars': [sorted_chars[0]],
            'text': sorted_chars[0]['text']
        }
        
        for char in sorted_chars[1:]:
            last_char = current_word['chars'][-1]
            
            # Calculate distances
            dx = abs(char['center_x'] - last_char['center_x'])
            dy = abs(char['center_y'] - last_char['center_y'])
            
            # Average character size for threshold
            avg_height = (char['height'] + last_char['height']) / 2
            avg_width = (char['width'] + last_char['width']) / 2
            
            # Determine if characters belong to same line/word
            # Horizontal text: check if on same line (similar y) and reasonably close in x
            # TĂNG threshold lên 2.0 để merge "Ha Woon Lim" (tên tác giả có khoảng cách)
            is_same_line = dy < avg_height * 0.5  # Cùng dòng nếu y gần nhau
            is_horizontal_close = dx < avg_width * 2.0  # Cho phép khoảng cách lớn hơn
            is_horizontal_neighbor = is_same_line and is_horizontal_close
            
            # Vertical text: close vertically, similar x-position
            is_vertical_neighbor = (dy < avg_height * 0.8 and dx < avg_width * 0.5)
            
            should_merge = is_horizontal_neighbor or is_vertical_neighbor
            
            if should_merge:
                # Same word/line
                current_word['chars'].append(char)
                # Thêm space nếu khoảng cách lớn (giữa các từ trong tên)
                if dx > avg_width * 1.2:
                    current_word['text'] += ' ' + char['text']
                else:
                    current_word['text'] += char['text']
            else:
                # New word
                words.append(finalize_word(current_word))
                current_word = {
                    'chars': [char],
                    'text': char['text']
                }
        
        # Add last word
        if current_word['chars']:
            words.append(finalize_word(current_word))
        
        all_words.extend(words)
    
    return all_words


def finalize_word(word_data):
    """Calculate word bounding box and metadata from characters"""
    chars = word_data['chars']
    
    # Calculate combined bounding box
    all_x = []
    all_y = []
    for char in chars:
        for point in char['bbox']:
            all_x.append(point[0])
            all_y.append(point[1])
    
    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)
    
    # Create rectangular bbox
    bbox = [
        [min_x, min_y],  # top-left
        [max_x, min_y],  # top-right
        [max_x, max_y],  # bottom-right
        [min_x, max_y]   # bottom-left
    ]
    
    # Calculate average confidence
    avg_confidence = sum(c['confidence'] for c in chars) / len(chars)
    
    # Calculate dimensions
    height = max_y - min_y
    width = max_x - min_x
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    
    return {
        'text': word_data['text'],
        'confidence': float(avg_confidence),
        'bbox': bbox,
        'height': float(height),
        'width': float(width),
        'center_x': float(center_x),
        'center_y': float(center_y),
        'num_chars': len(chars)
    }


def group_blocks_by_lines(blocks):
    """
    Group text blocks into lines based on vertical position
    """
    if not blocks:
        return []
    
    # Sort blocks by vertical position
    sorted_blocks = sorted(blocks, key=lambda x: x['center_y'])
    
    lines = []
    line_threshold = 20  # pixels
    current_line = [sorted_blocks[0]]
    
    for block in sorted_blocks[1:]:
        # Check if block is on same line
        if abs(block['center_y'] - current_line[-1]['center_y']) < line_threshold:
            current_line.append(block)
        else:
            # Sort line by horizontal position (left to right)
            current_line.sort(key=lambda x: x['center_x'])
            lines.append(current_line)
            current_line = [block]
    
    # Add last line
    if current_line:
        current_line.sort(key=lambda x: x['center_x'])
        lines.append(current_line)
    
    return lines

def classify_text_by_size(blocks):
    """
    Phân loại text blocks theo kích thước (title, author, publisher)
    Returns: {
        'title': [blocks with largest font],
        'subtitle': [blocks with medium-large font],
        'author': [blocks with medium font],
        'publisher': [blocks with small font]
    }
    """
    if not blocks:
        return {'title': [], 'subtitle': [], 'author': [], 'publisher': []}
    
    # Calculate height distribution
    heights = [b['height'] for b in blocks]
    avg_height = sum(heights) / len(heights)
    max_height = max(heights)
    
    # Classify by relative height
    title = []
    subtitle = []
    author = []
    publisher = []
    
    for block in blocks:
        height = block['height']
        
        # Title: chữ lớn nhất (> 70% max height)
        if height > max_height * 0.7:
            title.append(block)
        # Subtitle: chữ vừa-lớn (50-70% max height)
        elif height > max_height * 0.5:
            subtitle.append(block)
        # Author: chữ vừa (30-50% max height)
        elif height > max_height * 0.3:
            author.append(block)
        # Publisher: chữ nhỏ (< 30% max height)
        else:
            publisher.append(block)
    
    return {
        'title': title,
        'subtitle': subtitle,
        'author': author,
        'publisher': publisher
    }

def recognize_text(
    image_path, 
    languages=['vi', 'en'], 
    gpu=False, 
    max_size=1600,
    text_threshold=0.3,
    low_text=0.2,
    paragraph=True,
    contrast=1.5,
    brightness=10,
    mag_ratio=1.5
):
    """
    Recognize text from image - OPTIMIZED with CHARACTER-LEVEL detection
    @param text_threshold: Text detection threshold (0.0-1.0)
    @param low_text: Low text threshold (0.0-1.0)
    @param paragraph: Paragraph mode (True/False)
    @param contrast: Contrast adjustment (1.0-3.0)
    @param brightness: Brightness adjustment (0-50)
    @param mag_ratio: Magnification ratio (1.0-3.0)
    """
    try:
        start_time = time.time()
        
        # Check file exists
        if not os.path.exists(image_path):
            return {
                'success': False,
                'error': f'File not found: {image_path}'
            }
        
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            return {
                'success': False,
                'error': 'Failed to read image'
            }
        
        # Enhanced preprocessing với các tham số tuỳ chỉnh
        image = fast_preprocess(image, max_size, contrast, brightness, mag_ratio)
        
        # Get cached reader
        reader = get_reader(languages, gpu)
        
        # OCR with tunable parameters
        ocr_start = time.time()
        
        # Điều chỉnh link_threshold: mặc định 0.3 cho tất cả
        # Chỉ thay đổi khi cần thiết
        link_threshold = 0.3
        
        results = reader.readtext(
            image, 
            detail=1,
            paragraph=paragraph,
            min_size=5,
            text_threshold=text_threshold,
            link_threshold=link_threshold,
            low_text=low_text,
            slope_ths=0.1,
            ycenter_ths=0.5,
            height_ths=0.5,
            width_ths=0.5,
            add_margin=0.1,
            contrast_ths=0.1,
            adjust_contrast=0.5
        )
        ocr_time = time.time() - ocr_start
        
        print(f"[EasyOCR Server] 📦 Detected {len(results)} text boxes (paragraph={paragraph}, link_threshold={link_threshold})", file=sys.stderr)
        
        # Process results and calculate text height (font size indicator)
        text_blocks = []
        all_text = []
        total_confidence = 0
        
        # Handle both formats: (bbox, text, confidence) and (bbox, text)
        for result in results:
            if len(result) == 3:
                bbox, text, confidence = result
            elif len(result) == 2:
                bbox, text = result
                confidence = 0.9  # Default confidence khi paragraph=True
            else:
                print(f"[EasyOCR Server] ⚠️ Unexpected result format: {len(result)} values", file=sys.stderr)
                continue
            
            # Calculate text height from bounding box
            # bbox format: [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            y_coords = [point[1] for point in bbox]
            x_coords = [point[0] for point in bbox]
            text_height = max(y_coords) - min(y_coords)
            text_width = max(x_coords) - min(x_coords)
            
            # Calculate center position
            center_x = sum(x_coords) / 4
            center_y = sum(y_coords) / 4
            
            text_blocks.append({
                'text': text,
                'confidence': float(confidence),
                'bbox': [[float(x), float(y)] for x, y in bbox],
                'height': float(text_height),
                'width': float(text_width),
                'center_x': float(center_x),
                'center_y': float(center_y)
            })
            all_text.append(text)
            total_confidence += confidence
        
        avg_confidence = (total_confidence / len(results) * 100) if results else 0
        processing_time = time.time() - start_time
        
        print(f"[EasyOCR Server] ✅ Done in {processing_time:.2f}s (OCR: {ocr_time:.2f}s)", file=sys.stderr)
        
        # === CHARACTER MERGING ALGORITHM ===
        # Merge characters into words based on proximity AND font size
        merged_words = merge_characters_to_words(text_blocks)
        
        # Group merged words by lines (vertical position)
        lines = group_blocks_by_lines(merged_words)
        
        # Classify text by size (title, author, publisher)
        classified = classify_text_by_size(merged_words)
        
        # Calculate largest text indices (most likely title)
        merged_heights = [word['height'] for word in merged_words]
        if merged_heights:
            avg_height = sum(merged_heights) / len(merged_heights)
            max_height = max(merged_heights)
            largest_indices = [i for i, h in enumerate(merged_heights) if h > avg_height * 1.2]
        else:
            avg_height = 0
            max_height = 0
            largest_indices = []
        
        return {
            'success': True,
            'text': ' '.join(all_text),
            'characters': text_blocks,  # Character-level data
            'words': merged_words,      # Merged words (with size awareness)
            'lines': lines,             # Grouped by lines
            'classified': classified,   # Phân loại theo size: title, author, publisher
            'confidence': float(avg_confidence),
            'processing_time': float(processing_time),
            'ocr_time': float(ocr_time),
            'num_characters': len(text_blocks),
            'num_words': len(merged_words),
            'largest_text_indices': largest_indices,
            'font_stats': {
                'avg_height': float(avg_height),
                'max_height': float(max_height)
            }
        }
        
        # Sort blocks by vertical position (top to bottom)
        sorted_blocks = sorted(text_blocks, key=lambda b: b['bbox'][0][1])
        
        # Group by vertical proximity (same line) and track max height per line
        lines = []
        line_heights = []
        current_line = []
        current_line_heights = []
        last_y = None
        y_threshold = 20  # pixels tolerance for same line
        
        for block in sorted_blocks:
            y = block['bbox'][0][1]
            
            if last_y is None or abs(y - last_y) < y_threshold:
                # Same line
                current_line.append(block['text'])
                current_line_heights.append(block['height'])
            else:
                # New line
                if current_line:
                    lines.append(' '.join(current_line))
                    line_heights.append(max(current_line_heights))  # Max height in this line
                current_line = [block['text']]
                current_line_heights = [block['height']]
            
            last_y = y
        
        # Add last line
        if current_line:
            lines.append(' '.join(current_line))
            line_heights.append(max(current_line_heights) if current_line_heights else 0)
        
        # Join lines with newline
        formatted_text = '\n'.join(lines)
        
        # Find largest text (likely the title)
        max_height = max(line_heights) if line_heights else 0
        largest_text_indices = [i for i, h in enumerate(line_heights) if h >= max_height * 0.9]  # Within 90% of max
        
        return {
            'success': True,
            'text': formatted_text,  # Now with proper newlines!
            'confidence': float(avg_confidence),
            'processingTime': float(processing_time),
            'ocrTime': float(ocr_time),
            'blocks': text_blocks,
            'blockCount': len(text_blocks),
            'lineHeights': [float(h) for h in line_heights],  # Height of each line
            'maxHeight': float(max_height),  # Largest text height
            'largestTextIndices': largest_text_indices  # Line indices with largest text
        }
        
    except Exception as e:
        print(f"[EasyOCR Server] ❌ Error: {str(e)}", file=sys.stderr)
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python easyocr_fast.py <image_path> [languages] [gpu] [text_threshold] [low_text] [paragraph] [contrast] [brightness] [mag_ratio]'
        }))
        sys.exit(1)
    
    # Parse arguments
    image_path = sys.argv[1]
    languages = sys.argv[2].split(',') if len(sys.argv) > 2 else ['vi', 'en']
    gpu = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else False
    text_threshold = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3
    low_text = float(sys.argv[5]) if len(sys.argv) > 5 else 0.2
    paragraph = sys.argv[6].lower() == 'true' if len(sys.argv) > 6 else True
    contrast = float(sys.argv[7]) if len(sys.argv) > 7 else 1.5
    brightness = float(sys.argv[8]) if len(sys.argv) > 8 else 10
    mag_ratio = float(sys.argv[9]) if len(sys.argv) > 9 else 1.5
    
    print(f"[EasyOCR Server] 🚀 Starting OCR with params:", file=sys.stderr)
    print(f"  - text_threshold: {text_threshold}", file=sys.stderr)
    print(f"  - low_text: {low_text}", file=sys.stderr)
    print(f"  - paragraph: {paragraph}", file=sys.stderr)
    print(f"  - contrast: {contrast}", file=sys.stderr)
    print(f"  - brightness: {brightness}", file=sys.stderr)
    print(f"  - mag_ratio: {mag_ratio}", file=sys.stderr)
    
    result = recognize_text(
        image_path, 
        languages, 
        gpu,
        1600,  # max_size
        text_threshold,
        low_text,
        paragraph,
        contrast,
        brightness,
        mag_ratio
    )
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
