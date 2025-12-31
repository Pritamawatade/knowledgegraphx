import { useState, useRef, useCallback, useEffect } from 'react';
import { processAudioToText, textToSpeech } from '@/lib/audio-utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function useVoiceConversation() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  }, []);

  const processUserAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const text = await processAudioToText(audioBlob);
      addMessage('user', text);
      return text;
    } catch (err) {
      console.error('Error processing user audio:', err);
      setError('Failed to process your voice message');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage]);

  const processAssistantResponse = useCallback(async (text: string) => {
    try {
      setIsProcessing(true);
      addMessage('assistant', text);
      
      // Convert the assistant's text to speech
      const audioBlob = await textToSpeech(text);
      
      // Play the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      
      return audio;
    } catch (err) {
      console.error('Error processing assistant response:', err);
      setError('Failed to generate voice response');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const userText = await processUserAudio(audioBlob);
        
        if (userText) {
          // Here you would typically send the text to your AI service
          // and get a response, then call processAssistantResponse
          // For now, we'll just echo the user's message
          await processAssistantResponse(`You said: ${userText}`);
        }
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
      setIsRecording(false);
    }
  }, [processUserAudio, processAssistantResponse]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, []);;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    isProcessing,
    messages,
    error,
    startRecording,
    stopRecording,
    addMessage,
  };
}
