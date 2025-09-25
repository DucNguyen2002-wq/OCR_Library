"""
Test script cho JSON OCR Visualization Tool
"""

from json_visualization import JSONOCRVisualizationTool
import os

def test_json_visualization():
    """Test visualization từ file JSON"""
    print("🧪 TEST JSON OCR VISUALIZATION TOOL")
    print("="*50)
    
    # Khởi tạo tool
    tool = JSONOCRVisualizationTool()
    
    # Tìm file JSON comparison report mới nhất
    json_files = [f for f in os.listdir('.') if f.startswith('comparison_report_') and f.endswith('.json')]
    if not json_files:
        print("❌ Không tìm thấy file comparison report JSON")
        return
    
    # Sử dụng file mới nhất
    latest_file = max(json_files, key=os.path.getctime)
    print(f"📁 Sử dụng file: {latest_file}")
    
    # Test từng loại biểu đồ
    print("\n1️⃣ Test biểu đồ cột nhóm...")
    grouped_bar_result = tool.create_grouped_bar_chart_from_json(latest_file, "test_grouped_bar")
    
    print("\n2️⃣ Test biểu đồ radar...")
    radar_result = tool.create_radar_chart_from_json(latest_file, "test_radar")
    
    print("\n3️⃣ Test biểu đồ bong bóng...")
    bubble_result = tool.create_bubble_chart_from_json(latest_file, "test_bubble")
    
    print("\n4️⃣ Test tạo tất cả biểu đồ...")
    all_results = tool.create_all_charts_from_json(latest_file, "test_all_charts")
    
    # Kiểm tra kết quả
    print("\n🎯 KẾT QUẢ TEST:")
    print(f"✅ Biểu đồ cột nhóm: {grouped_bar_result}")
    print(f"✅ Biểu đồ radar: {radar_result}")
    print(f"✅ Biểu đồ bong bóng: {bubble_result}")
    
    print("\n📊 Tất cả biểu đồ:")
    for chart_type, file_path in all_results.items():
        if file_path:
            print(f"✅ {chart_type}: {file_path}")
        else:
            print(f"❌ {chart_type}: Không tạo được")
    
    print("\n🎉 Test hoàn thành!")
    print("📂 Kiểm tra thư mục hiện tại để xem các file .png đã tạo")

if __name__ == "__main__":
    test_json_visualization()