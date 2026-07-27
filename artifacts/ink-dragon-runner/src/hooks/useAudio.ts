import { useRef, useCallback, useState, useEffect } from 'react';
import { GameState } from '../game/state';
import { getDayNightFactor } from '../game/utils';

// ---------------------------------------------------------------------------
// Pentatonic scale frequencies (Hz)
// Day: C4 major pentatonic — bright, clear guqin plucks
// Night: G3 minor pentatonic — low, haunting xiao flute
// ---------------------------------------------------------------------------
const DAY_PATTERN = [
  261.63, 329.63, 392.00, 440.00, 392.00, 329.63,
  293.66, 261.63, 392.00, 440.00, 523.25, 440.00,
];
const DAY_RHYTHM = [
  0.55, 0.28, 0.28, 0.55, 0.28, 0.28,
  0.55, 0.28, 0.28, 0.55, 0.28, 0.55,
];

const NIGHT_PATTERN = [
  196.00, 220.00, 261.63, 220.00, 196.00,
  174.61, 196.00, 220.00, 261.63, 293.66, 261.63, 220.00,
];
const NIGHT_RHYTHM = [
  0.75, 0.75, 0.9, 0.75, 0.5,
  0.5, 0.75, 0.75, 0.9, 0.9, 0.75, 0.75,
];

// ---------------------------------------------------------------------------
// Synthesis helpers
// ---------------------------------------------------------------------------
function playGuqinNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  time: number,
  duration: number,
) {
  // Plucked string: triangle wave + fast attack / slow exponential decay
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  // Subtle second partial for warmth
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.999, time + duration);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.exponentialRampToValueAtTime(0.13, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.001, time);
  gain2.gain.setValueAtTime(0.001, time);
  gain2.gain.exponentialRampToValueAtTime(0.04, time + 0.003);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.3);

  osc.connect(gain);
  gain.connect(dest);
  osc2.connect(gain2);
  gain2.connect(dest);

  osc.start(time);
  osc.stop(time + duration + 0.1);
  osc2.start(time);
  osc2.stop(time + duration + 0.1);
}

function playXiaoNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  time: number,
  duration: number,
) {
  // Breathy flute: sine with slow attack and gentle vibrato
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  const noiseGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(5.2, time);
  lfoGain.gain.setValueAtTime(freq * 0.008, time);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  const attack = Math.min(0.12, duration * 0.15);
  const release = Math.min(0.18, duration * 0.2);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.11, time + attack);
  gain.gain.setValueAtTime(0.11, time + duration - release);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  osc.connect(gain);
  gain.connect(dest);
  noiseGain.connect(dest);

  osc.start(time);
  lfo.start(time);
  osc.stop(time + duration + 0.1);
  lfo.stop(time + duration + 0.1);
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------
type BgmMode = 'day' | 'night' | 'stopped';

export const useAudio = (stateRef: React.MutableRefObject<GameState>) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const bgmModeRef = useRef<BgmMode>('stopped');
  const bgmSchedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgmNoteIdxRef = useRef(0);
  const bgmNextTimeRef = useRef(0);

  const prevGameModeRef = useRef(stateRef.current.mode);
  const prevIsNightRef = useRef(false);

  // ------------------------------------------------------------------
  // Ensure AudioContext exists (call after user gesture)
  // ------------------------------------------------------------------
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = isMutedRef.current ? 0 : 0.7;
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
  }, []);

  // ------------------------------------------------------------------
  // BGM scheduler — look-ahead based note scheduling
  // ------------------------------------------------------------------
  const scheduleBgm = useCallback((mode: BgmMode) => {
    if (!ctxRef.current || !masterGainRef.current) return;

    const ctx = ctxRef.current;
    const dest = masterGainRef.current;
    const isNight = mode === 'night';
    const pattern = isNight ? NIGHT_PATTERN : DAY_PATTERN;
    const rhythm = isNight ? NIGHT_RHYTHM : DAY_RHYTHM;
    const LOOK_AHEAD = 0.15; // seconds ahead to schedule
    const SCHEDULE_INTERVAL = 80; // ms between scheduler runs

    const schedule = () => {
      if (bgmModeRef.current !== mode) return;
      const now = ctx.currentTime;
      if (bgmNextTimeRef.current < now) bgmNextTimeRef.current = now + 0.05;

      while (bgmNextTimeRef.current < now + LOOK_AHEAD) {
        const idx = bgmNoteIdxRef.current % pattern.length;
        const freq = pattern[idx];
        const dur = rhythm[idx];

        if (isNight) {
          playXiaoNote(ctx, dest, freq, bgmNextTimeRef.current, dur * 0.88);
        } else {
          playGuqinNote(ctx, dest, freq, bgmNextTimeRef.current, dur * 0.75);
        }

        bgmNextTimeRef.current += dur;
        bgmNoteIdxRef.current++;
      }

      bgmSchedulerRef.current = setTimeout(schedule, SCHEDULE_INTERVAL);
    };

    schedule();
  }, []);

  const startBgm = useCallback((mode: 'day' | 'night') => {
    if (bgmModeRef.current === mode) return; // already playing this mode
    // Stop current
    if (bgmSchedulerRef.current !== null) {
      clearTimeout(bgmSchedulerRef.current);
      bgmSchedulerRef.current = null;
    }
    bgmModeRef.current = mode;
    bgmNoteIdxRef.current = 0;
    bgmNextTimeRef.current = 0;
    scheduleBgm(mode);
  }, [scheduleBgm]);

  const stopBgm = useCallback(() => {
    bgmModeRef.current = 'stopped';
    if (bgmSchedulerRef.current !== null) {
      clearTimeout(bgmSchedulerRef.current);
      bgmSchedulerRef.current = null;
    }
  }, []);

  // ------------------------------------------------------------------
  // Sound effects
  // ------------------------------------------------------------------
  const playJump = useCallback(() => {
    ensureCtx();
    const ctx = ctxRef.current;
    const dest = masterGainRef.current;
    if (!ctx || !dest || isMutedRef.current) return;

    // Light ascending chirp — two quick rising tones
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.2);
  }, [ensureCtx]);

  const playHit = useCallback(() => {
    ensureCtx();
    const ctx = ctxRef.current;
    const dest = masterGainRef.current;
    if (!ctx || !dest) return;
    // Temporarily ignore mute so the hit always registers
    const now = ctx.currentTime;

    // Low thud: sawtooth drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.45);

    // Short noise burst for impact
    const bufSize = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buf;
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + 0.15);
  }, [ensureCtx]);

  const playPowerUpCollect = useCallback(() => {
    ensureCtx();
    const ctx = ctxRef.current;
    const dest = masterGainRef.current;
    if (!ctx || !dest || isMutedRef.current) return;

    const now = ctx.currentTime;
    // 五聲音階靈動三連音 (C5 -> E5 -> G5)
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  }, [ensureCtx]);

  const playShieldBreak = useCallback(() => {
    ensureCtx();
    const ctx = ctxRef.current;
    const dest = masterGainRef.current;
    if (!ctx || !dest || isMutedRef.current) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.2);
  }, [ensureCtx]);

  const playBoost = useCallback(() => {
    ensureCtx();
    const ctx = ctxRef.current;
    const dest = masterGainRef.current;
    if (!ctx || !dest || isMutedRef.current) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.4);
  }, [ensureCtx]);

  // ------------------------------------------------------------------
  // Mute toggle
  // ------------------------------------------------------------------
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    setIsMuted(isMutedRef.current);
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        isMutedRef.current ? 0 : 0.7,
        ctxRef.current?.currentTime ?? 0,
        0.05,
      );
    }
  }, []);

  // ------------------------------------------------------------------
  // Watch game state changes (mode + day/night transition)
  // ------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const state = stateRef.current;
      const isNight = getDayNightFactor(state.score) >= 0.5;
      const mode = state.mode;

      // Mode transitions
      if (mode !== prevGameModeRef.current) {
        if (mode === 'PLAYING') {
          ensureCtx();
          startBgm(isNight ? 'night' : 'day');
        } else {
          stopBgm();
        }
        prevGameModeRef.current = mode;
        prevIsNightRef.current = isNight;
      }

      // Day → Night transition while playing
      if (mode === 'PLAYING' && isNight !== prevIsNightRef.current) {
        startBgm(isNight ? 'night' : 'day');
        prevIsNightRef.current = isNight;
      }
    }, 120);

    return () => {
      clearInterval(interval);
      stopBgm();
    };
  }, [stateRef, ensureCtx, startBgm, stopBgm]);

  return { playJump, playHit, playPowerUpCollect, playShieldBreak, playBoost, toggleMute, isMuted, ensureCtx };
};
