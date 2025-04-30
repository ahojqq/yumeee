document.addEventListener('DOMContentLoaded', function() {

    // --- Přepínač Light/Dark Módu ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    // Zkontrolovat uložené téma v localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleButton.textContent = '☀️'; // Ikonka slunce pro tmavý mód
    } else {
        body.classList.remove('dark-mode');
        themeToggleButton.textContent = '🌙'; // Ikonka měsíce pro světlý mód
    }

    themeToggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        let theme = 'light';
        if (body.classList.contains('dark-mode')) {
            theme = 'dark';
            themeToggleButton.textContent = '☀️';
        } else {
            themeToggleButton.textContent = '🌙';
        }
        // Uložit preferenci do localStorage
        localStorage.setItem('theme', theme);
    });

    // --- Jednoduchá Slideshow ---
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.slide-prev');
    const nextButton = document.querySelector('.slide-next');
    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
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

    if (slides.length > 0) {
        showSlide(currentSlide); // Zobrazit první slide na začátku

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', prevSlide);
            nextButton.addEventListener('click', nextSlide);
        }

        // Volitelně: Automatické posouvání (odkomentovat pro aktivaci)
        // setInterval(nextSlide, 5000); // Posunout každých 5 sekund
    }


    // --- Kolotoč Štěstí (Základní Funkčnost) ---
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result-display');
    // Definujte si své výhry - POČET MUSÍ ODPOVÍDAT SEGMENTŮM NA OBRÁZKU KOLA!
    const prizes = [
        'Sleva 10%',
        'Nic :(',
        'Doprava zdarma',
        'Sleva 5%',
        'YUME Nálepka',
        'Nic :(',
        'Sleva 15%',
        'Klíčenka YUME'
    ];
    const segmentAngle = 360 / prizes.length;
    let isSpinning = false;

    if (spinButton && wheel && resultDisplay) {
        spinButton.addEventListener('click', () => {
            if (isSpinning) return; // Zabraňit vícenásobnému točení

            isSpinning = true;
            spinButton.disabled = true; // Deaktivovat tlačítko během točení
            resultDisplay.textContent = '-'; // Resetovat výsledek

            // Náhodně zvolit výherní segment
            const winningSegmentIndex = Math.floor(Math.random() * prizes.length);

            // Vypočítat cílový úhel otočení
            // Přidáme několik plných otáček pro vizuální efekt (např. 5 otáček = 360 * 5)
            // Odečteme polovinu úhlu segmentu, aby ukazatel mířil doprostřed segmentu
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8; // Malý náhodný posun uvnitř segmentu
            const targetRotation = (360 * 5) - (winningSegmentIndex * segmentAngle) - (segmentAngle / 2) + randomOffset;


            // Aplikovat rotaci pomocí CSS transformace
            // Přechod je definován v CSS (transition: transform 5s ...)
            wheel.style.transform = `rotate(${targetRotation}deg)`;

            // Počkat na dokončení animace (doba musí odpovídat CSS transition duration)
            setTimeout(() => {
                isSpinning = false;
                spinButton.disabled = false; // Znovu aktivovat tlačítko
                const actualPrize = prizes[winningSegmentIndex];
                resultDisplay.textContent = actualPrize;

                // Zde můžete přidat logiku pro "výhru" - např. zobrazení kódu, konfety
                if (actualPrize !== 'Nic :(') {
                    // alert(`Gratulujeme! Vyhráli jste: ${actualPrize}`);
                    triggerConfetti(); // Spustit konfety (jednoduchá verze)
                }

                // Volitelně: Resetovat úhel po chvíli, aby se nehromadil
                // setTimeout(() => {
                //     wheel.style.transition = 'none'; // Vypnout animaci pro reset
                //     const finalAngle = targetRotation % 360;
                //     wheel.style.transform = `rotate(${finalAngle}deg)`;
                //     // Zapnout animaci zpět po malém okamžiku
                //     setTimeout(() => wheel.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)', 50);
                // }, 1000);


            }, 5000); // 5000ms = 5s (doba transition v CSS)
        });
    }

    // --- Jednoduché Konfety po výhře ---
    const confettiContainer = document.getElementById('confetti-container');
    function triggerConfetti() {
        if (!confettiContainer) return;
        const confettiCount = 50; // Počet konfet
        const colors = ['var(--primary-color)', 'var(--accent-color)', '#FFD700', '#90EE90']; // Barvy konfet

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw'; // Náhodná pozice X
            confetti.style.top = -Math.random() * 20 + 'px'; // Start nad obrazovkou
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            // Náhodná rychlost a delay pádu (přes CSS proměnné)
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'; // 2-4 sekundy
            confetti.style.animationDelay = Math.random() * 1 + 's';

             // Nastavení CSS proměnných pro rotaci v animaci pádu (pro větší variabilitu)
            confetti.style.setProperty('--random-rotate-x', Math.random() * 360 + 'deg');
            confetti.style.setProperty('--random-rotate-y', Math.random() * 360 + 'deg');
            confetti.style.setProperty('--random-rotate-z', Math.random() * 360 + 'deg');

            confettiContainer.appendChild(confetti);

            // Odstranit konfetu z DOM po animaci
            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
         // Upravit keyframes v CSS, aby používaly tyto proměnné:
         /*
         @keyframes fall {
             to {
                 transform: translateY(100vh) rotateX(var(--random-rotate-x, 360deg)) rotateY(var(--random-rotate-y, 360deg)) rotateZ(var(--random-rotate-z, 360deg));
                 opacity: 0;
             }
         }
         */
    }


    // --- Zpracování Formulářů (pouze frontendová část) ---
    const newsletterForm = document.getElementById('newsletter-form');
    const contactForm = document.getElementById('contact-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Zastavit odeslání formuláře
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                alert('Děkujeme za přihlášení k odběru newsletteru na adresu: ' + emailInput.value + '\n(Toto je pouze ukázka, data se neodesílají.)');
                emailInput.value = ''; // Vyčistit pole
            } else {
                alert('Prosím, zadejte platnou e-mailovou adresu.');
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Zastavit odeslání formuláře
            alert('Děkujeme za vaši zprávu!\n(Toto je pouze ukázka, data se neodesílají.)');
            contactForm.reset(); // Vyčistit formulář
        });
    }

     // --- Scroll Animace (Jednoduchý Příklad - odhalení sekce) ---
     const sections = document.querySelectorAll('.section'); // Sledujeme všechny sekce

     const observerOptions = {
         root: null, // viewport
         rootMargin: '0px',
         threshold: 0.1 // Spustit, když je vidět 10% sekce
     };

     const observerCallback = (entries, observer) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 // Přidat třídu pro animaci, když sekce vstoupí do viewportu
                 entry.target.style.opacity = '1';
                 entry.target.style.transform = 'translateY(0)';
                 // Volitelně: Přestat sledovat po první animaci
                 // observer.unobserve(entry.target);
             } else {
                 // Volitelně: Skrýt znovu, když sekce opustí viewport
                 // entry.target.style.opacity = '0';
                 // entry.target.style.transform = 'translateY(20px)';
             }
         });
     };

     const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

     sections.forEach(section => {
         // Nastavit počáteční stav pro animaci (mimo obrazovku a průhledné)
         section.style.opacity = '0';
         section.style.transform = 'translateY(30px)';
         section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
         intersectionObserver.observe(section); // Začít sledovat sekci
     });


}); // Konec DOMContentLoaded