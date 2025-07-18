import { Router } from 'express';
import { users, User } from '../store/memory';
import { generateId } from '../utils/id';

const router = Router();

router.post('/register', (req, res) => {
  console.log('📥 POST /register called');
  console.log('📦 Request body:', req.body);

  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    console.warn('❌ Invalid or missing name');
    return res.status(400).json({ error: 'Name is required' });
  }

//   const existing = users.find(u => u.name === name && u.role === 'student');
//   if (existing) {
//     console.warn('⚠️ Name already taken:', name);
//     return res.status(409).json({ error: 'Name already taken' });
//   }

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
  console.log('✅ New student registered:', user);

  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
    sessionId: user.sessionId,
    createdAt: user.createdAt,
  });
});

router.post('/teacher', (req, res) => {
  console.log('📥 POST /teacher called');
  console.log('📦 Request body:', req.body);

  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    console.warn('❌ Invalid or missing name');
    return res.status(400).json({ error: 'Name is required' });
  }

  const id = generateId();
  const sessionId = generateId();
  const now = new Date();

  const teacher: User = {
    id,
    name,
    role: 'teacher',
    socketId: '',
    sessionId,
    createdAt: now,
    lastActive: now,
  };

  console.log('✅ New teacher created:', teacher);

  res.json({
    id: teacher.id,
    name: teacher.name,
    role: teacher.role,
    sessionId: teacher.sessionId,
    createdAt: teacher.createdAt,
  });
});

export default router;
