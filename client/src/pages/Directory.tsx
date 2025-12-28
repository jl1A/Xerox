import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Directory = () => {
    const [stats, setStats] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userRole = localStorage.getItem('xerox_role');
        if (userRole !== 'diretoria' && userRole !== 'admin') {
            alert('Acesso negado.');
            navigate('/');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/estatisticas/geral');
                setStats(res.data);
            } catch (err) {
                console.error(err);
                alert('Erro ao carregar estatísticas');
            }
        };

        fetchStats();
    }, [navigate]);

    if (!stats) return <div className="loading">Carregando...</div>;

    // Data handling
    const totalDepts = stats.departamentos.length;
    const totalCopies = stats.departamentos.reduce((acc: number, curr: any) => acc + curr.totalCopias, 0);

    const deptChartData = {
        labels: stats.departamentos.map((d: any) => d._id),
        datasets: [{
            label: 'Total de Cópias',
            data: stats.departamentos.map((d: any) => d.totalCopias),
            backgroundColor: '#3b82f6',
            borderRadius: 4
        }]
    };

    const top5 = stats.professores.slice(0, 5);
    const profChartData = {
        labels: top5.map((p: any) => p.nome),
        datasets: [{
            label: 'Cópias',
            data: top5.map((p: any) => p.totalCopias),
            backgroundColor: [
                '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'
            ],
            hoverOffset: 4
        }]
    };

    return (
        <>
            <TopBar title="Painel da Diretoria" />

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', marginTop: '20px' }}>
                <div className="stats-overview" style={{ display: 'flex', gap: '20px', marginBottom: '2rem' }}>
                    <div className="card" style={{ flex: 1, padding: '1.5rem', textAlign: 'center' }}>
                        <h3>Total de Departamentos</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalDepts}</p>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '1.5rem', textAlign: 'center' }}>
                        <h3>Total de Cópias</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalCopies.toLocaleString()}</p>
                    </div>
                </div>

                <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1rem', height: '350px' }}>
                        <h3>Gastos por Departamento</h3>
                        <div style={{ height: '220px', width: '100%' }}>
                            <Bar
                                data={deptChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </div>
                    </div>
                    <div className="card" style={{ padding: '1rem', height: '350px' }}>
                        <h3>Top 5 Professores</h3>
                        <div style={{ height: '220px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut
                                data={profChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'right' } }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/diretoria-detalhes')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Ver Detalhes Completos &rarr;
                </button>
            </div>
        </>
    );
};

export default Directory;
