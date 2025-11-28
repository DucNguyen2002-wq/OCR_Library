const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect('mongodb+srv://2000005:0GYQlUpOAhup1Azj@webocr.irbr7kd.mongodb.net/WebDatabase')
  .then(async () => {
    const pendingCount = await Book.countDocuments({ approval_status: 'pending' });
    const pendingBooks = await Book.find({ approval_status: 'pending' }).limit(5).lean();
    
    console.log('📊 Total pending books:', pendingCount);
    console.log('\n📖 Sample pending books:');
    pendingBooks.forEach(b => {
      console.log(`  - ${b.title}`);
      console.log(`    ID: ${b._id}`);
      console.log(`    Status: ${b.approval_status}`);
      console.log(`    Created: ${b.createdAt}`);
      console.log('');
    });
    
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
