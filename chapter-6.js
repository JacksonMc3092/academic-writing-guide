
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
    