import { useEffect, useState } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';

const DirectoryDetails = () => {
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

    return (
        <>
            <TopBar title="Detalhamento por Professor" />

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', marginTop: '20px' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3>Lista Completa</h3>
                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Nome</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Total de Pedidos</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Total de Cópias</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.professores.map((prof: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem' }}>{prof.nome}</td>
                                        <td style={{ padding: '0.75rem' }}>{prof.countPedidos}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{prof.totalCopias.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/diretoria')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    &larr; Voltar para Gráficos
                </button>
            </div>
        </>
    );
};

export default DirectoryDetails;
