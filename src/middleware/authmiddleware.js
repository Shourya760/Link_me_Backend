import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.curr_user = { id: decoded.sub };
    req.user = req.curr_user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
