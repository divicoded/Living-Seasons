// ===============================
// UTILITIES & INITIALIZATION
// ===============================
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);

// DOM Elements
const timeEl = $('time'), dateEl = $('date'), greetingEl = $('greeting'), greetingSubtitleEl = $('greetingSubtitle');
const seasonNameEl = $('seasonName'), desktopSeasonNameEl = $('desktopSeasonName'), quotesContainer = $('quotesContainer');
const hourHand = $('hourHand'), minuteHand = $('minuteHand'), secondHand = $('secondHand'), clockMarkers = $('clockMarkers');
const fabSettings = $('fabSettings'), fabMenu = $('fabMenu');
const nameInput = $('nameInput'), particlesToggle = $('particlesToggle'), soundToggle = $('soundToggle'), hapticToggle = $('hapticToggle');
const statusToggle = $('statusToggle'), statusIndicator = $('statusIndicator'), statusText = $('statusText');
const mobileClockContainer = $('mobileClockContainer');

// Mobile clock elements
const mobileHourHand = $('mobileHourHand'), mobileMinuteHand = $('mobileMinuteHand'), mobileSecondHand = $('mobileSecondHand');
const mobileClockMarkers = $('mobileClockMarkers'), mobileDigitalTime = $('mobileDigitalTime'), mobileDigitalDate = $('mobileDigitalDate');

// Cards for gyro effects
const profileCard = $('profileCard'), mazeCard = $('mazeCard'), poemCard = $('poemCard');

// Canvas setup
const canvas = $('particles');
const ctx = canvas.getContext('2d', { alpha: true });
let DPR = 1, logicalW = 1, logicalH = 1;

// Season definitions
const SEASONS = ['vasant', 'grishma', 'varsha', 'sharad', 'hemant', 'shishir'];
const SEASON_LABELS = {
    vasant: 'Vasant',
    grishma: 'Grishma',
    varsha: 'Varsha',
    sharad: 'Sharad',
    hemant: 'Hemant',
    shishir: 'Shishir'
};

// ===============================
// LOADING SCREEN
// ===============================
window.addEventListener('load', () => {
  setTimeout(() => {
    $('loadingScreen').classList.add('hidden');
  }, 1500);
});

// ===============================
// STATUS TOGGLE FUNCTIONALITY
// ===============================
function updateStatus(isOnline) {
  if (isOnline) {
    statusIndicator.classList.remove('offline');
    statusIndicator.classList.add('online');
    statusText.textContent = 'ONLINE';
  } else {
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
    statusText.textContent = 'OFFLINE';
  }
}

// Initialize status toggle
statusToggle.checked = safeGetItem('status_online', 'on') !== 'off';
updateStatus(statusToggle.checked);

statusToggle.addEventListener('change', () => {
  safeSetItem('status_online', statusToggle.checked ? 'on' : 'off');
  updateStatus(statusToggle.checked);
  triggerHapticFeedback(10);
});

// ===============================
// LOCALSTORAGE SAFETY FUNCTIONS
// ===============================
function safeGetItem(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn('localStorage access denied, using default value for:', key);
    return defaultValue;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('localStorage access denied, could not save:', key);
    return false;
  }
}

// ===============================
// HAPTIC FEEDBACK FUNCTION
// ===============================
function triggerHapticFeedback(duration = 10) {
  if (navigator.vibrate && hapticToggle.checked) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('Vibration API not supported or blocked');
    }
  }
}

// ===============================
// LAZY LOADING FOR PROJECT IMAGES
// ===============================
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy-image');
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

// ===============================
// GYRO-BASED PARALLAX EFFECTS
// ===============================
function initGyroParallax() {
  if (!window.DeviceOrientationEvent) {
    console.log('Device orientation not supported');
    return;
  }

  let isGyroEnabled = false;
  
  function handleOrientation(event) {
    if (!isGyroEnabled) return;
    
    const beta = event.beta;  // -180 to 180 (front-to-back tilt)
    const gamma = event.gamma; // -90 to 90 (left-to-right tilt)
    
    // Normalize values to reasonable ranges for parallax
    const tiltX = gamma ? gamma / 45 : 0; // -2 to 2
    const tiltY = beta ? (beta - 90) / 45 : 0; // -2 to 2
    
    // Apply subtle transform to cards
    if (profileCard) {
      profileCard.style.transform = `perspective(1000px) rotateX(${tiltY * 2}deg) rotateY(${tiltX * 2}deg) translateZ(10px)`;
    }
    
    if (mazeCard) {
      mazeCard.style.transform = `perspective(1000px) rotateX(${tiltY * 3}deg) rotateY(${tiltX * 3}deg) translateZ(15px)`;
    }
    
    if (poemCard) {
      poemCard.style.transform = `perspective(1000px) rotateX(${tiltY * 3}deg) rotateY(${tiltX * 3}deg) translateZ(15px)`;
    }
  }
  
  // Enable gyro on user interaction
  document.addEventListener('click', function enableGyro() {
    if (!isGyroEnabled && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      isGyroEnabled = true;
      document.removeEventListener('click', enableGyro);
    }
  });
}

// ===============================
// SEASON DETECTION FUNCTION
// ===============================
function getSeasonByMonth() {
    const now = new Date();
    const month = now.getMonth() + 1; 

    if (month === 1) return 'shishir';        // January: Winter
    if (month === 2) return 'vasant';         // February: Spring
    if (month === 3) return 'vasant';         // March: Spring
    if (month === 4) return 'grishma';        // April: Summer
    if (month === 5) return 'grishma';        // May: Summer
    if (month === 6) return 'varsha';         // June: Monsoon
    if (month === 7) return 'varsha';         // July: Monsoon
    if (month === 8) return 'varsha';         // August: Monsoon
    if (month === 9) return 'varsha';         // September: Monsoon
    if (month === 10) return 'sharad';        // October: Autumn
    if (month === 11) return 'hemant';        // November: Pre-winter
    if (month === 12) return 'hemant';        // December: Pre-winter
    
    return 'hemant'; // Default fallback
}

// ===============================
// CLOCK & GREETING FUNCTIONS
// ===============================
function formatClock(d) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMobileDate(d) {
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

let tickAudio;
function initTickSound() {
    if (tickAudio) return;
    const ctxA = new (window.AudioContext || window.webkitAudioContext)();
    tickAudio = () => {
        const o = ctxA.createOscillator(), g = ctxA.createGain();
        o.type = 'square'; 
        o.frequency.value = 850;
        g.gain.value = 0.0015;
        o.connect(g); 
        g.connect(ctxA.destination);
        o.start(); 
        setTimeout(() => { o.stop() }, 30);
    };
}

function updateClock() {
    const now = new Date();
    timeEl.textContent = formatClock(now);
    dateEl.textContent = formatDate(now);
    
    // Update mobile clock
    mobileDigitalTime.textContent = formatClock(now);
    mobileDigitalDate.textContent = formatMobileDate(now);

    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;
    
    // Update desktop clock hands
    hourHand.style.transform = `rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    secondHand.style.transform = `rotate(${secondAngle}deg)`;
    
    // Update mobile clock hands
    mobileHourHand.style.transform = `rotate(${hourAngle}deg)`;
    mobileMinuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    mobileSecondHand.style.transform = `rotate(${secondAngle}deg)`;
    
    const h = now.getHours();
    const name = safeGetItem('greet_name', 'Friend');
    let greeting, subtitle;
    
    if (h >= 0 && h < 4) {
        greeting = `Good Night, ${name}...`;
        subtitle = 'Time to rest and recharge for tomorrow.';
    } else if (h >= 4 && h < 12) {
        greeting = `Good Morning, ${name}...`;
        subtitle = 'Hope you have a productive day ahead!';
    } else if (h >= 12 && h < 16) {
        greeting = `Good Afternoon, ${name}...`;
        subtitle = 'Keep up the great work today!';
    } else {
        greeting = `Good Evening, ${name}...`;
        subtitle = 'Time to unwind and reflect on today.';
    }
    
    greetingEl.textContent = greeting;
    greetingSubtitleEl.textContent = subtitle;

    if (soundToggle.checked && !prefersReduced) {
        try {
            initTickSound();
            tickAudio();
        } catch (e) {}
    }
}

function createClockMarkers() {
    clockMarkers.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const marker = document.createElement('div');
        marker.className = `clock-marker ${i % 5 === 0 ? 'hour' : 'minute'}`;
        marker.style.transform = `rotate(${i * 6}deg)`;
        clockMarkers.appendChild(marker);
    }
}

function createMobileClockMarkers() {
    mobileClockMarkers.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const marker = document.createElement('div');
        marker.className = `mobile-clock-marker ${i % 5 === 0 ? 'hour' : 'minute'}`;
        marker.style.transform = `rotate(${i * 6}deg)`;
        mobileClockMarkers.appendChild(marker);
    }
}

createClockMarkers();
createMobileClockMarkers();
updateClock();
if (!prefersReduced) setInterval(updateClock, 1000);

// ===============================
// CANVAS & PARTICLE SYSTEM
// ===============================
function resizeCanvas() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    logicalW = Math.max(1, Math.floor(window.innerWidth));
    logicalH = Math.max(1, Math.floor(window.innerHeight));
    canvas.width = Math.max(1, Math.floor(logicalW * DPR));
    canvas.height = Math.max(1, Math.floor(logicalH * DPR));
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

resizeCanvas();

let _resizeTimer = null;
window.addEventListener('resize', () => {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
        resizeCanvas();
        if (window.Particle && window.Particle.reflow) window.Particle.reflow();
    }, 120);
});

// Mouse interaction for particles
const mouse = { x: 0, y: 0, vx: 0, vy: 0, down: false };
window.addEventListener('mousemove', (e) => {
    const px = mouse.x, py = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.vx = mouse.x - px;
    mouse.vy = mouse.y - py;
});
window.addEventListener('mousedown', () => mouse.down = true);
window.addEventListener('mouseup', () => mouse.down = false);

function createParticleEngine(initialMode) {
    let parts = [], ripples = [], flares = [];
    let running = true, mode = initialMode || 'hemant', last = performance.now();
    let rafId = null;
    const maxCounts = { vasant: 80, grishma: 100, varsha: 200, sharad: 120, hemant: 90, shishir: 80 };

    function rnd(a, b) { return Math.random() * (b - a) + a; }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // Function to draw a sakura petal
    function drawSakuraPetal(ctx, size, rotation) {
        ctx.save();
        ctx.rotate(rotation);
        
        // Sakura petal shape (simplified)
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.bezierCurveTo(
            size/2, -size/2,
            size/2, size/2,
            0, size/2
        );
        ctx.bezierCurveTo(
            -size/2, size/2,
            -size/2, -size/2,
            0, -size/2
        );
        
        ctx.fillStyle = 'rgba(255, 200, 220, 0.9)';
        ctx.fill();
        
        // Add subtle details
        ctx.beginPath();
        ctx.moveTo(0, -size/3);
        ctx.lineTo(0, size/3);
        ctx.strokeStyle = 'rgba(255, 150, 180, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    // Function to draw a snowflake
    function drawSnowflake(ctx, size, rotation) {
        ctx.save();
        ctx.rotate(rotation);
        
        // Draw a classic 6-armed snowflake
        for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            
            ctx.save();
            ctx.rotate(angle);
            
            // Main arm
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, size);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Side branches
            for (let j = 1; j <= 3; j++) {
                const branchPos = j * size / 4;
                
                ctx.beginPath();
                ctx.moveTo(0, branchPos);
                ctx.lineTo(size/4, branchPos + size/8);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, branchPos);
                ctx.lineTo(-size/4, branchPos + size/8);
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    function newParticle() {
        const p = {
            x: rnd(0, logicalW), y: rnd(-60, logicalH + 60), vx: 0, vy: 0, r: 1,
            ang: rnd(0, Math.PI * 2), spin: rnd(-0.05, 0.05), type: 'dot', alpha: 1,
            color: '#fff', z: rnd(0.4, 1.2), windOffset: rnd(0, Math.PI * 2)
        };

        if (mode === 'vasant') {
            p.type = 'sakura';
            p.r = rnd(4, 8);
            p.vx = rnd(-0.28, 0.35);
            p.vy = rnd(0.18, 0.55);
            p.color = 'rgba(255,200,220,0.9)';
            p.spin = rnd(-0.06, 0.06);
        } else if (mode === 'grishma') {
            p.type = Math.random() < 0.12 ? 'leaf' : 'dust';
            if (p.type === 'dust') {
                p.r = rnd(0.8, 2.8);
                p.vx = rnd(0.05, 0.45);
                p.vy = rnd(-0.02, 0.18);
                p.color = 'rgba(255,205,110,0.9)';
                p.alpha = rnd(0.35, 0.9);
            } else {
                p.r = rnd(6, 12);
                p.vx = rnd(0.1, 0.6);
                p.vy = rnd(0.05, 0.25);
                p.color = 'rgba(255,180,90,0.95)';
                p.spin = rnd(-0.2, 0.2);
            }
        } else if (mode === 'varsha') {
            p.type = 'rain';
            p.r = rnd(1.5, 2.5);
            // Natural rain physics - slight variation in speed and direction
            p.vx = rnd(-0.1, 0.1);
            p.vy = rnd(0.85, 1.8);
            p.color = 'rgba(170,210,240,0.98)';
            p.windOffset = rnd(0, Math.PI * 2);
        } else if (mode === 'sharad') {
            p.type = 'leaf';
            p.r = rnd(6, 13);
            p.vx = rnd(-0.6, 0.45);
            p.vy = rnd(0.25, 0.7);
            p.color = 'rgba(255,170,80,0.98)';
            p.spin = rnd(-0.3, 0.3);
        } else if (mode === 'hemant') {
            p.type = Math.random() < 0.25 ? 'mist' : 'dewdrop';
            if (p.type === 'mist') {
                p.r = rnd(60, 140);
                p.vx = rnd(0.02, 0.12);
                p.vy = rnd(-0.02, 0.04);
                p.alpha = rnd(0.05, 0.12);
            } else {
                p.r = rnd(1.4, 3.6);
                p.vx = rnd(-0.2, 0.2);
                p.vy = rnd(0.08, 0.35);
                p.color = 'rgba(220,240,255,0.96)';
            }
        } else {
            p.type = 'snowflake';
            p.r = rnd(3, 6);
            p.vx = rnd(-0.2, 0.2);
            p.vy = rnd(0.08, 0.32);
            p.color = 'rgba(240,248,255,0.96)';
        }
        return p;
    }

    function init(count) {
        parts = [];
        for (let i = 0; i < count; i++) parts.push(newParticle());
    }

    function reflow() {
        for (let p of parts) {
            p.x = clamp(p.x / logicalW * logicalW, 0, logicalW);
            p.y = clamp(p.y / logicalH * logicalH, -50, logicalH + 50);
        }
    }

    function setMode(m) {
        mode = m;
        init(maxCounts[mode] || 90);

        // Prepare lens flares for summer
        flares = [];
        if (mode === 'grishma') {
            const n = 2 + Math.floor(rnd(0, 2));
            for (let i = 0; i < n; i++) {
                flares.push({
                    x: rnd(0, logicalW),
                    y: rnd(0, logicalH * 0.6),
                    r: rnd(120, 240),
                    t: rnd(0, Math.PI * 2),
                    speed: rnd(0.0002, 0.0005)
                });
            }
        }
    }

    function addRipple(x, y) {
        ripples.push({ x, y, r: 2, alpha: 0.35 });
    }

    function drawFlare(f) {
        const cx = f.x + Math.cos(f.t) * 120;
        const cy = f.y + Math.sin(f.t) * 60;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, f.r);
        g.addColorStop(0, 'rgba(255,255,255,0.35)');
        g.addColorStop(0.35, 'rgba(255,220,180,0.22)');
        g.addColorStop(1, 'rgba(255,200,120,0.0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        f.t += f.speed * (prefersReduced ? 0 : 1);
    }

    function step(now) {
        const dt = Math.min(40, now - last);
        last = now;

        if (!running) {
            rafId = null;
            return;
        }

        ctx.clearRect(0, 0, logicalW, logicalH);

        // Flares layer for summer
        if (mode === 'grishma' && flares.length) {
            for (const f of flares) drawFlare(f);
        }

        for (const p of parts) {
            // Mouse wind interaction
            const dx = (p.x - mouse.x), dy = (p.y - mouse.y);
            const dist = Math.hypot(dx, dy) || 1;
            const influence = particlesToggle.checked && !prefersReduced ? Math.max(0, 1 - dist / 180) : 0;
            p.vx += (-dx / dist) * 0.04 * influence + (mouse.vx * 0.002 * influence);
            p.vy += (-dy / dist) * 0.02 * influence + (mouse.vy * 0.002 * influence);

            // Season forces
            if (mode === 'vasant') {
                p.vx += Math.sin(p.ang * 0.7 + now * 0.0005) * 0.01;
                p.vy += 0.006 * (dt / 16);
                p.ang += p.spin * 0.01;
            } else if (mode === 'grishma') {
                p.vx += Math.sin((p.y / logicalH * 6) + now * 0.0008) * 0.02;
                p.vy += 0.002 * (dt / 16);
            } else if (mode === 'varsha') {
                // Natural rain physics - slight wind effect
                p.vx += Math.sin(now * 0.0005 + p.windOffset) * 0.02;
                p.vy += 0.03 * (dt / 16);
            } else if (mode === 'sharad') {
                p.vx += Math.sin((p.y / logicalH * 8) + p.ang) * 0.035;
                p.vy += 0.008 * (dt / 16);
                p.ang += p.spin * 0.018;
            } else if (mode === 'hemant') {
                if (p.type === 'mist') {
                    p.vx += 0.004;
                } else {
                    p.vy += 0.004 * (dt / 16);
                }
            } else if (mode === 'shishir') {
                if (p.type === 'snowflake') {
                    p.vy += 0.004 * (dt / 16);
                }
                p.vx += Math.sin(now * 0.0006 + p.y * 0.02) * 0.006;
                p.ang += p.spin * 0.01;
            }

            // Damping and integration
            p.vx *= 0.995;
            p.vy *= 0.997;
            p.x += p.vx * (dt / 16) * p.z;
            p.y += p.vy * (dt / 16) * p.z;

            // Draw
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.globalAlpha = p.alpha;

            if (p.type === 'sakura') {
                drawSakuraPetal(ctx, p.r * 2, p.ang);
            } else if (p.type === 'dust') {
                ctx.beginPath();
                ctx.arc(0, 0, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = p.alpha * 0.08;
                ctx.beginPath();
                ctx.arc(0, 0, p.r * 2.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = p.alpha;
            } else if (p.type === 'leaf') {
                ctx.rotate(Math.sin(p.ang) * 0.6);
                ctx.beginPath();
                ctx.moveTo(0, -p.r / 2);
                ctx.bezierCurveTo(p.r * 1.2, -p.r, p.r * 1.1, p.r, 0, p.r * 1.2);
                ctx.bezierCurveTo(-p.r * 1.1, p.r, -p.r * 1.2, -p.r, 0, -p.r / 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            } else if (p.type === 'rain') {
                // Draw realistic raindrop
                ctx.beginPath();
                ctx.moveTo(0, -p.r * 4);
                ctx.lineTo(-p.r, -p.r * 2);
                ctx.lineTo(0, 0);
                ctx.lineTo(p.r, -p.r * 2);
                ctx.closePath();
                
                const g = ctx.createLinearGradient(0, -p.r * 4, 0, 0);
                g.addColorStop(0, 'rgba(255,255,255,0.9)');
                g.addColorStop(1, p.color);
                ctx.fillStyle = g;
                ctx.fill();
                
                if (p.y > logicalH - 2) {
                    addRipple(p.x, logicalH - 3);
                }
            } else if (p.type === 'mist') {
                const g = ctx.createRadialGradient(0, 0, p.r * 0.1, 0, 0, p.r);
                g.addColorStop(0, 'rgba(255,255,255,0.08)');
                g.addColorStop(1, 'rgba(255,255,255,0.0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(0, 0, p.r, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'dewdrop') {
                ctx.beginPath();
                ctx.arc(0, 0, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(-p.r * 0.3, -p.r * 0.4, p.r * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = p.alpha;
            } else if (p.type === 'snowflake') {
                drawSnowflake(ctx, p.r * 2, p.ang);
            }
            ctx.restore();

            // Recycle particles that go off-screen
            if (p.y > logicalH + 80 || p.x < -140 || p.x > logicalW + 140 || p.y < -140) {
                const idx = parts.indexOf(p);
                parts[idx] = newParticle();
                parts[idx].x = Math.random() * logicalW;
                parts[idx].y = -10 - Math.random() * 40;
            }
        }

        // Draw ripples (monsoon)
        for (let i = ripples.length - 1; i >= 0; i--) {
            const rp = ripples[i];
            ctx.beginPath();
            ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180,210,240,${rp.alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            rp.r += 0.9;
            rp.alpha -= 0.015;
            if (rp.alpha <= 0) ripples.splice(i, 1);
        }

        // schedule next frame
        rafId = requestAnimationFrame(step);
    }

    function pause() {
        running = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        ctx.clearRect(0, 0, logicalW, logicalH);
    }

    function resume() {
        if (!prefersReduced && !running) {
            running = true;
            last = performance.now();
            rafId = requestAnimationFrame(step);
        }
    }

    setMode(mode);
    rafId = requestAnimationFrame(step);

    return { setMode, pause, resume, reflow };
}

// Determine the initial season based on current month
let activeSeason = getSeasonByMonth();
const Particle = createParticleEngine(activeSeason);
window.Particle = Particle;

// ===============================
// CAROUSEL NAVIGATION FUNCTIONALITY
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    // Activate the tab corresponding to the current season
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === activeSeason) {
            tab.classList.add('active');
        }
    });
    
    // Add click event listeners to all tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Skip if already active
            if (tabId === activeSeason) return;
            
            // Update active season
            activeSeason = tabId;
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Set the season
            setSeason(tabId);
            
            // Trigger haptic feedback
            triggerHapticFeedback(15);
            
            // Animate the transition
            gsap.fromTo('.time-card', 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
        });
    });
});

// ===============================
// SEASON STATE MANAGEMENT
// ===============================
function setSeason(s) {
    activeSeason = s;
    seasonNameEl.textContent = SEASON_LABELS[s] || 'Season';
    desktopSeasonNameEl.textContent = SEASON_LABELS[s] || 'Season';
    document.body.className = s;
    
    if (Particle && Particle.setMode) Particle.setMode(s);
}

// ===============================
// FLOATING SETTINGS MENU FUNCTIONALITY
// ===============================
fabSettings.addEventListener('click', () => {
    fabMenu.classList.toggle('open');
    triggerHapticFeedback(5);
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!fabSettings.contains(e.target) && !fabMenu.contains(e.target)) {
        fabMenu.classList.remove('open');
    }
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fabMenu.classList.remove('open');
    }
});

// Initialize settings with safe localStorage access
nameInput.value = safeGetItem('greet_name', 'Div');
nameInput.addEventListener('input', (e) => {
    safeSetItem('greet_name', e.target.value || 'Friend');
    updateClock();
});

particlesToggle.checked = safeGetItem('particles_on', 'on') !== 'off';
particlesToggle.addEventListener('change', () => {
    safeSetItem('particles_on', particlesToggle.checked ? 'on' : 'off');
    if (!particlesToggle.checked) {
        Particle.pause();
        ctx.clearRect(0, 0, logicalW, logicalH);
    } else {
        Particle.resume();
    }
    triggerHapticFeedback(5);
});

soundToggle.checked = safeGetItem('tick_sound', 'off') === 'on';
soundToggle.addEventListener('change', () => {
    safeSetItem('tick_sound', soundToggle.checked ? 'on' : 'off');
    triggerHapticFeedback(5);
});

hapticToggle.checked = safeGetItem('haptic_feedback', 'off') === 'on';
hapticToggle.addEventListener('change', () => {
    safeSetItem('haptic_feedback', hapticToggle.checked ? 'on' : 'off');
    triggerHapticFeedback(10);
});

// Honor persisted toggles at load
if (safeGetItem('particles_on', 'on') === 'off') {
    Particle.pause();
}

// ===============================
// MOBILE CLOCK INTERACTIONS
// ===============================
let mobileClockMode = 0; // 0 = analog, 1 = digital, 2 = date
mobileClockContainer.addEventListener('click', () => {
    mobileClockMode = (mobileClockMode + 1) % 3;
    
    // Trigger haptic feedback
    triggerHapticFeedback(8);
    
    // Visual feedback
    mobileClockContainer.style.transform = 'scale(0.98)';
    setTimeout(() => {
        mobileClockContainer.style.transform = '';
    }, 150);
});

// ===============================
// PROJECT CARDS TILT EFFECT
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    // Subtle 2.5D tilt effect for project cards
    document.querySelectorAll(".creations-container .card[data-tilt]").forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * 10;
            const rotateY = ((x - centerX) / centerX) * -10;
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
        });
    });
});

// ===============================
// INITIALIZE ENHANCEMENTS
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading
    initLazyLoading();
    
    // Initialize gyro parallax effects
    initGyroParallax();
    
    // Initialize season UI
    setSeason(activeSeason);
});