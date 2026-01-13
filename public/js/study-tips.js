        let tipsData = [];
        let currentCategory = 'all';

        // Load tips from JSON
        async function loadTips() {
            try {
                const response = await fetch("/data/study-tips.json");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                tipsData = await response.json();
                updateStatistics();
                renderTips();
            } catch (error) {
                console.error('Error loading tips:', error);
                document.getElementById('tipsGrid').innerHTML = 
                    '<p class="error-message">Failed to load study tips. Please try again later.</p>';
            }
        }

        // Update statistics
        function updateStatistics() {
            document.getElementById('totalTips').textContent = tipsData.length;
            
            const avgEff = Math.round(
                tipsData.reduce((sum, tip) => sum + tip.effectiveness, 0) / tipsData.length
            );
            document.getElementById('avgEffectiveness').textContent = avgEff + '%';
            
            const beginnerCount = tipsData.filter(tip => tip.difficulty === 'beginner').length;
            document.getElementById('beginnerTips').textContent = beginnerCount;
        }

        // Render tips
        function renderTips(searchTerm = '') {
            const grid = document.getElementById('tipsGrid');
            
            let filteredTips = tipsData.filter(tip => {
                const matchesCategory = currentCategory === 'all' || tip.category === currentCategory;
                const matchesSearch = searchTerm === '' || 
                    tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tip.category.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
            });

            if (filteredTips.length === 0) {
                grid.innerHTML = '<p class="no-tips">No tips found matching your criteria</p>';
                return;
            }

            const savedTips = getSavedTips();
            const savedTipIds = savedTips.map(t => t.id);
            
            grid.innerHTML = filteredTips.map(tip => {
                const isSaved = savedTipIds.includes(tip.id);
                const saveBtnHtml = isSaved 
                    ? '<i class="ph ph-bookmark-fill"></i> Saved'
                    : '<i class="ph ph-bookmark"></i> Save';
                const saveBtnStyle = isSaved
                    ? 'background: rgba(0, 245, 212, 0.2); border-color: #00F5D4; color: #00F5D4;'
                    : '';
                
                return `
                <div class="tip-card difficulty-${tip.difficulty}" data-id="${tip.id}">
                    <div class="tip-header">
                        <div class="tip-icon">
                            <i class="${tip.icon}"></i>
                        </div>
                        <div class="tip-category-badge">${tip.category}</div>
                    </div>
                    
                    <h3 class="tip-title">${tip.title}</h3>
                    <p class="tip-description">${tip.description}</p>
                    
                    <div class="tip-effectiveness">
                        <div class="effectiveness-bar">
                            <div class="effectiveness-fill" style="width: ${tip.effectiveness}%"></div>
                        </div>
                        <span class="effectiveness-text">${tip.effectiveness}% Effective</span>
                    </div>
                    
                    <div class="tip-benefits">
                        <strong>Benefits:</strong>
                        <ul>
                            ${tip.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="tip-footer">
                        <span class="difficulty-badge ${tip.difficulty}">
                            <i class="ph ph-star"></i> ${tip.difficulty}
                        </span>
                        <button class="save-tip-btn" onclick="saveTip(${tip.id})" style="${saveBtnStyle}">
                            ${saveBtnHtml}
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        }

        // Category filter
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentCategory = e.currentTarget.dataset.category;
                renderTips(document.getElementById('searchTips').value);
            });
        });

        // Search functionality
        document.getElementById('searchTips').addEventListener('input', (e) => {
            renderTips(e.target.value);
        });

        // Load saved tips from localStorage
        function getSavedTips() {
            try {
                const saved = localStorage.getItem('savedStudyTips');
                return saved ? JSON.parse(saved) : [];
            } catch (error) {
                console.error('Error loading saved tips:', error);
                return [];
            }
        }

        // Save tip to localStorage
        function saveTip(id) {
            const tip = tipsData.find(t => t.id === id);
            if (!tip) {
                showNotification('Tip not found!', 'error');
                return;
            }

            let savedTips = getSavedTips();
            
            // Check if already saved
            const isSaved = savedTips.some(t => t.id === id);
            
            if (isSaved) {
                // Remove from saved tips
                savedTips = savedTips.filter(t => t.id !== id);
                localStorage.setItem('savedStudyTips', JSON.stringify(savedTips));
                showNotification(`"${tip.title}" removed from saved tips`);
                updateSaveButton(id, false);
            } else {
                // Add to saved tips
                savedTips.push(tip);
                localStorage.setItem('savedStudyTips', JSON.stringify(savedTips));
                showNotification(`"${tip.title}" saved!`);
                updateSaveButton(id, true);
            }
        }

        // Update save button appearance
        function updateSaveButton(tipId, isSaved) {
            const tipCard = document.querySelector(`[data-id="${tipId}"]`);
            if (tipCard) {
                const saveBtn = tipCard.querySelector('.save-tip-btn');
                if (saveBtn) {
                    if (isSaved) {
                        saveBtn.innerHTML = '<i class="ph ph-bookmark-fill"></i> Saved';
                        saveBtn.style.background = 'rgba(0, 245, 212, 0.2)';
                        saveBtn.style.borderColor = '#00F5D4';
                        saveBtn.style.color = '#00F5D4';
                    } else {
                        saveBtn.innerHTML = '<i class="ph ph-bookmark"></i> Save';
                        saveBtn.style.background = 'rgba(255, 255, 255, 0.05)';
                        saveBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        saveBtn.style.color = '#EAEAEA';
                    }
                }
            }
        }

        // Update all save buttons based on saved state
        function updateAllSaveButtons() {
            const savedTips = getSavedTips();
            savedTips.forEach(savedTip => {
                updateSaveButton(savedTip.id, true);
            });
        }

        // Show Notification Toast
        function showNotification(message, type = 'success') {
            const toast = document.createElement('div');
            const bgColor = type === 'error' 
                ? 'linear-gradient(135deg, #FF6384, #FF4757)' 
                : 'linear-gradient(135deg, #00F5D4, #00D4AA)';
            
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: #1A1A2E;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(0, 245, 212, 0.4);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            toast.textContent = message;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(400px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadTips().then(() => {
                updateAllSaveButtons();
            });
        });
