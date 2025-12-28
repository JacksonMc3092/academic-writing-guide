
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
    