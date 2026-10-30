// Spoken prompts using the browser's built-in text-to-speech.
// Pre-readers depend on hearing instructions, so every activity speaks.
import { isMuted } from './store.js';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
let voice = null;

function chooseVoice() {
  const voices = synth.getVoices();
  const english = voices.filter((v) => /^en[-_]/i.test(v.lang));
  voice =
    english.find((v) => /^en[-_]US/i.test(v.lang) && /samantha|aria|jenny|zira|google us english|female/i.test(v.name)) ||
    english.find((v) => /^en[-_]US/i.test(v.lang)) ||
    english[0] ||
    null;
}

if (synth) {
  chooseVoice();
  synth.addEventListener?.('voiceschanged', chooseVoice);
}

export function stopSpeaking() {
  synth?.cancel();
}

// say('Find the letter.', 'bee') speaks each line in order and replaces anything
// already being spoken. Resolves when the last line ends.
export function say(...lines) {
  const spoken = lines.filter(Boolean);
  if (!synth || isMuted() || spoken.length === 0) return Promise.resolve();
  synth.cancel();
  return new Promise((resolve) => {
    spoken.forEach((text, i) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      if (i === spoken.length - 1) utterance.onend = utterance.onerror = () => resolve();
      synth.speak(utterance);
    });
  });
}
