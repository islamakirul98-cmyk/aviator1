/**
 * Aviator Rocket - UI Controller and Game State Coordinator
 * Syncs DOM elements, virtual balances, dual betting logic, simulated bots, and chat logs.
 */

const UIController = {
    // Player settings
    balance: 1000.00,
    username: 'Pilot_Demo',
    avatarSeed: 'RocketPilot1',
    isMuted: false,
    
    // Stats tracking
    roundsPlayed: 0,
    netProfit: 0.00,
    
    // Dual betting panel states
    panels: {
        card1: {
            id: 'card1',
            betPlaced: false,     // Queued bet for next round
            activeBet: 0,         // Bet current flying
            cashedOut: false,     // Has cashed out this round
            winAmount: 0,
            autoBet: false,
            autoCash: false,
            autoCashMult: 2.00,
            betInput: null,
            actionBtn: null,
            btnAmountText: null,
            autoBetToggle: null,
            autoCashToggle: null,
            autoCashValue: null
        },
        card2: {
            id: 'card2',
            betPlaced: false,
            activeBet: 0,
            cashedOut: false,
            winAmount: 0,
            autoBet: false,
            autoCash: false,
            autoCashMult: 2.00,
            betInput: null,
            actionBtn: null,
            btnAmountText: null,
            autoBetToggle: null,
            autoCashToggle: null,
            autoCashValue: null
        }
    },
    
    // Simulated multiplayer list
    simulatedPlayers: [],
    botNames: [
        "AstroAman", "CryptoKing", "AviatorPro", "SpeedySam", "MoonSniper", 
        "LuckyFlyer", "NeonRider", "BitcoinBull", "RiskTaker", "StarGazer", 
        "SkyHigh", "RocketRohan", "WinMax", "BullFlyer", "SolanaChad", 
        "CrashMaster", "SkyCaptain", "HypeBeast", "GalaxyExplorer", "AlphaPilot"
    ],
    
    // Toast timers
    toastTimeout: null,
    
    // Init entry point
    init() {
        // Load data from LocalStorage
        this.loadProfile();
        
        // Cache DOM elements
        this.cacheDOM();
        
        // Bind UI Events
        this.bindEvents();
        
        // Initialize Game Engine Hooks
        this.initGameEngineHooks();
        
        // Start Simulated Chat loop
        this.startChatSimulation();
        
        // Render initial UI values
        this.updateBalanceUI();
        this.updateProfileIcon();
        
        // Feed initial history list
        this.generateInitialHistory();
        
        // Sound sync
        const savedMute = localStorage.getItem('aviator_muted');
        if (savedMute !== null) {
            this.isMuted = savedMute === 'true';
            this.updateSoundIcon();
        }
    },
    
    cacheDOM() {
        // Headers & Controls
        this.btnRefill = document.getElementById('btn-refill');
        this.balanceText = document.getElementById('balance-amount');
        this.btnSoundToggle = document.getElementById('btn-sound-toggle');
        this.btnProfile = document.getElementById('btn-profile');
        this.btnRules = document.getElementById('btn-rules');
        
        // Modals
        this.modalRules = document.getElementById('modal-rules');
        this.modalProfile = document.getElementById('modal-profile');
        this.btnCloseRules = document.getElementById('btn-close-rules');
        this.btnRulesOk = document.getElementById('btn-rules-ok');
        this.btnCloseProfile = document.getElementById('btn-close-profile');
        this.btnProfileCancel = document.getElementById('btn-profile-cancel');
        this.btnProfileSave = document.getElementById('btn-profile-save');
        this.profileUsernameInput = document.getElementById('profile-username');
        
        // Overlays
        this.overlayWaiting = document.getElementById('overlay-waiting');
        this.overlayActive = document.getElementById('overlay-active');
        this.overlayCrashed = document.getElementById('overlay-crashed');
        this.countdownTimerText = document.getElementById('countdown-timer');
        this.countdownBarFill = document.getElementById('countdown-bar-fill');
        this.currentMultiplierText = document.getElementById('current-multiplier');
        this.crashMultiplierText = document.getElementById('crash-multiplier');
        
        // History & Lists
        this.historyContainer = document.getElementById('history-container');
        this.liveBetsCountText = document.getElementById('live-bets-count');
        this.liveBetsSumText = document.getElementById('live-bets-sum');
        this.liveBetsList = document.getElementById('live-bets-list');
        this.myRoundsCountText = document.getElementById('my-rounds-count');
        this.myProfitValText = document.getElementById('my-profit-val');
        this.myBetsList = document.getElementById('my-bets-list');
        
        // Chat
        this.chatMessages = document.getElementById('chat-messages-container');
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        
        // Toast
        this.toast = document.getElementById('toast-notification');
        this.toastText = document.getElementById('toast-message-text');
        
        // Panel A elements mapping
        this.panels.card1.betInput = document.getElementById('card1-bet-amount');
        this.panels.card1.actionBtn = document.getElementById('card1-action-btn');
        this.panels.card1.btnAmountText = document.getElementById('card1-btn-amount');
        this.panels.card1.autoBetToggle = document.getElementById('card1-auto-bet-toggle');
        this.panels.card1.autoCashToggle = document.getElementById('card1-auto-cash-toggle');
        this.panels.card1.autoCashValue = document.getElementById('card1-auto-cash-value');
        
        // Panel B elements mapping
        this.panels.card2.betInput = document.getElementById('card2-bet-amount');
        this.panels.card2.actionBtn = document.getElementById('card2-action-btn');
        this.panels.card2.btnAmountText = document.getElementById('card2-btn-amount');
        this.panels.card2.autoBetToggle = document.getElementById('card2-auto-bet-toggle');
        this.panels.card2.autoCashToggle = document.getElementById('card2-auto-cash-toggle');
        this.panels.card2.autoCashValue = document.getElementById('card2-auto-cash-value');
    },
    
    // ----------------------------------------------------
    // User Profile & Balance Persistence
    // ----------------------------------------------------
    loadProfile() {
        const storedBalance = localStorage.getItem('aviator_balance');
        if (storedBalance !== null) {
            this.balance = parseFloat(storedBalance);
        }
        
        const storedName = localStorage.getItem('aviator_username');
        if (storedName !== null) {
            this.username = storedName;
        }
        
        const storedSeed = localStorage.getItem('aviator_avatar_seed');
        if (storedSeed !== null) {
            this.avatarSeed = storedSeed;
        }
        
        const storedRounds = localStorage.getItem('aviator_rounds_played');
        if (storedRounds !== null) {
            this.roundsPlayed = parseInt(storedRounds);
        }
        
        const storedProfit = localStorage.getItem('aviator_net_profit');
        if (storedProfit !== null) {
            this.netProfit = parseFloat(storedProfit);
        }
    },
    
    saveProfile() {
        localStorage.setItem('aviator_balance', this.balance.toFixed(2));
        localStorage.setItem('aviator_username', this.username);
        localStorage.setItem('aviator_avatar_seed', this.avatarSeed);
        localStorage.setItem('aviator_rounds_played', this.roundsPlayed.toString());
        localStorage.setItem('aviator_net_profit', this.netProfit.toFixed(2));
    },
    
    updateBalanceUI() {
        this.balanceText.textContent = `$${this.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Sync betting panel buttons amounts
        ['card1', 'card2'].forEach(key => {
            const panel = this.panels[key];
            if (!panel.betPlaced) {
                const betVal = parseFloat(panel.betInput.value) || 0;
                panel.btnAmountText.textContent = `$${betVal.toFixed(2)}`;
            }
        });
    },
    
    updateProfileIcon() {
        // Update user icon index in header
        this.btnProfile.innerHTML = `<img src="https://api.dicebear.com/7.x/bottts/svg?seed=${this.avatarSeed}" style="width: 26px; height: 26px; border-radius: 50%;">`;
        
        // Sync profile username modal fields
        this.profileUsernameInput.value = this.username;
        
        // Sync avatar grid highlight selection
        const avatarOpts = document.querySelectorAll('.avatar-option');
        avatarOpts.forEach(img => {
            if (img.getAttribute('data-seed') === this.avatarSeed) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });
    },
    
    updateSoundIcon() {
        const icon = this.btnSoundToggle.querySelector('i');
        if (this.isMuted) {
            icon.className = 'fa-solid fa-volume-xmark';
            icon.style.color = '#ef4444';
        } else {
            icon.className = 'fa-solid fa-volume-high';
            icon.style.color = '';
        }
    },
    
    // ----------------------------------------------------
    // Event Binds
    // ----------------------------------------------------
    bindEvents() {
        // Refill Credits
        this.btnRefill.addEventListener('click', () => {
            window.GameAudio.ensureCtx();
            this.balance += 1000.00;
            this.saveProfile();
            this.updateBalanceUI();
            this.showToast("Refilled $1,000.00 virtual balance!");
        });
        
        // Sound controls
        this.btnSoundToggle.addEventListener('click', () => {
            this.isMuted = window.GameAudio.toggleMute();
            this.updateSoundIcon();
        });
        
        // Rules dialog opening
        this.btnRules.addEventListener('click', () => {
            window.GameAudio.ensureCtx();
            this.modalRules.classList.remove('hidden');
        });
        this.btnCloseRules.addEventListener('click', () => this.modalRules.classList.add('hidden'));
        this.btnRulesOk.addEventListener('click', () => this.modalRules.classList.add('hidden'));
        
        // Profile Modal
        this.btnProfile.addEventListener('click', () => {
            window.GameAudio.ensureCtx();
            this.modalProfile.classList.remove('hidden');
        });
        this.btnCloseProfile.addEventListener('click', () => this.modalProfile.classList.add('hidden'));
        this.btnProfileCancel.addEventListener('click', () => this.modalProfile.classList.add('hidden'));
        
        // Select Avatar Seed
        const avatarGrid = document.querySelector('.avatar-grid');
        avatarGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('avatar-option')) {
                document.querySelectorAll('.avatar-option').forEach(img => img.classList.remove('active'));
                e.target.classList.add('active');
                this.avatarSeed = e.target.getAttribute('data-seed');
            }
        });
        
        // Save Profile modifications
        this.btnProfileSave.addEventListener('click', () => {
            const rawName = this.profileUsernameInput.value.trim();
            if (rawName.length >= 3) {
                this.username = rawName;
                this.saveProfile();
                this.updateProfileIcon();
                this.modalProfile.classList.add('hidden');
                this.showToast("Profile settings updated!");
            } else {
                this.showToast("Username must be at least 3 characters.", true);
            }
        });
        
        // Navigation tab click switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.GameAudio.ensureCtx();
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                
                const targetPanelId = `panel-${btn.getAttribute('data-tab')}`;
                btn.classList.add('active');
                document.getElementById(targetPanelId).classList.add('active');
            });
        });
        
        // Set up events on Panel A and B
        this.setupPanelEvents('card1');
        this.setupPanelEvents('card2');
        
        // User Chat Submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.GameAudio.ensureCtx();
            const msgText = this.chatInput.value.trim();
            if (!msgText) return;
            
            this.appendChatMessage(this.username, msgText, true);
            this.chatInput.value = '';
            
            // Random bot replies to user message after delay
            setTimeout(() => {
                if (GameEngine.state === 'FLYING') {
                    const botName = this.botNames[Math.floor(Math.random() * this.botNames.length)];
                    const responses = [
                        `GL ${this.username}!`,
                        "Let it soar!",
                        "Cash out early Pilot!",
                        `Rooting for you @${this.username}`,
                        "Go rocket goooo"
                    ];
                    this.appendChatMessage(botName, responses[Math.floor(Math.random() * responses.length)]);
                }
            }, 1200 + Math.random() * 1000);
        });
    },
    
    setupPanelEvents(panelKey) {
        const panel = this.panels[panelKey];
        const container = document.getElementById(`betting-${panelKey === 'card1' ? 'card-1' : 'card-2'}`);
        
        // Toggle Panel Modes: Manual vs Auto
        const modeTabs = container.querySelectorAll('.bet-tab-btn');
        modeTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                window.GameAudio.ensureCtx();
                modeTabs.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                
                const autoPanel = document.getElementById(`${panelKey}-auto-panel`);
                if (btn.getAttribute('data-mode') === 'auto') {
                    autoPanel.classList.remove('hidden');
                } else {
                    autoPanel.classList.add('hidden');
                }
            });
        });
        
        // Adjust values (-/+) buttons
        const btnMinus = document.getElementById(`${panelKey}-bet-minus`);
        const btnPlus = document.getElementById(`${panelKey}-bet-plus`);
        
        btnMinus.addEventListener('click', () => {
            window.GameAudio.ensureCtx();
            if (panel.betPlaced) return;
            let val = parseFloat(panel.betInput.value) || 0;
            val = Math.max(1, val - 1);
            panel.betInput.value = val;
            this.updateBalanceUI();
        });
        
        btnPlus.addEventListener('click', () => {
            window.GameAudio.ensureCtx();
            if (panel.betPlaced) return;
            let val = parseFloat(panel.betInput.value) || 0;
            val = Math.min(1000, val + 1);
            panel.betInput.value = val;
            this.updateBalanceUI();
        });
        
        panel.betInput.addEventListener('input', () => {
            let val = parseFloat(panel.betInput.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 1000) val = 1000;
            panel.betInput.value = Math.floor(val);
            this.updateBalanceUI();
        });
        
        // Quick Bet Grid value buttons ($10, $50, etc)
        const quickBtns = container.querySelectorAll('.quick-bet-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.GameAudio.ensureCtx();
                if (panel.betPlaced) return;
                const quickVal = parseFloat(btn.getAttribute('data-val'));
                panel.betInput.value = quickVal;
                this.updateBalanceUI();
            });
        });
        
        // Main CTA button click (Bet / Cash out / Cancel)
        panel.actionBtn.addEventListener('click', () => {
            this.handlePanelCTA(panelKey);
        });
        
        // Auto Toggles
        panel.autoBetToggle.addEventListener('change', (e) => {
            panel.autoBet = e.target.checked;
        });
        
        panel.autoCashToggle.addEventListener('change', (e) => {
            panel.autoCash = e.target.checked;
            panel.autoCashValue.disabled = !panel.autoCash;
        });
        
        panel.autoCashValue.addEventListener('input', () => {
            let val = parseFloat(panel.autoCashValue.value);
            if (isNaN(val) || val < 1.01) val = 1.01;
            panel.autoCashValue.value = val.toFixed(2);
            panel.autoCashMult = val;
        });
    },
    
    // ----------------------------------------------------
    // CTA Action State Handlers
    // ----------------------------------------------------
    handlePanelCTA(panelKey) {
        window.GameAudio.ensureCtx();
        const panel = this.panels[panelKey];
        const state = GameEngine.state;
        
        if (state === 'WAITING') {
            // Placing / Cancelling bet
            if (!panel.betPlaced) {
                // Place Bet
                const betVal = parseFloat(panel.betInput.value) || 0;
                if (betVal > this.balance) {
                    this.showToast("Insufficient Balance!", true);
                    return;
                }
                
                this.balance -= betVal;
                panel.betPlaced = true;
                panel.activeBet = betVal;
                panel.cashedOut = false;
                
                this.updateBalanceUI();
                this.showToast(`Bet of $${betVal.toFixed(2)} placed for next round!`);
                this.setButtonState(panelKey, 'cancel');
            } else {
                // Cancel Bet
                this.balance += panel.activeBet;
                panel.betPlaced = false;
                panel.activeBet = 0;
                
                this.updateBalanceUI();
                this.showToast("Bet cancelled.");
                this.setButtonState(panelKey, 'bet');
            }
        } else if (state === 'FLYING') {
            // Cash Out
            if (panel.activeBet > 0 && !panel.cashedOut) {
                this.triggerCashOut(panelKey);
            }
        }
    },
    
    triggerCashOut(panelKey) {
        const panel = this.panels[panelKey];
        if (panel.cashedOut) return;
        
        const mult = GameEngine.currentMultiplier;
        const win = panel.activeBet * mult;
        
        panel.cashedOut = true;
        panel.winAmount = win;
        
        this.balance += win;
        this.roundsPlayed += 1;
        this.netProfit += (win - panel.activeBet);
        this.saveProfile();
        
        this.updateBalanceUI();
        this.updateStatsUI();
        
        // Add record to My Bets Table
        this.addMyBetRecord(panel.activeBet, mult, win);
        
        // Sound and toast
        if (window.GameAudio) {
            window.GameAudio.playWin();
        }
        this.showToast(`Cashed Out! Won $${win.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`);
        this.setButtonState(panelKey, 'cashed', mult);
    },
    
    setButtonState(panelKey, state, cashoutMult = 1.00) {
        const panel = this.panels[panelKey];
        const btn = panel.actionBtn;
        
        // Reset classes
        btn.className = 'action-btn';
        btn.disabled = false;
        
        const betVal = parseFloat(panel.betInput.value) || 0;
        
        if (state === 'bet') {
            btn.classList.add('bet-state');
            btn.querySelector('.btn-top-label').textContent = 'BET';
            btn.querySelector('.btn-main-val').textContent = `$${betVal.toFixed(2)}`;
        } else if (state === 'cancel') {
            btn.classList.add('cancel-state');
            btn.querySelector('.btn-top-label').textContent = 'CANCEL';
            btn.querySelector('.btn-main-val').textContent = 'Waiting takeoff';
        } else if (state === 'cashout') {
            btn.classList.add('cashout-state');
            btn.querySelector('.btn-top-label').textContent = 'CASH OUT';
            btn.querySelector('.btn-main-val').textContent = `$${(panel.activeBet * GameEngine.currentMultiplier).toFixed(2)}`;
        } else if (state === 'cashed') {
            btn.classList.add('disabled-state');
            btn.disabled = true;
            btn.querySelector('.btn-top-label').textContent = 'CASHED OUT';
            btn.querySelector('.btn-main-val').textContent = `${cashoutMult.toFixed(2)}x`;
        } else if (state === 'waiting_next') {
            btn.classList.add('disabled-state');
            btn.disabled = true;
            btn.querySelector('.btn-top-label').textContent = 'BET PLACED';
            btn.querySelector('.btn-main-val').textContent = 'Waiting next round';
        } else if (state === 'disabled') {
            btn.classList.add('disabled-state');
            btn.disabled = true;
            btn.querySelector('.btn-top-label').textContent = 'WAITING';
            btn.querySelector('.btn-main-val').textContent = 'Next round soon';
        }
    },
    
    updateStatsUI() {
        this.myRoundsCountText.textContent = this.roundsPlayed;
        
        this.myProfitValText.textContent = `${this.netProfit >= 0 ? '+' : ''}$${this.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.myProfitValText.className = 'summary-value ' + (this.netProfit >= 0 ? 'positive' : 'negative');
    },
    
    // ----------------------------------------------------
    // Game Engine States Interface Integration
    // ----------------------------------------------------
    initGameEngineHooks() {
        // Hook: State Transition
        GameEngine.registerCallback('onStateChange', (newState) => {
            this.handleStateTransition(newState);
        });
        
        // Hook: Game Countdown Tick (runs during WAITING)
        GameEngine.registerCallback('onTick', (timeLeftMs) => {
            const secs = (timeLeftMs / 1000).toFixed(1);
            this.countdownTimerText.textContent = `${secs}s`;
            
            const pct = (timeLeftMs / GameEngine.countdownDuration) * 100;
            this.countdownBarFill.style.width = `${pct}%`;
            
            // Audio beeps for final 3 seconds countdown
            const ceilSecs = Math.ceil(timeLeftMs / 1000);
            if (ceilSecs > 0 && ceilSecs <= 3 && Math.abs((timeLeftMs % 1000) - 900) < 30) {
                if (window.GameAudio) {
                    window.GameAudio.playTick();
                }
            }
        });
        
        // Hook: Multiplier update flight ticks (runs during FLYING)
        GameEngine.registerCallback('onMultiplierUpdate', (mult) => {
            this.currentMultiplierText.textContent = `${mult.toFixed(2)}x`;
            
            // Update active cashing panel indicators
            ['card1', 'card2'].forEach(key => {
                const panel = this.panels[key];
                if (panel.activeBet > 0 && !panel.cashedOut) {
                    // Update CASH OUT amount inside CTA button
                    const currentWin = panel.activeBet * mult;
                    panel.actionBtn.querySelector('.btn-main-val').textContent = `$${currentWin.toFixed(2)}`;
                    
                    // Auto-Cash trigger checks
                    if (panel.autoCash && mult >= panel.autoCashMult) {
                        this.triggerCashOut(key);
                    }
                }
            });
            
            // Tick cashout times for bots
            this.updateSimulatedBots(mult);
        });
        
        // Hook: Crash flight termination
        GameEngine.registerCallback('onCrash', (crashMult) => {
            this.currentMultiplierText.textContent = `${crashMult.toFixed(2)}x`;
            this.crashMultiplierText.textContent = `${crashMult.toFixed(2)}x`;
            
            // Process user losses
            ['card1', 'card2'].forEach(key => {
                const panel = this.panels[key];
                if (panel.activeBet > 0 && !panel.cashedOut) {
                    // Lost bet
                    this.roundsPlayed += 1;
                    this.netProfit -= panel.activeBet;
                    this.saveProfile();
                    this.updateStatsUI();
                    
                    this.addMyBetRecord(panel.activeBet, 0, 0); // 0 win
                }
            });
            
            // Feed history log bar at the top
            this.appendHistoryPill(crashMult);
        });
    },
    
    handleStateTransition(newState) {
        if (newState === 'WAITING') {
            this.overlayWaiting.classList.remove('hidden');
            this.overlayActive.classList.add('hidden');
            this.overlayCrashed.classList.add('hidden');
            
            // Process Auto-Bets queues
            ['card1', 'card2'].forEach(key => {
                const panel = this.panels[key];
                panel.activeBet = 0;
                panel.cashedOut = false;
                panel.winAmount = 0;
                
                if (panel.autoBet) {
                    const betVal = parseFloat(panel.betInput.value) || 0;
                    if (betVal <= this.balance) {
                        this.balance -= betVal;
                        panel.betPlaced = true;
                        panel.activeBet = betVal;
                        this.updateBalanceUI();
                        this.setButtonState(key, 'cancel');
                    } else {
                        panel.betPlaced = false;
                        this.showToast(`Auto Bet failed on Panel ${key === 'card1' ? 'A' : 'B'}: Insufficient Credits!`, true);
                        this.setButtonState(key, 'bet');
                    }
                } else {
                    panel.betPlaced = false;
                    this.setButtonState(key, 'bet');
                }
            });
            
            // Generate simulated bots bets list
            this.generateSimulatedPlayers();
            
        } else if (newState === 'FLYING') {
            this.overlayWaiting.classList.add('hidden');
            this.overlayActive.classList.remove('hidden');
            this.overlayCrashed.classList.add('hidden');
            
            // Set cashout or disabled states for cards
            ['card1', 'card2'].forEach(key => {
                const panel = this.panels[key];
                if (panel.betPlaced) {
                    this.setButtonState(key, 'cashout');
                } else {
                    // Locked out, can queue for next
                    this.setButtonState(key, 'disabled');
                }
            });
            
        } else if (newState === 'CRASHED') {
            this.overlayWaiting.classList.add('hidden');
            this.overlayActive.classList.add('hidden');
            this.overlayCrashed.classList.remove('hidden');
            
            // Grey out betting buttons
            ['card1', 'card2'].forEach(key => {
                const panel = this.panels[key];
                this.setButtonState(key, 'disabled');
            });
            
            // Update bots table to red lost states for active losers
            this.resolveBotLosses();
        }
    },
    
    // ----------------------------------------------------
    // Simulated Active Multiplayer Logic
    // ----------------------------------------------------
    generateSimulatedPlayers() {
        this.simulatedPlayers = [];
        
        // Random count of players this round (15 to 25)
        const totalBots = 12 + Math.floor(Math.random() * 10);
        
        let totalBetSum = 0;
        
        // Select random names
        const shuffled = [...this.botNames].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < totalBots; i++) {
            const name = shuffled[i % shuffled.length] + (Math.random() > 0.7 ? Math.floor(Math.random() * 99) : '');
            const betVal = Math.floor(5 + Math.random() * 195); // bet $5 - $200
            
            // generate target multiplier (some cash early, some hold out, some crash)
            const crashVal = Math.random();
            let targetMult;
            if (crashVal < 0.2) targetMult = 1.05 + Math.random() * 0.2; // cash very early
            else if (crashVal < 0.6) targetMult = 1.25 + Math.random() * 1.5; // moderate cashing
            else if (crashVal < 0.8) targetMult = 2.75 + Math.random() * 8.0; // high cashout targets
            else targetMult = 10.0 + Math.random() * 30.0; // greedy players
            
            this.simulatedPlayers.push({
                name: name,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
                bet: betVal,
                targetMult: Math.round(targetMult * 100) / 100,
                cashedOut: false,
                win: 0
            });
            
            totalBetSum += betVal;
        }
        
        // Add user bets to counts
        let userBetAdded = 0;
        let userCount = 0;
        ['card1', 'card2'].forEach(key => {
            if (this.panels[key].betPlaced) {
                userBetAdded += this.panels[key].activeBet;
                userCount++;
            }
        });
        
        this.liveBetsCountText.textContent = `Total bets: ${totalBots + userCount}`;
        this.liveBetsSumText.textContent = `$${(totalBetSum + userBetAdded).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        
        // Render initial bets list
        this.renderBetsList();
    },
    
    renderBetsList() {
        this.liveBetsList.innerHTML = '';
        
        // Add user entries first if active
        ['card1', 'card2'].forEach((key, idx) => {
            const panel = this.panels[key];
            if (panel.betPlaced) {
                const tr = document.createElement('tr');
                tr.style.background = 'rgba(0, 240, 255, 0.04)';
                tr.innerHTML = `
                    <td>
                        <div class="player-info">
                            <img class="player-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${this.avatarSeed}" alt="Me">
                            <span class="player-name" style="color: var(--neon-cyan);">${this.username} (P${idx+1})</span>
                        </div>
                    </td>
                    <td>$${panel.activeBet.toFixed(2)}</td>
                    <td id="user-bet-${key}-mult">-</td>
                    <td class="win-val" id="user-bet-${key}-win">-</td>
                `;
                this.liveBetsList.appendChild(tr);
            }
        });
        
        // Add simulated bots
        this.simulatedPlayers.forEach((bot, idx) => {
            const tr = document.createElement('tr');
            tr.id = `bot-row-${idx}`;
            tr.innerHTML = `
                <td>
                    <div class="player-info">
                        <img class="player-avatar" src="${bot.avatar}" alt="${bot.name}">
                        <span class="player-name">${bot.name}</span>
                    </div>
                </td>
                <td>$${bot.bet.toFixed(2)}</td>
                <td class="bot-mult-cell">-</td>
                <td class="win-val bot-win-cell">-</td>
            `;
            this.liveBetsList.appendChild(tr);
        });
    },
    
    updateSimulatedBots(currentMult) {
        this.simulatedPlayers.forEach((bot, idx) => {
            if (!bot.cashedOut && currentMult >= bot.targetMult) {
                bot.cashedOut = true;
                bot.win = bot.bet * bot.targetMult;
                
                // Update table row styling
                const row = document.getElementById(`bot-row-${idx}`);
                if (row) {
                    const multCell = row.querySelector('.bot-mult-cell');
                    const winCell = row.querySelector('.bot-win-cell');
                    
                    if (multCell && winCell) {
                        multCell.innerHTML = `<span class="bet-mult-pill active">${bot.targetMult.toFixed(2)}x</span>`;
                        winCell.textContent = `$${bot.win.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        winCell.classList.add('won');
                    }
                }
            }
        });
        
        // Sync user dynamic cashouts inside list table
        ['card1', 'card2'].forEach(key => {
            const panel = this.panels[key];
            if (panel.betPlaced) {
                const multCell = document.getElementById(`user-bet-${key}-mult`);
                const winCell = document.getElementById(`user-bet-${key}-win`);
                
                if (panel.cashedOut) {
                    if (multCell && !multCell.querySelector('.bet-mult-pill')) {
                        multCell.innerHTML = `<span class="bet-mult-pill active">${panel.winAmount / panel.activeBet}x</span>`;
                        winCell.textContent = `$${panel.winAmount.toFixed(2)}`;
                        winCell.classList.add('won');
                    }
                }
            }
        });
    },
    
    resolveBotLosses() {
        this.simulatedPlayers.forEach((bot, idx) => {
            if (!bot.cashedOut) {
                const row = document.getElementById(`bot-row-${idx}`);
                if (row) {
                    const multCell = row.querySelector('.bot-mult-cell');
                    const winCell = row.querySelector('.bot-win-cell');
                    if (multCell && winCell) {
                        multCell.innerHTML = `<span style="color: var(--text-muted);">Lost</span>`;
                        winCell.textContent = `$0.00`;
                        winCell.style.color = 'var(--text-muted)';
                    }
                }
            }
        });
        
        // Sync user loss displays inside list table
        ['card1', 'card2'].forEach(key => {
            const panel = this.panels[key];
            if (panel.betPlaced && !panel.cashedOut) {
                const multCell = document.getElementById(`user-bet-${key}-mult`);
                const winCell = document.getElementById(`user-bet-${key}-win`);
                if (multCell && winCell) {
                    multCell.innerHTML = `<span style="color: var(--neon-rose);">Lost</span>`;
                    winCell.textContent = `$0.00`;
                    winCell.style.color = 'var(--text-muted)';
                }
            }
        });
    },
    
    // ----------------------------------------------------
    // User Personal Bet History Log
    // ----------------------------------------------------
    addMyBetRecord(bet, cashoutMult, win) {
        const tr = document.createElement('tr');
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const isWin = win > 0;
        tr.innerHTML = `
            <td>${timeStr}</td>
            <td>$${bet.toFixed(2)}</td>
            <td>${isWin ? cashoutMult.toFixed(2) + 'x' : '<span style="color: var(--neon-rose);">Crash</span>'}</td>
            <td class="win-val ${isWin ? 'won' : ''}">$${win.toFixed(2)}</td>
        `;
        
        // Prepend to list
        if (this.myBetsList.firstChild) {
            this.myBetsList.insertBefore(tr, this.myBetsList.firstChild);
        } else {
            this.myBetsList.appendChild(tr);
        }
        
        // Update values in local storage stats
        this.updateStatsUI();
    },
    
    // ----------------------------------------------------
    // History Strip Multiplier Pills
    // ----------------------------------------------------
    generateInitialHistory() {
        this.historyContainer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            // Generate some random history pills
            const dummyMults = [1.02, 1.25, 2.10, 1.15, 8.42, 1.05, 3.20, 15.42, 1.45, 1.09, 2.85, 42.15];
            const val = dummyMults[i];
            this.appendHistoryPill(val);
        }
    },
    
    appendHistoryPill(value) {
        const pill = document.createElement('span');
        pill.className = 'multiplier-pill';
        
        if (value < 1.50) pill.classList.add('low');
        else if (value < 10.00) pill.classList.add('medium');
        else pill.classList.add('high');
        
        pill.textContent = `${value.toFixed(2)}x`;
        
        // Add click behavior to inspect history
        pill.addEventListener('click', () => {
            this.showToast(`Multiplier was ${value.toFixed(2)}x`);
        });
        
        if (this.historyContainer.firstChild) {
            this.historyContainer.insertBefore(pill, this.historyContainer.firstChild);
        } else {
            this.historyContainer.appendChild(pill);
        }
        
        // Cap pills count at 20
        const pills = this.historyContainer.querySelectorAll('.multiplier-pill');
        if (pills.length > 20) {
            pills[pills.length - 1].remove();
        }
    },
    
    // ----------------------------------------------------
    // Live Interactive Chat Simulation
    // ----------------------------------------------------
    startChatSimulation() {
        // Initial setup system messages
        this.appendChatMessage("SYSTEM", "Welcome to Aviator Rocket simulator chat room!", false, true);
        
        const triggerNextMessage = () => {
            const nextDelay = 3500 + Math.random() * 5000; // message every 3.5 - 8.5 seconds
            
            setTimeout(() => {
                const botName = this.botNames[Math.floor(Math.random() * this.botNames.length)];
                const msg = this.generateChatMessageText();
                this.appendChatMessage(botName, msg);
                triggerNextMessage();
            }, nextDelay);
        };
        
        triggerNextMessage();
    },
    
    generateChatMessageText() {
        const state = GameEngine.state;
        const mult = GameEngine.currentMultiplier;
        
        const countdownMessages = [
            "Placing bet, let's go!",
            "Hope it goes to 10x this time.",
            "Going auto cashout 1.50x",
            "Lost last round, recovery time!",
            "Double bet active guys!",
            "Who's playing?",
            "Demo credits go brrr"
        ];
        
        const flyingEarlyMessages = [
            "Climbing steadily...",
            "Hold tight, don't cash yet!",
            "Cashed at 1.3x, simple profit.",
            "Waiting for 2.0x",
            "Takeoff looks clean!",
            "Going high today?"
        ];
        
        const flyingLateMessages = [
            "WOW, 5x!",
            "STILL FLYING?!",
            "Hold it guys, 10x target!",
            "Cashed at 8.5x, let's go!!",
            "Oh my god, this is huge!",
            "Where is it going??",
            "Absolute legend flight!"
        ];
        
        const lowCrashMessages = [
            "Bruh 1.05x crash.",
            "Instant crash, typical.",
            "Ouch, immediate flew away",
            "Damn, lost $100 credits",
            "Server needs a restart haha",
            "Flew away so fast..."
        ];
        
        const highCrashMessages = [
            "What a flight!",
            "Should have cashed at 15x, damn it.",
            "Crashed at 18.5x, intense!",
            "Gg guys",
            "Amazing multiplier",
            "Next round will crash early, watch out",
            "Gotta love high flights"
        ];
        
        const genericMessages = [
            "Nice lobby we have here",
            "Addicted to this rocket haha",
            "Pilot profile options look cool",
            "Anyone hit a 100x today?",
            "What is your target strategy?",
            "Let's win some virtual credits"
        ];
        
        if (state === 'WAITING') {
            return countdownMessages[Math.floor(Math.random() * countdownMessages.length)];
        } else if (state === 'FLYING') {
            if (mult < 4.0) {
                return flyingEarlyMessages[Math.floor(Math.random() * flyingEarlyMessages.length)];
            } else {
                return flyingLateMessages[Math.floor(Math.random() * flyingLateMessages.length)];
            }
        } else if (state === 'CRASHED') {
            if (GameEngine.currentMultiplier < 2.0) {
                return lowCrashMessages[Math.floor(Math.random() * lowCrashMessages.length)];
            } else {
                return highCrashMessages[Math.floor(Math.random() * highCrashMessages.length)];
            }
        }
        
        return genericMessages[Math.floor(Math.random() * genericMessages.length)];
    },
    
    appendChatMessage(user, text, isUser = false, isSystem = false) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (isUser) bubble.classList.add('user');
        if (isSystem) {
            bubble.classList.add('system');
            bubble.textContent = text;
        } else {
            bubble.innerHTML = `
                <div class="chat-meta">
                    <span class="chat-user-name">${user}</span>
                </div>
                <div class="chat-text">${text}</div>
            `;
        }
        
        this.chatMessages.appendChild(bubble);
        
        // Auto scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Cap messages count to 50
        const bubbles = this.chatMessages.querySelectorAll('.chat-bubble');
        if (bubbles.length > 50) {
            bubbles[0].remove();
        }
    },
    
    // ----------------------------------------------------
    // Toast Notification System
    // ----------------------------------------------------
    showToast(message, isError = false) {
        clearTimeout(this.toastTimeout);
        
        this.toast.className = 'toast';
        if (isError) this.toast.classList.add('toast-error');
        
        const icon = this.toast.querySelector('.toast-icon');
        if (isError) {
            icon.className = 'fa-solid fa-circle-exclamation toast-icon';
        } else {
            icon.className = 'fa-solid fa-circle-check toast-icon';
        }
        
        this.toastText.textContent = message;
        this.toast.classList.remove('hidden');
        
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.add('hidden');
        }, 3000);
    }
};

// Bind initialization on load
window.addEventListener('DOMContentLoaded', () => {
    // Initialise Game Audio
    GameAudio.init();
    
    // Initialise Canvas Game Engine
    GameEngine.init('flight-canvas');
    
    // Initialise UI Controller
    UIController.init();
});
