/* ==========================================================================
   PANDYA BET - GAME LOGIC, STATES, & AUDIO ENGINE
   ========================================================================== */

// --- Audio Synthesizer Engine (Using Web Audio API - Zero External Assets) ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// --- Background Music System Variables ---
let bgmAudio = null;
let bgmIsPlaying = false;
let bgmVolume = parseFloat(localStorage.getItem('bgm_volume') !== null ? localStorage.getItem('bgm_volume') : '0.5');
let bgmCurrentIndex = parseInt(localStorage.getItem('bgm_current_index') !== null ? localStorage.getItem('bgm_current_index') : '0');

const bgmTracks = [
  {
    name: "Cyberpunk City",
    genre: "Neon synthwave atmosphere",
    url: "https://raw.githubusercontent.com/SillyTavern/SillyTavern-Content/main/assets/ambient/bedroom-cyberpunk.mp3"
  },
  {
    name: "Autumn Great Tree",
    genre: "Chill fantasy lofi loop",
    url: "https://raw.githubusercontent.com/SillyTavern/SillyTavern-Content/main/assets/ambient/landscape-autumn-great-tree.mp3"
  },
  {
    name: "Tropical Breeze",
    genre: "Relaxing ocean night vibe",
    url: "https://raw.githubusercontent.com/SillyTavern/SillyTavern-Content/main/assets/ambient/landscape-beach-night.mp3"
  },
  {
    name: "Procedural Synth",
    genre: "Offline algorithmic sequence",
    url: null
  }
];

function initBGM() {
  if (bgmAudio) return;
  
  bgmAudio = new Audio();
  bgmAudio.loop = true;
  bgmAudio.crossOrigin = "anonymous";
  bgmAudio.volume = bgmVolume;
  
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicDropdown = document.getElementById('music-player-dropdown');
  const volumeSlider = document.getElementById('music-volume-slider');
  
  if (musicToggleBtn && musicDropdown) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      musicDropdown.classList.toggle('active');
    });
    
    musicDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    document.addEventListener('click', () => {
      musicDropdown.classList.remove('active');
    });
  }
  
  if (volumeSlider) {
    volumeSlider.value = bgmVolume;
    volumeSlider.addEventListener('input', (e) => {
      bgmVolume = parseFloat(e.target.value);
      localStorage.setItem('bgm_volume', bgmVolume.toString());
      if (bgmAudio) {
        bgmAudio.volume = bgmVolume;
      }
    });
  }
  
  selectMusicTrack(bgmCurrentIndex, false);
}

function selectMusicTrack(index, shouldStartPlaying = true) {
  if (index < 0 || index >= bgmTracks.length) return;
  
  if (bgmCurrentIndex === 3 && index !== 3) {
    stopSpribeBgMusic();
  }
  
  if (bgmAudio) {
    bgmAudio.pause();
  }
  
  bgmCurrentIndex = index;
  localStorage.setItem('bgm_current_index', bgmCurrentIndex.toString());
  
  const track = bgmTracks[bgmCurrentIndex];
  
  for (let i = 0; i < bgmTracks.length; i++) {
    const btn = document.getElementById(`track-btn-${i}`);
    if (btn) {
      if (i === index) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }
  
  const titleEl = document.getElementById('music-track-title');
  const genreEl = document.getElementById('music-track-genre');
  if (titleEl) titleEl.textContent = track.name;
  if (genreEl) genreEl.textContent = track.genre;
  
  if (track.url) {
    bgmAudio.src = track.url;
    if (bgmIsPlaying && shouldStartPlaying) {
      bgmAudio.play().catch(e => console.log("Audio play deferred."));
    }
  } else {
    if (bgmIsPlaying && shouldStartPlaying) {
      startSpribeBgMusic();
    }
  }
  
  updateBGMPlayerUI();
}

function toggleMusicPlayback() {
  initBGM();
  
  bgmIsPlaying = !bgmIsPlaying;
  
  const track = bgmTracks[bgmCurrentIndex];
  if (bgmIsPlaying) {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    if (track.url) {
      bgmAudio.play().catch(e => {
        console.log("Audio play deferred or blocked:", e);
      });
    } else {
      startSpribeBgMusic();
    }
  } else {
    if (track.url) {
      bgmAudio.pause();
    } else {
      stopSpribeBgMusic();
    }
  }
  
  updateBGMPlayerUI();
}

function nextMusicTrack() {
  let nextIdx = (bgmCurrentIndex + 1) % bgmTracks.length;
  selectMusicTrack(nextIdx, true);
}

function prevMusicTrack() {
  let prevIdx = (bgmCurrentIndex - 1 + bgmTracks.length) % bgmTracks.length;
  selectMusicTrack(prevIdx, true);
}

function updateBGMPlayerUI() {
  const playBtn = document.getElementById('music-play-btn');
  const dropdown = document.getElementById('music-player-dropdown');
  const toggleBtn = document.getElementById('music-toggle-btn');
  
  if (playBtn) {
    playBtn.textContent = bgmIsPlaying ? '⏸' : '▶️';
  }
  
  if (dropdown) {
    if (bgmIsPlaying) {
      dropdown.classList.add('playing');
    } else {
      dropdown.classList.remove('playing');
    }
  }
  
  if (toggleBtn) {
    if (bgmIsPlaying) {
      toggleBtn.classList.add('active');
    } else {
      toggleBtn.classList.remove('active');
    }
  }
}

// Play simple synth sound with flexible oscillators
function playSynthSound(freq, type, duration, gainValue = 0.1, stopDelay = 0) {
  if (!window.soundEnabled) return;
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);
  // Linear decay ramp
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime + stopDelay);
  osc.stop(audioCtx.currentTime + duration + stopDelay);
}

// Customized Audio Triggers
function playTickSound() {
  playSynthSound(880, 'sine', 0.05, 0.08); // High click beep
}

function playLockSound() {
  playSynthSound(220, 'triangle', 0.2, 0.15); // Low blunt sound
}

function playWinSound() {
  // Arpeggio
  const now = 0.08;
  playSynthSound(523.25, 'triangle', 0.2, 0.12); // C5
  playSynthSound(659.25, 'triangle', 0.2, 0.12, now); // E5
  playSynthSound(783.99, 'triangle', 0.2, 0.12, now * 2); // G5
  playSynthSound(1046.50, 'sine', 0.35, 0.15, now * 3); // C6 (Victory)
}

function playLoseSound() {
  // Sliding down sound
  if (!window.soundEnabled) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
  osc.frequency.linearRampToValueAtTime(110.00, audioCtx.currentTime + 0.4); // A2
  
  gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

// Jet Engine noise simulation replaced with dynamic flight chimes
let jetNode = null;
let jetOsc = null;
let flyBeepIntervalId = null;

function startJetEngineSound() {
  if (!window.soundEnabled) return;
  initAudio();
  
  if (flyBeepIntervalId) clearInterval(flyBeepIntervalId);
  
  flyBeepIntervalId = setInterval(() => {
    let mult = 1.00;
    if (activeScreen === 'aviator') mult = aviatorMultiplier;
    else if (activeScreen === 'spribe-aviator') mult = spribeMultiplier;
    else if (activeScreen === 'jetx') mult = jetxMultiplier;
    
    playFlightChime(mult);
  }, 350);
}

function playFlightChime(multiplier) {
  try {
    if (!window.soundEnabled || !audioCtx) return;
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    const baseFreq = 500 + (multiplier * 80);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.08, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.015, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

function updateJetEnginePitch(multiplier) {
  // Handled dynamically by scheduled chime notes
}

function stopJetEngineSound(isCrash = false) {
  if (flyBeepIntervalId) {
    clearInterval(flyBeepIntervalId);
    flyBeepIntervalId = null;
  }
  
  if (isCrash) {
    // Play explosion sound effect (Low noise burst)
    playSynthSound(60, 'sawtooth', 0.65, 0.25);
    playSynthSound(90, 'triangle', 0.45, 0.2);
  }
}

let spribeSeqTimerId = null;
let spribeNextStepTime = 0.0;
let spribeSeqStep = 0;

function startSpribeBgMusic() {
  if (bgmCurrentIndex !== 3 || !bgmIsPlaying) return;
  stopSpribeBgMusic();
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  spribeNextStepTime = audioCtx.currentTime + 0.05;
  spribeSeqStep = 0;
  spribeSeqTimerId = setInterval(spribeSequenceScheduler, 40);
}

function stopSpribeBgMusic() {
  if (spribeSeqTimerId) {
    clearInterval(spribeSeqTimerId);
    spribeSeqTimerId = null;
  }
}

function spribeSequenceScheduler() {
  while (spribeNextStepTime < audioCtx.currentTime + 0.12) {
    scheduleSpribeSeqStep(spribeSeqStep, spribeNextStepTime);
    spribeNextStepTime += 0.25; // 120 BPM, 8th notes
    spribeSeqStep = (spribeSeqStep + 1) % 32;
  }
}

let noiseBuffer = null;
function getNoiseBuffer() {
  if (!noiseBuffer && audioCtx) {
    try {
      const bufferSize = audioCtx.sampleRate * 1.0;
      noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } catch (e) {
      console.warn("Failed to create noise buffer:", e);
    }
  }
  return noiseBuffer;
}

function playSynthesizedKick(time) {
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.15);
    
    gainNode.gain.setValueAtTime(0.18 * bgmVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.15);
  } catch (e) {}
}

function playSynthesizedSnare(time) {
  try {
    const noise = audioCtx.createBufferSource();
    const nBuf = getNoiseBuffer();
    if (!nBuf) return;
    noise.buffer = nBuf;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, time);
    noiseFilter.Q.setValueAtTime(1.5, time);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.06 * bgmVolume, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.08);
    
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.05 * bgmVolume, time);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    
    noise.start(time);
    noise.stop(time + 0.18);
    osc.start(time);
    osc.stop(time + 0.08);
  } catch (e) {}
}

function playSynthesizedHat(time) {
  try {
    const noise = audioCtx.createBufferSource();
    const nBuf = getNoiseBuffer();
    if (!nBuf) return;
    noise.buffer = nBuf;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.012 * bgmVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start(time);
    noise.stop(time + 0.05);
  } catch (e) {}
}

function playSynthesizedBass(freq, time, duration) {
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, time);
    
    gainNode.gain.setValueAtTime(0.06 * bgmVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  } catch (e) {}
}

function playSynthesizedMelody(freq, time, duration) {
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const delay = audioCtx.createDelay();
    const delayFeedback = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(0.015 * bgmVolume, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    
    delay.delayTime.setValueAtTime(0.24, time);
    delayFeedback.gain.setValueAtTime(0.35 * bgmVolume, time);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.connect(delay);
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFeedback.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + duration + 0.8);
  } catch (e) {}
}

function playSynthesizedPad(freqs, time, duration) {
  try {
    freqs.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, time);
      
      gainNode.gain.setValueAtTime(0.0001, time);
      gainNode.gain.linearRampToValueAtTime(0.018 * bgmVolume, time + 0.3); // smooth attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration); // decay
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    });
  } catch (e) {}
}

function scheduleSpribeSeqStep(step, time) {
  // 1. Kick on 0, 8, 16, 24
  if (step === 0 || step === 8 || step === 16 || step === 24) {
    playSynthesizedKick(time);
  }
  
  // 2. Snare on 4, 12, 20, 28
  if (step === 4 || step === 12 || step === 20 || step === 28) {
    playSynthesizedSnare(time);
  }
  
  // 3. Hi-hats on offbeats (2, 6, 10, 14, 18, 22, 26, 30)
  if (step % 4 === 2) {
    playSynthesizedHat(time);
  }
  
  // 4. Constant driving 8th note bassline roots
  const bar = Math.floor(step / 8);
  if (bar === 0) playSynthesizedBass(55.00, time, 0.22); // A1 (Am)
  else if (bar === 1) playSynthesizedBass(43.65, time, 0.22); // F1 (F Maj)
  else if (bar === 2) playSynthesizedBass(65.41, time, 0.22); // C2 (C Maj)
  else if (bar === 3) playSynthesizedBass(49.00, time, 0.22); // G1 (G Maj)
  
  // 5. Spacey chord pad triggers
  if (step === 0) playSynthesizedPad([110.00, 220.00, 261.63, 329.63], time, 1.9); // Am
  else if (step === 8) playSynthesizedPad([87.31, 174.61, 261.63, 349.23], time, 1.9); // F Maj
  else if (step === 16) playSynthesizedPad([130.81, 261.63, 329.63, 392.00], time, 1.9); // C Maj
  else if (step === 24) playSynthesizedPad([98.00, 196.00, 293.66, 392.00], time, 1.9); // G Maj
  
  // 6. JetX retro space melody triggers
  if (step === 0) playSynthesizedMelody(659.25, time, 0.7); // E5
  else if (step === 2) playSynthesizedMelody(783.99, time, 0.7); // G5
  else if (step === 4) playSynthesizedMelody(880.00, time, 0.7); // A5
  else if (step === 6) playSynthesizedMelody(987.77, time, 0.7); // B5
  else if (step === 8) playSynthesizedMelody(1046.50, time, 0.7); // C6
  else if (step === 10) playSynthesizedMelody(987.77, time, 0.7); // B5
  else if (step === 12) playSynthesizedMelody(880.00, time, 0.7); // A5
  else if (step === 14) playSynthesizedMelody(783.99, time, 0.7); // G5
  else if (step === 16) playSynthesizedMelody(659.25, time, 0.7); // E5
  else if (step === 18) playSynthesizedMelody(783.99, time, 0.7); // G5
  else if (step === 20) playSynthesizedMelody(880.00, time, 0.7); // A5
  else if (step === 22) playSynthesizedMelody(987.77, time, 0.7); // B5
  else if (step === 24) playSynthesizedMelody(1174.66, time, 0.7); // D6
  else if (step === 26) playSynthesizedMelody(1046.50, time, 0.7); // C6
  else if (step === 28) playSynthesizedMelody(987.77, time, 0.7); // B5
  else if (step === 30) playSynthesizedMelody(880.00, time, 0.7); // A5
}

function playSpribeCashoutChime() {
  if (!window.soundEnabled) return;
  initAudio();
  try {
    const now = audioCtx.currentTime;
    const playTone = (freq, delay, dur) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gainNode.gain.setValueAtTime(0.12, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur);
    };
    // Play ascending major arpeggio chime (C5 -> E5 -> G5 -> C6)
    playTone(523.25, 0, 0.15);      // C5
    playTone(659.25, 0.06, 0.15);   // E5
    playTone(783.99, 0.12, 0.15);   // G5
    playTone(1046.50, 0.18, 0.35);  // C6
  } catch (e) {}
}

function playSynthesizedCrashMusic() {
  try {
    if (!window.soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Play a white noise explosion sweep
    const noise = audioCtx.createBufferSource();
    const nBuf = getNoiseBuffer();
    if (nBuf) {
      noise.buffer = nBuf;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.85);
    }
    
    // Play a cool pitch-descending retro synth explosion boom
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
    
    gainNode.gain.setValueAtTime(0.20, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {}
}

function playSpribeCrashWhooshSound() {
  playSynthesizedCrashMusic();
}



// --- Global Application States ---
window.soundEnabled = true;
let walletBalance = parseFloat(localStorage.getItem('pandya_wallet_bal') || '1000.00');
let activeScreen = 'lobby';

// Win Go (Color Prediction) States
let wingoPeriodId = parseInt(localStorage.getItem('pandya_wingo_period') || '202607101001');
let wingoSecondsRemaining = 60;
let wingoTimerId = null;
let wingoBetsPlaced = []; // Tracks current round bets: [{ type: 'color'/'number'/'size', selection: 'Red'/3, totalBet: 100 }]
let wingoHistory = JSON.parse(localStorage.getItem('pandya_wingo_history') || '[]');
let userWingoBetsHistory = JSON.parse(localStorage.getItem('pandya_user_wingo_history') || '[]');

// Bet Selection Drawer details state
let currentBetDrawerType = ''; // 'color', 'number', 'size'
let currentBetDrawerSelection = null; // e.g. 'Green', 5, 'Big'
let currentBetBaseAmount = 1;
let currentBetMultiplier = 1;

// Aviator Game States
let aviatorState = 'waiting'; // 'waiting', 'flying', 'crashed'
let aviatorMultiplier = 1.00;
let aviatorTimeElapsed = 0;
let aviatorCrashLimit = 1.50;
let aviatorHistory = [1.24, 2.50, 1.08, 12.44, 1.95, 3.80, 1.15, 6.40, 2.10, 1.55];
let aviatorBets = {
  left: { amount: 100, placed: false, cashoutAmt: 0, win: false },
  right: { amount: 200, placed: false, cashoutAmt: 0, win: false }
};
let aviatorCanvas = null;
let aviatorCtx = null;
let aviatorAnimId = null;
let aviatorWaitTimer = 5; // seconds to countdown before takeoff

// Spribe Aviator Game States
let spribeState = 'waiting'; // 'waiting', 'flying', 'crashed'
let spribeMultiplier = 1.00;
let spribeTimeElapsed = 0;
let spribeCrashLimit = 1.50;
let spribeHistory = [1.02, 2.15, 1.40, 15.32, 1.05, 3.20, 1.95, 1.10, 8.40, 1.55];
let spribeBets = {
  left: { amount: 100, placed: false, win: false, autoBet: false, autoCashOut: false, autoCashOutVal: 2.00 },
  right: { amount: 200, placed: false, win: false, autoBet: false, autoCashOut: false, autoCashOutVal: 2.00 }
};
let spribeCanvas = null;
let spribeCtx = null;
let spribeAnimId = null;
let spribeWaitTimer = 5; // countdown
let spribeIntervalId = null;
let spribeActiveTableTab = 'all'; // 'all' or 'my'
let spribeLivePlayers = [];
let spribeMyBetsHistory = [];
let spribeCrashAnimTime = 0;
let lastSpribeCurveEndX = 0;
let lastSpribeCurveEndY = 0;

// JetX Game States
let jetxState = 'waiting'; // 'waiting', 'flying', 'crashed'
let jetxMultiplier = 1.00;
let jetxTimeElapsed = 0;
let jetxCrashLimit = 1.50;
let jetxHistory = [1.54, 2.20, 1.05, 8.44, 1.80, 4.20, 1.25, 5.10, 2.80, 1.35];
let jetxBets = {
  left: { amount: 100, placed: false, win: false, autoBet: false, autoCashOut: false, autoCashOutVal: 2.00 },
  right: { amount: 200, placed: false, win: false, autoBet: false, autoCashOut: false, autoCashOutVal: 2.00 }
};
let jetxCanvas = null;
let jetxCtx = null;
let jetxAnimId = null;
let jetxWaitTimer = 5;
let jetxIntervalId = null;
let jetxActiveTableTab = 'all'; // 'all' or 'my'
let jetxLivePlayers = [];
let jetxMyBetsHistory = [];
let jetxCrashAnimTime = 0;
let lastJetxCurveEndX = 0;
let lastJetxCurveEndY = 0;

// Deposit details state
let selectedDepositMethod = 'UPI Fast';
let selectedDepositAmountPreset = 500;

// DOM variables cache
let userBalanceEl, screenLobby, screenWingo, screenAviator, screenSpribeAviator, screenJetx, screenCrictrade, soundToggleBtn;


// --- DOM Ready Entrypoint ---
document.addEventListener('DOMContentLoaded', () => {
  // Cache selector nodes
  userBalanceEl = document.getElementById('user-balance');
  screenLobby = document.getElementById('screen-lobby');
  screenWingo = document.getElementById('screen-wingo');
  screenAviator = document.getElementById('screen-aviator');
  screenSpribeAviator = document.getElementById('screen-spribe-aviator');
  screenJetx = document.getElementById('screen-jetx');
  screenCrictrade = document.getElementById('screen-crictrade');
  soundToggleBtn = document.getElementById('sound-toggle-btn');
  
  // Handle intro splash screen display for 2 seconds
  const splashScreen = document.getElementById('splash-screen');
  const loginPage = document.getElementById('screen-login');
  
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      
      // Check login status after splash screen fades
      setTimeout(() => {
        splashScreen.remove();
        const isLoggedIn = localStorage.getItem('pandya_logged_in') === 'true';
        if (isLoggedIn) {
          if (loginPage) loginPage.classList.add('hidden');
        } else {
          if (loginPage) loginPage.classList.remove('hidden');
        }
      }, 500);
    }, 2000);
  } else {
    // If no splash screen, check login status immediately
    const isLoggedIn = localStorage.getItem('pandya_logged_in') === 'true';
    if (isLoggedIn) {
      if (loginPage) loginPage.classList.add('hidden');
    } else {
      if (loginPage) loginPage.classList.remove('hidden');
    }
  }
  
  // Set initial UI elements
  updateBalanceUI();
  initSoundToggleButton();
  initBGM();
  
  // Start active game engines
  startWingoCountdownEngine();
  startWinnersTickerFeed();
  
  // Pre-fill history list with dummy outcomes if storage is empty
  if (wingoHistory.length === 0) {
    generateMockWingoHistory();
  } else {
    renderWingoHistoryList();
  }
  
  renderUserWingoBetsList();
  
  // Initialize Aviator history badges
  renderAviatorHistoryBadges();
  
  // Initialize Spribe history badges
  renderSpribeHistoryBadges();
  
  // Initialize JetX history badges
  renderJetxHistoryBadges();
});


// --- General UI helpers ---
function updateBalanceUI() {
  if (userBalanceEl) {
    userBalanceEl.textContent = walletBalance.toFixed(2);
  }
  const withdrawBalEl = document.getElementById('withdraw-avail-bal');
  if (withdrawBalEl) {
    withdrawBalEl.textContent = `₹${walletBalance.toFixed(2)}`;
  }
  localStorage.setItem('pandya_wallet_bal', walletBalance.toString());
}

function initSoundToggleButton() {
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      window.soundEnabled = !window.soundEnabled;
      soundToggleBtn.innerHTML = window.soundEnabled ? '<span class="icon">🔊</span>' : '<span class="icon">🔇</span>';
      
      // Request audio context resume on click
      if (window.soundEnabled) {
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
      }
    });
  }
}

// Navigation between Fullscreen Screens
function navigateToScreen(screenId) {
  // Cancel active Aviator loops if navigating away
  if (activeScreen === 'aviator' && screenId !== 'aviator') {
    cancelAnimationFrame(aviatorAnimId);
    stopJetEngineSound();
  }
  
  if (activeScreen === 'spribe-aviator' && screenId !== 'spribe-aviator') {
    cancelAnimationFrame(spribeAnimId);
    if (spribeIntervalId) clearInterval(spribeIntervalId);
    stopJetEngineSound();
  }
  
  if (activeScreen === 'jetx' && screenId !== 'jetx') {
    cancelAnimationFrame(jetxAnimId);
    if (jetxIntervalId) clearInterval(jetxIntervalId);
    stopJetEngineSound();
  }

  if (activeScreen === 'crictrade' && screenId !== 'crictrade') {
    stopCricTradeEngine();
  }
  
  // Handled globally by continuous BGM system
  
  activeScreen = screenId;
  
  // Toggle active CSS classes
  screenLobby.classList.remove('active');
  screenWingo.classList.remove('active');
  screenAviator.classList.remove('active');
  if (screenSpribeAviator) screenSpribeAviator.classList.remove('active');
  if (screenJetx) screenJetx.classList.remove('active');
  if (screenCrictrade) screenCrictrade.classList.remove('active');
  
  // Remove active state on navbar buttons
  document.querySelectorAll('.app-navigation-bar .nav-tab').forEach(tab => tab.classList.remove('active'));
  
  if (screenId === 'lobby') {
    screenLobby.classList.add('active');
    document.querySelectorAll('.app-navigation-bar .nav-tab')[0].classList.add('active');
  } else if (screenId === 'wingo') {
    screenWingo.classList.add('active');
    document.querySelectorAll('.app-navigation-bar .nav-tab')[1].classList.add('active');
  } else if (screenId === 'aviator') {
    screenAviator.classList.add('active');
    document.querySelectorAll('.app-navigation-bar .nav-tab')[2].classList.add('active');
    initAviatorEngine(); // Start Aviator loop when entering screen
  } else if (screenId === 'spribe-aviator') {
    if (screenSpribeAviator) screenSpribeAviator.classList.add('active');
    initSpribeAviatorEngine(); // Start Spribe Aviator loop when entering screen
  } else if (screenId === 'jetx') {
    if (screenJetx) screenJetx.classList.add('active');
    initJetxEngine(); // Start JetX loop when entering screen
  } else if (screenId === 'crictrade') {
    if (screenCrictrade) screenCrictrade.classList.add('active');
    initCricTradeEngine(); // Start CricTrade loop when entering screen
  }
}


// --- WIN GO (COLOR PREDICTION) ENGINE ---

function startWingoCountdownEngine() {
  const periodValueEl = document.getElementById('wingo-period-id');
  const tensEl = document.getElementById('wingo-seconds-tens');
  const onesEl = document.getElementById('wingo-seconds-ones');
  const lockBarrier = document.getElementById('bet-lock-barrier');
  
  if (periodValueEl) periodValueEl.textContent = wingoPeriodId;

  // Clear existing loop if any
  if (wingoTimerId) clearInterval(wingoTimerId);
  
  wingoTimerId = setInterval(() => {
    wingoSecondsRemaining--;
    
    // Play tick sound on critical countdown
    if (wingoSecondsRemaining <= 5 && wingoSecondsRemaining > 0) {
      playTickSound();
    }
    
    // Toggle Bet Locking status in the last 5 seconds of the round
    if (wingoSecondsRemaining <= 5) {
      if (lockBarrier && lockBarrier.style.display === 'none') {
        lockBarrier.style.display = 'flex';
        playLockSound();
      }
    } else {
      if (lockBarrier && lockBarrier.style.display !== 'none') {
        lockBarrier.style.display = 'none';
      }
    }

    if (wingoSecondsRemaining < 0) {
      // Draw Winning Outcome result
      drawWingoOutcomeResult();
      wingoSecondsRemaining = 60;
    }
    
    // Format digits
    const tensDigit = Math.floor(wingoSecondsRemaining / 10);
    const onesDigit = wingoSecondsRemaining % 10;
    
    if (tensEl) tensEl.textContent = tensDigit;
    if (onesEl) onesEl.textContent = onesDigit;
  }, 1000);
}

// Generate pre-loaded log database if empty
function generateMockWingoHistory() {
  const basePeriod = wingoPeriodId - 20;
  for (let i = 0; i < 15; i++) {
    const pId = basePeriod + i;
    const num = Math.floor(Math.random() * 10);
    const size = num >= 5 ? 'Big' : 'Small';
    let color = '';
    
    if (num === 0) color = 'violet-red';
    else if (num === 5) color = 'violet-green';
    else if (num % 2 === 0) color = 'red';
    else color = 'green';
    
    wingoHistory.unshift({ period: pId, number: num, size: size, color: color });
  }
  localStorage.setItem('pandya_wingo_history', JSON.stringify(wingoHistory));
  renderWingoHistoryList();
}

function renderWingoHistoryList() {
  const container = document.getElementById('wingo-game-results-list');
  if (!container) return;
  container.innerHTML = '';
  
  wingoHistory.slice(0, 30).forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'record-row';
    
    // Determine color class
    let colorBadgeHtml = '';
    if (row.color === 'violet-red') {
      colorBadgeHtml = '<span class="color-dot violet-red"></span>';
    } else if (row.color === 'violet-green') {
      colorBadgeHtml = '<span class="color-dot violet-green"></span>';
    } else {
      colorBadgeHtml = `<span class="color-dot ${row.color}"></span>`;
    }
    
    rowDiv.innerHTML = `
      <span class="period-cell">${row.period}</span>
      <span class="num-cell color-${row.color}">${row.number}</span>
      <span class="size-cell ${row.size === 'Big' ? 'big-label' : 'small-label'}">${row.size}</span>
      <span>${colorBadgeHtml}</span>
    `;
    container.appendChild(rowDiv);
  });
}

function renderUserWingoBetsList() {
  const container = document.getElementById('wingo-user-bets-list');
  if (!container) return;
  
  if (userWingoBetsHistory.length === 0) {
    container.innerHTML = '<div class="empty-record-placeholder">No bets placed in this session.</div>';
    return;
  }
  
  container.innerHTML = '';
  userWingoBetsHistory.slice(0, 30).forEach(bet => {
    const row = document.createElement('div');
    row.className = 'user-bet-row';
    
    let payoutHtml = '';
    if (bet.status === 'Won') {
      payoutHtml = `<span class="payout-cell won-color">+₹${bet.payout.toFixed(2)}</span>`;
    } else if (bet.status === 'Lost') {
      payoutHtml = `<span class="payout-cell lost-color">-₹${bet.amount.toFixed(2)}</span>`;
    } else {
      payoutHtml = `<span class="payout-cell">Pending...</span>`;
    }
    
    row.innerHTML = `
      <span class="period-cell">${bet.period}</span>
      <span class="bet-cell">${bet.selection}</span>
      <span>₹${bet.amount.toFixed(0)}</span>
      <span>${payoutHtml}</span>
    `;
    container.appendChild(row);
  });
}

// Confirm bet selections and draw outcomes
function drawWingoOutcomeResult() {
  const num = Math.floor(Math.random() * 10);
  const size = num >= 5 ? 'Big' : 'Small';
  let color = '';
  
  if (num === 0) color = 'violet-red';
  else if (num === 5) color = 'violet-green';
  else if (num % 2 === 0) color = 'red';
  else color = 'green';
  
  const currentResult = {
    period: wingoPeriodId,
    number: num,
    size: size,
    color: color
  };
  
  // Prepend result
  wingoHistory.unshift(currentResult);
  localStorage.setItem('pandya_wingo_history', JSON.stringify(wingoHistory));
  renderWingoHistoryList();
  
  // Evaluate user bets for current period
  evaluateUserWingoBets(currentResult);
  
  // Advance period ID
  wingoPeriodId++;
  localStorage.setItem('pandya_wingo_period', wingoPeriodId.toString());
  
  // Update Period ID element
  const periodValueEl = document.getElementById('wingo-period-id');
  if (periodValueEl) periodValueEl.textContent = wingoPeriodId;
}

function evaluateUserWingoBets(result) {
  let roundWinnings = 0;
  let hasWon = false;
  let hasActiveBets = false;
  
  userWingoBetsHistory.forEach(bet => {
    if (bet.period === result.period && bet.status === 'Pending') {
      hasActiveBets = true;
      let wins = false;
      let payoutRate = 0;
      
      // Match condition check
      if (bet.type === 'color') {
        if (bet.selection === 'Green') {
          if (result.color === 'green') { wins = true; payoutRate = 2.0; }
          else if (result.color === 'violet-green') { wins = true; payoutRate = 1.5; }
        } else if (bet.selection === 'Red') {
          if (result.color === 'red') { wins = true; payoutRate = 2.0; }
          else if (result.color === 'violet-red') { wins = true; payoutRate = 1.5; }
        } else if (bet.selection === 'Violet') {
          if (result.color === 'violet-red' || result.color === 'violet-green') { wins = true; payoutRate = 4.5; }
        }
      } else if (bet.type === 'size') {
        if (bet.selection === 'Big' && result.size === 'Big') { wins = true; payoutRate = 2.0; }
        else if (bet.selection === 'Small' && result.size === 'Small') { wins = true; payoutRate = 2.0; }
      } else if (bet.type === 'number') {
        if (parseInt(bet.selection) === result.number) { wins = true; payoutRate = 9.0; }
      }
      
      if (wins) {
        hasWon = true;
        bet.status = 'Won';
        bet.payout = bet.amount * payoutRate;
        roundWinnings += bet.payout;
      } else {
        bet.status = 'Lost';
        bet.payout = 0;
      }
    }
  });
  
  if (hasActiveBets) {
    if (hasWon) {
      walletBalance += roundWinnings;
      updateBalanceUI();
      playWinSound();
      
      // Display Rewards toast notify
      showRewardAlertPopup(`Winner! +₹${roundWinnings.toFixed(2)}`, `Outcome was Number ${result.number} (${result.size})`);
    } else {
      playLoseSound();
    }
    
    localStorage.setItem('pandya_user_wingo_history', JSON.stringify(userWingoBetsHistory));
    renderUserWingoBetsList();
  }
}

// Display float alert success chip
function showRewardAlertPopup(title, desc) {
  const alertEl = document.getElementById('rewards-success-alert');
  const titleEl = document.getElementById('reward-alert-title');
  const descEl = document.getElementById('reward-alert-desc');
  
  if (alertEl && titleEl && descEl) {
    titleEl.textContent = title;
    descEl.textContent = desc;
    alertEl.style.display = 'flex';
    
    setTimeout(() => {
      alertEl.style.display = 'none';
    }, 4500);
  }
}

// Drawer sheets bindings
function openBetDrawer(type, selection, themeClass) {
  // Check if round is locked
  if (wingoSecondsRemaining <= 5) {
    playLockSound();
    return;
  }
  
  currentBetDrawerType = type;
  currentBetDrawerSelection = selection;
  currentBetBaseAmount = 1;
  currentBetMultiplier = 1;
  
  const drawer = document.getElementById('wingo-bet-drawer');
  const overlay = document.getElementById('wingo-bet-drawer-overlay');
  const titleBadge = document.getElementById('bet-drawer-badge');
  const selectionText = document.getElementById('bet-drawer-selection-text');
  const multInput = document.getElementById('bet-drawer-multiplier');
  
  // Set theme classes on badge
  if (titleBadge) {
    titleBadge.className = `selected-bet-badge ${themeClass}`;
  }
  if (selectionText) {
    selectionText.textContent = `${type.toUpperCase()}: ${selection}`;
  }
  if (multInput) {
    multInput.value = 1;
  }
  
  // Set default active base amount
  document.querySelectorAll('.base-amount-row .base-amt-chip').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.base-amount-row .base-amt-chip')[0].classList.add('active');
  
  updateDrawerConfirmBtnText();
  
  if (drawer && overlay) {
    overlay.classList.add('open');
    drawer.classList.add('open');
  }
  
  // Request user sound enablement
  initAudio();
}

function closeBetDrawer() {
  const drawer = document.getElementById('wingo-bet-drawer');
  const overlay = document.getElementById('wingo-bet-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function setBetBaseAmount(amount) {
  currentBetBaseAmount = amount;
  
  // Toggle active UI chips
  document.querySelectorAll('.base-amount-row .base-amt-chip').forEach(c => {
    c.classList.remove('active');
    if (parseInt(c.textContent.replace('₹', '')) === amount) {
      c.classList.add('active');
    }
  });
  
  updateDrawerConfirmBtnText();
  playTickSound();
}

function setBetMultiplier(mult) {
  currentBetMultiplier = mult;
  const input = document.getElementById('bet-drawer-multiplier');
  if (input) input.value = mult;
  updateDrawerConfirmBtnText();
  playTickSound();
}

function adjustBetMultiplier(diff) {
  currentBetMultiplier = Math.max(1, currentBetMultiplier + diff);
  const input = document.getElementById('bet-drawer-multiplier');
  if (input) input.value = currentBetMultiplier;
  updateDrawerConfirmBtnText();
  playTickSound();
}

function updateDrawerConfirmBtnText() {
  const btn = document.getElementById('bet-drawer-confirm-btn');
  if (btn) {
    const total = currentBetBaseAmount * currentBetMultiplier;
    btn.textContent = `Confirm Bet (₹${total.toFixed(2)})`;
  }
}

function submitWingoBet() {
  const agreement = document.getElementById('bet-agreement-check').checked;
  if (!agreement) {
    alert("Please check and agree to the Pandya Bet User Agreement Terms.");
    return;
  }
  
  const multiplierInput = document.getElementById('bet-drawer-multiplier');
  if (multiplierInput) {
    currentBetMultiplier = Math.max(1, parseInt(multiplierInput.value) || 1);
  }
  
  const totalBetAmount = currentBetBaseAmount * currentBetMultiplier;
  
  // Check sufficient funds
  if (walletBalance < totalBetAmount) {
    alert("Insufficient Wallet Balance! Please add cash to place this bet.");
    playLockSound();
    return;
  }
  
  // Deduct balance
  walletBalance -= totalBetAmount;
  updateBalanceUI();
  
  // Log bet object
  const newBet = {
    period: wingoPeriodId,
    type: currentBetDrawerType,
    selection: currentBetDrawerSelection,
    amount: totalBetAmount,
    status: 'Pending',
    payout: 0
  };
  
  userWingoBetsHistory.unshift(newBet);
  localStorage.setItem('pandya_user_wingo_history', JSON.stringify(userWingoBetsHistory));
  
  renderUserWingoBetsList();
  closeBetDrawer();
  
  // Highlight tab to show My Bets
  switchRecordTab('user');
  
  playSynthSound(440, 'triangle', 0.15, 0.1); // Bet success sound
}

function switchRecordTab(tabName) {
  const btnHistory = document.getElementById('tab-game-history');
  const btnUser = document.getElementById('tab-user-bets');
  const bodyHistory = document.getElementById('records-game-history');
  const bodyUser = document.getElementById('records-user-bets');
  
  if (tabName === 'game') {
    btnHistory.classList.add('active');
    btnUser.classList.remove('active');
    bodyHistory.style.display = 'block';
    bodyUser.style.display = 'none';
  } else {
    btnHistory.classList.remove('active');
    btnUser.classList.add('active');
    bodyHistory.style.display = 'none';
    bodyUser.style.display = 'block';
  }
}


// --- AVIATOR GAME ENGINE (CRASH ENGINE ON HTML5 CANVAS) ---

function initAviatorEngine() {
  aviatorCanvas = document.getElementById('aviator-canvas');
  if (!aviatorCanvas) return;
  
  aviatorCtx = aviatorCanvas.getContext('2d');
  
  // Set dimensions correctly (accounting for high density screens)
  const rect = aviatorCanvas.getBoundingClientRect();
  aviatorCanvas.width = rect.width;
  aviatorCanvas.height = rect.height;
  
  // Initialize state
  aviatorState = 'waiting';
  aviatorWaitTimer = 5;
  
  // Cancel previous loops if active
  if (aviatorAnimId) cancelAnimationFrame(aviatorAnimId);
  
  startAviatorRoundWaiting();
}

function renderAviatorHistoryBadges() {
  const container = document.getElementById('aviator-history-list');
  if (!container) return;
  container.innerHTML = '';
  
  aviatorHistory.slice(0, 15).forEach(val => {
    const badge = document.createElement('span');
    badge.className = 'aviator-mult-badge';
    if (val >= 2.0) badge.classList.add('high-value');
    if (val >= 10.0) badge.classList.add('huge-value');
    badge.textContent = `${val.toFixed(2)}x`;
    container.appendChild(badge);
  });
}

function startAviatorRoundWaiting() {
  aviatorState = 'waiting';
  aviatorWaitTimer = 5;
  
  const displayWait = document.getElementById('aviator-waiting-display');
  const displayFlew = document.getElementById('aviator-flew-away-alert');
  const takeoffTimer = document.getElementById('aviator-takeoff-timer');
  const multDisplay = document.getElementById('aviator-multiplier-display');
  
  if (displayWait) displayWait.style.display = 'flex';
  if (displayFlew) displayFlew.style.display = 'none';
  if (multDisplay) multDisplay.style.display = 'none';
  if (takeoffTimer) takeoffTimer.textContent = aviatorWaitTimer;
  
  // Reset Bet UI consoles buttons
  resetAviatorConsoleButtons();
  
  const interval = setInterval(() => {
    aviatorWaitTimer--;
    if (takeoffTimer) takeoffTimer.textContent = aviatorWaitTimer;
    
    // Play tick tick
    playTickSound();
    
    if (aviatorWaitTimer <= 0) {
      clearInterval(interval);
      startAviatorTakeoff();
    }
  }, 1000);
}

function resetAviatorConsoleButtons() {
  // Left Console
  const amtLeft = parseFloat(document.getElementById('aviator-bet-amt-left').value) || 100;
  const btnLeft = document.getElementById('aviator-bet-btn-left');
  if (btnLeft) {
    btnLeft.className = 'aviator-bet-submit-btn';
    btnLeft.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${amtLeft.toFixed(2)}</span>`;
  }
  aviatorBets.left.placed = false;
  aviatorBets.left.win = false;
  
  // Right Console
  const amtRight = parseFloat(document.getElementById('aviator-bet-amt-right').value) || 200;
  const btnRight = document.getElementById('aviator-bet-btn-right');
  if (btnRight) {
    btnRight.className = 'aviator-bet-submit-btn';
    btnRight.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${amtRight.toFixed(2)}</span>`;
  }
  aviatorBets.right.placed = false;
  aviatorBets.right.win = false;
}

function startAviatorTakeoff() {
  aviatorState = 'flying';
  aviatorMultiplier = 1.00;
  aviatorTimeElapsed = 0;
  
  // Determine crash limit limit
  const roll = Math.random();
  if (roll < 0.15) {
    // Instant crash (House edge 1.00x - 1.05x)
    aviatorCrashLimit = 1.00 + (Math.random() * 0.05);
  } else if (roll < 0.85) {
    // Normal crashes (1.06x - 3.50x)
    aviatorCrashLimit = 1.06 + (Math.random() * 2.44);
  } else {
    // High flyers (3.50x - 18.00x)
    aviatorCrashLimit = 3.50 + (Math.random() * 14.50);
  }
  
  const displayWait = document.getElementById('aviator-waiting-display');
  const multDisplay = document.getElementById('aviator-multiplier-display');
  
  if (displayWait) displayWait.style.display = 'none';
  if (multDisplay) multDisplay.style.display = 'block';
  
  // Start Jet Engine hum sound
  startJetEngineSound();
  
  // Run animation frame loops
  runAviatorAnimationFrame();
}

function runAviatorAnimationFrame() {
  if (aviatorState !== 'flying') return;
  
  aviatorTimeElapsed += 0.016; // Approx 60fps frame delta
  
  // Exponential multiplier equation
  aviatorMultiplier = Math.pow(1.08, aviatorTimeElapsed * 2);
  
  // Update UI values
  const multValEl = document.getElementById('aviator-mult-num');
  if (multValEl) multValEl.textContent = aviatorMultiplier.toFixed(2);
  
  // Update Jet audio sound pitch frequency
  updateJetEnginePitch(aviatorMultiplier);
  
  // Update interactive cash-out buttons values in real-time
  updateAviatorCashoutValues();
  
  // Draw Canvas components
  drawAviatorCanvasFrame();
  
  // Check Crash limit conditions
  if (aviatorMultiplier >= aviatorCrashLimit) {
    triggerAviatorCrash();
    return;
  }
  
  aviatorAnimId = requestAnimationFrame(runAviatorAnimationFrame);
}

function updateAviatorCashoutValues() {
  // Left Panel
  if (aviatorBets.left.placed && !aviatorBets.left.win) {
    const cashValue = aviatorBets.left.amount * aviatorMultiplier;
    const btnLeft = document.getElementById('aviator-bet-btn-left');
    if (btnLeft) {
      btnLeft.className = 'aviator-bet-submit-btn btn-cashout';
      btnLeft.innerHTML = `<span class="btn-main-lbl">CASH OUT</span><span class="btn-sub-lbl">₹${cashValue.toFixed(2)}</span>`;
    }
  }
  
  // Right Panel
  if (aviatorBets.right.placed && !aviatorBets.right.win) {
    const cashValue = aviatorBets.right.amount * aviatorMultiplier;
    const btnRight = document.getElementById('aviator-bet-btn-right');
    if (btnRight) {
      btnRight.className = 'aviator-bet-submit-btn btn-cashout';
      btnRight.innerHTML = `<span class="btn-main-lbl">CASH OUT</span><span class="btn-sub-lbl">₹${cashValue.toFixed(2)}</span>`;
    }
  }
}

function drawAviatorCanvasFrame() {
  const w = aviatorCanvas.width;
  const h = aviatorCanvas.height;
  
  aviatorCtx.clearRect(0, 0, w, h);
  
  // Draw grid helper lines
  aviatorCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  aviatorCtx.lineWidth = 1;
  const gridSpacing = 30;
  for (let x = 0; x < w; x += gridSpacing) {
    aviatorCtx.beginPath();
    aviatorCtx.moveTo(x, 0);
    aviatorCtx.lineTo(x, h);
    aviatorCtx.stroke();
  }
  for (let y = 0; y < h; y += gridSpacing) {
    aviatorCtx.beginPath();
    aviatorCtx.moveTo(0, y);
    aviatorCtx.lineTo(w, y);
    aviatorCtx.stroke();
  }
  
  // Math coordinates calculation for Bezier curve takeoff (curves up to the right)
  const startX = 40;
  const startY = h - 40;
  
  // Curve moves proportionally to elapsed time, capping at 85% width/height
  const progress = Math.min(aviatorTimeElapsed / 4, 1.0);
  const endX = startX + (w - startX - 80) * progress;
  const endY = startY - (startY - 60) * Math.pow(progress, 1.8);
  
  // Draw glowing red flight path line
  aviatorCtx.strokeStyle = 'var(--color-red)';
  aviatorCtx.lineWidth = 4;
  aviatorCtx.shadowColor = 'var(--color-red)';
  aviatorCtx.shadowBlur = 10;
  
  aviatorCtx.beginPath();
  aviatorCtx.moveTo(startX, startY);
  // Control point is low to create a sweep curve
  const controlX = startX + (endX - startX) * 0.5;
  const controlY = startY;
  aviatorCtx.quadraticCurveTo(controlX, controlY, endX, endY);
  aviatorCtx.stroke();
  
  // Draw area gradient fill under curve
  aviatorCtx.shadowBlur = 0; // reset shadow
  const grad = aviatorCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255, 42, 95, 0.25)');
  grad.addColorStop(1, 'rgba(255, 42, 95, 0.00)');
  aviatorCtx.fillStyle = grad;
  
  aviatorCtx.beginPath();
  aviatorCtx.moveTo(startX, startY);
  aviatorCtx.quadraticCurveTo(controlX, controlY, endX, endY);
  aviatorCtx.lineTo(endX, startY);
  aviatorCtx.closePath();
  aviatorCtx.fill();
  
  // Draw glowing UFO / Rocket icon at the end coordinates
  aviatorCtx.fillStyle = '#fff';
  aviatorCtx.font = '28px sans-serif';
  // Bounces up and down slightly to represent flight turbulence
  const turbulenceY = Math.sin(aviatorTimeElapsed * 30) * 3;
  aviatorCtx.fillText('🛸', endX - 14, endY + 10 + turbulenceY);
  
  // Draw axis boundaries
  aviatorCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  aviatorCtx.lineWidth = 2;
  aviatorCtx.beginPath();
  aviatorCtx.moveTo(startX, 0);
  aviatorCtx.lineTo(startX, startY);
  aviatorCtx.lineTo(w, startY);
  aviatorCtx.stroke();
}

function triggerAviatorCrash() {
  aviatorState = 'crashed';
  
  // Stop engine and trigger explosion boom sound
  stopJetEngineSound(true);
  
  // Prepend multiplier to history
  aviatorHistory.unshift(aviatorMultiplier);
  renderAviatorHistoryBadges();
  
  const alertEl = document.getElementById('aviator-flew-away-alert');
  const crashValEl = document.getElementById('aviator-crash-value');
  
  if (alertEl && crashValEl) {
    crashValEl.textContent = `${aviatorMultiplier.toFixed(2)}x`;
    alertEl.style.display = 'flex';
  }
  
  // Reset Bet submit buttons status to neutral
  resetAviatorConsoleButtons();
  
  // Start countdown to next round after 3.5 seconds
  setTimeout(() => {
    startAviatorRoundWaiting();
  }, 3500);
}

function adjustAviatorBetAmount(side, delta) {
  const input = document.getElementById(`aviator-bet-amt-${side}`);
  if (input) {
    let current = parseFloat(input.value) || 100;
    current = Math.max(10, current + delta);
    input.value = current;
    
    // Refresh button sublabel details
    const btn = document.getElementById(`aviator-bet-btn-${side}`);
    if (btn && !aviatorBets[side].placed) {
      btn.querySelector('.btn-sub-lbl').textContent = `₹${current.toFixed(2)}`;
    }
  }
}

function setAviatorBetAmount(side, amt) {
  const input = document.getElementById(`aviator-bet-amt-${side}`);
  if (input) {
    input.value = amt;
    const btn = document.getElementById(`aviator-bet-btn-${side}`);
    if (btn && !aviatorBets[side].placed) {
      btn.querySelector('.btn-sub-lbl').textContent = `₹${amt.toFixed(2)}`;
    }
  }
  playTickSound();
}

function handleAviatorBetClick(side) {
  const state = aviatorBets[side];
  const input = document.getElementById(`aviator-bet-amt-${side}`);
  const btn = document.getElementById(`aviator-bet-btn-${side}`);
  
  if (!state.placed) {
    // --- Place Bet Action ---
    const betVal = parseFloat(input.value) || 100;
    
    if (walletBalance < betVal) {
      alert("Insufficient balance to place this Aviator bet!");
      playLockSound();
      return;
    }
    
    // Deduct
    walletBalance -= betVal;
    updateBalanceUI();
    
    state.amount = betVal;
    state.placed = true;
    state.win = false;
    
    if (btn) {
      btn.className = 'aviator-bet-submit-btn btn-cancel';
      btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
    }
    playSynthSound(587.33, 'triangle', 0.15, 0.08); // Place bet beep
  } else {
    // --- Cancel or Cash Out Action ---
    if (aviatorState === 'waiting') {
      // Cancel bet before takeoff (refund)
      walletBalance += state.amount;
      updateBalanceUI();
      
      state.placed = false;
      if (btn) {
        btn.className = 'aviator-bet-submit-btn';
        btn.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${state.amount.toFixed(2)}</span>`;
      }
      playLockSound();
    } else if (aviatorState === 'flying' && !state.win) {
      // Cash out success!
      const winnings = state.amount * aviatorMultiplier;
      walletBalance += winnings;
      updateBalanceUI();
      
      state.win = true;
      state.placed = false;
      
      if (btn) {
        btn.className = 'aviator-bet-submit-btn';
        btn.style.opacity = '0.5';
        btn.disabled = true;
        btn.innerHTML = `<span class="btn-main-lbl">CASHED OUT</span><span class="btn-sub-lbl">+₹${winnings.toFixed(2)}</span>`;
      }
      
      playWinSound();
      
      // Floating victory alert popup
      showRewardAlertPopup(`Aviator Win! +₹${winnings.toFixed(2)}`, `Cashed out successfully at ${aviatorMultiplier.toFixed(2)}x`);
      
      // Reset disabled buttons state after round resets
      setTimeout(() => {
        if (btn) {
          btn.style.opacity = '1';
          btn.disabled = false;
        }
      }, 3500);
    }
  }
}


// --- DEPOSIT AND WITHDRAWAL SIMULATION GATEWAYS ---

function openDepositModal() {
  const modal = document.getElementById('deposit-modal');
  const overlay = document.getElementById('deposit-modal-overlay');
  
  // Set default state values
  document.getElementById('deposit-step-1').style.display = 'block';
  document.getElementById('deposit-step-2').style.display = 'none';
  document.getElementById('user-utr-input').value = '';
  
  setDepositAmount(500);
  
  if (modal && overlay) {
    overlay.classList.add('open');
    modal.classList.add('open');
  }
  
  initAudio();
}

function closeDepositModal() {
  const modal = document.getElementById('deposit-modal');
  const overlay = document.getElementById('deposit-modal-overlay');
  if (modal && overlay) {
    modal.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function setDepositAmount(amt) {
  selectedDepositAmountPreset = amt;
  const input = document.getElementById('custom-dep-amt');
  if (input) input.value = amt;
  
  // Highlight selected amount preset item
  document.querySelectorAll('.deposit-amounts-presets .amt-preset-item').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.textContent.replace('₹', '').replace(',', '')) === amt) {
      btn.classList.add('active');
    }
  });
  playTickSound();
}

function selectPaymentMethod(method) {
  selectedDepositMethod = method;
  document.querySelectorAll('.payment-methods-grid .pay-method-item').forEach(item => {
    item.classList.remove('active');
    if (item.querySelector('span').textContent.includes(method.split(' ')[0])) {
      item.classList.add('active');
    }
  });
  playTickSound();
}

function proceedToPaymentDetails() {
  const customInput = document.getElementById('custom-dep-amt');
  if (customInput) {
    selectedDepositAmountPreset = parseFloat(customInput.value) || 500;
  }
  
  if (selectedDepositAmountPreset < 100) {
    alert("Minimum deposit amount is ₹100.");
    return;
  }
  
  // Transition to QR Invoice Screen
  document.getElementById('deposit-step-1').style.display = 'none';
  document.getElementById('deposit-step-2').style.display = 'block';
  
  // Map values
  document.getElementById('invoice-payment-amount').textContent = `₹${selectedDepositAmountPreset.toFixed(2)}`;
  
  // Generate random dummy UPI address
  const upis = ['pandya.pay@ybl', 'pandyabet@upi', 'pandya.games@paytm'];
  document.getElementById('target-upi-address').textContent = upis[Math.floor(Math.random() * upis.length)];
  
  playTickSound();
}

function copyTargetUpi() {
  const upiIdText = document.getElementById('target-upi-address').textContent;
  navigator.clipboard.writeText(upiIdText).then(() => {
    alert("UPI address ID copied to clipboard! Paste it inside your UPI application.");
  });
}

function verifyDepositUtr() {
  const utrInput = document.getElementById('user-utr-input').value.trim();
  const verifyBtn = document.getElementById('verify-payment-btn');
  
  // 12-digit digits validation
  const isValid = /^\d{12}$/.test(utrInput);
  if (!isValid) {
    alert("Invalid UTR Code! Please enter exactly 12 numeric digits from your UPI payment success screen.");
    playLockSound();
    return;
  }
  
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Processing Transaction Verification...';
  }
  
  // Simulate network verify timeout
  setTimeout(() => {
    walletBalance += selectedDepositAmountPreset;
    updateBalanceUI();
    
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify & Add Balance';
    }
    
    closeDepositModal();
    playWinSound();
    
    // Floating Success notifications
    showRewardAlertPopup(`Deposit Success!`, `₹${selectedDepositAmountPreset.toFixed(2)} has been credited to your balance.`);
  }, 2200);
}

// Withdrawal functions
function openWithdrawModal() {
  const modal = document.getElementById('withdraw-modal');
  const overlay = document.getElementById('withdraw-modal-overlay');
  
  if (modal && overlay) {
    overlay.classList.add('open');
    modal.classList.add('open');
  }
  initAudio();
}

function closeWithdrawModal() {
  const modal = document.getElementById('withdraw-modal');
  const overlay = document.getElementById('withdraw-modal-overlay');
  if (modal && overlay) {
    modal.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function submitWithdrawRequest() {
  const amtInput = document.getElementById('withdraw-amount-input');
  const acNum = document.getElementById('bank-ac-num').value.trim();
  const IFSC = document.getElementById('bank-ifsc').value.trim();
  const holder = document.getElementById('bank-holder').value.trim();
  
  const amt = parseFloat(amtInput.value) || 0;
  
  if (amt < 200) {
    alert("Minimum withdrawal limit is ₹200.");
    return;
  }
  
  if (walletBalance < amt) {
    alert("Insufficient withdrawable balance in wallet!");
    playLockSound();
    return;
  }
  
  if (!acNum || !IFSC || !holder) {
    alert("Please fill in all bank details (Account Number, IFSC, and Name).");
    return;
  }
  
  // Deduct
  walletBalance -= amt;
  updateBalanceUI();
  
  closeWithdrawModal();
  playWinSound();
  
  // Reset fields
  document.getElementById('bank-ac-num').value = '';
  document.getElementById('bank-ifsc').value = '';
  document.getElementById('bank-holder').value = '';
  
  showRewardAlertPopup(`Withdrawal Pending`, `₹${amt.toFixed(2)} processed to bank. Credits within 2 hours.`);
}


// --- LIVE MARQUEE WINNERS FEED FEED ---

function startWinnersTickerFeed() {
  const container = document.getElementById('winners-ticker-list');
  if (!container) return;
  
  // Populate first 10 items
  for (let i = 0; i < 10; i++) {
    container.appendChild(generateRandomMarqueeWinnerItem());
  }
  
  // Prepend new winner item every 3 seconds to keep feed fresh
  setInterval(() => {
    container.insertBefore(generateRandomMarqueeWinnerItem(), container.firstChild);
    // Keep list clean, slice excess items
    if (container.children.length > 15) {
      container.removeChild(container.lastChild);
    }
  }, 3200);
}

function generateRandomMarqueeWinnerItem() {
  const prefixes = ['98***', '99***', '97***', '88***', '87***', '78***', '95***', '81***'];
  const suffix = Math.floor(100 + Math.random() * 900);
  const user = prefixes[Math.floor(Math.random() * prefixes.length)] + suffix;
  
  const games = ['Wingo 1 Min', 'Aviator', 'UFO Flight'];
  const game = games[Math.floor(Math.random() * games.length)];
  
  let winAmt = 0;
  if (game === 'Aviator') {
    winAmt = Math.floor(200 + Math.random() * 8000);
  } else {
    winAmt = Math.floor(10 + Math.random() * 400) * 10;
  }
  
  const item = document.createElement('div');
  item.className = 'ticker-item';
  item.innerHTML = `User <strong>${user}</strong> bet in <strong>${game}</strong> and won <span class="win-amt">₹${winAmt}</span>!`;
  return item;
}


// --- LOBBY ADDITIONAL POPUP MODALS ---
function showCustomerService() {
  alert("Pandya Bet Live Chat Support: Welcome! How can we assist you with deposit, bets, or VIP rewards today?");
}

function showVipDetails() {
  alert("🏆 VIP Level 1 Perks:\n- Daily Sign-in bonus: ₹10\n- Level Up reward: ₹100\n- Instant Withdrawal times: under 2 hours\n- 2.5% bet rebate commission!");
}

function shareReferLink() {
  alert("Referral Link Copied! Send it to your group chats. You will earn a 2.5% lifetime wager commission on all friend betting turnovers!");
}

function showLockedGameAlert(gameName) {
  alert(`🔒 ${gameName} Lobby is locked!\nKeep playing Win Go or Aviator to reach VIP Level 3 and unlock mega reels!`);
  playLockSound();
}

function openWingoRules() {
  alert("Win Go 1 Min Rules:\n- Place a bet on Green, Violet, Red, Big, Small, or Numbers 0-9.\n- Timer ticks from 60 to 0. Betting closes at 5s remaining.\n- Outcomes: Numbers (9x payout), Colors (Red/Green 2x payout, Violet 4.5x), Size (Big/Small 2x).");
}

function openAviatorRules() {
  alert("Aviator Rules:\n- Place a bet before takeoff.\n- Watch the plane lift off and multiplier rise.\n- Cash out before the plane flies away to win your bet multiplied.\n- If the plane crashes before cash out, you lose.");
}

// ==========================================================================
// SPRIBE AVIATOR GAME LOGIC & SIMULATION ENGINE
// ==========================================================================

function initSpribeAviatorEngine() {
  spribeCanvas = document.getElementById('spribe-canvas');
  if (!spribeCanvas) return;
  
  spribeCtx = spribeCanvas.getContext('2d');
  
  // Set dimensions correctly (accounting for high density screens)
  const rect = spribeCanvas.getBoundingClientRect();
  spribeCanvas.width = rect.width;
  spribeCanvas.height = rect.height;
  
  // Initialize state
  spribeState = 'waiting';
  spribeWaitTimer = 5;
  spribeTimeElapsed = 0;
  
  // Cancel previous loops if active
  if (spribeAnimId) cancelAnimationFrame(spribeAnimId);
  if (spribeIntervalId) clearInterval(spribeIntervalId);
  
  // Reset tabs
  switchSpribeLiveTableTab('all');
  
  // Render history badges
  renderSpribeHistoryBadges();
  
  // Start countdown waiting state
  startSpribeAviatorRoundWaiting();
  
  // Start canvas loop
  runSpribeAnimationFrame();
}

function renderSpribeHistoryBadges() {
  const container = document.getElementById('spribe-history-list');
  if (!container) return;
  container.innerHTML = '';
  
  spribeHistory.slice(0, 15).forEach(val => {
    const badge = document.createElement('span');
    badge.className = 'spribe-badge';
    if (val >= 2.0 && val < 10.0) {
      badge.classList.add('color-purple');
    } else if (val >= 10.0) {
      badge.classList.add('color-magenta');
    } else {
      badge.classList.add('color-blue');
    }
    badge.textContent = `${val.toFixed(2)}x`;
    container.appendChild(badge);
  });
}

function startSpribeAviatorRoundWaiting() {
  spribeState = 'waiting';
  spribeWaitTimer = 5;
  
  const displayWait = document.getElementById('spribe-waiting-display');
  const displayFlew = document.getElementById('spribe-flew-away-alert');
  const takeoffTimer = document.getElementById('spribe-takeoff-timer');
  const multDisplay = document.getElementById('spribe-multiplier-display');
  const progressBar = document.getElementById('spribe-takeoff-progress-bar');
  
  if (displayWait) displayWait.style.display = 'flex';
  if (displayFlew) displayFlew.style.display = 'none';
  if (multDisplay) multDisplay.style.display = 'none';
  if (takeoffTimer) takeoffTimer.textContent = spribeWaitTimer;
  if (progressBar) progressBar.style.width = '0%';
  
  // Reset Bet UI consoles buttons
  resetSpribeConsoleButtons();
  
  // Handle Auto Bets!
  handleSpribeAutoBetsPlacement();
  
  // Generate simulated live players wagers
  generateSpribeLivePlayers();
  updateSpribeLiveBetsTable();
  
  if (spribeIntervalId) clearInterval(spribeIntervalId);
  
  spribeIntervalId = setInterval(() => {
    spribeWaitTimer -= 0.1; // update every 100ms for smoother progress bar
    
    // Update progress bar
    if (progressBar) {
      const percentage = ((5 - spribeWaitTimer) / 5) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
    
    // Tick second updates
    const secondsFloor = Math.ceil(spribeWaitTimer);
    if (takeoffTimer) takeoffTimer.textContent = secondsFloor >= 0 ? secondsFloor : 0;
    
    // Play tick sound every second
    if (Math.abs(spribeWaitTimer - Math.round(spribeWaitTimer)) < 0.05 && secondsFloor > 0) {
      playTickSound();
    }
    
    if (spribeWaitTimer <= 0) {
      clearInterval(spribeIntervalId);
      spribeIntervalId = null;
      startSpribeTakeoff();
    }
  }, 100);
}

function resetSpribeConsoleButtons() {
  ['left', 'right'].forEach(side => {
    const amt = parseFloat(document.getElementById(`spribe-bet-amt-${side}`).value) || 100;
    const btn = document.getElementById(`spribe-bet-btn-${side}`);
    
    // Check if autoBet is placed
    if (!spribeBets[side].placed) {
      if (btn) {
        btn.className = 'spribe-bet-submit-btn';
        btn.disabled = false;
        btn.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${amt.toFixed(2)}</span>`;
      }
      spribeBets[side].win = false;
    } else {
      // It was placed automatically by Auto Bet
      if (btn) {
        btn.className = 'spribe-bet-submit-btn spribe-cancel';
        btn.disabled = false;
        btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
      }
      spribeBets[side].win = false;
    }
  });
}

function handleSpribeAutoBetsPlacement() {
  ['left', 'right'].forEach(side => {
    const autoBetCheck = document.getElementById(`spribe-autobet-check-${side}`);
    if (autoBetCheck && autoBetCheck.checked) {
      const input = document.getElementById(`spribe-bet-amt-${side}`);
      const betVal = parseFloat(input.value) || 100;
      
      if (walletBalance >= betVal) {
        // Place bet
        walletBalance -= betVal;
        updateBalanceUI();
        
        spribeBets[side].amount = betVal;
        spribeBets[side].placed = true;
        spribeBets[side].win = false;
        
        // Update button visual state
        const btn = document.getElementById(`spribe-bet-btn-${side}`);
        if (btn) {
          btn.className = 'spribe-bet-submit-btn spribe-cancel';
          btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
        }
        
        playSynthSound(587.33, 'triangle', 0.15, 0.08); // bet placement sound
      } else {
        autoBetCheck.checked = false;
        alert(`Auto Bet disabled on ${side === 'left' ? 'Console 1' : 'Console 2'} due to insufficient balance!`);
      }
    }
  });
}

function startSpribeTakeoff() {
  spribeState = 'flying';
  spribeMultiplier = 1.00;
  spribeTimeElapsed = 0;
  
  // Spribe realistic crash odds
  const roll = Math.random();
  if (roll < 0.10) {
    // 10% instant/very low crash (1.00x - 1.05x)
    spribeCrashLimit = 1.00 + (Math.random() * 0.05);
  } else if (roll < 0.50) {
    // 40% low flyer (1.06x - 1.80x)
    spribeCrashLimit = 1.06 + (Math.random() * 0.74);
  } else if (roll < 0.85) {
    // 35% medium flyer (1.81x - 5.00x)
    spribeCrashLimit = 1.81 + (Math.random() * 3.19);
  } else if (roll < 0.97) {
    // 12% high flyer (5.01x - 20.00x)
    spribeCrashLimit = 5.01 + (Math.random() * 14.99);
  } else {
    // 3% huge multiplier (20.01x - 100.00x)
    spribeCrashLimit = 20.01 + (Math.random() * 80.00);
  }
  
  const displayWait = document.getElementById('spribe-waiting-display');
  const multDisplay = document.getElementById('spribe-multiplier-display');
  
  if (displayWait) displayWait.style.display = 'none';
  if (multDisplay) multDisplay.style.display = 'block';
  
  // Set console buttons to Active/Cashout state if wagers placed
  ['left', 'right'].forEach(side => {
    const btn = document.getElementById(`spribe-bet-btn-${side}`);
    if (spribeBets[side].placed) {
      if (btn) {
        btn.className = 'spribe-bet-submit-btn spribe-cashout';
        btn.innerHTML = `<span class="btn-main-lbl">CASH OUT</span><span class="btn-sub-lbl">₹${spribeBets[side].amount.toFixed(2)}</span>`;
      }
    }
  });
  
  // Start Jet Engine hum sound
  startJetEngineSound();
}

function runSpribeAnimationFrame() {
  if (activeScreen !== 'spribe-aviator') return;
  
  if (spribeState === 'flying') {
    spribeTimeElapsed += 0.016; // 60fps frame delta
    
    // Exponential growth curve: starts slow, accelerates
    // Spribe formula approximation: multiplier = 1.00 * e^(0.08 * time)
    spribeMultiplier = Math.exp(0.08 * spribeTimeElapsed);
    
    // Update multiplier number overlay
    const multValEl = document.getElementById('spribe-mult-num');
    if (multValEl) multValEl.textContent = spribeMultiplier.toFixed(2);
    
    // Update sound pitch
    updateJetEnginePitch(spribeMultiplier);
    
    // Update user cashout buttons
    updateSpribeCashoutButtons();
    
    // Check Auto Cash Outs!
    checkSpribeAutoCashouts();
    
    // Simulate live bets payouts
    updateSpribeLiveBetsPayouts();
    
    // Check crash limit
    if (spribeMultiplier >= spribeCrashLimit) {
      // Transition to CRASHING state instead of immediate crash reset
      spribeState = 'crashing';
      spribeCrashAnimTime = 0;
      
      // Stop engine sound hum, play whoosh sweep sound
      stopJetEngineSound(false);
      playSpribeCrashWhooshSound();
      
      // Trigger Flew Away alert banner instantly
      const alertEl = document.getElementById('spribe-flew-away-alert');
      const crashValEl = document.getElementById('spribe-crash-value');
      if (alertEl && crashValEl) {
        crashValEl.textContent = `${spribeMultiplier.toFixed(2)}x`;
        alertEl.style.display = 'flex';
      }
    }
  } else if (spribeState === 'crashing') {
    // Crashing phase: plane shoots off screen rapidly
    spribeCrashAnimTime += 0.016;
    
    if (spribeCrashAnimTime >= 0.75) {
      triggerSpribeCrash();
      return;
    }
  } else if (spribeState === 'waiting') {
    // Increment time delta for propeller animation when waiting
    spribeTimeElapsed += 0.016;
  }
  
  // Draw canvas
  drawSpribeCanvasFrame();
  
  spribeAnimId = requestAnimationFrame(runSpribeAnimationFrame);
}

function updateSpribeCashoutButtons() {
  ['left', 'right'].forEach(side => {
    if (spribeBets[side].placed && !spribeBets[side].win) {
      const cashValue = spribeBets[side].amount * spribeMultiplier;
      const btn = document.getElementById(`spribe-bet-btn-${side}`);
      if (btn) {
        btn.innerHTML = `<span class="btn-main-lbl">CASH OUT</span><span class="btn-sub-lbl">₹${cashValue.toFixed(2)}</span>`;
      }
    }
  });
}

function checkSpribeAutoCashouts() {
  ['left', 'right'].forEach(side => {
    if (spribeBets[side].placed && !spribeBets[side].win) {
      const autoCashCheck = document.getElementById(`spribe-autocashout-check-${side}`);
      if (autoCashCheck && autoCashCheck.checked) {
        const autoValInput = document.getElementById(`spribe-autocashout-val-${side}`);
        const targetVal = parseFloat(autoValInput.value) || 2.00;
        
        if (spribeMultiplier >= targetVal) {
          // Trigger automatic cashout!
          cashOutSpribeUserBet(side, targetVal);
        }
      }
    }
  });
}

function cashOutSpribeUserBet(side, payoutMultiplier) {
  const state = spribeBets[side];
  const btn = document.getElementById(`spribe-bet-btn-${side}`);
  
  const winnings = state.amount * payoutMultiplier;
  walletBalance += winnings;
  updateBalanceUI();
  
  state.win = true;
  state.placed = false;
  
  if (btn) {
    btn.className = 'spribe-bet-submit-btn';
    btn.style.opacity = '0.5';
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-main-lbl">CASHED OUT</span><span class="btn-sub-lbl">+₹${winnings.toFixed(2)}</span>`;
  }
  
  // Play official arpeggiator chime sound
  playSpribeCashoutChime();
  showRewardAlertPopup(`Aviator Win! +₹${winnings.toFixed(2)}`, `Auto cashed out successfully at ${payoutMultiplier.toFixed(2)}x`);
  
  // Log into My Bets history
  spribeMyBetsHistory.unshift({
    period: new Date().toLocaleTimeString(),
    selection: `Console ${side === 'left' ? '1' : '2'}`,
    amount: state.amount,
    multiplier: payoutMultiplier,
    payout: winnings,
    status: 'Won'
  });
  renderSpribeMyBetsTable();
}

function triggerSpribeCrash() {
  spribeState = 'crashed';
  
  // Add multiplier to history
  spribeHistory.unshift(spribeMultiplier);
  renderSpribeHistoryBadges();
  
  // Check lost user bets to record them
  ['left', 'right'].forEach(side => {
    const state = spribeBets[side];
    if (state.placed && !state.win) {
      spribeMyBetsHistory.unshift({
        period: new Date().toLocaleTimeString(),
        selection: `Console ${side === 'left' ? '1' : '2'}`,
        amount: state.amount,
        multiplier: 0,
        payout: 0,
        status: 'Lost'
      });
    }
  });
  renderSpribeMyBetsTable();
  
  // Reset bets state
  spribeBets.left.placed = false;
  spribeBets.right.placed = false;
  
  // Re-enable console buttons after a short delay
  setTimeout(() => {
    // Check if active screen is still spribe-aviator before continuing
    if (activeScreen === 'spribe-aviator') {
      // Re-enable buttons style
      ['left', 'right'].forEach(side => {
        const btn = document.getElementById(`spribe-bet-btn-${side}`);
        if (btn) {
          btn.style.opacity = '1';
          btn.disabled = false;
        }
      });
      startSpribeAviatorRoundWaiting();
      runSpribeAnimationFrame();
    }
  }, 3000);
}

function drawSpribeCanvasFrame() {
  const w = spribeCanvas.width;
  const h = spribeCanvas.height;
  
  spribeCtx.clearRect(0, 0, w, h);
  
  // Draw Coordinate Axes & Scrolling grid
  const gridSpacing = 40;
  const offsetX = -(spribeTimeElapsed * 100) % gridSpacing;
  const offsetY = (spribeTimeElapsed * 50) % gridSpacing;
  
  spribeCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  spribeCtx.lineWidth = 1;
  
  // Draw vertical lines
  for (let x = offsetX; x < w; x += gridSpacing) {
    spribeCtx.beginPath();
    spribeCtx.moveTo(x, 0);
    spribeCtx.lineTo(x, h);
    spribeCtx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = offsetY; y < h; y += gridSpacing) {
    spribeCtx.beginPath();
    spribeCtx.moveTo(0, y);
    spribeCtx.lineTo(w, y);
    spribeCtx.stroke();
  }
  
  // Coordinates limits
  const startX = 50;
  const startY = h - 45;
  
  let endX, endY;
  let progress = Math.min(spribeTimeElapsed / 8, 1.0);
  
  if (spribeState === 'flying') {
    endX = startX + (w - startX - 70) * progress;
    endY = startY - (startY - 40) * Math.pow(progress, 1.6);
    
    // Save endpoints
    lastSpribeCurveEndX = endX;
    lastSpribeCurveEndY = endY;
  } else if (spribeState === 'crashing') {
    // Freeze the line curve at the crash point
    endX = lastSpribeCurveEndX;
    endY = lastSpribeCurveEndY;
  } else {
    endX = startX;
    endY = startY;
  }
  
  let planeX = endX;
  let planeY = endY;
  
  if (spribeState === 'crashing') {
    // Plane shoots off screen rapidly
    const animProgress = spribeCrashAnimTime / 0.75;
    planeX = endX + (w - endX + 150) * animProgress;
    planeY = endY - (endY + 100) * animProgress;
  }
  
  // Draw filled red transparent gradient area under takeoff curve
  const grad = spribeCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(225, 26, 56, 0.35)');
  grad.addColorStop(0.5, 'rgba(225, 26, 56, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  spribeCtx.fillStyle = grad;
  
  spribeCtx.beginPath();
  spribeCtx.moveTo(startX, startY);
  const controlX = startX + (endX - startX) * 0.55;
  const controlY = startY;
  spribeCtx.quadraticCurveTo(controlX, controlY, endX, endY);
  spribeCtx.lineTo(endX, startY);
  spribeCtx.closePath();
  spribeCtx.fill();
  
  // Draw official red flight path line
  spribeCtx.strokeStyle = '#e11a38';
  spribeCtx.lineWidth = 3.5;
  spribeCtx.shadowColor = '#e11a38';
  spribeCtx.shadowBlur = 8;
  spribeCtx.beginPath();
  spribeCtx.moveTo(startX, startY);
  spribeCtx.quadraticCurveTo(controlX, controlY, endX, endY);
  spribeCtx.stroke();
  
  // Reset shadow for further draws
  spribeCtx.shadowBlur = 0;
  
  if (spribeState === 'flying' || spribeState === 'crashing') {
    // Draw stylized RED PROPELLER PLANE using canvas paths
    spribeCtx.save();
    spribeCtx.translate(planeX, planeY);
    
    let angle;
    if (spribeState === 'flying') {
      angle = -0.15 - (0.35 * progress);
    } else {
      // Steep angle shooting off screen
      angle = -0.5 - (0.45 * (spribeCrashAnimTime / 0.75));
    }
    spribeCtx.rotate(angle);
    
    const wobble = Math.sin(spribeTimeElapsed * 45) * 1.5;
    spribeCtx.translate(0, wobble);
    
    // Draw Plane Shadow first
    spribeCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    spribeCtx.beginPath();
    spribeCtx.ellipse(-10, 18, 14, 5, 0, 0, Math.PI * 2);
    spribeCtx.fill();
    
    // Draw Propeller Line (spinning animation)
    spribeCtx.strokeStyle = '#d1d5db';
    spribeCtx.lineWidth = 2.5;
    spribeCtx.beginPath();
    const propellerLength = 15;
    const propellerAngle = spribeTimeElapsed * 150;
    const propY1 = Math.sin(propellerAngle) * propellerLength;
    const propY2 = -Math.sin(propellerAngle) * propellerLength;
    spribeCtx.moveTo(18, propY1);
    spribeCtx.lineTo(18, propY2);
    spribeCtx.stroke();
    
    // Draw Plane Body (bulbous front, tapered tail)
    spribeCtx.fillStyle = '#e11a38';
    spribeCtx.beginPath();
    spribeCtx.moveTo(-16, 0); // Tail
    spribeCtx.bezierCurveTo(-10, -5, 5, -8, 14, -2); // Upper body
    spribeCtx.bezierCurveTo(18, 0, 18, 4, 14, 6); // Nose
    spribeCtx.bezierCurveTo(4, 8, -10, 5, -16, 0); // Lower body
    spribeCtx.closePath();
    spribeCtx.fill();
    
    // Cockpit canopy (white glass)
    spribeCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    spribeCtx.beginPath();
    spribeCtx.moveTo(2, -3);
    spribeCtx.bezierCurveTo(4, -6, 9, -6, 11, -2);
    spribeCtx.lineTo(3, -2);
    spribeCtx.closePath();
    spribeCtx.fill();

    // Propeller spinner/hub (small red dome at front)
    spribeCtx.fillStyle = '#b01024';
    spribeCtx.beginPath();
    spribeCtx.arc(16, 1.5, 2.5, -Math.PI/2, Math.PI/2);
    spribeCtx.fill();

    // Rear tail wing stabilizer (Red)
    spribeCtx.fillStyle = '#e11a38';
    spribeCtx.beginPath();
    spribeCtx.moveTo(-12, -2);
    spribeCtx.lineTo(-16, -10);
    spribeCtx.lineTo(-11, -10);
    spribeCtx.lineTo(-8, -2);
    spribeCtx.closePath();
    spribeCtx.fill();

    // Main wings (Red)
    spribeCtx.fillStyle = '#c0132b'; // Darker red wing
    spribeCtx.beginPath();
    spribeCtx.moveTo(-4, 2);
    spribeCtx.lineTo(-8, 14);
    spribeCtx.lineTo(-1, 14);
    spribeCtx.lineTo(4, 2);
    spribeCtx.closePath();
    spribeCtx.fill();
    
    spribeCtx.restore();
  }
  
  // Draw coordinate line borders
  spribeCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  spribeCtx.lineWidth = 1.5;
  spribeCtx.beginPath();
  spribeCtx.moveTo(startX, 0);
  spribeCtx.lineTo(startX, startY);
  spribeCtx.lineTo(w, startY);
  spribeCtx.stroke();
}

function adjustSpribeBetAmount(side, delta) {
  const input = document.getElementById(`spribe-bet-amt-${side}`);
  if (input) {
    let current = parseFloat(input.value) || 100;
    current = Math.max(10, current + delta);
    input.value = current;
    
    // Refresh button sublabel details
    const btn = document.getElementById(`spribe-bet-btn-${side}`);
    if (btn && !spribeBets[side].placed) {
      btn.querySelector('.btn-sub-lbl').textContent = `₹${current.toFixed(2)}`;
    }
  }
  playTickSound();
}

function setSpribeBetAmount(side, amt) {
  const input = document.getElementById(`spribe-bet-amt-${side}`);
  if (input) {
    input.value = amt;
    const btn = document.getElementById(`spribe-bet-btn-${side}`);
    if (btn && !spribeBets[side].placed) {
      btn.querySelector('.btn-sub-lbl').textContent = `₹${amt.toFixed(2)}`;
    }
  }
  playTickSound();
}

function handleSpribeBetClick(side) {
  const state = spribeBets[side];
  const input = document.getElementById(`spribe-bet-amt-${side}`);
  const btn = document.getElementById(`spribe-bet-btn-${side}`);
  
  if (!state.placed) {
    // Place bet action
    const betVal = parseFloat(input.value) || 100;
    
    if (walletBalance < betVal) {
      alert("Insufficient balance to place this Aviator bet!");
      playLockSound();
      return;
    }
    
    // Deduct
    walletBalance -= betVal;
    updateBalanceUI();
    
    state.amount = betVal;
    state.placed = true;
    state.win = false;
    
    if (spribeState === 'waiting') {
      if (btn) {
        btn.className = 'spribe-bet-submit-btn spribe-cancel';
        btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
      }
    } else if (spribeState === 'flying') {
      // Late bet entry refund
      walletBalance += betVal;
      updateBalanceUI();
      state.placed = false;
      alert("Round already started! Bet will be placed next round.");
      return;
    }
    
    playSynthSound(587.33, 'triangle', 0.15, 0.08); // Bet placement beep
    
    // Update live panel
    renderSpribeMyBetsTable();
  } else {
    // Cancel or Cash out action
    if (spribeState === 'waiting') {
      // Cancel bet before takeoff (refund)
      walletBalance += state.amount;
      updateBalanceUI();
      
      state.placed = false;
      if (btn) {
        btn.className = 'spribe-bet-submit-btn';
        btn.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${state.amount.toFixed(2)}</span>`;
      }
      playLockSound();
    } else if (spribeState === 'flying' && !state.win) {
      // Cash out success!
      cashOutSpribeUserBet(side, spribeMultiplier);
    }
  }
}

function switchSpribeConsoleTab(side, tabName) {
  const btnBet = document.getElementById(`spribe-tab-bet-${side}`);
  const btnAuto = document.getElementById(`spribe-tab-auto-${side}`);
  const autoPanel = document.getElementById(`spribe-auto-${side}`);
  
  if (tabName === 'bet') {
    btnBet.classList.add('active');
    btnAuto.classList.remove('active');
    if (autoPanel) autoPanel.style.display = 'none';
  } else {
    btnBet.classList.remove('active');
    btnAuto.classList.add('active');
    if (autoPanel) autoPanel.style.display = 'block';
  }
  playTickSound();
}

function toggleSpribeAutoBet(side) {
  playTickSound();
}

function toggleSpribeAutoCashout(side) {
  const check = document.getElementById(`spribe-autocashout-check-${side}`);
  const input = document.getElementById(`spribe-autocashout-val-${side}`);
  
  if (check && input) {
    input.disabled = !check.checked;
  }
  playTickSound();
}

function switchSpribeLiveTableTab(tabName) {
  spribeActiveTableTab = tabName;
  const tabAll = document.getElementById('spribe-live-tab-all');
  const tabMy = document.getElementById('spribe-live-tab-my');
  const containerAll = document.getElementById('spribe-live-rows-container');
  const containerMy = document.getElementById('spribe-my-rows-container');
  
  if (tabName === 'all') {
    tabAll.classList.add('active');
    tabMy.classList.remove('active');
    containerAll.style.display = 'flex';
    containerMy.style.display = 'none';
  } else {
    tabAll.classList.remove('active');
    tabMy.classList.add('active');
    containerAll.style.display = 'none';
    containerMy.style.display = 'flex';
  }
  playTickSound();
}

// Generate 15-25 random players who place bets at round start
function generateSpribeLivePlayers() {
  spribeLivePlayers = [];
  const count = 12 + Math.floor(Math.random() * 12); // 12 to 23 players
  
  const prefixes = ['98***', '99***', '97***', '88***', '87***', '78***', '95***', '91***', '90***', '80***'];
  const userLetters = ['a', 'b', 'c', 'x', 'y', 'z', 'm', 'n', 's', 'r'];
  
  for (let i = 0; i < count; i++) {
    const isPhone = Math.random() > 0.4;
    let username = '';
    if (isPhone) {
      const suffix = Math.floor(100 + Math.random() * 900);
      username = prefixes[Math.floor(Math.random() * prefixes.length)] + suffix;
    } else {
      const name = userLetters[Math.floor(Math.random() * userLetters.length)] + userLetters[Math.floor(Math.random() * userLetters.length)] + '***' + Math.floor(10 + Math.random() * 90);
      username = name;
    }
    
    const betAmt = Math.random() > 0.5 ? Math.floor(1 + Math.random() * 10) * 100 : Math.floor(1 + Math.random() * 20) * 10;
    
    // Predetermined target cashout multiplier
    const rand = Math.random();
    let targetMult = 1.10;
    if (rand < 0.25) {
      targetMult = 1.05 + (Math.random() * 0.20);
    } else if (rand < 0.70) {
      targetMult = 1.26 + (Math.random() * 1.24);
    } else if (rand < 0.90) {
      targetMult = 2.51 + (Math.random() * 3.49);
    } else {
      targetMult = 6.01 + (Math.random() * 19.0);
    }
    
    spribeLivePlayers.push({
      username: username,
      amount: betAmt,
      targetMultiplier: targetMult,
      cashedOut: false,
      payout: 0,
      payoutMultiplier: 0
    });
  }
}

function updateSpribeLiveBetsTable() {
  const container = document.getElementById('spribe-live-rows-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Sort players by bet amount descending
  spribeLivePlayers.sort((a, b) => b.amount - a.amount);
  
  // Display total bets placed
  const totalBetsEl = document.getElementById('spribe-live-total-bets');
  if (totalBetsEl) {
    totalBetsEl.textContent = `All bets: ${spribeLivePlayers.length}`;
  }
  
  // Add active user bets at the top
  ['left', 'right'].forEach(side => {
    if (spribeBets[side].placed || spribeBets[side].win) {
      const row = document.createElement('div');
      row.className = `spribe-live-row user-row ${spribeBets[side].win ? 'cashed-out' : ''}`;
      
      const payoutText = spribeBets[side].win ? '₹' + (spribeBets[side].amount * spribeBets[side].autoCashOutVal).toFixed(2) : '-'; // rough estimate or actual winnings
      
      row.innerHTML = `
        <span class="spribe-val-bold">Console ${side === 'left' ? '1' : '2'} (You)</span>
        <span>₹${spribeBets[side].amount}</span>
        <span class="spribe-val-bold">${spribeBets[side].win ? 'Cashed Out' : '-'}</span>
        <span class="${spribeBets[side].win ? 'spribe-val-payout' : ''}">${spribeBets[side].win ? 'Win' : '-'}</span>
      `;
      container.appendChild(row);
    }
  });
  
  spribeLivePlayers.forEach(player => {
    const row = document.createElement('div');
    row.className = `spribe-live-row ${player.cashedOut ? 'cashed-out' : ''}`;
    
    row.innerHTML = `
      <span>${player.username}</span>
      <span>₹${player.amount}</span>
      <span class="spribe-val-bold">${player.cashedOut ? player.payoutMultiplier.toFixed(2) + 'x' : '-'}</span>
      <span class="${player.cashedOut ? 'spribe-val-payout' : ''}">${player.cashedOut ? '₹' + player.payout.toFixed(2) : '-'}</span>
    `;
    container.appendChild(row);
  });
}

function updateSpribeLiveBetsPayouts() {
  let tableNeedsUpdate = false;
  let cashOutCount = 0;
  
  spribeLivePlayers.forEach(player => {
    if (!player.cashedOut) {
      if (spribeMultiplier >= player.targetMultiplier && player.targetMultiplier < spribeCrashLimit) {
        player.cashedOut = true;
        player.payoutMultiplier = player.targetMultiplier;
        player.payout = player.amount * player.payoutMultiplier;
        tableNeedsUpdate = true;
      }
    }
    
    if (player.cashedOut) {
      cashOutCount++;
    }
  });
  
  // Update live table HTML
  if (tableNeedsUpdate) {
    updateSpribeLiveBetsTable();
  }
  
  // Update winner counter subtext
  const winnersCountEl = document.getElementById('spribe-live-total-won');
  if (winnersCountEl) {
    winnersCountEl.textContent = cashOutCount > 0 ? `Winners: ${cashOutCount}` : '';
  }
}

function renderSpribeMyBetsTable() {
  const container = document.getElementById('spribe-my-rows-container');
  if (!container) return;
  
  if (spribeMyBetsHistory.length === 0) {
    container.innerHTML = '<div class="spribe-empty-table-msg">No bets placed in this session.</div>';
    return;
  }
  
  container.innerHTML = '';
  spribeMyBetsHistory.slice(0, 30).forEach(bet => {
    const row = document.createElement('div');
    row.className = `spribe-live-row user-row ${bet.status === 'Won' ? 'cashed-out' : ''}`;
    
    let payoutHtml = '';
    if (bet.status === 'Won') {
      payoutHtml = `<span class="spribe-val-payout">+₹${bet.payout.toFixed(2)}</span>`;
    } else {
      payoutHtml = `<span class="lost-color">-₹${bet.amount.toFixed(2)}</span>`;
    }
    
    row.innerHTML = `
      <span>${bet.period}</span>
      <span>₹${bet.amount.toFixed(0)}</span>
      <span class="spribe-val-bold">${bet.status === 'Won' ? bet.multiplier.toFixed(2) + 'x' : '-'}</span>
      <span>${payoutHtml}</span>
    `;
    container.appendChild(row);
  });
}

function openSpribeAviatorRules() {
  alert("Spribe Aviator Rules:\n1. Choose your Bet amount and click 'BET' on one or both consoles.\n2. Watch the plane fly and multiplier rise. Double consoles allow two separate bets!\n3. Cash Out before the plane flies away (FLEW AWAY!) to collect your profit.\n4. Use the 'Auto' tab for Autobet (places bet every round) or Auto Cashout (payout matches your target automatically).");
}

// ==========================================================================
// JETX GAME LOGIC & SIMULATION ENGINE
// ==========================================================================

function initJetxEngine() {
  jetxCanvas = document.getElementById('jetx-canvas');
  if (!jetxCanvas) return;
  
  jetxCtx = jetxCanvas.getContext('2d');
  
  const rect = jetxCanvas.getBoundingClientRect();
  jetxCanvas.width = rect.width;
  jetxCanvas.height = rect.height;
  
  jetxState = 'waiting';
  jetxWaitTimer = 5;
  jetxTimeElapsed = 0;
  
  if (jetxAnimId) cancelAnimationFrame(jetxAnimId);
  if (jetxIntervalId) clearInterval(jetxIntervalId);
  
  switchJetxLiveTableTab('all');
  renderJetxHistoryBadges();
  startJetxRoundWaiting();
  runJetxAnimationFrame();
}

function renderJetxHistoryBadges() {
  const container = document.getElementById('jetx-history-list');
  if (!container) return;
  container.innerHTML = '';
  
  jetxHistory.slice(0, 15).forEach(val => {
    const badge = document.createElement('span');
    badge.className = 'jetx-badge';
    if (val >= 2.0 && val < 10.0) {
      badge.classList.add('color-orange');
    } else if (val >= 10.0) {
      badge.classList.add('color-red');
    } else {
      badge.classList.add('color-yellow');
    }
    badge.textContent = `${val.toFixed(2)}x`;
    container.appendChild(badge);
  });
}

function startJetxRoundWaiting() {
  jetxState = 'waiting';
  jetxWaitTimer = 5;
  
  const displayWait = document.getElementById('jetx-waiting-display');
  const displayFlew = document.getElementById('jetx-flew-away-alert');
  const takeoffTimer = document.getElementById('jetx-takeoff-timer');
  const multDisplay = document.getElementById('jetx-multiplier-display');
  const progressBar = document.getElementById('jetx-takeoff-progress-bar');
  
  if (displayWait) displayWait.style.display = 'flex';
  if (displayFlew) displayFlew.style.display = 'none';
  if (multDisplay) multDisplay.style.display = 'none';
  if (takeoffTimer) takeoffTimer.textContent = jetxWaitTimer;
  if (progressBar) progressBar.style.width = '0%';
  
  resetJetxConsoleButtons();
  handleJetxAutoBetsPlacement();
  generateJetxLivePlayers();
  updateJetxLiveBetsTable();
  
  if (jetxIntervalId) clearInterval(jetxIntervalId);
  
  jetxIntervalId = setInterval(() => {
    jetxWaitTimer -= 0.1;
    
    if (progressBar) {
      const percentage = ((5 - jetxWaitTimer) / 5) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
    
    const secondsFloor = Math.ceil(jetxWaitTimer);
    if (takeoffTimer) takeoffTimer.textContent = secondsFloor >= 0 ? secondsFloor : 0;
    
    if (Math.abs(jetxWaitTimer - Math.round(jetxWaitTimer)) < 0.05 && secondsFloor > 0) {
      playTickSound();
    }
    
    if (jetxWaitTimer <= 0) {
      clearInterval(jetxIntervalId);
      jetxIntervalId = null;
      startJetxTakeoff();
    }
  }, 100);
}

function resetJetxConsoleButtons() {
  ['left', 'right'].forEach(side => {
    const amt = parseFloat(document.getElementById(`jetx-bet-amt-${side}`).value) || 100;
    const btn = document.getElementById(`jetx-bet-btn-${side}`);
    
    if (!jetxBets[side].placed) {
      if (btn) {
        btn.className = 'jetx-bet-submit-btn';
        btn.disabled = false;
        btn.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${amt.toFixed(2)}</span>`;
      }
      jetxBets[side].win = false;
    } else {
      if (btn) {
        btn.className = 'jetx-bet-submit-btn jetx-cancel';
        btn.disabled = false;
        btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
      }
      jetxBets[side].win = false;
    }
  });
}

function handleJetxAutoBetsPlacement() {
  ['left', 'right'].forEach(side => {
    const autoBetCheck = document.getElementById(`jetx-autobet-check-${side}`);
    if (autoBetCheck && autoBetCheck.checked) {
      const input = document.getElementById(`jetx-bet-amt-${side}`);
      const betVal = parseFloat(input.value) || 100;
      
      if (walletBalance >= betVal) {
        walletBalance -= betVal;
        updateBalanceUI();
        
        jetxBets[side].amount = betVal;
        jetxBets[side].placed = true;
        jetxBets[side].win = false;
        
        const btn = document.getElementById(`jetx-bet-btn-${side}`);
        if (btn) {
          btn.className = 'jetx-bet-submit-btn jetx-cancel';
          btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
        }
        
        playSynthSound(587.33, 'triangle', 0.15, 0.08);
      } else {
        autoBetCheck.checked = false;
        alert(`Auto Bet disabled on ${side === 'left' ? 'Console 1' : 'Console 2'} due to insufficient balance!`);
      }
    }
  });
}

function startJetxTakeoff() {
  jetxState = 'flying';
  jetxMultiplier = 1.00;
  jetxTimeElapsed = 0;
  
  const roll = Math.random();
  if (roll < 0.12) {
    jetxCrashLimit = 1.00 + (Math.random() * 0.05);
  } else if (roll < 0.55) {
    jetxCrashLimit = 1.06 + (Math.random() * 0.94);
  } else if (roll < 0.88) {
    jetxCrashLimit = 2.00 + (Math.random() * 4.00);
  } else if (roll < 0.98) {
    jetxCrashLimit = 6.00 + (Math.random() * 14.00);
  } else {
    jetxCrashLimit = 20.00 + (Math.random() * 60.00);
  }
  
  const displayWait = document.getElementById('jetx-waiting-display');
  const multDisplay = document.getElementById('jetx-multiplier-display');
  
  if (displayWait) displayWait.style.display = 'none';
  if (multDisplay) multDisplay.style.display = 'block';
  
  ['left', 'right'].forEach(side => {
    const btn = document.getElementById(`jetx-bet-btn-${side}`);
    if (jetxBets[side].placed) {
      if (btn) {
        btn.className = 'jetx-bet-submit-btn jetx-cashout';
        btn.innerHTML = `<span class="btn-main-lbl">CASH OUT</span><span class="btn-sub-lbl">₹${jetxBets[side].amount.toFixed(2)}</span>`;
      }
    }
  });
  
  startJetEngineSound();
}

function runJetxAnimationFrame() {
  if (activeScreen !== 'jetx') return;
  
  if (jetxState === 'flying') {
    jetxTimeElapsed += 0.016;
    
    // Smooth custom exponential growth curve
    jetxMultiplier = Math.exp(0.09 * jetxTimeElapsed);
    
    const multValEl = document.getElementById('jetx-mult-num');
    if (multValEl) multValEl.textContent = jetxMultiplier.toFixed(2);
    
    // Pitch rises with rocket multiplier
    updateJetEnginePitch(jetxMultiplier * 0.9);
    
    updateJetxCashoutButtons();
    checkJetxAutoCashouts();
    updateJetxLiveBetsPayouts();
    
    if (jetxMultiplier >= jetxCrashLimit) {
      jetxState = 'crashing';
      jetxCrashAnimTime = 0;
      
      stopJetEngineSound(false);
      playSpribeCrashWhooshSound(); // rocket explosion whoosh sound
      
      const alertEl = document.getElementById('jetx-flew-away-alert');
      const crashValEl = document.getElementById('jetx-crash-value');
      if (alertEl && crashValEl) {
        crashValEl.textContent = `${jetxMultiplier.toFixed(2)}x`;
        alertEl.style.display = 'flex';
      }
    }
  } else if (jetxState === 'crashing') {
    jetxCrashAnimTime += 0.016;
    
    if (jetxCrashAnimTime >= 0.75) {
      triggerJetxCrash();
      return;
    }
  } else if (jetxState === 'waiting') {
    jetxTimeElapsed += 0.016;
  }
  
  drawJetxCanvasFrame();
  
  jetxAnimId = requestAnimationFrame(runJetxAnimationFrame);
}

function updateJetxCashoutButtons() {
  ['left', 'right'].forEach(side => {
    if (jetxBets[side].placed && !jetxBets[side].win) {
      const cashValue = jetxBets[side].amount * jetxMultiplier;
      const btn = document.getElementById(`jetx-bet-btn-${side}`);
      if (btn) {
        btn.innerHTML = `<span class="btn-main-lbl">CASH OUT</span><span class="btn-sub-lbl">₹${cashValue.toFixed(2)}</span>`;
      }
    }
  });
}

function checkJetxAutoCashouts() {
  ['left', 'right'].forEach(side => {
    if (jetxBets[side].placed && !jetxBets[side].win) {
      const autoCashCheck = document.getElementById(`jetx-autocashout-check-${side}`);
      if (autoCashCheck && autoCashCheck.checked) {
        const autoValInput = document.getElementById(`jetx-autocashout-val-${side}`);
        const targetVal = parseFloat(autoValInput.value) || 2.00;
        
        if (jetxMultiplier >= targetVal) {
          cashOutJetxUserBet(side, targetVal);
        }
      }
    }
  });
}

function cashOutJetxUserBet(side, payoutMultiplier) {
  const state = jetxBets[side];
  const btn = document.getElementById(`jetx-bet-btn-${side}`);
  
  const winnings = state.amount * payoutMultiplier;
  walletBalance += winnings;
  updateBalanceUI();
  
  state.win = true;
  state.placed = false;
  
  if (btn) {
    btn.className = 'jetx-bet-submit-btn';
    btn.style.opacity = '0.5';
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-main-lbl">CASHED OUT</span><span class="btn-sub-lbl">+₹${winnings.toFixed(2)}</span>`;
  }
  
  playSpribeCashoutChime();
  showRewardAlertPopup(`JetX Win! +₹${winnings.toFixed(2)}`, `Cashed out successfully at ${payoutMultiplier.toFixed(2)}x`);
  
  jetxMyBetsHistory.unshift({
    period: new Date().toLocaleTimeString(),
    selection: `Console ${side === 'left' ? '1' : '2'}`,
    amount: state.amount,
    multiplier: payoutMultiplier,
    payout: winnings,
    status: 'Won'
  });
  renderJetxMyBetsTable();
}

function triggerJetxCrash() {
  jetxState = 'crashed';
  
  stopJetEngineSound(true); // explosion sound
  
  jetxHistory.unshift(jetxMultiplier);
  renderJetxHistoryBadges();
  
  ['left', 'right'].forEach(side => {
    const state = jetxBets[side];
    if (state.placed && !state.win) {
      jetxMyBetsHistory.unshift({
        period: new Date().toLocaleTimeString(),
        selection: `Console ${side === 'left' ? '1' : '2'}`,
        amount: state.amount,
        multiplier: 0,
        payout: 0,
        status: 'Lost'
      });
    }
  });
  renderJetxMyBetsTable();
  
  jetxBets.left.placed = false;
  jetxBets.right.placed = false;
  
  setTimeout(() => {
    if (activeScreen === 'jetx') {
      ['left', 'right'].forEach(side => {
        const btn = document.getElementById(`jetx-bet-btn-${side}`);
        if (btn) {
          btn.style.opacity = '1';
          btn.disabled = false;
        }
      });
      startJetxRoundWaiting();
      runJetxAnimationFrame();
    }
  }, 3000);
}

function adjustJetxBetAmount(side, delta) {
  const input = document.getElementById(`jetx-bet-amt-${side}`);
  if (input) {
    let current = parseFloat(input.value) || 100;
    current = Math.max(10, current + delta);
    input.value = current;
    
    const btn = document.getElementById(`jetx-bet-btn-${side}`);
    if (btn && !jetxBets[side].placed) {
      btn.querySelector('.btn-sub-lbl').textContent = `₹${current.toFixed(2)}`;
    }
  }
  playTickSound();
}

function setJetxBetAmount(side, amt) {
  const input = document.getElementById(`jetx-bet-amt-${side}`);
  if (input) {
    input.value = amt;
    const btn = document.getElementById(`jetx-bet-btn-${side}`);
    if (btn && !jetxBets[side].placed) {
      btn.querySelector('.btn-sub-lbl').textContent = `₹${amt.toFixed(2)}`;
    }
  }
  playTickSound();
}

function handleJetxBetClick(side) {
  const state = jetxBets[side];
  const input = document.getElementById(`jetx-bet-amt-${side}`);
  const btn = document.getElementById(`jetx-bet-btn-${side}`);
  
  if (!state.placed) {
    const betVal = parseFloat(input.value) || 100;
    
    if (walletBalance < betVal) {
      alert("Insufficient balance to place this JetX bet!");
      playLockSound();
      return;
    }
    
    walletBalance -= betVal;
    updateBalanceUI();
    
    state.amount = betVal;
    state.placed = true;
    state.win = false;
    
    if (jetxState === 'waiting') {
      if (btn) {
        btn.className = 'jetx-bet-submit-btn jetx-cancel';
        btn.innerHTML = `<span class="btn-main-lbl">CANCEL</span><span class="btn-sub-lbl">Waiting...</span>`;
      }
    } else if (jetxState === 'flying') {
      walletBalance += betVal;
      updateBalanceUI();
      state.placed = false;
      alert("Round already started! Bet will be placed next round.");
      return;
    }
    
    playSynthSound(587.33, 'triangle', 0.15, 0.08);
    renderJetxMyBetsTable();
  } else {
    if (jetxState === 'waiting') {
      walletBalance += state.amount;
      updateBalanceUI();
      
      state.placed = false;
      if (btn) {
        btn.className = 'jetx-bet-submit-btn';
        btn.innerHTML = `<span class="btn-main-lbl">BET</span><span class="btn-sub-lbl">₹${state.amount.toFixed(2)}</span>`;
      }
      playLockSound();
    } else if (jetxState === 'flying' && !state.win) {
      cashOutJetxUserBet(side, jetxMultiplier);
    }
  }
}

function switchJetxConsoleTab(side, tabName) {
  const btnBet = document.getElementById(`jetx-tab-bet-${side}`);
  const btnAuto = document.getElementById(`jetx-tab-auto-${side}`);
  const autoPanel = document.getElementById(`jetx-auto-${side}`);
  
  if (tabName === 'bet') {
    btnBet.classList.add('active');
    btnAuto.classList.remove('active');
    if (autoPanel) autoPanel.style.display = 'none';
  } else {
    btnBet.classList.remove('active');
    btnAuto.classList.add('active');
    if (autoPanel) autoPanel.style.display = 'block';
  }
  playTickSound();
}

function toggleJetxAutoBet(side) {
  playTickSound();
}

function toggleJetxAutoCashout(side) {
  const check = document.getElementById(`jetx-autocashout-check-${side}`);
  const input = document.getElementById(`jetx-autocashout-val-${side}`);
  
  if (check && input) {
    input.disabled = !check.checked;
  }
  playTickSound();
}

function switchJetxLiveTableTab(tabName) {
  jetxActiveTableTab = tabName;
  const tabAll = document.getElementById('jetx-live-tab-all');
  const tabMy = document.getElementById('jetx-live-tab-my');
  const containerAll = document.getElementById('jetx-live-rows-container');
  const containerMy = document.getElementById('jetx-my-rows-container');
  
  if (tabName === 'all') {
    tabAll.classList.add('active');
    tabMy.classList.remove('active');
    containerAll.style.display = 'flex';
    containerMy.style.display = 'none';
  } else {
    tabAll.classList.remove('active');
    tabMy.classList.add('active');
    containerAll.style.display = 'none';
    containerMy.style.display = 'flex';
  }
  playTickSound();
}

function generateJetxLivePlayers() {
  jetxLivePlayers = [];
  const count = 12 + Math.floor(Math.random() * 12);
  const prefixes = ['98***', '99***', '97***', '88***', '87***', '78***', '95***', '91***', '90***', '80***'];
  const userLetters = ['a', 'b', 'c', 'x', 'y', 'z', 'm', 'n', 's', 'r'];
  
  for (let i = 0; i < count; i++) {
    const isPhone = Math.random() > 0.4;
    let username = '';
    if (isPhone) {
      const suffix = Math.floor(100 + Math.random() * 900);
      username = prefixes[Math.floor(Math.random() * prefixes.length)] + suffix;
    } else {
      const name = userLetters[Math.floor(Math.random() * userLetters.length)] + userLetters[Math.floor(Math.random() * userLetters.length)] + '***' + Math.floor(10 + Math.random() * 90);
      username = name;
    }
    
    const betAmt = Math.random() > 0.5 ? Math.floor(1 + Math.random() * 10) * 100 : Math.floor(1 + Math.random() * 20) * 10;
    
    const rand = Math.random();
    let targetMult = 1.10;
    if (rand < 0.25) {
      targetMult = 1.05 + (Math.random() * 0.20);
    } else if (rand < 0.70) {
      targetMult = 1.26 + (Math.random() * 1.24);
    } else if (rand < 0.90) {
      targetMult = 2.51 + (Math.random() * 3.49);
    } else {
      targetMult = 6.01 + (Math.random() * 19.0);
    }
    
    jetxLivePlayers.push({
      username: username,
      amount: betAmt,
      targetMultiplier: targetMult,
      cashedOut: false,
      payout: 0,
      payoutMultiplier: 0
    });
  }
}

function updateJetxLiveBetsTable() {
  const container = document.getElementById('jetx-live-rows-container');
  if (!container) return;
  
  container.innerHTML = '';
  jetxLivePlayers.sort((a, b) => b.amount - a.amount);
  
  const totalBetsEl = document.getElementById('jetx-live-total-bets');
  if (totalBetsEl) {
    totalBetsEl.textContent = `All bets: ${jetxLivePlayers.length}`;
  }
  
  ['left', 'right'].forEach(side => {
    if (jetxBets[side].placed || jetxBets[side].win) {
      const row = document.createElement('div');
      row.className = `jetx-live-row user-row ${jetxBets[side].win ? 'cashed-out' : ''}`;
      
      row.innerHTML = `
        <span class="jetx-val-bold">Console ${side === 'left' ? '1' : '2'} (You)</span>
        <span>₹${jetxBets[side].amount}</span>
        <span class="jetx-val-bold">${jetxBets[side].win ? 'Cashed Out' : '-'}</span>
        <span class="${jetxBets[side].win ? 'jetx-val-payout' : ''}">${jetxBets[side].win ? 'Win' : '-'}</span>
      `;
      container.appendChild(row);
    }
  });
  
  jetxLivePlayers.forEach(player => {
    const row = document.createElement('div');
    row.className = `jetx-live-row ${player.cashedOut ? 'cashed-out' : ''}`;
    
    row.innerHTML = `
      <span>${player.username}</span>
      <span>₹${player.amount}</span>
      <span class="jetx-val-bold">${player.cashedOut ? player.payoutMultiplier.toFixed(2) + 'x' : '-'}</span>
      <span class="${player.cashedOut ? 'jetx-val-payout' : ''}">${player.cashedOut ? '₹' + player.payout.toFixed(2) : '-'}</span>
    `;
    container.appendChild(row);
  });
}

function updateJetxLiveBetsPayouts() {
  let tableNeedsUpdate = false;
  let cashOutCount = 0;
  
  jetxLivePlayers.forEach(player => {
    if (!player.cashedOut) {
      if (jetxMultiplier >= player.targetMultiplier && player.targetMultiplier < jetxCrashLimit) {
        player.cashedOut = true;
        player.payoutMultiplier = player.targetMultiplier;
        player.payout = player.amount * player.payoutMultiplier;
        tableNeedsUpdate = true;
      }
    }
    
    if (player.cashedOut) {
      cashOutCount++;
    }
  });
  
  if (tableNeedsUpdate) {
    updateJetxLiveBetsTable();
  }
  
  const winnersCountEl = document.getElementById('jetx-live-total-won');
  if (winnersCountEl) {
    winnersCountEl.textContent = cashOutCount > 0 ? `Winners: ${cashOutCount}` : '';
  }
}

function renderJetxMyBetsTable() {
  const container = document.getElementById('jetx-my-rows-container');
  if (!container) return;
  
  if (jetxMyBetsHistory.length === 0) {
    container.innerHTML = '<div class="jetx-empty-table-msg">No bets placed in this session.</div>';
    return;
  }
  
  container.innerHTML = '';
  jetxMyBetsHistory.slice(0, 30).forEach(bet => {
    const row = document.createElement('div');
    row.className = `jetx-live-row user-row ${bet.status === 'Won' ? 'cashed-out' : ''}`;
    
    let payoutHtml = '';
    if (bet.status === 'Won') {
      payoutHtml = `<span class="jetx-val-payout">+₹${bet.payout.toFixed(2)}</span>`;
    } else {
      payoutHtml = `<span class="lost-color">-₹${bet.amount.toFixed(2)}</span>`;
    }
    
    row.innerHTML = `
      <span>${bet.period}</span>
      <span>₹${bet.amount.toFixed(0)}</span>
      <span class="jetx-val-bold">${bet.status === 'Won' ? bet.multiplier.toFixed(2) + 'x' : '-'}</span>
      <span>${payoutHtml}</span>
    `;
    container.appendChild(row);
  });
}

function openJetxRules() {
  alert("JetX Rules:\n1. Place your bet before takeoff using one or both consoles.\n2. Watch the Jet Rocket lift off and the multiplier rise.\n3. Cash Out before the jet explodes (BOOM!) to win your bet multiplied.\n4. Use the Auto tab to automate betting and cashouts.");
}

function drawJetxCanvasFrame() {
  const w = jetxCanvas.width;
  const h = jetxCanvas.height;
  
  jetxCtx.clearRect(0, 0, w, h);
  
  const startX = 50;
  const startY = h - 45;
  
  const gridSpacing = 40;
  const offsetX = -(jetxTimeElapsed * 120) % gridSpacing;
  const offsetY = (jetxTimeElapsed * 60) % gridSpacing;
  
  jetxCtx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  jetxCtx.lineWidth = 1;
  
  for (let x = offsetX; x < w; x += gridSpacing) {
    jetxCtx.beginPath();
    jetxCtx.moveTo(x, 0);
    jetxCtx.lineTo(x, h);
    jetxCtx.stroke();
  }
  
  for (let y = offsetY; y < h; y += gridSpacing) {
    jetxCtx.beginPath();
    jetxCtx.moveTo(0, y);
    jetxCtx.lineTo(w, y);
    jetxCtx.stroke();
  }
  
  jetxCtx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  for (let i = 0; i < 20; i++) {
    const starX = (Math.sin(i * 123 + jetxTimeElapsed * 0.1) * 0.5 + 0.5) * w;
    const starY = (Math.cos(i * 456 + jetxTimeElapsed * 0.05) * 0.5 + 0.5) * h;
    const size = (i % 3 === 0) ? 2 : 1;
    jetxCtx.beginPath();
    jetxCtx.arc(starX, starY, size, 0, Math.PI * 2);
    jetxCtx.fill();
  }
  
  let endX, endY;
  let progress = Math.min(jetxTimeElapsed / 8, 1.0);
  
  if (jetxState === 'flying') {
    endX = startX + (w - startX - 70) * progress;
    endY = startY - (startY - 40) * Math.pow(progress, 1.6);
    
    lastJetxCurveEndX = endX;
    lastJetxCurveEndY = endY;
  } else if (jetxState === 'crashing') {
    endX = lastJetxCurveEndX;
    endY = lastJetxCurveEndY;
  } else {
    endX = startX;
    endY = startY;
  }
  
  let rocketX = endX;
  let rocketY = endY;
  
  if (jetxState === 'crashing') {
    const animProgress = jetxCrashAnimTime / 0.75;
    rocketX = endX + (w - endX + 150) * animProgress;
    rocketY = endY - (endY + 100) * animProgress;
  }
  
  const grad = jetxCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255, 215, 0, 0.25)');
  grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  jetxCtx.fillStyle = grad;
  
  jetxCtx.beginPath();
  jetxCtx.moveTo(startX, startY);
  const controlX = startX + (endX - startX) * 0.55;
  const controlY = startY;
  jetxCtx.quadraticCurveTo(controlX, controlY, endX, endY);
  jetxCtx.lineTo(endX, startY);
  jetxCtx.closePath();
  jetxCtx.fill();
  
  jetxCtx.strokeStyle = '#ffd700';
  jetxCtx.lineWidth = 3.5;
  jetxCtx.shadowColor = '#ffd700';
  jetxCtx.shadowBlur = 8;
  jetxCtx.beginPath();
  jetxCtx.moveTo(startX, startY);
  jetxCtx.quadraticCurveTo(controlX, controlY, endX, endY);
  jetxCtx.stroke();
  
  jetxCtx.shadowBlur = 0;
  
  if (jetxState === 'flying' || jetxState === 'crashing') {
    jetxCtx.save();
    jetxCtx.translate(rocketX, rocketY);
    
    let angle;
    if (jetxState === 'flying') {
      angle = -0.15 - (0.35 * progress);
    } else {
      angle = -0.5 - (0.45 * (jetxCrashAnimTime / 0.75));
    }
    jetxCtx.rotate(angle);
    
    const wobble = Math.sin(jetxTimeElapsed * 45) * 1.5;
    jetxCtx.translate(0, wobble);
    
    jetxCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    jetxCtx.beginPath();
    jetxCtx.ellipse(-10, 18, 14, 4, 0, 0, Math.PI * 2);
    jetxCtx.fill();
    
    if (jetxState === 'flying') {
      const flameLength = 15 + Math.random() * 10;
      const gradFlame = jetxCtx.createLinearGradient(-15, 0, -15 - flameLength, 0);
      gradFlame.addColorStop(0, '#fff');
      gradFlame.addColorStop(0.2, '#ffd700');
      gradFlame.addColorStop(0.6, '#ff6a00');
      gradFlame.addColorStop(1, 'rgba(255, 42, 95, 0)');
      
      jetxCtx.fillStyle = gradFlame;
      jetxCtx.beginPath();
      jetxCtx.moveTo(-16, -3);
      jetxCtx.quadraticCurveTo(-22 - flameLength, 0, -16, 3);
      jetxCtx.closePath();
      jetxCtx.fill();
    }
    
    jetxCtx.fillStyle = '#ffd700';
    jetxCtx.beginPath();
    jetxCtx.moveTo(-16, -1.5);
    jetxCtx.lineTo(10, -3.5);
    jetxCtx.bezierCurveTo(15, -3.5, 17, 0, 12, 1.5);
    jetxCtx.lineTo(-16, 2.5);
    jetxCtx.closePath();
    jetxCtx.fill();
    
    jetxCtx.fillStyle = '#111111';
    jetxCtx.beginPath();
    jetxCtx.moveTo(8, -3);
    jetxCtx.bezierCurveTo(13, -3, 15, 0, 12, 1.5);
    jetxCtx.lineTo(7, 1);
    jetxCtx.closePath();
    jetxCtx.fill();
    
    jetxCtx.fillStyle = '#111111';
    jetxCtx.beginPath();
    jetxCtx.moveTo(-10, -2);
    jetxCtx.lineTo(-17, -9);
    jetxCtx.lineTo(-14, -9);
    jetxCtx.lineTo(-7, -2);
    jetxCtx.closePath();
    jetxCtx.fill();
    
    jetxCtx.fillStyle = '#222222';
    jetxCtx.beginPath();
    jetxCtx.moveTo(-6, 2);
    jetxCtx.lineTo(-12, 12);
    jetxCtx.lineTo(-8, 12);
    jetxCtx.lineTo(2, 2);
    jetxCtx.closePath();
    jetxCtx.fill();
    
    jetxCtx.strokeStyle = '#111';
    jetxCtx.lineWidth = 1.5;
    jetxCtx.beginPath();
    jetxCtx.moveTo(-4, -2.5);
    jetxCtx.lineTo(-4, 2.2);
    jetxCtx.stroke();
    
    jetxCtx.beginPath();
    jetxCtx.moveTo(2, -3.2);
    jetxCtx.lineTo(2, 1.8);
    jetxCtx.stroke();
    
    jetxCtx.restore();
  }
  
  jetxCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  jetxCtx.lineWidth = 1.5;
  jetxCtx.beginPath();
  jetxCtx.moveTo(startX, 0);
  jetxCtx.lineTo(startX, startY);
  jetxCtx.lineTo(w, startY);
  jetxCtx.stroke();
}


// ==========================================================================
// CRICTRADE (OPINION TRADING) ENGINE
// ==========================================================================

let cricIntervalId = null;
let cricActiveTab = 'opinions'; // 'opinions' or 'trades'

let cricMatchState = {
  runs: 42,
  wickets: 2,
  ballsBowled: 31, // 5.1 overs
  oversFormatted: '5.1',
  batsmen: [
    { name: "V. Kohli", runs: 18, balls: 12, onStrike: true, isOut: false },
    { name: "R. Pant", runs: 12, balls: 9, onStrike: false, isOut: false }
  ],
  bowler: { name: "S. Afridi", wickets: 1, runs: 14, overs: '2.1' },
  ballHistory: [ 1, 'W', 4, 0, 6, 2 ],
  lastCommentary: "IND needs 18 runs in 5 balls to finish powerplay. V. Kohli is on strike.",
  targetScore: 60,
  isCompleted: false
};

const cricBatsmenPool = ["S. Iyer", "K. L. Rahul", "H. Pandya", "R. Jadeja", "M. Shami", "J. Bumrah"];
let cricPoolIndex = 0;

let cricOpinions = [];
let userCricTrades = [];

// Drawer state variables
let currentCricDrawerQuestionId = '';
let currentCricDrawerSelection = 'yes';
let currentCricDrawerPrice = 5.0;
let currentCricDrawerQty = 5;

// Define available opinions
function setupCricOpinions() {
  cricOpinions = [
    {
      id: "opt_1",
      tag: "Powerplay",
      question: "Will India score 50 or more runs in the first 6 overs?",
      subtext: "Current: 42 runs. Needs 8 runs in 5 balls.",
      yesPrice: 7.5,
      noPrice: 2.5,
      volume: "12.4k",
      status: "unsettled", // "unsettled", "yes", "no"
      checkSettle: function(match) {
        if (match.runs >= 50) return "yes";
        if (match.ballsBowled >= 36) return "no"; // End of 6.0 overs
        return null;
      },
      updatePrices: function(match) {
        if (this.status !== "unsettled") return;
        const runsNeeded = 50 - match.runs;
        const ballsRemaining = 36 - match.ballsBowled;
        
        if (runsNeeded <= 0) {
          this.yesPrice = 10;
          this.noPrice = 0;
          return;
        }
        if (ballsRemaining <= 0) {
          this.yesPrice = 0;
          this.noPrice = 10;
          return;
        }
        
        // Probability estimation
        let prob = (ballsRemaining * 1.5) / (runsNeeded * 1.8);
        if (runsNeeded === 1 && ballsRemaining >= 1) prob = 0.9;
        if (runsNeeded > ballsRemaining * 6) prob = 0.01;
        
        if (prob > 0.95) prob = 0.95;
        if (prob < 0.05) prob = 0.05;
        
        this.yesPrice = Math.round(prob * 10 * 2) / 2;
        this.noPrice = 10 - this.yesPrice;
        this.subtext = `Current IND: ${match.runs} runs. Needs ${runsNeeded} runs in ${ballsRemaining} balls.`;
      }
    },
    {
      id: "opt_2",
      tag: "Kohli Runs",
      question: "Will Virat Kohli score 30 or more runs in this innings?",
      subtext: "Current: 18 runs. Needs 12 runs.",
      yesPrice: 6.0,
      noPrice: 4.0,
      volume: "18.2k",
      status: "unsettled",
      checkSettle: function(match) {
        const k = match.batsmen.find(b => b.name === "V. Kohli");
        if (k && k.runs >= 30) return "yes";
        if (k && k.isOut) return "no";
        if (match.isCompleted && (!k || k.runs < 30)) return "no";
        return null;
      },
      updatePrices: function(match) {
        if (this.status !== "unsettled") return;
        const k = match.batsmen.find(b => b.name === "V. Kohli");
        if (!k) return;
        
        if (k.runs >= 30) {
          this.yesPrice = 10;
          this.noPrice = 0;
          return;
        }
        if (k.isOut) {
          this.yesPrice = 0;
          this.noPrice = 10;
          return;
        }
        
        const runsNeeded = 30 - k.runs;
        let prob = 0.7 - (runsNeeded * 0.05);
        if (prob > 0.95) prob = 0.95;
        if (prob < 0.05) prob = 0.05;
        
        this.yesPrice = Math.round(prob * 10 * 2) / 2;
        this.noPrice = 10 - this.yesPrice;
        this.subtext = `Kohli Current: ${k.runs} runs. Needs ${runsNeeded} runs.`;
      }
    },
    {
      id: "opt_3",
      tag: "Next Wicket",
      question: "Will a wicket fall in the next 6 balls (Over 6)?",
      subtext: "Resolves at the end of the 6th over.",
      yesPrice: 3.0,
      noPrice: 7.0,
      volume: "8.5k",
      status: "unsettled",
      startBallCount: 31, // Start of over 5.1
      checkSettle: function(match) {
        // Did wicket fall in balls 31-36?
        const currentBalls = match.ballsBowled;
        
        // Find if any wicket fell since ball 31
        if (match.wicketFellThisOver) return "yes";
        if (currentBalls >= 36) return "no";
        return null;
      },
      updatePrices: function(match) {
        if (this.status !== "unsettled") return;
        const currentBalls = match.ballsBowled;
        const ballsElapsed = currentBalls - this.startBallCount;
        
        if (match.wicketFellThisOver) {
          this.yesPrice = 10;
          this.noPrice = 0;
          return;
        }
        if (currentBalls >= 36) {
          this.yesPrice = 0;
          this.noPrice = 10;
          return;
        }
        
        let prob = 0.2 + (ballsElapsed * 0.08); // Wicket prob increases slightly as dots accumulate
        if (prob > 0.95) prob = 0.95;
        if (prob < 0.05) prob = 0.05;
        
        this.yesPrice = Math.round(prob * 10 * 2) / 2;
        this.noPrice = 10 - this.yesPrice;
        this.subtext = `Balls bowled in over: ${ballsElapsed}/6.`;
      }
    },
    {
      id: "opt_4",
      tag: "Match Winner",
      question: "Will India win the match against Pakistan?",
      subtext: "IND needs 18 runs to win.",
      yesPrice: 5.5,
      noPrice: 4.5,
      volume: "45.1k",
      status: "unsettled",
      checkSettle: function(match) {
        if (match.runs >= match.targetScore) return "yes";
        if (match.wickets >= 10) return "no";
        if (match.ballsBowled >= 36 && match.runs < match.targetScore) return "no"; // Short simulation ends at over 6.0
        return null;
      },
      updatePrices: function(match) {
        if (this.status !== "unsettled") return;
        const runsNeeded = match.targetScore - match.runs;
        const ballsRemaining = 36 - match.ballsBowled;
        
        if (runsNeeded <= 0) {
          this.yesPrice = 10;
          this.noPrice = 0;
          return;
        }
        if (ballsRemaining <= 0 || match.wickets >= 10) {
          this.yesPrice = 0;
          this.noPrice = 10;
          return;
        }
        
        let requiredRunRate = (runsNeeded / ballsRemaining) * 6;
        let prob = 0.5;
        if (requiredRunRate > 24) prob = 0.01;
        else if (requiredRunRate > 18) prob = 0.08;
        else if (requiredRunRate > 12) prob = 0.25;
        else if (requiredRunRate > 8) prob = 0.55;
        else if (requiredRunRate > 5) prob = 0.80;
        else prob = 0.95;
        
        this.yesPrice = Math.round(prob * 10 * 2) / 2;
        this.noPrice = 10 - this.yesPrice;
        this.subtext = `IND: ${match.runs}/2. Needs ${runsNeeded} runs in ${ballsRemaining} balls.`;
      }
    }
  ];
}

// Initialise CricTrade loop
function initCricTradeEngine() {
  if (cricIntervalId) clearInterval(cricIntervalId);
  
  // Initialize state
  cricMatchState.runs = 42;
  cricMatchState.wickets = 2;
  cricMatchState.ballsBowled = 31;
  cricMatchState.oversFormatted = '5.1';
  cricMatchState.batsmen = [
    { name: "V. Kohli", runs: 18, balls: 12, onStrike: true, isOut: false },
    { name: "R. Pant", runs: 12, balls: 9, onStrike: false, isOut: false }
  ];
  cricMatchState.bowler = { name: "S. Afridi", wickets: 1, runs: 14, overs: '2.1' };
  cricMatchState.ballHistory = [ 1, 'W', 4, 0, 6, 2 ];
  cricMatchState.lastCommentary = "IND needs 18 runs to win the match. V. Kohli is on strike.";
  cricMatchState.isCompleted = false;
  cricMatchState.wicketFellThisOver = false;
  cricPoolIndex = 0;
  
  setupCricOpinions();
  
  // Render initial layouts
  renderCricScorecard();
  renderCricOpinions();
  renderCricPortfolio();
  updateCricActiveTradesBadge();
  
  // Launch game tick loop (every 8 seconds)
  cricIntervalId = setInterval(simulateCricketBall, 8000);
}

// Stop CricTrade loop
function stopCricTradeEngine() {
  if (cricIntervalId) {
    clearInterval(cricIntervalId);
    cricIntervalId = null;
  }
}

// Ball simulator logic
function simulateCricketBall() {
  if (cricMatchState.isCompleted) return;
  
  cricMatchState.wicketFellThisOver = false;
  cricMatchState.ballsBowled++;
  
  // 1. Choose ball outcome randomly
  const outcomes = [0, 1, 2, 4, 6, 'W'];
  const weights = [0.28, 0.35, 0.12, 0.13, 0.07, 0.05]; // Wicket 5% probability
  
  let r = Math.random();
  let selectedOutcome = 0;
  let runningSum = 0;
  for (let i = 0; i < outcomes.length; i++) {
    runningSum += weights[i];
    if (r <= runningSum) {
      selectedOutcome = outcomes[i];
      break;
    }
  }
  
  const striker = cricMatchState.batsmen.find(b => b.onStrike);
  const nonStriker = cricMatchState.batsmen.find(b => !b.onStrike);
  
  let ballLabelText = selectedOutcome.toString();
  
  if (selectedOutcome === 'W') {
    cricMatchState.wickets++;
    cricMatchState.wicketFellThisOver = true;
    ballLabelText = 'W';
    
    // Striker gets out
    striker.isOut = true;
    striker.balls++;
    
    cricMatchState.lastCommentary = `OUT! Afridi gets the breakthrough! ${striker.name} is caught behind by Rizwan for ${striker.runs}(${striker.balls}).`;
    
    // Bring in new batsman if not all out
    if (cricMatchState.wickets < 10) {
      let newName = cricBatsmenPool[cricPoolIndex % cricBatsmenPool.length];
      cricPoolIndex++;
      
      // Replace striker in list
      const idx = cricMatchState.batsmen.findIndex(b => b.name === striker.name);
      cricMatchState.batsmen[idx] = { name: newName, runs: 0, balls: 0, onStrike: true, isOut: false };
      cricMatchState.lastCommentary += ` ${newName} walks in at number ${cricMatchState.wickets + 1}.`;
    }
  } else {
    // Runs scored
    const runsVal = parseInt(selectedOutcome);
    cricMatchState.runs += runsVal;
    
    // Update striker batsman stats
    striker.runs += runsVal;
    striker.balls++;
    
    cricMatchState.bowler.runs += runsVal;
    
    // Choose commentary commentary sentence
    const comments = {
      0: [`Excellent defensive stroke, no run.`, `Pushed back to the bowler. Dot ball.`, `Beat him on the outside edge.`],
      1: [`Tucked away to deep mid-wicket for a single.`, `Flicked away for a quick single.`, `Pushed to long-on for a run.`],
      2: [`Slick placements! Kohli runs hard to convert it to a double.`, `Flicked through square leg, they call for two and get it easily.`],
      4: [`SHOT! Boundary through extra cover. Four runs!`, `CRACKING SHOT! Pulled away behind square leg for four!`],
      6: [`SIX! That's massive! Lodged into the stands!`, `MAJESTIC SHOT! Hooked high over deep fine leg for a sixer!`]
    };
    
    const possibleStrings = comments[runsVal];
    const randComment = possibleStrings[Math.floor(Math.random() * possibleStrings.length)];
    cricMatchState.lastCommentary = `Afridi to ${striker.name}: ${runsVal} run${runsVal !== 1 ? 's' : ''}. ${randComment}`;
    
    // Swapping strike if odd runs
    if (runsVal === 1) {
      striker.onStrike = false;
      nonStriker.onStrike = true;
    }
  }
  
  // Overs formatting
  const mainOvers = Math.floor(cricMatchState.ballsBowled / 6);
  const subOvers = cricMatchState.ballsBowled % 6;
  cricMatchState.oversFormatted = `${mainOvers}.${subOvers}`;
  
  // Bowler overs formatted
  cricMatchState.bowler.overs = `${Math.floor(cricMatchState.ballsBowled / 6)}.${cricMatchState.ballsBowled % 6}`;
  
  // Push ball outcome log history
  cricMatchState.ballHistory.push(ballLabelText);
  if (cricMatchState.ballHistory.length > 6) {
    cricMatchState.ballHistory.shift();
  }
  
  // Over end checks swap strike
  if (subOvers === 0) {
    const s = cricMatchState.batsmen.find(b => b.onStrike);
    const ns = cricMatchState.batsmen.find(b => !b.onStrike);
    if (s && ns) {
      s.onStrike = false;
      ns.onStrike = true;
    }
    cricMatchState.lastCommentary += " End of the over.";
  }
  
  // 2. Settle and update opinion contract prices
  updateCricPricesAndSettlements();
  
  // 3. Render modifications
  renderCricScorecard();
  renderCricOpinions();
  renderCricPortfolio();
  
  // Check if match ended
  checkCricMatchCompletion();
}

// Update prices & settle open trades
function updateCricPricesAndSettlements() {
  cricOpinions.forEach(op => {
    if (op.status !== "unsettled") return;
    
    // Settle check
    const settleOutcome = op.checkSettle(cricMatchState);
    if (settleOutcome) {
      op.status = settleOutcome;
      op.yesPrice = settleOutcome === "yes" ? 10 : 0;
      op.noPrice = settleOutcome === "yes" ? 0 : 10;
      
      // Settle active user trades
      settleUserCricTrades(op.id, settleOutcome);
    } else {
      // Re-calculate prices dynamically
      op.updatePrices(cricMatchState);
      
      // Match pending limit orders
      matchCricLimitOrders(op.id, op.yesPrice, op.noPrice);
    }
  });
}

// Match limit orders
function matchCricLimitOrders(opinionId, currentYesPrice, currentNoPrice) {
  userCricTrades.forEach(trade => {
    if (trade.questionId === opinionId && trade.status === 'pending') {
      if (trade.selection === 'yes' && currentYesPrice <= trade.buyPrice) {
        trade.status = 'active';
        showCricNotification(`Limit Bid Matched!`, `YES on ${trade.questionText.slice(0, 18)}... matched at ₹${trade.buyPrice}`, true);
      } else if (trade.selection === 'no' && currentNoPrice <= trade.buyPrice) {
        trade.status = 'active';
        showCricNotification(`Limit Bid Matched!`, `NO on ${trade.questionText.slice(0, 18)}... matched at ₹${trade.buyPrice}`, true);
      }
    }
  });
}

// Settle completed trades
function settleUserCricTrades(opinionId, settleOutcome) {
  let payoutTotal = 0;
  let winCount = 0;
  
  userCricTrades.forEach(trade => {
    if (trade.questionId === opinionId && (trade.status === 'active' || trade.status === 'pending')) {
      if (trade.selection === settleOutcome) {
        // User won
        const payout = trade.quantity * 10;
        payoutTotal += payout;
        trade.status = 'won';
        trade.settleValue = payout;
        winCount++;
      } else {
        // User lost
        trade.status = 'lost';
        trade.settleValue = 0;
      }
    }
  });
  
  if (payoutTotal > 0) {
    walletBalance += payoutTotal;
    updateBalanceUI();
    playWinSound();
    showCricNotification(`Congratulations!`, `You won ₹${payoutTotal.toFixed(2)} on CricTrade predictions!`, true);
  } else if (winCount === 0 && userCricTrades.some(t => t.questionId === opinionId)) {
    playLoseSound();
  }
  
  updateCricActiveTradesBadge();
}

// Check match end condition
function checkCricMatchCompletion() {
  let outcomeWinner = cricMatchState.runs >= cricMatchState.targetScore ? "yes" : null;
  if (cricMatchState.wickets >= 10 || cricMatchState.ballsBowled >= 36) {
    if (!outcomeWinner) outcomeWinner = "no";
  }
  
  if (outcomeWinner) {
    cricMatchState.isCompleted = true;
    stopCricTradeEngine();
    
    // Settle winner opinions
    updateCricPricesAndSettlements();
    
    cricMatchState.lastCommentary = `MATCH COMPLETED. IND: ${cricMatchState.runs}/${cricMatchState.wickets} in ${cricMatchState.oversFormatted} overs. Target: ${cricMatchState.targetScore}. ${outcomeWinner === 'yes' ? 'IND wins!' : 'PAK wins!'}`;
    
    renderCricScorecard();
    renderCricOpinions();
    renderCricPortfolio();
    
    // Restart match loop in 10 seconds
    setTimeout(() => {
      initCricTradeEngine();
      showCricNotification(`New CricTrade Match!`, `Match re-started. Clean slate of predictions.`, false);
    }, 10000);
  }
}

// Render scoreboard widget
function renderCricScorecard() {
  const runsEl = document.getElementById('cric-ind-runs');
  const oversEl = document.getElementById('cric-ind-overs');
  const b1NameEl = document.getElementById('cric-batsman1-name');
  const b1StatEl = document.getElementById('cric-batsman1-stat');
  const b2NameEl = document.getElementById('cric-batsman2-name');
  const b2StatEl = document.getElementById('cric-batsman2-stat');
  const bowlerEl = document.getElementById('cric-bowler-stat');
  const ballHistoryEl = document.getElementById('cric-ball-history');
  const commEl = document.getElementById('cric-live-commentary');
  
  if (runsEl) runsEl.textContent = `${cricMatchState.runs}/${cricMatchState.wickets}`;
  if (oversEl) oversEl.textContent = `(${cricMatchState.oversFormatted} overs)`;
  
  const b1 = cricMatchState.batsmen[0];
  const b2 = cricMatchState.batsmen[1];
  
  if (b1NameEl && b1) {
    b1NameEl.textContent = b1.name;
    if (b1.onStrike) b1NameEl.classList.add('on-strike');
    else b1NameEl.classList.remove('on-strike');
  }
  if (b1StatEl && b1) b1StatEl.textContent = `${b1.runs}*(${b1.balls})`;
  
  if (b2NameEl && b2) {
    b2NameEl.textContent = b2.name;
    if (b2.onStrike) b2NameEl.classList.add('on-strike');
    else b2NameEl.classList.remove('on-strike');
  }
  if (b2StatEl && b2) b2StatEl.textContent = `${b2.runs}*(${b2.balls})`;
  
  if (bowlerEl) bowlerEl.textContent = `${cricMatchState.bowler.name} ${cricMatchState.bowler.wickets}/${cricMatchState.bowler.runs} (${cricMatchState.bowler.overs})`;
  
  if (commEl) commEl.textContent = cricMatchState.lastCommentary;
  
  // Render Ball Log history
  if (ballHistoryEl) {
    ballHistoryEl.innerHTML = '';
    cricMatchState.ballHistory.forEach(b => {
      const bEl = document.createElement('span');
      let classType = 'run-0';
      if (b === 'W') classType = 'run-w';
      else if (b === '4') classType = 'run-4';
      else if (b === '6') classType = 'run-6';
      else if (b === '1') classType = 'run-1';
      else if (b === '2') classType = 'run-2';
      
      bEl.className = `ball-item ${classType}`;
      bEl.textContent = b;
      ballHistoryEl.appendChild(bEl);
    });
  }
}

// Render opinions card list
function renderCricOpinions() {
  const container = document.getElementById('cric-opinions-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  cricOpinions.forEach(op => {
    const card = document.createElement('div');
    card.className = `opinion-card ${op.status !== 'unsettled' ? 'settled-op' : ''}`;
    
    let probBarHtml = '';
    let actionButtonsHtml = '';
    
    if (op.status === 'unsettled') {
      const yesPct = op.yesPrice * 10;
      const noPct = op.noPrice * 10;
      
      probBarHtml = `
        <div class="opinion-probability-bar">
          <div class="prob-yes" style="width: ${yesPct}%;">Yes ${yesPct.toFixed(0)}%</div>
          <div class="prob-no" style="width: ${noPct}%;">No ${noPct.toFixed(0)}%</div>
        </div>
      `;
      
      actionButtonsHtml = `
        <div class="opinion-actions-row">
          <button class="trade-bid-btn bid-yes" onclick="openCricTradeDrawer('${op.id}', 'yes')">
            <span class="bid-label">YES</span>
            <span class="bid-price">₹${op.yesPrice.toFixed(1)}</span>
          </button>
          <button class="trade-bid-btn bid-no" onclick="openCricTradeDrawer('${op.id}', 'no')">
            <span class="bid-label">NO</span>
            <span class="bid-price">₹${op.noPrice.toFixed(1)}</span>
          </button>
        </div>
      `;
    } else {
      probBarHtml = `
        <div class="opinion-probability-bar">
          <div class="prob-yes" style="width: ${op.status === 'yes' ? 100 : 0}%;">${op.status === 'yes' ? 'RESOLVED YES (10.0)' : ''}</div>
          <div class="prob-no" style="width: ${op.status === 'no' ? 100 : 0}%;">${op.status === 'no' ? 'RESOLVED NO (10.0)' : ''}</div>
        </div>
      `;
      
      actionButtonsHtml = `
        <div class="opinion-settled-info" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-top: 8px;">
          Prediction Ended • Resolved to ${op.status.toUpperCase()}
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="opinion-card-header">
        <span class="opinion-tag">${op.tag}</span>
        <span class="opinion-volume">Volume: ${op.volume}</span>
      </div>
      <h3 class="opinion-question">${op.question}</h3>
      <p class="opinion-subtext">${op.subtext}</p>
      ${probBarHtml}
      ${actionButtonsHtml}
    `;
    container.appendChild(card);
  });
}

// Render user portfolio card list
function renderCricPortfolio() {
  const container = document.getElementById('cric-portfolio-container');
  const investedEl = document.getElementById('cric-total-invested');
  const valueEl = document.getElementById('cric-total-value');
  const pnlEl = document.getElementById('cric-total-pnl');
  
  if (!container) return;
  
  let activeTrades = userCricTrades.filter(t => t.status === 'active' || t.status === 'pending');
  let completedTrades = userCricTrades.filter(t => t.status === 'won' || t.status === 'lost' || t.status === 'exited');
  
  let totalInvested = 0;
  let totalValue = 0;
  
  userCricTrades.forEach(t => {
    if (t.status === 'active' || t.status === 'pending') {
      totalInvested += t.investment;
      
      // Calculate current price valuation
      const op = cricOpinions.find(o => o.id === t.questionId);
      if (op) {
        const curPrice = t.selection === 'yes' ? op.yesPrice : op.noPrice;
        totalValue += curPrice * t.quantity;
      } else {
        totalValue += t.investment;
      }
    }
  });
  
  if (investedEl) investedEl.textContent = `₹${totalInvested.toFixed(2)}`;
  if (valueEl) valueEl.textContent = `₹${totalValue.toFixed(2)}`;
  
  const returnAmt = totalValue - totalInvested;
  if (pnlEl) {
    pnlEl.textContent = `${returnAmt >= 0 ? '+' : ''}₹${returnAmt.toFixed(2)}`;
    pnlEl.className = returnAmt > 0 ? 'pnl-win' : (returnAmt < 0 ? 'pnl-lose' : 'neutral-pnl');
  }
  
  if (userCricTrades.length === 0) {
    container.innerHTML = '<div class="cric-empty-portfolio-msg">No active trades. Pick an opinion to start trading!</div>';
    return;
  }
  
  container.innerHTML = '';
  
  // Render open trades first
  userCricTrades.slice().reverse().forEach(trade => {
    const op = cricOpinions.find(o => o.id === trade.questionId);
    let curPrice = trade.buyPrice;
    if (op) {
      curPrice = trade.selection === 'yes' ? op.yesPrice : op.noPrice;
    }
    
    let curVal = curPrice * trade.quantity;
    if (trade.status === 'won') curVal = trade.quantity * 10;
    if (trade.status === 'lost') curVal = 0;
    if (trade.status === 'exited') curVal = trade.settleValue;
    
    const pnl = curVal - trade.investment;
    const pnlClass = pnl > 0 ? 'pnl-win' : (pnl < 0 ? 'pnl-lose' : '');
    
    let statusText = trade.status.toUpperCase();
    if (trade.status === 'pending') statusText = 'PENDING (LIMIT)';
    
    let exitButtonHtml = '';
    if (trade.status === 'active') {
      exitButtonHtml = `
        <div class="portfolio-actions-row">
          <button class="portfolio-exit-btn" onclick="exitCricTradePosition('${trade.id}')">Exit early @ ₹${curPrice.toFixed(1)}</button>
        </div>
      `;
    }
    
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    card.innerHTML = `
      <div class="portfolio-card-header">
        <span class="p-match-name">IND vs PAK T20</span>
        <span class="p-selection-badge ${trade.selection}">${trade.selection}</span>
      </div>
      <div class="p-question-title">${trade.questionText}</div>
      <div class="portfolio-stats-grid">
        <div class="p-stat-box">
          <span>Buy Price</span>
          <strong>₹${trade.buyPrice.toFixed(1)} (x${trade.quantity})</strong>
        </div>
        <div class="p-stat-box">
          <span>Investment</span>
          <strong>₹${trade.investment.toFixed(2)}</strong>
        </div>
        <div class="p-stat-box">
          <span>Net P&L</span>
          <strong class="${pnlClass}">${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}</strong>
        </div>
      </div>
      <div style="font-size: 8px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
        <span>Status: ${statusText}</span>
        <span>Current Value: ₹${curVal.toFixed(2)}</span>
      </div>
      ${exitButtonHtml}
    `;
    container.appendChild(card);
  });
}

// Drawer Stepper callbacks
function openCricTradeDrawer(opinionId, selection) {
  const op = cricOpinions.find(o => o.id === opinionId);
  if (!op || op.status !== "unsettled") return;
  
  currentCricDrawerQuestionId = opinionId;
  currentCricDrawerSelection = selection;
  
  const mktPrice = selection === 'yes' ? op.yesPrice : op.noPrice;
  currentCricDrawerPrice = mktPrice;
  currentCricDrawerQty = 5;
  
  const drawerOverlay = document.getElementById('crictrade-drawer-overlay');
  const drawerPanel = document.getElementById('crictrade-bid-drawer');
  const qDescEl = document.getElementById('cric-drawer-question');
  const selTxtEl = document.getElementById('cric-drawer-selection-text');
  
  if (qDescEl) qDescEl.textContent = op.question;
  if (selTxtEl) {
    selTxtEl.textContent = selection.toUpperCase();
    selTxtEl.className = selection === 'yes' ? 'yes-text' : 'no-text';
  }
  
  if (drawerOverlay && drawerPanel) {
    drawerOverlay.classList.add('open');
    drawerPanel.classList.add('open');
  }
  
  updateCricDrawerInvoice();
  playTickSound();
}

function closeCricTradeDrawer() {
  const drawerOverlay = document.getElementById('crictrade-drawer-overlay');
  const drawerPanel = document.getElementById('crictrade-bid-drawer');
  if (drawerOverlay && drawerPanel) {
    drawerOverlay.classList.remove('open');
    drawerPanel.classList.remove('open');
  }
}

function adjustCricBidPrice(diff) {
  currentCricDrawerPrice = parseFloat((currentCricDrawerPrice + diff).toFixed(1));
  if (currentCricDrawerPrice > 9.5) currentCricDrawerPrice = 9.5;
  if (currentCricDrawerPrice < 0.5) currentCricDrawerPrice = 0.5;
  
  updateCricDrawerInvoice();
  playTickSound();
}

function adjustCricQty(diff) {
  currentCricDrawerQty = Math.max(1, currentCricDrawerQty + diff);
  updateCricDrawerInvoice();
  playTickSound();
}

// Render dynamic costs invoice
function updateCricDrawerInvoice() {
  const priceEl = document.getElementById('cric-drawer-price');
  const qtyEl = document.getElementById('cric-drawer-qty');
  const investEl = document.getElementById('cric-drawer-investment');
  const payoutEl = document.getElementById('cric-drawer-payout');
  const profitEl = document.getElementById('cric-drawer-profit');
  const confirmBtn = document.getElementById('cric-drawer-confirm-btn');
  
  if (priceEl) priceEl.textContent = currentCricDrawerPrice.toFixed(1);
  if (qtyEl) qtyEl.value = currentCricDrawerQty;
  
  const investVal = currentCricDrawerPrice * currentCricDrawerQty;
  const payoutVal = 10.0 * currentCricDrawerQty;
  const netProfitVal = payoutVal - investVal;
  const returnPercent = (netProfitVal / investVal) * 100;
  
  if (investEl) investEl.textContent = `₹${investVal.toFixed(2)}`;
  if (payoutEl) payoutEl.textContent = `₹${payoutVal.toFixed(2)}`;
  
  if (profitEl) {
    profitEl.textContent = `₹${netProfitVal.toFixed(2)} (+${returnPercent.toFixed(1)}%)`;
  }
  
  if (confirmBtn) {
    confirmBtn.textContent = `Confirm Trade (₹${investVal.toFixed(2)})`;
  }
}

// Place Order
function submitCricTradeOrder() {
  const op = cricOpinions.find(o => o.id === currentCricDrawerQuestionId);
  if (!op || op.status !== 'unsettled') return;
  
  const priceInputEl = document.getElementById('cric-drawer-qty');
  if (priceInputEl) {
    currentCricDrawerQty = parseInt(priceInputEl.value) || 1;
  }
  
  const investVal = currentCricDrawerPrice * currentCricDrawerQty;
  
  if (walletBalance < investVal) {
    showCricNotification("Insufficient Balance", "Please deposit money first to complete trades.", false);
    playLockSound();
    return;
  }
  
  // Deduct
  walletBalance -= investVal;
  updateBalanceUI();
  
  const mktPrice = currentCricDrawerSelection === 'yes' ? op.yesPrice : op.noPrice;
  // If price matches market price, it settles instantly, otherwise it's pending limit order
  const matched = currentCricDrawerPrice >= mktPrice;
  
  const trade = {
    id: 'ct_' + Date.now(),
    questionId: currentCricDrawerQuestionId,
    questionText: op.question,
    selection: currentCricDrawerSelection,
    buyPrice: currentCricDrawerPrice,
    quantity: currentCricDrawerQty,
    investment: investVal,
    status: matched ? 'active' : 'pending',
    settleValue: 0
  };
  
  userCricTrades.push(trade);
  
  playLockSound();
  closeCricTradeDrawer();
  
  renderCricPortfolio();
  updateCricActiveTradesBadge();
  
  showCricNotification("Order Placed!", `${matched ? 'Instant position matched' : 'Limit order placed'} for ₹${investVal.toFixed(2)}`, true);
}

// Exit early
function exitCricTradePosition(tradeId) {
  const trade = userCricTrades.find(t => t.id === tradeId);
  if (!trade || trade.status !== 'active') return;
  
  const op = cricOpinions.find(o => o.id === trade.questionId);
  if (!op || op.status !== 'unsettled') return;
  
  const curPrice = trade.selection === 'yes' ? op.yesPrice : op.noPrice;
  const exitVal = curPrice * trade.quantity;
  
  // Refund
  walletBalance += exitVal;
  updateBalanceUI();
  
  trade.status = 'exited';
  trade.settleValue = exitVal;
  
  playLockSound();
  renderCricPortfolio();
  updateCricActiveTradesBadge();
  
  showCricNotification("Position Exited", `Cashed out at ₹${curPrice.toFixed(1)}. Received: ₹${exitVal.toFixed(2)}`, true);
}

// Navigation subtabs
function switchCricTradeTab(tabName) {
  cricActiveTab = tabName;
  
  const opTab = document.getElementById('cric-tab-opinions');
  const trTab = document.getElementById('cric-tab-trades');
  const opView = document.getElementById('cric-view-opinions');
  const trView = document.getElementById('cric-view-trades');
  
  if (tabName === 'opinions') {
    if (opTab) opTab.classList.add('active');
    if (trTab) trTab.classList.remove('active');
    if (opView) opView.style.display = 'block';
    if (trView) trView.style.display = 'none';
  } else {
    if (opTab) opTab.classList.remove('active');
    if (trTab) trTab.classList.add('active');
    if (opView) opView.style.display = 'none';
    if (trView) trView.style.display = 'block';
    renderCricPortfolio(); // Force refresh calculations
  }
  playTickSound();
}

function updateCricActiveTradesBadge() {
  const badge = document.getElementById('cric-active-trades-count');
  if (badge) {
    const activeCount = userCricTrades.filter(t => t.status === 'active' || t.status === 'pending').length;
    badge.textContent = activeCount;
  }
}

// Notification overlays inside CricTrade
function showCricNotification(title, msg, success = true) {
  const alertEl = document.getElementById('rewards-success-alert');
  const titleEl = document.getElementById('reward-alert-title');
  const descEl = document.getElementById('reward-alert-desc');
  
  if (alertEl && titleEl && descEl) {
    titleEl.textContent = title;
    descEl.textContent = msg;
    alertEl.style.display = 'flex';
    
    // Auto-fade after 4 seconds
    setTimeout(() => {
      alertEl.style.style = 'none';
      $(alertEl).fadeOut(500); // safety fallback or normal hide
      alertEl.style.display = 'none';
    }, 4000);
  }
}

function openCricTradeRules() {
  alert("CricTrade Opinion Trading Rules:\n\n1. YES/NO contracts are priced from ₹0.5 to ₹9.5.\n2. Standard value resolves at ₹10.0 if you win and ₹0.0 if you lose.\n3. Sum of YES + NO prices is always ₹10.0.\n4. You can sell your active contracts early to lock in your live profit or loss!\n5. Limit orders will match only when the market price meets your bid.");
}


// ==========================================================================
// PREMIUM LOGIN & REGISTRATION HANDLERS
// ==========================================================================

let isLoginRegisterMode = false; // false = Login, true = Register

function togglePasswordVisibility() {
  const pwdInput = document.getElementById('login-password');
  if (pwdInput) {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
    } else {
      pwdInput.type = 'password';
    }
  }
  playTickSound();
}

function toggleRegisterMode(event) {
  if (event) event.preventDefault();
  isLoginRegisterMode = !isLoginRegisterMode;
  
  const cardTitle = document.getElementById('login-title');
  const cardSubtitle = document.getElementById('login-card-subtitle');
  const submitBtn = document.getElementById('login-submit-btn');
  const promoText = document.getElementById('login-promo-text');
  const promoLink = document.getElementById('login-promo-link');
  const optionsRow = document.getElementById('login-options-row');
  
  if (isLoginRegisterMode) {
    if (cardTitle) cardTitle.textContent = 'REGISTER TO PLAY';
    if (cardSubtitle) cardSubtitle.textContent = 'Register a new player account securely';
    if (submitBtn) submitBtn.textContent = 'Create Account & Login';
    if (promoText) promoText.textContent = 'Already have an account?';
    if (promoLink) promoLink.textContent = 'Sign In';
    if (optionsRow) optionsRow.style.display = 'none'; // Hide remember/forgot for register
  } else {
    if (cardTitle) cardTitle.textContent = 'LOGIN TO PLAY';
    if (cardSubtitle) cardSubtitle.textContent = 'Premium Betting & Gaming Platform';
    if (submitBtn) submitBtn.textContent = 'Login Securely';
    if (promoText) promoText.textContent = 'New to Pandya Bet?';
    if (promoLink) promoLink.textContent = 'Create Account';
    if (optionsRow) optionsRow.style.display = 'flex';
  }
  playTickSound();
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  
  const submitBtn = document.getElementById('login-submit-btn');
  
  if (submitBtn) {
    submitBtn.textContent = isLoginRegisterMode ? 'Creating Account...' : 'Verifying Credentials...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.75';
  }
  
  playLockSound();
  
  // Simulate network authentication latency (1.2s)
  setTimeout(() => {
    localStorage.setItem('pandya_logged_in', 'true');
    
    // Close screen
    const loginPage = document.getElementById('screen-login');
    if (loginPage) {
      loginPage.classList.add('hidden');
    }
    
    // Play success cues
    playWinSound();
    
    // Show success alerts
    const welcomeMsg = isLoginRegisterMode ? 'Welcome to Pandya Bet! Account created successfully.' : 'Welcome back to Pandya Bet!';
    if (typeof showRewardAlertPopup === 'function') {
      showRewardAlertPopup("Login Successful", welcomeMsg);
    } else {
      alert(welcomeMsg);
    }
    
    // Auto launch BGM continuous soundtrack (first user interaction achieved)
    if (!bgmIsPlaying && typeof toggleMusicPlayback === 'function') {
      toggleMusicPlayback();
    }
    
  }, 1200);
}

function forgotPasswordAlert(event) {
  if (event) event.preventDefault();
  alert("Password Recovery Helper:\n\nDefault guest password is '123456'. Enter any mobile number and password to log in instantly!");
}


