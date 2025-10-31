"use client";
import { useEffect, useRef, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ file: string; page: number | null }>;
};

export default function ClientChat({ initialQuestion, initialAnswer }: { initialQuestion?: string | null; initialAnswer?: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const seed: ChatMessage[] = [];
    if (initialQuestion) seed.push({ role: 'user', content: initialQuestion });
    if (initialAnswer) seed.push({ role: 'assistant', content: initialAnswer });
    return seed;
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
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
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, sources }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
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

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 pb-6">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-10">This conversation is empty. Ask the first question.</div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`w-full flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <div className="mt-3 border-t border-neutral-200 dark:border-neutral-700 pt-2 text-xs opacity-80">
                  <div className="font-medium mb-1">Sources</div>
                  <ul className="list-disc ml-5">
                    {m.sources.map((s, i) => (
                      <li key={i}>
                        {s.file}
                        {s.page ? ` (p. ${s.page})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="w-full flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm">
              <span className="opacity-70">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 pb-4 bg-white/70 dark:bg-neutral-950/70 backdrop-blur z-10">
        <div className="border rounded-xl p-2 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your question…"
            rows={1}
            className="w-full resize-none outline-none bg-transparent p-2 text-sm"
          />
          <div className="flex justify-end">
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


