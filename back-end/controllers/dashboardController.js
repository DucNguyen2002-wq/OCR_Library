/**
 * Dashboard Controller
 * Cung cấp thống kê và báo cáo cho admin
 */

const Book = require("../models/Book");
const User = require("../models/User");
const Role = require("../models/Role");

/**
 * Get dashboard statistics (Admin only)
 * GET /api/dashboard/stats
 * 
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan cho dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalBooks:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     booksByStatus:
 *                       type: object
 *                     booksByApproval:
 *                       type: object
 *                     usersByRole:
 *                       type: object
 *                     recentBooks:
 *                       type: array
 *                     topContributors:
 *                       type: array
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Tổng số sách
    const totalBooks = await Book.countDocuments();

    // 2. Tổng số người dùng
    const totalUsers = await User.countDocuments();

    // 3. Số sách theo trạng thái (draft/published)
    const booksByStatus = await Book.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Số sách theo approval status (pending/approved/rejected)
    const booksByApproval = await Book.aggregate([
      {
        $group: {
          _id: "$approval_status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 5. Số người dùng theo role
    const usersByRole = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      {
        $group: {
          _id: "$role.name",
          count: { $sum: 1 }
        }
      }
    ]);

    // 6. Sách được thêm gần đây (7 ngày)
    const recentBooks = await Book.find({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    })
      .populate("created_by", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 7. Top contributors (người đóng góp nhiều sách nhất)
    const topContributors = await Book.aggregate([
      {
        $group: {
          _id: "$created_by",
          bookCount: { $sum: 1 }
        }
      },
      { $sort: { bookCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          userEmail: "$user.email",
          bookCount: 1,
          _id: 0
        }
      }
    ]);

    // 8. Sách theo tháng (12 tháng gần nhất)
    const booksByMonth = await Book.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 9. Thống kê sách theo năm xuất bản
    const booksByYearPublished = await Book.aggregate([
      {
        $match: {
          year_published: { $ne: null, $gte: 2000 }
        }
      },
      {
        $group: {
          _id: "$year_published",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Format data for charts
    const statusMap = {};
    booksByStatus.forEach(item => {
      statusMap[item._id] = item.count;
    });

    const approvalMap = {};
    booksByApproval.forEach(item => {
      approvalMap[item._id] = item.count;
    });

    const roleMap = {};
    usersByRole.forEach(item => {
      roleMap[item._id] = item.count;
    });

    res.json({
      success: true,
      statistics: {
        // Overview
        totalBooks,
        totalUsers,
        
        // Books by status
        booksByStatus: {
          draft: statusMap.draft || 0,
          published: statusMap.published || 0
        },
        
        // Books by approval
        booksByApproval: {
          pending: approvalMap.pending || 0,
          approved: approvalMap.approved || 0,
          rejected: approvalMap.rejected || 0
        },
        
        // Users by role
        usersByRole: {
          admin: roleMap.admin || 0,
          user: roleMap.user || 0
        },
        
        // Charts data
        booksByMonth: booksByMonth.map(item => ({
          year: item._id.year,
          month: item._id.month,
          count: item.count,
          label: `${item._id.month}/${item._id.year}`
        })),
        
        booksByYearPublished: booksByYearPublished.map(item => ({
          year: item._id,
          count: item.count
        })),
        
        // Recent activity
        recentBooks: recentBooks.map(book => ({
          id: book._id,
          title: book.title,
          creator: book.created_by?.name || 'Unknown',
          approval_status: book.approval_status,
          created_at: book.createdAt
        })),
        
        // Top contributors
        topContributors
      }
    });

  } catch (err) {
    console.error("Get dashboard stats error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thống kê"
    });
  }
};

/**
 * Get books statistics with filters
 * GET /api/dashboard/books-stats
 * 
 * @swagger
 * /api/dashboard/books-stats:
 *   get:
 *     summary: Lấy thống kê chi tiết về sách
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *         description: Khoảng thời gian thống kê
 *     responses:
 *       200:
 *         description: Thống kê sách thành công
 */
const getBooksStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Xác định khoảng thời gian
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const filter = period !== 'all' ? { createdAt: { $gte: startDate } } : {};

    // Thống kê theo approval status trong period
    const booksByApproval = await Book.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$approval_status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê theo nhà xuất bản
    const booksByPublisher = await Book.aggregate([
      { $match: { ...filter, publisher: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$publisher",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Thống kê sách có nhiều tác giả nhất
    const booksWithMostAuthors = await Book.find(filter)
      .sort({ 'authors': -1 })
      .select('title authors')
      .limit(5)
      .lean();

    res.json({
      success: true,
      period,
      statistics: {
        booksByApproval,
        booksByPublisher,
        booksWithMostAuthors: booksWithMostAuthors.map(book => ({
          title: book.title,
          authorCount: book.authors?.length || 0,
          authors: book.authors || []
        }))
      }
    });

  } catch (err) {
    console.error("Get books stats error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thống kê sách"
    });
  }
};

module.exports = {
  getStats: getDashboardStats,
  getChartData: getBooksStats,
  getDashboardStats,
  getBooksStats
};
