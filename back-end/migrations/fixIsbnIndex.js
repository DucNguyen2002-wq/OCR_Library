/**
 * Migration Script: Fix ISBN Unique Index
 * 
 * Problem: MongoDB has unique index on isbn field that doesn't allow multiple null values
 * Solution: Drop old index and create sparse unique index
 * 
 * Run: node back-end/migrations/fixIsbnIndex.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function fixIsbnIndex() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const booksCollection = db.collection('books');

    // Step 1: Check existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await booksCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index)}`);
    });

    // Step 2: Drop old isbn index if exists
    try {
      console.log('\n🗑️  Dropping old isbn_1 index...');
      await booksCollection.dropIndex('isbn_1');
      console.log('✅ Dropped old isbn_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index isbn_1 does not exist, skipping...');
      } else {
        console.error('⚠️  Error dropping isbn_1:', error.message);
      }
    }

    // Step 2.5: Drop isbn_1_sparse index if exists
    try {
      console.log('\n🗑️  Dropping isbn_1_sparse index...');
      await booksCollection.dropIndex('isbn_1_sparse');
      console.log('✅ Dropped isbn_1_sparse index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index isbn_1_sparse does not exist, skipping...');
      } else {
        console.error('⚠️  Error dropping isbn_1_sparse:', error.message);
      }
    }

    // Step 3: Create new NON-UNIQUE index on isbn (just for query performance)
    console.log('\n🔨 Creating new non-unique index on isbn...');
    await booksCollection.createIndex(
      { isbn: 1 }, 
      { 
        name: 'isbn_1_index',
        sparse: true  // Only index documents that have isbn field
      }
    );
    console.log('✅ Created non-unique index on isbn');

    // Step 4: Verify new indexes
    console.log('\n📋 Updated indexes:');
    const newIndexes = await booksCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index)}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Notes:');
    console.log('   - ISBN field can now be null for multiple documents');
    console.log('   - ISBN is NOT enforced as unique (allows duplicates)');
    console.log('   - Non-unique index created for query performance');
    console.log('   - Restart your server to apply changes');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
fixIsbnIndex();
