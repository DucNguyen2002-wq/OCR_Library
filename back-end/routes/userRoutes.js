const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { idValidation } = require('../utils/validator');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /api/admin/users/roles:
 *   get:
 *     tags: [Users]
 *     summary: Get all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 */
router.get('/roles', requireAuth, requireAdmin, async (req, res) => {
  try {
    const roles = await Role.find().select('_id name');
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const filter = {};
    if (search) { 
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }, 
        { email: { $regex: search, $options: 'i' } }
      ]; 
    }
    const skip = (page - 1) * limit;
    const sort = {}; 
    sort[sortBy] = order;
    
    const users = await User.find(filter)
      .populate('role_id', '_id name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password_hash')
      .lean();
    
    // Format users to flatten role_id
    const formattedUsers = users.map(u => ({
      ...u,
      role: u.role_id?.name || 'user',
      role_id: u.role_id?._id || u.role_id
    }));
      
    const totalUsers = await User.countDocuments(filter);
    
    res.json({ 
      success: true,
      users: formattedUsers, 
      totalUsers, 
      totalPages: Math.ceil(totalUsers / limit), 
      currentPage: page 
    });
  } catch (error) { 
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message }); 
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role_id', 'role_name').select('-password');
    if (!user) { return res.status(404).json({ message: 'User not found' }); }
    res.json(user);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               role_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fullname, email, role_id } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) { return res.status(404).json({ message: 'User not found' }); }
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) { return res.status(400).json({ message: 'Email already exists' }); }
    }
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (role_id) user.role_id = role_id;
    await user.save();
    const updatedUser = await User.findById(user._id).populate('role_id', 'role_name').select('-password');
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

/**
 * @swagger
 * /api/admin/users/{id}/password:
 *   put:
 *     tags: [Users]
 *     summary: Reset user password
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.put('/:id/password', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { return res.status(404).json({ message: 'User not found' }); }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

module.exports = router;
