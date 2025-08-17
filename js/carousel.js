// AutoFlow Studio - Mobile-Optimized Carousel JavaScript
// Handles the work examples carousel with mobile video optimizations

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎠 DOM loaded, checking for carousel...');
    
    // Find the main carousel container on the page
    const carouselContainer = document.querySelector('.carousel-container');

    // ONLY run the carousel code if the container exists on this page
    if (carouselContainer) {
        console.log('🎠 Carousel container found, initializing...');
        initializeCarousel();
    } else {
        console.log('🎠 No carousel found on this page, skipping initialization.');
    }
});

/**
 * Initialize the carousel functionality with mobile optimizations
 */
function initializeCarousel() {
    console.log('🎠 Initializing mobile-optimized carousel...');
    
    const track = document.getElementById('carouselTrack');
    
    // Only initialize if carousel exists (home page)
    if (!track) {
        console.log('❌ Carousel track not found');
        return;
    }
    
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const indicatorsContainer = document.getElementById('indicators');
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const timerProgress = document.getElementById('timerProgress');
    const carouselContainer = document.querySelector('.carousel-container');
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    // Debug: Check if all elements are found
    console.log('🔍 Elements found:', {
        track: !!track,
        slides: slides.length,
        nextBtn: !!nextBtn,
        prevBtn: !!prevBtn,
        indicators: !!indicatorsContainer,
        autoPlayBtn: !!autoPlayBtn,
        timerProgress: !!timerProgress,
        container: !!carouselContainer,
        isMobile: isMobile
    });
    
    // Carousel state
    const slideCount = slides.length;
    let currentIndex = 0;
    let autoPlay = !isMobile; // Disable autoplay on mobile by default
    let autoPlayInterval;
    const autoPlayTime = isMobile ? 7000 : 5000; // Longer on mobile
    let isUserInteracting = false;
    
    // MOBILE VIDEO OPTIMIZATION: Setup all videos immediately
    optimizeVideosForMobile();
    
    // Create indicators
    createIndicators();
    
    // Initialize carousel
    updateCarousel(true);
    
    // Event listeners
    setupEventListeners();
    
    // Initialize with first timer start
    if (autoPlay) {
        startTimer();
    }
    
    console.log('✅ Mobile-optimized carousel initialized successfully');
    
    /**
     * MOBILE VIDEO OPTIMIZATION: Setup videos for mobile performance
     */
    function optimizeVideosForMobile() {
    console.log('📱 AGGRESSIVE mobile video optimization...');
    
    const videos = track.querySelectorAll('video');
    
    videos.forEach((video, index) => {
        console.log(`🎬 Setting up video ${index + 1} - Mobile: ${isMobile}`);
        
        // Essential attributes for ALL videos
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('preload', 'metadata');
        
        if (isMobile) {
            // MOBILE: Force native controls, remove custom ones
            console.log(`📱 MOBILE setup for video ${index + 1}`);
            
            // Force enable controls
            video.setAttribute('controls', '');
            video.controls = true;
            
            // Remove mute for better UX
            video.removeAttribute('muted');
            video.muted = false;
            
            // Hide all custom overlays
            const wrapper = video.closest('.video-wrapper');
            if (wrapper) {
                const overlay = wrapper.querySelector('.video-overlay');
                const controls = wrapper.querySelector('.video-controls');
                
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.style.opacity = '0';
                    overlay.style.visibility = 'hidden';
                    overlay.style.pointerEvents = 'none';
                }
                
                if (controls) {
                    controls.style.display = 'none';
                    controls.style.opacity = '0';
                    controls.style.visibility = 'hidden';
                    controls.style.pointerEvents = 'none';
                }
            }
            
            // Force video interactions
            video.style.pointerEvents = 'auto';
            video.style.webkitUserSelect = 'auto';
            video.style.userSelect = 'auto';
            
            // Show first frame
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = 0.1;
            });
            
        } else {
            // DESKTOP: Custom controls
            console.log(`🖥️ DESKTOP setup for video ${index + 1}`);
            video.removeAttribute('controls');
            video.setAttribute('muted', '');
            
            const wrapper = video.closest('.video-wrapper');
            if (!wrapper) return;
            
            wrapper.classList.add('paused');
            
            const playButton = wrapper.querySelector('.play-button');
            const pauseButton = wrapper.querySelector('.pause-button');
            const overlay = wrapper.querySelector('.video-overlay');
            
            function playVideo() {
                video.muted = false;
                wrapper.classList.remove('paused');
                wrapper.classList.add('playing');
                video.play().catch(console.error);
            }
            
            function pauseVideo() {
                wrapper.classList.remove('playing');
                wrapper.classList.add('paused');
                video.pause();
            }
            
            if (playButton) playButton.addEventListener('click', playVideo);
            if (pauseButton) pauseButton.addEventListener('click', pauseVideo);
            if (overlay) overlay.addEventListener('click', playVideo);
            
            video.addEventListener('ended', () => {
                pauseVideo();
                video.currentTime = 0;
                video.muted = true;
            });
        }
        
        // Error handling
        video.addEventListener('error', (e) => {
            console.error(`❌ Video ${index + 1} error:`, e);
        });
        
        console.log(`✅ Video ${index + 1} optimized for ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
    });
    
    console.log('✅ Aggressive mobile video optimization complete');
}
    
    /**
     * Create indicator dots
     */
    function createIndicators() {
        if (!indicatorsContainer) {
            console.log('❌ Indicators container not found');
            return;
        }
        
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < slideCount; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.setAttribute('data-slide', i);
            indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('tabindex', '0');
            indicatorsContainer.appendChild(indicator);
        }
        console.log(`🔘 Created ${slideCount} indicators`);
    }
    
    /**
     * Update carousel position and UI - ENHANCED WITH VIDEO INTEGRATION
     */
    function updateCarousel(isInstant = false) {
        // STOP ALL VIDEOS WHEN SLIDE CHANGES
        if (window.stopAllVideos) {
            window.stopAllVideos();
        }
        
        // Handle CSS transitions
        if (isInstant) {
            track.style.transition = 'none';
        }
        
        // Move track
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Restore transition after instant movement
        if (isInstant) {
            setTimeout(() => {
                track.style.transition = isMobile ? 
                    'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : // Faster on mobile
                    'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 50);
        }
        
        // Update indicators
        updateIndicators();
        
        // Update timer if autoplay is on
        if (autoPlay && !isUserInteracting) {
            resetTimer();
        }
        
        // Update ARIA attributes
        updateAriaAttributes();
        
        // MOBILE: Ensure current video shows first frame
        if (isMobile) {
            setTimeout(() => {
                const currentSlide = slides[currentIndex];
                const currentVideo = currentSlide.querySelector('video');
                if (currentVideo && currentVideo.paused) {
                    currentVideo.currentTime = 0.1;
                }
            }, 100);
        }
        
        console.log(`🎠 Updated to slide ${currentIndex + 1}/${slideCount}`);
    }
    
    /**
     * Update indicator states
     */
    function updateIndicators() {
        if (!indicatorsContainer) return;
        
        const indicators = indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
            indicator.setAttribute('aria-selected', index === currentIndex);
        });
    }
    
    /**
     * Update ARIA attributes for accessibility
     */
    function updateAriaAttributes() {
        slides.forEach((slide, index) => {
            const isActive = index === currentIndex;
            slide.setAttribute('aria-hidden', !isActive);
            
            // Update focusable elements within slides
            const focusableElements = slide.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            focusableElements.forEach(el => {
                el.setAttribute('tabindex', isActive ? '0' : '-1');
            });
        });
    }
    
    /**
     * Timer functions for autoplay
     */
    function startTimer() {
        if (!autoPlay || isUserInteracting || !timerProgress) return;
        
        clearTimeout(autoPlayInterval);
        
        // Reset progress bar
        timerProgress.style.transition = 'none';
        timerProgress.style.width = '0%';
        
        // Start progress animation
        setTimeout(() => {
            timerProgress.style.transition = `width ${autoPlayTime}ms linear`;
            timerProgress.style.width = '100%';
        }, 50);
        
        // Set timeout for next slide
        autoPlayInterval = setTimeout(() => {
            nextSlide();
        }, autoPlayTime);
    }
    
    function resetTimer() {
        startTimer();
    }
    
    function pauseTimer() {
        clearTimeout(autoPlayInterval);
        
        if (!timerProgress) return;
        
        // Pause progress bar animation
        const computedWidth = getComputedStyle(timerProgress).width;
        timerProgress.style.transition = 'none';
        timerProgress.style.width = computedWidth;
    }
    
    function stopTimer() {
        clearTimeout(autoPlayInterval);
        if (timerProgress) {
            timerProgress.style.transition = 'none';
            timerProgress.style.width = '0%';
        }
    }
    
    /**
     * Navigation functions
     */
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        updateCarousel();
        announceSlideChange();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateCarousel();
        announceSlideChange();
    }
    
    function goToSlide(index) {
        if (index >= 0 && index < slideCount && index !== currentIndex) {
            currentIndex = index;
            updateCarousel();
            announceSlideChange();
        }
    }
    
    /**
     * Toggle autoplay functionality
     */
    function toggleAutoPlay() {
        if (!autoPlayBtn) return;
        
        autoPlay = !autoPlay;
        autoPlayBtn.classList.toggle('active', autoPlay);
        autoPlayBtn.textContent = autoPlay ? 'Auto Play' : 'Manual';
        autoPlayBtn.setAttribute('aria-pressed', autoPlay);
        
        if (autoPlay) {
            startTimer();
        } else {
            stopTimer();
        }
        
        // Announce change to screen readers
        const announcement = autoPlay ? 'Autoplay enabled' : 'Autoplay disabled';
        announceToScreenReader(announcement);
        
        console.log(`🎮 Autoplay ${autoPlay ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Setup all event listeners with mobile optimizations
     */
    function setupEventListeners() {
        console.log('🎧 Setting up mobile-optimized event listeners...');
        
        // Navigation buttons
        if (nextBtn) {
            const nextHandler = () => {
                console.log('➡️ Next button clicked');
                setUserInteracting(true);
                nextSlide();
                setTimeout(() => setUserInteracting(false), isMobile ? 2000 : 1000);
            };
            
            nextBtn.addEventListener('click', nextHandler);
            
            // Better mobile touch handling
            if (isMobile) {
                nextBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    nextHandler();
                });
            }
        }
        
        if (prevBtn) {
            const prevHandler = () => {
                console.log('⬅️ Previous button clicked');
                setUserInteracting(true);
                prevSlide();
                setTimeout(() => setUserInteracting(false), isMobile ? 2000 : 1000);
            };
            
            prevBtn.addEventListener('click', prevHandler);
            
            // Better mobile touch handling
            if (isMobile) {
                prevBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    prevHandler();
                });
            }
        }
        
        // Autoplay toggle
        if (autoPlayBtn) {
            autoPlayBtn.addEventListener('click', toggleAutoPlay);
        }
        
        // Indicators with improved mobile touch
        if (indicatorsContainer) {
            const indicatorHandler = (e) => {
                if (e.target.classList.contains('indicator')) {
                    const slideIndex = parseInt(e.target.dataset.slide);
                    console.log(`🔘 Indicator ${slideIndex + 1} clicked`);
                    setUserInteracting(true);
                    goToSlide(slideIndex);
                    setTimeout(() => setUserInteracting(false), isMobile ? 2000 : 1000);
                }
            };
            
            indicatorsContainer.addEventListener('click', indicatorHandler);
            
            // Better mobile touch for indicators
            if (isMobile) {
                indicatorsContainer.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    indicatorHandler(e);
                });
            }
            
            // Keyboard navigation for indicators
            indicatorsContainer.addEventListener('keydown', (e) => {
                if (e.target.classList.contains('indicator') && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    const slideIndex = parseInt(e.target.dataset.slide);
                    setUserInteracting(true);
                    goToSlide(slideIndex);
                    setTimeout(() => setUserInteracting(false), isMobile ? 2000 : 1000);
                }
            });
        }
        
        // Mouse interaction with carousel (desktop only)
        if (carouselContainer && !isMobile) {
            carouselContainer.addEventListener('mouseenter', () => {
                if (autoPlay) {
                    pauseTimer();
                }
            });
            
            carouselContainer.addEventListener('mouseleave', () => {
                if (autoPlay && !isUserInteracting) {
                    resetTimer();
                }
            });
        }
        
        // Keyboard navigation (desktop only)
        if (!isMobile) {
            document.addEventListener('keydown', (e) => {
                if (!isOnHomePage() || !isCarouselVisible()) return;
                
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setUserInteracting(true);
                    prevSlide();
                    setTimeout(() => setUserInteracting(false), 1000);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setUserInteracting(true);
                    nextSlide();
                    setTimeout(() => setUserInteracting(false), 1000);
                }
            });
        }
        
        // Enhanced touch/swipe support for mobile
        setupMobileTouchSupport();
        
        // Visibility change (pause when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseTimer();
            } else if (autoPlay && !isUserInteracting) {
                resetTimer();
            }
        });
        
        // Orientation change handling for mobile
        if (isMobile) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    // Re-optimize videos after orientation change
                    optimizeVideosForMobile();
                    updateCarousel(true);
                }, 200);
            });
        }
        
        console.log('✅ Mobile-optimized event listeners set up');
    }
    
    /**
     * Enhanced mobile touch/swipe support
     */
    function setupMobileTouchSupport() {
        let startX = 0;
        let startY = 0;
        let moveX = 0;
        let moveY = 0;
        let isMoving = false;
        let touchStartTime = 0;
        
        const touchOptions = { passive: false };
        
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isMoving = true;
            setUserInteracting(true);
            
            // Pause autoplay during touch
            if (autoPlay) {
                pauseTimer();
            }
        }, { passive: true });
        
        track.addEventListener('touchmove', (e) => {
            if (!isMoving) return;
            
            moveX = e.touches[0].clientX;
            moveY = e.touches[0].clientY;
            
            // Calculate distances
            const deltaX = Math.abs(moveX - startX);
            const deltaY = Math.abs(moveY - startY);
            
            // If horizontal movement is greater than vertical, prevent scrolling
            if (deltaX > deltaY && deltaX > 15) { // Increased threshold for mobile
                e.preventDefault();
            }
        }, touchOptions);
        
        track.addEventListener('touchend', (e) => {
            if (!isMoving) return;
            
            const endX = e.changedTouches[0].clientX;
            const deltaX = startX - endX;
            const touchDuration = Date.now() - touchStartTime;
            const minSwipeDistance = isMobile ? 80 : 50; // Larger threshold on mobile
            const maxSwipeTime = 500; // Maximum time for a swipe
            
            // Only trigger swipe if it's fast enough and far enough
            if (Math.abs(deltaX) > minSwipeDistance && touchDuration < maxSwipeTime) {
                if (deltaX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            
            isMoving = false;
            
            // Resume autoplay after touch interaction
            setTimeout(() => {
                setUserInteracting(false);
                if (autoPlay) {
                    resetTimer();
                }
            }, isMobile ? 2000 : 1000);
        }, { passive: true });
        
        // Prevent context menu on long touch
        track.addEventListener('contextmenu', (e) => {
            if (isMobile) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Utility functions
     */
    function setUserInteracting(interacting) {
        isUserInteracting = interacting;
        console.log(`👤 User interacting: ${interacting}`);
    }
    
    function isOnHomePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return currentPage === 'index.html' || currentPage === '';
    }
    
    function isCarouselVisible() {
        if (!carouselContainer) return false;
        const rect = carouselContainer.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    function announceSlideChange() {
        const titleElement = slides[currentIndex].querySelector('.work-content h2');
        if (titleElement) {
            const currentSlideTitle = titleElement.textContent;
            announceToScreenReader(`Now showing: ${currentSlideTitle}`);
        }
    }
    
    function announceToScreenReader(message) {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('carousel-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'carousel-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
    }
    
    /**
     * Pause carousel for video playback - called from video controls
     */
    function pauseCarouselForVideo() {
        if (autoPlay && autoPlayInterval) {
            if (autoPlayBtn) {
                autoPlayBtn.dataset.pausedByVideo = 'true';
            }
            
            clearTimeout(autoPlayInterval);
            
            if (timerProgress) {
                const computedWidth = getComputedStyle(timerProgress).width;
                timerProgress.style.transition = 'none';
                timerProgress.style.width = computedWidth;
            }
            
            console.log('⏸️ Carousel paused for video');
        }
    }

    /**
     * Resume carousel after video stops - called from video controls
     */
    function resumeCarouselAfterVideo() {
        if (autoPlayBtn && 
            autoPlayBtn.dataset.pausedByVideo === 'true' && 
            autoPlay) {
            
            delete autoPlayBtn.dataset.pausedByVideo;
            resetTimer();
            
            console.log('▶️ Carousel resumed after video');
        }
    }

    // Make functions globally available for video integration
    window.pauseCarouselForVideo = pauseCarouselForVideo;
    window.resumeCarouselAfterVideo = resumeCarouselAfterVideo;
    
    // Export carousel controls for external use
    window.CarouselControls = {
        goToSlide: (index) => {
            console.log(`🎠 External call: goToSlide(${index})`);
            goToSlide(index);
        },
        next: () => {
            console.log('🎠 External call: next()');
            nextSlide();
        },
        prev: () => {
            console.log('🎠 External call: prev()');
            prevSlide();
        },
        toggleAutoPlay: () => {
            console.log('🎠 External call: toggleAutoPlay()');
            toggleAutoPlay();
        },
        isMobile: () => isMobile
    };
}

// Confirm mobile-optimized carousel is loaded
console.log('🎠📱 Mobile-optimized carousel JavaScript loaded with video integration support');
