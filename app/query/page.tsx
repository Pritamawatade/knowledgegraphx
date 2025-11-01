"use client";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, Send, FileText, Loader2, RotateCcw, History, X, ChevronLeft, ChevronRight, Clock, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type ChatMessage = {
  role: 'user' | 'assistant' | 'separator';
  content: string;
  sources?: Array<{ file: string; page: number | null }>;
  liked?: boolean;
  disliked?: boolean;
  isNew?: boolean;
  timestamp?: string;
};

type HistoryItem = {
  id: string;
  question: string;
  answer: string;
  created_at: string;
};

export default function QueryPage() {
  const { isSignedIn } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
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
          setHistoryItems(data.history || []);
          
          // Load the most recent conversation by default
          if (data.history && data.history.length > 0) {
            const firstItem = data.history[0];
            setSelectedHistoryId(firstItem.id);
            setMessages([
              { role: 'user', content: firstItem.question, timestamp: firstItem.created_at },
              { role: 'assistant', content: firstItem.answer, timestamp: firstItem.created_at }
            ]);
          }
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
      
      // Refresh history after new message
      const historyRes = await fetch('/api/chat-history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistoryItems(historyData.history || []);
      }
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

  const handleCopyCode = async (code: string, index: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const formatMessageContent = (content: string, messageIndex: number) => {
    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    let partKey = 0;

    // Regex to match code blocks with optional language
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        const textBefore = content.slice(currentIndex, match.index);
        parts.push(
          <div key={`text-${partKey++}`}>
            {formatInlineMarkdown(textBefore)}
          </div>
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      const codeId = `${messageIndex}-${partKey}`;

      parts.push(
        <div key={`code-${partKey++}`} className="my-4 relative group">
          <div className="flex items-center justify-between bg-muted/80 px-4 py-2 rounded-t-lg border border-b-0">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Code className="w-3 h-3" />
              {language}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyCode(code, codeId)}
              className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copiedCodeIndex === codeId ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="bg-muted/50 p-4 rounded-b-lg border overflow-x-auto">
            <code className="text-xs font-mono">{code}</code>
          </pre>
        </div>
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (currentIndex < content.length) {
      const textAfter = content.slice(currentIndex);
      parts.push(
        <div key={`text-${partKey++}`}>
          {formatInlineMarkdown(textAfter)}
        </div>
      );
    }

    return <div>{parts}</div>;
  };

  const formatInlineMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-base font-bold mt-4 mb-2">
            {formatInlineElements(line.slice(4))}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-lg font-bold mt-4 mb-2">
            {formatInlineElements(line.slice(3))}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-xl font-bold mt-4 mb-2">
            {formatInlineElements(line.slice(2))}
          </h1>
        );
      }

      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={lineIndex} className="ml-4 my-1">
            {formatInlineElements(line.trim().slice(2))}
          </li>
        );
      }

      // Handle numbered lists
      const numberedMatch = line.match(/^\d+\.\s/);
      if (numberedMatch) {
        return (
          <li key={lineIndex} className="ml-4 my-1 list-decimal">
            {formatInlineElements(line.slice(numberedMatch[0].length))}
          </li>
        );
      }

      // Handle horizontal rules
      if (line.trim() === '---' || line.trim() === '***') {
        return <hr key={lineIndex} className="my-4 border-muted" />;
      }

      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={lineIndex} className="my-2">
            {formatInlineElements(line)}
          </p>
        );
      }

      return <br key={lineIndex} />;
    });
  };

  const formatInlineElements = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    // Regex patterns for inline formatting
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, render: (match: string) => <strong key={key++} className="font-bold italic">{match}</strong> },
      { regex: /\*\*(.+?)\*\*/g, render: (match: string) => <strong key={key++} className="font-bold">{match}</strong> },
      { regex: /\*(.+?)\*/g, render: (match: string) => <em key={key++} className="italic">{match}</em> },
      { regex: /__(.+?)__/g, render: (match: string) => <strong key={key++} className="font-bold">{match}</strong> },
      { regex: /_(.+?)_/g, render: (match: string) => <em key={key++} className="italic">{match}</em> },
      { regex: /`([^`]+)`/g, render: (match: string) => <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{match}</code> },
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, render: (match: string, text: string, url: string) => <a key={key++} href={url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{text}</a> },
    ];

    while (remaining.length > 0) {
      let earliestMatch: { index: number; length: number; element: JSX.Element } | null = null;

      // Find the earliest match among all patterns
      for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex);
        const match = regex.exec(remaining);
        
        if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
          const fullMatch = match[0];
          const content = match[1];
          const url = match[2]; // for links
          
          earliestMatch = {
            index: match.index,
            length: fullMatch.length,
            element: pattern.render(content, content, url)
          };
        }
      }

      if (earliestMatch) {
        // Add text before match
        if (earliestMatch.index > 0) {
          parts.push(remaining.slice(0, earliestMatch.index));
        }
        // Add formatted element
        parts.push(earliestMatch.element);
        // Continue with remaining text
        remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
      } else {
        // No more matches, add remaining text
        parts.push(remaining);
        break;
      }
    }

    return <>{parts}</>;
  };

  const loadHistoryConversation = (item: HistoryItem) => {
    setSelectedHistoryId(item.id);
    setMessages([
      { role: 'user', content: item.question, timestamp: item.created_at },
      { role: 'assistant', content: item.answer, timestamp: item.created_at }
    ]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const groupHistoryByDate = (items: HistoryItem[]) => {
    const groups: { [key: string]: HistoryItem[] } = {};
    const now = new Date();
    
    items.forEach(item => {
      const date = new Date(item.created_at);
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      let groupKey: string;
      if (diffInDays === 0) {
        groupKey = 'Today';
      } else if (diffInDays === 1) {
        groupKey = 'Yesterday';
      } else if (diffInDays < 7) {
        groupKey = 'This Week';
      } else if (diffInDays < 30) {
        groupKey = 'This Month';
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  };

  const historyGroups = groupHistoryByDate(historyItems);

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* History Side Panel */}
      <div className={`transition-all duration-300 ease-in-out border-r bg-muted/30 ${showHistory ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Chat History</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {Object.entries(historyGroups).map(([groupKey, items]) => (
                <div key={groupKey}>
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {groupKey}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadHistoryConversation(item)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-background/80 group ${
                          selectedHistoryId === item.id ? 'bg-primary/10 border border-primary/20' : 'hover:border hover:border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">
                            {item.question}
                          </p>
                          {selectedHistoryId === item.id && (
                            <Badge variant="secondary" className="text-xs shrink-0">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(item.created_at)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {historyItems.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <History className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No chat history yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              {!showHistory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="shrink-0"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  History
                </Button>
              )}
              
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-foreground truncate">Document Chat</h1>
                <p className="text-sm text-muted-foreground truncate">Ask questions about your uploaded PDFs</p>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessages([]);
                    setSelectedHistoryId(null);
                  }}
                  className="shrink-0"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Chat
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
    </div>
  );
}
