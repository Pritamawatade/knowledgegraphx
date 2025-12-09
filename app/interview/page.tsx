// app/voice/page.tsx
"use client";

import { useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function VoiceDebugPage() {
  const socket = useSocket();

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    setError(null);

    if (!socket || !socket.connected) {
      setError("Socket not connected yet");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socket.connected) {
          // Convert Blob → ArrayBuffer → Buffer on server
          const arrayBuffer = await event.data.arrayBuffer();
          socket.emit("audio-chunk", arrayBuffer);
        }
      };

      mediaRecorder.onstart = () => {
        console.log("🎙️ MediaRecorder started");
      };

      mediaRecorder.onstop = () => {
        console.log("🛑 MediaRecorder stopped");
      };

      mediaRecorder.onerror = (evt) => {
        console.error("MediaRecorder error", evt.error);
        setError(evt.error?.message || "MediaRecorder error");
      };

      mediaRecorderRef.current = mediaRecorder;
      // 250 ms chunks
      mediaRecorder.start(250);

      setIsRecording(true);
    } catch (err: any) {
      console.error("getUserMedia error", err);
      setError("Mic permission denied or unavailable");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Voice Streaming – Socket.IO</h1>

      <p className="text-sm">
        Socket status:{" "}
        <span
          className={
            socket?.connected ? "text-green-500" : "text-yellow-500"
          }
        >
          {socket?.connected ? "connected" : "connecting..."}
        </span>
      </p>

      <button
        onClick={toggleRecording}
        disabled={!socket}
        className={`px-4 py-2 rounded text-white ${isRecording ? "bg-red-600" : "bg-blue-600"
          } disabled:bg-gray-500`}
      >
        {isRecording ? "Stop Streaming" : "Start Streaming Mic"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-gray-500 max-w-md text-center">
        When recording, your mic audio is chunked (~250ms) and sent as binary
        via Socket.IO using the <code>audio-chunk</code> event.
        Check your Node server logs to confirm.
      </p>
    </main>
  );
}
