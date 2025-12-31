import { openai } from './openai';

export const processAudioToText = async (audioBlob: Blob): Promise<string> => {
  try {
    const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};

export const textToSpeech = (text: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      reject(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const audioChunks: BlobPart[] = [];
    let audioContext: AudioContext;
    let mediaRecorder: MediaRecorder;
    let mediaStream: MediaStream;

    const onAudioProcess = (e: AudioProcessingEvent) => {
      // Convert AudioBuffer to Float32Array and then to Int16Array
      const input = e.inputBuffer.getChannelData(0);
      const buffer = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      audioChunks.push(buffer.buffer);
    };

    const onStop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      resolve(audioBlob);
      cleanup();
    };

    const cleanup = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      speechSynthesis.cancel();
    };

    try {
      // Create audio context
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create media stream destination
      const destination = audioContext.createMediaStreamDestination();
      mediaStream = destination.stream;
      
      // Create media recorder
      mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };
      mediaRecorder.onstop = onStop;
      
      // Start recording
      mediaRecorder.start();
      
      // Speak the text
      utterance.voice = speechSynthesis.getVoices()[0]; // Use default voice
      speechSynthesis.speak(utterance);
      
      // Stop after utterance ends
      utterance.onend = () => {
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 500);
      };
      
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
};
