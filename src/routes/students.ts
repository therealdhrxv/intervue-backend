import { Router } from 'express';
import { users } from '../store/memory';

const router = Router();

router.get('/', (req, res) => {
  res.json({ users });
});

router.delete('/:id', (req, res) => {
  // For now, just return a dummy response
  res.json({ message: 'Student removed (dummy)' });
});

export default router;
