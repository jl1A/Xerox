// import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Manual worker setup for Vite/CRA
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface Order {
    _id: string;
    titulo: string;
    expedicao: string;
    conclusao?: string;
    copias: number;
    tipoPapel: string;
    folhaDura: boolean;
    colorida: boolean;
    plastificado: boolean;
    profId?: { nome: string };
    status?: boolean; // true if completed
    arquivo?: string; // stored filename
}

interface OrderCardProps {
    order: Order;
    variant?: 'active' | 'history';
    role?: string;
    onConclude?: (id: string) => void;
    onReject?: (id: string) => void;
    onReceive?: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
    order,
    variant = 'active',
    role,
    onConclude,
    onReject,
    onReceive
}) => {
    // const [numPages, setNumPages] = useState<number | null>(null);

    const dateObj = order.expedicao ? new Date(order.expedicao) : new Date();
    const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

    // History end date
    let endDate = '--/--';
    if (order.conclusao) {
        const endObj = new Date(order.conclusao);
        const datePart = `${endObj.getDate().toString().padStart(2, '0')}/${(endObj.getMonth() + 1).toString().padStart(2, '0')}`;
        const timePart = `${endObj.getHours().toString().padStart(2, '0')}:${endObj.getMinutes().toString().padStart(2, '0')}`;
        endDate = `${timePart} - ${datePart}`;
    }

    const profName = order.profId && order.profId.nome ? order.profId.nome : 'Professor desconhecido';

    // File Handling
    const fileUrl = order.arquivo ? `/uploads/${order.arquivo}` : null;
    const downloadName = (order.titulo || 'arquivo').replace(/\s+/g, '') + (order.arquivo?.endsWith('.pdf') ? '.pdf' : '');

    const renderDetails = () => (
        <ul className="card-details-list">
            {variant === 'active' ? (
                <>
                    <li>{order.tipoPapel || 'A4'}</li>
                    <li>{order.folhaDura ? 'Folha Dura' : 'Folha Comum'}</li>
                    <li>{order.colorida ? 'Colorida' : 'Preto e Branco'}</li>
                    {order.plastificado && <li>Plastificado</li>}
                    <li>{profName}</li>
                </>
            ) : (
                <>
                    <li>TamanhoPapel: {order.tipoPapel || 'A4'}</li>
                    <li>TipoPapel: {order.folhaDura ? 'Dura' : 'Comum'}</li>
                    <li>Coloração: {order.colorida ? 'Cor' : 'P&B'}</li>
                    {order.plastificado && <li>Acabamento: Plastificado</li>}
                </>
            )}
        </ul>
    );

    const isDept = role === 'dept';
    const isCompleted = order.status === true;

    return (
        <div className={`card ${variant === 'history' ? 'history-card' : ''}`}>
            {variant === 'active' && !isDept && onReject && (
                <div className="close-btn" onClick={() => onReject(order._id)}>×</div>
            )}

            <div className="card-header">
                <div className="card-title" title={order.titulo}>{order.titulo || 'Sem título'}</div>
                <div className="card-date">{dateStr}</div>
            </div>

            <div className="card-copies" style={variant === 'history' ? { marginBottom: '1.5rem' } : {}}>
                {order.copias} Cópias
            </div>

            {variant === 'active' && (
                <>
                    <div className="preview-box" style={{ overflow: 'hidden', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {fileUrl ? (
                            fileUrl.endsWith('.pdf') ? (
                                <Document
                                    file={fileUrl}
                                    loading={<div style={{ fontSize: '0.8rem' }}>Carregando PDF...</div>}
                                    error={<div style={{ fontSize: '0.8rem' }}>Erro ao carregar PDF</div>}
                                >
                                    <Page
                                        pageNumber={1}
                                        width={280} // Approx card width
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </Document>
                            ) : (
                                <img src={fileUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )
                        ) : (
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Sem visualização</div>
                        )}
                    </div>

                    <div className="file-info" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                        {fileUrl ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', textDecoration: 'none', color: '#3b82f6', fontSize: '0.85rem' }}>
                                <Eye size={14} />
                                Abrir
                            </a>
                        ) : <span></span>}

                        {fileUrl ? (
                            <a href={fileUrl} download={downloadName} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: '#374151' }}>
                                {order.titulo}
                                <Download size={14} />
                            </a>
                        ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Sem arquivo</span>
                        )}
                    </div>
                </>
            )}

            {renderDetails()}

            {variant === 'active' && (
                <>
                    {isDept ? (
                        isCompleted ? (
                            <>
                                <div style={{ marginTop: '1rem', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                                    ✅ Pronto para retirada
                                </div>
                                <div className="card-actions">
                                    <button className="btn-recebido" onClick={() => onReceive && onReceive(order._id)}>
                                        Confirmar Recebimento
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ marginTop: '1rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
                                ⏳ Na fila...
                            </div>
                        )
                    ) : (
                        // Admin
                        <div className="card-actions">
                            <button className="btn-concluir" onClick={() => onConclude && onConclude(order._id)}>
                                Concluir
                            </button>
                        </div>
                    )}
                </>
            )}

            {variant === 'history' && (
                <div className="history-footer">
                    <span className="end-date">{endDate}</span>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
