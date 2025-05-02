document.addEventListener('DOMContentLoaded', function() {

    // --- Utility funkce ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // --- Globální proměnné ---
    let cart = JSON.parse(sessionStorage.getItem('yumeCart')) || [];

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = $('#theme-toggle-button');
    const body = document.body;
    function setMode(mode) { if (mode === 'dark') { body.classList.add('dark-mode'); themeToggleButton.textContent = '☀️'; localStorage.setItem('theme', 'dark'); } else { body.classList.remove('dark-mode'); themeToggleButton.textContent = '🌙'; localStorage.setItem('theme', 'light'); } }
    const currentTheme = localStorage.getItem('theme'); setMode(currentTheme === 'dark' ? 'dark' : 'light');
    if(themeToggleButton) { themeToggleButton.addEventListener('click', () => setMode(body.classList.contains('dark-mode') ? 'light' : 'dark')); }

    // --- SPA Navigace ---
    const navLinks = $$('.nav-link'); const sections = $$('.section');
    function showSection(targetId) { let sectionShown = false; sections.forEach(section => { const isTarget = section && targetId && section.id === targetId.substring(1); section.classList.toggle('active-section', isTarget); if (isTarget) sectionShown = true; }); if (!sectionShown) { const homeSection = $('#home'); if (homeSection) { homeSection.classList.add('active-section'); targetId = '#home'; } } if (targetId !== '#home') window.scrollTo(0, 0); navLinks.forEach(link => link.classList.toggle('active-nav', link.getAttribute('href') === targetId)); }
    navLinks.forEach(link => { link.addEventListener('click', function(event) { const targetId = this.getAttribute('href'); if (targetId && targetId.startsWith('#')) { event.preventDefault(); showSection(targetId); } }); });
    showSection('#home');

    // --- Login/Register Dropdown ---
    const loginRegisterBtn = $('#login-register-btn'); const loginDropdown = $('#login-dropdown');
    if (loginRegisterBtn && loginDropdown) {
        loginRegisterBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Zabrání okamžitému zavření
            loginDropdown.classList.toggle('hidden');
            // Zavřít ostatní popupy/modaly, pokud jsou otevřené
            closeModal(); // Zavře modály
            const newsletterPopup = $('#newsletter-popup'); if(newsletterPopup) newsletterPopup.classList.add('hidden'); // Zavře newsletter
        });
        // Zavření kliknutím mimo
        document.addEventListener('click', (e) => {
            if (!loginDropdown.classList.contains('hidden') && !loginDropdown.contains(e.target) && e.target !== loginRegisterBtn && !loginRegisterBtn.contains(e.target)) {
                loginDropdown.classList.add('hidden');
            }
        });
    }
    // Přepínání tabů v dropdownu
    const tabButtons = $$('#login-dropdown .tab-btn'); const tabContents = $$('#login-dropdown .tab-content');
    tabButtons.forEach(button => { button.addEventListener('click', () => { const targetTab = button.getAttribute('data-tab'); tabButtons.forEach(btn => btn.classList.toggle('active', btn === button)); tabContents.forEach(content => { content.classList.toggle('active', content.id === `${targetTab}-tab`); }); }); });
    // Formuláře v dropdownu (ukázka)
    const loginForm = $('#login-form'); const registerForm = $('#register-form');
    if(loginForm) { loginForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Pokus o přihlášení...\n(Backend není implementován.)'); loginDropdown.classList.add('hidden'); }); }
    if(registerForm) { registerForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Pokus o registraci...\n(Backend není implementován.)'); loginDropdown.classList.add('hidden'); }); }

    // --- Modální Okna (Výherní a Košík) ---
    const modalOverlay = $('#modal-overlay'); const allModals = $$('.modal'); const prizePopup = $('#prize-popup'); const prizePopupText = $('#prize-popup-text'); const prizePopupInfo = $('#prize-popup-info'); const prizePopupEmoji = $('.prize-emoji-big'); const prizePopupCloseBtns = $$('#prize-popup .close-modal-btn, #prize-popup .close-modal-btn-bottom'); const cartModal = $('#cart-modal'); const cartBtn = $('#cart-btn');
    function openModal(modalElement) { if (!modalElement) return; closeAllModals(); const loginDropdown = $('#login-dropdown'); if(loginDropdown) loginDropdown.classList.add('hidden'); const newsletterPopup = $('#newsletter-popup'); if(newsletterPopup) newsletterPopup.classList.add('hidden'); modalOverlay.classList.remove('hidden'); modalElement.classList.remove('hidden'); body.style.overflow = 'hidden'; if(modalElement.id === 'cart-modal') { renderCartItems(); } if(modalElement.id === 'prize-popup') { triggerConfetti(); } }
    function closeModal() { modalOverlay.classList.add('hidden'); allModals.forEach(modal => modal.classList.add('hidden')); body.style.overflow = ''; }
    function closeAllModals() { modalOverlay.classList.add('hidden'); allModals.forEach(modal => modal.classList.add('hidden')); body.style.overflow = ''; }
    if(modalOverlay) modalOverlay.addEventListener('click', closeModal);
    $$('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal)); prizePopupCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));
    if(cartBtn && cartModal) { cartBtn.addEventListener('click', () => openModal(cartModal)); }

    // --- Newsletter Pop-up v rohu ---
    const newsletterPopup = $('#newsletter-popup');
    if (newsletterPopup) {
        const newsletterPopupShownSession = sessionStorage.getItem('newsletterPopupShown');
         if (!newsletterPopupShownSession) {
            const newsletterPopupTimer = setTimeout(() => {
                const isAnyModalOpen = $$('.modal:not(.hidden)').length > 0;
                const isLoginDropdownOpen = loginDropdown && !loginDropdown.classList.contains('hidden');
                if(!isAnyModalOpen && !isLoginDropdownOpen) { newsletterPopup.classList.remove('hidden'); sessionStorage.setItem('newsletterPopupShown', 'true'); }
            }, 7000);
         }
         const closeNewsletterBtn = $('#newsletter-popup .close-corner-popup-btn');
         if(closeNewsletterBtn) { closeNewsletterBtn.addEventListener('click', () => newsletterPopup.classList.add('hidden')); }
         const popupNewsletterForm = $('#popup-newsletter-form');
         if(popupNewsletterForm) { popupNewsletterForm.addEventListener('submit', (e) => { e.preventDefault(); const emailInput = popupNewsletterForm.querySelector('input[type="email"]'); if(emailInput){ alert(`Děkujeme za přihlášení: ${emailInput.value}\n(Backend není implementován.)`);} popupNewsletterForm.reset(); newsletterPopup.classList.add('hidden'); });}
     }

    // --- Nákupní Košík Logic ---
    const cartCountElement = $('#cart-count'); 
    let cartItemsContainer = $('#cart-items-container'); 
    const cartTotalElement = $('#cart-total'); 
    const checkoutBtn = $('#checkout-btn'); 
    const emptyCartMessage = $('.empty-cart-message');
    function saveCart() { sessionStorage.setItem('yumeCart', JSON.stringify(cart)); }
    function updateCartIcon() { const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); if (cartCountElement) { cartCountElement.textContent = totalItems; cartCountElement.classList.toggle('hidden', totalItems === 0); if (totalItems > 0 && !cartCountElement.classList.contains('updated')) { cartCountElement.classList.add('updated'); setTimeout(() => cartCountElement.classList.remove('updated'), 300); } } }
    function formatPrice(price) { return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(price); }
    function addToCart(productId, productName, productPrice, productImage, selectedSize) { const cartItemId = `${productId}-${selectedSize}`; const existingItemIndex = cart.findIndex(item => item.cartId === cartItemId); if (existingItemIndex > -1) { cart[existingItemIndex].quantity++; } else { cart.push({ cartId: cartItemId, id: productId, name: productName, price: parseFloat(productPrice), image: productImage, size: selectedSize, quantity: 1 }); } saveCart(); updateCartIcon(); const button = $(`[data-product-id="${productId}"] .add-to-cart-btn`); if (button) { button.textContent = 'Přidáno ✓'; button.classList.add('added'); button.disabled = true; setTimeout(() => { button.textContent = 'Do košíku'; button.classList.remove('added'); const sizeSelect = $(`[data-product-id="${productId}"] .size-select`); if(sizeSelect) sizeSelect.value = ""; button.disabled = true; }, 1500); } }
    function updateQuantity(cartItemId, newQuantity) { const itemIndex = cart.findIndex(item => item.cartId === cartItemId); if (itemIndex > -1) { cart[itemIndex].quantity = Math.max(1, newQuantity); saveCart(); updateCartIcon(); renderCartItems(); } }
    function removeFromCart(cartItemId) { cart = cart.filter(item => item.cartId !== cartItemId); saveCart(); updateCartIcon(); renderCartItems(); }
    function renderCartItems() { if (!cartItemsContainer || !cartTotalElement || !checkoutBtn || !emptyCartMessage) return; cartItemsContainer.innerHTML = ''; let total = 0; if (cart.length === 0) { emptyCartMessage.classList.remove('hidden'); checkoutBtn.disabled = true; } else { emptyCartMessage.classList.add('hidden'); cart.forEach(item => { total += item.price * item.quantity; const itemElement = document.createElement('div'); itemElement.classList.add('cart-item'); itemElement.innerHTML = `<div class="cart-item-image"><img src="${item.image}" alt="${item.name}" /></div><div class="cart-item-details"><h4>${item.name}</h4><p class="cart-item-price">${formatPrice(item.price)} / ks</p><p class="cart-item-size">Velikost: ${item.size || 'N/A'}</p></div><div class="cart-item-controls"><button class="quantity-btn" data-cart-id="${item.cartId}" data-change="-1">-</button><input type="number" value="${item.quantity}" min="1" data-cart-id="${item.cartId}" class="quantity-input" aria-label="Množství"/><button class="quantity-btn" data-cart-id="${item.cartId}" data-change="1">+</button></div><button class="cart-item-remove-btn" title="Odstranit" data-cart-id="${item.cartId}">×</button>`; cartItemsContainer.appendChild(itemElement); }); checkoutBtn.disabled = false; } cartTotalElement.textContent = formatPrice(total); attachCartItemListeners(); }
    function attachCartItemListeners() { if(!cartItemsContainer) return; cartItemsContainer.replaceWith(cartItemsContainer.cloneNode(true)); cartItemsContainer = $('#cart-items-container'); cartItemsContainer.addEventListener('click', function(event) { const target = event.target; if (target.classList.contains('quantity-btn')) { const id = target.getAttribute('data-cart-id'); const change = parseInt(target.getAttribute('data-change')); const item = cart.find(i => i.cartId === id); if (item) updateQuantity(id, item.quantity + change); } if (target.classList.contains('cart-item-remove-btn')) { if (confirm('Opravdu odstranit?')) { const id = target.getAttribute('data-cart-id'); removeFromCart(id); } } }); cartItemsContainer.addEventListener('change', function(event) { const target = event.target; if (target.classList.contains('quantity-input')) { const id = target.getAttribute('data-cart-id'); let newQuantity = parseInt(target.value); if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1; target.value = newQuantity; updateQuantity(id, newQuantity); } }); }
    $$('.size-select').forEach(select => { select.addEventListener('change', function() { const productItem = this.closest('.product-item'); const addToCartBtn = productItem.querySelector('.add-to-cart-btn'); if(addToCartBtn) addToCartBtn.disabled = !this.value; }); });
    $$('.add-to-cart-btn').forEach(button => { button.addEventListener('click', function() { const productElement = this.closest('.product-item'); const sizeSelect = productElement.querySelector('.size-select'); if (productElement && sizeSelect && sizeSelect.value) { const id = productElement.getAttribute('data-product-id'); const name = productElement.getAttribute('data-product-name'); const price = productElement.getAttribute('data-product-price'); const image = productElement.querySelector('img')?.getAttribute('src') || 'images/placeholder.png'; const size = sizeSelect.value; addToCart(id, name, price, image, size); } else if (sizeSelect && !sizeSelect.value) { alert('Prosím, vyberte velikost.'); sizeSelect.focus(); } }); });
    if(checkoutBtn) { checkoutBtn.addEventListener('click', () => { if (cart.length > 0) { alert('Pokračujete k pokladně...\n(Toto je pouze simulace.)'); closeModal(); } }); }

     // --- Jednoduchá Slideshow (Opravena) ---
     const slides = $$('.slide'); const prevButton = $('.slide-prev'); const nextButton = $('.slide-next'); let currentSlide = 0; let slideInterval;
     function prevSlideHandler() { prevSlide(); stopSlideShow(); } function nextSlideHandler() { nextSlide(); stopSlideShow(); }
     if (slides.length > 0 && prevButton && nextButton) { const totalSlides = slides.length; function showSlide(index) { slides.forEach((s, i) => s.classList.toggle('active', i === index)); } function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; showSlide(currentSlide); } function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; showSlide(currentSlide); } function startSlideShow() { stopSlideShow(); slideInterval = setInterval(nextSlide, 5500); } function stopSlideShow() { clearInterval(slideInterval); } showSlide(currentSlide); prevButton.removeEventListener('click', prevSlideHandler); nextButton.removeEventListener('click', nextSlideHandler); prevButton.addEventListener('click', prevSlideHandler); nextButton.addEventListener('click', nextSlideHandler); const slideshowElement = $('.slideshow'); if (slideshowElement) { slideshowElement.removeEventListener('mouseenter', stopSlideShow); slideshowElement.removeEventListener('mouseleave', startSlideShow); slideshowElement.addEventListener('mouseenter', stopSlideShow); slideshowElement.addEventListener('mouseleave', startSlideShow); } startSlideShow(); } else { console.warn("Slideshow elements not found or incomplete."); }

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
            setTimeout(() => { isSpinning = false; spinButton.disabled = false; const actualPrize = prizes[winningSegmentIndex]; resultDisplay.innerHTML = actualPrize.text; if (!actualPrize.text.toLowerCase().includes('nic')) {
                 openModal(prizePopup); if(prizePopupText) prizePopupText.innerHTML = actualPrize.text; if(prizePopupInfo) prizePopupInfo.textContent = actualPrize.info; if(prizePopupEmoji) { if (actualPrize.text.includes('Sleva')) prizePopupEmoji.textContent = '🏷️'; else if (actualPrize.text.includes('Doprava')) prizePopupEmoji.textContent = '🚚'; else if (actualPrize.text.includes('Nálepka') || actualPrize.text.includes('Klíčenka')) prizePopupEmoji.textContent = '🎁'; else prizePopupEmoji.textContent = '🎉'; }
                 } }, 6100);
        });
    }

    // --- Konfety ---
    const confettiContainer = $('#confetti-container'); function triggerConfetti() { if (!confettiContainer) return; const confettiCount = 80; const colors = ['var(--primary-color)', 'var(--accent-color)', '#AAAAAA', '#CCCCCC']; confettiContainer.innerHTML = ''; for (let i = 0; i < confettiCount; i++) { const confetti = document.createElement('div'); confetti.classList.add('confetti'); if (Math.random() > 0.5) { confetti.classList.add('rectangle'); confetti.style.width = (Math.random() * 8 + 6) + 'px'; confetti.style.height = (Math.random() * 10 + 10) + 'px'; } else { confetti.classList.add('circle'); const size = (Math.random() * 6 + 8) + 'px'; confetti.style.width = size; confetti.style.height = size; } confetti.style.left = Math.random() * 100 + 'vw'; confetti.style.top = -Math.random() * 30 + 'vh'; confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; confetti.style.opacity = Math.random() * 0.5 + 0.5; const duration = (Math.random() * 3 + 2.5) + 's'; const delay = Math.random() * 1.5 + 's'; const rotateEnd = (Math.random() * 720 - 360) + 'deg'; confetti.style.setProperty('--fall-duration', duration); confetti.style.setProperty('--fall-delay', delay); confetti.style.setProperty('--rotate-end', rotateEnd); confettiContainer.appendChild(confetti); setTimeout(() => { if (confetti.parentNode === confettiContainer) confettiContainer.removeChild(confetti); }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 100); } }

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
    const claimRewardBtn = $('#claim-reward-btn'); 
    function handleChessWin() { alert("Gratulujeme! Kód: YUMECHESS15"); if(claimRewardBtn) { claimRewardBtn.classList.remove('hidden'); claimRewardBtn.disabled = false; } }
    
    // --- Chess Game Functionality ---
    const chessContainer = $('.chess-container');
    const chessGamePlaceholder = $('#chess-game-placeholder');
    
    if (chessContainer && chessGamePlaceholder) {
        // Inicializace šachové hry s knihovnami chess.js a chessboard.js
        function initChessGame() {
            console.log("Initializing chess game with libraries...");
            
            // Připravíme HTML strukturu pro šachovnici
            chessGamePlaceholder.innerHTML = `
                <div class="chess-game">
                    <h3>Šachová hra YUME</h3>
                    <div id="chess-board" style="width: 400px; margin: 0 auto;"></div>
                    <div class="chess-controls">
                        <p id="chess-status">Váš tah...</p>
                        <div class="chess-buttons">
                            <button id="new-game-btn">Nová hra</button>
                            <button id="claim-reward-btn" class="hidden" disabled>Získat odměnu!</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Inicializace šachového enginu
            const chess = new Chess();
            
            // Funkce pro náhodný tah počítače
            function makeRandomMove() {
                const possibleMoves = chess.moves();
                
                // Pokud není možný žádný tah, hra skončila
                if (possibleMoves.length === 0) return;
                
                // Vyber náhodný tah
                const randomIdx = Math.floor(Math.random() * possibleMoves.length);
                const move = possibleMoves[randomIdx];
                chess.move(move);
                
                // Aktualizuj šachovnici
                board.position(chess.fen());
                updateStatus();
            }
            
            // Funkce pro spuštění nové hry
            function newGame() {
                chess.reset();
                board.start();
                updateStatus();
                // Skryj tlačítko pro získání odměny
                document.getElementById('claim-reward-btn').classList.add('hidden');
                document.getElementById('claim-reward-btn').disabled = true;
            }
            
            // Funkce pro aktualizaci stavu hry
            function updateStatus() {
                const statusElement = document.getElementById('chess-status');
                let status = '';
                
                // Zkontroluj různé varianty konce hry
                if (chess.in_checkmate()) {
                    status = chess.turn() === 'w' ? 'Prohráli jste. Bílý je v šachu-matu.' : 'Vyhráli jste! Černý je v šachu-matu.';
                    
                    // Pokud vyhrál hráč (černý dal mat bílému), ukážeme tlačítko pro odměnu
                    if (chess.turn() === 'b') {
                        document.getElementById('claim-reward-btn').classList.remove('hidden');
                        document.getElementById('claim-reward-btn').disabled = false;
                    }
                } else if (chess.in_draw()) {
                    status = 'Hra skončila remízou';
                } else if (chess.in_stalemate()) {
                    status = 'Hra skončila patem';
                } else if (chess.in_threefold_repetition()) {
                    status = 'Hra skončila trojitým opakováním pozice';
                } else if (chess.insufficient_material()) {
                    status = 'Hra skončila pro nedostatek materiálu';
                } else {
                    // Hra pokračuje
                    status = chess.turn() === 'w' ? 'Na tahu je bílý' : 'Počítač přemýšlí...';
                    
                    // Pokud je na tahu počítač, proveď jeho tah po krátké pauze
                    if (chess.turn() === 'b') {
                        setTimeout(makeRandomMove, 250);
                    }
                }
                
                statusElement.textContent = status;
            }
            
            // Konfigurační objekt pro šachovnici
            const boardConfig = {
                draggable: true,
                position: 'start',
                // Bílý (hráč) začíná dole
                orientation: 'white',
                // Validace a zpracování tahu hráče
                onDragStart: function(source, piece) {
                    // Povolit tah pouze pro bílé figury, když je na tahu bílý
                    if (chess.game_over() || chess.turn() !== 'w' || piece.search(/^b/) !== -1) {
                        return false;
                    }
                },
                onDrop: function(source, target) {
                    // Zkontrolovat validitu tahu
                    const move = chess.move({
                        from: source,
                        to: target,
                        promotion: 'q' // Vždy povýšit pěšce na dámu (pro jednoduchost)
                    });
                    
                    // Pokud je tah neplatný, vrátit figuru zpět
                    if (move === null) return 'snapback';
                    
                    // Jinak aktualizuj stav hry
                    updateStatus();
                },
                onSnapEnd: function() {
                    board.position(chess.fen());
                }
            };
            
            // Inicializace šachovnice
            const board = Chessboard('chess-board', boardConfig);
            
            // Event listener pro tlačítko nové hry
            document.getElementById('new-game-btn').addEventListener('click', newGame);
            
            // Event listener pro tlačítko získání odměny
            document.getElementById('claim-reward-btn').addEventListener('click', handleChessWin);
            
            // Přidání CSS stylů
            const style = document.createElement('style');
            style.textContent = `
                .chess-game {
                    text-align: center;
                    padding: 20px 0;
                }
                .chess-controls {
                    margin-top: 20px;
                }
                #chess-status {
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: var(--primary-color);
                    font-size: 1.1rem;
                }
                .chess-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                .chess-buttons button {
                    padding: 8px 16px;
                }
            `;
            document.head.appendChild(style);
            
            // Inicializace stavu hry
            updateStatus();
            
            // Responsivní přizpůsobení velikosti šachovnice
            window.addEventListener('resize', function() {
                board.resize();
            });
        }
        
        // Inicializujeme šachovou hru když je sekce aktivní
        const hratSection = $('#hrat');
        if(hratSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if(entry.isIntersecting && entry.target === hratSection) {
                        initChessGame();
                        observer.unobserve(entry.target); // Neinicializujeme vícekrát
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(hratSection);
            
            // Také inicializujeme, pokud je sekce již aktivní při načtení
            if(hratSection.classList.contains('active-section')) {
                initChessGame();
            }
        }
    }

    // --- Efekt Sněžení ---
    function createSnowflakes() { const snowContainer = $('#snow-container'); if (!snowContainer) return; const numberOfFlakes = 30; for (let i = 0; i < numberOfFlakes; i++) { const flake = document.createElement('div'); flake.classList.add('snowflake'); const size = Math.random() * 2.5 + 1; flake.style.width = `${size}px`; flake.style.height = `${size}px`; const startLeft = Math.random() * 100; const endLeftDelta = (Math.random() - 0.5) * 20; const duration = Math.random() * 12 + 15; const delay = Math.random() * 15; flake.style.left = `${startLeft}vw`; flake.style.setProperty('--left-ini', `${startLeft}vw`); flake.style.setProperty('--left-end', `${startLeft + endLeftDelta}vw`); flake.style.animationDuration = `${duration}s`; flake.style.animationDelay = `-${delay}s`; snowContainer.appendChild(flake); } } createSnowflakes();

    // --- Inicializace po načtení ---
    updateCartIcon();

}); // Konec DOMContentLoaded
