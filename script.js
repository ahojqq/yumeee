document.addEventListener('DOMContentLoaded', function() {

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;
    // const logoImg = document.getElementById('logo-img'); // Pokud byste použili logo obrázek

    function setMode(mode) {
        if (mode === 'dark') {
            body.classList.add('dark-mode');
            themeToggleButton.textContent = '☀️';
            // if (logoImg) logoImg.src = 'images/yume-logo-dark.png'; // Změna loga
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeToggleButton.textContent = '🌙';
            // if (logoImg) logoImg.src = 'images/yume-logo-light.png'; // Změna loga
            localStorage.setItem('theme', 'light');
        }
    }

    // Zkontrolovat uložené téma
    const currentTheme = localStorage.getItem('theme');
    setMode(currentTheme === 'dark' ? 'dark' : 'light'); // Nastavit mód při načtení

    themeToggleButton.addEventListener('click', () => {
        setMode(body.classList.contains('dark-mode') ? 'light' : 'dark');
    });


    // --- Jednoduchá Slideshow ---
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.slide-prev');
    const nextButton = document.querySelector('.slide-next');
    let currentSlide = 0;
    let slideInterval; // Proměnná pro automatické posouvání

    if (slides.length > 0) {
        const totalSlides = slides.length;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }

        function startSlideShow() {
            stopSlideShow(); // Nejprve zastavit, pokud už běží
            slideInterval = setInterval(nextSlide, 5000); // Posunout každých 5 sekund
        }

        function stopSlideShow() {
            clearInterval(slideInterval);
        }

        showSlide(currentSlide); // Zobrazit první slide

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                prevSlide();
                stopSlideShow(); // Zastavit automatiku při manuálním kliknutí
            });
            nextButton.addEventListener('click', () => {
                nextSlide();
                stopSlideShow(); // Zastavit automatiku při manuálním kliknutí
            });
        }

        // Spustit automatické posouvání
        startSlideShow();

        // Zastavit posouvání, když je myš nad slideshow
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

    // ---------- !!! DŮLEŽITÉ !!! ----------
    // POČET VÝHER V TOMTO POLI MUSÍ PŘESNĚ ODPOVÍDAT
    // POČTU SEGMENTŮ NA VAŠEM OBRÁZKU KOLA ŠTĚSTÍ (`kolotoc.png` nebo podobně)
    // Zde je 10 výher:
    const prizes = [
        'Sleva 15%',                  // Segment 1
        'Doprava Zdarma',             // Segment 2
        'YUME Nálepka Pack',          // Segment 3
        'Sleva 5%',                   // Segment 4
        'Nic :( Zkus to příště!',     // Segment 5
        'Exkluzivní Přístup',         // Segment 6 (např. k další kolekci)
        'YUME Klíčenka',              // Segment 7
        'Sleva 10%',                  // Segment 8
        'Malé Překvapení',            // Segment 9 (mystery gift)
        'Nic :( Lepší štěstí příště!' // Segment 10
    ];
    // ----------------------------------------

    const numberOfSegments = prizes.length;
    const segmentAngle = 360 / numberOfSegments;
    let isSpinning = false;
    let currentRotation = 0; // Uchovává aktuální rotaci pro plynulejší opakované točení

    if (spinButton && wheel && resultDisplay && numberOfSegments > 0) {
        spinButton.addEventListener('click', () => {
            if (isSpinning) return;

            isSpinning = true;
            spinButton.disabled = true;
            resultDisplay.textContent = '...'; // Indikátor točení

            // Náhodně zvolit výherní segment (index 0 až numberOfSegments-1)
            const winningSegmentIndex = Math.floor(Math.random() * numberOfSegments);

            // Vypočítat cílový úhel:
            // 1. Několik plných otáček (např. 5-8) pro vizuální efekt
            const randomFullSpins = Math.floor(Math.random() * 4) + 5; // 5 až 8 otáček
            // 2. Úhel k začátku výherního segmentu (proti směru hodinových ručiček)
            const angleToSegmentStart = winningSegmentIndex * segmentAngle;
            // 3. Posun doprostřed segmentu
            const angleToSegmentMiddle = angleToSegmentStart + (segmentAngle / 2);
            // 4. Malý náhodný posun v rámci segmentu pro variabilitu
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
            // 5. Celkový cílový úhel (záporný, protože točíme proti směru hodinových ručiček)
            const targetAngle = (360 * randomFullSpins) + angleToSegmentMiddle + randomOffset;

            // Konečná rotace (přičítáme k aktuální, aby točení navazovalo)
            // Použijeme zápornou hodnotu, pokud chceme točit "doprava" (clockwise)
            const finalRotation = -targetAngle;

            // Aplikovat rotaci
            wheel.style.transition = 'transform 6s cubic-bezier(0.3, 1, 0.4, 1)'; // Zajistit, že transition je aktivní
            wheel.style.transform = `rotate(${finalRotation}deg)`;

            // Aktualizovat aktuální rotaci (modulo 360 pro příští točení)
            currentRotation = finalRotation % 360;

            // Počkat na dokončení animace
            setTimeout(() => {
                isSpinning = false;
                spinButton.disabled = false;
                const actualPrize = prizes[winningSegmentIndex];
                resultDisplay.textContent = actualPrize;

                // Zpracování výhry
                if (!actualPrize.toLowerCase().includes('nic :(')) {
                    // Můžete přidat kód pro zobrazení slevového kódu, atd.
                    triggerConfetti(); // Spustit konfety
                    // alert(`Gratulujeme! Vyhráli jste: ${actualPrize}`);
                }

                // Volitelně: Resetovat transformaci pro další plynulé točení
                // Po krátké pauze nastavíme rotaci bez transition, aby točení začínalo z této pozice
                // setTimeout(() => {
                //     wheel.style.transition = 'none';
                //     wheel.style.transform = `rotate(${currentRotation}deg)`;
                // }, 500); // Krátká pauza po zobrazení výsledku

            }, 6100); // O malinko déle než CSS transition (6000ms)
        });
    }

    // --- Konfety ---
    const confettiContainer = document.getElementById('confetti-container');
    function triggerConfetti() {
        if (!confettiContainer) return;
        const confettiCount = 80; // Více konfet
        const colors = ['var(--primary-color)', 'var(--accent-color)', '#CCCCCC', '#E0E0E0']; // Barvy dle palety

        // Vyčistit staré konfety, pokud nějaké zůstaly
        confettiContainer.innerHTML = '';

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');

            // Náhodný tvar (obdélník nebo kruh)
            if (Math.random() > 0.5) {
                confetti.classList.add('rectangle');
                confetti.style.width = (Math.random() * 8 + 6) + 'px'; // 6-14px
                confetti.style.height = (Math.random() * 10 + 10) + 'px'; // 10-20px
            } else {
                 confetti.classList.add('circle');
                 const size = (Math.random() * 6 + 8) + 'px'; // 8-14px
                 confetti.style.width = size;
                 confetti.style.height = size;
            }

            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -Math.random() * 30 + 'vh'; // Start výše
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = Math.random() * 0.5 + 0.5; // 0.5 - 1.0

            // Náhodné CSS proměnné pro animaci
            const duration = (Math.random() * 3 + 2.5) + 's'; // 2.5 - 5.5 sekundy
            const delay = Math.random() * 1.5 + 's'; // 0 - 1.5 sekundy delay
            const rotateEnd = (Math.random() * 720 - 360) + 'deg'; // -360 to +360 deg rotace

            confetti.style.setProperty('--fall-duration', duration);
            confetti.style.setProperty('--fall-delay', delay);
            confetti.style.setProperty('--rotate-end', rotateEnd);

            confettiContainer.appendChild(confetti);

            // Odstranit po animaci - bezpečnější než event listener
            setTimeout(() => {
                 if (confetti.parentNode === confettiContainer) {
                    confettiContainer.removeChild(confetti);
                 }
            }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 100); // Čas animace + malá rezerva
        }
    }


    // --- Zpracování Formulářů (Frontend Ukázka) ---
    function handleFormSubmit(formId, message) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault(); // Zastavit výchozí odeslání
                alert(message + '\n(Toto je pouze ukázka na frontendu. Pro reálné odeslání je potřeba backend.)');
                form.reset(); // Vyčistit formulář
            });
        }
    }
    handleFormSubmit('newsletter-form', 'Děkujeme za přihlášení k odběru!');
    handleFormSubmit('contact-form', 'Děkujeme za Vaši zprávu!');


    // --- Scroll Animace (Odhalení prvků při scrollu) ---
    const animatedElements = document.querySelectorAll('.section, .product-item, .timeline-event');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Spustit, když je vidět 10% prvku
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Přidat třídu pro spuštění CSS animace/transition
                if (entry.target.classList.contains('timeline-event')) {
                     entry.target.classList.add('is-visible'); // Speciální třída pro timeline
                } else {
                    // Obecná animace pro ostatní prvky (můžete definovat v CSS)
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                 // Přestat sledovat prvek po první animaci
                 observer.unobserve(entry.target);
            }
             // Není potřeba else, protože skrývání je řešeno počátečním stavem v CSS
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
        // Nastavit počáteční stav (skryté) pro animaci
        // Pro timeline eventy je to řešeno přímo v CSS pro levou/pravou stranu
        if (!el.classList.contains('timeline-event')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        }
        intersectionObserver.observe(el); // Začít sledovat prvek
    });

    // --- Aktuální rok ve Footeru ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // Konec DOMContentLoaded
