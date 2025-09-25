"""
Simple OCR Comparison Tool for creating JSON reports
"""

import json
import time
import statistics
import os

class SimpleOCRComparisonTool:
    def __init__(self):
        """Khởi tạo Simple OCR Comparison Tool"""
        print("🔧 Khởi tạo Simple OCR Comparison Tool...")
        
        # Thiết lập đường dẫn thư mục
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.results_dir = os.path.join(self.base_dir, "Results")
        self.json_dir = os.path.join(self.results_dir, "Json")
        
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(self.json_dir, exist_ok=True)
        
        print("✅ Simple OCR Comparison Tool đã sẵn sàng!")
    
    def compare_ocr_results(self, results):
        """Tạo báo cáo so sánh từ kết quả OCR"""
        print("📊 Đang phân tích kết quả...")
        
        # Danh sách engines
        engine_keys = ['easyocr', 'easyocr_preprocessed', 'doctr', 'doctr_preprocessed', 
                      'pytesseract', 'pytesseract_preprocessed', 'opencv']
        
        engine_names = {
            'easyocr': 'EasyOCR (Gốc)',
            'easyocr_preprocessed': 'EasyOCR (Tiền xử lý)',
            'doctr': 'DocTR (Gốc)',
            'doctr_preprocessed': 'DocTR (Tiền xử lý)',
            'pytesseract': 'Pytesseract (Gốc)',
            'pytesseract_preprocessed': 'Pytesseract (Tiền xử lý)',
            'opencv': 'OpenCV (Text Detection)'
        }
        
        comparison_data = {
            'metadata': {
                'total_images': len(results),
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'comparison_date': time.time()
            },
            'engines': {}
        }
        
        # Phân tích từng engine
        for engine_key in engine_keys:
            engine_data = {
                'name': engine_names.get(engine_key, engine_key),
                'icon': self._get_engine_icon(engine_key),
                'successful_runs': 0,
                'failed_runs': 0,
                'processing_times': [],
                'word_counts': [],
                'confidences': []
            }
            
            # Thu thập dữ liệu từ tất cả ảnh
            for result in results:
                if engine_key in result:
                    engine_result = result[engine_key]
                    if engine_result.get('success'):
                        engine_data['successful_runs'] += 1
                        engine_data['processing_times'].append(engine_result.get('processing_time', 0))
                        
                        # Word count
                        if 'word_count' in engine_result:
                            engine_data['word_counts'].append(engine_result['word_count'])
                        
                        # Confidence (chỉ cho các engine OCR thực sự)
                        if 'confidence' in engine_result and engine_key != 'opencv':
                            engine_data['confidences'].append(engine_result['confidence'])
                    else:
                        engine_data['failed_runs'] += 1
            
            # Tính toán thống kê
            if engine_data['processing_times']:
                engine_data['total_time'] = sum(engine_data['processing_times'])
                engine_data['avg_time'] = statistics.mean(engine_data['processing_times'])
                engine_data['avg_processing_time'] = engine_data['avg_time']  # Alias
                engine_data['min_time'] = min(engine_data['processing_times'])
                engine_data['max_time'] = max(engine_data['processing_times'])
            
            if engine_data['word_counts']:
                engine_data['avg_words'] = statistics.mean(engine_data['word_counts'])
                engine_data['avg_word_count'] = engine_data['avg_words']  # Alias
                engine_data['min_words'] = min(engine_data['word_counts'])
                engine_data['max_words'] = max(engine_data['word_counts'])
            
            if engine_data['confidences']:
                engine_data['avg_confidence'] = statistics.mean(engine_data['confidences'])
                engine_data['min_confidence'] = min(engine_data['confidences'])
                engine_data['max_confidence'] = max(engine_data['confidences'])
            
            # Success rate
            total_runs = engine_data['successful_runs'] + engine_data['failed_runs']
            if total_runs > 0:
                engine_data['success_rate'] = engine_data['successful_runs'] / total_runs
            else:
                engine_data['success_rate'] = 0
            
            # Thêm vào comparison data
            comparison_data['engines'][engine_key] = engine_data
        
        return comparison_data
    
    def _get_engine_icon(self, engine_key):
        """Lấy icon cho engine"""
        icons = {
            'easyocr': '🔵',
            'easyocr_preprocessed': '🔵',
            'doctr': '🔴',
            'doctr_preprocessed': '🔴',
            'pytesseract': '🟡',
            'pytesseract_preprocessed': '🟡',
            'opencv': '🟢'
        }
        return icons.get(engine_key, '⚪')
    
    def save_comparison_report(self, comparison_data, filename):
        """Lưu báo cáo so sánh vào file JSON trong thư mục Results/Json"""
        try:
            # Convert numpy types nếu có
            def convert_numpy_types(obj):
                if hasattr(obj, 'dtype'):
                    return obj.item()
                elif isinstance(obj, dict):
                    return {k: convert_numpy_types(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_numpy_types(v) for v in obj]
                else:
                    return obj
            
            clean_data = convert_numpy_types(comparison_data)
            
            # Lưu vào thư mục Json
            file_path = os.path.join(self.json_dir, filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(clean_data, f, ensure_ascii=False, indent=2)
            
            print(f"💾 Báo cáo so sánh đã lưu: {file_path}")
            return file_path
        
        except Exception as e:
            print(f"❌ Lỗi lưu báo cáo: {str(e)}")
            return None
    
    def display_comparison_table(self, comparison_data):
        """Hiển thị bảng so sánh đơn giản"""
        print(f"\n{'='*80}")
        print("📊 BÁO CÁO SO SÁNH OCR")
        print(f"{'='*80}")
        print(f"🕒 Thời gian: {comparison_data['metadata']['timestamp']}")
        print(f"🖼️  Tổng số ảnh: {comparison_data['metadata']['total_images']}")
        print(f"{'='*80}")
        
        for engine_key, engine_data in comparison_data['engines'].items():
            if engine_data['successful_runs'] > 0:
                print(f"\n{engine_data['icon']} {engine_data['name']}:")
                print(f"   ✅ Thành công: {engine_data['successful_runs']}/{engine_data['successful_runs'] + engine_data['failed_runs']}")
                
                if 'avg_time' in engine_data:
                    print(f"   ⏱️  Thời gian TB: {engine_data['avg_time']:.3f}s")
                
                if 'avg_words' in engine_data:
                    print(f"   📝 Số từ TB: {engine_data['avg_words']:.1f}")
                
                if 'avg_confidence' in engine_data:
                    print(f"   🎯 Độ chính xác TB: {engine_data['avg_confidence']:.3f}")
        
        print(f"\n✅ Báo cáo so sánh hoàn thành!")