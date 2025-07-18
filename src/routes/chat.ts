import { Router } from 'express';
import { getIO } from '../socket';
import { messages, ChatMessage } from '../store/memory';

const chatRouter = Router();


chatRouter.post('/', (req, res) => {
  const { userId, userName, message } = req.body;

  if (!userId || !userName || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    userId,
    userName,
    message,
    timestamp: new Date().toISOString(),
  };

  messages.push(newMessage);

  // Emit via WebSocket
  getIO().emit('chat:newMessage', newMessage);

  res.status(201).json(newMessage);
});

chatRouter.get('/', (req, res) => {
  res.json(messages);
});

export default chatRouter;
