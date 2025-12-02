import client from './client';

/**
 * Upload book cover images to server
 * @param {Object} covers - Object with front, spine, inside, back image files
 * @returns {Promise} Response with uploaded file info
 */
export const uploadBookCovers = async (covers) => {
  try {
    const formData = new FormData();
    
    // Add each cover if it exists
    if (covers.front) {
      formData.append('front', covers.front);
    }
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
 * @param {Object} filenames - Object with front, spine, inside, back filenames
 * @returns {Promise} Response with extracted book data
 */
export const scanBookCovers = async (filenames) => {
  try {
    const response = await client.post('/ocr/book-covers', {
      front: filenames.front || null,
      spine: filenames.spine || null,
      inside: filenames.inside || null,
      back: filenames.back || null,
      languages: 'vi,en',
      usePerplexity: true
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
 * @param {string} coverType - Type of cover (front, spine, inside, back)
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
 * @param {Object} covers - Object with front, spine, inside, back image files
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

    // Extract filenames from upload result
    const filenames = {
      front: uploadResult.data.front?.filename || null,
      spine: uploadResult.data.spine?.filename || null,
      inside: uploadResult.data.inside?.filename || null,
      back: uploadResult.data.back?.filename || null
    };

    console.log('[OCR] Step 2: Processing OCR...', filenames);

    // Step 2: Scan uploaded images
    const scanResult = await scanBookCovers(filenames);

    // Use Cloudinary URLs from scan result if available, otherwise use upload URLs
    if (scanResult.success && scanResult.bookData) {
      scanResult.bookData.coverImages = {
        front: scanResult.cloudinaryUrls?.front || uploadResult.data.front?.url || null,
        spine: scanResult.cloudinaryUrls?.spine || uploadResult.data.spine?.url || null,
        inside: scanResult.cloudinaryUrls?.inside || uploadResult.data.inside?.url || null,
        back: scanResult.cloudinaryUrls?.back || uploadResult.data.back?.url || null
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

/**
 * Tìm kiếm sách bằng ảnh OCR (NEW)
 * @param {File} imageFile - File ảnh bìa sách
 * @returns {Promise} Response data
 */
export const searchBookByImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('coverImage', imageFile);

  const response = await client.post('/ocr/search-book', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Kiểm tra trạng thái OCR search service (NEW)
 * @returns {Promise} Service status
 */
export const checkOCRSearchStatus = async () => {
  const response = await client.get('/ocr/search-book/status');
  return response.data;
};
