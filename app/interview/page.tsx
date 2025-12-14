"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InterviewPage() {
  const socket = useSocket();

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (payload: { text?: string; error?: string }) => {
      if (payload.error) setError(payload.error);
      else setTranscription(payload.text ?? "");

      socket.emit("transcription", handler);

      return () => {
        socket.off("transcription", handler);
      };
    };
  }, [socket]);

  const startRecording = async () => {
    setError(null);
    setTranscription("");
    if (!socket || !socket.connected) {
      setError("Connection lost. Please wait...");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socket.connected) {
          const arrayBuffer = await event.data.arrayBuffer();
          socket.emit("audio-chunk", arrayBuffer);
        }
      };

      mediaRecorder.onerror = (evt) => {
        console.error("MediaRecorder error", evt.error);
        setError(evt.error?.message || "MediaRecorder error");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);

      setIsRecording(true);
    } catch (err: any) {
      console.error("getUserMedia error", err);
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
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
    <main className="flex min-h-screen flex-col items-center justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white p-8 overflow-hidden relative transition-colors duration-300">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header / Status */}
      <header className="w-full max-w-4xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", socket?.connected ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-yellow-500")} />
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {socket?.connected ? "Live Connection" : "Connecting..."}
          </span>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50"
          >
            {error}
          </motion.div>
        )}
      </header>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl z-10 relative">

        {/* AI Avatar / Visualizer */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          {/* Core Circle */}
          <motion.div
            className="absolute inset-0 rounded-full bg-linear-to-tr from-cyan-500/20 to-purple-500/20 blur-xl"
            animate={{
              scale: isRecording ? [1, 1.2, 1] : 1,
              opacity: isRecording ? [0.5, 0.8, 0.5] : 0.3
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Particles / Noise Effect Simulation */}
          <div className="w-48 h-48 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 brightness-100 contrast-150"></div>

            {isRecording ? (
              <motion.div
                className="flex gap-1 items-center justify-center h-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full"
                    animate={{
                      height: [10, Math.random() * 40 + 20, 10],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-neutral-400 dark:text-neutral-600">
                <MicOff className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
        </div>

        {/* Transcription / Prompt */}
        <div className="text-center space-y-4 min-h-[100px]">
          <AnimatePresence mode="wait">
            {transcription ? (
              <motion.p
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl md:text-2xl font-light text-neutral-800 dark:text-neutral-200 leading-relaxed max-w-xl mx-auto"
              >
                "{transcription}"
              </motion.p>
            ) : (
              <motion.p
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-neutral-400 dark:text-neutral-500 text-lg font-light"
              >
                {isRecording ? "Listening..." : "Tap the microphone to start"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <footer className="w-full max-w-md flex items-center justify-center gap-6 z-10 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          onClick={() => setTranscription("")} // Clear transcript
          title="Clear Transcript"
        >
          <span className="sr-only">Clear</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
        </Button>

        <Button
          onClick={toggleRecording}
          disabled={!socket}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isRecording
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              : "bg-white dark:bg-neutral-100 text-neutral-900 hover:bg-neutral-50 dark:hover:bg-white shadow-neutral-200/50 dark:shadow-white/10 border border-neutral-200 dark:border-transparent"
          )}
        >
          {!socket ? (
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          ) : isRecording ? (
            <div className="w-8 h-8 bg-white rounded-sm" /> // Stop square
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          onClick={stopRecording}
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </footer>
    </main>
  );
}
