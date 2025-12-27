document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/estatisticas/geral');
        if (!response.ok) throw new Error('Falha ao carregar estatísticas');

        const data = await response.json();
        renderTable(data);
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados da tabela.');
    }
});

function renderTable(data) {
    const tableBody = document.getElementById('prof-table-body');
    tableBody.innerHTML = '';

    data.professores.forEach(prof => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f3f4f6';

        tr.innerHTML = `
            <td style="padding: 0.75rem;">${prof.nome}</td>
            <td style="padding: 0.75rem;">${prof.countPedidos}</td>
            <td style="padding: 0.75rem; font-weight: 500;">${prof.totalCopias.toLocaleString()}</td>
        `;
        tableBody.appendChild(tr);
    });
}
