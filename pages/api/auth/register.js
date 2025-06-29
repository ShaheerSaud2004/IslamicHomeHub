const UserManagementService = require('../../../lib/services/user-management');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method POST required' });
  }

  try {
    const userService = new UserManagementService();
    const { username, email, password, fullName, location } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    const newUser = await userService.registerUser({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName || '',
      location: location || ''
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
} 