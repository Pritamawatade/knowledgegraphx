"use client";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, Send, FileText, Loader2, RotateCcw, History, X, ChevronLeft, ChevronRight, Clock, Code, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import React from "react"
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!isSignedIn) return;

      try {
        const res = await fetch('/api/chat-history');
        if (res.ok) {
          const data = await res.json();
          setHistoryItems(data.history || []);

          // Check if there's a shared chat ID in URL
          const urlParams = new URLSearchParams(window.location.search);
          const sharedChatId = urlParams.get('chat');

          if (sharedChatId) {
            // Load the shared chat
            const sharedChat = data.history.find((item: HistoryItem) => item.id === sharedChatId);
            if (sharedChat) {
              setSelectedHistoryId(sharedChat.id);
              setMessages([
                { role: 'user', content: sharedChat.question, timestamp: sharedChat.created_at },
                { role: 'assistant', content: sharedChat.answer, timestamp: sharedChat.created_at }
              ]);
              setShowSuggestions(false);
              // Clean up URL
              window.history.replaceState({}, '', '/query');
              return;
            }
          }

          // Load the most recent conversation by default
          if (data.history && data.history.length > 0) {
            const firstItem = data.history[0];
            setSelectedHistoryId(firstItem.id);
            setMessages([
              { role: 'user', content: firstItem.question, timestamp: firstItem.created_at },
              { role: 'assistant', content: firstItem.answer, timestamp: firstItem.created_at }
            ]);
            setShowSuggestions(false);
          } else {
            // Generate smart suggestions for new users
            generateSmartSuggestions();
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

  // Generate smart suggestions based on context
  const generateSmartSuggestions = () => {
    const defaultSuggestions = [
      "What are the main topics covered in these documents?",
      "Can you summarize the key findings?",
      "What are the important dates mentioned?",
      "Extract all the action items from the documents",
      "What recommendations are provided?"
    ];

    // If there are recent queries, generate contextual suggestions
    if (historyItems.length > 0) {
      const recentTopics = historyItems.slice(0, 3).map(item => {
        const words = item.question.split(' ');
        return words.slice(0, 5).join(' ') + '...';
      });

      const contextualSuggestions = [
        "Tell me more about the previous topic",
        "What else should I know about this?",
        "Are there any related sections?",
        ...recentTopics
      ];

      setSuggestions(contextualSuggestions.slice(0, 4));
    } else {
      setSuggestions(defaultSuggestions.slice(0, 4));
    }
  };

  useEffect(() => {
    if (messages.length === 0 && !loading) {
      generateSmartSuggestions();
      setShowSuggestions(true);
    }
  }, [messages.length, loading, historyItems]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (customQuestion?: string) => {
    const question = (customQuestion || input).trim();
    if (!question || sending) return;
    setSending(true);
    setShowSuggestions(false);

    // Add new message indicator if this is the first new message
    const isFirstNewMessage = messages.length > 0 && !messages.some(m => m.isNew);
    if (isFirstNewMessage) {
      setMessages((prev) => [...prev, { role: 'separator', content: 'New Messages', isNew: true }]);
    }

    setMessages((prev) => [...prev, { role: 'user', content: question, isNew: true }]);
    if (!customQuestion) setInput('');

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

  const handleShareChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the chat when clicking share
    try {
      const shareUrl = `${window.location.origin}/query?chat=${chatId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(chatId);
      setTimeout(() => setCopiedShareId(null), 2000);
    } catch (err) {
      console.error('Failed to copy share link: ', err);
    }
  };

  const formatMessageContent = (content: string, messageIndex: number) => {
    const parts: React.ReactElement[] = [];
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
    const parts: (string | React.ReactElement)[] = [];
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
      let earliestMatch: { index: number; length: number; element: React.ReactElement } | null = null;

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
    setShowSuggestions(false);
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

  // Render sign-in prompt if user is not authenticated
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

  return (
    <div className="h-screen flex bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Mobile Overlay */}
      {showHistory && (
        <Button
          variant="ghost"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer border-0 p-0 h-full w-full rounded-none"
          onClick={() => setShowHistory(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* History Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 lg:w-72 xl:w-80
        transform transition-transform duration-300 ease-in-out
        ${showHistory ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${showHistory ? 'lg:block' : 'lg:hidden'}
        bg-card/95 backdrop-blur-xl border-r border-border/50
        shadow-2xl lg:shadow-none
      `}>
        <div className="h-full w-full flex flex-col bg-background">
          {/* Sidebar Header */}
          <div className="flex-shrink-0 p-4 border-b border-border bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm">Chat History</h2>
                  <p className="text-xs text-muted-foreground">
                    {historyItems.length} conversation{historyItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
                className="h-8 w-8 p-0 hover:bg-muted lg:hidden rounded-md"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* History List */}
          <ScrollArea className="flex-1 px-2">
            <div className="py-2 space-y-4">
              {Object.entries(historyGroups).map(([groupKey, items]) => (
                <div key={groupKey} className="space-y-1">
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-3 py-2 z-10">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {groupKey}
                    </h3>
                  </div>
                  <div className="space-y-1 px-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`
                          group relative rounded-lg transition-all duration-200 cursor-pointer
                          ${selectedHistoryId === item.id
                            ? 'bg-primary/10 ring-1 ring-primary/20 shadow-sm'
                            : 'hover:bg-muted/60'
                          }
                        `}
                        onClick={() => {
                          loadHistoryConversation(item);
                          setShowHistory(false);
                        }}
                      >
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium line-clamp-2 text-foreground leading-5 pr-2">
                              {item.question}
                            </p>
                            {selectedHistoryId === item.id && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-primary/20 text-primary border-0 px-2 py-0.5 font-medium flex-shrink-0"
                              >
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(item.created_at)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleShareChat(item.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-primary/20"
                            >
                              {copiedShareId === item.id ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Share2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {historyItems.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">No conversations yet</h3>
                  <p className="text-xs text-muted-foreground/80 max-w-[200px] leading-relaxed">
                    Your chat history will appear here once you start asking questions
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-muted-foreground/60 animate-spin" />
                  </div>
                  <p className="text-sm text-muted-foreground">Loading conversations...</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex-shrink-0 p-3 border-t border-border bg-card/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessages([]);
                setSelectedHistoryId(null);
                setShowSuggestions(true);
                setShowHistory(false);
              }}
              className="w-full h-9 text-xs font-medium hover:bg-primary/10 hover:border-primary/30"
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              New Conversation
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="lg:hidden"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="hidden lg:flex"
              >
                <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg lg:text-xl font-semibold text-foreground truncate">
                  Docwise AI
                </h1>
                <p className="text-sm text-muted-foreground truncate hidden sm:block">
                  AI-powered document analysis and Q&A
                </p>
              </div>

              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessages([]);
                    setSelectedHistoryId(null);
                    setShowSuggestions(true);
                  }}
                  className="hidden sm:flex hover:bg-primary/10 hover:border-primary/30"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 relative overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                  <p className="text-muted-foreground">Loading your conversations...</p>
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 lg:py-20 text-center animate-in fade-in-50 duration-500">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3">
                    Ready to explore your documents?
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                    Ask questions, get summaries, or explore insights from your uploaded documents with AI assistance.
                  </p>

                  {/* Enhanced Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="w-full max-w-3xl animate-in slide-in-from-bottom-8 duration-700">
                      <div className="flex items-center gap-2 mb-6 justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Try these questions</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            onClick={() => sendMessage(suggestion)}
                            disabled={sending}
                            variant="ghost"
                            className="group text-left p-5 rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] h-auto"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                                {suggestion}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((m, idx) => {
                  if (m.role === 'separator') {
                    return (
                      <div key={idx} className="flex items-center justify-center py-6">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="h-px bg-border flex-1 max-w-20" />
                          <Badge variant="outline" className="text-xs bg-background">
                            {m.content}
                          </Badge>
                          <div className="h-px bg-border flex-1 max-w-20" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                      style={{ animationDelay: m.isNew ? `${idx * 100}ms` : '0ms' }}
                    >
                      <div className={`max-w-[85%] lg:max-w-[75%] ${m.role === 'assistant' ? 'group' : ''}`}>
                        {/* Avatar for assistant */}
                        {m.role === 'assistant' && (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
                          </div>
                        )}

                        <div className={`
                          rounded-2xl p-4 lg:p-5 shadow-sm border transition-all duration-200 hover:shadow-md break-words overflow-wrap-anywhere
                          ${m.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20 ml-8 lg:ml-12'
                            : 'bg-gradient-to-br from-card to-card/50 border-border/50 mr-8 lg:mr-12'
                          }
                        `}>
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted/50 prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                            {m.role === 'assistant' ? formatMessageContent(m.content, idx) : m.content}
                          </div>

                          {/* Sources */}
                          {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/30">
                              <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Sources</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {m.sources.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-muted/50 hover:bg-muted transition-colors">
                                    {s.file}{s.page ? ` (p. ${s.page})` : ''}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {m.role === 'assistant' && (
                          <div className="flex items-center gap-1 mt-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(idx)}
                              className={`h-8 w-8 p-0 rounded-full transition-all duration-200 hover:scale-110 ${m.liked ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20' : 'hover:text-green-600 hover:bg-green-50'
                                }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDislike(idx)}
                              className={`h-8 w-8 p-0 rounded-full transition-all duration-200 hover:scale-110 ${m.disliked ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20' : 'hover:text-red-600 hover:bg-red-50'
                                }`}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(m.content, idx)}
                              className={`h-8 w-8 p-0 rounded-full transition-all duration-200 hover:scale-110 ${copiedIndex === idx ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20' : 'hover:text-primary hover:bg-primary/10'
                                }`}
                            >
                              {copiedIndex === idx ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {sending && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-300">
                    <div className="max-w-[85%] lg:max-w-[75%]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
                      </div>
                      <div className="rounded-2xl p-4 lg:p-5 bg-gradient-to-br from-card to-card/50 border border-border/50 mr-8 lg:mr-12">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Analyzing your documents...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex gap-3 items-end p-4 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-lg">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your documents..."
                    className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={() => sendMessage()}
                  disabled={sending || !input.trim()}
                  size="sm"
                  className="h-11 w-11 p-0 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Mobile New Chat Button */}
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessages([]);
                    setSelectedHistoryId(null);
                    setShowSuggestions(true);
                  }}
                  className="sm:hidden absolute -top-12 right-0 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}