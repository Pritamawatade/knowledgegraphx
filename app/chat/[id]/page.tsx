"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Send, Loader2, User, Bot, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ file: string; page: number | null }>;
  created_at?: string;
};

export default function ChatIdPage() {
  const { user } = useUser();
  const params = useParams();
  const chatId = params?.id as string;
  const socket = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_chat', chatId);

    const handleStreamToken = (data: { chatId: string; token: string }) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.id) {
          // Append to existing streaming message
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + data.token }
          ];
        } else {
          // Start new streaming message
          return [...prev, { role: 'assistant', content: data.token }];
        }
      });
    };

    const handleStreamEnd = (data: { chatId: string }) => {
      if (data.chatId !== chatId) return;
      setStreaming(false);
    };

    socket.on('stream_token', handleStreamToken);
    socket.on('stream_end', handleStreamEnd);

    return () => {
      socket.off('stream_token', handleStreamToken);
      socket.off('stream_end', handleStreamEnd);
    };
  }, [socket, chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streaming]);

  const sendMessage = async () => {
    if (!input.trim() || streaming || !socket) return;

    const userMessage = input.trim();
    setInput('');
    setStreaming(true);

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Send to server
    socket.emit('send_message', {
      chatId,
      message: userMessage,
      userId: user?.id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-scroll no-scrollbar">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-lg p-4 max-w-[80%]",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}
              >
                <div className="prose dark:prose-invert text-sm break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {msg.sources && typeof msg.sources === 'string' && JSON.parse(msg.sources).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-semibold mb-2 opacity-70">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(msg.sources).map((source: { file: string; page?: number }, i: number) => (
                        <div key={i} className="flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded border border-border/50">
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{source.file}</span>
                          {source.page && <span>(p.{source.page})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            className="min-h-[60px] pr-12 resize-none"
            disabled={streaming}
          />
          <Button
            onClick={sendMessage}
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
  );
}
