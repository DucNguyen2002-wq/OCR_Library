// services/python/BatchOCRProcessor.js
class BatchOCRProcessor {
  constructor(processRunner) {
    this.processRunner = processRunner;
  }

  /**
   * Batch OCR cho nhiều ảnh tuần tự
   */
  async processBatch(imagePaths, languages = ["vi", "en"], useGPU = false) {
    console.log(`[BatchOCR] Processing ${imagePaths.length} images...`);

    const results = [];
    for (const imagePath of imagePaths) {
      try {
        const result = await this.processRunner.callEasyOCR(
          imagePath,
          languages,
          useGPU
        );
        results.push({
          imagePath,
          ...result,
        });
      } catch (error) {
        results.push({
          imagePath,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Batch song song (tùy chọn, nếu cần tăng tốc)
   */
  async processBatchParallel(
    imagePaths,
    languages = ["vi", "en"],
    useGPU = false,
    concurrency = 3
  ) {
    console.log(
      `[BatchOCR] Parallel processing ${imagePaths.length} images (concurrency: ${concurrency})`
    );

    const chunks = [];
    for (let i = 0; i < imagePaths.length; i += concurrency) {
      chunks.push(imagePaths.slice(i, i + concurrency));
    }

    const results = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (imagePath) => {
          try {
            const result = await this.processRunner.callEasyOCR(
              imagePath,
              languages,
              useGPU
            );
            return { imagePath, ...result };
          } catch (error) {
            return { imagePath, success: false, error: error.message };
          }
        })
      );
      results.push(...chunkResults);
    }

    return results;
  }
}

module.exports = BatchOCRProcessor;