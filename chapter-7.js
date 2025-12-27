
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
    