"""
Test script cho hệ thống OCR với thư mục Results
"""

import os
import sys

# Thêm thư mục Demo vào path
demo_dir = os.path.dirname(os.path.abspath(__file__))
if demo_dir not in sys.path:
    sys.path.append(demo_dir)

from json_visualization import JSONOCRVisualizationTool

def test_directory_structure():
    """Test cấu trúc thư mục"""
    print("🧪 TEST CẤU TRÚC THỪ MỤC")
    print("="*50)
    
    tool = JSONOCRVisualizationTool()
    
    print(f"📂 Base directory: {tool.base_dir}")
    print(f"📁 Results directory: {tool.results_dir}")
    print(f"📄 JSON directory: {tool.json_dir}")
    print(f"📊 Charts directory: {tool.charts_dir}")
    
    # Kiểm tra xem thư mục có tồn tại không
    for name, path in [
        ("Results", tool.results_dir),
        ("Json", tool.json_dir),  
        ("Charts", tool.charts_dir)
    ]:
        if os.path.exists(path):
            print(f"✅ {name}: {path}")
        else:
            print(f"❌ {name}: {path} - Không tồn tại")
    
    return tool

def test_json_reading():
    """Test đọc file JSON"""
    print(f"\n🧪 TEST ĐỌC FILE JSON")
    print("="*50)
    
    tool = test_directory_structure()
    
    # Liệt kê file JSON có sẵn
    if os.path.exists(tool.json_dir):
        json_files = [f for f in os.listdir(tool.json_dir) if f.endswith('.json')]
        print(f"📁 Tìm thấy {len(json_files)} file JSON:")
        for i, json_file in enumerate(json_files, 1):
            file_path = os.path.join(tool.json_dir, json_file)
            file_size = os.path.getsize(file_path) // 1024  # KB
            print(f"   {i}. {json_file} ({file_size} KB)")
        
        # Test đọc file mới nhất nếu có
        if json_files:
            latest_file = max([os.path.join(tool.json_dir, f) for f in json_files], 
                            key=os.path.getmtime)
            latest_name = os.path.basename(latest_file)
            print(f"\n🔍 Test đọc file mới nhất: {latest_name}")
            
            data = tool.load_comparison_data(latest_name)
            if data:
                print(f"✅ Đọc thành công!")
                print(f"   📊 Engines: {len(data.get('engines', {}))}")
                print(f"   📅 Timestamp: {data.get('metadata', {}).get('timestamp', 'N/A')}")
                return True
            else:
                print(f"❌ Lỗi đọc file")
                return False
        else:
            print("⚠️  Chưa có file JSON nào")
            print("💡 Hãy chạy 'python simple_ocr.py' trước để tạo dữ liệu")
            return False
    else:
        print(f"❌ Thư mục JSON không tồn tại: {tool.json_dir}")
        return False

def test_chart_creation():
    """Test tạo biểu đồ"""
    print(f"\n🧪 TEST TẠO BIỂU ĐỒ")
    print("="*50)
    
    tool = JSONOCRVisualizationTool()
    
    # Kiểm tra file JSON
    json_files = []
    if os.path.exists(tool.json_dir):
        json_files = [f for f in os.listdir(tool.json_dir) 
                     if f.startswith('comparison_report_') and f.endswith('.json')]
    
    if not json_files:
        print("❌ Không có file comparison report JSON")
        print("💡 Hãy chạy 'python simple_ocr.py' option 2 trước")
        return False
    
    # Sử dụng file mới nhất
    latest_file = max([os.path.join(tool.json_dir, f) for f in json_files], 
                      key=os.path.getmtime)
    latest_name = os.path.basename(latest_file)
    
    print(f"📁 Sử dụng file: {latest_name}")
    
    # Test tạo từng loại biểu đồ
    results = {}
    
    print("📊 Tạo biểu đồ cột nhóm...")
    results['grouped_bar'] = tool.create_grouped_bar_chart_from_json(
        latest_name, "test_grouped_bar_new"
    )
    
    print("🎯 Tạo biểu đồ radar...")
    results['radar'] = tool.create_radar_chart_from_json(
        latest_name, "test_radar_new"
    )
    
    print("💫 Tạo biểu đồ bong bóng...")
    results['bubble'] = tool.create_bubble_chart_from_json(
        latest_name, "test_bubble_new"
    )
    
    # Kiểm tra kết quả
    print(f"\n🎯 KẾT QUẢ:")
    success_count = 0
    for chart_type, file_path in results.items():
        if file_path and os.path.exists(file_path):
            file_size = os.path.getsize(file_path) // 1024  # KB
            print(f"✅ {chart_type}: {os.path.basename(file_path)} ({file_size} KB)")
            success_count += 1
        else:
            print(f"❌ {chart_type}: Không tạo được")
    
    print(f"\n📊 Thành công: {success_count}/3 biểu đồ")
    return success_count == 3

def main():
    """Chạy tất cả test"""
    print("🚀 TEST HỆ THỐNG OCR VỚI THƯ MỤC RESULTS")
    print("="*60)
    
    try:
        # Test 1: Cấu trúc thư mục
        test_directory_structure()
        
        # Test 2: Đọc JSON
        json_ok = test_json_reading()
        
        # Test 3: Tạo biểu đồ (chỉ nếu có JSON)
        if json_ok:
            chart_ok = test_chart_creation()
            
            if chart_ok:
                print(f"\n🎉 TẤT CẢ TEST ĐỀU THÀNH CÔNG!")
                print(f"✅ Hệ thống Results hoạt động bình thường")
            else:
                print(f"\n⚠️  Test biểu đồ có vấn đề")
        else:
            print(f"\n💡 Hướng dẫn sử dụng:")
            print(f"   1. cd Demo")
            print(f"   2. python simple_ocr.py")
            print(f"   3. Chọn option 2")
            print(f"   4. Chạy lại test này")
    
    except Exception as e:
        print(f"\n❌ Lỗi trong test: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()