import { Router, Request, Response } from 'express';
import AuthService from '../services/authService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, title, organization } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const result = await AuthService.register({
      name,
      email,
      password,
      role,
      title,
      organization,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    if (
      error.message === 'Email is already registered' ||
      error.message === 'Invalid email format' ||
      error.message.includes('Password must be') ||
      error.message.includes('required')
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const result = await AuthService.login({ email, password });

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current authenticated user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
