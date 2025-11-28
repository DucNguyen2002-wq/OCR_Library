require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const Book = require('./models/Book');
const User = require('./models/User');

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: 'cloudinary://738911351824696:ZXQlD-LU2GcRnjGVbXMWOLtqNyY@dbrickzsk'
});

// Helper function to extract image URL from Google Images URL
function extractImageUrl(googleUrl) {
  if (!googleUrl) return null;
  
  try {
    // Extract imgurl parameter from Google Images URL
    const match = googleUrl.match(/imgurl=([^&]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    
    // If it's already a direct URL
    if (googleUrl.startsWith('http') && !googleUrl.includes('google.com')) {
      return googleUrl;
    }
  } catch (error) {
    console.error('Error extracting image URL:', error.message);
  }
  
  return null;
}

// Helper function to upload image to Cloudinary
async function uploadImageToCloudinary(imageUrl, bookTitle) {
  try {
    console.log(`📤 Uploading image for: ${bookTitle}`);
    console.log(`   URL: ${imageUrl}`);
    
    // Upload directly from URL
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'book-covers',
      public_id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource_type: 'image',
      timeout: 60000
    });
    
    console.log(`✅ Uploaded successfully: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image for ${bookTitle}:`, error.message);
    // Return original URL if upload fails
    return imageUrl;
  }
}

// Helper function to parse authors
function parseAuthors(authorString) {
  if (!authorString) return [];
  
  // Split by common separators
  const authors = authorString
    .split(/[,;\/]/)
    .map(author => author.trim())
    .filter(author => author.length > 0);
  
  return authors;
}

// Main seeding function
async function seedBooksFromExcel() {
  try {
    console.log('🚀 Starting book seeding process...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Read Excel file
    const excelPath = path.join(__dirname, 'Op2.xlsx');
    console.log(`📖 Reading Excel file: ${excelPath}`);
    
    if (!fs.existsSync(excelPath)) {
      throw new Error('Excel file Op2.xlsx not found!');
    }
    
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`✅ Found ${data.length} books in Excel file\n`);
    
    // Get a default user for created_by field
    let defaultUser = await User.findOne({ role: 'admin' });
    if (!defaultUser) {
      defaultUser = await User.findOne();
    }
    
    if (!defaultUser) {
      console.log('⚠️  No users found. Creating default admin user...');
      const bcrypt = require('bcrypt');
      defaultUser = await User.create({
        username: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
      console.log('✅ Default admin user created\n');
    }
    
    const createdById = defaultUser._id.toString();
    
    // Clear existing books (optional - comment out if you want to keep existing books)
    // console.log('🗑️  Clearing existing books...');
    // await Book.deleteMany({});
    // console.log('✅ Cleared existing books\n');
    
    let successCount = 0;
    let failCount = 0;
    
    // Process each book - process all books from Excel
    const booksToProcess = data.length;
    
    for (let i = 0; i < booksToProcess; i++) {
      const row = data[i];
      console.log(`\n📚 Processing book ${i + 1}/${booksToProcess}: ${row['Title'] || row['Tên sách'] || row.title || 'Unknown'}`);
      
      try {
        // Extract data from Excel row (adjust column names based on your Excel file)
        const bookData = {
          title: row['Title'] || row['Tên sách'] || row.title,
          isbn: row['ISBN'] || row.isbn || `ISBN${Date.now()}${i}`,
          publisher: row['Publisher'] || row['Nhà xuất bản'] || row.publisher || 'Chưa rõ NXB',
          year_published: parseInt(row['Publish Year'] || row['Năm xuất bản'] || row.year || new Date().getFullYear()),
          description: row['Category'] || row['Mô tả'] || row.description || 'Chưa có mô tả',
          authors: parseAuthors(row['Author'] || row['Tác giả'] || row.authors || ''),
          created_by: createdById,
          status: 'published',
          approval_status: 'approved',
          approved_by: createdById,
          approved_at: new Date()
        };
        
        // Handle cover image - extract from Google Images URL
        const googleUrl = row['URL'] || row['Link ảnh'] || row.cover || row.image;
        
        if (googleUrl) {
          const imageUrl = extractImageUrl(googleUrl);
          
          if (imageUrl) {
            console.log(`   Extracted image URL: ${imageUrl.substring(0, 80)}...`);
            // Upload to Cloudinary
            const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, bookData.title);
            bookData.cover_front_url = cloudinaryUrl;
          } else {
            console.log(`   ⚠️  Could not extract image URL from: ${googleUrl.substring(0, 80)}...`);
          }
        }
        
        // Check if book already exists (by ISBN)
        const existingBook = await Book.findOne({ isbn: bookData.isbn });
        
        if (existingBook) {
          console.log(`⚠️  Book with ISBN ${bookData.isbn} already exists. Updating...`);
          await Book.findByIdAndUpdate(existingBook._id, bookData);
          console.log(`✅ Updated: ${bookData.title}`);
        } else {
          await Book.create(bookData);
          console.log(`✅ Created: ${bookData.title}`);
        }
        
        successCount++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing book ${i + 1}:`, error.message);
        failCount++;
      }
    }
    
    console.log('\n\n=================================');
    console.log('📊 SEEDING SUMMARY');
    console.log('=================================');
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📚 Total: ${data.length}`);
    console.log('=================================\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
  }
}

// Run the seeding function
seedBooksFromExcel();
