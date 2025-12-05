"use client";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSocket } from '@/hooks/useSocket';
import { useUser } from '@clerk/nextjs';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';


type Chat = {
  id: string;
  title: string;
  updated_at: string;
};


type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ file: string; page: number | null }>;
  created_at?: string;
};


export default function ChatPage() {

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string;
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatid, setChatId] = useState<string>();
  const { user } = useUser();

  const sendMessage = async () => {
    if (!input.trim() || streaming || !socket) return;

    const userMessage = input.trim();
    setInput('');
    setStreaming(true);

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Send to server
    socket.emit('send_message', {
      chatId: currentChatId,
      message: userMessage,
      userId: user?.id,
    });
  };

  const createNewChat = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.trim().slice(0, 20) + (input.length > 20 ? '...' : '') }),
      });
      if (res.ok) {
        const newChat = await res.json();
        setChatId(newChat.id);
        setChats([newChat, ...chats]);

        router.push(`/chat/${newChat.id}?message=${encodeURIComponent(input.trim())}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createNewChat();
    }
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full text-center w-full">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className='text-2xl'>Start Asking Questions </p>

        <div className=" p-4 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-3xl mx-auto relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="min-h-[60px] w-full pr-12 resize-none "
              disabled={streaming}
            />
            <Button
              onClick={createNewChat}
              disabled={!input.trim() || streaming}
              size="icon"
              className="absolute right-2 bottom-2"
            >
              {streaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

      </div>

    </>
  );
}
