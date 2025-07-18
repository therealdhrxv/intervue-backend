import { Router } from 'express';
import { polls, Poll, PollOption, responses } from '../store/memory';
import { generateId } from '../utils/id';
import { getIO } from '../socket';

const router = Router();

router.get('/', (req, res) => {
  console.log('📥 GET /api/polls — returning all polls');
  res.json({ polls });
});

router.post('/', (req, res) => {
  console.log('📥 POST /api/polls — received:', req.body);

  const { question, options, createdBy, timeLimit, status } = req.body;

  // Validation
  if (!question || typeof question !== 'string' || !question.trim()) {
    console.warn('❌ Invalid question');
    return res.status(400).json({ error: 'Question is required' });
  }
  if (!Array.isArray(options) || options.length < 2 || options.some(opt => typeof opt !== 'string' || !opt.trim())) {
    console.log(`isArray: ${Array.isArray(options)}`);
    console.log(`options: ${options}`);
    console.log(`length: ${options.length}`);
    console.warn('❌ Invalid options');
    return res.status(400).json({ error: 'At least two valid options are required' });
  }
  if (typeof timeLimit !== 'number' || timeLimit < 1 || timeLimit > 60) {
    console.warn('❌ Invalid time limit');
    return res.status(400).json({ error: 'Time limit must be between 1 and 60 seconds' });
  }
  if (!createdBy || typeof createdBy !== 'string') {
    console.warn('❌ Missing createdBy');
    return res.status(400).json({ error: 'createdBy is required' });
  }
  if ((status === 'active' || !status) && polls.some(p => p.status === 'active')) {
    console.warn('❌ Active poll already exists');
    return res.status(409).json({ error: 'Another poll is already active' });
  }

  // Construct Poll
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

  console.log(`✅ Poll created with ID: ${poll.id}`);
  console.log('📦 Poll data:', poll);

  try {
    getIO().emit('poll:created', poll);
    console.log('📡 poll:created event emitted');
  } catch (e) {
    console.warn('⚠️ Socket.IO not initialized, poll:created not emitted');
  }

  res.status(201).json(poll);
});

router.get('/:id', (req, res) => {
  console.log(`📥 GET /api/polls/${req.params.id}`);
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    console.warn(`❌ Poll ${req.params.id} not found`);
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json(poll);
});

router.put('/:id', (req, res) => {
  console.log(`📥 PUT /api/polls/${req.params.id} — received:`, req.body);

  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    console.warn(`❌ Poll ${req.params.id} not found`);
    return res.status(404).json({ error: 'Poll not found' });
  }

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
    if (poll.status !== status) {
      if (status === 'active') emitActivated = true;
      if (status === 'completed') emitResults = true;
    }
    poll.status = status;
  }

  console.log(`✅ Poll ${poll.id} updated`);
  res.json(poll);

  if (emitActivated) {
    try {
      getIO().emit('poll:activated', poll);
      console.log('📡 poll:activated event emitted');
    } catch (e) {
      console.warn('⚠️ Socket.IO not initialized, poll:activated not emitted');
    }
  }

  if (emitResults) {
    try {
      const pollResponses = responses.filter(r => r.pollId === poll.id);
      const results = poll.options.map(option => ({
        optionId: option.id,
        text: option.text,
        count: pollResponses.filter(r => r.optionId === option.id).length
      }));
      getIO().emit('poll:results', { pollId: poll.id, results });
      console.log('📡 poll:results event emitted');
    } catch (e) {
      console.warn('⚠️ Error emitting poll:results');
    }
  }
});

router.delete('/:id', (req, res) => {
  console.log(`🗑 DELETE /api/polls/${req.params.id}`);
  const idx = polls.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    console.warn(`❌ Poll ${req.params.id} not found`);
    return res.status(404).json({ error: 'Poll not found' });
  }
  polls.splice(idx, 1);
  console.log(`✅ Poll ${req.params.id} deleted`);
  res.json({ success: true });
});

export default router;
