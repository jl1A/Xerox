document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/estatisticas/geral');
        if (!response.ok) throw new Error('Falha ao carregar estatísticas');

        const data = await response.json();
        renderDashboard(data);
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados da diretoria.');
    }
});

function renderDashboard(data) {
    // 1. Overview
    const totalDepts = data.departamentos.length;
    const totalCopies = data.departamentos.reduce((acc, curr) => acc + curr.totalCopias, 0);

    document.getElementById('total-depts').innerText = totalDepts;
    document.getElementById('total-copies').innerText = totalCopies.toLocaleString();

    // 2. Chart: Gastos por Departamento
    const ctxDept = document.getElementById('deptChart').getContext('2d');
    new Chart(ctxDept, {
        type: 'bar',
        data: {
            labels: data.departamentos.map(d => d._id),
            datasets: [{
                label: 'Total de Cópias',
                data: data.departamentos.map(d => d.totalCopias),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // 3. Chart: Top 5 Professores (Slice top 5)
    // Backend returns all now, so we slice here for chart
    const top5 = data.professores.slice(0, 5);

    const ctxProf = document.getElementById('profChart').getContext('2d');
    new Chart(ctxProf, {
        type: 'doughnut',
        data: {
            labels: top5.map(p => p.nome),
            datasets: [{
                label: 'Cópias',
                data: top5.map(p => p.totalCopias),
                backgroundColor: [
                    '#1f2937',
                    '#374151',
                    '#4b5563',
                    '#6b7280',
                    '#9ca3af'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}
