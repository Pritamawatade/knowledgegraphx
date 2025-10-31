'use client';
import { useState } from 'react';

export default function QueryPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Array<{ file: string; page: number | null }>>([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setSources(Array.isArray(data.sources) ? data.sources : []);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Ask your documents 📚</h1>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        className="w-full border p-2 rounded-md"
      />
      <button
        onClick={askQuestion}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
      >
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {answer && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold">Answer:</h2>
          <p>{answer}</p>
          {sources.length > 0 && (
            <div className="mt-3">
              <div className="font-medium">Sources:</div>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {sources.map((s, idx) => (
                  <li key={idx}>{s.file}{s.page ? ` (p. ${s.page})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
