import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Select a chat or start a new one</h2>
      <p className="text-muted-foreground max-w-sm">
        Choose a conversation from the sidebar or click "New Chat" to start asking questions about your documents.
      </p>
    </div>
  );
}
