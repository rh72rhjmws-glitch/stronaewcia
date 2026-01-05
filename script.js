const startDates = {
    poznanie: new Date('2024-05-25T21:37:20'),
    zwiazek: new Date('2025-10-07T13:20:15')
};

const loadingTexts = [
    { time: 15, text: "POCZEKAJ CHWILKĘ..." },
    { time: 12, text: "ŁADUJE SIĘ..." },
    { time: 9, text: "JUŻ, JUŻ, CHWILECZKA..." },
    { time: 6, text: "JUŻ PRAWIE, EWCIA! ❤️" },
    { time: 3, text: "3... 2... 1..." }
];

let heartsSpawningInterval = null;
let particlesInterval = null;
let easterEggCode = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let clickCount = 0;
let lastClickTime = 0;
let currentMoment = 1; // 1, 2, lub 3
let galleryImages = [];
let currentImageIndex = 0;
let galleryAutoplayInterval = null;

// Photo gallery slideshow
function initializeGallery() {
    // Wczytaj dostępne zdjęcia (.jpg i .png)
    galleryImages = Array.from({length: 7}, (_, i) => ({
        src: `photos/ewa${i + 1}.png`,
        alt: `Zdjęcie ${i + 1}`
    }));
    
    const gallery = document.getElementById('photo-gallery');
    
    gallery.innerHTML = '';
    
    // Tworzę slides
    galleryImages.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `<img src="${img.src}" alt="${img.alt}" onerror="this.parentElement.innerHTML = '<div style=\"width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#ffd700;\">Brak zdjęcia</div>'">`;
        gallery.appendChild(slide);
    });
    
    // Uruchom auto-play
    startGalleryAutoplay();
}

function goToSlide(index) {
    if (index < 0 || index >= galleryImages.length) return;
    
    const slides = document.querySelectorAll('.gallery-slide');
    
    slides[currentImageIndex].classList.remove('active');
    currentImageIndex = index;
    slides[currentImageIndex].classList.add('active');
}

function nextSlide() {
    const nextIndex = (currentImageIndex + 1) % galleryImages.length;
    goToSlide(nextIndex);
}

function startGalleryAutoplay() {
    // Wyczyść istniejący interval
    if (galleryAutoplayInterval) {
        clearInterval(galleryAutoplayInterval);
    }
    
    // Zmień zdjęcie co 5 sekund
    galleryAutoplayInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopGalleryAutoplay() {
    if (galleryAutoplayInterval) {
        clearInterval(galleryAutoplayInterval);
        galleryAutoplayInterval = null;
    }
}

// Easter Egg - Konami Code
document.addEventListener('keydown', (e) => {
    easterEggCode.push(e.key);
    easterEggCode = easterEggCode.slice(-10);
    
    if (easterEggCode.join(',') === konamiCode.join(',')) {
        triggerEasterEgg();
        easterEggCode = [];
    }
});

// Update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-indicator');
    if (progressBar) {
        const progress = (currentMoment - 1) * 50;
        progressBar.style.width = progress + '%';
    }
}

// Liczniki czasu
function updateTimers() {
    const now = new Date();
    ['poznanie', 'zwiazek'].forEach(key => {
        const diff = now - startDates[key];
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const g = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        const el = document.getElementById(key + '-timer');
        if (el) {
            el.innerHTML = `<span>${d}<span class="unit">d</span></span> 
                           <span>${g}<span class="unit">h</span></span> 
                           <span>${m}<span class="unit">m</span></span> 
                           <span>${s}<span class="unit">s</span></span>`;
        }
    });
}

setInterval(updateTimers, 1000);
updateTimers();

// Uciekający przycisk
const btnNie = document.getElementById('btn-nie');
const btnTak = document.getElementById('btn-tak');

function moveButton() {
    const sound = document.getElementById('puke-sound');
    if (sound) {
        sound.play().catch(err => console.log('Could not play puke sound:', err));
    }
    const x = Math.random() * (window.innerWidth - btnNie.offsetWidth - 20) + 10;
    const y = Math.random() * (window.innerHeight - btnNie.offsetHeight - 20) + 10;
    btnNie.style.left = x + 'px';
    btnNie.style.top = y + 'px';
    const s = parseFloat(btnTak.style.transform.replace('scale(', '') || 1);
    btnTak.style.transform = `scale(${s + 0.1})`;
}

btnNie.addEventListener('mouseover', moveButton);
btnNie.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveButton();
});

// Kliknięcie TAK
btnTak.addEventListener('click', () => {
    clickCount++;
    triggerLightning();
    triggerWaveEffect();
    currentMoment = 2;
    updateProgressBar();
    
    // Confetti shower
    if (window.confetti) {
        window.confetti({
            particleCount: 100,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ffd700', '#ff0000', '#ffffff', '#ff69b4']
        });
    }
    
    // Check for special dates
    const specialDate = checkSpecialDates();
    if (specialDate) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: #ffd700;
            padding: 40px 60px;
            border: 3px solid #ffd700;
            border-radius: 20px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 10001;
            text-align: center;
            font-family: 'Dancing Script', cursive;
            animation: floatingText 3s ease-out forwards;
        `;
        msg.innerHTML = `${specialDate.emoji} ${specialDate.name} ${specialDate.emoji}`;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }
    
    document.getElementById('moment1').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('moment2').classList.remove('hidden');
        const music = document.getElementById('bg-music');
        if (music) {
            music.volume = 0.4;
            music.play().catch(err => console.log('Could not play background music:', err));
            setTimeout(() => createMusicVisualizer(), 100);
        }
        startCountdown();
    }, 600);
});

// Odliczanie
function startCountdown() {
    let time = 15;
    const timerEl = document.getElementById('timer-val');
    const progressEl = document.getElementById('progress-bar');
    const statusEl = document.getElementById('loading-text');
    const vizEl = document.getElementById('music-viz');
    
    if (vizEl) vizEl.style.display = 'flex';

    const interval = setInterval(() => {
        time--;
        if (timerEl) {
            timerEl.innerText = time;
            
            // Panic mode przy 5 sekundach
            if (time <= 5 && time > 0) {
                timerEl.classList.add('panic');
            } else {
                timerEl.classList.remove('panic');
            }
        }
        if (progressEl) progressEl.style.width = (time / 15 * 100) + '%';

        const currentStatus = loadingTexts.find(t => t.time === time);
        if (currentStatus && statusEl) {
            statusEl.style.opacity = 0;
            setTimeout(() => {
                statusEl.innerText = currentStatus.text;
                statusEl.style.opacity = 1;
            }, 250);
        }

        if (time <= 0) {
            clearInterval(interval);
            if (vizEl) vizEl.style.display = 'none';
            if (timerEl) timerEl.classList.remove('panic');
            showFinal();
        }
    }, 1000);
    
    spawnHearts();
}

// Finał
function showFinal() {
    document.getElementById('moment2').classList.add('hidden');
    triggerLightning();
    currentMoment = 3;
    updateProgressBar();
    
    setTimeout(() => {
        const m3 = document.getElementById('moment3');
        m3.classList.remove('hidden');
        
        // Reset photo index for fresh start
        currentImageIndex = 0;
        
        // Initialize gallery
        initializeGallery();

        // Confetti shower
        if (window.confetti) {
            window.confetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#ffd700', '#ff0000', '#ffffff']
            });
        }

        const t1 = "Kocham Cię najmocniej na całym świecie,";
        const t2 = "Dzięki ziom, że jesteś moją walentynką! ❤️";

        let i = 0, j = 0;
        function type() {
            if (i < t1.length) {
                document.getElementById('final-1').innerHTML += t1.charAt(i);
                i++;
                setTimeout(type, 40);
            } else if (j < t2.length) {
                document.getElementById('final-2').innerHTML += t2.charAt(j);
                j++;
                setTimeout(type, 40);
            }
        }
        setTimeout(type, 800);
    }, 600);
}

// Funkcja serduszek
function spawnHearts() {
    if (heartsSpawningInterval) {
        clearInterval(heartsSpawningInterval);
    }

    heartsSpawningInterval = setInterval(() => {
        const h = document.createElement('div');
        h.className = 'heart-particle';

        const icons = ['❤️', '💖', '✨', '🌹'];
        h.innerHTML = icons[Math.floor(Math.random() * 4)];

        h.style.left = Math.random() * 100 + 'vw';
        const size = (Math.random() * 20 + 15);
        h.style.fontSize = size + 'px';

        const duration = 3 + Math.random() * 3;
        h.style.animationDuration = duration + 's';

        document.body.appendChild(h);

        setTimeout(() => h.remove(), duration * 1000);
    }, 450);
}

// Obsługa błędów mediów
function handleMediaError(mediaElement, type) {
    console.error(`Błąd ładowania ${type}: ${mediaElement.src}`);
    if (type === 'music') {
        console.warn('Background music not available. Continuing without sound.');
    } else if (type === 'sound') {
        console.warn('Sound effect not available.');
    }
}

function handlePhotoError(photoElement) {
    console.error('Błąd ładowania zdjęcia:', photoElement.src);
    photoElement.classList.add('error');
    // Pokaż alternatywny tekst lub kontynuuj bez zdjęcia
    const finalContent = document.querySelector('.final-content');
    if (finalContent) {
        finalContent.style.background = 'linear-gradient(135deg, rgba(20,0,0,0.98), rgba(0,0,0,0.95))';
    }
}

// Setup media error handlers
document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bg-music');
    const pukeSound = document.getElementById('puke-sound');
    const finalPhoto = document.getElementById('final-photo');

    if (bgMusic) {
        bgMusic.addEventListener('error', () => handleMediaError(bgMusic, 'music'));
    }
    if (pukeSound) {
        pukeSound.addEventListener('error', () => handleMediaError(pukeSound, 'sound'));
    }
    if (finalPhoto) {
        finalPhoto.addEventListener('error', () => handlePhotoError(finalPhoto));
    }

    // Preloader
    window.addEventListener('load', () => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
        }
        updateProgressBar();
    });

    // Obsługa braku JavaScript warning
    document.body.style.display = 'block';
    
    // Start particle background
    generateParticles();
    
    // Initialize progress bar
    currentMoment = 1;
    updateProgressBar();
    
    // Show special date message on load
    const specialDate = checkSpecialDates();
    if (specialDate) {
        setTimeout(() => {
            const msg = document.createElement('div');
            msg.style.cssText = `
                position: fixed;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: #ffd700;
                padding: 30px 50px;
                border: 2px solid #ffd700;
                border-radius: 20px;
                font-size: 1.8rem;
                font-weight: bold;
                z-index: 10001;
                text-align: center;
                font-family: 'Dancing Script', cursive;
                animation: floatingText 4s ease-out forwards;
            `;
            msg.innerHTML = `${specialDate.emoji}<br>${specialDate.name}<br>${specialDate.emoji}`;
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 4000);
        }, 1500);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (heartsSpawningInterval) {
        clearInterval(heartsSpawningInterval);
    }
    if (particlesInterval) {
        clearInterval(particlesInterval);
    }
});

// Particle background generator
function generateParticles() {
    if (particlesInterval) {
        clearInterval(particlesInterval);
    }

    particlesInterval = setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
        const opacity = Math.random() * 0.3 + 0.1;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.background = `rgba(255, 215, 0, ${opacity})`;
        particle.style.animation = `floatParticle ${duration}s linear forwards`;
        
        document.querySelector('.bg-glow').appendChild(particle);
        
        setTimeout(() => particle.remove(), duration * 1000);
    }, 2000);
}

// Easter Egg
function triggerEasterEgg() {
    // Usuń poprzednią animację jeśli istnieje
    const oldStyle = document.getElementById('easter-egg-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'easter-egg-style';
    style.textContent = `
        @keyframes rainbowShift {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        body.easter-active {
            animation: rainbowShift 2s infinite !important;
        }
    `;
    document.head.appendChild(style);
    document.body.classList.add('easter-active');
    
    // Create confetti burst
    if (window.confetti) {
        window.confetti({
            particleCount: 300,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff']
        });
    }
    
    // Show easter egg message
    const easterMsg = document.createElement('div');
    easterMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #ffd700;
        padding: 30px 50px;
        border: 2px solid #ffd700;
        border-radius: 20px;
        font-size: 1.5rem;
        font-weight: bold;
        z-index: 10000;
        text-align: center;
        font-family: 'Dancing Script', cursive;
    `;
    easterMsg.innerHTML = '🎮 CHEATER MODE ACTIVATED! 🎮<br><small>Shhh, to nasza tajemnica 🤫</small>';
    document.body.appendChild(easterMsg);
    
    // Usuń efekt po 5 sekundach
    setTimeout(() => {
        document.body.classList.remove('easter-active');
        if (oldStyle) {
            oldStyle.remove();
        }
    }, 5000);
    
    setTimeout(() => easterMsg.remove(), 3000);
}

// Music Visualizer
function createMusicVisualizer() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const audio = document.getElementById('bg-music');
    
    try {
        const source = audioContext.createMediaElementAudioSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinData.length);
        
        function updateBars() {
            analyser.getByteFrequencyData(dataArray);
            
            const bars = document.querySelectorAll('.visualizer-bar');
            bars.forEach((bar, i) => {
                const value = dataArray[i * 2] || 0;
                const percent = (value / 255) * 100;
                bar.style.height = Math.max(20, percent) + '%';
            });
            
            requestAnimationFrame(updateBars);
        }
        
        // Resume audio context on user interaction
        if (audioContext.state === 'suspended') {
            document.addEventListener('click', () => {
                audioContext.resume();
            }, { once: true });
        }
        
        updateBars();
    } catch (err) {
        console.log('Music visualizer unavailable:', err);
    }
}

// Click anywhere particles + floating text
document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClickTime < 100) return; // Throttle
    lastClickTime = now;
    clickCount++;
    
    // Particle burst
    for (let i = 0; i < 8; i++) {
        const h = document.createElement('div');
        h.className = 'heart-particle';
        
        const icons = ['❤️', '💖', '✨', '💝'];
        h.innerHTML = icons[Math.floor(Math.random() * icons.length)];
        
        h.style.left = e.clientX + 'px';
        h.style.top = e.clientY + 'px';
        h.style.position = 'fixed';
        
        const size = Math.random() * 15 + 15;
        h.style.fontSize = size + 'px';
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = Math.random() * 200 + 100;
        h.style.setProperty('--vx', Math.cos(angle) * velocity);
        h.style.setProperty('--vy', Math.sin(angle) * velocity);
        
        const duration = 2 + Math.random() * 1;
        h.style.animationDuration = duration + 's';
        
        document.body.appendChild(h);
        
        setTimeout(() => h.remove(), duration * 1000);
    }
    
    // Floating text
    const texts = ['❤️', '💖', '✨', '🔥', '💫', 'KOCHAM CIĘ'];
    const floatText = document.createElement('div');
    floatText.className = 'click-text';
    floatText.innerHTML = texts[Math.floor(Math.random() * texts.length)];
    floatText.style.left = (e.clientX - 30) + 'px';
    floatText.style.top = (e.clientY - 30) + 'px';
    
    document.body.appendChild(floatText);
    setTimeout(() => floatText.remove(), 2000);
});

// Photo filters (cycle through with clicks on final photo)
let photoFilterIndex = 0;
const filters = ['', 'photo-filter-sepia', 'photo-filter-bw', 'photo-filter-vintage'];

function togglePhotoFilter() {
    const gallery = document.getElementById('photo-gallery');
    if (gallery) {
        const activeSlide = gallery.querySelector('.gallery-slide.active img');
        if (activeSlide) {
            activeSlide.parentElement.classList.remove('photo-filter-sepia', 'photo-filter-bw', 'photo-filter-vintage');
            photoFilterIndex = (photoFilterIndex + 1) % filters.length;
            if (filters[photoFilterIndex]) {
                activeSlide.parentElement.classList.add(filters[photoFilterIndex]);
            }
        }
    }
}

// Check if today is a special date
function checkSpecialDates() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Graduation date: 25.05
    // Relationship date: 07.10
    const specialDates = [
        { month: 5, day: 25, name: 'Poznania Rocznicy! 🌹', emoji: '🌹' },
        { month: 10, day: 7, name: 'Związku Rocznicy! 💑', emoji: '💑' },
        { month: 2, day: 14, name: 'Walentynek! 💕', emoji: '💕' }
    ];
    
    const today_date = specialDates.find(d => d.month === month && d.day === day);
    return today_date;
}

// Wave effect on screen transition
function triggerWaveEffect() {
    const bgGlow = document.querySelector('.bg-glow');
    if (bgGlow) {
        bgGlow.classList.add('wave-active');
        setTimeout(() => bgGlow.classList.remove('wave-active'), 3000);
    }
}

// Lightning flash on transition
function triggerLightning() {
    const overlay = document.createElement('div');
    overlay.className = 'lightning-overlay';
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.remove(), 400);
}
