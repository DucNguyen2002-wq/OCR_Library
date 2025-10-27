import client from './client';

/**
 * Upload book cover images to server
 * @param {Object} covers - Object with spine, inside, back image files
 * @returns {Promise} Response with uploaded file info
 */
export const uploadBookCovers = async (covers) => {
  try {
    const formData = new FormData();
    
    // Add each cover if it exists (thay front → spine)
    if (covers.spine) {
      formData.append('spine', covers.spine);
    }
    if (covers.inside) {
      formData.append('inside', covers.inside);
    }
    if (covers.back) {
      formData.append('back', covers.back);
    }

    const response = await client.post('/upload/book-covers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload book covers error:', error);
    throw error.response?.data || { message: 'Lỗi khi upload ảnh bìa sách' };
  }
};

/**
 * Scan uploaded book covers and extract book information
 * @param {Object} filenames - Object with spine, inside, back filenames
 * @returns {Promise} Response with extracted book data
 */
export const scanBookCovers = async (filenames) => {
  try {
    const response = await client.post('/ocr/book-covers', {
      spine: filenames.spine || null,    // Thay front → spine
      inside: filenames.inside || null,
      back: filenames.back || null,
      languages: 'vi,en'
    });

    return response.data;
  } catch (error) {
    console.error('Scan book covers error:', error);
    throw error.response?.data || { message: 'Lỗi khi quét bìa sách' };
  }
};

/**
 * Upload single book cover
 * @param {File} image - Image file
 * @returns {Promise} Response with uploaded file info
 */
export const uploadSingleCover = async (image) => {
  try {
    const formData = new FormData();
    formData.append('image', image);

    const response = await client.post('/upload/book-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload single cover error:', error);
    throw error.response?.data || { message: 'Lỗi khi upload ảnh' };
  }
};

/**
 * Scan a single uploaded cover
 * @param {string} filename - Filename of uploaded image
 * @param {string} coverType - Type of cover (front, inside, back)
 * @returns {Promise} Response with extracted data
 */
export const scanSingleCover = async (filename, coverType = 'front') => {
  try {
    const response = await client.post('/ocr/book-cover', {
      filename,
      coverType,
      languages: 'vi,en'
    });

    return response.data;
  } catch (error) {
    console.error('Scan single cover error:', error);
    throw error.response?.data || { message: 'Lỗi khi quét bìa sách' };
  }
};

/**
 * Complete workflow: Upload + Scan book covers
 * @param {Object} covers - Object with spine, inside, back image files
 * @returns {Promise} Response with extracted book data
 */
export const uploadAndScanBookCovers = async (covers) => {
  try {
    // Step 1: Upload images
    console.log('[OCR] Step 1: Uploading images...');
    const uploadResult = await uploadBookCovers(covers);
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.message || 'Upload failed');
    }

    // Extract filenames from upload result (thay front → spine)
    const filenames = {
      spine: uploadResult.data.spine?.filename || null,
      inside: uploadResult.data.inside?.filename || null,
      back: uploadResult.data.back?.filename || null
    };

    console.log('[OCR] Step 2: Processing OCR...', filenames);

    // Step 2: Scan uploaded images
    const scanResult = await scanBookCovers(filenames);

    // Add image URLs to result (thay front → spine)
    if (scanResult.success && scanResult.bookData) {
      scanResult.bookData.coverImages = {
        spine: uploadResult.data.spine?.url || null,
        inside: uploadResult.data.inside?.url || null,
        back: uploadResult.data.back?.url || null
      };
    }

    return scanResult;
  } catch (error) {
    console.error('Upload and scan error:', error);
    throw error;
  }
};

/**
 * Extract text from image (legacy)
 * @param {File} image - Image file
 * @returns {Promise} Response with extracted text
 */
export const extractText = async (image) => {
  try {
    const formData = new FormData();
    formData.append('image', image);

    const response = await client.post('/ocr/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Extract text error:', error);
    throw error.response?.data || { message: 'Lỗi khi trích xuất văn bản' };
  }
};
