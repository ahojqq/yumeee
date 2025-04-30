document.addEventListener('DOMContentLoaded', function() {

    // --- Utility funkce ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // --- Globální proměnné ---
    let cart = JSON.parse(sessionStorage.getItem('yumeCart')) || []; // Načíst košík ze session storage

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = $('#theme-toggle-button');
    const body = document.body;
    function setMode(mode) { if (mode === 'dark') { body.classList.add('dark-mode'); themeToggleButton.textContent = '☀️'; localStorage.setItem('theme', 'dark'); } else { body.classList.remove('dark-mode'); themeToggleButton.textContent = '🌙'; localStorage.setItem('theme', 'light'); } }
    const currentTheme = localStorage.getItem('theme'); setMode(currentTheme === 'dark' ? 'dark' : 'light');
    themeToggleButton.addEventListener('click', () => setMode(body.classList.contains('dark-mode') ? 'light' : 'dark'));

    // --- SPA Navigace ---
    const navLinks = $$('.nav-link'); const sections = $$('.section');
    function showSection(targetId) { let sectionShown = false; sections.forEach(section => { const isTarget = section.id === targetId.substring(1); section.classList.toggle('active-section', isTarget); if (isTarget) sectionShown = true; }); if (!sectionShown) { $('#home').classList.add('active-section'); targetId = '#home'; } if (targetId !== '#home') window.scrollTo(0, 0); navLinks.forEach(link => link.classList.toggle('active-nav', link.getAttribute('href') === targetId)); }
    navLinks.forEach(link => { link.addEventListener('click', function(event) { const targetId = this.getAttribute('href'); if (targetId && targetId.startsWith('#')) { event.preventDefault(); showSection(targetId); } }); });
    showSection('#home');

    // --- Login/Register Dropdown ---
    const loginRegisterBtn = $('#login-register-btn'); const loginDropdown = $('#login-dropdown');
    if (loginRegisterBtn && loginDropdown) { loginRegisterBtn.addEventListener('click', (e) => { e.stopPropagation(); loginDropdown.classList.toggle('hidden'); }); document.addEventListener('click', (e) => { if (!loginDropdown.contains(e.target) && e.target !== loginRegisterBtn && !loginRegisterBtn.contains(e.target)) { loginDropdown.classList.add('hidden'); } }); }
    const tabButtons = $$('#login-dropdown .tab-btn'); const tabContents = $$('#login-dropdown .tab-content'); tabButtons.forEach(button => { button.addEventListener('click', () => { const targetTab = button.getAttribute('data-tab'); tabButtons.forEach(btn => btn.classList.toggle('active', btn === button)); tabContents.forEach(content => { content.classList.toggle('active', content.id === `${targetTab}-tab`); }); }); });
    const loginForm = $('#login-form'); const registerForm = $('#register-form'); if(loginForm) { loginForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Pokus o přihlášení...\n(Backend není implementován.)'); loginDropdown.classList.add('hidden'); }); } if(registerForm) { registerForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Pokus o registraci...\n(Backend není implementován.)'); loginDropdown.classList.add('hidden'); }); }

    // --- Modální Okna (Výherní a Košík) ---
    const modalOverlay = $('#modal-overlay'); const allModals = $$('.modal'); const prizePopup = $('#prize-popup'); const prizePopupText = $('#prize-popup-text'); const prizePopupInfo = $('#prize-popup-info'); const prizePopupEmoji = $('.prize-emoji-big'); const prizePopupCloseBtns = $$('#prize-popup .close-modal-btn, #prize-popup .close-modal-btn-bottom'); const cartModal = $('#cart-modal'); const cartBtn = $('#cart-btn'); const cartModalCloseBtn = $('#cart-modal .close-modal-btn');
    function openModal(modalElement) { if (!modalElement) return; closeAllModals(); modalOverlay.classList.remove('hidden'); modalElement.classList.remove('hidden'); body.style.overflow = 'hidden'; if(modalElement.id === 'cart-modal') { renderCartItems(); } }
    function closeModal() { modalOverlay.classList.add('hidden'); allModals.forEach(modal => modal.classList.add('hidden')); body.style.overflow = ''; }
    function closeAllModals() { modalOverlay.classList.add('hidden'); allModals.forEach(modal => modal.classList.add('hidden')); body.style.overflow = ''; }
    modalOverlay.addEventListener('click', closeModal); $$('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal)); prizePopupCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));
    if(cartBtn && cartModal) { cartBtn.addEventListener('click', () => openModal(cartModal)); }

    // --- Newsletter Pop-up v rohu ---
    const newsletterPopup = $('#newsletter-popup');
    const newsletterPopupShownSession = sessionStorage.getItem('newsletterPopupShown');
     if (!newsletterPopupShownSession && newsletterPopup) { // Zobrazit jen jednou za session
        const newsletterPopupTimer = setTimeout(() => {
             newsletterPopup.classList.remove('hidden');
             sessionStorage.setItem('newsletterPopupShown', 'true');
        }, 7000); // 7 sekund
     }
     // Zavření newsletter pop-upu
     const closeNewsletterBtn = $('#newsletter-popup .close-corner-popup-btn');
     if(closeNewsletterBtn && newsletterPopup) {
         closeNewsletterBtn.addEventListener('click', () => newsletterPopup.classList.add('hidden'));
     }
     // Odeslání newsletter pop-upu
     const popupNewsletterForm = $('#popup-newsletter-form');
     if(popupNewsletterForm && newsletterPopup) {
         popupNewsletterForm.addEventListener('submit', (e) => { e.preventDefault(); const email = popupNewsletterForm.querySelector('input[type="email"]').value; alert(`Děkujeme za přihlášení: ${email}\n(Backend není implementován.)`); popupNewsletterForm.reset(); newsletterPopup.classList.add('hidden'); });
     }

    // --- Nákupní Košík Logic ---
    const cartCountElement = $('#cart-count'); const cartItemsContainer = $('#cart-items-container'); const cartTotalElement = $('#cart-total'); const checkoutBtn = $('#checkout-btn'); const emptyCartMessage = $('.empty-cart-message');
    function saveCart() { sessionStorage.setItem('yumeCart', JSON.stringify(cart)); }
    function updateCartIcon() { const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); if (cartCountElement) { cartCountElement.textContent = totalItems; cartCountElement.classList.toggle('hidden', totalItems === 0); if (totalItems > 0 && !cartCountElement.classList.contains('updated')) { cartCountElement.classList.add('updated'); setTimeout(() => cartCountElement.classList.remove('updated'), 300); } } }
    function formatPrice(price) { return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(price); }

    function addToCart(productId, productName, productPrice, productImage, selectedSize) {
        // Unikátní ID pro položku v košíku kombinující ID produktu a velikost
        const cartItemId = `${productId}-${selectedSize}`;
        const existingItemIndex = cart.findIndex(item => item.cartId === cartItemId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity++;
        } else {
            cart.push({
                cartId: cartItemId, // Unikátní ID pro košík
                id: productId,      // Původní ID produktu
                name: productName,
                price: parseFloat(productPrice),
                image: productImage,
                size: selectedSize, // Uložit velikost
                quantity: 1
            });
        }
        saveCart();
        updateCartIcon();
        const button = $(`[data-product-id="${productId}"] .add-to-cart-btn`);
        if (button) { button.textContent = 'Přidáno ✓'; button.classList.add('added'); button.disabled = true; setTimeout(() => { button.textContent = 'Do košíku'; button.classList.remove('added'); button.disabled = false; $(`[data-product-id="${productId}"] .size-select`).value = ""; /* Reset selectu a disable tlacitka */ button.disabled = true; }, 1500); }
    }

    function updateQuantity(cartItemId, newQuantity) {
        const itemIndex = cart.findIndex(item => item.cartId === cartItemId);
        if (itemIndex > -1) { cart[itemIndex].quantity = Math.max(1, newQuantity); saveCart(); updateCartIcon(); renderCartItems(); }
    }

    function removeFromCart(cartItemId) {
        cart = cart.filter(item => item.cartId !== cartItemId); saveCart(); updateCartIcon(); renderCartItems();
    }

    function renderCartItems() {
        if (!cartItemsContainer || !cartTotalElement || !checkoutBtn || !emptyCartMessage) return;
        cartItemsContainer.innerHTML = ''; let total = 0;
        if (cart.length === 0) { emptyCartMessage.classList.remove('hidden'); checkoutBtn.disabled = true; }
        else {
            emptyCartMessage.classList.add('hidden');
            cart.forEach(item => {
                total += item.price * item.quantity;
                const itemElement = document.createElement('div'); itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="cart-item-image"><img src="${item.image}" alt="${item.name}" /></div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">${formatPrice(item.price)} / ks</p>
                        <p class="cart-item-size">Velikost: ${item.size || 'Nespecifikována'}</p> <!-- Zobrazit velikost -->
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" data-cart-id="${item.cartId}" data-change="-1">-</button>
                        <input type="number" value="${item.quantity}" min="1" data-cart-id="${item.cartId}" class="quantity-input" aria-label="Množství"/>
                        <button class="quantity-btn" data-cart-id="${item.cartId}" data-change="1">+</button>
                    </div>
                    <button class="cart-item-remove-btn" title="Odstranit" data-cart-id="${item.cartId}">×</button>`;
                cartItemsContainer.appendChild(itemElement);
            });
            checkoutBtn.disabled = false;
        }
        cartTotalElement.textContent = formatPrice(total);
        // Přidat listenery pro nově vytvořené prvky košíku (použít data-cart-id)
        $$('.quantity-btn').forEach(btn => { btn.replaceWith(btn.cloneNode(true)); /* Odstraní staré listenery */ }); // Re-attach listeners workaround
        $$('.quantity-input').forEach(input => { input.replaceWith(input.cloneNode(true)); });
        $$('.cart-item-remove-btn').forEach(btn => { btn.replaceWith(btn.cloneNode(true)); });

        $$('.quantity-btn').forEach(btn => { btn.addEventListener('click', () => { const id = btn.getAttribute('data-cart-id'); const change = parseInt(btn.getAttribute('data-change')); const item = cart.find(i => i.cartId === id); if (item) updateQuantity(id, item.quantity + change); }); });
        $$('.quantity-input').forEach(input => { input.addEventListener('change', () => { const id = input.getAttribute('data-cart-id'); const newQuantity = parseInt(input.value); updateQuantity(id, newQuantity); }); });
        $$('.cart-item-remove-btn').forEach(btn => { btn.addEventListener('click', () => { if (confirm('Opravdu odstranit?')) { const id = btn.getAttribute('data-cart-id'); removeFromCart(id); } }); });
    }

    // Listener pro výběr velikosti
    $$('.size-select').forEach(select => {
        select.addEventListener('change', function() {
            const productItem = this.closest('.product-item');
            const addToCartBtn = productItem.querySelector('.add-to-cart-btn');
            if (this.value) { // Pokud je vybrána platná velikost (ne prázdná)
                addToCartBtn.disabled = false;
            } else {
                addToCartBtn.disabled = true;
            }
        });
    });

    // Listener pro tlačítka "Do košíku" na produktech
    $$('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productElement = this.closest('.product-item');
            const sizeSelect = productElement.querySelector('.size-select');
            if (productElement && sizeSelect && sizeSelect.value) { // Musí být vybrána velikost
                const id = productElement.getAttribute('data-product-id');
                const name = productElement.getAttribute('data-product-name');
                const price = productElement.getAttribute('data-product-price');
                const image = productElement.getAttribute('data-product-image');
                const size = sizeSelect.value;
                addToCart(id, name, price, image, size);
            } else if (sizeSelect && !sizeSelect.value) {
                alert('Prosím, vyberte velikost.');
                sizeSelect.focus();
            }
        });
    });

    // Listener pro tlačítko Checkout (simulace)
    if(checkoutBtn) { checkoutBtn.addEventListener('click', () => { if (cart.length > 0) { alert('Pokračujete k pokladně...\n(Toto je pouze simulace.)'); closeModal(); } }); }

    // --- Kolotoč Štěstí ---
    const wheelSpinner = $('#wheel-spinner'); const spinButton = $('#spin-button'); const resultDisplay = $('#result-display'); const wheelSpinSound = $('#wheel-spin-sound');
    const prizes = [ { text: '🏷️ Sleva 15%', info: 'Použijte kód YUME15 při placení!' }, { text: '🚚 Doprava Zdarma', info: 'Automaticky aplikováno.' }, { text: '🎁 YUME Nálepka Pack', info: 'Přidáme zdarma k objednávce.' }, { text: '🏷️ Sleva 5%', info: 'Použijte kód YUME5!' }, { text: '😞 Nic (Zkus to zítra!)', info: '' }, { text: '🌟 Exkluzivní Přístup', info: 'Odešleme vám e-mail.' }, { text: '🎁 YUME Klíčenka', info: 'Přidáme zdarma k objednávce.' }, { text: '🏷️ Sleva 10%', info: 'Použijte kód YUME10!' }, { text: '✨ Malé Překvapení', info: 'Nechte se překvapit!' }, { text: '😞 Nic (Více štěstí příště!)', info: '' } ];
    const numberOfSegments = prizes.length; const segmentAngle = 360 / numberOfSegments; let isSpinning = false; let currentRotation = 0;
    if (spinButton && wheelSpinner && resultDisplay && numberOfSegments > 0) {
        spinButton.addEventListener('click', () => {
            if (isSpinning) return; isSpinning = true; spinButton.disabled = true; resultDisplay.innerHTML = 'Točí se...';
            if (wheelSpinSound && typeof wheelSpinSound.play === 'function') { try { wheelSpinSound.pause(); wheelSpinSound.currentTime = 0; wheelSpinSound.play().catch(e => console.warn("Audio Playback Warning:", e)); } catch(e) { console.warn("Audio Error:", e); }}
            wheelSpinner.style.transition = 'none'; wheelSpinner.style.transform = `rotate(${currentRotation}deg)`; wheelSpinner.offsetHeight;
            const winningSegmentIndex = Math.floor(Math.random() * numberOfSegments); const randomFullSpins = Math.floor(Math.random() * 4) + 6; const angleToCenter = (winningSegmentIndex * segmentAngle) + (segmentAngle / 2); const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7; const targetAngleDelta = (360 * randomFullSpins) + angleToCenter + randomOffset; const finalRotation = currentRotation - targetAngleDelta;
            wheelSpinner.style.transition = 'transform 6s cubic-bezier(0.34, 1.56, 0.64, 1)'; wheelSpinner.style.transform = `rotate(${finalRotation}deg)`; currentRotation = finalRotation % 360;
            setTimeout(() => {
                isSpinning = false; spinButton.disabled = false; const actualPrize = prizes[winningSegmentIndex];
                resultDisplay.innerHTML = actualPrize.text;
                if (!actualPrize.text.toLowerCase().includes('nic')) {
                    openModal(prizePopup); // Použít generickou funkci pro otevření modalu
                    // Naplnit specifická data pro výherní modal
                    if(prizePopupText) prizePopupText.innerHTML = actualPrize.text;
                    if(prizePopupInfo) prizePopupInfo.textContent = actualPrize.info;
                    if(prizePopupEmoji) { if (actualPrize.text.includes('Sleva')) prizePopupEmoji.textContent = '🏷️'; else if (actualPrize.text.includes('Doprava')) prizePopupEmoji.textContent = '🚚'; else if (actualPrize.text.includes('Nálepka') || actualPrize.text.includes('Klíčenka')) prizePopupEmoji.textContent = '🎁'; else prizePopupEmoji.textContent = '🎉'; }
                    triggerConfetti();
                 }
            }, 6100);
        });
    }

    // --- Konfety ---
    const confettiContainer = $('#confetti-container'); function triggerConfetti() { /* ... kód ... */ if (!confettiContainer) return; const confettiCount = 80; const colors = ['var(--primary-color)', 'var(--accent-color)', '#AAAAAA', '#CCCCCC']; confettiContainer.innerHTML = ''; for (let i = 0; i < confettiCount; i++) { const confetti = document.createElement('div'); confetti.classList.add('confetti'); if (Math.random() > 0.5) { confetti.classList.add('rectangle'); confetti.style.width = (Math.random() * 8 + 6) + 'px'; confetti.style.height = (Math.random() * 10 + 10) + 'px'; } else { confetti.classList.add('circle'); const size = (Math.random() * 6 + 8) + 'px'; confetti.style.width = size; confetti.style.height = size; } confetti.style.left = Math.random() * 100 + 'vw'; confetti.style.top = -Math.random() * 30 + 'vh'; confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; confetti.style.opacity = Math.random() * 0.5 + 0.5; const duration = (Math.random() * 3 + 2.5) + 's'; const delay = Math.random() * 1.5 + 's'; const rotateEnd = (Math.random() * 720 - 360) + 'deg'; confetti.style.setProperty('--fall-duration', duration); confetti.style.setProperty('--fall-delay', delay); confetti.style.setProperty('--rotate-end', rotateEnd); confettiContainer.appendChild(confetti); setTimeout(() => { if (confetti.parentNode === confettiContainer) confettiContainer.removeChild(confetti); }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 100); } }

    // --- Zpracování Formulářů ---
    function handleFormSubmit(formId, message) { const form = $(`#${formId}`); if (form) { form.addEventListener('submit', function(event) { event.preventDefault(); alert(message + '\n(Backend není implementován.)'); form.reset(); }); } }
    handleFormSubmit('contact-form', 'Děkujeme za Vaši zprávu!');
    handleFormSubmit('newsletter-form', 'Děkujeme za přihlášení k odběru!');

    // --- Scroll Animace ---
    const animatedElements = $$('.product-item, .timeline-event'); const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 }; const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { if (entry.target.classList.contains('timeline-event')) { entry.target.classList.add('is-visible'); } else { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } observer.unobserve(entry.target); } }); }; const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); animatedElements.forEach(el => { if (!el.classList.contains('timeline-event')) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s 0.2s ease-out, transform 0.6s 0.2s ease-out'; } intersectionObserver.observe(el); });

    // --- Datum, Čas, Měsíc v Headeru ---
    const dateTimeDisplay = $('#date-time-display'); const moonPhaseDisplay = $('#moon-phase-display');
    function updateDateTime() { const now = new Date(); const optionsDate = { year: 'numeric', month: 'numeric', day: 'numeric' }; const optionsTime = { hour: '2-digit', minute: '2-digit' }; const formattedDate = now.toLocaleDateString('cs-CZ', optionsDate); const formattedTime = now.toLocaleTimeString('cs-CZ', optionsTime); if (dateTimeDisplay) { dateTimeDisplay.textContent = `${formattedDate}, ${formattedTime}`; } }
    function getMoonPhase(date = new Date()) { const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)); const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / 86400000; const synodicMonths = daysSinceKnownNewMoon / 29.53058867; const phase = (synodicMonths - Math.floor(synodicMonths)); let phaseEmoji = "❓"; if (phase < 0.03 || phase > 0.97) { phaseEmoji = "🌑"; } else if (phase < 0.22) { phaseEmoji = "🌒"; } else if (phase < 0.28) { phaseEmoji = "🌓"; } else if (phase < 0.47) { phaseEmoji = "🌔"; } else if (phase < 0.53) { phaseEmoji = "🌕"; } else if (phase < 0.72) { phaseEmoji = "🌖"; } else if (phase < 0.78) { phaseEmoji = "🌗"; } else { phaseEmoji = "🌘"; } return { emoji: phaseEmoji, value: phase }; }
    if (moonPhaseDisplay) { const moon = getMoonPhase(); moonPhaseDisplay.textContent = moon.emoji; moonPhaseDisplay.title = `Fáze měsíce (${moon.value.toFixed(2)})`; }
    updateDateTime(); setInterval(updateDateTime, 60000);

    // --- Aktuální rok ve Footeru ---
    const yearSpan = $('#current-year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Placeholder pro Šachy ---
    const claimRewardBtn = $('#claim-reward-btn'); function handleChessWin() { alert("Gratulujeme! Kód: YUMECHESS15"); if(claimRewardBtn) { claimRewardBtn.classList.remove('hidden'); claimRewardBtn.disabled = false; } }

    // --- Efekt Sněžení ---
    function createSnowflakes() { const snowContainer = $('#snow-container'); if (!snowContainer) return; const numberOfFlakes = 30; for (let i = 0; i < numberOfFlakes; i++) { const flake = document.createElement('div'); flake.classList.add('snowflake'); const size = Math.random() * 2.5 + 1; flake.style.width = `${size}px`; flake.style.height = `${size}px`; const startLeft = Math.random() * 100; const endLeftDelta = (Math.random() - 0.5) * 20; const duration = Math.random() * 12 + 15; const delay = Math.random() * 15; flake.style.left = `${startLeft}vw`; flake.style.setProperty('--left-ini', `${startLeft}vw`); flake.style.setProperty('--left-end', `${startLeft + endLeftDelta}vw`); flake.style.animationDuration = `${duration}s`; flake.style.animationDelay = `-${delay}s`; snowContainer.appendChild(flake); } } createSnowflakes();

    // --- Inicializace po načtení ---
    updateCartIcon(); // Zobrazit správný počet položek v košíku při startu

}); // Konec DOMContentLoaded
