"""
Module để tạo biểu đồ phân tích OCR từ file JSON comparison report
"""

import json
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from math import pi
import os

# Thiết lập matplotlib để tránh lỗi GUI
import matplotlib
matplotlib.use('Agg')

class JSONOCRVisualizationTool:
    def __init__(self):
        """Khởi tạo JSON OCR Visualization Tool"""
        print("📊 Khởi tạo JSON OCR Visualization Tool...")
        
        # Thiết lập đường dẫn thư mục (từ Demo lên DACN)
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.results_dir = os.path.join(self.base_dir, "Results")
        self.json_dir = os.path.join(self.results_dir, "Json")
        self.charts_dir = os.path.join(self.results_dir, "Charts")
        
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(self.json_dir, exist_ok=True)
        os.makedirs(self.charts_dir, exist_ok=True)
        
        # Thiết lập style
        plt.style.use('default')
        sns.set_palette("husl")
        
        # Màu sắc cho các engine
        self.engine_colors = {
            'easyocr': '#3498db',           # Blue
            'easyocr_preprocessed': '#5dade2',  # Light Blue
            'doctr': '#e74c3c',             # Red
            'doctr_preprocessed': '#ec7063',    # Light Red
            'pytesseract': '#f39c12',       # Orange
            'pytesseract_preprocessed': '#f7dc6f',  # Light Orange
            'opencv': '#27ae60'             # Green
        }
        
        print(f"📂 Thư mục JSON: {self.json_dir}")
        print(f"📊 Thư mục Charts: {self.charts_dir}")
        print("✅ JSON OCR Visualization Tool đã sẵn sàng!")
    
    def load_comparison_data(self, json_file_path):
        """Đọc dữ liệu từ file JSON comparison report"""
        try:
            # Nếu chỉ là tên file, tìm trong thư mục Json
            if not os.path.isabs(json_file_path):
                json_file_path = os.path.join(self.json_dir, json_file_path)
            
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"✅ Đã đọc dữ liệu từ: {json_file_path}")
            return data
        except Exception as e:
            print(f"❌ Lỗi đọc file JSON: {str(e)}")
            return None
    
    def filter_engines_with_data(self, data, require_confidence=True, require_words=True):
        """Lọc các engine có đủ dữ liệu cần thiết"""
        filtered_engines = {}
        
        for engine_key, engine_data in data.get('engines', {}).items():
            # Kiểm tra dữ liệu cơ bản
            has_time = engine_data.get('avg_processing_time', 0) > 0 or engine_data.get('avg_time', 0) > 0
            has_words = engine_data.get('avg_word_count', 0) > 0 or engine_data.get('avg_words', 0) > 0
            has_confidence = 'avg_confidence' in engine_data and engine_data.get('avg_confidence', 0) > 0
            
            # OpenCV chỉ có time, không có confidence và word count thực sự
            is_opencv = 'opencv' in engine_key.lower()
            
            # Điều kiện lọc
            if not has_time:
                continue
                
            if require_confidence and not has_confidence and not is_opencv:
                continue
                
            if require_words and not has_words and not is_opencv:
                continue
            
            # Chuẩn hóa tên trường để tương thích
            normalized_data = dict(engine_data)
            if 'avg_time' in engine_data and 'avg_processing_time' not in engine_data:
                normalized_data['avg_processing_time'] = engine_data['avg_time']
            if 'avg_words' in engine_data and 'avg_word_count' not in engine_data:
                normalized_data['avg_word_count'] = engine_data['avg_words']
                
            filtered_engines[engine_key] = normalized_data
        
        return filtered_engines
    
    def create_grouped_bar_chart_from_json(self, json_file_path, output_filename="grouped_bar_chart"):
        """Tạo biểu đồ cột nhóm từ file JSON"""
        print(f"📊 Tạo biểu đồ cột nhóm từ {json_file_path}...")
        
        # Đọc dữ liệu
        data = self.load_comparison_data(json_file_path)
        if not data:
            return
        
        # Lọc engines có dữ liệu - chỉ yêu cầu time, không bắt buộc confidence/words cho tất cả
        filtered_engines = {}
        for engine_key, engine_data in data.get('engines', {}).items():
            has_time = engine_data.get('avg_processing_time', 0) > 0 or engine_data.get('avg_time', 0) > 0
            if has_time:
                # Chuẩn hóa tên trường
                normalized_data = dict(engine_data)
                if 'avg_time' in engine_data and 'avg_processing_time' not in engine_data:
                    normalized_data['avg_processing_time'] = engine_data['avg_time']
                if 'avg_words' in engine_data and 'avg_word_count' not in engine_data:
                    normalized_data['avg_word_count'] = engine_data['avg_words']
                filtered_engines[engine_key] = normalized_data
        
        if not filtered_engines:
            print("❌ Không có engine nào có dữ liệu thời gian để vẽ biểu đồ cột nhóm")
            return
        
        print(f"✅ Tìm thấy {len(filtered_engines)} engines: {list(filtered_engines.keys())}")
        
        # Chuẩn bị dữ liệu
        engine_names = []
        times = []
        word_counts = []
        confidences = []
        success_rates = []
        
        for engine_key, engine_data in filtered_engines.items():
            engine_names.append(engine_data.get('name', engine_key))
            times.append(engine_data.get('avg_processing_time', 0))
            word_counts.append(engine_data.get('avg_word_count', 0))
            confidences.append(engine_data.get('avg_confidence', 0))
            
            # Tính success rate
            successful = engine_data.get('successful_runs', 0)
            total = successful + engine_data.get('failed_runs', 0)
            success_rate = (successful / total * 100) if total > 0 else 0
            success_rates.append(success_rate)
        
        # Tạo subplot với 2x2 grid
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle('📊 Phân Tích Hiệu Suất OCR - So Sánh Các Thư Viện', fontsize=16, fontweight='bold')
        
        x = np.arange(len(engine_names))
        colors = [self.engine_colors.get(key, '#888888') for key in filtered_engines.keys()]
        
        # 1. Biểu đồ thời gian xử lý
        bars1 = ax1.bar(x, times, color=colors, alpha=0.8, edgecolor='black')
        ax1.set_xlabel('Thư viện OCR', fontweight='bold')
        ax1.set_ylabel('Thời gian (giây)', fontweight='bold')
        ax1.set_title('⏱️ Thời Gian Xử Lý Trung Bình')
        ax1.set_xticks(x)
        ax1.set_xticklabels(engine_names, rotation=45, ha='right')
        ax1.grid(True, alpha=0.3)
        
        # Thêm giá trị trên cột
        for bar, time_val in zip(bars1, times):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                    f'{time_val:.2f}s', ha='center', va='bottom', fontweight='bold')
        
        # 2. Biểu đồ số từ nhận diện (chỉ engines có word count > 0)
        valid_word_indices = [i for i, wc in enumerate(word_counts) if wc > 0]
        if valid_word_indices:
            valid_names = [engine_names[i] for i in valid_word_indices]
            valid_word_counts = [word_counts[i] for i in valid_word_indices]
            valid_colors = [colors[i] for i in valid_word_indices]
            
            x_words = np.arange(len(valid_names))
            bars2 = ax2.bar(x_words, valid_word_counts, color=valid_colors, alpha=0.8, edgecolor='black')
            ax2.set_xlabel('Thư viện OCR', fontweight='bold')
            ax2.set_ylabel('Số từ trung bình', fontweight='bold')
            ax2.set_title('📝 Số Từ Nhận Diện Trung Bình')
            ax2.set_xticks(x_words)
            ax2.set_xticklabels(valid_names, rotation=45, ha='right')
            ax2.grid(True, alpha=0.3)
            
            # Thêm giá trị trên cột
            for bar, word_val in zip(bars2, valid_word_counts):
                ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                        f'{word_val:.1f}', ha='center', va='bottom', fontweight='bold')
        else:
            ax2.text(0.5, 0.5, 'Không có dữ liệu\nsố từ', ha='center', va='center', 
                    transform=ax2.transAxes, fontsize=12)
            ax2.set_title('📝 Số Từ Nhận Diện Trung Bình')
        
        # 3. Biểu đồ độ chính xác (chỉ engines có confidence > 0)
        valid_conf_indices = [i for i, conf in enumerate(confidences) if conf > 0]
        if valid_conf_indices:
            valid_conf_names = [engine_names[i] for i in valid_conf_indices]
            valid_confidences = [confidences[i] for i in valid_conf_indices]
            valid_conf_colors = [colors[i] for i in valid_conf_indices]
            
            x_conf = np.arange(len(valid_conf_names))
            bars3 = ax3.bar(x_conf, valid_confidences, color=valid_conf_colors, alpha=0.8, edgecolor='black')
            ax3.set_xlabel('Thư viện OCR', fontweight='bold')
            ax3.set_ylabel('Độ chính xác (0-1)', fontweight='bold')
            ax3.set_title('🎯 Độ Chính Xác Trung Bình')
            ax3.set_xticks(x_conf)
            ax3.set_xticklabels(valid_conf_names, rotation=45, ha='right')
            ax3.set_ylim(0, 1)
            ax3.grid(True, alpha=0.3)
            
            # Thêm giá trị trên cột
            for bar, conf_val in zip(bars3, valid_confidences):
                ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
                        f'{conf_val:.3f}', ha='center', va='bottom', fontweight='bold')
        else:
            ax3.text(0.5, 0.5, 'Không có dữ liệu\nđộ chính xác', ha='center', va='center', 
                    transform=ax3.transAxes, fontsize=12)
            ax3.set_title('🎯 Độ Chính Xác Trung Bình')
        
        # 4. Biểu đồ tỷ lệ thành công
        bars4 = ax4.bar(x, success_rates, color=colors, alpha=0.8, edgecolor='black')
        ax4.set_xlabel('Thư viện OCR', fontweight='bold')
        ax4.set_ylabel('Tỷ lệ thành công (%)', fontweight='bold')
        ax4.set_title('✅ Tỷ Lệ Thành Công')
        ax4.set_xticks(x)
        ax4.set_xticklabels(engine_names, rotation=45, ha='right')
        ax4.set_ylim(0, 100)
        ax4.grid(True, alpha=0.3)
        
        # Thêm giá trị trên cột
        for bar, success_val in zip(bars4, success_rates):
            ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                    f'{success_val:.1f}%', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        
        # Lưu biểu đồ vào thư mục Charts
        output_path = os.path.join(self.charts_dir, f"{output_filename}.png")
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
        plt.close()
        
        print(f"✅ Biểu đồ cột nhóm đã lưu: {output_path}")
        return output_path
    
    def create_radar_chart_from_json(self, json_file_path, output_filename="radar_chart"):
        """Tạo biểu đồ radar từ file JSON"""
        print(f"🎯 Tạo biểu đồ radar từ {json_file_path}...")
        
        # Đọc dữ liệu
        data = self.load_comparison_data(json_file_path)
        if not data:
            return
        
        # Lọc engines có dữ liệu
        filtered_engines = self.filter_engines_with_data(data, require_confidence=True, require_words=True)
        
        if not filtered_engines:
            print("❌ Không có engine nào có đủ dữ liệu để vẽ biểu đồ radar")
            return
        
        # Chuẩn bị dữ liệu
        categories = ['Tốc độ', 'Số từ', 'Độ chính xác', 'Tỷ lệ thành công']
        N = len(categories)
        
        # Tìm giá trị max để normalize
        max_time = max([engine_data.get('avg_processing_time', 0) for engine_data in filtered_engines.values()])
        max_words = max([engine_data.get('avg_word_count', 0) for engine_data in filtered_engines.values()])
        max_confidence = max([engine_data.get('avg_confidence', 0) for engine_data in filtered_engines.values()])
        
        # Tạo figure
        fig, ax = plt.subplots(figsize=(12, 10), subplot_kw=dict(projection='polar'))
        fig.suptitle('🎯 Biểu Đồ Radar - So Sánh Toàn Diện Các Thư Viện OCR', fontsize=16, fontweight='bold')
        
        # Góc cho mỗi trục
        angles = [n / float(N) * 2 * pi for n in range(N)]
        angles += angles[:1]
        
        # Vẽ cho từng engine
        for engine_key, engine_data in filtered_engines.items():
            # Tính toán điểm số (0-1 scale)
            if max_time > 0:
                speed_score = 1 - (engine_data.get('avg_processing_time', 0) / max_time)  # Đảo ngược: nhanh hơn = cao hơn
            else:
                speed_score = 1.0
                
            if max_words > 0:
                word_score = engine_data.get('avg_word_count', 0) / max_words
            else:
                word_score = 0.0
                
            if max_confidence > 0:
                confidence_score = engine_data.get('avg_confidence', 0) / max_confidence
            else:
                confidence_score = 0.0
            
            # Tính success rate
            successful = engine_data.get('successful_runs', 0)
            total = successful + engine_data.get('failed_runs', 0)
            success_score = (successful / total) if total > 0 else 0
            
            values = [speed_score, word_score, confidence_score, success_score]
            values += values[:1]  # Đóng vòng tròn
            
            color = self.engine_colors.get(engine_key, '#888888')
            label = engine_data.get('name', engine_key)
            
            ax.plot(angles, values, 'o-', linewidth=2, label=label, color=color)
            ax.fill(angles, values, alpha=0.25, color=color)
        
        # Thiết lập trục
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(categories, fontsize=12, fontweight='bold')
        ax.set_ylim(0, 1)
        
        # Thiết lập grid
        ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
        ax.set_yticklabels(['20%', '40%', '60%', '80%', '100%'], fontsize=10)
        ax.grid(True)
        
        # Legend
        plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0), fontsize=10)
        
        plt.tight_layout()
        
        # Lưu biểu đồ vào thư mục Charts
        output_path = os.path.join(self.charts_dir, f"{output_filename}.png")
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
        plt.close()
        
        print(f"✅ Biểu đồ radar đã lưu: {output_path}")
        return output_path
    
    def create_bubble_chart_from_json(self, json_file_path, output_filename="bubble_chart"):
        """Tạo biểu đồ bong bóng từ file JSON"""
        print(f"💫 Tạo biểu đồ bong bóng từ {json_file_path}...")
        
        # Đọc dữ liệu
        data = self.load_comparison_data(json_file_path)
        if not data:
            return
        
        # Lọc engines có dữ liệu (cần cả confidence và words)
        filtered_engines = self.filter_engines_with_data(data, require_confidence=True, require_words=True)
        
        if not filtered_engines:
            print("❌ Không có engine nào có đủ dữ liệu để vẽ biểu đồ bong bóng")
            return
        
        # Tạo figure
        fig, ax = plt.subplots(figsize=(12, 8))
        fig.suptitle('💫 Biểu Đồ Bong Bóng - Tốc Độ vs Độ Chính Xác\n(Kích thước bong bóng = Số từ nhận diện)', 
                     fontsize=14, fontweight='bold')
        
        # Chuẩn bị dữ liệu
        x_values = []  # Thời gian xử lý
        y_values = []  # Độ chính xác
        sizes = []     # Số từ (kích thước bong bóng)
        colors = []
        labels = []
        
        for engine_key, engine_data in filtered_engines.items():
            x_values.append(engine_data.get('avg_processing_time', 0))
            y_values.append(engine_data.get('avg_confidence', 0))
            sizes.append(engine_data.get('avg_word_count', 0) * 20)  # Scale cho bubble size
            colors.append(self.engine_colors.get(engine_key, '#888888'))
            labels.append(engine_data.get('name', engine_key))
        
        # Vẽ bubbles
        scatter = ax.scatter(x_values, y_values, s=sizes, c=colors, alpha=0.6, edgecolors='black')
        
        # Thêm labels cho từng bubble
        for i, label in enumerate(labels):
            ax.annotate(label, (x_values[i], y_values[i]), 
                       xytext=(5, 5), textcoords='offset points',
                       fontsize=10, fontweight='bold',
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7))
        
        # Thiết lập trục
        ax.set_xlabel('⏱️ Thời gian xử lý (giây)', fontsize=12, fontweight='bold')
        ax.set_ylabel('🎯 Độ chính xác', fontsize=12, fontweight='bold')
        ax.set_ylim(0, 1)
        ax.grid(True, alpha=0.3)
        
        # Thêm chú thích về kích thước bubble
        word_counts = [engine_data.get('avg_word_count', 0) for engine_data in filtered_engines.values()]
        if word_counts:
            max_words = max(word_counts)
            min_words = min([w for w in word_counts if w > 0]) if any(w > 0 for w in word_counts) else 1
            
            # Legend cho bubble size
            legend_sizes = [min_words, max_words]
            legend_bubbles = []
            for size in legend_sizes:
                legend_bubbles.append(plt.scatter([], [], s=size*20, c='gray', alpha=0.6))
            
            legend1 = ax.legend(legend_bubbles, [f'{int(min_words)} từ', f'{int(max_words)} từ'], 
                               title="Kích thước bong bóng", loc='upper right', 
                               bbox_to_anchor=(1, 1))
            ax.add_artist(legend1)
        
        plt.tight_layout()
        
        # Lưu biểu đồ vào thư mục Charts
        output_path = os.path.join(self.charts_dir, f"{output_filename}.png")
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
        plt.close()
        
        print(f"✅ Biểu đồ bong bóng đã lưu: {output_path}")
        return output_path
    
    def create_all_charts_from_json(self, json_file_path, output_prefix="ocr_analysis"):
        """Tạo tất cả biểu đồ từ file JSON"""
        print(f"🎨 Tạo tất cả biểu đồ từ {json_file_path}...")
        
        results = {
            'grouped_bar': None,
            'radar': None,
            'bubble': None
        }
        
        try:
            # Tạo biểu đồ cột nhóm
            results['grouped_bar'] = self.create_grouped_bar_chart_from_json(
                json_file_path, f"{output_prefix}_grouped_bar"
            )
            
            # Tạo biểu đồ radar
            results['radar'] = self.create_radar_chart_from_json(
                json_file_path, f"{output_prefix}_radar"
            )
            
            # Tạo biểu đồ bong bóng
            results['bubble'] = self.create_bubble_chart_from_json(
                json_file_path, f"{output_prefix}_bubble"
            )
            
            print(f"✅ Tất cả biểu đồ đã được tạo với prefix: {output_prefix}")
            return results
            
        except Exception as e:
            print(f"❌ Lỗi tạo biểu đồ: {str(e)}")
            import traceback
            traceback.print_exc()
            return results

def main():
    """Test function"""
    tool = JSONOCRVisualizationTool()
    
    # Tìm file JSON comparison report mới nhất trong thư mục Json
    json_files = [f for f in os.listdir(tool.json_dir) if f.startswith('comparison_report_') and f.endswith('.json')]
    if not json_files:
        print(f"❌ Không tìm thấy file comparison report JSON trong {tool.json_dir}")
        return
    
    # Sử dụng file mới nhất
    latest_file = max([os.path.join(tool.json_dir, f) for f in json_files], key=os.path.getctime)
    latest_filename = os.path.basename(latest_file)
    print(f"📁 Sử dụng file: {latest_filename}")
    
    # Tạo tất cả biểu đồ
    results = tool.create_all_charts_from_json(latest_filename, "json_analysis")
    
    print("\n🎯 KẾT QUẢ:")
    for chart_type, file_path in results.items():
        if file_path:
            print(f"✅ {chart_type}: {os.path.basename(file_path)}")
        else:
            print(f"❌ {chart_type}: Không tạo được")

if __name__ == "__main__":
    main()