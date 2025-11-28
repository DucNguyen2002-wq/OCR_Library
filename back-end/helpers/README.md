# Helpers

Thư mục chứa các helper functions/utilities được sử dụng trong nhiều modules khác nhau.

## Files

### bookHelpers.js
Helper functions liên quan đến xử lý dữ liệu sách.

**Chức năng:**
- Parse và validate book data
- Format book information
- Helper methods cho book operations

**Sử dụng:**
```javascript
const bookHelpers = require('./helpers/bookHelpers');

// Sử dụng helper functions
const formattedBook = bookHelpers.formatBookData(rawData);
```

**Được sử dụng bởi:**
- `controllers/bookController.js` - CRUD operations
- OCR module - Parse OCR results
- Validation middleware

---

## Quy tắc khi thêm helper mới

### 1. Tổ chức file
- **Một file cho một domain:** Mỗi file helper nên focus vào một domain cụ thể
  - `bookHelpers.js` - Book-related utilities
  - `userHelpers.js` - User-related utilities
  - `dateHelpers.js` - Date formatting/parsing
  - `stringHelpers.js` - String manipulation

### 2. Function naming
- **Descriptive names:** Sử dụng động từ + danh từ
  ```javascript
  // Good
  formatBookTitle(title)
  validateISBN(isbn)
  parseAuthors(authorString)
  
  // Bad
  format(data)
  check(value)
  process(input)
  ```

### 3. Pure functions
- Helper functions nên là **pure functions** (không side effects)
- Không modify parameters trực tiếp
- Return new values thay vì mutate

```javascript
// Good - Pure function
function formatAuthors(authors) {
  return authors.map(a => a.trim());
}

// Bad - Mutates input
function formatAuthors(authors) {
  authors.forEach((a, i) => authors[i] = a.trim());
  return authors;
}
```

### 4. Documentation
Mỗi helper function cần có JSDoc comment:

```javascript
/**
 * Format book title to proper case
 * @param {string} title - Raw book title
 * @returns {string} Formatted title
 * @example
 * formatBookTitle("đắc nhân tâm") // => "Đắc Nhân Tâm"
 */
function formatBookTitle(title) {
  // implementation
}
```

### 5. Testing
- Helper functions dễ test vì là pure functions
- Viết unit tests cho mỗi helper
- Test edge cases (null, undefined, empty string, etc.)

### 6. Export pattern
```javascript
// bookHelpers.js
function formatBookTitle(title) { /* ... */ }
function validateISBN(isbn) { /* ... */ }
function parseAuthors(authorString) { /* ... */ }

// Export tất cả functions
module.exports = {
  formatBookTitle,
  validateISBN,
  parseAuthors
};
```

---

## Ví dụ Helper Function Template

```javascript
/**
 * @fileoverview Helper functions for [domain]
 * @module helpers/[domainHelpers]
 */

/**
 * Description of what this function does
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} When validation fails
 */
function helperFunction(paramName) {
  // Validate input
  if (!paramName) {
    throw new Error('paramName is required');
  }
  
  // Process
  const result = /* ... */;
  
  // Return
  return result;
}

module.exports = {
  helperFunction
};
```

---

## Khi nào nên tạo helper function?

✅ **Nên tạo khi:**
- Logic được sử dụng ở nhiều nơi (DRY principle)
- Function không phụ thuộc vào context/state cụ thể
- Logic phức tạp cần tách riêng để dễ test
- Cần reuse trong nhiều modules

❌ **Không nên tạo khi:**
- Logic chỉ dùng 1 lần duy nhất
- Function strongly coupled với một controller/service cụ thể
- Logic quá đơn giản (1-2 dòng code)

---

## Best Practices

1. **Keep it simple:** Mỗi helper chỉ làm 1 việc
2. **No dependencies:** Helpers không nên depend vào models, controllers
3. **Stateless:** Không lưu state trong helper modules
4. **Error handling:** Throw errors rõ ràng với message cụ thể
5. **Performance:** Optimize cho performance nếu helper được gọi nhiều
6. **Naming consistency:** Sử dụng naming conventions nhất quán
