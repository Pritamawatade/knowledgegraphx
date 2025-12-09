import { Server as SocketIOServer } from 'socket.io';
import { processQuery } from './rag';

export function setupSocket(io: SocketIOServer) {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_chat', (chatId: string) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        socket.on('send_message', async (data: { chatId: string; message: string; userId: string }) => {
            const { chatId, message, userId } = data;

            try {
                // Emit user message back to sender (optimistic update handled by client usually, but good for confirmation)
                // socket.emit('message_received', { role: 'user', content: message });

                await processQuery(message, userId, chatId, (token) => {
                    socket.emit('stream_token', { chatId, token });
                });

                socket.emit('stream_end', { chatId });

            } catch (error) {
                console.error('Error processing message:', error);
                socket.emit('error', { message: 'Failed to process message' });
            }
        });

        socket.on("audio-chunk", (data: Buffer) => {
            // For now, just log the size. Later we feed this to STT.
            console.log("🎧 Received audio chunk:", data.length, "bytes");
          });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}
