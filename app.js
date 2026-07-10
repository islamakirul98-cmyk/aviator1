// Products data with customized gaming SVG icons and Blinkit style properties
const PRODUCTS = [
  {
    id: 'p1',
    name: 'Monster Gamer Energy Drink (Can)',
    price: 110,
    originalPrice: 150,
    category: 'drinks',
    time: '7 mins',
    rating: '4.9',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-energy" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00ff87"/><stop offset="100%" stop-color="#60efff"/></linearGradient></defs><rect x="35" y="15" width="30" height="70" rx="6" fill="url(#g-energy)"/><rect x="42" y="10" width="16" height="5" fill="#333"/><path d="M 50 25 L 40 45 L 60 45 L 50 75" stroke="#111" stroke-width="4" fill="none" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'p2',
    name: 'HyperX Mechanical Keyboard RGB',
    price: 3499,
    originalPrice: 4999,
    category: 'accessories',
    time: '12 mins',
    rating: '4.8',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-kbd" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff007f"/><stop offset="100%" stop-color="#7f00ff"/></linearGradient></defs><rect x="15" y="30" width="70" height="40" rx="4" fill="#222" stroke="url(#g-kbd)" stroke-width="3"/><rect x="20" y="35" width="8" height="8" rx="1" fill="#ff007f"/><rect x="30" y="35" width="8" height="8" rx="1" fill="#7f00ff"/><rect x="40" y="35" width="8" height="8" rx="1" fill="#00E676"/><rect x="50" y="35" width="8" height="8" rx="1" fill="#F9E300"/><rect x="60" y="35" width="8" height="8" rx="1" fill="#ff007f"/><rect x="70" y="35" width="8" height="8" rx="1" fill="#7f00ff"/><rect x="20" y="47" width="8" height="8" rx="1" fill="#7f00ff"/><rect x="30" y="47" width="28" height="8" rx="1" fill="#00e5ff"/><rect x="62" y="47" width="8" height="8" rx="1" fill="#ff007f"/><rect x="72" y="47" width="8" height="8" rx="1" fill="#F9E300"/><rect x="20" y="59" width="60" height="6" rx="1" fill="#333"/></svg>`
  },
  {
    id: 'p3',
    name: 'Logitech G Lightspeed Mouse',
    price: 1899,
    originalPrice: 2499,
    category: 'accessories',
    time: '9 mins',
    rating: '4.7',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-mouse" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#00ff87"/></linearGradient></defs><path d="M 50 15 C 35 15, 30 35, 30 55 C 30 75, 40 85, 50 85 C 60 85, 70 75, 70 55 C 70 35, 65 15, 50 15 Z" fill="#222" stroke="url(#g-mouse)" stroke-width="3"/><path d="M 50 15 L 50 45 M 30 45 L 70 45" stroke="url(#g-mouse)" stroke-width="1.5"/><rect x="47" y="25" width="6" height="12" rx="3" fill="#00ff87"/></svg>`
  },
  {
    id: 'p4',
    name: 'Steam $10 Wallet Gift Card',
    price: 850,
    originalPrice: 900,
    category: 'keys',
    time: '5 mins',
    rating: '4.9',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-steam" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1b2838"/><stop offset="100%" stop-color="#2a475e"/></linearGradient></defs><rect x="15" y="25" width="70" height="50" rx="6" fill="url(#g-steam)" stroke="#00e5ff" stroke-width="1.5"/><circle cx="50" cy="50" r="14" fill="#171a21"/><path d="M 43 57 L 57 43" stroke="#00e5ff" stroke-width="4" stroke-linecap="round"/><circle cx="43" cy="57" r="4" fill="#00e5ff"/><circle cx="57" cy="43" r="5" fill="#2a475e" stroke="#00e5ff" stroke-width="2"/></svg>`
  },
  {
    id: 'p5',
    name: 'Valorant 1000 VP Instant Code',
    price: 799,
    originalPrice: 850,
    category: 'keys',
    time: '5 mins',
    rating: '4.8',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-val" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4655"/><stop offset="100%" stop-color="#ff7f7f"/></linearGradient></defs><rect x="15" y="25" width="70" height="50" rx="6" fill="#111" stroke="url(#g-val)" stroke-width="2"/><path d="M 40 35 L 48 35 L 60 55 L 52 55 Z M 48 55 L 60 35" stroke="url(#g-val)" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: 'p6',
    name: 'Doritos Gamer Spicy Nachos',
    price: 90,
    originalPrice: 100,
    category: 'snacks',
    time: '8 mins',
    rating: '4.6',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-chips" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff3300"/><stop offset="100%" stop-color="#ff9900"/></linearGradient></defs><path d="M 30 15 L 70 15 L 75 85 L 25 85 Z" fill="url(#g-chips)"/><path d="M 40 40 L 60 40 L 50 65 Z" fill="#ffcc00" stroke="#fff" stroke-width="1"/></svg>`
  },
  {
    id: 'p7',
    name: 'Xbox Game Pass 1-Month Code',
    price: 489,
    originalPrice: 549,
    category: 'keys',
    time: '5 mins',
    rating: '4.9',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-xbox" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#107c10"/><stop offset="100%" stop-color="#23bc23"/></linearGradient></defs><rect x="15" y="25" width="70" height="50" rx="6" fill="url(#g-xbox)" stroke="#fff" stroke-width="1.5"/><circle cx="50" cy="50" r="16" fill="#111"/><path d="M 40 42 C 43 45, 57 45, 60 42 C 55 45, 45 45, 40 42 Z" fill="#fff"/><path d="M 38 45 C 42 55, 58 55, 62 45 C 55 58, 45 58, 38 45 Z" fill="#fff"/></svg>`
  },
  {
    id: 'p8',
    name: '120mm RGB Cabinet Fan (1 unit)',
    price: 499,
    originalPrice: 799,
    category: 'hardware',
    time: '14 mins',
    rating: '4.5',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-fan" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00f2fe"/><stop offset="100%" stop-color="#4facfe"/></linearGradient></defs><rect x="20" y="20" width="60" height="60" rx="6" fill="none" stroke="url(#g-fan)" stroke-width="4"/><circle cx="50" cy="50" r="24" fill="none" stroke="url(#g-fan)" stroke-width="2" stroke-dasharray="4,2"/><circle cx="50" cy="50" r="8" fill="url(#g-fan)"/><path d="M 50 26 C 45 35, 45 45, 50 42 C 55 45, 55 35, 50 26 Z M 50 74 C 45 65, 45 55, 50 58 C 55 55, 55 65, 50 74 Z" fill="url(#g-fan)"/><path d="M 26 50 C 35 45, 45 45, 42 50 C 45 55, 35 55, 26 50 Z M 74 50 C 65 45, 55 45, 58 50 C 55 55, 65 55, 74 50 Z" fill="url(#g-fan)"/></svg>`
  },
  {
    id: 'p9',
    name: 'Noctua NT-H1 Thermal Paste',
    price: 649,
    originalPrice: 899,
    category: 'hardware',
    time: '10 mins',
    rating: '4.9',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><path d="M 30 75 L 70 35" stroke="#888" stroke-width="8" stroke-linecap="round"/><path d="M 20 85 L 35 70" stroke="#555" stroke-width="5"/><path d="M 65 40 L 75 30" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M 72 33 L 80 25" stroke="#f00" stroke-width="4"/><rect x="35" y="45" width="20" height="10" rx="2" fill="#d2691e" transform="rotate(-45 45 50)"/></svg>`
  },
  {
    id: 'p10',
    name: 'Kingston Fury 16GB DDR5 RAM',
    price: 4599,
    originalPrice: 5999,
    category: 'hardware',
    time: '15 mins',
    rating: '4.8',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-ram" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff00cc"/><stop offset="100%" stop-color="#3333ff"/></linearGradient></defs><rect x="10" y="38" width="80" height="24" rx="2" fill="#222" stroke="url(#g-ram)" stroke-width="3"/><rect x="15" y="62" width="70" height="4" fill="#d4af37" stroke-dasharray="2,1"/><rect x="20" y="44" width="12" height="12" fill="#444"/><rect x="36" y="44" width="12" height="12" fill="#444"/><rect x="52" y="44" width="12" height="12" fill="#444"/><rect x="68" y="44" width="12" height="12" fill="#444"/><rect x="12" y="40" width="76" height="2" fill="#00ffcc"/></svg>`
  },
  {
    id: 'p11',
    name: 'Pro Silicon Thumb Grips (Set of 4)',
    price: 199,
    originalPrice: 399,
    category: 'console',
    time: '9 mins',
    rating: '4.4',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><circle cx="35" cy="35" r="16" fill="#111" stroke="#ff0055" stroke-width="3"/><circle cx="35" cy="35" r="6" fill="#ff0055" stroke-dasharray="2,2"/><circle cx="65" cy="35" r="16" fill="#111" stroke="#00ffcc" stroke-width="3"/><circle cx="65" cy="35" r="6" fill="#00ffcc" stroke-dasharray="2,2"/><circle cx="35" cy="65" r="16" fill="#111" stroke="#ffcc00" stroke-width="3"/><circle cx="35" cy="65" r="6" fill="#ffcc00" stroke-dasharray="2,2"/><circle cx="65" cy="65" r="16" fill="#111" stroke="#ff00ff" stroke-width="3"/><circle cx="65" cy="65" r="6" fill="#ff00ff" stroke-dasharray="2,2"/></svg>`
  },
  {
    id: 'p12',
    name: 'Gamer Neon Fuel Thermos Flask',
    price: 699,
    originalPrice: 999,
    category: 'drinks',
    time: '11 mins',
    rating: '4.7',
    svg: `<svg viewBox="0 0 100 100" class="prod-svg"><defs><linearGradient id="g-mug" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#9d00ff"/><stop offset="100%" stop-color="#ff007f"/></linearGradient></defs><rect x="35" y="25" width="30" height="55" rx="10" fill="url(#g-mug)"/><path d="M 65 35 C 75 35, 75 65, 65 65" fill="none" stroke="url(#g-mug)" stroke-width="6" stroke-linecap="round"/><rect x="42" y="20" width="16" height="5" rx="2" fill="#333"/><circle cx="50" cy="52" r="8" fill="#111"/><path d="M 47 52 L 53 52 M 50 49 L 50 55" stroke="#ff007f" stroke-width="2"/></svg>`
  }
];

// App State
let cart = {}; // format: { productId: quantity }
let currentCategory = 'all';
let searchQuery = '';
let currentCoordinates = { lat: 28.6139, lon: 77.2090 }; // default Delhi coordinates

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoryChips = document.querySelectorAll('.category-chip');
const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const cartBtnMobile = document.getElementById('cart-btn-mobile');
const cartCount = document.getElementById('cart-count');
const cartCountMobile = document.getElementById('cart-count-mobile');
const cartAmount = document.getElementById('cart-amount');
const cartAmountMobile = document.getElementById('cart-amount-mobile');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartView = document.getElementById('empty-cart-view');
const filledCartView = document.getElementById('filled-cart-view');
const checkoutTotal = document.getElementById('checkout-total');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const checkoutBtn = document.getElementById('checkout-btn');

// Bill details elements
const subtotalEl = document.getElementById('bill-subtotal');
const deliveryFeeEl = document.getElementById('bill-delivery');
const handlingFeeEl = document.getElementById('bill-handling');
const grandTotalEl = document.getElementById('bill-grandtotal');

// Delivery Tracking Screen Elements
const trackerPortal = document.getElementById('tracker-portal');
const droneMap = document.getElementById('drone-map');
const droneIcon = document.getElementById('drone-icon');
const trackerTimer = document.getElementById('tracker-timer');
const trackerStatusList = document.getElementById('tracker-status-list');
const closeTrackerBtn = document.getElementById('close-tracker-btn');

// Location Modal Elements
const locationSelector = document.getElementById('location-selector');
const locationModal = document.getElementById('location-modal');
const locationModalOverlay = document.getElementById('location-modal-overlay');
const closeLocationModal = document.getElementById('close-location-modal');
const detectGpsBtn = document.getElementById('detect-gps-btn');
const gpsStatusText = document.getElementById('gps-status-text');
const gpsSpinner = document.getElementById('gps-spinner');
const manualAddressInput = document.getElementById('manual-address-input');
const saveAddressBtn = document.getElementById('save-address-btn');
const quickAddrItems = document.querySelectorAll('.quick-addr-item');
const currentLocationText = document.getElementById('current-location-text');

// Google Maps Integration Elements
const googleMapsVerifyWrap = document.getElementById('google-maps-verify-wrap');
const verifyOnGoogleMaps = document.getElementById('verify-on-google-maps');
const deliveryGoogleMapsLink = document.getElementById('delivery-google-maps-link');

// Interactive Leaflet Map variables
const liveMapAddress = document.getElementById('live-map-address');
const gpsRecenterBtn = document.getElementById('gps-recenter-btn');
let leafletMap = null;
let tempSelectedAddressText = '';

// Initialize Website
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupEventListeners();
  updateCartUI();
});

// Setup Event Listeners
function setupEventListeners() {
  // Category Filtering
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.category;
      renderProducts();
    });
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProducts();
  });

  // Open Cart Drawer
  cartBtn.addEventListener('click', toggleCart);
  if (cartBtnMobile) {
    cartBtnMobile.addEventListener('click', toggleCart);
  }

  // Close Cart Drawer
  closeCart.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);

  // Checkout / Place Order Button
  checkoutBtn.addEventListener('click', startOrderCheckout);

  // Close Tracker Portal
  closeTrackerBtn.addEventListener('click', closeTracker);

  // Location modal event listeners
  locationSelector.addEventListener('click', toggleLocationModal);
  closeLocationModal.addEventListener('click', toggleLocationModal);
  locationModalOverlay.addEventListener('click', toggleLocationModal);
  detectGpsBtn.addEventListener('click', confirmPinLocation);
  if (gpsRecenterBtn) {
    gpsRecenterBtn.addEventListener('click', recenterMapToGPS);
  }
  saveAddressBtn.addEventListener('click', saveManualAddress);
  manualAddressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveManualAddress();
  });
  quickAddrItems.forEach(item => {
    item.addEventListener('click', () => {
      const address = item.dataset.address;
      currentLocationText.textContent = address;
      
      // Preset coordinates depending on pre-configured gamer addresses
      if (address.includes('Lounge')) {
        currentCoordinates = { lat: 28.6200, lon: 77.2100 };
      } else if (address.includes('Arena')) {
        currentCoordinates = { lat: 28.6300, lon: 77.2200 };
      } else if (address.includes('Hostel')) {
        currentCoordinates = { lat: 28.6400, lon: 77.2300 };
      }
      
      // Update Leaflet map view if open
      if (leafletMap) {
        leafletMap.setView([currentCoordinates.lat, currentCoordinates.lon], 15);
        reverseGeocodeCoords(currentCoordinates.lat, currentCoordinates.lon);
      }
      
      if (googleMapsVerifyWrap) googleMapsVerifyWrap.style.display = 'none';
      toggleLocationModal();
    });
  });
}

// Toggle Cart Drawer
function toggleCart() {
  cartDrawer.classList.toggle('open');
  cartOverlay.classList.toggle('open');
}

// Render Products Catalog based on active filters
function renderProducts() {
  productsGrid.innerHTML = '';
  
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                          product.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-products">
        <svg viewBox="0 0 100 100" class="empty-search-svg">
          <circle cx="50" cy="45" r="20" fill="none" stroke="#555" stroke-width="4"/>
          <line x1="64" y1="59" x2="80" y2="75" stroke="#555" stroke-width="6" stroke-linecap="round"/>
          <line x1="42" y1="37" x2="58" y2="53" stroke="#ff0055" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <p>No gaming gear found for "${searchQuery}"</p>
      </div>
    `;
    return;
  }

  filteredProducts.forEach(product => {
    const inCartQty = cart[product.id] || 0;
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="card-image-wrap">
        <span class="delivery-badge">
          <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2V8h2v8zm0-10h-2V4h2v2z"/></svg>
          ${product.time}
        </span>
        ${product.svg}
      </div>
      <div class="card-details">
        <div class="rating-badge">★ ${product.rating}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="price-action-row">
          <div class="price-container">
            <span class="price-current">₹${product.price}</span>
            <span class="price-original">₹${product.originalPrice}</span>
            <span class="price-discount">${discount}% OFF</span>
          </div>
          <div class="action-btn-container" id="action-${product.id}">
            ${
              inCartQty > 0 
              ? `<div class="qty-counter">
                  <button onclick="decrementItem('${product.id}')">−</button>
                  <span>${inCartQty}</span>
                  <button onclick="incrementItem('${product.id}')">+</button>
                 </div>`
              : `<button class="add-to-cart-btn" onclick="incrementItem('${product.id}')">ADD</button>`
            }
          </div>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Increment Item Quantity
window.incrementItem = function(productId) {
  if (cart[productId]) {
    cart[productId] += 1;
  } else {
    cart[productId] = 1;
  }
  updateCartUI();
  renderProducts(); // Refresh buttons state in grid
};

// Decrement Item Quantity
window.decrementItem = function(productId) {
  if (cart[productId] > 1) {
    cart[productId] -= 1;
  } else {
    delete cart[productId];
  }
  updateCartUI();
  renderProducts(); // Refresh buttons state in grid
};

// Update Cart State & Elements
function updateCartUI() {
  const itemIds = Object.keys(cart);
  const totalItems = itemIds.reduce((sum, id) => sum + cart[id], 0);
  
  // Calculate Totals
  let itemsSubtotal = 0;
  itemIds.forEach(id => {
    const prod = PRODUCTS.find(p => p.id === id);
    if (prod) {
      itemsSubtotal += prod.price * cart[id];
    }
  });

  // Blinkit logic: Free delivery over ₹499
  const freeDeliveryThreshold = 499;
  const deliveryFee = itemsSubtotal > freeDeliveryThreshold || itemsSubtotal === 0 ? 0 : 25;
  const handlingFee = itemsSubtotal > 0 ? 4 : 0;
  const grandTotal = itemsSubtotal + deliveryFee + handlingFee;

  // Header & Mobile Cart Bars
  cartCount.textContent = totalItems;
  if (cartCountMobile) cartCountMobile.textContent = totalItems;
  
  cartAmount.textContent = `₹${grandTotal}`;
  if (cartAmountMobile) cartAmountMobile.textContent = `₹${grandTotal}`;

  const headerCart = document.querySelector('.header-cart-btn');
  const stickyCartMobile = document.getElementById('sticky-cart-bar-mobile');
  
  if (totalItems > 0) {
    headerCart.classList.add('has-items');
    if (stickyCartMobile) stickyCartMobile.classList.add('visible');
  } else {
    headerCart.classList.remove('has-items');
    if (stickyCartMobile) stickyCartMobile.classList.remove('visible');
  }

  // Draw Cart Drawer Content
  if (totalItems === 0) {
    emptyCartView.style.display = 'flex';
    filledCartView.style.display = 'none';
  } else {
    emptyCartView.style.display = 'none';
    filledCartView.style.display = 'flex';

    // Populate List
    cartItemsContainer.innerHTML = '';
    itemIds.forEach(id => {
      const prod = PRODUCTS.find(p => p.id === id);
      if (prod) {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-row';
        itemRow.innerHTML = `
          <div class="cart-item-svg">${prod.svg}</div>
          <div class="cart-item-info">
            <h4 class="cart-item-name">${prod.name}</h4>
            <span class="cart-item-price">₹${prod.price}</span>
          </div>
          <div class="qty-counter small">
            <button onclick="decrementItem('${id}')">−</button>
            <span>${cart[id]}</span>
            <button onclick="incrementItem('${id}')">+</button>
          </div>
        `;
        cartItemsContainer.appendChild(itemRow);
      }
    });

    // Subtotal & Bill breakdown
    subtotalEl.textContent = `₹${itemsSubtotal}`;
    deliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    if (deliveryFee === 0 && itemsSubtotal > 0) {
      deliveryFeeEl.classList.add('free-text');
    } else {
      deliveryFeeEl.classList.remove('free-text');
    }
    handlingFeeEl.textContent = `₹${handlingFee}`;
    grandTotalEl.textContent = `₹${grandTotal}`;
    checkoutTotal.textContent = `₹${grandTotal}`;

    // Delivery progress meter
    if (itemsSubtotal >= freeDeliveryThreshold) {
      progressText.innerHTML = `🎉 You get <strong>FREE delivery</strong>!`;
      progressBar.style.width = '100%';
      progressBar.style.background = '#00E676';
    } else {
      const remaining = freeDeliveryThreshold - itemsSubtotal;
      const percent = (itemsSubtotal / freeDeliveryThreshold) * 100;
      progressText.innerHTML = `Add items worth <strong>₹${remaining}</strong> more for <strong>FREE Delivery</strong>`;
      progressBar.style.width = `${percent}%`;
      progressBar.style.background = '#F9E300';
    }
  }
}

// Order Checkout - Simulated Drone Delivery Screen
function startOrderCheckout() {
  // Close cart drawer
  toggleCart();
  
  // Show tracking overlay
  trackerPortal.classList.add('open');
  
  // Reset tracking components
  trackerTimer.textContent = '10:00';
  closeTrackerBtn.disabled = true;
  closeTrackerBtn.textContent = 'Drone En-Route...';
  
  // Update Rider Google Maps URL with current location coordinates
  if (deliveryGoogleMapsLink) {
    deliveryGoogleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${currentCoordinates.lat},${currentCoordinates.lon}`;
  }
  
  // Render clean status timeline
  const statuses = [
    { label: 'Order Confirmed', time: 'Just now', icon: '📝', done: true },
    { label: 'Packing Gamer Gear', time: 'In progress', icon: '📦', current: true },
    { label: 'Drone Dispatched', time: 'Waiting...', icon: '🛸' },
    { label: 'Out for Delivery', time: 'Waiting...', icon: '⚡' },
    { label: 'Arrived at Gaming Den', time: 'Waiting...', icon: '🎮' }
  ];
  
  renderTimeline(statuses);
  
  // Reset drone animation position
  droneIcon.style.left = '10%';
  droneIcon.style.top = '70%';
  
  // Launch Delivery Progress Simulator
  runDeliverySimulation();
}

// Render Status Checkpoints
function renderTimeline(stages) {
  trackerStatusList.innerHTML = '';
  stages.forEach(stage => {
    const item = document.createElement('div');
    item.className = `status-item ${stage.done ? 'completed' : ''} ${stage.current ? 'current' : ''}`;
    item.innerHTML = `
      <div class="status-icon-wrap">${stage.icon}</div>
      <div class="status-details">
        <h4 class="status-label">${stage.label}</h4>
        <span class="status-time">${stage.time}</span>
      </div>
    `;
    trackerStatusList.appendChild(item);
  });
}

// Run simulated timeline, time tick down, and move drone
function runDeliverySimulation() {
  let elapsedSec = 0;
  let remainingMinutes = 10;
  let remainingSeconds = 0;
  
  // Fast forwarding timers: 10 mins down to 0 in 15 seconds
  const timerInterval = setInterval(() => {
    // Calculate simulated remaining time
    let totalSimulatedSec = 600 - (elapsedSec * (600 / 15));
    if (totalSimulatedSec < 0) totalSimulatedSec = 0;
    
    const displayMin = Math.floor(totalSimulatedSec / 60);
    const displaySec = Math.floor(totalSimulatedSec % 60);
    
    trackerTimer.textContent = `${displayMin.toString().padStart(2, '0')}:${displaySec.toString().padStart(2, '0')}`;
    
    // Update drone flight coordinates
    const progressPercent = elapsedSec / 15;
    // Simple path: fly from lower-left (Hub) to upper-right (Den)
    const startX = 15; // %
    const startY = 70; // %
    const endX = 80;   // %
    const endY = 20;   // %
    
    const currX = startX + (endX - startX) * progressPercent;
    const currY = startY + (endY - startY) * progressPercent;
    
    droneIcon.style.left = `${currX}%`;
    droneIcon.style.top = `${currY}%`;
    
    elapsedSec += 0.1;
    if (elapsedSec >= 15) {
      clearInterval(timerInterval);
    }
  }, 100);

  // Status updates timeline sequence
  // Total duration: 15 seconds
  setTimeout(() => {
    // Packing Complete -> Dispatching
    renderTimeline([
      { label: 'Order Confirmed', time: '0 sec ago', icon: '📝', done: true },
      { label: 'Gamer Gear Packed', time: 'Just now', icon: '📦', done: true },
      { label: 'Drone Dispatched', time: 'In progress', icon: '🛸', current: true },
      { label: 'Out for Delivery', time: 'Waiting...', icon: '⚡' },
      { label: 'Arrived at Gaming Den', time: 'Waiting...', icon: '🎮' }
    ]);
  }, 3000);

  setTimeout(() => {
    // Dispatched -> Out for delivery
    renderTimeline([
      { label: 'Order Confirmed', time: '6 sec ago', icon: '📝', done: true },
      { label: 'Gamer Gear Packed', time: '3 sec ago', icon: '📦', done: true },
      { label: 'Drone Dispatched', time: 'Just now', icon: '🛸', done: true },
      { label: 'Out for Delivery (Ranjan Drone-X1)', time: 'In progress', icon: '⚡', current: true },
      { label: 'Arrived at Gaming Den', time: 'Waiting...', icon: '🎮' }
    ]);
  }, 6000);

  setTimeout(() => {
    // Almost there
    renderTimeline([
      { label: 'Order Confirmed', time: '10 sec ago', icon: '📝', done: true },
      { label: 'Gamer Gear Packed', time: '7 sec ago', icon: '📦', done: true },
      { label: 'Drone Dispatched', time: '4 sec ago', icon: '🛸', done: true },
      { label: 'Out for Delivery (Ranjan Drone-X1)', time: 'Descending...', icon: '⚡', current: true },
      { label: 'Arrived at Gaming Den', time: 'Almost there', icon: '🎮' }
    ]);
  }, 11000);

  setTimeout(() => {
    // Delivered!
    renderTimeline([
      { label: 'Order Confirmed', time: '15 sec ago', icon: '📝', done: true },
      { label: 'Gamer Gear Packed', time: '12 sec ago', icon: '📦', done: true },
      { label: 'Drone Dispatched', time: '9 sec ago', icon: '🛸', done: true },
      { label: 'Out for Delivery', time: '5 sec ago', icon: '⚡', done: true },
      { label: 'Arrived at Gaming Den 🎉', time: 'Delivered', icon: '🎮', done: true }
    ]);
    
    // Clear local cart
    cart = {};
    updateCartUI();
    renderProducts();
    
    // Enable completion button
    closeTrackerBtn.disabled = false;
    closeTrackerBtn.textContent = 'Received! Back to Shop';
    closeTrackerBtn.classList.add('ready');
  }, 15000);
}

// Close Tracker
function closeTracker() {
  trackerPortal.classList.remove('open');
}

// Toggle Location Selector Modal
function toggleLocationModal() {
  locationModal.classList.toggle('open');
  locationModalOverlay.classList.toggle('open');
  
  if (locationModal.classList.contains('open')) {
    initLeafletMap();
  }
}

// Initialize Leaflet Map inside location modal
function initLeafletMap() {
  // If map is already initialized, just update view and invalidate size
  if (leafletMap) {
    leafletMap.setView([currentCoordinates.lat, currentCoordinates.lon], 15);
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 100);
    return;
  }
  
  // Create map instance
  leafletMap = L.map('location-map', {
    zoomControl: false // Keep interface clean, user can pinch/scroll to zoom
  }).setView([currentCoordinates.lat, currentCoordinates.lon], 15);
  
  // Add dark themed CartoDB tiles for premium gaming theme matching
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
  }).addTo(leafletMap);
  
  // Perform initial geocoding
  reverseGeocodeCoords(currentCoordinates.lat, currentCoordinates.lon);
  
  // Update address and coordinates whenever user pans the map
  leafletMap.on('moveend', () => {
    const center = leafletMap.getCenter();
    reverseGeocodeCoords(center.lat, center.lng);
  });
}

// Reverse Geocode Map Center Coordinates using OpenStreetMap Nominatim API
let reverseGeocodeTimeout = null;
function reverseGeocodeCoords(lat, lon) {
  if (liveMapAddress) liveMapAddress.textContent = 'Scanning location coordinates...';
  
  // Update current coordinates state immediately
  currentCoordinates = { lat: lat, lon: lon };
  
  // Throttle API calls to stay within OpenStreetMap's usage policy (400ms throttle)
  clearTimeout(reverseGeocodeTimeout);
  reverseGeocodeTimeout = setTimeout(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`)
      .then(res => {
        if (!res.ok) throw new Error('Geocoding query failed');
        return res.json();
      })
      .then(data => {
        if (data && data.display_name) {
          const rawAddr = data.display_name;
          const addr = data.address;
          const street = addr.road || addr.suburb || addr.neighbourhood || '';
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state || '';
          
          let parsedAddress = '';
          if (street) parsedAddress += `${street}, `;
          if (city) parsedAddress += `${city}, `;
          if (state) parsedAddress += state;
          if (!parsedAddress) parsedAddress = rawAddr;
          
          if (liveMapAddress) liveMapAddress.textContent = parsedAddress;
          tempSelectedAddressText = parsedAddress;
        } else {
          throw new Error('Invalid format');
        }
      })
      .catch(err => {
        console.warn("Reverse geocode error:", err);
        const fallbackText = `📍 Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`;
        if (liveMapAddress) liveMapAddress.textContent = fallbackText;
        tempSelectedAddressText = fallbackText;
      });
  }, 400);
}

// Recenter Map to physical GPS coordinates (HTML5 Geolocation)
function recenterMapToGPS() {
  if (gpsRecenterBtn) {
    gpsRecenterBtn.disabled = true;
    gpsRecenterBtn.textContent = '🛰️ Tracking GPS coordinates...';
  }
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        currentCoordinates = { lat: lat, lon: lon };
        
        if (leafletMap) {
          leafletMap.setView([lat, lon], 16);
        }
        resetRecenterBtnText();
      },
      (error) => {
        // Fallback to IP lookup coordinates
        fetchIPLocationToRecenter();
      },
      { timeout: 5000 }
    );
  } else {
    fetchIPLocationToRecenter();
  }
}

// Fallback IP lookup when device GPS access is denied
function fetchIPLocationToRecenter() {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      if (data && data.latitude && data.longitude) {
        const lat = data.latitude;
        const lon = data.longitude;
        currentCoordinates = { lat: lat, lon: lon };
        if (leafletMap) leafletMap.setView([lat, lon], 15);
      }
      resetRecenterBtnText();
    })
    .catch(() => {
      fetch('https://freeipapi.com/api/json')
        .then(res => res.json())
        .then(data => {
          if (data && data.latitude && data.longitude) {
            const lat = data.latitude;
            const lon = data.longitude;
            currentCoordinates = { lat: lat, lon: lon };
            if (leafletMap) leafletMap.setView([lat, lon], 15);
          }
          resetRecenterBtnText();
        })
        .catch(() => {
          resetRecenterBtnText();
        });
    });
}

function resetRecenterBtnText() {
  if (gpsRecenterBtn) {
    gpsRecenterBtn.disabled = false;
    gpsRecenterBtn.textContent = '🎯 Recenter GPS Location';
  }
}

// Confirm Pin Location selected on Map
function confirmPinLocation() {
  if (!tempSelectedAddressText) {
    tempSelectedAddressText = `📍 Lat: ${currentCoordinates.lat.toFixed(4)}, Lng: ${currentCoordinates.lon.toFixed(4)}`;
  }
  
  currentLocationText.textContent = tempSelectedAddressText;
  
  // Show Google Maps verification link
  updateGoogleMapsVerifyLink(currentCoordinates.lat, currentCoordinates.lon);
  
  // Update tracking map destination point label
  const denLabel = document.querySelector('.den-point .point-label');
  if (denLabel) denLabel.textContent = 'Your Den';

  gpsStatusText.textContent = 'Location Confirmed!';
  setTimeout(() => {
    toggleLocationModal();
    gpsStatusText.textContent = 'Save this map position as your delivery den';
  }, 800);
}

// Save manually entered address
function saveManualAddress() {
  const address = manualAddressInput.value.trim();
  if (address) {
    currentLocationText.textContent = address;
    manualAddressInput.value = '';
    
    // Hide maps verification on manual inputs since coordinates aren't mapped
    if (googleMapsVerifyWrap) googleMapsVerifyWrap.style.display = 'none';
    toggleLocationModal();
  } else {
    manualAddressInput.focus();
  }
}

// Update Google Maps Verification URL
function updateGoogleMapsVerifyLink(lat, lon) {
  if (googleMapsVerifyWrap && verifyOnGoogleMaps) {
    verifyOnGoogleMaps.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    googleMapsVerifyWrap.style.display = 'flex';
  }
}

// Expose functions globally for inline HTML click actions
window.toggleLocationModal = toggleLocationModal;
window.confirmPinLocation = confirmPinLocation;
window.saveManualAddress = saveManualAddress;
window.recenterMapToGPS = recenterMapToGPS;

