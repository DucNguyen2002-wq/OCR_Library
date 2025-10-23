// Sample books data - 100 books
export const sampleBooks = [
  // Programming & Technology (25 books)
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Lập trình", publishYear: "2008", publisher: "Prentice Hall", description: "A Handbook of Agile Software Craftsmanship", language: "English", pages: 464, rating: 5, readingStatus: "read" },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", isbn: "978-0135957059", category: "Lập trình", publishYear: "2019", publisher: "Addison-Wesley", description: "Your Journey to Mastery", language: "English", pages: 352, rating: 5, readingStatus: "read" },
  { title: "Design Patterns", author: "Erich Gamma", isbn: "978-0201633610", category: "Lập trình", publishYear: "1994", publisher: "Addison-Wesley", description: "Elements of Reusable Object-Oriented Software", language: "English", pages: 416, rating: 5, readingStatus: "reading" },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", category: "Lập trình", publishYear: "2009", publisher: "MIT Press", description: "Comprehensive introduction to algorithms", language: "English", pages: 1312, rating: 4, readingStatus: "reading" },
  { title: "Code Complete", author: "Steve McConnell", isbn: "978-0735619678", category: "Lập trình", publishYear: "2004", publisher: "Microsoft Press", description: "A Practical Handbook of Software Construction", language: "English", pages: 960, rating: 5, readingStatus: "read" },
  { title: "Refactoring", author: "Martin Fowler", isbn: "978-0134757599", category: "Lập trình", publishYear: "2018", publisher: "Addison-Wesley", description: "Improving the Design of Existing Code", language: "English", pages: 448, rating: 4, readingStatus: "toRead" },
  { title: "You Don't Know JS", author: "Kyle Simpson", isbn: "978-1491924464", category: "Lập trình", publishYear: "2015", publisher: "O'Reilly Media", description: "Scope & Closures", language: "English", pages: 98, rating: 4, readingStatus: "read" },
  { title: "Eloquent JavaScript", author: "Marijn Haverbeke", isbn: "978-1593279509", category: "Lập trình", publishYear: "2018", publisher: "No Starch Press", description: "A Modern Introduction to Programming", language: "English", pages: 472, rating: 5, readingStatus: "reading" },
  { title: "Learning React", author: "Alex Banks", isbn: "978-1492051718", category: "Lập trình", publishYear: "2020", publisher: "O'Reilly Media", description: "Modern Patterns for Developing React Apps", language: "English", pages: 310, rating: 4, readingStatus: "read" },
  { title: "Python Crash Course", author: "Eric Matthes", isbn: "978-1593279288", category: "Lập trình", publishYear: "2019", publisher: "No Starch Press", description: "A Hands-On, Project-Based Introduction to Programming", language: "English", pages: 544, rating: 5, readingStatus: "read" },
  { title: "Head First Java", author: "Kathy Sierra", isbn: "978-0596009205", category: "Lập trình", publishYear: "2005", publisher: "O'Reilly Media", description: "A Brain-Friendly Guide", language: "English", pages: 720, rating: 4, readingStatus: "toRead" },
  { title: "Effective Java", author: "Joshua Bloch", isbn: "978-0134685991", category: "Lập trình", publishYear: "2017", publisher: "Addison-Wesley", description: "Programming Language Guide", language: "English", pages: 416, rating: 5, readingStatus: "reading" },
  { title: "The Clean Coder", author: "Robert C. Martin", isbn: "978-0137081073", category: "Lập trình", publishYear: "2011", publisher: "Prentice Hall", description: "A Code of Conduct for Professional Programmers", language: "English", pages: 256, rating: 4, readingStatus: "read" },
  { title: "JavaScript: The Good Parts", author: "Douglas Crockford", isbn: "978-0596517748", category: "Lập trình", publishYear: "2008", publisher: "O'Reilly Media", description: "Unearthing the Excellence in JavaScript", language: "English", pages: 176, rating: 4, readingStatus: "read" },
  { title: "Node.js Design Patterns", author: "Mario Casciaro", isbn: "978-1839214110", category: "Lập trình", publishYear: "2020", publisher: "Packt Publishing", description: "Design and implement production-grade Node.js applications", language: "English", pages: 664, rating: 4, readingStatus: "toRead" },
  { title: "Full Stack React", author: "Anthony Accomazzo", isbn: "978-0991344628", category: "Lập trình", publishYear: "2017", publisher: "Fullstack.io", description: "The Complete Guide to ReactJS and Friends", language: "English", pages: 836, rating: 4, readingStatus: "reading" },
  { title: "CSS Secrets", author: "Lea Verou", isbn: "978-1449372637", category: "Lập trình", publishYear: "2015", publisher: "O'Reilly Media", description: "Better Solutions to Everyday Web Design Problems", language: "English", pages: 372, rating: 3, readingStatus: "toRead" },
  { title: "SQL Performance Explained", author: "Markus Winand", isbn: "978-3950307825", category: "Lập trình", publishYear: "2012", publisher: "Markus Winand", description: "Everything Developers Need to Know about SQL Performance", language: "English", pages: 204, rating: 5, readingStatus: "read" },
  { title: "Docker Deep Dive", author: "Nigel Poulton", isbn: "978-1521822807", category: "Lập trình", publishYear: "2018", publisher: "Nigel Poulton", description: "Zero to Docker in a single book", language: "English", pages: 282, rating: 4, readingStatus: "reading" },
  { title: "Kubernetes in Action", author: "Marko Luksa", isbn: "978-1617293726", category: "Lập trình", publishYear: "2017", publisher: "Manning Publications", description: "Automating container infrastructure", language: "English", pages: 624, rating: 5, readingStatus: "toRead" },
  { title: "Git Pocket Guide", author: "Richard E. Silverman", isbn: "978-1449325862", category: "Lập trình", publishYear: "2013", publisher: "O'Reilly Media", description: "A Working Introduction", language: "English", pages: 234, rating: 3, readingStatus: "read" },
  { title: "HTTP: The Definitive Guide", author: "David Gourley", isbn: "978-1565925090", category: "Lập trình", publishYear: "2002", publisher: "O'Reilly Media", description: "The Definitive Guide", language: "English", pages: 658, rating: 4, readingStatus: "toRead" },
  { title: "RESTful Web APIs", author: "Leonard Richardson", isbn: "978-1449358068", category: "Lập trình", publishYear: "2013", publisher: "O'Reilly Media", description: "Services for a Changing World", language: "English", pages: 406, rating: 4, readingStatus: "reading" },
  { title: "Building Microservices", author: "Sam Newman", isbn: "978-1491950357", category: "Lập trình", publishYear: "2015", publisher: "O'Reilly Media", description: "Designing Fine-Grained Systems", language: "English", pages: 280, rating: 5, readingStatus: "read" },
  { title: "Web Development with Node and Express", author: "Ethan Brown", isbn: "978-1492053514", category: "Lập trình", publishYear: "2019", publisher: "O'Reilly Media", description: "Leveraging the JavaScript Stack", language: "English", pages: 370, rating: 4, readingStatus: "toRead" },

  // Vietnamese Literature (20 books)
  { title: "Đắc Nhân Tâm", author: "Dale Carnegie", isbn: "978-8935235537", category: "Kỹ năng sống", publishYear: "2016", publisher: "NXB Tổng Hợp TPHCM", description: "How to Win Friends and Influence People", language: "Tiếng Việt", pages: 320, rating: 5, readingStatus: "read" },
  { title: "Nhà Giả Kim", author: "Paulo Coelho", isbn: "978-8935235859", category: "Tiểu thuyết", publishYear: "2020", publisher: "NXB Hội Nhà Văn", description: "The Alchemist", language: "Tiếng Việt", pages: 227, rating: 5, readingStatus: "read" },
  { title: "Tuổi Trẻ Đáng Giá Bao Nhiêu", author: "Rosie Nguyễn", isbn: "978-8935235780", category: "Kỹ năng sống", publishYear: "2018", publisher: "NXB Hội Nhà Văn", description: "Dành cho giới trẻ Việt Nam", language: "Tiếng Việt", pages: 280, rating: 4, readingStatus: "read" },
  { title: "Cà Phê Cùng Tony", author: "Tony Buổi Sáng", isbn: "978-8935236448", category: "Kỹ năng sống", publishYear: "2019", publisher: "NXB Trẻ", description: "Những bài học cuộc sống", language: "Tiếng Việt", pages: 256, rating: 4, readingStatus: "reading" },
  { title: "Sapiens: Lược Sử Loài Người", author: "Yuval Noah Harari", isbn: "978-8935235984", category: "Lịch sử", publishYear: "2018", publisher: "NXB Trẻ", description: "A Brief History of Humankind", language: "Tiếng Việt", pages: 543, rating: 5, readingStatus: "reading" },
  { title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", author: "Nguyễn Nhật Ánh", isbn: "978-8934974234", category: "Tiểu thuyết", publishYear: "2017", publisher: "NXB Trẻ", description: "Tuổi thơ dữ dội và phơi phới", language: "Tiếng Việt", pages: 368, rating: 5, readingStatus: "read" },
  { title: "Mắt Biếc", author: "Nguyễn Nhật Ánh", isbn: "978-8934974371", category: "Tiểu thuyết", publishYear: "2018", publisher: "NXB Trẻ", description: "Chuyện tình buồn", language: "Tiếng Việt", pages: 272, rating: 5, readingStatus: "read" },
  { title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ", author: "Nguyễn Nhật Ánh", isbn: "978-8934974517", category: "Tiểu thuyết", publishYear: "2019", publisher: "NXB Trẻ", description: "Hồi ức tuổi thơ", language: "Tiếng Việt", pages: 296, rating: 4, readingStatus: "reading" },
  { title: "Cây Cam Ngọt Của Tôi", author: "José Mauro de Vasconcelos", isbn: "978-8935235896", category: "Tiểu thuyết", publishYear: "2020", publisher: "NXB Hội Nhà Văn", description: "Câu chuyện cảm động", language: "Tiếng Việt", pages: 235, rating: 5, readingStatus: "read" },
  { title: "Không Diệt Không Sinh Đừng Sợ Hãi", author: "Thích Nhất Hạnh", isbn: "978-8935086821", category: "Tâm linh", publishYear: "2017", publisher: "NXB Tôn Giáo", description: "Phật pháp ứng dụng", language: "Tiếng Việt", pages: 176, rating: 4, readingStatus: "toRead" },
  { title: "7 Thói Quen Của Người Thành Đạt", author: "Stephen Covey", isbn: "978-8935235674", category: "Kỹ năng sống", publishYear: "2019", publisher: "NXB Tổng Hợp TPHCM", description: "The 7 Habits of Highly Effective People", language: "Tiếng Việt", pages: 432, rating: 5, readingStatus: "read" },
  { title: "Nghĩ Giàu Làm Giàu", author: "Napoleon Hill", isbn: "978-8935235742", category: "Kỹ năng sống", publishYear: "2018", publisher: "NXB Lao Động", description: "Think and Grow Rich", language: "Tiếng Việt", pages: 384, rating: 4, readingStatus: "reading" },
  { title: "Dám Nghĩ Lớn", author: "David Schwartz", isbn: "978-8935236523", category: "Kỹ năng sống", publishYear: "2020", publisher: "NXB Trẻ", description: "The Magic of Thinking Big", language: "Tiếng Việt", pages: 336, rating: 4, readingStatus: "toRead" },
  { title: "Quẳng Gánh Lo Đi Và Vui Sống", author: "Dale Carnegie", isbn: "978-8935235612", category: "Kỹ năng sống", publishYear: "2017", publisher: "NXB Tổng Hợp TPHCM", description: "How to Stop Worrying and Start Living", language: "Tiếng Việt", pages: 368, rating: 5, readingStatus: "read" },
  { title: "Con Chim Xanh Biếc Bay Về", author: "Nguyễn Nhật Ánh", isbn: "978-8934974654", category: "Tiểu thuyết", publishYear: "2021", publisher: "NXB Trẻ", description: "Tình yêu tuổi học trò", language: "Tiếng Việt", pages: 312, rating: 4, readingStatus: "reading" },
  { title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài", isbn: "978-8934974098", category: "Thiếu nhi", publishYear: "2016", publisher: "NXB Kim Đồng", description: "Văn học thiếu nhi kinh điển", language: "Tiếng Việt", pages: 188, rating: 5, readingStatus: "read" },
  { title: "Số Đỏ", author: "Vũ Trọng Phụng", isbn: "978-8935071063", category: "Tiểu thuyết", publishYear: "2015", publisher: "NXB Văn Học", description: "Phê phán xã hội", language: "Tiếng Việt", pages: 256, rating: 4, readingStatus: "toRead" },
  { title: "Lão Hạc", author: "Nam Cao", isbn: "978-8935071124", category: "Tiểu thuyết", publishYear: "2016", publisher: "NXB Văn Học", description: "Hiện thực phê phán", language: "Tiếng Việt", pages: 120, rating: 5, readingStatus: "read" },
  { title: "Chí Phèo", author: "Nam Cao", isbn: "978-8935071187", category: "Tiểu thuyết", publishYear: "2017", publisher: "NXB Văn Học", description: "Tác phẩm kinh điển", language: "Tiếng Việt", pages: 96, rating: 5, readingStatus: "read" },
  { title: "Vợ Nhặt", author: "Kim Lân", isbn: "978-8935071245", category: "Tiểu thuyết", publishYear: "2018", publisher: "NXB Văn Học", description: "Văn học hiện thực", language: "Tiếng Việt", pages: 104, rating: 4, readingStatus: "read" },

  // Business & Economics (15 books)
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", isbn: "978-1612680194", category: "Kinh tế", publishYear: "2017", publisher: "Plata Publishing", description: "What the Rich Teach Their Kids About Money", language: "English", pages: 336, rating: 5, readingStatus: "read" },
  { title: "The Lean Startup", author: "Eric Ries", isbn: "978-0307887894", category: "Kinh doanh", publishYear: "2011", publisher: "Crown Business", description: "How Today's Entrepreneurs Use Continuous Innovation", language: "English", pages: 336, rating: 5, readingStatus: "read" },
  { title: "Zero to One", author: "Peter Thiel", isbn: "978-0804139298", category: "Kinh doanh", publishYear: "2014", publisher: "Crown Business", description: "Notes on Startups, or How to Build the Future", language: "English", pages: 224, rating: 4, readingStatus: "reading" },
  { title: "The 4-Hour Workweek", author: "Timothy Ferriss", isbn: "978-0307465351", category: "Kinh doanh", publishYear: "2009", publisher: "Crown Publishers", description: "Escape 9-5, Live Anywhere", language: "English", pages: 416, rating: 4, readingStatus: "read" },
  { title: "Good to Great", author: "Jim Collins", isbn: "978-0066620992", category: "Kinh doanh", publishYear: "2001", publisher: "HarperBusiness", description: "Why Some Companies Make the Leap and Others Don't", language: "English", pages: 320, rating: 5, readingStatus: "reading" },
  { title: "The Innovator's Dilemma", author: "Clayton Christensen", isbn: "978-1633691780", category: "Kinh doanh", publishYear: "2016", publisher: "Harvard Business Review Press", description: "When New Technologies Cause Great Firms to Fail", language: "English", pages: 336, rating: 4, readingStatus: "toRead" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "978-0374533557", category: "Tâm lý học", publishYear: "2011", publisher: "Farrar, Straus and Giroux", description: "Two Systems That Drive the Way We Think", language: "English", pages: 499, rating: 5, readingStatus: "read" },
  { title: "The E-Myth Revisited", author: "Michael Gerber", isbn: "978-0887307287", category: "Kinh doanh", publishYear: "1995", publisher: "HarperCollins", description: "Why Most Small Businesses Don't Work", language: "English", pages: 288, rating: 4, readingStatus: "toRead" },
  { title: "Blue Ocean Strategy", author: "W. Chan Kim", isbn: "978-1625274496", category: "Kinh doanh", publishYear: "2015", publisher: "Harvard Business Review Press", description: "How to Create Uncontested Market Space", language: "English", pages: 287, rating: 4, readingStatus: "reading" },
  { title: "The Hard Thing About Hard Things", author: "Ben Horowitz", isbn: "978-0062273208", category: "Kinh doanh", publishYear: "2014", publisher: "Harper Business", description: "Building a Business When There Are No Easy Answers", language: "English", pages: 304, rating: 5, readingStatus: "read" },
  { title: "Start with Why", author: "Simon Sinek", isbn: "978-1591846444", category: "Kinh doanh", publishYear: "2009", publisher: "Portfolio", description: "How Great Leaders Inspire Everyone to Take Action", language: "English", pages: 256, rating: 4, readingStatus: "read" },
  { title: "Atomic Habits", author: "James Clear", isbn: "978-0735211292", category: "Kỹ năng sống", publishYear: "2018", publisher: "Avery", description: "An Easy & Proven Way to Build Good Habits", language: "English", pages: 320, rating: 5, readingStatus: "reading" },
  { title: "The Intelligent Investor", author: "Benjamin Graham", isbn: "978-0060555665", category: "Kinh tế", publishYear: "2006", publisher: "HarperBusiness", description: "The Definitive Book on Value Investing", language: "English", pages: 640, rating: 5, readingStatus: "toRead" },
  { title: "Freakonomics", author: "Steven Levitt", isbn: "978-0061234002", category: "Kinh tế", publishYear: "2009", publisher: "William Morrow", description: "A Rogue Economist Explores the Hidden Side of Everything", language: "English", pages: 336, rating: 4, readingStatus: "read" },
  { title: "Predictably Irrational", author: "Dan Ariely", isbn: "978-0061353246", category: "Tâm lý học", publishYear: "2008", publisher: "HarperCollins", description: "The Hidden Forces That Shape Our Decisions", language: "English", pages: 384, rating: 4, readingStatus: "reading" },

  // Science & Technology (15 books)
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", category: "Khoa học", publishYear: "1998", publisher: "Bantam", description: "From the Big Bang to Black Holes", language: "English", pages: 256, rating: 5, readingStatus: "read" },
  { title: "The Selfish Gene", author: "Richard Dawkins", isbn: "978-0198788607", category: "Khoa học", publishYear: "2016", publisher: "Oxford University Press", description: "40th Anniversary Edition", language: "English", pages: 496, rating: 5, readingStatus: "reading" },
  { title: "Cosmos", author: "Carl Sagan", isbn: "978-0345539434", category: "Khoa học", publishYear: "2013", publisher: "Ballantine Books", description: "A Personal Voyage", language: "English", pages: 384, rating: 5, readingStatus: "read" },
  { title: "The Gene", author: "Siddhartha Mukherjee", isbn: "978-1476733524", category: "Khoa học", publishYear: "2016", publisher: "Scribner", description: "An Intimate History", language: "English", pages: 608, rating: 4, readingStatus: "toRead" },
  { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", isbn: "978-0393609394", category: "Khoa học", publishYear: "2017", publisher: "W. W. Norton & Company", description: "What You Need to Know", language: "English", pages: 144, rating: 4, readingStatus: "read" },
  { title: "The Emperor of All Maladies", author: "Siddhartha Mukherjee", isbn: "978-1439170915", category: "Khoa học", publishYear: "2010", publisher: "Scribner", description: "A Biography of Cancer", language: "English", pages: 592, rating: 5, readingStatus: "reading" },
  { title: "The Code Breaker", author: "Walter Isaacson", isbn: "978-1982115852", category: "Khoa học", publishYear: "2021", publisher: "Simon & Schuster", description: "Jennifer Doudna, Gene Editing, and the Future of the Human Race", language: "English", pages: 560, rating: 4, readingStatus: "toRead" },
  { title: "Homo Deus", author: "Yuval Noah Harari", isbn: "978-0062464316", category: "Khoa học", publishYear: "2017", publisher: "Harper", description: "A Brief History of Tomorrow", language: "English", pages: 464, rating: 4, readingStatus: "reading" },
  { title: "The Structure of Scientific Revolutions", author: "Thomas Kuhn", isbn: "978-0226458113", category: "Khoa học", publishYear: "2012", publisher: "University of Chicago Press", description: "50th Anniversary Edition", language: "English", pages: 264, rating: 5, readingStatus: "read" },
  { title: "Quantum Physics for Beginners", author: "Carl J. Pratt", isbn: "978-1648450013", category: "Khoa học", publishYear: "2021", publisher: "Simple Guide Press", description: "From Wave Theory to Quantum Computing", language: "English", pages: 320, rating: 3, readingStatus: "toRead" },
  { title: "The Origin of Species", author: "Charles Darwin", isbn: "978-1503264618", category: "Khoa học", publishYear: "2020", publisher: "CreateSpace", description: "By Means of Natural Selection", language: "English", pages: 502, rating: 5, readingStatus: "read" },
  { title: "The Double Helix", author: "James Watson", isbn: "978-0743216302", category: "Khoa học", publishYear: "2001", publisher: "Touchstone", description: "A Personal Account of the Discovery of the Structure of DNA", language: "English", pages: 256, rating: 4, readingStatus: "read" },
  { title: "The Elegant Universe", author: "Brian Greene", isbn: "978-0393338102", category: "Khoa học", publishYear: "2010", publisher: "W. W. Norton & Company", description: "Superstrings, Hidden Dimensions, and the Quest for the Ultimate Theory", language: "English", pages: 464, rating: 4, readingStatus: "toRead" },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", isbn: "978-1400052189", category: "Khoa học", publishYear: "2010", publisher: "Crown Publishing", description: "The Story Behind Medical Research", language: "English", pages: 384, rating: 5, readingStatus: "reading" },
  { title: "What If?", author: "Randall Munroe", isbn: "978-0544272996", category: "Khoa học", publishYear: "2014", publisher: "Houghton Mifflin Harcourt", description: "Serious Scientific Answers to Absurd Hypothetical Questions", language: "English", pages: 320, rating: 4, readingStatus: "read" },

  // Fiction & Literature (15 books)
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", category: "Văn học", publishYear: "2006", publisher: "Harper Perennial", description: "Classic American Literature", language: "English", pages: 336, rating: 5, readingStatus: "read" },
  { title: "1984", author: "George Orwell", isbn: "978-0451524935", category: "Văn học", publishYear: "1961", publisher: "Signet Classic", description: "Dystopian Social Science Fiction", language: "English", pages: 328, rating: 5, readingStatus: "read" },
  { title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", category: "Văn học", publishYear: "2002", publisher: "Penguin Classics", description: "Romance Classic", language: "English", pages: 480, rating: 5, readingStatus: "read" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", category: "Văn học", publishYear: "2004", publisher: "Scribner", description: "Jazz Age Novel", language: "English", pages: 180, rating: 5, readingStatus: "read" },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", isbn: "978-0439708180", category: "Giả tưởng", publishYear: "1998", publisher: "Scholastic", description: "The Boy Who Lived", language: "English", pages: 309, rating: 5, readingStatus: "read" },
  { title: "The Lord of the Rings", author: "J.R.R. Tolkien", isbn: "978-0544003415", category: "Giả tưởng", publishYear: "2012", publisher: "Mariner Books", description: "Epic High Fantasy", language: "English", pages: 1178, rating: 5, readingStatus: "reading" },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0316769174", category: "Văn học", publishYear: "1991", publisher: "Little, Brown and Company", description: "Coming of Age Story", language: "English", pages: 277, rating: 4, readingStatus: "read" },
  { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227", category: "Giả tưởng", publishYear: "2012", publisher: "Mariner Books", description: "There and Back Again", language: "English", pages: 366, rating: 5, readingStatus: "read" },
  { title: "Brave New World", author: "Aldous Huxley", isbn: "978-0060850524", category: "Văn học", publishYear: "2006", publisher: "Harper Perennial", description: "Dystopian Novel", language: "English", pages: 268, rating: 4, readingStatus: "toRead" },
  { title: "Animal Farm", author: "George Orwell", isbn: "978-0452284244", category: "Văn học", publishYear: "1996", publisher: "Signet Classic", description: "Political Satire", language: "English", pages: 141, rating: 4, readingStatus: "read" },
  { title: "The Chronicles of Narnia", author: "C.S. Lewis", isbn: "978-0066238500", category: "Giả tưởng", publishYear: "2001", publisher: "HarperCollins", description: "Seven Fantasy Novels", language: "English", pages: 767, rating: 5, readingStatus: "reading" },
  { title: "Moby-Dick", author: "Herman Melville", isbn: "978-1503280786", category: "Văn học", publishYear: "2019", publisher: "CreateSpace", description: "Or, The Whale", language: "English", pages: 654, rating: 4, readingStatus: "toRead" },
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0062315007", category: "Văn học", publishYear: "2014", publisher: "HarperOne", description: "A Fable About Following Your Dream", language: "English", pages: 208, rating: 5, readingStatus: "read" },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", isbn: "978-0060883287", category: "Văn học", publishYear: "2006", publisher: "Harper Perennial", description: "Magical Realism", language: "English", pages: 448, rating: 5, readingStatus: "reading" },
  { title: "The Book Thief", author: "Markus Zusak", isbn: "978-0375842207", category: "Văn học", publishYear: "2007", publisher: "Knopf Books", description: "Historical Fiction", language: "English", pages: 552, rating: 5, readingStatus: "read" },

  // History & Biography (10 books)
  { title: "The Diary of a Young Girl", author: "Anne Frank", isbn: "978-0553296983", category: "Lịch sử", publishYear: "1993", publisher: "Bantam", description: "Anne Frank's Diary", language: "English", pages: 283, rating: 5, readingStatus: "read" },
  { title: "Steve Jobs", author: "Walter Isaacson", isbn: "978-1451648539", category: "Tiểu sử", publishYear: "2011", publisher: "Simon & Schuster", description: "The Biography", language: "English", pages: 656, rating: 5, readingStatus: "read" },
  { title: "Educated", author: "Tara Westover", isbn: "978-0399590504", category: "Tiểu sử", publishYear: "2018", publisher: "Random House", description: "A Memoir", language: "English", pages: 352, rating: 5, readingStatus: "reading" },
  { title: "The Wright Brothers", author: "David McCullough", isbn: "978-1476728742", category: "Tiểu sử", publishYear: "2015", publisher: "Simon & Schuster", description: "Pioneers of Aviation", language: "English", pages: 336, rating: 4, readingStatus: "read" },
  { title: "Unbroken", author: "Laura Hillenbrand", isbn: "978-0812974492", category: "Tiểu sử", publishYear: "2010", publisher: "Random House", description: "A World War II Story of Survival", language: "English", pages: 496, rating: 5, readingStatus: "read" },
  { title: "Long Walk to Freedom", author: "Nelson Mandela", isbn: "978-0316548182", category: "Tiểu sử", publishYear: "1995", publisher: "Little, Brown and Company", description: "The Autobiography of Nelson Mandela", language: "English", pages: 656, rating: 5, readingStatus: "toRead" },
  { title: "The Guns of August", author: "Barbara W. Tuchman", isbn: "978-0345476098", category: "Lịch sử", publishYear: "2004", publisher: "Ballantine Books", description: "The Outbreak of World War I", language: "English", pages: 606, rating: 4, readingStatus: "reading" },
  { title: "A People's History of the United States", author: "Howard Zinn", isbn: "978-0062397348", category: "Lịch sử", publishYear: "2015", publisher: "Harper Perennial", description: "Alternative History", language: "English", pages: 729, rating: 4, readingStatus: "toRead" },
  { title: "The Rise and Fall of the Third Reich", author: "William Shirer", isbn: "978-1451651683", category: "Lịch sử", publishYear: "2011", publisher: "Simon & Schuster", description: "A History of Nazi Germany", language: "English", pages: 1264, rating: 5, readingStatus: "toRead" },
  { title: "Team of Rivals", author: "Doris Kearns Goodwin", isbn: "978-0743270755", category: "Lịch sử", publishYear: "2005", publisher: "Simon & Schuster", description: "The Political Genius of Abraham Lincoln", language: "English", pages: 944, rating: 5, readingStatus: "reading" }
];

// Helper function to generate books with unique IDs and timestamps
export const generateSampleBooks = () => {
  const startDate = new Date('2023-01-01');
  const endDate = new Date();
  
  return sampleBooks.map((book, index) => {
    // Generate random date between startDate and endDate
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);
    
    return {
      ...book,
      id: Date.now() + index,
      createdAt: randomDate.toISOString()
    };
  });
};

// Get unique categories from sample books
export const getCategories = () => {
  const categories = [...new Set(sampleBooks.map(book => book.category))];
  return categories.sort();
};

// Get unique publishers
export const getPublishers = () => {
  const publishers = [...new Set(sampleBooks.map(book => book.publisher))];
  return publishers.sort();
};

// Get year range
export const getYearRange = () => {
  const years = sampleBooks.map(book => parseInt(book.publishYear)).filter(year => !isNaN(year));
  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
};

// Get unique languages
export const getLanguages = () => {
  const languages = [...new Set(sampleBooks.map(book => book.language))];
  return languages.sort();
};
