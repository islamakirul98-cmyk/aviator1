/**
 * Aviator Rocket - Game Physics and Canvas Rendering Engine
 * Controls state machine, crash mathematics, canvas graphics, and animations.
 */

const GameEngine = {
    // Game States: 'WAITING' | 'FLYING' | 'CRASHED'
    state: 'WAITING',
    
    // Game parameters
    currentMultiplier: 1.00,
    crashMultiplier: 1.00,
    countdownDuration: 5000, // 5 seconds
    countdownRemaining: 5000,
    crashedDuration: 3000,    // 3 seconds
    stateStartTime: 0,
    flightStartTime: 0,
    
    // Canvas & Context
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Animation/Camera view limits (dynamic scaling for infinite flight effect)
    viewLimitX: 8.0, // seconds on X axis
    viewLimitY: 2.0, // multiplier range on Y axis (2.0x max height initially)
    
    // Coordinates
    originX: 60,
    originY: 60, // offset from bottom
    rocketPos: { x: 0, y: 0 },
    rocketAngle: 0,
    
    // Particle arrays
    smokeParticles: [],
    stars: [],
    explosionParticles: [],
    
    // Camera shake strength
    shakeIntensity: 0,
    
    // UI Hooks/Callbacks
    callbacks: {
        onStateChange: null,
        onTick: null,
        onMultiplierUpdate: null,
        onCrash: null
    },

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Handle Resize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Initialize Stars
        this.initStars();
        
        // Start State
        this.setGameState('WAITING');
        
        // Start loop
        requestAnimationFrame((t) => this.loop(t));
    },
    
    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width * window.devicePixelRatio;
        this.height = rect.height * window.devicePixelRatio;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    },
    
    setGameState(newState) {
        this.state = newState;
        this.stateStartTime = performance.now();
        
        if (newState === 'WAITING') {
            this.countdownRemaining = this.countdownDuration;
            this.currentMultiplier = 1.00;
            this.viewLimitX = 8.0;
            this.viewLimitY = 2.0;
            this.smokeParticles = [];
            this.explosionParticles = [];
            this.shakeIntensity = 0;
        } else if (newState === 'FLYING') {
            this.flightStartTime = performance.now();
            this.currentMultiplier = 1.00;
            this.crashMultiplier = this.generateCrashPoint();
            console.log(`[GameEngine] Round started. Crash target: ${this.crashMultiplier}x`);
            
            if (window.GameAudio) {
                window.GameAudio.playTakeoff();
                window.GameAudio.startEngine();
            }
        } else if (newState === 'CRASHED') {
            this.shakeIntensity = 15; // Trigger camera shake
            this.initExplosion();
            
            if (window.GameAudio) {
                window.GameAudio.stopEngine();
                window.GameAudio.playCrash();
            }
            
            if (this.callbacks.onCrash) {
                this.callbacks.onCrash(this.currentMultiplier);
            }
        }
        
        if (this.callbacks.onStateChange) {
            this.callbacks.onStateChange(newState);
        }
    },
    
    // ----------------------------------------------------
    // Crash Distribution Math Formula
    // ----------------------------------------------------
    generateCrashPoint() {
        const r = Math.random();
        
        // 3% chance of instant crash at 1.00x
        if (r < 0.03) return 1.00;
        
        // 7% chance of very early crash (1.01 - 1.08)
        if (r < 0.10) return Math.floor((1.01 + Math.random() * 0.07) * 100) / 100;
        
        // Rest is distributed along standard heavy-tailed power law:
        // houseEdge = 3%, multiplier = 1.01 + 0.97 / (1.0 - Math.random())
        const randomVal = Math.random();
        const rawMultiplier = 1.01 + 0.96 / (1.0 - randomVal);
        
        // Format to 2 decimal places and cap at a sensible max (e.g. 10000x)
        return Math.min(10000, Math.floor(rawMultiplier * 100) / 100);
    },
    
    // ----------------------------------------------------
    // Multiplier Curve Growth over time (elapsed time in seconds)
    // ----------------------------------------------------
    getMultiplierForTime(elapsedSeconds) {
        if (elapsedSeconds <= 0) return 1.00;
        
        // Exponential-like acceleration curve: M = e^(0.062 * t) + t * 0.04
        const multiplier = Math.pow(Math.E, 0.062 * elapsedSeconds) + (elapsedSeconds * 0.03) - 0.03;
        return Math.max(1.00, Math.floor(multiplier * 100) / 100);
    },
    
    // Helper to get time elapsed in active flight (in seconds)
    getFlightSeconds() {
        if (this.state !== 'FLYING') return 0;
        return (performance.now() - this.flightStartTime) / 1000;
    },
    
    // Register event listeners
    registerCallback(event, fn) {
        this.callbacks[event] = fn;
    },
    
    // ----------------------------------------------------
    // Particle Engine & Setup
    // ----------------------------------------------------
    initStars() {
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * 800,
                y: Math.random() * 500,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                speedMultiplier: Math.random() * 0.6 + 0.4
            });
        }
    },
    
    updateParticles() {
        // Smoke Trail
        if (this.state === 'FLYING') {
            // Emit particles at exhaust position
            // Rocket position is in relative canvas coords
            if (Math.random() < 0.6) {
                // exhaust offset back from angle
                const exhaustX = this.rocketPos.x - Math.cos(this.rocketAngle) * 16;
                const exhaustY = this.rocketPos.y + Math.sin(this.rocketAngle) * 16; // canvas Y is inverted
                
                this.smokeParticles.push({
                    x: exhaustX,
                    y: exhaustY,
                    vx: -Math.cos(this.rocketAngle) * (Math.random() * 1.5 + 0.5) - (Math.random() * 0.5),
                    vy: Math.sin(this.rocketAngle) * (Math.random() * 1.5 + 0.5) + (Math.random() * 0.5 - 0.25),
                    size: Math.random() * 4 + 4,
                    color: Math.random() > 0.4 ? 'rgba(255, 59, 92, 0.6)' : 'rgba(255, 184, 0, 0.6)',
                    alpha: 1.0,
                    life: 1.0,
                    decay: Math.random() * 0.03 + 0.02
                });
            }
        }
        
        // Update Smoke
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.size += 0.15;
            p.alpha -= p.decay;
            p.life -= p.decay;
            if (p.alpha <= 0) {
                this.smokeParticles.splice(i, 1);
            }
        }
        
        // Update Explosion
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const p = this.explosionParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0;
            p.alpha -= p.decay;
            p.size *= 0.97;
            if (p.alpha <= 0) {
                this.explosionParticles.splice(i, 1);
            }
        }
        
        // Update Stars parallax drift
        const speed = this.state === 'FLYING' ? Math.min(10, 1 + (this.currentMultiplier - 1) * 0.8) : 0.4;
        this.stars.forEach(star => {
            star.x -= speed * star.speedMultiplier;
            star.y += speed * star.speedMultiplier * 0.5; // diagonal drift
            
            // wrap around boundaries
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * this.height;
            }
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    },
    
    initExplosion() {
        this.explosionParticles = [];
        
        // Concentric expand fireballs
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 6 + 2;
            this.explosionParticles.push({
                x: this.rocketPos.x,
                y: this.rocketPos.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 8 + 8,
                color: Math.random() > 0.3 ? 'rgba(255, 59, 92, 0.85)' : 'rgba(255, 184, 0, 0.95)',
                alpha: 1.0,
                decay: Math.random() * 0.02 + 0.015
            });
        }
        
        // Tiny sparks / sparks flying fast
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 10 + 4;
            this.explosionParticles.push({
                x: this.rocketPos.x,
                y: this.rocketPos.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                gravity: 0.15, // sparks fall down
                size: Math.random() * 2 + 1,
                color: '#ffffff',
                alpha: 1.0,
                decay: Math.random() * 0.04 + 0.03
            });
        }
    },
    
    // ----------------------------------------------------
    // Main Loop
    // ----------------------------------------------------
    loop(timestamp) {
        this.updateState();
        this.updateParticles();
        this.draw();
        
        requestAnimationFrame((t) => this.loop(t));
    },
    
    updateState() {
        const now = performance.now();
        const elapsed = now - this.stateStartTime;
        
        if (this.state === 'WAITING') {
            this.countdownRemaining = Math.max(0, this.countdownDuration - elapsed);
            if (this.callbacks.onTick) {
                this.callbacks.onTick(this.countdownRemaining);
            }
            if (this.countdownRemaining <= 0) {
                this.setGameState('FLYING');
            }
        } else if (this.state === 'FLYING') {
            const flightSecs = this.getFlightSeconds();
            const calcMultiplier = this.getMultiplierForTime(flightSecs);
            
            // Check if crashed
            if (calcMultiplier >= this.crashMultiplier) {
                this.currentMultiplier = this.crashMultiplier;
                this.setGameState('CRASHED');
            } else {
                this.currentMultiplier = calcMultiplier;
                if (this.callbacks.onMultiplierUpdate) {
                    this.callbacks.onMultiplierUpdate(this.currentMultiplier);
                }
                
                // Update engine pitch
                if (window.GameAudio) {
                    window.GameAudio.updateEnginePitch(this.currentMultiplier);
                }
            }
        } else if (this.state === 'CRASHED') {
            if (elapsed >= this.crashedDuration) {
                this.setGameState('WAITING');
            }
            
            // decay camera shake
            if (this.shakeIntensity > 0) {
                this.shakeIntensity *= 0.9;
                if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;
            }
        }
    },
    
    // ----------------------------------------------------
    // Draw Functions
    // ----------------------------------------------------
    draw() {
        const ctx = this.ctx;
        if (!ctx) return;
        
        ctx.save();
        
        // Apply Camera Shake
        if (this.shakeIntensity > 0) {
            const dx = (Math.random() * 2 - 1) * this.shakeIntensity;
            const dy = (Math.random() * 2 - 1) * this.shakeIntensity;
            ctx.translate(dx, dy);
        }
        
        // Clear Canvas
        ctx.fillStyle = '#0a0714';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars background
        this.drawStars();
        
        // Draw grid coordinates
        this.drawGrid();
        
        // Draw smoke trail
        this.drawSmoke();
        
        // Draw rocket flight path curve
        if (this.state === 'FLYING' || this.state === 'CRASHED') {
            this.drawFlightCurve();
        }
        
        // Draw rocket or explosion
        if (this.state === 'FLYING') {
            this.drawRocket();
        } else if (this.state === 'CRASHED') {
            this.drawExplosion();
        }
        
        ctx.restore();
    },
    
    drawStars() {
        const ctx = this.ctx;
        ctx.save();
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    },
    
    // Map abstract (seconds, multiplier) coordinates to canvas pixel space
    getCanvasCoords(secs, mult) {
        // Space margins
        const graphWidth = this.width - this.originX - 50;
        const graphHeight = this.height - this.originY - 50;
        
        // X maps linearly from 0 -> viewLimitX
        const x = this.originX + (secs / this.viewLimitX) * graphWidth;
        
        // Y maps linearly from multiplier 1.00 -> viewLimitY
        // Canvas coordinate systems starts at top, so we subtract from height
        const valY = mult - 1.00;
        const rangeY = this.viewLimitY - 1.00;
        const y = (this.height - this.originY) - (valY / rangeY) * graphHeight;
        
        return { x, y };
    },
    
    drawGrid() {
        const ctx = this.ctx;
        ctx.save();
        
        const graphWidth = this.width - this.originX - 50;
        const graphHeight = this.height - this.originY - 50;
        
        // Draw Axis Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        
        // Bottom boundary line
        ctx.beginPath();
        ctx.moveTo(this.originX, this.height - this.originY);
        ctx.lineTo(this.width, this.height - this.originY);
        ctx.stroke();
        
        // Left boundary line
        ctx.beginPath();
        ctx.moveTo(this.originX, 0);
        ctx.lineTo(this.originX, this.height - this.originY);
        ctx.stroke();
        
        // Dynamic horizontal grids (Multipliers)
        const multIntervals = this.getGridIntervals(1.00, this.viewLimitY, 4);
        multIntervals.forEach(val => {
            if (val === 1.00) return; // axis line covers this
            
            const coords = this.getCanvasCoords(0, val);
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(this.originX, coords.y);
            ctx.lineTo(this.width, coords.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.stroke();
            
            // Draw grid label text
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(`${val.toFixed(2)}x`, this.originX - 10, coords.y + 3);
        });
        
        // Dynamic vertical grids (Seconds)
        const timeIntervals = this.getGridIntervals(0, this.viewLimitX, 5);
        timeIntervals.forEach(val => {
            if (val === 0) return;
            
            const coords = this.getCanvasCoords(val, 1.00);
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(coords.x, 0);
            ctx.lineTo(coords.x, this.height - this.originY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.stroke();
            
            // Draw time text label
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${val.toFixed(0)}s`, coords.x, this.height - this.originY + 18);
        });
        
        ctx.restore();
    },
    
    getGridIntervals(min, max, maxDivisions) {
        const range = max - min;
        const rawStep = range / maxDivisions;
        
        // find nearest power of 10 or nice interval (0.1, 0.5, 1, 2, 5, 10, etc.)
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const ratio = rawStep / magnitude;
        
        let step = magnitude;
        if (ratio > 5) step = 5 * magnitude;
        else if (ratio > 2) step = 2 * magnitude;
        
        const start = Math.ceil(min / step) * step;
        const intervals = [];
        for (let v = start; v <= max; v += step) {
            intervals.push(v);
        }
        return intervals;
    },
    
    drawSmoke() {
        const ctx = this.ctx;
        ctx.save();
        this.smokeParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    },
    
    drawFlightCurve() {
        const ctx = this.ctx;
        ctx.save();
        
        const flightSecs = this.getFlightSeconds();
        const steps = 60;
        
        // Generate coordinates for path curve
        ctx.beginPath();
        const startCoords = this.getCanvasCoords(0, 1.00);
        ctx.moveTo(startCoords.x, startCoords.y);
        
        for (let i = 1; i <= steps; i++) {
            const fraction = i / steps;
            const t = flightSecs * fraction;
            const m = this.getMultiplierForTime(t);
            const coords = this.getCanvasCoords(t, m);
            ctx.lineTo(coords.x, coords.y);
        }
        
        // Apply styling (gradient with red neon glow)
        const gradient = ctx.createLinearGradient(this.originX, this.height, this.width, 0);
        gradient.addColorStop(0, '#ff3b5c');
        gradient.addColorStop(0.5, '#ff7800');
        gradient.addColorStop(1, '#ffb800');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(255, 59, 92, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Draw gradient area underneath the curve
        ctx.lineTo(this.rocketPos.x, this.height - this.originY);
        ctx.lineTo(this.originX, this.height - this.originY);
        ctx.closePath();
        
        const fillGradient = ctx.createLinearGradient(0, 0, 0, this.height - this.originY);
        fillGradient.addColorStop(0, 'rgba(255, 59, 92, 0.12)');
        fillGradient.addColorStop(1, 'rgba(255, 59, 92, 0)');
        ctx.fillStyle = fillGradient;
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 0; // disable shadow for fill
        ctx.fill();
        
        ctx.restore();
    },
    
    drawRocket() {
        const ctx = this.ctx;
        const flightSecs = this.getFlightSeconds();
        
        // Update rocket position and adjust viewport coordinates
        const coords = this.getCanvasCoords(flightSecs, this.currentMultiplier);
        this.rocketPos = coords;
        
        // Scroll Camera / Scale Limits as rocket flies higher or further
        const scaleBufferX = this.viewLimitX * 0.75;
        const scaleBufferY = this.viewLimitY * 0.70;
        
        if (flightSecs > scaleBufferX) {
            this.viewLimitX = flightSecs / 0.75;
        }
        if (this.currentMultiplier > scaleBufferY) {
            this.viewLimitY = (this.currentMultiplier - 1.00) / 0.70 + 1.00;
        }
        
        // Calculate rocket incline angle based on curve slope
        const tPrev = Math.max(0, flightSecs - 0.1);
        const mPrev = this.getMultiplierForTime(tPrev);
        const coordsPrev = this.getCanvasCoords(tPrev, mPrev);
        
        const dx = coords.x - coordsPrev.x;
        const dy = coordsPrev.y - coords.y; // canvas coordinates invert Y
        this.rocketAngle = -Math.atan2(dy, dx); // rotation angle
        
        // Draw Glowing Jet exhaust flame
        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.rotate(this.rocketAngle);
        
        // Draw exhaust fire cone
        const flameSize = 12 + Math.random() * 5;
        const flameGrad = ctx.createLinearGradient(-15, 0, -15 - flameSize, 0);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#ffea00');
        flameGrad.addColorStop(0.6, '#ff6600');
        flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-10 - flameSize, 0);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Draw Rocket body (Vector)
        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.rotate(this.rocketAngle);
        
        // Apply neon shadow for rocket
        ctx.shadowColor = 'var(--neon-rose)';
        ctx.shadowBlur = 10;
        
        // Fins / Back wings (Neon Red)
        ctx.fillStyle = '#cc1f41';
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-16, -12);
        ctx.lineTo(-12, -3);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-10, 5);
        ctx.lineTo(-16, 12);
        ctx.lineTo(-12, 3);
        ctx.closePath();
        ctx.fill();
        
        // Fuselage Body (Silver / White)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-10, -6);
        ctx.lineTo(8, -6);
        ctx.quadraticCurveTo(18, 0, 20, 0); // nose cone tip
        ctx.quadraticCurveTo(18, 0, 8, 6);
        ctx.lineTo(-10, 6);
        ctx.closePath();
        ctx.fill();
        
        // Nose Cone tip highlighted color (Neon Red)
        ctx.fillStyle = '#ff3b5c';
        ctx.beginPath();
        ctx.moveTo(8, -6);
        ctx.quadraticCurveTo(18, 0, 20, 0);
        ctx.quadraticCurveTo(18, 0, 8, 6);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit glass window (Cyan)
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(4, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    drawExplosion() {
        const ctx = this.ctx;
        ctx.save();
        this.explosionParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
};

window.GameEngine = GameEngine;
