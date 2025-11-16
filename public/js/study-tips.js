        let tipsData = [];
        let currentCategory = 'all';

        // Load tips from JSON
        async function loadTips() {
            try {
		const response = await fetch("/data/study-tips.json")
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

            grid.innerHTML = filteredTips.map(tip => `
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
                        <button class="save-tip-btn" onclick="saveTip(${tip.id})">
                            <i class="ph ph-bookmark"></i> Save
                        </button>
                    </div>
                </div>
            `).join('');
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

        // Save tip function
        function saveTip(id) {
            const tip = tipsData.find(t => t.id === id);
            if (tip) {
                showNotification(`"${tip.title}" saved!`);
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', loadTips);
