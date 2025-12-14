import { Server as SocketIOServer, Socket } from 'socket.io';
import { processQuery } from './rag';
import { openai } from "./openai"
import { toFile } from 'openai/uploads'

interface SessionData {
    chunks: Buffer[];
}

const sessions = new Map<string, SessionData>()

export function setupSocket(io: SocketIOServer) {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        sessions.set(socket.id, { chunks: [] })
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

        socket.on("audio-chunk", (data: ArrayBuffer | Buffer) => {
            // For now, just log the size. Later we feed this to STT.
            const session = sessions.get(socket.id);
            if (!session) return;

            const buf = Buffer.isBuffer(data) ? data : Buffer.from(new Uint8Array(data))
            session.chunks.push(buf)
            // console.log("🎧 Received audio chunk:", data.length, "bytes");

        });

        socket.on('audio-end', async () => {
            const session = sessions.get(socket.id);

            if (!session || session.chunks.length === 0) {
                console.log('Audio end with 0 chunks')
                socket.emit('transmission', { error: 'Error no audio recieved' })
                return;
            }

            try {
                console.log(`Recieved ${session.chunks.length} from ${socket.id} transscribing...`);

                const fulBuffer = Buffer.concat(session.chunks);

                session.chunks = []

                const file = await toFile(fulBuffer, 'speech.webm');

                const transcription = await openai.audio.transcriptions.create({
                    file,
                    model: 'gpt-4o-mini-transcribe',
                    response_format: 'json'
                })

                const text = (transcription as any).text ?? "";

                console.log("📝 Transcription:", text);

                socket.emit('transcription', text)


            } catch (err: any) {
                console.error("❌ Transcription error:", err);
                socket.emit("transcription", {
                    error: "Transcription failed",
                    detail: err?.message,
                });
            }
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });


    });
}
