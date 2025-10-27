const mongoose = require('mongoose');
const Book = require('./models/Book');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb+srv://2000005:0GYQlUpOAhup1Azj@webocr.irbr7kd.mongodb.net/WebDatabase')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateImagesToCloudinary() {
  try {
    console.log('🔍 Finding books with local image URLs...');
    
    // Find all books with local URLs (starting with /uploads/)
    const books = await Book.find({
      $or: [
        { cover_front_url: { $regex: '^/uploads/' } },
        { cover_inner_url: { $regex: '^/uploads/' } },
        { cover_back_url: { $regex: '^/uploads/' } }
      ]
    });

    console.log(`📚 Found ${books.length} books with local images`);

    if (books.length === 0) {
      console.log('✅ No books to migrate');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (const book of books) {
      console.log(`\n📖 Processing: ${book.title} (${book._id})`);

      const uploadToCloudinary = async (imageUrl) => {
        if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
          return imageUrl; // Already Cloudinary or empty
        }

        try {
          const localPath = path.join(__dirname, 'public', imageUrl);
          
          if (!fs.existsSync(localPath)) {
            console.log(`  ⚠️  File not found: ${localPath}`);
            return imageUrl;
          }

          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(localPath, {
            folder: 'book-covers',
            public_id: `book_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            overwrite: true,
          });

          console.log(`  ✅ Uploaded: ${imageUrl} -> ${result.secure_url}`);

          // Delete local file
          try {
            fs.unlinkSync(localPath);
            console.log(`  🗑️  Deleted local: ${localPath}`);
          } catch (deleteErr) {
            console.error(`  ⚠️  Could not delete: ${deleteErr.message}`);
          }

          return result.secure_url;
        } catch (uploadErr) {
          console.error(`  ❌ Upload error: ${uploadErr.message}`);
          return imageUrl;
        }
      };

      try {
        // Upload all images
        if (book.cover_front_url && book.cover_front_url.startsWith('/uploads/')) {
          book.cover_front_url = await uploadToCloudinary(book.cover_front_url);
        }
        if (book.cover_inner_url && book.cover_inner_url.startsWith('/uploads/')) {
          book.cover_inner_url = await uploadToCloudinary(book.cover_inner_url);
        }
        if (book.cover_back_url && book.cover_back_url.startsWith('/uploads/')) {
          book.cover_back_url = await uploadToCloudinary(book.cover_back_url);
        }

        await book.save();
        successCount++;
        console.log(`  ✅ Saved book: ${book.title}`);
      } catch (err) {
        failCount++;
        console.error(`  ❌ Error saving book: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

// Run migration
migrateImagesToCloudinary();
