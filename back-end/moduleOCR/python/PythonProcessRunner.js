// services/python/PythonProcessRunner.js
const { spawn } = require("child_process");
const path = require("path");

class PythonProcessRunner {
  constructor(pythonCommand) {
    this.pythonCommand = pythonCommand;
    this.scriptPath = path.join(__dirname, "..", "easyocr_fast.py");
  }

  /**
   * Chạy Python script với args, trả về JSON
   */
  async runScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`[PythonRunner] Running: ${scriptPath}`);

      const pythonProcess = spawn(this.pythonCommand, [scriptPath, ...args], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => (stdout += data.toString()));
      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
        console.log(`[PythonRunner] stderr: ${data.toString()}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`[PythonRunner] Exit code: ${code}`);
          console.error(`[PythonRunner] stderr: ${stderr}`);
          reject(new Error(`Python failed (code ${code}): ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          console.error(`[PythonRunner] Parse error:`, error);
          console.error(`[PythonRunner] stdout:`, stdout);
          reject(new Error(`Parse JSON failed: ${error.message}`));
        }
      });

      pythonProcess.on("error", (error) => {
        console.error(`[PythonRunner] Spawn error:`, error);
        reject(error);
      });
    });
  }

  /**
   * Gọi EasyOCR script
   */
  async callEasyOCR(imagePath, languages = ["vi", "en"], useGPU = false) {
    const languagesStr = Array.isArray(languages)
      ? languages.join(",")
      : languages;
    const args = [imagePath, languagesStr, useGPU.toString()];

    return this.runScript(this.scriptPath, args);
  }

  /**
   * Chạy inline Python code (cho options động)
   */
  async runInlineCode(pythonCode) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonCommand, ["-c", pythonCode]);

      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (data) => (stdout += data.toString()));
      process.stderr.on("data", (data) => (stderr += data.toString()));

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Inline code failed: ${stderr}`));
          return;
        }

        try {
          resolve(JSON.parse(stdout));
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });

      process.on("error", (err) => reject(err));
    });
  }
}

module.exports = PythonProcessRunner;