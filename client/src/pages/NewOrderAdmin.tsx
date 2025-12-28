import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const NewOrderAdmin = () => {
    const [loading, setLoading] = useState(false);

    // Form State
    const [cliente, setCliente] = useState('');
    const [copias, setCopias] = useState(1);
    const [tipoPapel, setTipoPapel] = useState('A4');
    const [valor, setValor] = useState('');
    const [troco, setTroco] = useState('');

    const [colorida, setColorida] = useState(false);
    const [folhaDura, setFolhaDura] = useState(false);
    const [plastificado, setPlastificado] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            cliente,
            tipo: 'externo',
            copias,
            tipoPapel,
            valor: valor ? parseFloat(valor) : 0,
            troco: troco ? parseFloat(troco) : 0,
            colorida,
            folhaDura,
            plastificado,
            // No user sent, defaults to Balcao logic in backend
        };

        try {
            await axios.post('/api/impressoes/nova', data);
            alert('Pedido de Balcão criado com sucesso!');
            navigate('/');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Erro ao criar pedido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TopBar title="Novo Pedido (Balcão)" />

            <div className="new-order-layout">
                {/* Visual placeholder replaced by simpler text or icon if needed, or just removed */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontWeight: 600, fontSize: '1.5rem', border: '2px dashed #e5e7eb', borderRadius: '12px' }}>
                    Balcão / Sem Arquivo
                </div>

                {/* Form */}
                <div className="new-order-form-container">
                    <form className="new-order-form" onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Nome do Cliente</label>
                            <input
                                type="text"
                                value={cliente}
                                onChange={e => setCliente(e.target.value)}
                                placeholder="Nome do Cliente"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label>Troco (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={troco}
                                onChange={e => setTroco(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Cópias</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={copias}
                                    onChange={e => setCopias(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Papel</label>
                                <select
                                    value={tipoPapel}
                                    onChange={e => setTipoPapel(e.target.value)}
                                >
                                    <option value="A4">A4</option>
                                    <option value="A3">A3</option>
                                    <option value="A5">A5</option>
                                </select>
                            </div>
                        </div>

                        <div className="toggles-container">
                            <div className="toggle-group">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={colorida}
                                        onChange={e => setColorida(e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span className="toggle-label">Colorida</span>
                            </div>

                            <div className="toggle-group">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={folhaDura}
                                        onChange={e => setFolhaDura(e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span className="toggle-label">Folha Dura</span>
                            </div>

                            <div className="toggle-group">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={plastificado}
                                        onChange={e => setPlastificado(e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span className="toggle-label">Plastificado</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Pedido'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NewOrderAdmin;
