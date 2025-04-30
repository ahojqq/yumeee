document.addEventListener('DOMContentLoaded', function() {

    // --- Utility funkce ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = $('#theme-toggle-button');
    const body = document.body;
    function setMode(mode) { /* ... kód pro setMode ... */
        if (mode === 'dark') { body.classList.add('dark-mode'); themeToggleButton.textContent = '☀️'; localStorage.setItem('theme', 'dark'); }
        else { body.classList.remove('dark-mode'); themeToggleButton.textContent = '🌙'; localStorage.setItem('theme', 'light'); }
    }
    const currentTheme = localStorage.getItem('theme');
    setMode(currentTheme === 'dark' ? 'dark' : 'light');
    themeToggleButton.addEventListener('click', () => setMode(body.classList.contains('dark-mode') ? 'light' : 'dark'));

    // --- SPA Navigace ---
    const navLinks = $$('.nav-link');
    const sections = $$('.section');
    function showSection(targetId) {
        let sectionShown = false;
        sections.forEach(section => {
            const isTarget = section.id === targetId.substring(1);
            section.classList.toggle('active-section', isTarget);
            if (isTarget) sectionShown = true;
        });
        // Fallback na Home, pokud cílová sekce neexistuje
        if (!sectionShown) {
            $('#home').classList.add('active-section');
            targetId = '#home'; // Aktualizovat pro zvýraznění nav
        }
        if (targetId !== '#home') window.scrollTo(0, 0);
        navLinks.forEach(link => link.classList.toggle('active-nav', link.getAttribute('href') === targetId));
    }
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) { event.preventDefault(); showSection(targetId); }
        });
    });
    showSection('#home'); // Vždy začít na Home

    // --- Rohové Pop-up Okna (Newsletter, Login/Register) ---
    const cornerPopups = $$('.corner-popup');
    const newsletterPopup = $('#newsletter-popup');
    const loginRegisterPopup = $('#login-register-popup');
    const loginRegisterBtn = $('#login-register-btn');

    function openCornerPopup(popupElement) {
        if (!popupElement) return;
        // Zavřít ostatní rohové pop-upy, pokud jsou otevřené
        cornerPopups.forEach(p => { if(p !== popupElement) p.classList.add('hidden'); });
        popupElement.classList.remove('hidden');
    }

    function closeCornerPopup(popupElement) {
        if (!popupElement) return;
        popupElement.classList.add('hidden');
    }

    // Zavření kliknutím na křížek
    $$('.close-corner-popup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const popup = e.target.closest('.corner-popup');
            closeCornerPopup(popup);
        });
    });

    // Otevření Login/Register okna PO KLIKNUTÍ
    if (loginRegisterBtn && loginRegisterPopup) {
        loginRegisterBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Zamezit bublání, pokud by bylo potřeba
             openCornerPopup(loginRegisterPopup);
        });
    }

    // Přepínání tabů v Login/Register okně
    const tabButtons = $$('.tab-btn');
    const tabContents = $$('.tab-content');
    tabButtons.forEach(button => { /* ... kód pro přepínání tabů ... */
         button.addEventListener('click', () => { const targetTab = button.getAttribute('data-tab'); tabButtons.forEach(btn => btn.classList.toggle('active', btn === button)); tabContents.forEach(content => { content.classList.toggle('active', content.id === `${targetTab}-tab`); }); });
    });

     // Automatické otevření Newsletter Popupu (v rohu)
     const newsletterPopupShownSession = sessionStorage.getItem('newsletterPopupShown');
     if (!newsletterPopupShownSession) { // Zobrazit jen jednou za session
        const newsletterPopupTimer = setTimeout(() => {
            // Zobrazit jen pokud není otevřený login/register popup
            if (loginRegisterPopup && loginRegisterPopup.classList.contains('hidden')) {
                 openCornerPopup(newsletterPopup);
                 sessionStorage.setItem('newsletterPopupShown', 'true'); // Uložit pro session
            }
        }, 7000); // 7 sekund
     }

    // Zpracování formuláře v Popup Newsletteru (roh)
    const popupNewsletterForm = $('#popup-newsletter-form');
    if(popupNewsletterForm) { /* ... kód pro odeslání form ... */
         popupNewsletterForm.addEventListener('submit', (e) => { e.preventDefault(); const email = popupNewsletterForm.querySelector('input[type="email"]').value; alert(`Děkujeme za přihlášení: ${email}\n(Backend není implementován.)`); popupNewsletterForm.reset(); closeCornerPopup(newsletterPopup); });
    }
     // Zpracování formulářů v Login/Register (roh)
     const loginForm = $('#login-form');
     const registerForm = $('#register-form');
     if(loginForm) { /* ... kód pro odeslání form ... */ loginForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Pokus o přihlášení...\n(Backend není implementován.)'); closeCornerPopup(loginRegisterPopup); }); }
     if(registerForm) { /* ... kód pro odeslání form ... */ registerForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Pokus o registraci...\n(Backend není implementován.)'); closeCornerPopup(loginRegisterPopup); }); }


    // --- Výherní Modální Okno ---
    const modalOverlay = $('#modal-overlay');
    const prizePopup = $('#prize-popup');
    const prizePopupText = $('#prize-popup-text');
    const prizePopupInfo = $('#prize-popup-info');
    const prizePopupEmoji = $('.prize-emoji-big'); // Selektor pro emoji
    const prizePopupCloseBtns = $$('#prize-popup .close-modal-btn, #prize-popup .close-modal-btn-bottom');

    function openPrizePopup(prize) {
        if (!prizePopup || !prizePopupText || !prizePopupInfo || !prizePopupEmoji) return;
        prizePopupText.innerHTML = prize.text; // Použít innerHTML pro emoji
        prizePopupInfo.textContent = prize.info;
        // Můžeme přidat specifické emoji podle typu výhry
        if (prize.text.includes('Sleva')) prizePopupEmoji.textContent = '🏷️';
        else if (prize.text.includes('Doprava')) prizePopupEmoji.textContent = '🚚';
        else if (prize.text.includes('Nálepka') || prize.text.includes('Klíčenka')) prizePopupEmoji.textContent = '🎁';
        else prizePopupEmoji.textContent = '🎉'; // Výchozí

        modalOverlay.classList.remove('hidden');
        prizePopup.classList.remove('hidden');
        body.style.overflow = 'hidden';
    }

    function closePrizePopup() {
        modalOverlay.classList.add('hidden');
        if(prizePopup) prizePopup.classList.add('hidden');
        body.style.overflow = '';
    }
    modalOverlay.addEventListener('click', closePrizePopup); // Zavřít i klikem na overlay
    prizePopupCloseBtns.forEach(btn => btn.addEventListener('click', closePrizePopup));


    // --- Jednoduchá Slideshow (beze změny) ---
    const slides = $$('.slide'); const prevButton = $('.slide-prev'); const nextButton = $('.slide-next'); let currentSlide = 0; let slideInterval;
    if (slides.length > 0) { /* ... kód slideshow ... */ const totalSlides = slides.length; function showSlide(index) { slides.forEach((s, i) => s.classList.toggle('active', i === index)); } function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; showSlide(currentSlide); } function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; showSlide(currentSlide); } function startSlideShow() { stopSlideShow(); slideInterval = setInterval(nextSlide, 5500); } function stopSlideShow() { clearInterval(slideInterval); } showSlide(currentSlide); if (prevButton && nextButton) { prevButton.addEventListener('click', () => { prevSlide(); stopSlideShow(); }); nextButton.addEventListener('click', () => { nextSlide(); stopSlideShow(); }); } startSlideShow(); const slideshowElement = $('.slideshow'); if (slideshowElement) { slideshowElement.addEventListener('mouseenter', stopSlideShow); slideshowElement.addEventListener('mouseleave', startSlideShow); } }


    // --- Kolotoč Štěstí (Opravené točení + Výherní Popup) ---
    const wheel = $('#wheel');
    const spinButton = $('#spin-button');
    const resultDisplay = $('#result-display'); // Zobrazení výsledku pod kolem
    const prizes = [ // Přidány emoji k textu výher
        { text: '🏷️ Sleva 15%', info: 'Použijte kód YUME15 při placení!' },
        { text: '🚚 Doprava Zdarma', info: 'Automaticky aplikováno na vaši příští objednávku.' },
        { text: '🎁 YUME Nálepka Pack', info: 'Přidáme zdarma k vaší příští objednávce.' },
        { text: '🏷️ Sleva 5%', info: 'Použijte kód YUME5 při placení!' },
        { text: '😞 Nic (Zkus to zítra!)', info: '' },
        { text: '🌟 Exkluzivní Přístup', info: 'Odešleme vám e-mail s přednostním přístupem k novinkám.' },
        { text: '🎁 YUME Klíčenka', info: 'Přidáme zdarma k vaší příští objednávce.' },
        { text: '🏷️ Sleva 10%', info: 'Použijte kód YUME10 při placení!' },
        { text: '✨ Malé Překvapení', info: 'Nechte se překvapit malým dárkem ve vaší příští objednávce!' },
        { text: '😞 Nic (Více štěstí příště!)', info: '' }
    ];
    const numberOfSegments = prizes.length;
    const segmentAngle = 360 / numberOfSegments;
    let isSpinning = false;
    let currentRotation = 0; // Uchovává skutečný úhel natočení

    if (spinButton && wheel && resultDisplay && numberOfSegments > 0) {
        spinButton.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true; spinButton.disabled = true;
            resultDisplay.innerHTML = 'Točí se...'; // Použít innerHTML pro případné ikony
            wheel.style.transition = 'none'; // Vypnout transition pro okamžitý reset na aktuální pozici
            wheel.style.transform = `rotate(${currentRotation}deg)`;

            // Force browser repaint/reflow - zajistí, že se reset projeví před animací
            wheel.offsetHeight; // Nebo setTimeout s 0ms

            // Výpočet nového cíle
            const winningSegmentIndex = Math.floor(Math.random() * numberOfSegments);
            const randomFullSpins = Math.floor(Math.random() * 4) + 5; // 5 až 8 otáček
            const angleToCenter = (winningSegmentIndex * segmentAngle) + (segmentAngle / 2);
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7; // Menší offset
            const targetAngleDelta = (360 * randomFullSpins) + angleToCenter + randomOffset;
            const finalRotation = currentRotation - targetAngleDelta; // Odečítáme pro točení doprava

            // Zapnout transition a roztočit
            wheel.style.transition = 'transform 6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Easing s "odrazem"
            wheel.style.transform = `rotate(${finalRotation}deg)`;

            // Uložit novou pozici
            currentRotation = finalRotation % 360;

            // Zpracovat výsledek po animaci
            setTimeout(() => {
                isSpinning = false; spinButton.disabled = false;
                const actualPrize = prizes[winningSegmentIndex];
                resultDisplay.innerHTML = actualPrize.text; // Zobrazit výsledek pod kolem

                // Zobrazit výherní popup a konfety POUZE PŘI VÝHŘE
                if (!actualPrize.text.toLowerCase().includes('nic')) {
                    openPrizePopup(actualPrize); // Otevřít výherní modální okno
                    triggerConfetti(); // Spustit konfety
                }
            }, 6100); // Čas o trochu delší než CSS transition
        });
    }

    // --- Konfety (beze změny) ---
    const confettiContainer = $('#confetti-container');
    function triggerConfetti() { /* ... implementace konfet ... */ if (!confettiContainer) return; const confettiCount = 80; const colors = ['var(--primary-color)', 'var(--accent-color)', '#AAAAAA', '#CCCCCC']; confettiContainer.innerHTML = ''; for (let i = 0; i < confettiCount; i++) { const confetti = document.createElement('div'); confetti.classList.add('confetti'); if (Math.random() > 0.5) { confetti.classList.add('rectangle'); confetti.style.width = (Math.random() * 8 + 6) + 'px'; confetti.style.height = (Math.random() * 10 + 10) + 'px'; } else { confetti.classList.add('circle'); const size = (Math.random() * 6 + 8) + 'px'; confetti.style.width = size; confetti.style.height = size; } confetti.style.left = Math.random() * 100 + 'vw'; confetti.style.top = -Math.random() * 30 + 'vh'; confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; confetti.style.opacity = Math.random() * 0.5 + 0.5; const duration = (Math.random() * 3 + 2.5) + 's'; const delay = Math.random() * 1.5 + 's'; const rotateEnd = (Math.random() * 720 - 360) + 'deg'; confetti.style.setProperty('--fall-duration', duration); confetti.style.setProperty('--fall-delay', delay); confetti.style.setProperty('--rotate-end', rotateEnd); confettiContainer.appendChild(confetti); setTimeout(() => { if (confetti.parentNode === confettiContainer) confettiContainer.removeChild(confetti); }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 100); } }

    // --- Zpracování Formulářů (beze změny) ---
    function handleFormSubmit(formId, message) { /* ... implementace ... */ const form = $(`#${formId}`); if (form) { form.addEventListener('submit', function(event) { event.preventDefault(); alert(message + '\n(Backend není implementován.)'); form.reset(); }); } }
    // handleFormSubmit('newsletter-form', 'Děkujeme za přihlášení k odběru!'); // Formulář v sekci Newsletter je skrytý
    handleFormSubmit('contact-form', 'Děkujeme za Vaši zprávu!');

    // --- Scroll Animace (beze změny) ---
    const animatedElements = $$('.product-item, .timeline-event'); const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 }; const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { if (entry.target.classList.contains('timeline-event')) { entry.target.classList.add('is-visible'); } else { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } observer.unobserve(entry.target); } }); }; const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); animatedElements.forEach(el => { if (!el.classList.contains('timeline-event')) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s 0.2s ease-out, transform 0.6s 0.2s ease-out'; } intersectionObserver.observe(el); });

    // --- Zobrazení Data, Času a Fáze Měsíce (v headeru) ---
    const dateTimeDisplay = $('#date-time-display'); const moonPhaseDisplay = $('#moon-phase-display');
    function updateDateTime() { /* ... kód pro updateDateTime ... */ const now = new Date(); const optionsDate = { year: 'numeric', month: 'numeric', day: 'numeric' }; const optionsTime = { hour: '2-digit', minute: '2-digit' }; const formattedDate = now.toLocaleDateString('cs-CZ', optionsDate); const formattedTime = now.toLocaleTimeString('cs-CZ', optionsTime); if (dateTimeDisplay) { dateTimeDisplay.textContent = `${formattedDate}, ${formattedTime}`; } }
    function getMoonPhase(date = new Date()) { /* ... kód pro getMoonPhase ... */ const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)); const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / 86400000; const synodicMonths = daysSinceKnownNewMoon / 29.53058867; const phase = (synodicMonths - Math.floor(synodicMonths)); let phaseEmoji = "❓"; if (phase < 0.03 || phase > 0.97) { phaseEmoji = "🌑"; } else if (phase < 0.22) { phaseEmoji = "🌒"; } else if (phase < 0.28) { phaseEmoji = "🌓"; } else if (phase < 0.47) { phaseEmoji = "🌔"; } else if (phase < 0.53) { phaseEmoji = "🌕"; } else if (phase < 0.72) { phaseEmoji = "🌖"; } else if (phase < 0.78) { phaseEmoji = "🌗"; } else { phaseEmoji = "🌘"; } return { emoji: phaseEmoji, value: phase }; }
    if (moonPhaseDisplay) { const moon = getMoonPhase(); moonPhaseDisplay.textContent = moon.emoji; moonPhaseDisplay.title = `Fáze měsíce (${moon.value.toFixed(2)})`; }
    updateDateTime(); setInterval(updateDateTime, 60000);

    // --- Aktuální rok ve Footeru ---
    const yearSpan = $('#current-year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Placeholder pro logiku šachové hry ---
    const claimRewardBtn = $('#claim-reward-btn'); function handleChessWin() { alert("Gratulujeme! Porazili jste YUME AI. Váš slevový kód je: YUMECHESS15"); if(claimRewardBtn) { claimRewardBtn.classList.remove('hidden'); claimRewardBtn.disabled = false; } }

}); // Konec DOMContentLoaded
