import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderCard, { type Order } from '../components/OrderCard';
import TopBar from '../components/TopBar';

const History = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    const user = localStorage.getItem('xerox_user') || '';

    const calculateItemsPerPage = useCallback(() => {
        const width = window.innerWidth - 80;
        const mainWidth = width - 64; // padding
        const minCardWidth = 320;
        const gap = 32;

        const cols = Math.floor((mainWidth + gap) / (minCardWidth + gap));
        const columns = Math.max(1, cols);
        const rows = 2;

        setItemsPerPage(columns * rows);
    }, []);

    useEffect(() => {
        calculateItemsPerPage();
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, [calculateItemsPerPage]);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/impressoes/historico`, {
                    params: { page, limit: itemsPerPage, user }
                });
                setOrders(res.data.data);
                setTotalPages(res.data.meta.totalPages);
            } catch (err) {
                console.error("Erro ao buscar histórico", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [page, itemsPerPage, user]);

    return (
        <>
            <TopBar title="Últimas Impressões" />

            <div className="cards-grid">
                {orders.map(order => (
                    <OrderCard
                        key={order._id}
                        order={order}
                        variant="history"
                    />
                ))}
                {loading && <div className="loading">Carregando histórico...</div>}
                {!loading && orders.length === 0 && (
                    <div className="loading">Nenhuma impressão no histórico.</div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <span
                            key={pageNum}
                            className={`page-number ${pageNum === page ? 'active' : ''}`}
                            onClick={() => setPage(pageNum)}
                        >
                            {pageNum}
                        </span>
                    ))}
                </div>
            )}
        </>
    );
};

export default History;
