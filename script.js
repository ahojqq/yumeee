document.addEventListener('DOMContentLoaded', function() {

    // --- Utility funkce ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = $('#theme-toggle-button');
    const body = document.body;
    function setMode(mode) {
        if (mode === 'dark') {
            body.classList.add('dark-mode');
            themeToggleButton.textContent = '☀️'; localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeToggleButton.textContent = '🌙'; localStorage.setItem('theme', 'light');
        }
    }
    const currentTheme = localStorage.getItem('theme');
    setMode(currentTheme === 'dark' ? 'dark' : 'light');
    themeToggleButton.addEventListener('click', () => {
        setMode(body.classList.contains('dark-mode') ? 'light' : 'dark');
    });

    // --- SPA Navigace ---
    const navLinks = $$('.nav-link');
    const sections = $$('.section');
    function showSection(targetId) {
        sections.forEach(section => section.classList.remove('active-section'));
        const targetSection = $(targetId); // Používáme targetId přímo jako selektor
        if (targetSection && targetSection.classList.contains('section')) { // Ověřit, zda je to sekce
            targetSection.classList.add('active-section');
            if (targetId !== '#home') window.scrollTo(0, 0);
        } else {
             $('#home').classList.add('active-section'); // Fallback na Home
        }
         navLinks.forEach(link => link.classList.toggle('active-nav', link.getAttribute('href') === targetId));
    }
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                 event.preventDefault(); showSection(targetId);
            }
        });
    });
    showSection('#home'); // Vždy začít na Home

    // --- Modální Okna ---
    const modalOverlay = $('#modal-overlay');
    const allModals = $$('.modal');
    const newsletterPopup = $('#newsletter-popup');
    const loginRegisterPopup = $('#login-register-popup');
    const loginRegisterBtn = $('#login-register-btn');

    function openModal(modalElement) {
        if (!modalElement) return;
        modalOverlay.classList.remove('hidden');
        modalElement.classList.remove('hidden');
        body.style.overflow = 'hidden'; // Zamezit scrollu pozadí
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
        allModals.forEach(modal => modal.classList.add('hidden'));
        body.style.overflow = ''; // Povolit scroll pozadí
    }

    // Zavření kliknutím na overlay nebo křížek
    modalOverlay.addEventListener('click', closeModal);
    $$('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));

    // Otevření Login/Register okna
    if (loginRegisterBtn) {
        loginRegisterBtn.addEventListener('click', () => openModal(loginRegisterPopup));
    }

    // Přepínání tabů v Login/Register okně
    const tabButtons = $$('.tab-btn');
    const tabContents = $$('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === `${targetTab}-tab`);
            });
        });
    });

    // Automatické otevření Newsletter Popupu (např. po 5 sekundách)
    const newsletterPopupTimer = setTimeout(() => {
        // Zobrazit jen pokud už není otevřený jiný modal a nebyl už zobrazen (cookie/localStorage)
        if ($('.modal:not(.hidden)') === null && !localStorage.getItem('newsletterPopupShown')) {
             openModal(newsletterPopup);
             // Označit, že byl zobrazen (pro tuto session nebo trvale)
             // localStorage.setItem('newsletterPopupShown', 'true'); // Trvalé uložení
             sessionStorage.setItem('newsletterPopupShown', 'true'); // Uložení pro session
        }
    }, 5000); // 5000ms = 5 sekund

    // Zpracování formuláře v Popup Newsletteru
    const popupNewsletterForm = $('#popup-newsletter-form');
    if(popupNewsletterForm) {
        popupNewsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = popupNewsletterForm.querySelector('input[type="email"]').value;
            alert(`Děkujeme za přihlášení: ${email}\n(Backend není implementován.)`);
            popupNewsletterForm.reset();
            closeModal(); // Zavřít okno po odeslání
        });
    }
     // Zpracování formuláře v Login/Register Popupu (pouze ukázka)
     const loginForm = $('#login-form');
     const registerForm = $('#register-form');
     if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
             e.preventDefault();
             alert('Pokus o přihlášení...\n(Backend není implementován.)');
             closeModal();
        });
     }
     if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
             e.preventDefault();
             alert('Pokus o registraci...\n(Backend není implementován.)');
             closeModal();
        });
     }


    // --- Jednoduchá Slideshow (beze změny) ---
    const slides = $$('.slide');
    const prevButton = $('.slide-prev');
    const nextButton = $('.slide-next');
    let currentSlide = 0;
    let slideInterval;
    if (slides.length > 0) {
        const totalSlides = slides.length;
        function showSlide(index) { slides.forEach((s, i) => s.classList.toggle('active', i === index)); }
        function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; showSlide(currentSlide); }
        function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; showSlide(currentSlide); }
        function startSlideShow() { stopSlideShow(); slideInterval = setInterval(nextSlide, 5500); }
        function stopSlideShow() { clearInterval(slideInterval); }
        showSlide(currentSlide);
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => { prevSlide(); stopSlideShow(); });
            nextButton.addEventListener('click', () => { nextSlide(); stopSlideShow(); });
        }
        startSlideShow();
        const slideshowElement = $('.slideshow');
        if (slideshowElement) {
             slideshowElement.addEventListener('mouseenter', stopSlideShow);
             slideshowElement.addEventListener('mouseleave', startSlideShow);
        }
    }

    // --- Kolotoč Štěstí (Vylepšený + Fix rotace) ---
    const wheel = $('#wheel');
    const spinButton = $('#spin-button');
    const resultDisplay = $('#result-display');
    const prizeInfoDisplay = $('#prize-info');
    const prizes = [
        { text: 'Sleva 15%', info: 'Použijte kód YUME15 při placení!' }, { text: 'Doprava Zdarma', info: 'Automaticky aplikováno na vaši příští objednávku.' },
        { text: 'YUME Nálepka Pack', info: 'Přidáme zdarma k vaší příští objednávce.' }, { text: 'Sleva 5%', info: 'Použijte kód YUME5 při placení!' },
        { text: 'Nic :( Zkus to zítra!', info: '' }, { text: 'Exkluzivní Přístup', info: 'Odešleme vám e-mail s přednostním přístupem k novinkám.' },
        { text: 'YUME Klíčenka', info: 'Přidáme zdarma k vaší příští objednávce.' }, { text: 'Sleva 10%', info: 'Použijte kód YUME10 při placení!' },
        { text: 'Malé Překvapení', info: 'Nechte se překvapit malým dárkem ve vaší příští objednávce!' }, { text: 'Nic :( Více štěstí příště!', info: '' }
    ];
    const numberOfSegments = prizes.length;
    const segmentAngle = 360 / numberOfSegments;
    let isSpinning = false;
    let currentRotation = 0; // Uchovává skutečný úhel natočení

    if (spinButton && wheel && resultDisplay && numberOfSegments > 0) {
        spinButton.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true; spinButton.disabled = true; resultDisplay.textContent = '...';
            if(prizeInfoDisplay) prizeInfoDisplay.textContent = ''; if(prizeInfoDisplay) prizeInfoDisplay.classList.add('prize-info-hidden');
            wheel.style.transition = 'none'; // Vypnout transition pro reset
            wheel.style.transform = `rotate(${currentRotation}deg)`; // Nastavit aktuální úhel bez animace

            // Malá pauza, aby se změna projevila před spuštěním nové animace
            setTimeout(() => {
                const winningSegmentIndex = Math.floor(Math.random() * numberOfSegments);
                const randomFullSpins = Math.floor(Math.random() * 4) + 5;
                const angleToSegmentStart = winningSegmentIndex * segmentAngle;
                const angleToSegmentMiddle = angleToSegmentStart + (segmentAngle / 2);
                const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
                // Cílový úhel vzhledem k *aktuální* rotaci
                const targetAngle = (360 * randomFullSpins) + angleToSegmentMiddle + randomOffset;
                // Konečná absolutní rotace
                const finalRotation = currentRotation - targetAngle; // Odečítáme, protože chceme točit "doprava"

                wheel.style.transition = 'transform 6s cubic-bezier(0.3, 1, 0.4, 1)';
                wheel.style.transform = `rotate(${finalRotation}deg)`;
                currentRotation = finalRotation % 360; // Uložit nový úhel (modulo 360)

                setTimeout(() => {
                    isSpinning = false; spinButton.disabled = false; const actualPrize = prizes[winningSegmentIndex];
                    resultDisplay.textContent = actualPrize.text;
                    if (prizeInfoDisplay && actualPrize.info) { prizeInfoDisplay.textContent = actualPrize.info; prizeInfoDisplay.classList.remove('prize-info-hidden'); }
                    if (!actualPrize.text.toLowerCase().includes('nic :(')) { triggerConfetti(); }
                     // Není nutný další reset, protože začínáme z currentRotation
                }, 6100); // O malinko déle než CSS transition
            }, 50); // Krátká pauza 50ms
        });
    }

    // --- Konfety (beze změny) ---
    const confettiContainer = $('#confetti-container');
    function triggerConfetti() { /* ... implementace konfet ... */
        if (!confettiContainer) return; const confettiCount = 80; const colors = ['var(--primary-color)', 'var(--accent-color)', '#AAAAAA', '#CCCCCC'];
        confettiContainer.innerHTML = ''; for (let i = 0; i < confettiCount; i++) { const confetti = document.createElement('div'); confetti.classList.add('confetti'); if (Math.random() > 0.5) { confetti.classList.add('rectangle'); confetti.style.width = (Math.random() * 8 + 6) + 'px'; confetti.style.height = (Math.random() * 10 + 10) + 'px'; } else { confetti.classList.add('circle'); const size = (Math.random() * 6 + 8) + 'px'; confetti.style.width = size; confetti.style.height = size; } confetti.style.left = Math.random() * 100 + 'vw'; confetti.style.top = -Math.random() * 30 + 'vh'; confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; confetti.style.opacity = Math.random() * 0.5 + 0.5; const duration = (Math.random() * 3 + 2.5) + 's'; const delay = Math.random() * 1.5 + 's'; const rotateEnd = (Math.random() * 720 - 360) + 'deg'; confetti.style.setProperty('--fall-duration', duration); confetti.style.setProperty('--fall-delay', delay); confetti.style.setProperty('--rotate-end', rotateEnd); confettiContainer.appendChild(confetti); setTimeout(() => { if (confetti.parentNode === confettiContainer) confettiContainer.removeChild(confetti); }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 100); }
    }

    // --- Zpracování Formulářů (beze změny) ---
    function handleFormSubmit(formId, message) { /* ... implementace ... */ const form = $(`#${formId}`); if (form) { form.addEventListener('submit', function(event) { event.preventDefault(); alert(message + '\n(Backend není implementován.)'); form.reset(); }); } }
    handleFormSubmit('newsletter-form', 'Děkujeme za přihlášení k odběru!');
    handleFormSubmit('contact-form', 'Děkujeme za Vaši zprávu!');

    // --- Scroll Animace (beze změny) ---
    const animatedElements = $$('.product-item, .timeline-event');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { if (entry.target.classList.contains('timeline-event')) { entry.target.classList.add('is-visible'); } else { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } observer.unobserve(entry.target); } }); };
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    animatedElements.forEach(el => { if (!el.classList.contains('timeline-event')) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s 0.2s ease-out, transform 0.6s 0.2s ease-out'; } intersectionObserver.observe(el); });

    // --- Zobrazení Data, Času a Fáze Měsíce ---
    const dateTimeDisplay = $('#date-time-display');
    const moonPhaseDisplay = $('#moon-phase-display');
    function updateDateTime() {
        const now = new Date();
        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit' };
        const formattedDate = now.toLocaleDateString('cs-CZ', optionsDate);
        const formattedTime = now.toLocaleTimeString('cs-CZ', optionsTime);
        if (dateTimeDisplay) {
            dateTimeDisplay.textContent = `${formattedDate}, ${formattedTime}`;
        }
    }
    function getMoonPhase(date = new Date()) {
        // Zjednodušený výpočet - aproximace
        const K = 0.2953058867; // Synodic month length in days / 2Pi
        const JD_epoch = 2451550.1; // Julian date of epoch 2000-01-01 12:00 GMT
        const T_epoch = (JD_epoch - 2451545.0) / 36525; // Julian centuries since J2000.0

        // Known new moon: 2000-01-06 18:14 GMT (JD 2451550.26)
        // Simplified based on days since known new moon.
        const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)); // Month is 0-indexed
        const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
        const synodicMonths = daysSinceKnownNewMoon / 29.53058867;
        const phase = (synodicMonths - Math.floor(synodicMonths)) ; // Phase between 0 and 1

        // Emojis or descriptions based on phase
        // 0: New Moon, 0.25: First Quarter, 0.5: Full Moon, 0.75: Last Quarter
        let phaseName = "Neznámá";
        let phaseEmoji = "❓";

        if (phase < 0.03 || phase > 0.97) { phaseName = "Nov"; phaseEmoji = "🌑"; }
        else if (phase < 0.22) { phaseName = "Dorůstající srpek"; phaseEmoji = "🌒"; }
        else if (phase < 0.28) { phaseName = "První čtvrť"; phaseEmoji = "🌓"; }
        else if (phase < 0.47) { phaseName = "Dorůstající měsíc"; phaseEmoji = "🌔"; }
        else if (phase < 0.53) { phaseName = "Úplněk"; phaseEmoji = "🌕"; }
        else if (phase < 0.72) { phaseName = "Couvající měsíc"; phaseEmoji = "🌖"; }
        else if (phase < 0.78) { phaseName = "Poslední čtvrť"; phaseEmoji = "🌗"; }
        else { phaseName = "Couvající srpek"; phaseEmoji = "🌘"; }

        return { name: phaseName, emoji: phaseEmoji, value: phase };
    }

    if (moonPhaseDisplay) {
        const moon = getMoonPhase();
        moonPhaseDisplay.textContent = `${moon.emoji} (${moon.name})`;
        moonPhaseDisplay.title = `Fáze: ${moon.value.toFixed(2)}`; // Přidat title pro přesnou hodnotu
    }
    updateDateTime(); // Spustit hned
    setInterval(updateDateTime, 60000); // Aktualizovat čas každou minutu


    // --- Aktuální rok ve Footeru ---
    const yearSpan = $('#current-year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Placeholder pro logiku šachové hry ---
    const claimRewardBtn = $('#claim-reward-btn');
    // Příklad: Funkce, která by se volala po výhře ve hře
    function handleChessWin() {
        alert("Gratulujeme! Porazili jste YUME AI. Váš slevový kód je: YUMECHESS15");
        if(claimRewardBtn) {
            claimRewardBtn.classList.remove('hidden');
            claimRewardBtn.disabled = false;
            // Další logika pro zobrazení kódu nebo aplikaci slevy
        }
    }
    // Tuto funkci `handleChessWin()` by volala vaše šachová knihovna po detekci matu AI.

}); // Konec DOMContentLoaded
