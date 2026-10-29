/**
 * A Bouquet of Promises - Interactive Apology Web Experience
 * Core Logic & Configuration
 */

// ==========================================================================
// 1. CONFIGURATION OBJECT
// Customize messages, audio path, phone number, and letter content easily here.
// ==========================================================================
const CONFIG = {
  // Audio settings
  audioPath: 'Assets/bariye-dao-tomar-haat-lyrics-baaddiye-daao-teaamaar-haat-song-by-anupam-roy-haranath-chakraborty-128-ytshorts.savetube.me.mp3',
  initialVolume: 0.85,

  // Step 1: Landing
  landingQuote: `"I know I made a mistake, and I know I hurt you. If you’re open to hearing what's in my heart, tap the rose."`,

  // Step 2: Garden of Roses
  rose1Thought: `I hate that I became the reason for your pain. Your smile is truly my favorite thing in the world, and hurting you was never what I wanted. I take full responsibility for my actions.

The truth is, I only react this deeply because you mean so much to me and I feel you so close to my heart. When things get heavy, my default instinct has always been to shut down and go quiet, just like I told you before. But knowing it caused you hurt makes me realize that silence isn't protecting us; it's hurting us. I don't want my walls to come between us. I am genuinely committed to working on this and communicating better, especially with you.`,
  rose2Thought: `"You are not just a part of my life; you make everything feel lighter and safer. You lie in my heart. You shall be in there forever. My greatest wish is that you are happy when you think of me and I am, when I think of you!"`,
  rose3Thought: `"I believe that relationships aren't about never making mistakes. They're about never giving up. No matter how tough things get, I am never walking away from us. I will always fight for you, and I will always come back to you."`,

  // Step 3: Wax-Sealed Letter
  letterDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  letterSalutation: "To my Sleepy Owl,",
  letterContent: `I am deeply sorry for hurting you. Knowing that my words or actions caused a shadow over your face breaks my heart.

You bring warmth, honesty, and tenderness into my days, and seeing you hurt is the last thing I ever want.

Every relationship has storms, but every rough patch will only make my commitment to you stronger. I promise to listen deeper, to communicate better, and to always cherish what we have.

Whenever you are ready, I'm right here.`,
  letterSignature: "Forever by your side,",
  signatureName: "Mr. Interest",

  // Step 4: Slider Responses
  sliderResponses: {
    needTime: {
      threshold: 33,
      icon: "🕊️",
      message: `"Take all the time you need. I'm right here whenever you're ready, and I'm not going anywhere."`,
      badge: "No rush. Your feelings are always valid.",
      talkText: `Send a text: "I need some time..." 💛`,
      waMessage: "I need some time..."
    },
    listening: {
      threshold: 66,
      icon: "🌱",
      message: `"Thank you for listening to my heart. Even taking a gentle step forward means the world to me."`,
      badge: "Patience and understanding, every step of the way.",
      talkText: `Send a text: "I'm ready to talk" 💛`,
      waMessage: "I read your bouquet of promises... I'm ready to talk 💛"
    },
    forgive: {
      threshold: 100,
      icon: "💛",
      message: `"Thank you for your grace. I promise with all my heart to cherish it, to protect our bond, and to never let you down."`,
      badge: "A promise kept forever.",
      talkText: `Send a text: "I forgive you, let's talk" ✨`,
      waMessage: "I forgive you. Let's talk and hold each other close 💛"
    }
  },

  // WhatsApp Destination (leave empty or set a phone number e.g. "1234567890")
  whatsappNumber: ""
};

// ==========================================================================
// 2. AUDIO AUTOPLAY & CONTROLLER
// Ensures audio starts when opened, handling strict browser autoplay policies
// ==========================================================================
class AudioManager {
  constructor() {
    this.audio = document.getElementById('bg-audio');
    this.musicPill = document.getElementById('music-pill');
    this.statusText = document.getElementById('music-status');
    this.hasStarted = false;

    if (!this.audio) return;

    this.audio.volume = CONFIG.initialVolume;

    // Attach click toggle on the floating music pill
    this.musicPill.addEventListener('click', () => this.togglePlayback());

    // Attempt autoplay immediately
    this.attemptAutoplay();

    // Fallback: If browser blocks un-gestured autoplay, start on first user interaction anywhere
    this.attachFirstInteractionListener();
  }

  attemptAutoplay() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.setPlayingState(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy; will start on first touch/click
          this.setPlayingState(false);
        });
    }
  }

  attachFirstInteractionListener() {
    const triggerAudio = () => {
      if (!this.hasStarted) {
        this.audio.play().then(() => {
          this.setPlayingState(true);
        }).catch(() => {});
      }
      // Remove listeners once interacted
      window.removeEventListener('pointerdown', triggerAudio);
      window.removeEventListener('touchstart', triggerAudio);
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('keydown', triggerAudio);
    };

    window.addEventListener('pointerdown', triggerAudio, { passive: true });
    window.addEventListener('touchstart', triggerAudio, { passive: true });
    window.addEventListener('click', triggerAudio, { passive: true });
    window.addEventListener('keydown', triggerAudio, { passive: true });
  }

  setPlayingState(isPlaying) {
    if (isPlaying) {
      this.hasStarted = true;
      this.musicPill.classList.remove('paused');
      this.musicPill.classList.add('playing');
      if (this.statusText) this.statusText.textContent = "Playing Song";
    } else {
      this.musicPill.classList.remove('playing');
      this.musicPill.classList.add('paused');
      if (this.statusText) this.statusText.textContent = "Tap to Play";
    }
  }

  togglePlayback() {
    if (this.audio.paused) {
      this.audio.play().then(() => {
        this.setPlayingState(true);
      }).catch(err => console.log('Audio playback error:', err));
    } else {
      this.audio.pause();
      this.setPlayingState(false);
    }
  }

  playDirectly() {
    if (this.audio.paused) {
      this.audio.play().then(() => {
        this.setPlayingState(true);
      }).catch(() => {});
    }
  }
}

// ==========================================================================
// 3. CANVAS FALLING YELLOW ROSE PETALS
// 60fps organic fluttering particles
// ==========================================================================
class PetalCanvas {
  constructor() {
    this.canvas = document.getElementById('petal-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.maxPetals = window.innerWidth < 600 ? 16 : 26;

    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.maxPetals = window.innerWidth < 600 ? 16 : 26;
      if (this.petals.length > this.maxPetals) {
        this.petals.length = this.maxPetals;
      }
    });
    this.initPetals();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initPetals() {
    this.petals = [];
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }
  }

  createPetal(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -30,
      size: Math.random() * 12 + 10,
      speedY: Math.random() * 0.9 + 0.6,
      speedX: Math.random() * 0.6 - 0.3,
      angle: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? '#FCE588' : '#F5D061',
      opacity: Math.random() * 0.45 + 0.4
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY;
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.7;
      p.angle += p.rotationSpeed;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.angle * Math.PI) / 180);
      this.ctx.scale(Math.cos(p.wobble), 1);

      // Draw delicate rose petal curve
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 2, 0, p.size);
      this.ctx.bezierCurveTo(p.size, p.size / 2, p.size / 2, -p.size / 2, 0, 0);
      this.ctx.fill();

      // Soft vein line
      this.ctx.strokeStyle = '#E8B923';
      this.ctx.globalAlpha = p.opacity * 0.3;
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 2);
      this.ctx.quadraticCurveTo(2, p.size / 2, 0, p.size - 2);
      this.ctx.stroke();

      this.ctx.restore();

      // Reset when falling out of view
      if (p.y > this.canvas.height + 25 || p.x < -30 || p.x > this.canvas.width + 30) {
        this.petals[i] = this.createPetal(false);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================================================
// 4. SPARKLE BURST GENERATOR
// Visual reward when tapping roses or opening wax seal
// ==========================================================================
function triggerSparkles(x, y, count = 16) {
  const container = document.getElementById('sparkle-container');
  if (!container) return;

  const colors = ['#F5D061', '#E8B923', '#FFF1A8', '#FFE066', '#FFFFFF'];

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'sparkle-dot';
    const size = Math.random() * 7 + 4;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 75 + 25;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    dot.style.setProperty('--dx', `${dx}px`);
    dot.style.setProperty('--dy', `${dy}px`);

    container.appendChild(dot);
    setTimeout(() => dot.remove(), 900);
  }
}

// ==========================================================================
// 5. EXPERIENCE FLOW CONTROLLER (Step transitions, blooming, letter, slider)
// ==========================================================================
class ExperienceApp {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.currentStep = 1;
    this.bloomedRosesCount = 0;
    this.letterOpened = false;

    this.bindDomElements();
    this.applyConfig();
    this.attachEventListeners();
  }

  bindDomElements() {
    this.cards = {
      1: document.getElementById('card-step-1'),
      2: document.getElementById('card-step-2'),
      3: document.getElementById('card-step-3'),
      4: document.getElementById('card-step-4')
    };

    // Step 1
    this.landingRose = document.getElementById('landing-rose-btn');
    this.btnStart = document.getElementById('btn-start');
    this.landingQuoteElem = document.getElementById('landing-quote');

    // Step 2
    this.gardenItems = document.querySelectorAll('.garden-item');
    this.btnToLetter = document.getElementById('btn-to-letter');
    this.quoteRose1 = document.getElementById('quote-rose-1');
    this.quoteRose2 = document.getElementById('quote-rose-2');
    this.quoteRose3 = document.getElementById('quote-rose-3');

    // Step 3
    this.envelopeWrapper = document.getElementById('envelope-wrapper');
    this.waxSealBtn = document.getElementById('wax-seal-btn');
    this.letterSheet = document.getElementById('letter-sheet');
    this.letterDateDisplay = document.getElementById('letter-date-display');
    this.letterSalutation = document.getElementById('letter-salutation');
    this.letterText = document.getElementById('letter-text');
    this.letterSignature = document.getElementById('letter-signature');
    this.signatureName = document.getElementById('signature-name');
    this.letterActions = document.getElementById('letter-actions');
    this.btnToSlider = document.getElementById('btn-to-slider');

    // Step 4
    this.slider = document.getElementById('closure-slider');
    this.sliderFill = document.getElementById('slider-fill');
    this.responseIcon = document.getElementById('response-icon');
    this.responseMsg = document.getElementById('response-message');
    this.comfortBadge = document.getElementById('comfort-badge');
    this.whatsappBtn = document.getElementById('whatsapp-btn');
    this.talkBtnText = document.getElementById('talk-btn-text');
    this.restartTourBtn = document.getElementById('restart-tour-btn');
    this.markers = {
      left: document.querySelector('.marker-left'),
      center: document.querySelector('.marker-center'),
      right: document.querySelector('.marker-right')
    };
  }

  applyConfig() {
    if (this.landingQuoteElem) this.landingQuoteElem.textContent = CONFIG.landingQuote;
    if (this.quoteRose1) this.quoteRose1.textContent = CONFIG.rose1Thought;
    if (this.quoteRose2) this.quoteRose2.textContent = CONFIG.rose2Thought;
    if (this.quoteRose3) this.quoteRose3.textContent = CONFIG.rose3Thought;

    if (this.letterDateDisplay) this.letterDateDisplay.textContent = CONFIG.letterDate;
    if (this.letterSalutation) this.letterSalutation.textContent = CONFIG.letterSalutation;
    if (this.letterText) this.letterText.textContent = CONFIG.letterContent;
    if (this.signatureName) this.signatureName.textContent = CONFIG.signatureName;

    this.updateSliderState(50);
  }

  attachEventListeners() {
    // Step 1: Landing Rose & Start Button
    const startJourney = (e) => {
      this.audioManager.playDirectly();
      if (this.landingRose) {
        this.landingRose.classList.add('unfurl');
        const rect = this.landingRose.getBoundingClientRect();
        triggerSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
      }
      setTimeout(() => {
        this.goToStep(2);
      }, 700);
    };

    if (this.landingRose) {
      this.landingRose.addEventListener('click', startJourney);
      this.landingRose.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startJourney(e);
        }
      });
    }

    if (this.btnStart) {
      this.btnStart.addEventListener('click', startJourney);
    }

    // Step 2: Garden of Roses blooming
    this.gardenItems.forEach(item => {
      const trigger = item.querySelector('.rose-interactive');
      const clickHandler = (e) => {
        this.bloomRose(item, e);
      };

      if (trigger) {
        trigger.addEventListener('click', clickHandler);
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clickHandler(e);
          }
        });
      }
    });

    if (this.btnToLetter) {
      this.btnToLetter.addEventListener('click', () => {
        if (!this.btnToLetter.disabled) {
          this.goToStep(3);
        }
      });
    }

    // Step 3: Wax Seal & Letter
    if (this.waxSealBtn) {
      const openLetterHandler = (e) => {
        this.openWaxSeal(e);
      };
      this.waxSealBtn.addEventListener('click', openLetterHandler);
      this.waxSealBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLetterHandler(e);
        }
      });
    }

    if (this.btnToSlider) {
      this.btnToSlider.addEventListener('click', () => {
        this.goToStep(4);
      });
    }

    // Step 4: Slider
    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        this.updateSliderState(Number(e.target.value));
      });
    }

    if (this.restartTourBtn) {
      this.restartTourBtn.addEventListener('click', () => {
        this.resetJourney();
      });
    }
  }

  goToStep(stepNumber) {
    if (!this.cards[stepNumber]) return;

    // Fade out active
    if (this.cards[this.currentStep]) {
      this.cards[this.currentStep].classList.remove('active');
    }

    this.currentStep = stepNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      this.cards[stepNumber].classList.add('active');
    }, 150);
  }

  bloomRose(item, event) {
    if (item.classList.contains('bloomed')) return;

    item.classList.add('bloomed');
    this.bloomedRosesCount++;

    // Sparkle burst around the clicked flower
    const rect = item.getBoundingClientRect();
    const clickX = event.clientX || (rect.left + rect.width / 2);
    const clickY = event.clientY || (rect.top + 50);
    triggerSparkles(clickX, clickY, 18);

    // If all 3 bloomed, unlock button
    if (this.bloomedRosesCount >= 3) {
      setTimeout(() => {
        if (this.btnToLetter) {
          this.btnToLetter.classList.remove('locked');
          this.btnToLetter.disabled = false;
          // Soft attention pulse
          this.btnToLetter.style.animation = 'gentleBob 1.5s infinite ease-in-out';
          const btnRect = this.btnToLetter.getBoundingClientRect();
          triggerSparkles(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2, 22);
        }
      }, 700);
    }
  }

  openWaxSeal(event) {
    if (this.letterOpened) return;
    this.letterOpened = true;

    // Sparkles on seal break
    const rect = this.waxSealBtn.getBoundingClientRect();
    triggerSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

    // Animate envelope open
    this.envelopeWrapper.classList.add('opened');

    // Reveal continue button after letter unfolds
    setTimeout(() => {
      if (this.letterActions) {
        this.letterActions.style.display = 'block';
        this.letterActions.style.animation = 'gentleBob 2s infinite ease-in-out';
      }
    }, 1200);
  }

  updateSliderState(val) {
    let stateConfig;

    // Determine current phase
    if (val <= CONFIG.sliderResponses.needTime.threshold) {
      stateConfig = CONFIG.sliderResponses.needTime;
      this.setActiveMarker('left');
    } else if (val <= CONFIG.sliderResponses.listening.threshold) {
      stateConfig = CONFIG.sliderResponses.listening;
      this.setActiveMarker('center');
    } else {
      stateConfig = CONFIG.sliderResponses.forgive;
      this.setActiveMarker('right');
    }

    // Update dynamic text
    if (this.responseIcon) this.responseIcon.textContent = stateConfig.icon;
    if (this.responseMsg) this.responseMsg.textContent = stateConfig.message;
    if (this.comfortBadge) this.comfortBadge.textContent = stateConfig.badge;
    if (this.talkBtnText) this.talkBtnText.textContent = stateConfig.talkText;

    // Update WhatsApp link
    if (this.whatsappBtn) {
      const encodedMsg = encodeURIComponent(stateConfig.waMessage);
      const phoneParam = CONFIG.whatsappNumber ? `phone=${encodeURIComponent(CONFIG.whatsappNumber)}&` : '';
      this.whatsappBtn.href = `https://api.whatsapp.com/send?${phoneParam}text=${encodedMsg}`;
    }
  }

  setActiveMarker(pos) {
    if (!this.markers.left || !this.markers.center || !this.markers.right) return;
    this.markers.left.classList.toggle('active', pos === 'left');
    this.markers.center.classList.toggle('active', pos === 'center');
    this.markers.right.classList.toggle('active', pos === 'right');
  }

  resetJourney() {
    this.bloomedRosesCount = 0;
    this.letterOpened = false;

    // Reset garden
    this.gardenItems.forEach(item => item.classList.remove('bloomed'));
    if (this.btnToLetter) {
      this.btnToLetter.classList.add('locked');
      this.btnToLetter.disabled = true;
      this.btnToLetter.style.animation = 'none';
    }

    // Reset letter
    if (this.envelopeWrapper) this.envelopeWrapper.classList.remove('opened');
    if (this.letterActions) this.letterActions.style.display = 'none';

    // Reset slider
    if (this.slider) {
      this.slider.value = 50;
      this.updateSliderState(50);
    }

    // Return to step 1
    this.goToStep(1);
  }
}

// ==========================================================================
// 6. INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const audioManager = new AudioManager();
  new PetalCanvas();
  new ExperienceApp(audioManager);
});

