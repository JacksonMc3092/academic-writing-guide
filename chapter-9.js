
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
    