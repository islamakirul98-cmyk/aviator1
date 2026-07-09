/**
 * Aviator Rocket - Web Audio Synthesis Module
 * Dynamically synthesizes engine hums, wins, and crashes without external file dependencies.
 */

const GameAudio = {
    ctx: null,
    masterGain: null,
    isMuted: false,
    
    // Engine Synthesizer Nodes
    engineOsc1: null,
    engineOsc2: null,
    engineFilter: null,
    engineGain: null,
    
    init() {
        if (this.ctx) return;
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            
            // Try to load mute state from local storage
            const savedMute = localStorage.getItem('aviator_muted');
            if (savedMute !== null) {
                this.isMuted = savedMute === 'true';
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
            }
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    },
    
    ensureCtx() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    toggleMute() {
        this.ensureCtx();
        this.isMuted = !this.isMuted;
        localStorage.setItem('aviator_muted', this.isMuted);
        
        if (this.masterGain && this.ctx) {
            const targetVolume = this.isMuted ? 0 : 0.5;
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.1);
        }
        return this.isMuted;
    },
    
    // ----------------------------------------------------
    // Sound FX: Countdown Beeps
    // ----------------------------------------------------
    playTick() {
        this.ensureCtx();
        if (this.isMuted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, this.ctx.currentTime); // 700 Hz pitch
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    
    playTakeoff() {
        this.ensureCtx();
        if (this.isMuted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    },
    
    // ----------------------------------------------------
    // Sound FX: Win / Cash Out Chime
    // Plays a quick, positive pentatonic arpeggio
    // ----------------------------------------------------
    playWin() {
        this.ensureCtx();
        if (this.isMuted || !this.ctx) return;
        
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
        const now = this.ctx.currentTime;
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.15, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.3);
        });
    },
    
    // ----------------------------------------------------
    // Sound FX: Crash Explosion
    // Combines white noise with a low frequency pitch drop
    // ----------------------------------------------------
    playCrash() {
        this.ensureCtx();
        if (this.isMuted || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // 1. Generate Noise Buffer (for the explosion's gravelly hiss)
        const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(10, now + 1.2);
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        
        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        // 2. Add Low Sine Bass drop (the heavy thud)
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(150, now);
        bassOsc.frequency.linearRampToValueAtTime(10, now + 0.8);
        
        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        
        // Start nodes
        noiseNode.start(now);
        bassOsc.start(now);
        
        noiseNode.stop(now + 1.5);
        bassOsc.stop(now + 0.8);
    },
    
    // ----------------------------------------------------
    // Engine Hum Loop (Starts at takeoff, updates frequency)
    // ----------------------------------------------------
    startEngine() {
        this.ensureCtx();
        if (this.isMuted || !this.ctx) return;
        
        // Ensure old engine is completely stopped
        this.stopEngine();
        
        const now = this.ctx.currentTime;
        
        // Sub-Oscillator (Low rumble)
        this.engineOsc1 = this.ctx.createOscillator();
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc1.frequency.setValueAtTime(55, now); // A1 note
        
        // High-Oscillator (Engine whine)
        this.engineOsc2 = this.ctx.createOscillator();
        this.engineOsc2.type = 'triangle';
        this.engineOsc2.frequency.setValueAtTime(110, now); // A2 note
        
        // Filter out harsh highs
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(250, now);
        
        // Gain Node
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0, now);
        this.engineGain.gain.linearRampToValueAtTime(0.12, now + 0.2); // Smooth fade-in
        
        // Connect nodes
        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
        
        // Start engine
        this.engineOsc1.start(now);
        this.engineOsc2.start(now);
    },
    
    updateEnginePitch(multiplier) {
        if (!this.ctx || this.isMuted || !this.engineOsc1 || !this.engineOsc2) return;
        
        const now = this.ctx.currentTime;
        
        // Pitch scaling: Engine pitch goes up as the multiplier grows
        // We use clamp to avoid ultrasonic frequencies at huge multipliers
        const baseFreq1 = 55;
        const baseFreq2 = 110;
        const scaleFactor = Math.min(multiplier, 20); // cap pitch scaling at 20x
        
        const targetFreq1 = baseFreq1 + (scaleFactor - 1) * 15; // e.g. 1.00x = 55Hz, 10x = 190Hz
        const targetFreq2 = baseFreq2 + (scaleFactor - 1) * 30; // e.g. 1.00x = 110Hz, 10x = 380Hz
        const filterCutoff = Math.min(250 + (scaleFactor - 1) * 40, 1000); // Filter opens up as rocket climbs
        
        // Smoothly glide frequencies to avoid clicks
        this.engineOsc1.frequency.setTargetAtTime(targetFreq1, now, 0.1);
        this.engineOsc2.frequency.setTargetAtTime(targetFreq2, now, 0.1);
        this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.1);
    },
    
    stopEngine() {
        if (!this.ctx || !this.engineOsc1) return;
        
        const now = this.ctx.currentTime;
        try {
            // Fade out the gain smoothly
            const activeGain = this.engineGain;
            const osc1 = this.engineOsc1;
            const osc2 = this.engineOsc2;
            
            if (activeGain) {
                activeGain.gain.setValueAtTime(activeGain.gain.value, now);
                activeGain.gain.linearRampToValueAtTime(0, now + 0.1);
            }
            
            setTimeout(() => {
                try {
                    osc1.stop();
                    osc2.stop();
                } catch(e) {}
            }, 120);
        } catch (e) {
            console.warn("Could not stop audio nodes cleanly", e);
        }
        
        this.engineOsc1 = null;
        this.engineOsc2 = null;
        this.engineFilter = null;
        this.engineGain = null;
    }
};
window.GameAudio = GameAudio;
