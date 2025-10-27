/**
 * Python Bridge Service
 * Module kết nối giữa Node.js và Python để gọi EasyOCR
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;

class PythonBridge {
  constructor() {
    // Tự động phát hiện Python executable
    // Ưu tiên: virtual environment > python3 > python > py
    this.pythonCommand = this.detectPythonCommand();

    // Sử dụng script FAST với cached reader
    this.scriptPath = path.join(__dirname, "easyocr_fast.py");
    this.oldScriptPath = path.join(__dirname, "easyocrService.py"); // backup

    console.log(`[PythonBridge] ⚡ Using FAST script: ${this.scriptPath}`);
  }

  /**
   * Phát hiện Python command phù hợp
   * @returns {string} - Python command
   */
  detectPythonCommand() {
    // Kiểm tra virtual environment trước
    const venvPaths = [
      "C:/GOCR/.venv/Scripts/python.exe",
      path.join(process.cwd(), ".venv", "Scripts", "python.exe"),
      path.join(process.cwd(), "venv", "Scripts", "python.exe"),
    ];

    for (const venvPath of venvPaths) {
      if (require("fs").existsSync(venvPath)) {
        console.log(`[PythonBridge] Sử dụng virtual environment: ${venvPath}`);
        return venvPath;
      }
    }

    // Fallback to system Python
    console.log("[PythonBridge] Sử dụng system Python");
    return "python"; // hoặc 'python3' hoặc 'py'
  }

  /**
   * Gọi script Python để xử lý OCR
   * @param {string} imagePath - Đường dẫn đến file ảnh
   * @param {Array<string>} languages - Danh sách ngôn ngữ (mặc định: ['vi', 'en'])
   * @param {boolean} useGPU - Sử dụng GPU hay không
   * @param {number} textThreshold - Text detection threshold (0.0-1.0)
   * @param {number} lowText - Low text threshold (0.0-1.0)
   * @param {boolean} paragraph - Paragraph mode
   * @param {number} contrast - Contrast adjustment (1.0-3.0)
   * @param {number} brightness - Brightness adjustment (0-50)
   * @param {number} mag_ratio - Magnification ratio (1.0-3.0)
   * @returns {Promise<Object>} - Kết quả từ Python
   */
  async callEasyOCR(
    imagePath, 
    languages = ["vi", "en"], 
    useGPU = false,
    textThreshold = 0.3,
    lowText = 0.2,
    paragraph = true,
    contrast = 1.5,
    brightness = 10,
    mag_ratio = 1.5
  ) {
    return new Promise((resolve, reject) => {
      console.log(`[PythonBridge] Gọi EasyOCR cho: ${imagePath}`);

      // Chuẩn bị arguments với các tham số mới
      const args = [
        this.scriptPath,
        imagePath,
        languages.join(","),
        useGPU.toString(),
        textThreshold.toString(),
        lowText.toString(),
        paragraph.toString(),
        contrast.toString(),
        brightness.toString(),
        mag_ratio.toString()
      ];

      // Spawn Python process
      const pythonProcess = spawn(this.pythonCommand, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdoutData = "";
      let stderrData = "";

      // Lắng nghe output
      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
        console.log(`[PythonBridge] stderr: ${data.toString()}`);
      });

      // Xử lý khi process kết thúc
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`[PythonBridge] Python process thoát với code ${code}`);
          console.error(`[PythonBridge] stderr: ${stderrData}`);
          reject(
            new Error(`Python process failed with code ${code}: ${stderrData}`)
          );
          return;
        }

        try {
          // Parse JSON result
          const result = JSON.parse(stdoutData);
          console.log(`[PythonBridge] Nhận được kết quả từ Python`);
          resolve(result);
        } catch (error) {
          console.error(`[PythonBridge] Lỗi parse JSON:`, error);
          console.error(`[PythonBridge] stdout:`, stdoutData);
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      });

      // Xử lý lỗi
      pythonProcess.on("error", (error) => {
        console.error(`[PythonBridge] Lỗi spawn process:`, error);
        reject(error);
      });
    });
  }

  /**
   * Kiểm tra Python và các thư viện có sẵn không
   * @returns {Promise<Object>} - Trạng thái kiểm tra
   */
  async checkPythonEnvironment() {
    return new Promise((resolve) => {
      const pythonProcess = spawn(this.pythonCommand, [
        "-c",
        "import easyocr; import sys; print(sys.version)",
      ]);

      let output = "";
      let error = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        error += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve({
            success: true,
            pythonVersion: output.trim(),
            message: "Python và EasyOCR đã được cài đặt",
          });
        } else {
          resolve({
            success: false,
            error:
              error || "Không thể chạy Python hoặc EasyOCR chưa được cài đặt",
            message:
              "Vui lòng cài đặt Python và chạy: pip install -r moduleOCR/requirements.txt",
          });
        }
      });

      pythonProcess.on("error", (err) => {
        resolve({
          success: false,
          error: err.message,
          message: "Python không được tìm thấy trong PATH",
        });
      });
    });
  }

  /**
   * Gọi EasyOCR với các tùy chọn nâng cao
   * @param {string} imagePath - Đường dẫn ảnh
   * @param {Object} options - Các tùy chọn
   * @returns {Promise<Object>} - Kết quả OCR
   */
  async callEasyOCRWithOptions(imagePath, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`[PythonBridge] Gọi EasyOCR với options cho: ${imagePath}`);

      // Tạo script Python tạm thời với options
      const script = this._generatePythonScript(imagePath, options);

      const pythonProcess = spawn(this.pythonCommand, ["-c", script]);

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python failed: ${stderrData}`));
          return;
        }

        try {
          const result = JSON.parse(stdoutData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });

      pythonProcess.on("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * Tạo Python script động với options
   * @private
   */
  _generatePythonScript(imagePath, options) {
    const languages = options.languages || ["vi", "en"];
    const useGPU = options.useGPU || false;

    return `
import sys
import json
sys.path.insert(0, '${__dirname.replace(/\\/g, "\\\\")}')
from easyocrService import EasyOCRService

try:
    service = EasyOCRService(languages=${JSON.stringify(
      languages
    )}, gpu=${useGPU})
    result = service.recognize_with_preprocessing('${imagePath.replace(
      /\\/g,
      "\\\\"
    )}', ${JSON.stringify(options)})
    print(json.dumps(result, ensure_ascii=False))
except Exception as e:
    print(json.dumps({'success': False, 'error': str(e)}))
    sys.exit(1)
`;
  }

  /**
   * Xử lý batch OCR cho nhiều ảnh
   * @param {Array<string>} imagePaths - Mảng đường dẫn ảnh
   * @param {Array<string>} languages - Ngôn ngữ
   * @param {boolean} useGPU - Dùng GPU
   * @returns {Promise<Array<Object>>} - Mảng kết quả
   */
  async batchOCR(imagePaths, languages = ["vi", "en"], useGPU = false) {
    console.log(`[PythonBridge] Batch OCR cho ${imagePaths.length} ảnh`);

    const results = [];
    for (const imagePath of imagePaths) {
      try {
        const result = await this.callEasyOCR(imagePath, languages, useGPU);
        results.push({
          imagePath: imagePath,
          ...result,
        });
      } catch (error) {
        results.push({
          imagePath: imagePath,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = new PythonBridge();
