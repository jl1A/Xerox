import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface Professor {
    nome: string;
}

const NewOrder = () => {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [titulo, setTitulo] = useState('');
    const [copias, setCopias] = useState(1);
    const [tipoPapel, setTipoPapel] = useState('A4');
    const [professor, setProfessor] = useState('');
    const [prazoDia, setPrazoDia] = useState('');
    const [prazoMes, setPrazoMes] = useState('');
    const [prazoAno, setPrazoAno] = useState(new Date().getFullYear().toString());

    const [colorida, setColorida] = useState(false);
    const [folhaDura, setFolhaDura] = useState(false);
    const [plastificado, setPlastificado] = useState(false);

    // File State
    const [file, setFile] = useState<File | null>(null);

    const navigate = useNavigate();
    const user = localStorage.getItem('xerox_user');

    useEffect(() => {
        const fetchProfs = async () => {
            try {
                const res = await axios.get(`/api/professores?user=${encodeURIComponent(user || '')}`);
                setProfessors(res.data);
            } catch (err) {
                console.error("Erro ao buscar professores", err);
            }
        };
        if (user) fetchProfs();
    }, [user]);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles[0]) {
            const f = acceptedFiles[0];
            setFile(f);
            setTitulo(f.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png']
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const prazo = (prazoDia && prazoMes && prazoAno)
            ? `${prazoAno}-${prazoMes}-${prazoDia}`
            : '';

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('copias', copias.toString());
        formData.append('tipoPapel', tipoPapel);
        formData.append('professor', professor);
        if (prazo) formData.append('prazo', prazo);
        formData.append('colorida', colorida.toString());
        formData.append('folhaDura', folhaDura.toString());
        formData.append('plastificado', plastificado.toString());
        formData.append('user', user || '');
        if (file) {
            formData.append('file', file);
        }

        try {
            await axios.post('/api/impressoes/nova', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Pedido criado com sucesso!');
            navigate('/');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Erro ao criar pedido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TopBar title="Novo Pedido" />

            <div className="new-order-layout">
                {/* Upload Area */}
                <div
                    {...getRootProps()}
                    className={`upload-area ${isDragActive ? 'dragover' : ''}`}
                    style={file ? { borderColor: '#3b82f6', backgroundColor: '#eff6ff' } : {}}
                >
                    <input {...getInputProps()} />
                    <Upload className="upload-icon" color={file ? '#3b82f6' : '#4b5563'} />
                    <div className="upload-text">
                        {file ? file.name : "Arraste seu arquivo aqui (PDF, IMG)"}
                    </div>
                    {!file && (
                        <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                            (Define o título automaticamente)
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="new-order-form-container">
                    <form className="new-order-form" onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Título / Arquivo</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Nome do arquivo"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Professor(a)</label>
                            <select
                                value={professor}
                                onChange={e => setProfessor(e.target.value)}
                                required
                            >
                                <option value="" disabled>Selecione...</option>
                                {professors.map((p, idx) => (
                                    <option key={idx} value={p.nome}>{p.nome}</option>
                                ))}
                                {professors.length === 0 && <option disabled>Nenhum encontrado</option>}
                            </select>
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

                        <div className="form-group">
                            <label>Prazo (Opcional)</label>
                            <div className="date-inputs">
                                <input
                                    type="text"
                                    placeholder="Dia"
                                    maxLength={2}
                                    value={prazoDia}
                                    onChange={e => setPrazoDia(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Mês"
                                    maxLength={2}
                                    value={prazoMes}
                                    onChange={e => setPrazoMes(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Ano"
                                    maxLength={4}
                                    value={prazoAno}
                                    onChange={e => setPrazoAno(e.target.value)}
                                />
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
                            {loading ? 'Enviando...' : 'Enviar Pedido'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NewOrder;
