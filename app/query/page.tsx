"use client";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, Send, FileText, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type ChatMessage = {
  role: 'user' | 'assistant' | 'separator';
  content: string;
  sources?: Array<{ file: string; page: number | null }>; // only for assistant
  liked?: boolean;
  disliked?: boolean;
  isNew?: boolean; // to distinguish new messages from history
  timestamp?: string; // for history messages
};

export default function QueryPage() {
  const { isSignedIn } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md mx-4 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-foreground">Please sign in to continue</h1>
            <p className="text-muted-foreground mb-6">Access your document chat interface</p>
            <Button asChild className="w-full">
              <Link href="/">
                Go to home page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!isSignedIn) return;

      try {
        const res = await fetch('/api/chat-history');
        if (res.ok) {
          const data = await res.json();
          const historyMessages: ChatMessage[] = [];

          data.history.forEach((item: any) => {
            historyMessages.push(
              { role: 'user', content: item.question, timestamp: item.created_at },
              { role: 'assistant', content: item.answer, timestamp: item.created_at }
            );
          });

          setMessages(historyMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [isSignedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setSending(true);

    // Add new message indicator if this is the first new message
    const isFirstNewMessage = messages.length > 0 && !messages.some(m => m.isNew);
    if (isFirstNewMessage) {
      setMessages((prev) => [...prev, { role: 'separator', content: 'New Messages', isNew: true }]);
    }

    setMessages((prev) => [...prev, { role: 'user', content: question, isNew: true }]);
    setInput('');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const answer: string = data.answer || '';
      const sources: Array<{ file: string; page: number | null }> = Array.isArray(data.sources) ? data.sources : [];
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, sources, isNew: true }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again.", isNew: true }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLike = (index: number) => {
    setMessages(prev => prev.map((msg, i) =>
      i === index ? { ...msg, liked: !msg.liked, disliked: false } : msg
    ));
  };

  const handleDislike = (index: number) => {
    setMessages(prev => prev.map((msg, i) =>
      i === index ? { ...msg, disliked: !msg.disliked, liked: false } : msg
    ));
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Document Chat</h1>
              <p className="text-sm text-muted-foreground">Ask questions about your uploaded PDFs</p>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessages([]);
                  setLoading(false);
                }}
                className="ml-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading your chat history...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in-50 duration-500">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Ask any question about your uploaded documents and get instant answers with source references.
              </p>
            </div>
          )}

          {!loading && messages.length > 0 && (
            <div className="mb-4 text-center">
              <Badge variant="secondary" className="text-xs">
                Chat History Loaded • {Math.floor(messages.length / 2)} conversations
              </Badge>
            </div>
          )}

          {messages.map((m, idx) => {
            // Render separator
            if (m.role === 'separator') {
              return (
                <div key={idx} className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Separator className="flex-1 max-w-20" />
                    <Badge variant="outline" className="text-xs">
                      {m.content}
                    </Badge>
                    <Separator className="flex-1 max-w-20" />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex w-full transition-all duration-500 ${m.role === 'user' ? 'justify-end' : 'justify-start'
                  } ${m.isNew ? 'animate-in slide-in-from-bottom-4' : 'opacity-75 hover:opacity-100'}`}
                style={{ animationDelay: m.isNew ? `${idx * 100}ms` : '0ms' }}
              >
                <div className={`max-w-[85%] ${m.role === 'assistant' ? 'group' : ''}`}>
                  <Card className={`shadow-sm border-0 transition-all duration-200 hover:shadow-md ${m.role === 'user'
                    ? `ml-12 ${m.isNew ? 'bg-primary text-primary-foreground' : 'bg-primary/80 text-primary-foreground'}`
                    : `mr-12 ${m.isNew ? 'bg-muted/50' : 'bg-muted/30'}`
                    }`}>
                    <CardContent className="p-4">
                      <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {m.content}
                      </div>

                      {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Sources</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {m.sources.map((s, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {s.file}{s.page ? ` (p. ${s.page})` : ''}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action buttons for assistant messages */}
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-2 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 animate-in slide-in-from-left-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(idx)}
                        className={`h-8 w-8 p-0 transition-all duration-200 hover:scale-110 ${m.liked ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20' : 'hover:text-green-600'
                          }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDislike(idx)}
                        className={`h-8 w-8 p-0 transition-all duration-200 hover:scale-110 ${m.disliked ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20' : 'hover:text-red-600'
                          }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(m.content, idx)}
                        className={`h-8 w-8 p-0 transition-all duration-200 hover:scale-110 ${copiedIndex === idx ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20' : 'hover:text-primary'
                          }`}
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex w-full justify-start animate-in slide-in-from-bottom-4 duration-300">
              <Card className="max-w-[85%] shadow-sm border-0 bg-muted/50 mr-12">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-6">
        <Card className="shadow-lg border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your documents..."
                  className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  rows={1}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                size="sm"
                className="h-11 px-4 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
