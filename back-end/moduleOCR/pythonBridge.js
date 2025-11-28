// services/pythonBridge.js (Compact Clean Version)
const PythonEnvironmentManager = require("./python/PythonEnvironmentManager");
const PythonProcessRunner = require("./python/PythonProcessRunner");
const BatchOCRProcessor = require("./python/BatchOCRProcessor");

class PythonBridge {
  constructor() {
    this.envManager = PythonEnvironmentManager;
    this._processRunner = null;
    this._batchProcessor = null;
    this._initialized = false;
  }

  async callEasyOCR(imagePath, languages = ["vi", "en"], useGPU = false) {
    this._ensureInitialized();
    return this._retry(() => 
      this._processRunner.callEasyOCR(imagePath, languages, useGPU)
    );
  }

  async batchOCR(imagePaths, languages = ["vi", "en"], useGPU = false) {
    this._ensureInitialized();
    return this._retry(() => 
      this._batchProcessor.processBatch(imagePaths, languages, useGPU)
    );
  }

  async checkPythonEnvironment(force = false) {
    return this.envManager.checkEnvironment(force);
  }

  async resetAndReinitialize() {
    this.envManager.resetCache();
    this._initialized = false;
    this._processRunner = null;
    this._batchProcessor = null;
    const result = await this.checkPythonEnvironment(true);
    if (result.success) this._ensureInitialized();
    return result;
  }

  _ensureInitialized() {
    if (this._initialized) return;
    this._processRunner = new PythonProcessRunner(
      this.envManager.getPythonCommand()
    );
    this._batchProcessor = new BatchOCRProcessor(this._processRunner);
    this._initialized = true;
  }

  async _retry(fn) {
    try {
      return await fn();
    } catch (err) {
      if (this._isEnvError(err)) {
        await this.checkPythonEnvironment(true);
        try {
          return await fn();
        } catch (retryErr) {
          throw new Error(`Retry failed: ${retryErr.message}`);
        }
      }
      throw err;
    }
  }

  _isEnvError(err) {
    const patterns = ["python not found", "modulenotfounderror", "enoent"];
    return patterns.some(p => err.message?.toLowerCase().includes(p));
  }

  getEnvironmentManager() { return this.envManager; }
  getProcessRunner() { this._ensureInitialized(); return this._processRunner; }
  getBatchProcessor() { this._ensureInitialized(); return this._batchProcessor; }
}

module.exports = new PythonBridge();