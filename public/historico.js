let currentPage = 1;
let itemsPerPage = 8;
let resizeTimeout;

document.addEventListener('DOMContentLoaded', () => {
    updateItemsPerPage();
    fetchHistory(currentPage);
});

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const oldItemsPerPage = itemsPerPage;
        updateItemsPerPage();
        if (oldItemsPerPage !== itemsPerPage) {
            currentPage = 1; // Reset to page 1 to avoid glitches
            fetchHistory(currentPage);
        }
    }, 300);
});

function updateItemsPerPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Constants based on CSS
    const cardMinWidth = 320;
    const gap = 32; // 2rem
    const padding = 64; // main-content padding

    // Calculate Columns
    const availableWidth = mainContent.clientWidth - padding;
    const colCount = Math.floor((availableWidth + gap) / (cardMinWidth + gap));
    const columns = Math.max(1, colCount);

    // Force exactly one row
    const rows = 2;

    itemsPerPage = columns * rows;
    // Ensure at least 1 item
    if (itemsPerPage < 1) itemsPerPage = 1;

    // console.log(`Dynamic items: ${columns}x${rows} = ${itemsPerPage}`);
}

window.goToPage = function (page) {
    if (page === currentPage) return;
    currentPage = page;
    const grid = document.getElementById('history-grid');
    grid.innerHTML = '<div class="loading">Carregando página ' + page + '...</div>';
    fetchHistory(page);
};

async function fetchHistory(page = 1) {
    const grid = document.getElementById('history-grid');

    try {
        const user = localStorage.getItem('xerox_user') || '';
        const response = await fetch(`/api/impressoes/historico?page=${page}&limit=${itemsPerPage}&user=${encodeURIComponent(user)}`);
        if (!response.ok) throw new Error('Falha ao buscar histórico');

        const result = await response.json();
        const orders = result.data;
        const meta = result.meta;

        updatePagination(meta);

        grid.innerHTML = '';

        if (orders.length === 0) {
            grid.innerHTML = '<div class="loading">Nenhuma impressão no histórico desta página.</div>';
            return;
        }

        orders.forEach(order => {
            const card = createHistoryCard(order);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div class="loading" style="color: #ef4444">Erro ao carregar histórico.</div>';
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

function createHistoryCard(order) {
    const div = document.createElement('div');
    div.className = 'card history-card';

    // Dates
    const startObj = order.expedicao ? new Date(order.expedicao) : new Date();
    const startDate = `${startObj.getDate().toString().padStart(2, '0')}/${(startObj.getMonth() + 1).toString().padStart(2, '0')}`;

    // End Date (conclusao)
    let endDate = '--/--';
    if (order.conclusao) {
        const endObj = new Date(order.conclusao);
        const datePart = `${endObj.getDate().toString().padStart(2, '0')}/${(endObj.getMonth() + 1).toString().padStart(2, '0')}`;
        const timePart = `${endObj.getHours().toString().padStart(2, '0')}:${endObj.getMinutes().toString().padStart(2, '0')}`;
        endDate = `${timePart} - ${datePart}`;
    }

    // Prof info
    // const profName = order.profId && order.profId.nome ? order.profId.nome : 'Desconhecido';

    const detalhes = [
        `TamanhoPapel: ${order.tipoPapel || 'A4'}`,
        `TipoPapel: ${order.folhaDura ? 'Dura' : 'Comum'}`,
        `Coloração: ${order.colorida ? 'Cor' : 'P&B'}`
    ];

    // Add extra details if exist to match "etc" feel
    if (order.plastificado) detalhes.push('Acabamento: Plastificado');

    const detalhesHtml = detalhes.map(d => `<li>${d}</li>`).join('');

    div.innerHTML = `
        <div class="card-header">
            <div class="card-title" title="${order.titulo}">${order.titulo || 'Sem título'}</div>
            <div class="card-date">${startDate}</div>
        </div>
        
        <div class="card-copies" style="margin-bottom: 1.5rem;">${order.copias} Cópias</div>
        
        <ul class="card-details-list">
            ${detalhesHtml}
        </ul>
        
        <div class="history-footer">
           <span class="end-date">${endDate}</span>
        </div>
    `;

    return div;
}
