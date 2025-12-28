
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
    