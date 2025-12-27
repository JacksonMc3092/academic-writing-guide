
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
    