"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Chat = {
  id: string;
  title: string;
  updated_at: string;
};

export default function ChatSidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      if (res.ok) {
        const newChat = await res.json();
        setChats([newChat, ...chats]);
        router.push(`/chat/${newChat.id}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const res = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setChats(chats.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
          router.push('/chat');
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  return (
    <div className="w-64 border-r bg-muted/10 h-full flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={createNewChat} className="w-full justify-start gap-2" variant="default">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg text-sm transition-colors hover:bg-muted group",
                  currentChatId === chat.id ? "bg-muted font-medium" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteChat(e, chat.id)}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
