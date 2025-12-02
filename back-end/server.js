const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const helmet = require("helmet");
require("dotenv").config();

// Import MongoDB connection
const { connectDB } = require("./config/db");

// Import Swagger
const { setupSwagger } = require("./config/swagger");

const app = express();

// ==================== CONNECT TO DATABASE ====================
connectDB();

// ==================== MULTER CONFIG FOR IMAGE UPLOAD ====================

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Save to public/uploads/
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + random + extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter: only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// ==================== MIDDLEWARE ====================

// Security middleware - Helmet helps secure Express apps by setting HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI
  crossOriginEmbedderPolicy: false
}));

// Enable CORS for React frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Same origin (admin, client, api)
      "http://localhost:5173", // Vite dev server - Admin dashboard
      "http://localhost:5174", // Vite dev server (alternate)
      "http://localhost:5175", // Vite dev server - Client app
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with size limits (security best practice)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads folder with CORS headers
app.use('/uploads', cors(), express.static(path.join(__dirname, "public/uploads")));

// Static files (excluding uploads, as it's handled above)
app.use(express.static(path.join(__dirname, "public")));

// Serve front-end static files
// Admin Dashboard
app.use('/admin', express.static(path.join(__dirname, "../front-end/admin/dist")));
// Client App (User)
app.use('/client', express.static(path.join(__dirname, "../front-end/user/dist")));

// Setup Swagger documentation
setupSwagger(app);

// ==================== ROUTES ====================

// Import routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const profileRoutes = require("./routes/profileRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const ocrSearchRoutes = require("./routes/ocrSearchRoutes");

// Auth routes (login, register, logout, me)
app.use("/api/auth", authRoutes);

// Book routes (CRUD books, approval)
app.use("/api/books", bookRoutes);

// Profile routes (stats, update, change password)
app.use("/api/profile", profileRoutes);

// Upload routes (upload images)
app.use("/api/upload", uploadRoutes);

// OCR routes (process images)
app.use("/api/ocr", ocrRoutes);

// OCR Search routes (search books by image using OCR + AI)
app.use("/api/ocr", ocrSearchRoutes);

// Notification routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// User management routes (Admin only)
const { authenticateToken } = require("./middleware/auth");
app.use("/api/admin/users", authenticateToken, userRoutes);

// Dashboard routes (Admin only)
app.use("/api/dashboard", authenticateToken, dashboardRoutes);

// ==================== FRONT-END ROUTES ====================

// Serve admin dashboard SPA (Single Page Application)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/admin/dist/index.html"));
});

// Serve client app SPA
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/user/dist/index.html"));
});

// ==================== IMAGE UPLOAD ENDPOINT ====================

// Upload single image
app.post(
  "/upload",
  authenticateToken,
  upload.single("coverImage"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "No file uploaded" 
        });
      }

      // Return URL of uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        message: "Image uploaded successfully",
        fileUrl: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false,
        message: "Error uploading file" 
      });
    }
  }
);

// ==================== ROOT ====================

// Health check / root
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Library Management System",
    version: process.env.npm_package_version || "1.0.0",
    documentation: "/api-docs",
    frontends: {
      admin: "/admin",
      client: "/client"
    },
    api: {
      auth: "/api/auth",
      books: "/api/books",
      profile: "/api/profile",
      ocr: "/api/ocr",
      users: "/api/admin/users",
      dashboard: "/api/dashboard"
    }
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Library Management System - Server Started`);
  console.log(`${'='.repeat(60)}`);
  console.log(`� Server:           http://localhost:${PORT}`);
  console.log(`� API Docs:         http://localhost:${PORT}/api-docs`);
  console.log(`👨‍💼 Admin Dashboard:  http://localhost:${PORT}/admin`);
  console.log(`👤 Client App:       http://localhost:${PORT}/client`);
  console.log(`${'='.repeat(60)}\n`);
});
