const UserManagementService = require('../../../lib/services/user-management');
const cookie = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method GET required' });
  }

  try {
    const userService = new UserManagementService();
    
    // Get token from cookie or Authorization header
    let token = null;
    
    if (req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      token = cookies.token;
    }
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify token and get user info
    const decodedToken = userService.verifyToken(token);
    const user = await userService.getUserByEmail(decodedToken.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Return user info (excluding password)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
      isScholar: user.is_scholar,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    res.status(200).json({
      success: true,
      data: {
        user: userInfo
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication check failed',
      error: error.message
    });
  }
} 