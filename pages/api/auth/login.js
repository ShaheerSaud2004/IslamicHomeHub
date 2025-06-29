const UserManagementService = require('../../../lib/services/user-management');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method POST required' });
  }

  try {
    const userService = new UserManagementService();
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const loginResult = await userService.loginUser(email.toLowerCase().trim(), password);

    // Set HTTP-only cookie for the token (more secure)
    res.setHeader('Set-Cookie', [
      `token=${loginResult.token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''}`
    ]);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: loginResult.user,
        token: loginResult.token // Also send in response for client-side storage if needed
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
} 