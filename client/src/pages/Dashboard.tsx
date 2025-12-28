import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import OrderCard, { type Order } from '../components/OrderCard';
import TopBar from '../components/TopBar';

const Dashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [notification, setNotification] = useState<string | null>(null);

    const role = localStorage.getItem('xerox_role') || 'dept';
    const user = localStorage.getItem('xerox_user') || '';

    // Track displayed IDs to detect new ones for notification
    const displayedIdsRef = useRef<Set<string>>(new Set());
    const isFirstLoadRef = useRef(true);

    const calculateItemsPerPage = useCallback(() => {
        const width = window.innerWidth - 80;
        const minCardWidth = 320;
        const gap = 32;
        const padding = 64;
        const availableWidth = width - padding;
        const count = Math.floor((availableWidth + gap) / (minCardWidth + gap));
        const newLimit = Math.max(1, count);
        setItemsPerPage(newLimit);
    }, []);

    useEffect(() => {
        calculateItemsPerPage();
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, [calculateItemsPerPage]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await axios.get(`/api/impressoes/pendentes`, {
                params: { page, limit: itemsPerPage, user }
            });
            const newOrders = res.data.data;
            setTotalPages(res.data.meta.totalPages);

            // Notification logic
            let hasNew = false;
            newOrders.forEach((o: Order) => {
                if (!displayedIdsRef.current.has(o._id)) {
                    displayedIdsRef.current.add(o._id);
                    hasNew = true;
                }
            });

            if (hasNew && !isFirstLoadRef.current) {
                showNotification('Nova Impressão');
            }
            isFirstLoadRef.current = false;

            // Sync displayedIds with current list
            const currentIds: Set<string> = new Set(newOrders.map((o: Order) => o._id));
            displayedIdsRef.current = currentIds;

            setOrders(newOrders);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders", err);
            setLoading(false);
        }
    }, [page, itemsPerPage, user]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Check completions (Dept only) - FUTURE: Add logic here regarding completed status check
    useEffect(() => {
        // if (role !== 'dept') return;
        // Placeholder for future implementation
    }, [role]);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleConclude = async (id: string) => {
        if (!confirm("Concluir pedido?")) return;
        try {
            await axios.post(`/api/impressoes/${id}/concluir`);
            fetchOrders();
        } catch (e) {
            alert("Erro ao concluir");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Recusar pedido?")) return;
        try {
            await axios.post(`/api/impressoes/${id}/recusar`);
            fetchOrders();
        } catch (e) {
            alert("Erro ao recusar");
        }
    };

    const handleReceive = async (id: string) => {
        if (!confirm("Confirmar recebimento?")) return;
        try {
            await axios.post(`/api/impressoes/${id}/recebido`);
            fetchOrders();
        } catch (e) {
            alert("Erro ao confirmar");
        }
    };

    return (
        <>
            <TopBar title="Impressões Ativas" />

            {notification && (
                <div className="notification-bubble">
                    {notification}
                </div>
            )}

            <div className="cards-grid">
                {orders.map(order => (
                    <OrderCard
                        key={order._id}
                        order={order}
                        role={role}
                        onConclude={handleConclude}
                        onReject={handleReject}
                        onReceive={handleReceive}
                    />
                ))}
                {loading && <div className="loading">Carregando...</div>}
                {!loading && orders.length === 0 && (
                    <div className="loading">Nenhum pedido pendente.</div>
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

export default Dashboard;
