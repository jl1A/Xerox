
// State to track displayed orders
const displayedOrders = new Set();
// Track orders that have been completed but we want to show the "Success" state for a moment
const recentlyCompleted = new Set();
let isFirstLoad = true;
let currentPage = 1;
let itemsPerPage = 3;

function calculateItemsPerPage() {
    const width = window.innerWidth - 80; // Subtract sidebar width
    const minCardWidth = 320;
    const gap = 32; // 2rem gap = 32px
    const padding = 64; // 2rem padding each side = 64px

    // Formula: (availableWidth - padding) / (cardWidth + gap)
    const availableWidth = width - padding;
    const count = Math.floor((availableWidth + gap) / (minCardWidth + gap));

    itemsPerPage = Math.max(1, count);
}

// Initial calculation
calculateItemsPerPage();

// Recalculate on resize
window.addEventListener('resize', () => {
    const oldItems = itemsPerPage;
    calculateItemsPerPage();
    // If capacity changed significantly, maybe refresh?
    // Let's force refresh if it changed to avoid layout weirdness
    if (oldItems !== itemsPerPage) {
        fetchOrders(currentPage);
    }
});

// Set to track orders that we are monitoring for completion
const monitoredOrderIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders(currentPage);
    // Refresh current page periodically
    setInterval(() => fetchOrders(currentPage), 3000);
    // Check for completions periodically
    setInterval(checkCompletions, 4000);
});

let alertIconTimeout;

function showNotification(message = 'Nova Impressão') {
    const oldBubble = document.querySelector('.notification-bubble');
    if (oldBubble) oldBubble.remove();

    const main = document.querySelector('.main-content');
    const bubble = document.createElement('div');
    bubble.className = 'notification-bubble';
    bubble.innerText = message;

    main.appendChild(bubble);

    // Active State for Icon
    const icon = document.querySelector('.alert-icon');
    if (icon) {
        icon.classList.remove('grayed-out');
        clearTimeout(alertIconTimeout);
        // Gray out the icon after 10 seconds of no new notifications
        alertIconTimeout = setTimeout(() => {
            icon.classList.add('grayed-out');
        }, 10000);
    }

    // Remove the bubble quickly (3 seconds)
    setTimeout(() => {
        bubble.style.opacity = '0';
        setTimeout(() => bubble.remove(), 500);
    }, 3000);
}

window.goToPage = function (page) {
    if (page === currentPage) return;
    currentPage = page;

    const grid = document.getElementById('orders-grid');
    grid.innerHTML = '<div class="loading">Carregando pagina ' + page + '...</div>';
    displayedOrders.clear();
    monitoredOrderIds.clear();
    recentlyCompleted.clear(); // Clear these too

    fetchOrders(page);
};

async function fetchOrders(page = 1) {
    const grid = document.getElementById('orders-grid');
    const loading = grid.querySelector('.loading');

    try {
        const user = localStorage.getItem('xerox_user') || '';
        const response = await fetch(`/api/impressoes/pendentes?page=${page}&limit=${itemsPerPage}&user=${encodeURIComponent(user)}`);
        if (!response.ok) throw new Error('Falha ao buscar pedidos');

        const result = await response.json();
        const orders = result.data;
        const meta = result.meta;

        updatePagination(meta);

        if (loading) loading.remove();

        if (orders.length === 0) {
            // Only show "No orders" if we really have no cards displayed (and none lingering as completed)
            if (!grid.querySelector('.no-orders') && displayedOrders.size === 0 && recentlyCompleted.size === 0) {
                if (grid.children.length === 0) {
                    grid.innerHTML = '<div class="loading no-orders">Nenhum pedido pendente nesta página.</div>';
                }
            }
            return;
        } else {
            const noOrdersMsg = grid.querySelector('.no-orders');
            if (noOrdersMsg) noOrdersMsg.remove();
        }

        const currentIds = new Set(orders.map(o => o._id));

        for (const id of displayedOrders) {
            // IF the order is missing from server list AND it is NOT in our "recently completed" list
            // THEN remove it.
            // If it IS in recentlyCompleted, we leave it alone (it will handle its own removal)
            if (!currentIds.has(id)) {
                if (recentlyCompleted.has(id)) {
                    continue;
                }

                const el = document.getElementById(id);
                if (el) {
                    el.style.transform = 'scale(0.9)';
                    el.style.opacity = '0';
                    setTimeout(() => el.remove(), 300);
                }
                displayedOrders.delete(id);
                monitoredOrderIds.delete(id);
            }
        }

        let hasNew = false;
        orders.forEach((order, index) => {
            if (!displayedOrders.has(order._id)) {
                // Also double check if we aren't showing it as "recently completed" (unlikely if server says pending)
                const card = createCard(order);
                grid.appendChild(card);
                displayedOrders.add(order._id);
                monitoredOrderIds.add(order._id);
                hasNew = true;
            }
        });

        if (hasNew && !isFirstLoad) {
            showNotification('Nova Impressão');
        }

        isFirstLoad = false;

    } catch (error) {
        console.error("Erro no fetchOrders:", error);
        if (loading) {
            loading.innerText = 'Erro ao carregar. Tente atualizar.';
            loading.style.color = 'red';
        }
    }
}

// Function to check if any monitored orders have been completed
async function checkCompletions() {
    const userRole = localStorage.getItem('xerox_role');
    if (userRole !== 'dept') return;

    if (monitoredOrderIds.size === 0) return;

    try {
        const user = localStorage.getItem('xerox_user') || '';
        // Fetch recent history to find our orders
        const response = await fetch(`/api/impressoes/historico?page=1&limit=20&user=${encodeURIComponent(user)}`);
        if (!response.ok) return;

        const result = await response.json();
        const recentHistory = result.data;

        recentHistory.forEach(completedOrder => {
            if (monitoredOrderIds.has(completedOrder._id)) {
                // FOUND ONE! 
                const id = completedOrder._id;

                // 1. Mark as recently completed so fetchOrders doesn't delete it
                recentlyCompleted.add(id);

                // 2. Visual Update on Card
                const el = document.getElementById(id);
                if (el) {
                    const statusDiv = el.querySelector('.card-status');
                    if (statusDiv) {
                        statusDiv.innerHTML = '✅ Concluído! Retire no Xerox';
                        statusDiv.style.color = '#10b981'; // Green
                    }
                }

                showNotification(`Pedido "${completedOrder.titulo}" foi concluído!`);

                // 3. Stop monitoring it
                monitoredOrderIds.delete(id);

                // 4. Schedule Removal
                setTimeout(() => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.style.transform = 'scale(0.9)';
                        el.style.opacity = '0';
                        setTimeout(() => {
                            el.remove();
                            displayedOrders.delete(id);
                            recentlyCompleted.delete(id);

                            // Check empty
                            const grid = document.getElementById('orders-grid');
                            if (grid && grid.children.length === 0) {
                                grid.innerHTML = '<div class="loading no-orders">Nenhum pedido pendente nesta página.</div>';
                            }
                        }, 300);
                    } else {
                        // Cleanup logic if element missing
                        displayedOrders.delete(id);
                        recentlyCompleted.delete(id);
                    }
                }, 5000); // Wait 5 seconds to let user see the status
            }
        });

    } catch (error) {
        console.error("Erro checking completions:", error);
    }
}

function updatePagination(meta) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (meta.totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    for (let i = 1; i <= meta.totalPages; i++) {
        const span = document.createElement('span');
        span.className = `page-number ${i === meta.currentPage ? 'active' : ''}`;
        span.innerText = i;
        span.onclick = () => goToPage(i);
        paginationContainer.appendChild(span);
    }
}


function createCard(order) {
    const div = document.createElement('div');
    div.className = 'card';
    div.id = order._id;

    const dateObj = order.expedicao ? new Date(order.expedicao) : new Date();
    const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

    const fileName = (order.titulo || 'arquivo').replace(/\s+/g, '') + '.pdf';
    const profName = order.profId && order.profId.nome ? order.profId.nome : 'Professor desconhecido';

    const detalhes = [
        order.tipoPapel || 'A4',
        order.folhaDura ? 'Folha Dura' : 'Folha Comum',
        order.colorida ? 'Colorida' : 'Preto e Branco',
        order.plastificado ? 'Plastificado' : null,
    ].filter(Boolean);

    const detalhesHtml = detalhes.map(d => `<li>${d}</li>`).join('');

    const userRole = localStorage.getItem('xerox_role');
    const isDept = userRole === 'dept';
    const isCompleted = order.status === true;

    // Buttons HTML
    let actionBtnHtml = '';
    let statusHtml = '';

    if (isDept) {
        if (isCompleted) {
            // If completed, show "Recebido" button
            actionBtnHtml = `
                <div class="card-actions">
                    <button class="btn-recebido" onclick="confirmarRecebimento('${order._id}')">Confirmar Recebimento</button>
                </div>`;
            statusHtml = '<div style="margin-top:1rem; color:#10b981; font-weight:600; font-size:0.9rem;">✅ Pronto para retirada</div>';
        } else {
            // Pending
            statusHtml = '<div style="margin-top:1rem; color:#f59e0b; font-weight:600; font-size:0.9rem;">⏳ Na fila...</div>';
        }
    } else {
        // Admin
        const closeBtnHtml = `<div class="close-btn" onclick="recusarPedido('${order._id}')">×</div>`;
        actionBtnHtml = `
            ${closeBtnHtml}
            <div class="card-actions">
                <button class="btn-concluir" onclick="concluirPedido('${order._id}')">Concluir</button>
            </div>`;
    }

    div.innerHTML = `
        ${!isDept ? `<div class="close-btn" onclick="recusarPedido('${order._id}')">×</div>` : ''}
        
        <div class="card-header">
            <div class="card-title" title="${order.titulo}">${order.titulo || 'Sem título'}</div>
            <div class="card-date">${dateStr}</div>
        </div>
        
        <div class="card-copies">${order.copias} Cópias</div>
        
        <div class="preview-box"></div>
        
        <div class="file-info">
            ${fileName}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
        
        <ul class="card-details-list">
            ${detalhesHtml}
            <li>${profName}</li> 
        </ul>
        
        ${statusHtml}
        ${actionBtnHtml}
    `;

    div.animate([
        { transform: 'translateY(10px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
    ], { duration: 300, easing: 'ease-out' });

    return div;
}

window.recusarPedido = async function (id, event) {
    if (event) event.stopPropagation();
    if (!confirm("Deseja REMOVER este pedido (Recusado)?")) return;

    const el = document.getElementById(id);
    if (el) el.style.opacity = '0.5';

    try {
        const response = await fetch(`/api/impressoes/${id}/recusar`, { method: 'POST' });
        if (!response.ok) throw new Error('Erro ao recusar');

        if (el) {
            el.style.transform = 'scale(0.8) rotate(10deg)';
            el.style.opacity = '0';
            setTimeout(() => {
                el.remove();
                if (typeof displayedOrders !== 'undefined') displayedOrders.delete(id);
                const grid = document.getElementById('orders-grid');
                if (grid && grid.children.length === 0) {
                    grid.innerHTML = '<div class="loading no-orders">Nenhum pedido pendente no momento.</div>';
                }
            }, 300);
        }
    } catch (error) {
        console.error('Erro ao recusar:', error);
        alert('Falha ao recusar pedido.');
        if (el) el.style.opacity = '1';
    }
};

window.concluirPedido = async function (id) {
    if (!confirm("Deseja marcar este pedido como concluído?")) return;

    const el = document.getElementById(id);
    const btn = el ? el.querySelector('.btn-concluir') : null;

    if (btn) {
        btn.innerText = 'Concluindo...';
        btn.disabled = true;
    }

    try {
        const response = await fetch(`/api/impressoes/${id}/concluir`, { method: 'POST' });
        if (!response.ok) throw new Error('Erro ao concluir');

        if (el) {
            el.style.transform = 'scale(0.9)';
            el.style.opacity = '0';
            setTimeout(() => {
                el.remove();
                if (typeof displayedOrders !== 'undefined') displayedOrders.delete(id);
                const grid = document.getElementById('orders-grid');
                if (grid && grid.children.length === 0) {
                    grid.innerHTML = '<div class="loading no-orders">Nenhum pedido pendente no momento.</div>';
                }
            }, 300);
        }
    } catch (error) {
        console.error('Erro ao concluir:', error);
        alert('Falha ao concluir pedido.');
        if (btn) {
            btn.innerText = 'Concluir';
            btn.disabled = false;
        }
    }
};

window.confirmarRecebimento = async function (id) {
    if (!confirm("Confirmar que você recebeu este material?")) return;

    try {
        const response = await fetch(`/api/impressoes/${id}/recebido`, { method: 'POST' });
        if (!response.ok) throw new Error('Erro ao confirmar recebimento');

        const el = document.getElementById(id);
        if (el) {
            el.style.transform = 'scale(0.9)';
            el.style.opacity = '0';
            setTimeout(() => {
                el.remove();
                if (typeof displayedOrders !== 'undefined') displayedOrders.delete(id);
                // Check empty
                const grid = document.getElementById('orders-grid');
                if (grid && grid.children.length === 0) {
                    grid.innerHTML = '<div class="loading no-orders">Nenhum pedido pendente nesta página.</div>';
                }
            }, 300);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Falha ao confirmar recebimento.');
    }
};
