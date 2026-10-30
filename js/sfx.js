// Tiny synthesized sound effects (no audio files needed).
import { isMuted } from './store.js';

let audio = null;

function context() {
  if (isMuted()) return null;
  const Ctor = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) return null;
  audio ??= new Ctor();
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

function tone(frequency, delay, length, { type = 'sine', gain = 0.18 } = {}) {
  const c = context();
  if (!c) return;
  const osc = c.createOscillator();
  const amp = c.createGain();
  const start = c.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(amp).connect(c.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

export const tap = () => tone(520, 0, 0.08);
export const correct = () => {
  tone(660, 0, 0.14);
  tone(880, 0.12, 0.22);
};
export const wrong = () => tone(220, 0, 0.25, { type: 'triangle' });
export const cheer = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25));
