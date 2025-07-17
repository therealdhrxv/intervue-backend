import { Router } from 'express';
import { polls, Poll, PollOption, responses } from '../store/memory';
import { generateId } from '../utils/id';
import { getIO } from '../socket';

const router = Router();

router.get('/', (req, res) => {
  res.json({ polls });
});

router.post('/', (req, res) => {
  const { question, options, createdBy, timeLimit, status } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }
  if (!Array.isArray(options) || options.length < 2 || options.some(opt => typeof opt !== 'string' || !opt.trim())) {
    return res.status(400).json({ error: 'At least two valid options are required' });
  }
  if (typeof timeLimit !== 'number' || timeLimit < 1 || timeLimit > 60) {
    return res.status(400).json({ error: 'Time limit must be between 1 and 60 seconds' });
  }
  if (!createdBy || typeof createdBy !== 'string') {
    return res.status(400).json({ error: 'createdBy is required' });
  }
  if ((status === 'active' || !status) && polls.some(p => p.status === 'active')) {
    return res.status(409).json({ error: 'Another poll is already active' });
  }
  const pollId = generateId();
  const now = new Date();
  const pollOptions: PollOption[] = options.map((opt: string) => ({ id: generateId(), text: opt }));
  const poll: Poll = {
    id: pollId,
    question,
    options: pollOptions,
    createdBy,
    timeLimit,
    status: status || 'draft',
    createdAt: now,
  };
  polls.push(poll);

  // Emit poll:created event to all connected clients
  try {
    getIO().emit('poll:created', poll);
  } catch (e) {
    // Socket.io not initialized, ignore for now
  }

  res.status(201).json(poll);
});

router.get('/:id', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  res.json(poll);
});

router.put('/:id', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  const { question, options, timeLimit, status } = req.body;
  let emitActivated = false;
  let emitResults = false;
  if (question !== undefined) {
    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Invalid question' });
    }
    poll.question = question;
  }
  if (options !== undefined) {
    if (!Array.isArray(options) || options.length < 2 || options.some((opt: string) => typeof opt !== 'string' || !opt.trim())) {
      return res.status(400).json({ error: 'At least two valid options are required' });
    }
    poll.options = options.map((opt: string) => ({ id: generateId(), text: opt }));
  }
  if (timeLimit !== undefined) {
    if (typeof timeLimit !== 'number' || timeLimit < 1 || timeLimit > 60) {
      return res.status(400).json({ error: 'Time limit must be between 1 and 60 seconds' });
    }
    poll.timeLimit = timeLimit;
  }
  if (status !== undefined) {
    if (status === 'active' && polls.some(p => p.status === 'active' && p.id !== poll.id)) {
      return res.status(409).json({ error: 'Another poll is already active' });
    }
    if (!['draft', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    // Detect status transitions
    if (poll.status !== status) {
      if (status === 'active') emitActivated = true;
      if (status === 'completed') emitResults = true;
    }
    poll.status = status;
  }
  res.json(poll);

  // Emit poll:activated if poll just became active
  if (emitActivated) {
    try {
      getIO().emit('poll:activated', poll);
    } catch (e) {}
  }
  // Emit poll:results if poll just became completed
  if (emitResults) {
    try {
      // Aggregate results: count per option
      const pollResponses = responses.filter(r => r.pollId === poll.id);
      const results = poll.options.map(option => ({
        optionId: option.id,
        text: option.text,
        count: pollResponses.filter(r => r.optionId === option.id).length
      }));
      getIO().emit('poll:results', { pollId: poll.id, results });
    } catch (e) {}
  }
});

router.delete('/:id', (req, res) => {
  const idx = polls.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Poll not found' });
  polls.splice(idx, 1);
  res.json({ success: true });
});

export default router;
