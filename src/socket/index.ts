import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: IOServer | null = null;

export function setupSocket(server: HTTPServer) {
  io = new IOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('chat-message', (message) => {
        socket.broadcast.emit('chat-message', message);
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
