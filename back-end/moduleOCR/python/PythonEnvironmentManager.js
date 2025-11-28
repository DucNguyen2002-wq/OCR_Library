// services/python/PythonEnvironmentManager.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

class PythonEnvironmentManager {
  constructor() {
    this._pythonCommand = null; // Cache
    this._environmentChecked = false; // Flag kiểm tra đã check chưa
    this._environmentValid = false; // Flag môi trường có ok không
  }

  /**
   * Lazy detect Python command (chỉ chạy 1 lần)
   */
  getPythonCommand() {
    if (this._pythonCommand) {
      return this._pythonCommand; // ✅ Return cache
    }

    console.log("[PythonEnv] 🔍 Detecting Python command...");
    this._pythonCommand = this._detectPythonCommand();
    return this._pythonCommand;
  }

  /**
   * Detect Python (private, chỉ gọi bởi getPythonCommand)
   */
  _detectPythonCommand() {
    const venvPaths = [
      "C:/GOCR/.venv/Scripts/python.exe",
      path.join(process.cwd(), ".venv", "Scripts", "python.exe"),
      path.join(process.cwd(), "venv", "Scripts", "python.exe"),
    ];

    for (const venvPath of venvPaths) {
      if (fs.existsSync(venvPath)) {
        console.log(`[PythonEnv] ✅ Using venv: ${venvPath}`);
        return venvPath;
      }
    }

    console.log("[PythonEnv] ℹ️ Using system Python");
    return "python";
  }

  /**
   * Kiểm tra môi trường Python + EasyOCR
   * CHỈ GỌI KHI:
   * 1. Lần đầu khởi động app
   * 2. Khi gặp lỗi Python runtime
   */
  async checkEnvironment(force = false) {
    // ✅ Nếu đã check rồi và valid, skip
    if (this._environmentChecked && this._environmentValid && !force) {
      console.log("[PythonEnv] ⚡ Environment already verified (cached)");
      return {
        success: true,
        cached: true,
        pythonVersion: "cached",
        pythonCommand: this.getPythonCommand(),
      };
    }

    console.log("[PythonEnv] 🔍 Checking Python environment...");

    return new Promise((resolve) => {
      const pythonCmd = this.getPythonCommand();
      const process = spawn(pythonCmd, [
        "-c",
        "import easyocr; import sys; print(sys.version)",
      ]);

      let output = "";
      let error = "";

      process.stdout.on("data", (data) => (output += data.toString()));
      process.stderr.on("data", (data) => (error += data.toString()));

      process.on("close", (code) => {
        this._environmentChecked = true; // ✅ Đánh dấu đã check

        if (code === 0) {
          this._environmentValid = true; // ✅ Cache: môi trường OK
          console.log("[PythonEnv] ✅ Environment valid");
          resolve({
            success: true,
            pythonVersion: output.trim(),
            pythonCommand: pythonCmd,
            message: "Python và EasyOCR sẵn sàng",
          });
        } else {
          this._environmentValid = false; // ❌ Cache: môi trường lỗi
          console.error("[PythonEnv] ❌ Environment invalid");
          resolve({
            success: false,
            error: error || "EasyOCR chưa cài đặt",
            message: "Chạy: pip install -r requirements.txt",
          });
        }
      });

      process.on("error", (err) => {
        this._environmentChecked = true;
        this._environmentValid = false;
        console.error("[PythonEnv] ❌ Python not found");
        resolve({
          success: false,
          error: err.message,
          message: "Python không tìm thấy trong PATH",
        });
      });
    });
  }

  /**
   * Reset cache (khi muốn force check lại)
   */
  resetCache() {
    console.log("[PythonEnv] 🔄 Resetting cache...");
    this._pythonCommand = null;
    this._environmentChecked = false;
    this._environmentValid = false;
  }

  /**
   * Check nhanh xem môi trường có valid không (dựa vào cache)
   */
  isEnvironmentValid() {
    return this._environmentValid;
  }
}

// ✅ Singleton
module.exports = new PythonEnvironmentManager();