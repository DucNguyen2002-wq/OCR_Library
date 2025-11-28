#!/usr/bin/env python3
"""
EasyOCR Book Cover Fast
Chỉ dùng cho: quét text bìa sách với tốc độ tối ưu + độ chính xác ổn định.
"""

import sys
import json
import os
import time
import cv2
import numpy as np

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

_reader = None
_languages = None


def get_reader(languages=('vi', 'en'), gpu=False):
    """Cache reader để không phải khởi tạo lại mỗi lần."""
    global _reader, _languages
    lang_key = tuple(sorted(languages))
    if _reader is None or _languages != lang_key:
        print(f"[BookCoverOCR] init reader: {languages}", file=sys.stderr)
        _reader = easyocr.Reader(list(languages), gpu=gpu)
        _languages = lang_key
    return _reader


def fast_preprocess_cover(image, max_size=1600):
    """
    Tiền xử lý nhẹ, đủ cho bìa sách:
    - Resize <= max_size (giữ tỉ lệ)
    - Grayscale
    - CLAHE tăng tương phản nhẹ
    """
    h, w = image.shape[:2]

    # Resize nếu ảnh quá lớn
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        print(f"[BookCoverOCR] resize -> {new_w}x{new_h}", file=sys.stderr)

    # Grayscale
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # CLAHE nhẹ nhàng
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    image = clahe.apply(image)

    return image


def recognize_book_cover(
    image_path,
    languages=('vi', 'en'),
    gpu=False,
    max_size=1600
):
    """OCR nhanh cho bìa sách, trả về text + bounding boxes cơ bản."""
    try:
        start = time.time()

        if not os.path.exists(image_path):
            return {'success': False, 'error': f'File not found: {image_path}'}

        # Đọc ảnh với error handling
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {'success': False, 'error': 'Failed to read image - cv2.imread returned None'}
        except Exception as read_err:
            return {'success': False, 'error': f'Error reading image: {str(read_err)}'}

        # Preprocess
        try:
            image = fast_preprocess_cover(image, max_size=max_size)
        except Exception as prep_err:
            return {'success': False, 'error': f'Preprocessing error: {str(prep_err)}'}

        # Get reader
        try:
            reader = get_reader(languages, gpu=gpu)
        except Exception as reader_err:
            return {'success': False, 'error': f'Reader initialization error: {str(reader_err)}'}

        ocr_start = time.time()

        # Cấu hình “nhẹ” nhưng vẫn khá chính xác cho bìa sách
        results = reader.readtext(
            image,
            detail=1,
            paragraph=False,       # không cần group paragraph, sẽ nhanh hơn
            min_size=10,           # bỏ các mảnh rất nhỏ, tránh nhiễu
            text_threshold=0.5,    # tăng threshold để bớt rác
            low_text=0.3,
            link_threshold=0.4,
            slope_ths=0.1,
            ycenter_ths=0.5,
            height_ths=0.5,
            width_ths=0.5,
            add_margin=0.05,
            contrast_ths=0.1,
            adjust_contrast=0.5
        )

        ocr_time = time.time() - ocr_start

        blocks = []
        full_text_parts = []
        total_conf = 0.0

        for res in results:
            if len(res) == 3:
                bbox, text, conf = res
            else:
                continue

            x_coords = [p[0] for p in bbox]
            y_coords = [p[1] for p in bbox]
            height = max(y_coords) - min(y_coords)
            center_x = sum(x_coords) / 4.0
            center_y = sum(y_coords) / 4.0

            blocks.append({
                "text": text,
                "confidence": float(conf),
                "bbox": [[float(x), float(y)] for x, y in bbox],
                "height": float(height),
                "center_x": float(center_x),
                "center_y": float(center_y)
            })
            full_text_parts.append(text)
            total_conf += conf

        avg_conf = (total_conf / len(blocks) * 100.0) if blocks else 0.0
        processing_time = time.time() - start

        # Ghép text theo thứ tự từ trên xuống, trái sang phải
        blocks_sorted = sorted(blocks, key=lambda b: (b["center_y"], b["center_x"]))
        full_text_sorted = " ".join(b["text"] for b in blocks_sorted)

        return {
            "success": True,
            "full_text": full_text_sorted,
            "blocks": blocks_sorted,
            "num_blocks": len(blocks_sorted),
            "avg_confidence": float(avg_conf),
            "ocr_time": float(ocr_time),
            "processing_time": float(processing_time)
        }

    except Exception as e:
        print(f"[BookCoverOCR] ERROR: {e}", file=sys.stderr)
        return {"success": False, "error": str(e)}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python book_cover_ocr.py <image_path> [languages] [gpu]"
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    languages = tuple(sys.argv[2].split(',')) if len(sys.argv) > 2 else ('vi', 'en')
    gpu = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else False

    result = recognize_book_cover(
        image_path=image_path,
        languages=languages,
        gpu=gpu,
        max_size=1600
    )
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
