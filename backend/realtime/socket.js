import { Server } from 'socket.io';

export function setupSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // Expose a helper that your streamer (or controllers) can use
  return {
    emitAlert: (payload) => io.emit('security:alert', payload),
  };
}
