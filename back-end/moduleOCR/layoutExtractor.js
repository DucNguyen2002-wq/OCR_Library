/**
 * Layout-based Book Info Extractor
 * Trích xuất thông tin sách dựa trên layout/template đã chọn
 */

class LayoutExtractor {
  /**
   * Extract book info based on layout type
   * @param {string} text - OCR text
   * @param {string} layoutType - Layout type (standard, author-first, title-only, full-info)
   * @param {Object} ocrResult - Full OCR result with metadata (lineHeights, largestTextIndices)
   * @returns {Object} - Extracted book info
   */
  extractByLayout(text, layoutType = "standard", ocrResult = null) {
    if (!text) return this.emptyResult();

    // Split by newlines first
    let lines = text.split("\n").filter((line) => line.trim().length > 0);

    // If too few lines, try to split by common separators
    if (lines.length <= 2) {
      console.log(
        "[LayoutExtractor] Few lines detected, trying smart split..."
      );
      lines = this.smartSplitText(text);
    }

    console.log(`[LayoutExtractor] ===== EXTRACTION START =====`);
    console.log(`[LayoutExtractor] Layout type: ${layoutType}`);
    console.log(`[LayoutExtractor] Total lines: ${lines.length}`);
    console.log(`[LayoutExtractor] ALL LINES:`, lines);

    // Log text size information if available
    if (ocrResult && ocrResult.lineHeights) {
      console.log(`[LayoutExtractor] Line heights:`, ocrResult.lineHeights);
      console.log(`[LayoutExtractor] Max height: ${ocrResult.maxHeight}`);
      console.log(
        `[LayoutExtractor] Largest text at lines:`,
        ocrResult.largestTextIndices
      );
    }

    switch (layoutType) {
      case "standard":
        return this.extractStandardLayout(lines, text, ocrResult);
      case "author-first":
        return this.extractAuthorFirstLayout(lines, text, ocrResult);
      case "title-only":
        return this.extractTitleOnlyLayout(lines, text, ocrResult);
      case "full-info":
        return this.extractFullInfoLayout(lines, text, ocrResult);
      default:
        return this.extractStandardLayout(lines, text, ocrResult);
    }
  }

  /**
   * Smart split text when OCR returns single/few lines
   */
  smartSplitText(text) {
    // Try multiple splitting strategies
    let parts = [];

    // Strategy 1: Split by common Vietnamese separators
    parts = text
      .split(/(?:\s{2,}|\t+|(?:Tác giả|tác giả|Author|NXB|Nhà xuất bản|ISBN))/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (parts.length >= 3) {
      console.log("[LayoutExtractor] Split by Vietnamese keywords");
      return parts;
    }

    // Strategy 2: Split by uppercase words (title case)
    const upperCasePattern =
      /([A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ]{2,}[^a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]*)/g;
    const upperMatches = text.match(upperCasePattern);
    if (upperMatches && upperMatches.length >= 2) {
      console.log("[LayoutExtractor] Split by uppercase words");
      return upperMatches.map((m) => m.trim()).filter((m) => m.length > 0);
    }

    // Strategy 3: Fallback - just return the text as single line
    console.log("[LayoutExtractor] Using original text as single line");
    return [text.trim()];
  }

  /**
   * Standard layout: Title → Author → Publisher
   * Title: Largest text (by height) or ALL-CAPS lines
   * Author: One Title Case line (e.g., "Nguyễn Văn A")
   * Publisher: Line containing "NXB" or "Nhà xuất bản"
   */
  extractStandardLayout(lines, text, ocrResult = null) {
    // If only 1 line, try to extract all from that line
    if (lines.length === 1) {
      console.log(
        "[LayoutExtractor] Single line mode - using pattern matching"
      );
      return {
        title: this.findTitle(text),
        author: this.findAuthor(lines, text),
        publisher: this.findPublisher(lines, text),
        year: this.findYear(text),
        isbn: this.findISBN(text),
        layout: "standard-pattern",
      };
    }

    // Get full title (use height data if available, else ALL-CAPS)
    const title = this.getFullTitle(lines, ocrResult);

    // Find author (one Title Case line)
    const author = this.findAuthor(lines, text);

    // Find publisher (line with "NXB" keyword)
    const publisher = this.findPublisher(lines, text);

    return {
      title: title,
      author: author,
      publisher: publisher,
      year: this.findYear(text),
      isbn: this.findISBN(text),
      layout: "standard",
    };
  }

  /**
   * Author-first layout: Author (first line) → Title (largest text) → Publisher
   * Author: Always take the first line (top of cover)
   * Title: Use height-based detection to find all large text (may be multi-line)
   * Publisher: Search for "NXB" keyword
   */
  extractAuthorFirstLayout(lines, text, ocrResult = null) {
    console.log(`[LayoutExtractor] 📖 Author-First Layout Detection`);

    // Author = First line (always)
    const author = lines[0]?.trim() || "";
    console.log(`[LayoutExtractor] 👤 Author (line 0): "${author}"`);

    // Title = Largest text (height-based, multi-line support)
    const title = this.getFullTitle(lines, ocrResult);
    console.log(`[LayoutExtractor] 📕 Title (height-based): "${title}"`);

    // Publisher = Find "NXB" keyword
    const publisher = this.findPublisher(lines, text);
    console.log(`[LayoutExtractor] 🏢 Publisher: "${publisher}"`);

    return {
      author: author,
      title: title || this.extractLineByPosition(lines, 1),
      publisher: publisher || this.extractLineByPosition(lines, 2),
      year: this.findYear(text),
      isbn: this.findISBN(text),
      layout: "author-first",
    };
  }

  /**
   * Title-only layout: Large title spans multiple lines
   * Use getFullTitle with height data to find largest text
   */
  extractTitleOnlyLayout(lines, text, ocrResult = null) {
    // Get full title (use height data if available)
    const title = this.getFullTitle(lines, ocrResult);

    return {
      title: title,
      author: this.findAuthor(lines, text),
      publisher: this.findPublisher(lines, text),
      year: this.findYear(text),
      isbn: this.findISBN(text),
      layout: "title-only",
    };
  }

  /**
   * Full-info layout: All info in order
   */
  extractFullInfoLayout(lines, text, ocrResult = null) {
    return {
      title: this.extractLineByPosition(lines, 0),
      author:
        this.extractLineByPosition(lines, 1) || this.findAuthor(lines, text),
      publisher:
        this.extractLineByPosition(lines, 2) || this.findPublisher(lines, text),
      year: this.extractLineByPosition(lines, 3) || this.findYear(text),
      isbn: this.extractLineByPosition(lines, 4) || this.findISBN(text),
      layout: "full-info",
    };
  }

  /**
   * Extract line by position (with validation)
   */
  extractLineByPosition(lines, index) {
    if (index >= lines.length) return "";

    const line = lines[index].trim();

    // Skip if line is too short or looks like noise
    if (line.length < 2) return "";
    if (/^[^a-zA-ZÀ-ỹĐđ]+$/.test(line)) return ""; // Only special chars/numbers

    // Skip common noise patterns
    if (/^(NATIONAL|BESTSELLER|NEW YORK|TIMES)/i.test(line)) return "";
    if (line.length < 5 && /^[A-Z\s]+$/.test(line)) return ""; // Very short all-caps like "CỦA"

    return line;
  }

  /**
   * Get title by combining largest text (by height) or ALL-CAPS lines
   * Uses OCR text height data if available, otherwise falls back to ALL-CAPS detection
   */
  getFullTitle(lines, ocrResult = null) {
    console.log(
      `[LayoutExtractor] 🔍 getFullTitle called with ocrResult:`,
      ocrResult ? "YES" : "NO"
    );
    if (ocrResult) {
      console.log(
        `[LayoutExtractor] 🔍 Has lineHeights?`,
        ocrResult.lineHeights ? "YES" : "NO"
      );
      console.log(
        `[LayoutExtractor] 🔍 Has maxHeight?`,
        ocrResult.maxHeight ? "YES" : "NO"
      );
    }

    // Strategy 1: Use text height data if available (MOST ACCURATE!)
    if (ocrResult && ocrResult.lineHeights && ocrResult.maxHeight) {
      console.log(`[LayoutExtractor] 🎯 Using HEIGHT-BASED detection`);
      console.log(`[LayoutExtractor] Line heights:`, ocrResult.lineHeights);
      console.log(`[LayoutExtractor] Max height: ${ocrResult.maxHeight}`);

      const threshold = ocrResult.maxHeight * 0.85; // 85% of max height
      console.log(`[LayoutExtractor] Height threshold (85%): ${threshold}`);

      const titleLines = [];
      let foundLargeText = false;

      // Scan ALL lines and collect those with large height
      for (let i = 0; i < lines.length; i++) {
        if (i >= ocrResult.lineHeights.length) break;

        const line = lines[i].trim();
        const height = ocrResult.lineHeights[i];

        console.log(
          `[LayoutExtractor]   Line ${i} (height ${height}): "${line}"`
        );

        // Skip noise patterns
        if (
          /^(NATIONAL|BESTSELLER|NEW\s*YORK|TIMES|BEST\s*SELLER|NA\s*T10)/i.test(
            line
          )
        ) {
          console.log(`[LayoutExtractor]     ❌ Skipped (noise)`);
          continue;
        }

        // Skip very short lines
        if (line.length < 2) {
          console.log(`[LayoutExtractor]     ❌ Skipped (too short)`);
          continue;
        }

        // Check if this line has large text (title candidate)
        if (height >= threshold) {
          console.log(`[LayoutExtractor]     ✅ LARGE TEXT (title part)`);
          titleLines.push(line);
          foundLargeText = true;
        } else if (foundLargeText) {
          // Stop when we hit smaller text after finding large text
          console.log(
            `[LayoutExtractor]     ⏹️  Smaller text, stopping title collection`
          );
          break;
        }
      }

      if (titleLines.length > 0) {
        const title = titleLines.join(" ").trim();
        console.log(
          `[LayoutExtractor] ⭐ TITLE (${titleLines.length} lines combined): "${title}"`
        );
        return title;
      }
    } else {
      console.log(
        `[LayoutExtractor] ⚠️  No height data, falling back to ALL-CAPS detection`
      );
    }

    // Strategy 2: Fallback to ALL-CAPS detection
    const titleLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip noise patterns
      if (
        /^(NATIONAL|BESTSELLER|NEW\s*YORK|TIMES|BEST\s*SELLER|NA\s*T10)/i.test(
          line
        )
      ) {
        continue;
      }

      // Skip very short lines (< 3 chars)
      if (line.length < 3) {
        continue;
      }

      // Check if line is ALL-CAPS (typical for book titles)
      const isAllCaps =
        /^[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ\s]+$/.test(
          line
        );

      // Check if line is Title Case (starts with capital, has lowercase)
      const isTitleCase =
        /^[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/.test(
          line
        );

      if (isAllCaps) {
        // Add all-caps line to title
        titleLines.push(line);
      } else if (isTitleCase && titleLines.length > 0) {
        // Stop collecting title when we hit Title Case (likely author name)
        // But DON'T break - let other functions process remaining lines
        break;
      } else if (titleLines.length === 0 && line.length >= 5) {
        // If no all-caps found yet, take first substantial line as title
        titleLines.push(line);
        // Continue to check for more title lines (don't break yet)
      }
    }

    const title = titleLines.join(" ").trim();
    console.log(
      `[LayoutExtractor] Extracted title from ${titleLines.length} lines: ${title}`
    );
    return title || (lines.length > 0 ? lines[0] : "");
  }

  /**
   * Find author - typically ONE line in Title Case (not all-caps)
   * Example: "Nguyễn Nhật Ánh" or "Linda Kaplan Thaler & Robin Koval"
   */
  findAuthor(lines, text) {
    // First: Try keyword-based patterns
    const authorPatterns = [
      /(?:tác\s*giả|tac\s*gia|author|by|của)[\s:]+([^\n]+)/i,
      /(?:viết bởi|sáng tác bởi|biên soạn)[\s:]+([^\n]+)/i,
    ];

    for (const pattern of authorPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let author = match[1].trim();
        author = author.replace(/^(bởi|by|của)\s+/i, "");
        author = author.split(/[,;]|và/)[0].trim();
        if (author.length > 2 && author.length < 100) {
          console.log(`[LayoutExtractor] Found author by keyword: ${author}`);
          return author;
        }
      }
    }

    // Second: Look for ONE line in Title Case (first letter caps, has lowercase)
    // Author names are typically NOT all-caps
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty or too short
      if (trimmed.length < 5) continue;

      // Skip all-caps lines (those are usually title)
      if (
        /^[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ\s]+$/.test(
          trimmed
        )
      ) {
        continue;
      }

      // Check for Title Case name pattern
      // Must start with capital and have at least one lowercase
      const isTitleCase =
        /^[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/.test(
          trimmed
        );

      if (isTitleCase) {
        // Validate it looks like a name (2-6 words, reasonable length)
        const words = trimmed.split(/\s+/);
        const wordCount = words.length;

        if (
          wordCount >= 2 &&
          wordCount <= 6 &&
          trimmed.length >= 10 &&
          trimmed.length <= 100
        ) {
          console.log(
            `[LayoutExtractor] Found author by Title Case pattern: ${trimmed}`
          );
          return trimmed;
        }
      }
    }

    return "";
  }

  /**
   * Find title (usually the largest/first text)
   */
  findTitle(text) {
    // Remove common keywords to isolate title
    let cleanText = text
      .replace(
        /(?:tác\s*giả|author|nhà\s*xuất\s*bản|nxb|publisher|isbn)[\s:][^\n]*/gi,
        ""
      )
      .trim();

    // Take first substantial line/phrase
    const lines = cleanText.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      return lines[0].trim();
    }

    // Fallback: take first 100 chars
    return cleanText.substring(0, 100).trim();
  }

  /**
   * Find publisher - looks for lines with "NXB" or "Nhà xuất bản"
   * Example: "NXB Trẻ" or "Nhà xuất bản Kim Đồng"
   */
  findPublisher(lines, text) {
    // First: Try to find line containing "NXB" or "Nhà xuất bản"
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if line contains publisher keywords
      if (
        lowerLine.includes("nxb") ||
        lowerLine.includes("nhà xuất bản") ||
        lowerLine.includes("nha xuat ban") ||
        lowerLine.includes("xuất bản")
      ) {
        let publisher = line.trim();

        // Clean up - remove the keyword prefix if at start
        publisher = publisher
          .replace(/^(?:nhà\s*xuất\s*bản|nha\s*xuat\s*ban|nxb)[\s:.]*/i, "")
          .trim();

        // Also remove suffix patterns
        publisher = publisher
          .replace(/[\s:]*(?:xuất\s*bản|phát\s*hành)$/i, "")
          .trim();

        if (publisher.length > 2 && publisher.length < 200) {
          console.log(
            `[LayoutExtractor] Found publisher in line: ${publisher}`
          );
          return publisher;
        }
      }
    }

    // Second: Try pattern matching in full text
    const publisherPatterns = [
      /(?:nhà\s*xuất\s*bản|nxb)[\s:.]*([^\n,;]+)/i,
      /(?:xuất\s*bản\s*bởi|phát\s*hành\s*bởi)[\s:.]*([^\n,;]+)/i,
    ];

    for (const pattern of publisherPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let publisher = match[1].trim();
        publisher = publisher.split(/[,;]/)[0].trim();
        if (publisher.length > 2 && publisher.length < 200) {
          console.log(
            `[LayoutExtractor] Found publisher by pattern: ${publisher}`
          );
          return publisher;
        }
      }
    }

    return "";
  }

  /**
   * Find year
   */
  findYear(text) {
    const yearPatterns = [
      /(?:năm|year|xuất\s*bản|published)[\s:]*(\d{4})/gi,
      /(\d{4})/g,
    ];

    for (const pattern of yearPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const year = parseInt(match[1]);
        if (year >= 1900 && year <= 2099) {
          return year.toString();
        }
      }
    }

    return "";
  }

  /**
   * Find ISBN
   */
  findISBN(text) {
    const isbnPatterns = [
      /isbn[\s:-]*(\d{10}|\d{13})/i,
      /(\d{3}-\d{10})/,
      /(\d{13})/,
    ];

    for (const pattern of isbnPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/-/g, "");
      }
    }

    return "";
  }

  /**
   * Empty result
   */
  emptyResult() {
    return {
      title: "",
      author: "",
      publisher: "",
      year: "",
      isbn: "",
      layout: "unknown",
    };
  }
}

module.exports = new LayoutExtractor();
