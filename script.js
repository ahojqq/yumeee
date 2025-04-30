document.addEventListener('DOMContentLoaded', function() {

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    function setMode(mode) {
        if (mode === 'dark') {
            body.classList.add('dark-mode');
            themeToggleButton.textContent = '☀️'; // Slunce v tmavém módu
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeToggleButton.textContent = '🌙'; // Měsíc ve světlém módu
            localStorage.setItem('theme', 'light');
        }
    }
    const currentTheme = localStorage.getItem('theme');
    setMode(currentTheme === 'dark' ? 'dark' : 'light');
    themeToggleButton.addEventListener('click', () => {
        setMode(body.classList.contains('dark-mode') ? 'light' : 'dark');
    });


    // --- SPA Navigace (Single Page Application style) ---
    const navLinks = document.querySelectorAll('.nav-link'); // Všechny odkazy pro navigaci
    const sections = document.querySelectorAll('.section');   // Všechny sekce obsahu

    function showSection(targetId) {
        // Skrýt všechny sekce
        sections.forEach(section => {
            section.classList.remove('active-section');
        });

        // Zobrazit cílovou sekci
        const targetSection = document.getElementById(targetId.substring(1)); // Odebrat #
        if (targetSection) {
            targetSection.classList.add('active-section');
            window.scrollTo(0, 0); // Scroll nahoru při změně sekce
        } else {
            // Pokud sekce neexistuje, zobrazit Home
             document.getElementById('home').classList.add('active-section');
        }

         // Aktualizovat aktivní stav v navigaci
         navLinks.forEach(link => {
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active-nav');
            } else {
                 link.classList.remove('active-nav');
            }
         });

         // Aktualizovat hash v URL (volitelné, pro bookmarking/historii)
         // window.location.hash = targetId;
    }

    // Přidat event listenery na navigační linky
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');

            // Zkontrolovat, zda jde o interní odkaz na sekci
            if (targetId && targetId.startsWith('#')) {
                 event.preventDefault(); // Zabránit defaultnímu skoku kotvy
                 showSection(targetId);
            }
            // Pokud to není odkaz na sekci (např. externí odkaz), nechat defaultní chování
        });
    });

    // Zobrazit výchozí sekci nebo sekci z URL hashe (pokud existuje)
    // const initialHash = window.location.hash;
    // if (initialHash && document.getElementById(initialHash.substring(1))) {
    //     showSection(initialHash);
    // } else {
    //      showSection('#home'); // Výchozí je Home
    // }
    // Jednodušší start: vždy začít na Home
    showSection('#home');


    // --- Jednoduchá Slideshow (beze změny logiky) ---
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.slide-prev');
    const nextButton = document.querySelector('.slide-next');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0) {
        const totalSlides = slides.length;
        function showSlide(index) { slides.forEach((s, i) => s.classList.toggle('active', i === index)); }
        function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; showSlide(currentSlide); }
        function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; showSlide(currentSlide); }
        function startSlideShow() { stopSlideShow(); slideInterval = setInterval(nextSlide, 5500); } // Mírně pomalejší
        function stopSlideShow() { clearInterval(slideInterval); }
        showSlide(currentSlide);
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => { prevSlide(); stopSlideShow(); });
            nextButton.addEventListener('click', () => { nextSlide(); stopSlideShow(); });
        }
        startSlideShow();
        const slideshowElement = document.querySelector('.slideshow');
        if (slideshowElement) {
             slideshowElement.addEventListener('mouseenter', stopSlideShow);
             slideshowElement.addEventListener('mouseleave', startSlideShow);
        }
    }


    // --- Kolotoč Štěstí ---
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result-display');
    const prizeInfoDisplay = document.getElementById('prize-info'); // Element pro info o ceně

    // Výhry (stále 10, musí odpovídat obrázku kola!)
    const prizes = [
        { text: 'Sleva 15%', info: 'Použijte kód YUME15 při placení!' },
        { text: 'Doprava Zdarma', info: 'Automaticky aplikováno na vaši příští objednávku.' },
        { text: 'YUME Nálepka Pack', info: 'Přidáme zdarma k vaší příští objednávce.' },
        { text: 'Sleva 5%', info: 'Použijte kód YUME5 při placení!' },
        { text: 'Nic :( Zkus to zítra!', info: '' },
        { text: 'Exkluzivní Přístup', info: 'Odešleme vám e-mail s přednostním přístupem k novinkám.' },
        { text: 'YUME Klíčenka', info: 'Přidáme zdarma k vaší příští objednávce.' },
        { text: 'Sleva 10%', info: 'Použijte kód YUME10 při placení!' },
        { text: 'Malé Překvapení', info: 'Nechte se překvapit malým dárkem ve vaší příští objednávce!' },
        { text: 'Nic :( Více štěstí příště!', info: '' }
    ];

    const numberOfSegments = prizes.length;
    const segmentAngle = 360 / numberOfSegments;
    let isSpinning = false;
    let currentRotation = 0;

    if (spinButton && wheel && resultDisplay && numberOfSegments > 0) {
        spinButton.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true;
            spinButton.disabled = true;
            resultDisplay.textContent = '...';
            if(prizeInfoDisplay) prizeInfoDisplay.textContent = ''; // Vyčistit info
            if(prizeInfoDisplay) prizeInfoDisplay.classList.add('prize-info-hidden');


            const winningSegmentIndex = Math.floor(Math.random() * numberOfSegments);
            const randomFullSpins = Math.floor(Math.random() * 4) + 5;
            const angleToSegmentStart = winningSegmentIndex * segmentAngle;
            const angleToSegmentMiddle = angleToSegmentStart + (segmentAngle / 2);
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
            const targetAngle = (360 * randomFullSpins) + angleToSegmentMiddle + randomOffset;
            const finalRotation = -targetAngle;

            wheel.style.transition = 'transform 6s cubic-bezier(0.3, 1, 0.4, 1)';
            wheel.style.transform = `rotate(${finalRotation}deg)`;
            currentRotation = finalRotation % 360;

            setTimeout(() => {
                isSpinning = false;
                spinButton.disabled = false;
                const actualPrize = prizes[winningSegmentIndex];
                resultDisplay.textContent = actualPrize.text;

                if (prizeInfoDisplay && actualPrize.info) {
                     prizeInfoDisplay.textContent = actualPrize.info;
                     prizeInfoDisplay.classList.remove('prize-info-hidden');
                }

                if (!actualPrize.text.toLowerCase().includes('nic :(')) {
                    triggerConfetti();
                }

                // Reset pro plynulé další točení (volitelné)
                // setTimeout(() => {
                //     wheel.style.transition = 'none';
                //     wheel.style.transform = `rotate(${currentRotation}deg)`;
                // }, 500);

            }, 6100);
        });
    }

    // --- Konfety (beze změny logiky) ---
    const confettiContainer = document.getElementById('confetti-container');
    function triggerConfetti() {
        if (!confettiContainer) return;
        const confettiCount = 80;
        const colors = ['var(--primary-color)', 'var(--accent-color)', '#AAAAAA', '#CCCCCC']; // Šedé/Černé/Bílé
        confettiContainer.innerHTML = ''; // Vyčistit staré
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            if (Math.random() > 0.5) { confetti.classList.add('rectangle'); confetti.style.width = (Math.random() * 8 + 6) + 'px'; confetti.style.height = (Math.random() * 10 + 10) + 'px'; }
            else { confetti.classList.add('circle'); const size = (Math.random() * 6 + 8) + 'px'; confetti.style.width = size; confetti.style.height = size; }
            confetti.style.left = Math.random() * 100 + 'vw'; confetti.style.top = -Math.random() * 30 + 'vh';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            const duration = (Math.random() * 3 + 2.5) + 's'; const delay = Math.random() * 1.5 + 's'; const rotateEnd = (Math.random() * 720 - 360) + 'deg';
            confetti.style.setProperty('--fall-duration', duration); confetti.style.setProperty('--fall-delay', delay); confetti.style.setProperty('--rotate-end', rotateEnd);
            confettiContainer.appendChild(confetti);
            setTimeout(() => { if (confetti.parentNode === confettiContainer) confettiContainer.removeChild(confetti); }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 100);
        }
    }


    // --- Zpracování Formulářů (Frontend Ukázka - beze změny) ---
    function handleFormSubmit(formId, message) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                alert(message + '\n(Backend není implementován.)');
                form.reset();
            });
        }
    }
    handleFormSubmit('newsletter-form', 'Děkujeme za přihlášení k odběru!');
    handleFormSubmit('contact-form', 'Děkujeme za Vaši zprávu!');


    // --- Scroll Animace (Pro prvky uvnitř sekcí) ---
    // Pozor: Tato animace se spustí jen jednou, když se prvek objeví.
    // Protože sekce se zobrazují/skrývají, může být potřeba složitější logika,
    // pokud chcete animaci opakovat pokaždé, když se sekce zobrazí.
    // Pro jednoduchost necháme základní verzi (animace při prvním zobrazení).
    const animatedElements = document.querySelectorAll('.product-item, .timeline-event');

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('timeline-event')) {
                     entry.target.classList.add('is-visible');
                } else {
                    // Obecná animace - Můžete přidat třídu nebo stylovat přímo
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                 observer.unobserve(entry.target); // Animovat jen jednou
            }
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
        if (!el.classList.contains('timeline-event')) { // Timeline má vlastní počáteční stav
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s 0.2s ease-out, transform 0.6s 0.2s ease-out'; // Přidáno malé zpoždění
        }
        intersectionObserver.observe(el);
    });


    // --- Aktuální rok ve Footeru (beze změny) ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

}); // Konec DOMContentLoaded
