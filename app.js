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

// Jet Engine noise simulation for Aviator
let jetNode = null;
let jetOsc = null;

function startJetEngineSound() {
  if (!window.soundEnabled) return;
  initAudio();
  
  try {
    jetOsc = audioCtx.createOscillator();
    jetNode = audioCtx.createGain();
    
    jetOsc.type = 'sawtooth';
    jetOsc.frequency.setValueAtTime(80, audioCtx.currentTime); // Low engine hum
    
    jetNode.gain.setValueAtTime(0.02, audioCtx.currentTime); // Soft volume
    
    jetOsc.connect(jetNode);
    jetNode.connect(audioCtx.destination);
    jetOsc.start();
  } catch (e) {
    console.warn("Audio node init failed:", e);
  }
}

function updateJetEnginePitch(multiplier) {
  if (jetOsc && audioCtx) {
    // Pitch increases with the flying multiplier
    const targetFreq = 80 + (multiplier * 45);
    jetOsc.frequency.setValueAtTime(targetFreq, audioCtx.currentTime);
    
    // Gain increases slightly as plane flies higher
    const targetGain = Math.min(0.02 + (multiplier * 0.008), 0.08);
    jetNode.gain.setValueAtTime(targetGain, audioCtx.currentTime);
  }
}

function stopJetEngineSound(isCrash = false) {
  if (jetOsc) {
    try {
      jetOsc.stop();
      jetOsc.disconnect();
    } catch(e) {}
    jetOsc = null;
  }
  
  if (isCrash) {
    // Play explosion sound effect (Low noise burst)
    playSynthSound(60, 'sawtooth', 0.65, 0.25);
    playSynthSound(90, 'triangle', 0.45, 0.2);
  }
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

// Deposit details state
let selectedDepositMethod = 'UPI Fast';
let selectedDepositAmountPreset = 500;

// DOM variables cache
let userBalanceEl, screenLobby, screenWingo, screenAviator, soundToggleBtn;


// --- DOM Ready Entrypoint ---
document.addEventListener('DOMContentLoaded', () => {
  // Cache selector nodes
  userBalanceEl = document.getElementById('user-balance');
  screenLobby = document.getElementById('screen-lobby');
  screenWingo = document.getElementById('screen-wingo');
  screenAviator = document.getElementById('screen-aviator');
  soundToggleBtn = document.getElementById('sound-toggle-btn');
  
  // Set initial UI elements
  updateBalanceUI();
  initSoundToggleButton();
  
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
  
  activeScreen = screenId;
  
  // Toggle active CSS classes
  screenLobby.classList.remove('active');
  screenWingo.classList.remove('active');
  screenAviator.classList.remove('active');
  
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
