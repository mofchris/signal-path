/**
 * Sound Effects Module
 *
 * Provides audio feedback for game events using the Web Audio API.
 * All sounds are programmatically generated (no external files needed).
 *
 * Architecture notes:
 * - Sound is UI-only (does not affect game state or determinism)
 * - AudioContext requires user interaction to start (browser policy)
 * - Sounds are generated with oscillators for a retro/arcade feel
 */

// ============================================================================
// SOUND STATE
// ============================================================================

/**
 * Sound system state.
 * Tracks whether sound is enabled and holds the AudioContext.
 */
export interface SoundState {
  /** Is sound currently enabled? */
  enabled: boolean;
  /** Master volume (0 to 1) */
  volume: number;
  /** Web Audio API context (created on first user interaction) */
  audioContext: AudioContext | null;
  /** Has the audio been initialized? */
  initialized: boolean;
}

/**
 * Create initial sound state.
 * AudioContext is not created until first user interaction (browser policy).
 */
export function createSoundState(): SoundState {
  return {
    enabled: true,
    volume: 0.3,
    audioContext: null,
    initialized: false,
  };
}

/**
 * Toggle sound on/off.
 */
export function toggleSound(state: SoundState): SoundState {
  return {
    ...state,
    enabled: !state.enabled,
  };
}

/**
 * Set master volume.
 * @param volume - Volume level (0 to 1)
 */
export function setVolume(state: SoundState, volume: number): SoundState {
  return {
    ...state,
    volume: Math.max(0, Math.min(1, volume)),
  };
}

/**
 * Initialize the AudioContext.
 * Must be called from a user interaction event (click, keypress, etc.).
 */
export function initAudio(state: SoundState): SoundState {
  if (state.initialized && state.audioContext) {
    return state;
  }

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return {
      ...state,
      audioContext,
      initialized: true,
    };
  } catch (error) {
    console.warn('Web Audio API not supported:', error);
    return {
      ...state,
      initialized: true, // Mark as initialized to prevent retries
    };
  }
}

// ============================================================================
// SOUND UTILITIES
// ============================================================================

/**
 * Play an oscillator with attack/decay envelope.
 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'square',
  startTime: number = ctx.currentTime
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  // Attack/decay envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ============================================================================
// SOUND GENERATORS
// ============================================================================

/**
 * Play move sound - quick ascending tone.
 * Played when player successfully moves to a new tile.
 */
export function playMoveSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.4;

  // Quick ascending beep
  playTone(ctx, 440, 0.08, vol, 'square');
  playTone(ctx, 550, 0.06, vol * 0.7, 'square', ctx.currentTime + 0.04);
}

/**
 * Play invalid move sound - low dissonant buzz.
 * Played when player tries to move into a wall or invalid tile.
 */
export function playInvalidSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.3;

  // Low dissonant buzz
  playTone(ctx, 110, 0.15, vol, 'sawtooth');
  playTone(ctx, 115, 0.15, vol * 0.5, 'sawtooth');
}

/**
 * Play collect sound - rising arpeggio.
 * Played when player picks up a key.
 */
export function playCollectSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.4;
  const now = ctx.currentTime;

  // Rising arpeggio (C-E-G-C)
  playTone(ctx, 523, 0.1, vol, 'square', now);
  playTone(ctx, 659, 0.1, vol, 'square', now + 0.07);
  playTone(ctx, 784, 0.1, vol, 'square', now + 0.14);
  playTone(ctx, 1047, 0.15, vol * 1.2, 'square', now + 0.21);
}

/**
 * Play unlock sound - descending tone with click.
 * Played when player opens a door with a matching key.
 */
export function playUnlockSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.4;
  const now = ctx.currentTime;

  // Mechanical click (short noise burst)
  const noise = ctx.createOscillator();
  const noiseGain = ctx.createGain();
  noise.type = 'square';
  noise.frequency.value = 200;
  noiseGain.gain.setValueAtTime(vol * 0.6, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.03);

  // Descending tone (door opening)
  playTone(ctx, 400, 0.12, vol, 'triangle', now + 0.03);
  playTone(ctx, 300, 0.15, vol * 0.8, 'triangle', now + 0.12);
}

/**
 * Play win sound - ascending major chord fanfare.
 * Played when player reaches the goal.
 */
export function playWinSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.4;
  const now = ctx.currentTime;

  // Ascending major chord (C major: C-E-G-C)
  // First note
  playTone(ctx, 262, 0.2, vol, 'square', now);
  playTone(ctx, 330, 0.2, vol * 0.7, 'square', now);

  // Second chord
  playTone(ctx, 330, 0.2, vol, 'square', now + 0.15);
  playTone(ctx, 392, 0.2, vol * 0.7, 'square', now + 0.15);

  // Third chord (triumphant)
  playTone(ctx, 392, 0.25, vol, 'square', now + 0.30);
  playTone(ctx, 523, 0.25, vol * 0.8, 'square', now + 0.30);
  playTone(ctx, 659, 0.25, vol * 0.6, 'square', now + 0.30);

  // Final high note
  playTone(ctx, 784, 0.35, vol * 1.2, 'square', now + 0.45);
}

/**
 * Play lose sound - descending minor tone.
 * Played when player dies (hazard, out of energy).
 */
export function playLoseSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.4;
  const now = ctx.currentTime;

  // Descending minor tones (sad/failure feel)
  playTone(ctx, 392, 0.15, vol, 'sawtooth', now);
  playTone(ctx, 349, 0.15, vol * 0.9, 'sawtooth', now + 0.12);
  playTone(ctx, 311, 0.2, vol * 0.8, 'sawtooth', now + 0.24);
  playTone(ctx, 262, 0.3, vol * 0.7, 'sawtooth', now + 0.36);
}

/**
 * Play undo sound - quick reverse beep.
 * Played when player undoes a move.
 */
export function playUndoSound(state: SoundState): void {
  if (!state.enabled || !state.audioContext) return;

  const ctx = state.audioContext;
  const vol = state.volume * 0.3;

  // Quick descending blip (reverse of move)
  playTone(ctx, 550, 0.06, vol, 'square');
  playTone(ctx, 440, 0.08, vol * 0.7, 'square', ctx.currentTime + 0.04);
}
