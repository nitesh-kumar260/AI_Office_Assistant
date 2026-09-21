import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getJwtSecret, sanitizeUser } from '../services/authService';

export interface AuthRequest extends Request {
  user?: Record<string, any>;
  userId?: string;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || (req.headers as any).Authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required: Missing or malformed Bearer token' });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Authentication required: Token missing' });
    }

    let secret: string;
    try {
      secret = getJwtSecret();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err: any) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Authenticated user no longer exists' });
    }

    req.user = sanitizeUser(user);
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export default authenticateToken;
