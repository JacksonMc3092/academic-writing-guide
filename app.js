(function(){
  try {
    var page = document.body && document.body.getAttribute('data-page');
    switch(page){
    case 'chapter-1':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced annotation system
        function toggleAnnotation(item) {
            item.classList.toggle('selected');
            updatePersonalKey();
            
            // Add haptic feedback on mobile
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }

        function updatePersonalKey() {
            const selectedItems = document.querySelectorAll('.annotation-item.selected');
            let keyHTML = '';
            
            if (selectedItems.length > 0) {
                keyHTML = '<ul>';
                selectedItems.forEach(item => {
                    keyHTML += `<li>${item.innerHTML}</li>`;
                });
                keyHTML += '</ul>';
            } else {
                keyHTML = '<p style="color: var(--gray); font-style: italic;">Select elements above to build your personal annotation key</p>';
            }
            
            document.getElementById('personalKey').innerHTML = keyHTML;
        }

        // Enhanced scroll progress with color transition (from Chapter 6)
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced progress tracking
        function updateProgress() {
            const checkboxes = document.querySelectorAll('.progress-checkbox');
            let checked = 0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) checked++;
            });
            
            const progress = (checked / checkboxes.length) * 100;
            const progressIndicator = document.getElementById('progressIndicator');
            const progressPercent = document.getElementById('progressPercent');
            
            if (progressIndicator && progressPercent) {
                progressIndicator.style.width = progress + '%';
                progressPercent.textContent = Math.round(progress) + '%';
                
                // Add celebration effect at 100%
                if (progress === 100) {
                    progressIndicator.style.background = 'linear-gradient(to right, var(--success), var(--accent))';
                    if (navigator.vibrate) {
                        navigator.vibrate([100, 50, 100]);
                    }
                }
            }
        }

        // Enhanced dark mode toggle with animation - FIXED
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // Intersection Observer for animations
        function initIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = Math.random() * 0.3 + 's';
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe all major content blocks
            document.querySelectorAll('.section, .stats-bar, .annotation-example, .interactive-element').forEach(el => {
                observer.observe(el);
            });
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Set up checkbox event listeners
            document.querySelectorAll('.progress-checkbox, .system-checkbox, .benefit-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateProgress);
            });
            
            // Initialize other features
            initSmoothScrolling();
            initIntersectionObserver();
            updatePersonalKey();
            updateScrollProgress();
            
            // Focus management for accessibility
            document.querySelectorAll('.section-header, .btn, .video-link, .sidebar-link').forEach(element => {
                element.addEventListener('focus', function() {
                    this.setAttribute('data-focused', 'true');
                });
                element.addEventListener('blur', function() {
                    this.removeAttribute('data-focused');
                });
            });
            
            console.log('Scholar\'s Compass - Chapter 1 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });

        // Add CSS animation class
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.6s ease-out forwards;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    
      break;

    case 'chapter-2':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // Update progress tracker
        function updateProgress() {
            const checkboxes = document.querySelectorAll('.progress-checkbox');
            let checked = 0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) checked++;
            });
            
            const progress = (checked / checkboxes.length) * 100;
            document.getElementById('progressIndicator').style.width = progress + '%';
            document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Set up checkbox event listeners
            document.querySelectorAll('.progress-checkbox, .sq3r-checkbox, .annotation-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateProgress);
            });
            
            // Initialize other features
            initSmoothScrolling();
            updateScrollProgress();
            
            console.log('Scholar\'s Compass - Chapter 2 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-3':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // Skills progress tracker
        function updateSkillsProgress() {
            const checkboxes = document.querySelectorAll('.skill-checkbox');
            let checked = 0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) checked++;
            });
            
            // Save progress
            localStorage.setItem('skillsProgress', checked);
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Set up checkbox event listeners
            document.querySelectorAll('.skill-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateSkillsProgress);
            });
            
            // Initialize other features
            initSmoothScrolling();
            updateScrollProgress();
            
            console.log('Scholar\'s Compass - Chapter 3 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-4':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // ========== CONVERSATION VISUALIZER ==========
        const conversationExamples = [
            {
                source: "Technology in classrooms distracts from learning.",
                response: "When used intentionally, technology can enhance engagement and access.",
                counter: "But without proper training, technology often becomes an expensive distraction."
            },
            {
                source: "Renewable energy is too expensive to implement widely.",
                response: "Long-term savings and environmental benefits outweigh initial costs.",
                counter: "The transition costs could disproportionately affect low-income communities."
            },
            {
                source: "Standardized tests measure student ability accurately.",
                response: "They primarily measure test-taking skills, not comprehensive learning.",
                counter: "While imperfect, they provide valuable comparable data across diverse populations."
            }
        ];

        let currentConversation = 0;

        function changeConversation() {
            currentConversation = (currentConversation + 1) % conversationExamples.length;
            const example = conversationExamples[currentConversation];
            
            const viz = document.getElementById('conversationViz');
            viz.innerHTML = `
                <div class="conversation-bubble bubble-source">
                    <strong>Original Claim:</strong> "${example.source}"
                </div>
                <div class="conversation-bubble bubble-response">
                    <strong>Response:</strong> "${example.response}"
                </div>
                <div class="conversation-bubble bubble-counter">
                    <strong>Counterargument:</strong> "${example.counter}"
                </div>
            `;
        }

        // ========== POSITION SELECTOR ==========
        function selectPosition(type) {
            // Remove selected class from all options
            document.querySelectorAll('.position-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            event.currentTarget.classList.add('selected');
            
            // Show explanation
            const explanation = document.getElementById('positionExplanation');
            
            const explanations = {
                agree: {
                    text: "Agreeing with an argument while adding new evidence or perspectives strengthens existing scholarship and shows you've engaged deeply with the conversation.",
                    example: '"While Johnson makes compelling points about social media\'s risks, her analysis would benefit from considering recent studies on digital community building."'
                },
                disagree: {
                    text: "Disagreeing requires substantial evidence and careful reasoning. Effective disagreement acknowledges strengths before presenting counterevidence.",
                    example: '"Although Smith\'s data appears thorough, alternative methodologies reveal different patterns that challenge his conclusions."'
                },
                complicate: {
                    text: "Complicating an argument acknowledges its validity while identifying limitations, exceptions, or additional considerations that create a more nuanced understanding.",
                    example: '"While Thompson correctly identifies the problem, the solution requires addressing underlying systemic issues that current proposals overlook."'
                }
            };
            
            explanation.innerHTML = `
                <h4>${type.charAt(0).toUpperCase() + type.slice(1)} Position</h4>
                <p>${explanations[type].text}</p>
                <div class="example-box" style="margin: 10px 0;">
                    <strong>Example:</strong> ${explanations[type].example}
                </div>
            `;
        }

        function savePosition() {
            const positionText = document.querySelector('#section3 textarea').value;
            if (positionText) {
                localStorage.setItem('savedPosition', positionText);
                alert('Position saved!');
            }
        }

        function clearPosition() {
            document.querySelector('#section3 textarea').value = '';
        }

        // ========== COUNTERARGUMENT BUILDER ==========
        function generateCounterargument() {
            const claim = document.getElementById('mainClaim').value;
            const counter = document.getElementById('counterargument').value;
            const responseType = document.getElementById('responseType').value;
            const response = document.getElementById('response').value;
            
            if (!claim || !counter) {
                alert('Please enter both your main claim and a counterargument.');
                return;
            }
            
            let output = `<strong>Your Claim:</strong> ${claim}<br><br>`;
            output += `<strong>Counterargument:</strong> ${counter}<br><br>`;
            
            if (response) {
                output += `<strong>Your Response:</strong> ${response}`;
            } else if (responseType) {
                const responses = {
                    acknowledge: `While this perspective has merit, it doesn't fundamentally undermine my claim because...`,
                    refute: `This objection overlooks key evidence that supports my position, specifically...`,
                    redefine: `If we reconsider what we mean by "${claim.split(' ')[0]}", this concern actually supports my argument because...`,
                    concede: `I concede this point, but it doesn't invalidate my overall argument because...`
                };
                output += `<strong>Suggested Response:</strong> ${responses[responseType]}`;
            }
            
            document.getElementById('argumentOutput').innerHTML = output;
            
            // Save to local storage
            localStorage.setItem('counterargumentData', JSON.stringify({
                claim, counter, responseType, response
            }));
        }

        // ========== DATA MANAGEMENT ==========
        function loadSavedData() {
            // Load saved position
            const savedPosition = localStorage.getItem('savedPosition');
            if (savedPosition) {
                const textarea = document.querySelector('#section3 textarea');
                if (textarea) textarea.value = savedPosition;
            }
            
            // Load counterargument data
            const savedCounterargument = localStorage.getItem('counterargumentData');
            if (savedCounterargument) {
                const data = JSON.parse(savedCounterargument);
                document.getElementById('mainClaim').value = data.claim || '';
                document.getElementById('counterargument').value = data.counter || '';
                document.getElementById('responseType').value = data.responseType || '';
                document.getElementById('response').value = data.response || '';
                
                if (data.claim && data.counter) {
                    generateCounterargument();
                }
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Initialize other features
            initSmoothScrolling();
            loadSavedData();
            updateScrollProgress();
            
            // Initialize conversation visualizer
            changeConversation();
            
            console.log('Scholar\'s Compass - Chapter 4 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-5':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // ========== INTERACTIVE FEATURES ==========

        // Check answer for interactive quiz
        function checkAnswer(btn, answer) {
            const buttons = btn.parentElement.querySelectorAll('button');
            buttons.forEach(b => {
                b.style.backgroundColor = '';
                b.style.color = '';
            });
            
            if (answer === 'correct') {
                btn.style.backgroundColor = '#28a745';
                btn.style.color = 'white';
                setTimeout(() => {
                    alert('Correct! Use quotes when the original wording is uniquely powerful or precise.');
                }, 100);
            } else {
                btn.style.backgroundColor = '#dc3545';
                btn.style.color = 'white';
                setTimeout(() => {
                    alert('Not quite. Focus on the strategic value of the original wording.');
                }, 100);
            }
        }

        // Generate quote sandwich template
        function generateSandwich() {
            const topBun = document.getElementById('topBun').value;
            const meat = document.getElementById('meat').value;
            const bottomBun = document.getElementById('bottomBun').value;
            
            if (topBun && meat && bottomBun) {
                const result = `${topBun} ${meat} ${bottomBun}`;
                document.getElementById('sandwichResult').textContent = result;
                document.getElementById('sandwichOutput').style.display = 'block';
                
                // Save to localStorage
                localStorage.setItem('quoteSandwich', JSON.stringify({
                    topBun, meat, bottomBun, result
                }));
            } else {
                alert('Please fill out all parts of the sandwich!');
            }
        }

        // Copy sandwich to clipboard
        function copySandwich() {
            const sandwichText = document.getElementById('sandwichResult').textContent;
            navigator.clipboard.writeText(sandwichText).then(() => {
                alert('Quote sandwich copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = sandwichText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Quote sandwich copied to clipboard!');
            });
        }

        // Check paraphrase
        function checkParaphrase() {
            const paraphrase = document.getElementById('paraphraseInput').value;
            const feedback = document.getElementById('paraphraseFeedback');
            const feedbackText = document.getElementById('feedbackText');
            
            if (!paraphrase) {
                alert('Please write a paraphrase first!');
                return;
            }
            
            // Simple checks for paraphrase quality
            if (paraphrase.length < 20) {
                feedback.className = 'feedback improve';
                feedbackText.innerHTML = '<strong>Needs improvement:</strong> Your paraphrase seems too short. Try to capture the full meaning of the original text.';
            } else if (paraphrase.toLowerCase().includes('proliferation') || 
                      paraphrase.toLowerCase().includes('fundamentally altered')) {
                feedback.className = 'feedback improve';
                feedbackText.innerHTML = '<strong>Good attempt, but:</strong> Try to use more of your own words rather than copying phrases from the original. Make sure you\'re truly restating the idea in your own words.';
            } else if (paraphrase.split(' ').length < 10) {
                feedback.className = 'feedback improve';
                feedbackText.innerHTML = '<strong>Too brief:</strong> Your paraphrase doesn\'t seem to capture the full meaning of the original. Try to expand on the key ideas.';
            } else {
                feedback.className = 'feedback good';
                feedbackText.innerHTML = '<strong>Excellent work!</strong> Your paraphrase successfully rephrases the original text while maintaining its meaning. Remember to always cite the original source!';
            }
            
            feedback.style.display = 'block';
            
            // Save paraphrase attempt
            localStorage.setItem('paraphraseAttempt', paraphrase);
        }

        // Update progress tracker
        function updateProgress() {
            const checkboxes = document.querySelectorAll('#section5 input[type="checkbox"]');
            let checked = 0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) checked++;
            });
            
            const progress = (checked / checkboxes.length) * 100;
            document.getElementById('progressIndicator').style.width = progress + '%';
            document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
            
            // Save progress
            const progressData = Array.from(checkboxes).map(cb => cb.checked);
            localStorage.setItem('chapter5Progress', JSON.stringify(progressData));
        }

        // Load saved data
        function loadSavedData() {
            // Load quote sandwich data
            const savedSandwich = localStorage.getItem('quoteSandwich');
            if (savedSandwich) {
                const data = JSON.parse(savedSandwich);
                document.getElementById('topBun').value = data.topBun || '';
                document.getElementById('meat').value = data.meat || '';
                document.getElementById('bottomBun').value = data.bottomBun || '';
                
                if (data.result) {
                    document.getElementById('sandwichResult').textContent = data.result;
                    document.getElementById('sandwichOutput').style.display = 'block';
                }
            }
            
            // Load paraphrase attempt
            const savedParaphrase = localStorage.getItem('paraphraseAttempt');
            if (savedParaphrase) {
                document.getElementById('paraphraseInput').value = savedParaphrase;
            }
            
            // Load progress
            const savedProgress = localStorage.getItem('chapter5Progress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                const checkboxes = document.querySelectorAll('#section5 input[type="checkbox"]');
                checkboxes.forEach((checkbox, index) => {
                    if (progressData[index]) {
                        checkbox.checked = true;
                    }
                });
                updateProgress();
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Initialize other features
            initSmoothScrolling();
            loadSavedData();
            updateScrollProgress();
            
            console.log('Scholar\'s Compass - Chapter 5 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-6':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // ========== BLOOM'S TAXONOMY VISUALIZER ==========
        function showBloomDetails(level) {
            const details = document.getElementById('bloomsDetails');
            const descriptions = {
                remember: "<strong>Remember:</strong> Retrieve relevant knowledge from long-term memory. (Recognizing, recalling)",
                understand: "<strong>Understand:</strong> Construct meaning from instructional messages. (Interpreting, exemplifying, classifying, summarizing, inferring, comparing, explaining)",
                apply: "<strong>Apply:</strong> Carry out or use a procedure in a given situation. (Executing, implementing)",
                analyze: "<strong>Analyze:</strong> Break material into constituent parts and determine how parts relate to one another and to an overall structure or purpose. (Differentiating, organizing, attributing)",
                evaluate: "<strong>Evaluate:</strong> Make judgments based on criteria and standards. (Checking, critiquing)",
                create: "<strong>Create:</strong> Put elements together to form a coherent or functional whole; reorganize elements into a new pattern or structure. (Generating, planning, producing)"
            };
            
            details.innerHTML = `<p>${descriptions[level]}</p>`;
        }

        // ========== THESIS BUILDER ==========
        function generateThesis() {
            const textTitle = document.getElementById('textTitle').value;
            const analyticalFocus = document.getElementById('analyticalFocus').value;
            const analyticalInsight = document.getElementById('analyticalInsight').value;
            
            if (!textTitle || !analyticalFocus || !analyticalInsight) {
                alert('Please fill in all fields to generate a thesis.');
                return;
            }
            
            const thesisOutput = document.getElementById('thesisOutput');
            thesisOutput.innerHTML = `
                <strong>Your Thesis Statement:</strong><br><br>
                In ${textTitle}, ${analyticalInsight} through ${analyticalFocus}.
            `;
            
            // Save to local storage
            localStorage.setItem('thesisData', JSON.stringify({
                textTitle, analyticalFocus, analyticalInsight
            }));
        }

        // ========== QUOTE SANDWICH BUILDER ==========
        function generateQuoteSandwich() {
            const frontLoad = document.getElementById('frontLoad').value;
            const quoteText = document.getElementById('quoteText').value;
            const quoteAnalysis = document.getElementById('quoteAnalysis').value;
            
            if (!frontLoad || !quoteText || !quoteAnalysis) {
                alert('Please fill in all fields to generate a quote sandwich.');
                return;
            }
            
            const quoteOutput = document.getElementById('quoteOutput');
            quoteOutput.innerHTML = `
                <p>${frontLoad} ${quoteText} ${quoteAnalysis}</p>
            `;
            
            // Save to local storage
            localStorage.setItem('quoteData', JSON.stringify({
                frontLoad, quoteText, quoteAnalysis
            }));
        }

        // ========== DATA MANAGEMENT ==========
        function loadSavedData() {
            // Load saved thesis data
            const savedThesis = localStorage.getItem('thesisData');
            if (savedThesis) {
                const data = JSON.parse(savedThesis);
                document.getElementById('textTitle').value = data.textTitle || '';
                document.getElementById('analyticalFocus').value = data.analyticalFocus || '';
                document.getElementById('analyticalInsight').value = data.analyticalInsight || '';
                
                if (data.textTitle && data.analyticalFocus && data.analyticalInsight) {
                    generateThesis();
                }
            }
            
            // Load saved quote data
            const savedQuote = localStorage.getItem('quoteData');
            if (savedQuote) {
                const data = JSON.parse(savedQuote);
                document.getElementById('frontLoad').value = data.frontLoad || '';
                document.getElementById('quoteText').value = data.quoteText || '';
                document.getElementById('quoteAnalysis').value = data.quoteAnalysis || '';
                
                if (data.frontLoad && data.quoteText && data.quoteAnalysis) {
                    generateQuoteSandwich();
                }
            }
        }

        function savePosition() {
            const positionText = document.querySelector('#section3 textarea').value;
            if (positionText) {
                localStorage.setItem('savedPosition', positionText);
                alert('Position saved!');
            }
        }

        function clearPosition() {
            document.querySelector('#section3 textarea').value = '';
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Initialize other features
            initSmoothScrolling();
            loadSavedData();
            updateScrollProgress();
            
            // Initialize Bloom's Taxonomy visualizer
            showBloomDetails('remember');
            
            console.log('Scholar\'s Compass - Chapter 6 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-7':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // ========== CHAPTER-SPECIFIC FUNCTIONS ==========

        // Thesis generation function
        function generateThesis() {
            const topic = document.getElementById('topic').value;
            const problem = document.getElementById('problem').value;
            const questions = document.getElementById('questions').value;
            const research = document.getElementById('research').value;
            const thesis = document.getElementById('thesis').value;
            
            let output = "";
            
            if (thesis.trim() !== "") {
                output = `<strong>Your Thesis:</strong> ${thesis}`;
            } else if (problem.trim() !== "" && research.trim() !== "") {
                // Generate a basic thesis based on the inputs
                output = `<strong>Generated Thesis:</strong> This paper argues that ${problem}, based on research showing that ${research}.`;
            } else {
                output = "Please fill in at least the Problem and Research fields to generate a thesis.";
            }
            
            document.getElementById('thesisOutput').innerHTML = output;
            
            // Save to localStorage
            localStorage.setItem('thesisBuilderData', JSON.stringify({
                topic, problem, questions, research, thesis
            }));
        }

        // Simple thesis analysis
        function analyzeThesis() {
            const thesisText = document.getElementById('templatePractice').value;
            if (thesisText.trim() === "") {
                alert("Please enter a thesis statement to analyze.");
                return;
            }
            
            // Simple analysis based on length and content
            let feedback = "";
            
            if (thesisText.length < 20) {
                feedback = "Your thesis might be too short. Try to make it more specific.";
            } else if (thesisText.length > 200) {
                feedback = "Your thesis might be too long or complex. Try to simplify it to one clear main idea.";
            } else {
                feedback = "Good length! Now check if your thesis is arguable and specific.";
            }
            
            // Check for argument indicators
            if (thesisText.includes("although") || thesisText.includes("while") || thesisText.includes("however")) {
                feedback += " You're using good transitional words to show complexity.";
            }
            
            if (thesisText.includes("I argue") || thesisText.includes("this paper argues") || thesisText.includes("contends")) {
                feedback += " Good use of argumentative language!";
            }
            
            alert(feedback);
            
            // Save to localStorage
            localStorage.setItem('templatePractice', thesisText);
        }

        // Update skills progress
        function updateSkillsProgress() {
            const checkboxes = document.querySelectorAll('.skill-checkbox');
            let checked = 0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) checked++;
            });
            
            // Save progress
            const progressData = Array.from(checkboxes).map(cb => cb.checked);
            localStorage.setItem('chapter7Progress', JSON.stringify(progressData));
        }

        // Load saved data
        function loadSavedData() {
            // Load thesis builder data
            const savedThesisData = localStorage.getItem('thesisBuilderData');
            if (savedThesisData) {
                const data = JSON.parse(savedThesisData);
                document.getElementById('topic').value = data.topic || '';
                document.getElementById('problem').value = data.problem || '';
                document.getElementById('questions').value = data.questions || '';
                document.getElementById('research').value = data.research || '';
                document.getElementById('thesis').value = data.thesis || '';
                
                if (data.thesis) {
                    generateThesis();
                }
            }
            
            // Load template practice
            const savedTemplate = localStorage.getItem('templatePractice');
            if (savedTemplate) {
                document.getElementById('templatePractice').value = savedTemplate;
            }
            
            // Load progress
            const savedProgress = localStorage.getItem('chapter7Progress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                const checkboxes = document.querySelectorAll('.skill-checkbox');
                checkboxes.forEach((checkbox, index) => {
                    if (progressData[index]) {
                        checkbox.checked = true;
                    }
                });
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Set up checkbox event listeners
            document.querySelectorAll('.skill-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateSkillsProgress);
            });
            
            // Initialize other features
            initSmoothScrolling();
            loadSavedData();
            updateScrollProgress();
            
            console.log('Scholar\'s Compass - Chapter 7 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-8':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // ========== CHAPTER-SPECIFIC FUNCTIONS ==========

        // PIE Paragraph generation function
        function generatePIEParagraph() {
            const point = document.getElementById('point').value;
            const illustration = document.getElementById('illustration').value;
            const explanation = document.getElementById('explanation').value;
            
            let output = "";
            
            if (point.trim() !== "" && illustration.trim() !== "" && explanation.trim() !== "") {
                output = `<strong>Point:</strong> ${point}<br><br><strong>Illustration:</strong> ${illustration}<br><br><strong>Explanation:</strong> ${explanation}`;
            } else {
                output = "Please fill in all three fields to generate a PIE paragraph.";
            }
            
            document.getElementById('pieOutput').innerHTML = output;
            
            // Save to localStorage
            localStorage.setItem('pieBuilderData', JSON.stringify({
                point, illustration, explanation
            }));
        }

        // Load saved data
        function loadSavedData() {
            // Load PIE builder data
            const savedPieData = localStorage.getItem('pieBuilderData');
            if (savedPieData) {
                const data = JSON.parse(savedPieData);
                document.getElementById('point').value = data.point || '';
                document.getElementById('illustration').value = data.illustration || '';
                document.getElementById('explanation').value = data.explanation || '';
                
                if (data.point && data.illustration && data.explanation) {
                    generatePIEParagraph();
                }
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Initialize other features
            initSmoothScrolling();
            loadSavedData();
            updateScrollProgress();
            
            console.log('Scholar\'s Compass - Chapter 8 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'chapter-9':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;
        let sectionStates = {};

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const savedStates = localStorage.getItem('sectionStates');
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
            
            if (savedStates) {
                sectionStates = JSON.parse(savedStates);
                Object.keys(sectionStates).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section && sectionStates[sectionId]) {
                        section.classList.add('active');
                    }
                });
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced section toggling with state persistence
        function toggleSection(header) {
            const section = header.parentNode;
            const sectionId = section.id;
            
            section.classList.toggle('active');
            sectionStates[sectionId] = section.classList.contains('active');
            savePreferences();
            
            if (section.classList.contains('active')) {
                // Smooth scroll to section with offset for navbar
                const yOffset = -80;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                
                // Update URL hash
                history.replaceState(null, null, '#' + sectionId);
            }
        }

        // Enhanced scroll progress with color transition
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update progress bar width
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = scrolled + "%";
            
            // Calculate color transition (blue to orange)
            const orangePercentage = Math.min(scrolled / 100, 1);
            const bluePercentage = 1 - orangePercentage;
            
            // Create gradient with color transition
            progressBar.style.background = 
                `linear-gradient(to right, 
                var(--primary) 0%, 
                color-mix(in srgb, var(--primary) ${bluePercentage * 100}%, var(--secondary) ${orangePercentage * 100}%) ${scrolled}%, 
                var(--secondary) 100%)`;
            
            // Update quick nav active states
            updateQuickNavActiveStates();
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Quick navigation active states
        function updateQuickNavActiveStates() {
            const sections = document.querySelectorAll('.section');
            const quickNavLinks = document.querySelectorAll('.quick-nav a');
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isInView = rect.top <= 100 && rect.bottom >= 100;
                
                if (isInView) {
                    quickNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                        
                        // Expand section if it's collapsed
                        if (target.classList.contains('section') && !target.classList.contains('active')) {
                            target.classList.add('active');
                            sectionStates[target.id] = true;
                            savePreferences();
                        }
                    }
                });
            });
        }

        // ========== CLUSTER DIAGRAM FUNCTIONALITY ==========
        let clusterNodes = [];
        let clusterConnections = [];
        let nextNodeId = 1;
        let isDragging = false;
        let dragNode = null;
        let dragOffset = { x: 0, y: 0 };

        function addClusterNode() {
            const clusterContainer = document.getElementById('clusterDiagram');
            const newNode = document.createElement('div');
            newNode.className = 'cluster-node';
            newNode.id = 'node-' + nextNodeId;
            
            const randomX = Math.random() * (clusterContainer.offsetWidth - 120) + 20;
            const randomY = Math.random() * (clusterContainer.offsetHeight - 50) + 20;
            
            newNode.style.top = randomY + 'px';
            newNode.style.left = randomX + 'px';
            
            newNode.innerHTML = `<input type="text" class="editable-node" value="New Idea ${nextNodeId}" onblur="updateNodeText(this)" onkeypress="handleKeyPress(event, this)">`;
            
            // Add drag functionality
            newNode.addEventListener('mousedown', startDrag);
            newNode.addEventListener('dblclick', function(e) {
                e.preventDefault();
                const input = this.querySelector('.editable-node');
                input.focus();
                input.select();
            });
            
            clusterContainer.appendChild(newNode);
            
            clusterNodes.push({
                id: newNode.id,
                text: `New Idea ${nextNodeId}`,
                x: randomX,
                y: randomY
            });
            
            nextNodeId++;
            saveClusterData();
        }

        function editNode(node) {
            const input = node.querySelector('.editable-node');
            input.focus();
            input.select();
        }

        function updateNodeText(input) {
            const nodeId = input.closest('.cluster-node').id;
            const nodeData = clusterNodes.find(n => n.id === nodeId);
            if (nodeData) {
                nodeData.text = input.value;
                saveClusterData();
            }
        }

        function handleKeyPress(event, input) {
            if (event.key === 'Enter') {
                input.blur();
            }
        }

        function startDrag(e) {
            if (e.target.classList.contains('editable-node')) return;
            
            isDragging = true;
            dragNode = this;
            
            const rect = this.getBoundingClientRect();
            const containerRect = document.getElementById('clusterDiagram').getBoundingClientRect();
            
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            this.style.zIndex = '1000';
            e.preventDefault();
        }

        function drag(e) {
            if (!isDragging || !dragNode) return;
            
            const container = document.getElementById('clusterDiagram');
            const containerRect = container.getBoundingClientRect();
            
            let newX = e.clientX - containerRect.left - dragOffset.x;
            let newY = e.clientY - containerRect.top - dragOffset.y;
            
            // Keep within bounds
            newX = Math.max(0, Math.min(newX, container.offsetWidth - dragNode.offsetWidth));
            newY = Math.max(0, Math.min(newY, container.offsetHeight - dragNode.offsetHeight));
            
            dragNode.style.left = newX + 'px';
            dragNode.style.top = newY + 'px';
            
            // Update node data
            const nodeData = clusterNodes.find(n => n.id === dragNode.id);
            if (nodeData) {
                nodeData.x = newX;
                nodeData.y = newY;
            }
        }

        function stopDrag() {
            if (isDragging && dragNode) {
                dragNode.style.zIndex = '2';
                saveClusterData();
            }
            
            isDragging = false;
            dragNode = null;
            
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }

        function clearCluster() {
            const clusterContainer = document.getElementById('clusterDiagram');
            const nodes = clusterContainer.querySelectorAll('.cluster-node:not(.cluster-center)');
            const connections = clusterContainer.querySelectorAll('.cluster-connection');
            
            nodes.forEach(node => node.remove());
            connections.forEach(connection => connection.remove());
            
            clusterNodes = clusterNodes.filter(node => node.id === 'cluster-center');
            clusterConnections = [];
            nextNodeId = 1;
            saveClusterData();
        }

        function saveCluster() {
            saveClusterData();
            alert('Cluster diagram saved!');
        }

        function saveClusterData() {
            const clusterData = {
                nodes: clusterNodes,
                connections: clusterConnections,
                nextId: nextNodeId
            };
            localStorage.setItem('writingCluster', JSON.stringify(clusterData));
        }

        function loadCluster() {
            const savedData = localStorage.getItem('writingCluster');
            if (savedData) {
                const clusterData = JSON.parse(savedData);
                // Restore cluster state
                clusterNodes = clusterData.nodes || [];
                clusterConnections = clusterData.connections || [];
                nextNodeId = clusterData.nextId || 1;
                
                alert('Cluster diagram loaded!');
            } else {
                alert('No saved cluster diagram found.');
            }
        }

        // ========== LIST MAKER FUNCTIONALITY ==========
        let listItems = [];

        function addListItem() {
            const input = document.getElementById('listItemInput');
            const text = input.value.trim();
            
            if (text) {
                const ideaList = document.getElementById('ideaList');
                const item = document.createElement('div');
                item.className = 'list-item';
                item.textContent = text;
                item.draggable = true;
                
                // Add drag event listeners
                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragend', handleDragEnd);
                
                ideaList.appendChild(item);
                input.value = '';
                
                listItems.push(text);
                saveListData();
            }
        }

        function handleListKeyPress(event) {
            if (event.key === 'Enter') {
                addListItem();
            }
        }

        function handleDragStart(e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.textContent);
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
        }

        function setupDropZones() {
            const dropZones = document.querySelectorAll('.drop-zone');
            
            dropZones.forEach(zone => {
                zone.addEventListener('dragover', handleDragOver);
                zone.addEventListener('drop', handleDrop);
                zone.addEventListener('dragenter', handleDragEnter);
                zone.addEventListener('dragleave', handleDragLeave);
            });
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDragEnter(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            if (!this.contains(e.relatedTarget)) {
                this.classList.remove('drag-over');
            }
        }

        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const draggedText = e.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector('.list-item.dragging');
            
            if (draggedElement && this !== draggedElement.parentNode) {
                // Move the element to this drop zone
                this.appendChild(draggedElement);
                saveListData();
            }
        }

        function saveList() {
            saveListData();
            alert('List saved!');
        }

        function saveListData() {
            const ideaList = Array.from(document.getElementById('ideaList').children).map(item => item.textContent);
            const groupedList = Array.from(document.getElementById('groupedIdeas').children).map(item => item.textContent);
            
            localStorage.setItem('writingList', JSON.stringify({
                ideas: ideaList,
                grouped: groupedList
            }));
        }

        function clearList() {
            document.getElementById('ideaList').innerHTML = '';
            document.getElementById('groupedIdeas').innerHTML = '';
            listItems = [];
            localStorage.removeItem('writingList');
        }

        // ========== FREEWRITING TIMER FUNCTIONALITY ==========
        let timerInterval;
        let secondsRemaining = 300;
        let isTimerRunning = false;

        function startTimer(duration) {
            if (duration) secondsRemaining = duration;
            
            if (isTimerRunning) return;
            
            isTimerRunning = true;
            document.getElementById('startButton').disabled = true;
            document.getElementById('pauseButton').disabled = false;
            
            timerInterval = setInterval(function() {
                secondsRemaining--;
                
                const minutes = Math.floor(secondsRemaining / 60);
                const seconds = secondsRemaining % 60;
                document.getElementById('freewriteTimer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (secondsRemaining <= 0) {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    document.getElementById('startButton').disabled = false;
                    alert('Time is up! Keep writing or reset the timer.');
                }
            }, 1000);
        }

        function pauseTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            document.getElementById('startButton').disabled = false;
            document.getElementById('pauseButton').disabled = true;
        }

        function resetTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            secondsRemaining = 300;
            document.getElementById('freewriteTimer').textContent = '05:00';
            document.getElementById('startButton').disabled = false;
            document.getElementById('pauseButton').disabled = false;
        }

        function saveFreewrite() {
            const text = document.getElementById('freewriteText').value;
            localStorage.setItem('freewritingContent', text);
            alert('Freewriting saved!');
        }

        // ========== QUESTION PROMPTER FUNCTIONALITY ==========
        const questions = [
            "Who is involved or affected by your topic?",
            "What is the central issue or idea?",
            "Where does this topic have relevance?",
            "When is this topic important?",
            "Why does this topic matter?",
            "How does this work or occur?",
            "What problem does this address?",
            "What solutions might exist?",
            "What are the causes?",
            "What are the effects?",
            "What evidence supports this?",
            "What are the counterarguments?",
            "Who would disagree with this?",
            "What questions remain unanswered?",
            "How does this connect to larger issues?",
            "What assumptions are being made?",
            "What would happen if this changed?",
            "How has this evolved over time?",
            "What are the long-term implications?",
            "Who benefits from the current situation?"
        ];

        function generateQuestion() {
            const randomIndex = Math.floor(Math.random() * questions.length);
            document.getElementById('questionDisplay').textContent = questions[randomIndex];
        }

        function saveQuestion() {
            const question = document.getElementById('questionDisplay').textContent;
            if (question === "Click \"Generate Question\" to get started") return;
            
            const savedQuestions = JSON.parse(localStorage.getItem('savedQuestions') || '[]');
            
            if (!savedQuestions.includes(question)) {
                savedQuestions.push(question);
                localStorage.setItem('savedQuestions', JSON.stringify(savedQuestions));
                
                // Update display
                const list = document.getElementById('savedQuestions');
                const item = document.createElement('li');
                item.textContent = question;
                list.appendChild(item);
                
                alert('Question saved!');
            } else {
                alert('Question already saved!');
            }
        }

        // ========== OUTLINE BUILDER FUNCTIONALITY ==========
        let outlineCounter = { 1: 1, 2: 1, 3: 1 };

        function addOutlineItem(level) {
            const outlineContainer = document.getElementById('outlineContainer');
            const newItem = document.createElement('div');
            newItem.className = `outline-item outline-level-${level}`;
            
            let prefix = '';
            if (level === 1) {
                prefix = `${outlineCounter[1]}. `;
                outlineCounter[1]++;
            } else if (level === 2) {
                prefix = `${String.fromCharCode(64 + outlineCounter[2])}. `;
                outlineCounter[2]++;
            } else if (level === 3) {
                prefix = `${outlineCounter[3]}. `;
                outlineCounter[3]++;
            }
            
            newItem.textContent = prefix + 'New Point';
            newItem.draggable = true;
            newItem.contentEditable = true;
            
            outlineContainer.appendChild(newItem);
            saveOutlineData();
        }

        function saveOutline() {
            saveOutlineData();
            alert('Outline saved!');
        }

        function saveOutlineData() {
            const outlineItems = Array.from(document.getElementById('outlineContainer').children).map(item => ({
                text: item.textContent,
                level: parseInt(item.className.match(/outline-level-(\d)/)[1])
            }));
            
            localStorage.setItem('writingOutline', JSON.stringify(outlineItems));
        }

        // ========== CHALLENGE FUNCTIONALITY ==========
        function startChallenge() {
            const topic = document.getElementById('challengeTopic').value.trim();
            if (!topic) {
                alert('Please enter a writing topic first.');
                return;
            }
            
            const selectedTechniques = Array.from(document.querySelectorAll('input[name="technique"]:checked')).map(cb => cb.value);
            if (selectedTechniques.length < 2) {
                alert('Please select at least two techniques to try.');
                return;
            }
            
            document.getElementById('challengeResults').style.display = 'block';
            
            // Save challenge data
            localStorage.setItem('prewritingChallenge', JSON.stringify({
                topic: topic,
                techniques: selectedTechniques,
                timestamp: new Date().toISOString()
            }));
        }

        // ========== DATA MANAGEMENT ==========
        function loadSavedData() {
            // Load freewriting content
            const freewriting = localStorage.getItem('freewritingContent');
            if (freewriting) {
                document.getElementById('freewriteText').value = freewriting;
            }
            
            // Load saved questions
            const savedQuestions = JSON.parse(localStorage.getItem('savedQuestions') || '[]');
            const questionsList = document.getElementById('savedQuestions');
            savedQuestions.forEach(q => {
                const item = document.createElement('li');
                item.textContent = q;
                questionsList.appendChild(item);
            });
            
            // Load list items
            const savedListData = JSON.parse(localStorage.getItem('writingList') || '{}');
            if (savedListData.ideas) {
                const ideaList = document.getElementById('ideaList');
                savedListData.ideas.forEach(itemText => {
                    const item = document.createElement('div');
                    item.className = 'list-item';
                    item.textContent = itemText;
                    item.draggable = true;
                    item.addEventListener('dragstart', handleDragStart);
                    item.addEventListener('dragend', handleDragEnd);
                    ideaList.appendChild(item);
                });
            }
            
            if (savedListData.grouped) {
                const groupedList = document.getElementById('groupedIdeas');
                savedListData.grouped.forEach(itemText => {
                    const item = document.createElement('div');
                    item.className = 'list-item';
                    item.textContent = itemText;
                    item.draggable = true;
                    item.addEventListener('dragstart', handleDragStart);
                    item.addEventListener('dragend', handleDragEnd);
                    groupedList.appendChild(item);
                });
            }
            
            // Load cluster data
            const clusterData = JSON.parse(localStorage.getItem('writingCluster') || '{}');
            if (clusterData.nextId) {
                nextNodeId = clusterData.nextId;
                clusterNodes = clusterData.nodes || [];
                clusterConnections = clusterData.connections || [];
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Initialize first section as active if no saved state
            if (Object.keys(sectionStates).length === 0) {
                const firstSection = document.querySelector('.section');
                if (firstSection) {
                    firstSection.classList.add('active');
                    sectionStates[firstSection.id] = true;
                }
            }
            
            // Handle URL hash
            if (window.location.hash) {
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.classList.add('active');
                    sectionStates[targetSection.id] = true;
                    setTimeout(() => {
                        targetSection.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                }
            }
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Initialize interactive features
            setupDropZones();
            generateQuestion();
            initSmoothScrolling();
            loadSavedData();
            updateScrollProgress();
            
            // Initialize cluster center drag functionality
            const centerNode = document.querySelector('.cluster-center');
            if (centerNode) {
                centerNode.addEventListener('mousedown', startDrag);
                clusterNodes.push({
                    id: 'cluster-center',
                    text: centerNode.querySelector('.editable-node').value,
                    x: 190,
                    y: 180
                });
            }
            
            console.log('Scholar\'s Compass - Chapter 9 Enhanced Edition Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;

    case 'index':

        // State management
        let touchStartX = 0;
        let touchEndX = 0;

        // Load saved preferences
        function loadPreferences() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
            }
        }

        // Save preferences
        function savePreferences() {
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        }

        // Enhanced Sidebar functionality
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');

        function openSidebar() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Auto-close sidebar on mobile when selecting chapter
        function autoCloseSidebarOnMobile() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

        hamburgerMenu.addEventListener('click', openSidebar);
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Add auto-close to all chapter links
        document.querySelectorAll('.sidebar-link[href*="chapter"]').forEach(link => {
            link.addEventListener('click', autoCloseSidebarOnMobile);
        });

        // Touch gestures for sidebar
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && touchStartX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
                    // Swipe left when sidebar is open - close sidebar
                    closeSidebar();
                }
            }
        }

        // Escape key handling
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Enhanced scroll progress
        function updateScrollProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            const progressBar = document.getElementById("scrollProgress");
            progressBar.style.width = scrolled + "%";
            
            // Show/hide back to top button
            const backToTop = document.getElementById('backToTop');
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Enhanced dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeToggle').querySelector('i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            savePreferences();
        }

        // Back to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Smooth scrolling for anchor links
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        const yOffset = -80;
                        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                    }
                });
            });
        }

        // ========== PROGRESS TRACKING FUNCTIONALITY ==========
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            
            // Progress tracking functionality
            const progressBar = document.getElementById('overallProgress');
            const progressText = document.getElementById('progressText');
            const resetButton = document.getElementById('resetProgress');
            const chapterLinks = document.querySelectorAll('.chapter-link');
            
            // Chapter status management
            function getChapterStatus() {
                const status = {
                    visited: JSON.parse(localStorage.getItem('visitedChapters') || '[]'),
                    completed: JSON.parse(localStorage.getItem('completedChapters') || '[]')
                };
                
                // Also check for chapter-specific data to determine visited status
                for (let i = 1; i <= 9; i++) {
                    const hasChapterData = localStorage.getItem(`chapter${i}Data`) || 
                                          localStorage.getItem(`chapter${i}Progress`) ||
                                          checkForChapterSpecificData(i);
                    
                    if (hasChapterData && !status.visited.includes(i)) {
                        status.visited.push(i);
                    }
                }
                
                return status;
            }

            function checkForChapterSpecificData(chapterNum) {
                // Check for specific tool data that indicates chapter engagement
                const toolKeys = [
                    'annotationData', 'summaryData', 'writingCluster', 'freewritingContent',
                    'thesisBuilderData', 'pieBuilderData', 'savedQuestions', 'writingList',
                    'writingOutline', 'prewritingChallenge'
                ];
                
                return toolKeys.some(key => localStorage.getItem(key));
            }
            
            // Update progress display and badges
            function updateProgress() {
                const status = getChapterStatus();
                const totalChapters = 9;
                const completedCount = status.completed.length;
                const percentage = (completedCount / totalChapters) * 100;
                
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
                
                if (completedCount === 0) {
                    progressText.textContent = `${totalChapters} chapters available`;
                } else {
                    progressText.textContent = `${completedCount} of ${totalChapters} chapters completed`;
                }
                
                // Update all badges
                for (let i = 1; i <= 9; i++) {
                    const chapterElement = document.querySelector(`.chapter-link[data-chapter="${i}"]`);
                    if (chapterElement) {
                        const availableBadge = chapterElement.querySelector('.available-badge');
                        const currentBadge = chapterElement.querySelector('.current-badge');
                        const completedBadge = chapterElement.querySelector('.completed-badge');
                        
                        // Hide all badges first
                        [availableBadge, currentBadge, completedBadge].forEach(badge => {
                            if (badge) badge.style.display = 'none';
                        });
                        
                        // Show appropriate badge
                        if (status.completed.includes(i)) {
                            if (completedBadge) completedBadge.style.display = 'block';
                        } else if (status.visited.includes(i)) {
                            if (currentBadge) currentBadge.style.display = 'block';
                        } else {
                            if (availableBadge) availableBadge.style.display = 'block';
                        }
                    }
                }
            }
            
            // Mark chapter as visited when clicked
            function markChapterVisited(chapterNum) {
                const visitedChapters = JSON.parse(localStorage.getItem('visitedChapters') || '[]');
                if (!visitedChapters.includes(chapterNum)) {
                    visitedChapters.push(chapterNum);
                    localStorage.setItem('visitedChapters', JSON.stringify(visitedChapters));
                    setTimeout(updateProgress, 100);
                }
            }

            // Mark chapter as completed (can be called by chapters when user finishes activities)
            function markChapterCompleted(chapterNum) {
                const completedChapters = JSON.parse(localStorage.getItem('completedChapters') || '[]');
                if (!completedChapters.includes(chapterNum)) {
                    completedChapters.push(chapterNum);
                    localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
                    updateProgress();
                }
            }
            
            // Reset progress
            resetButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to reset your progress? This will clear all saved data from chapters and cannot be undone.')) {
                    // Clear all chapter-related localStorage
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('chapter') || 
                                   key.includes('annotation') || 
                                   key.includes('summary') || 
                                   key.includes('cluster') || 
                                   key.includes('freewriting') || 
                                   key.includes('thesis') || 
                                   key.includes('pie') || 
                                   key.includes('outline') || 
                                   key.includes('visited') ||
                                   key.includes('completed'))) {
                            keysToRemove.push(key);
                        }
                    }
                    
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    updateProgress();
                }
            });
            
            // Set up chapter click handlers
            chapterLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const chapterNum = parseInt(this.getAttribute('data-chapter'));
                    markChapterVisited(chapterNum);
                });
            });
            
            // Set up event listeners
            window.addEventListener('scroll', updateScrollProgress);
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
            
            const backToTopBtn = document.getElementById('backToTop');
            if (backToTopBtn) {
                backToTopBtn.addEventListener('click', scrollToTop);
            }
            
            // Initialize other features
            initSmoothScrolling();
            updateProgress();
            updateScrollProgress();
            
            // Update progress periodically in case user returns from a chapter
            setInterval(updateProgress, 2000);
            
            // Expose functions globally so chapters can call them
            window.markChapterCompleted = markChapterCompleted;
            window.markChapterVisited = markChapterVisited;
            
            console.log('Scholar\'s Compass - Enhanced Homepage Loaded! 🧭');
        });

        // Performance optimization - throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', function() {
            requestTick();
            ticking = false;
        });
    
      break;
      default:
        break;
    }
  } catch (e) {
    console.error(e);
  }
})();
