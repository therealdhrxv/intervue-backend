import { Router } from 'express';
import { polls, responses, Response, users } from '../store/memory';
import { generateId } from '../utils/id';
import { getIO } from '../socket';

const router = Router();

router.post('/:id/responses', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  if (poll.status !== 'active') {
    return res.status(400).json({ error: 'Poll is not active' });
  }
  const { studentId, optionId } = req.body;
  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ error: 'studentId is required' });
  }
  if (!optionId || typeof optionId !== 'string') {
    return res.status(400).json({ error: 'optionId is required' });
  }
  const option = poll.options.find(o => o.id === optionId);
  if (!option) {
    return res.status(400).json({ error: 'Invalid optionId' });
  }
  const alreadyResponded = responses.some(r => r.pollId === poll.id && r.studentId === studentId);
  if (alreadyResponded) {
    return res.status(409).json({ error: 'Student has already responded to this poll' });
  }
  const response: Response = {
    id: generateId(),
    pollId: poll.id,
    studentId,
    optionId,
    submittedAt: new Date(),
  };
  responses.push(response);

  // Emit poll:response event
  try {
    getIO().emit('poll:response', response);
  } catch (e) {}

  // If all students have responded, emit poll:results
  try {
    const activeStudents = users.filter(u => u.role === 'student');
    const pollResponses = responses.filter(r => r.pollId === poll.id);
    const uniqueResponders = new Set(pollResponses.map(r => r.studentId));
    if (activeStudents.length > 0 && uniqueResponders.size === activeStudents.length) {
      const results = poll.options.map(option => ({
        optionId: option.id,
        text: option.text,
        count: pollResponses.filter(r => r.optionId === option.id).length
      }));
      getIO().emit('poll:results', { pollId: poll.id, results });
    }
  } catch (e) {}

  res.status(201).json(response);
});

router.get('/:id/responses', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  const pollResponses = responses.filter(r => r.pollId === poll.id);
  res.json({ responses: pollResponses });
});

export default router;
