import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'foodexpress_super_secret_key_123';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'customer' | 'admin';
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header is missing' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
