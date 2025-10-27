/**
 * Upload Controller - Xử lý upload ảnh bìa sách
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * Upload single book cover image
 */
exports.uploadBookCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh'
      });
    }

    // Tạo URL công khai cho ảnh
    const imageUrl = `/uploads/${req.file.filename}`;
    const fullPath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);

    console.log(`[Upload] Saved: ${req.file.filename} (${req.file.size} bytes)`);

    return res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: fullPath,
        url: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message
    });
  }
};

/**
 * Upload multiple book cover images (front, inside, back)
 */
exports.uploadBookCovers = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 ảnh bìa'
      });
    }

    const uploadedFiles = {};
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

    // Xử lý từng loại bìa
    for (const [coverType, files] of Object.entries(req.files)) {
      if (files && files.length > 0) {
        const file = files[0];
        const fullPath = path.join(uploadsDir, file.filename);

        uploadedFiles[coverType] = {
          filename: file.filename,
          originalName: file.originalname,
          path: fullPath,
          url: `/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        };

        console.log(`[Upload] ${coverType}: ${file.filename} (${file.size} bytes)`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Upload thành công ${Object.keys(uploadedFiles).length} ảnh bìa`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message
    });
  }
};

/**
 * Delete uploaded image
 */
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên file'
      });
    }

    const filePath = path.join(__dirname, '..', 'public', 'uploads', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File không tồn tại'
      });
    }

    // Delete file
    await fs.unlink(filePath);

    console.log(`[Upload] Deleted: ${filename}`);

    return res.status(200).json({
      success: true,
      message: 'Xóa ảnh thành công'
    });

  } catch (error) {
    console.error('[Upload] Error deleting:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa ảnh',
      error: error.message
    });
  }
};

/**
 * Get list of uploaded images
 */
exports.listImages = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

    // Ensure directory exists
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      await fs.mkdir(uploadsDir, { recursive: true });
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const files = await fs.readdir(uploadsDir);
    
    const imageFiles = [];
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        imageFiles.push({
          filename: file,
          url: `/uploads/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    }

    // Sort by created date descending
    imageFiles.sort((a, b) => b.created - a.created);

    return res.status(200).json({
      success: true,
      data: imageFiles,
      total: imageFiles.length
    });

  } catch (error) {
    console.error('[Upload] Error listing:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách ảnh',
      error: error.message
    });
  }
};
