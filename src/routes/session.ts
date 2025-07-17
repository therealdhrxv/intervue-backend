import { Router } from 'express';
import { users, User } from '../store/memory';
import { generateId } from '../utils/id';

const router = Router();

router.post('/register', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const existing = users.find(u => u.name === name && u.role === 'student');
  if (existing) {
    return res.status(409).json({ error: 'Name already taken' });
  }
  const id = generateId();
  const sessionId = generateId();
  const now = new Date();
  const user: User = {
    id,
    name,
    role: 'student',
    socketId: '',
    sessionId,
    createdAt: now,
    lastActive: now,
  };
  users.push(user);
  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
    sessionId: user.sessionId,
    createdAt: user.createdAt,
  });
});

router.get('/teacher', (req, res) => {
  const id = generateId();
  const sessionId = generateId();
  const now = new Date();
  const teacher: User = {
    id,
    name: 'Teacher',
    role: 'teacher',
    socketId: '',
    sessionId,
    createdAt: now,
    lastActive: now,
  };
  res.json({
    id: teacher.id,
    name: teacher.name,
    role: teacher.role,
    sessionId: teacher.sessionId,
    createdAt: teacher.createdAt,
  });
});

export default router;
