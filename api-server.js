const express = require('express');
const app = express();
const port = 3000;


// Importar controllers
const professorController = require('./controllers/professor-controller');
const departamentoController = require('./controllers/departamento-controller');
const impressaoController = require('./controllers/impressao-controller');
const usuarioController = require('./controllers/usuario-controller');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// --------------------------------- Rotas ---------------------------------

// Rota para buscar impressões pendentes (pedidos ativos)
app.get('/api/impressoes/pendentes', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const user = req.query.user; // Get requesting user from query
        const result = await impressaoController.getPendingImpressões(page, limit, user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para criar nova impressão
app.post('/api/impressoes/nova', async (req, res) => {
    try {
        console.log("Recebendo nova impressão:", req.body);
        const { titulo, copias, tipoPapel, colorida, folhaDura, plastificado, user, professor, cliente, tipo } = req.body;

        let prof;

        // Se veio um usuário logado, tentar usar o departamento dele
        if (user) {
            const usuarioObj = await require('./models').Usuario.findOne({ usuario: user });
            if (usuarioObj && usuarioObj.role === 'dept' && usuarioObj.departamento) {

                if (professor) {
                    prof = await professorController.getProfessorbyName(professor);
                    if (!prof) {
                        console.log("Professor não encontrado, criando:", professor);
                        prof = await professorController.createProfessor(professor, usuarioObj.departamento);
                    }
                } else {
                    prof = await professorController.getProfessorbyName(`Prof. ${user}`);
                    if (!prof) {
                        prof = await professorController.createProfessor(`Prof. ${user}`, usuarioObj.departamento);
                    }
                }
            }
        }

        // Fallback: Pedido Externo (Balcão)
        if (!prof || tipo === 'externo') {
            console.log("Usando fallback de Pedido Externo/Balcão. Prof encontrado?", !!prof, "Tipo:", tipo);
            let dept = await departamentoController.getDepartamentobyNome("Balcão");
            if (!dept) {
                dept = await departamentoController.createDepartamento("Balcão", "Gerente");
            }
            prof = await professorController.getProfessorbyName("Pedido Externo");
            if (!prof) {
                prof = await professorController.createProfessor("Pedido Externo", dept._id);
            }
        }

        console.log("Professor final definido:", prof.nome, prof._id);
        const finalTitle = cliente ? cliente : titulo;

        // 2. Criar a impressão
        const novaImpressao = await impressaoController.createImpressao(
            finalTitle,
            prof._id,
            tipoPapel,
            parseInt(copias),
            colorida || false,
            folhaDura || false,
            plastificado || false,
            tipo || 'interno',
            (tipo === 'externo') // status: true if externo
        );

        res.status(201).json(novaImpressao);

    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para concluir uma impressão
app.post('/api/impressoes/:id/concluir', async (req, res) => {
    try {
        const { id } = req.params;
        const impressao = await impressaoController.concluirImpressão(id);
        res.json(impressao);
    } catch (error) {
        console.error("Erro ao concluir pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para recusar/cancelar uma impressão (X)
app.post('/api/impressoes/:id/recusar', async (req, res) => {
    try {
        const { id } = req.params;
        const impressao = await impressaoController.recusarImpressao(id);
        res.json(impressao);
    } catch (error) {
        console.error("Erro ao recusar pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para confirmar recebimento (Dept)
app.post('/api/impressoes/:id/recebido', async (req, res) => {
    try {
        const { id } = req.params;
        const impressao = await impressaoController.confirmarRecebimento(id);
        res.json(impressao);
    } catch (error) {
        console.error("Erro ao confirmar recebimento:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para histórico
app.get('/api/impressoes/historico', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const user = req.query.user; // Get requesting user
        const impressoes = await impressaoController.getHistory(page, limit, user);
        res.json(impressoes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para listar professores do departamento do usuário
app.get('/api/professores', async (req, res) => {
    try {
        const user = req.query.user;
        if (!user) return res.json([]); // Retorna vazio se não houver user

        const usuarioObj = await require('./models').Usuario.findOne({ usuario: user });
        if (!usuarioObj || !usuarioObj.departamento) {
            return res.json([]);
        }

        const profs = await professorController.getProfessorByDept(usuarioObj.departamento);
        res.json(profs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const statsController = require('./controllers/stats-controller');
// Rota para estatísticas da diretoria
app.get('/api/estatisticas/geral', async (req, res) => {
    try {
        const stats = await statsController.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas de Autenticação
app.post('/api/auth/register', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        if (!usuario || !senha) throw new Error('Usuario e senha são obrigatórios');

        const result = await usuarioController.registrarUsuario(usuario, senha);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const result = await usuarioController.login(usuario, senha);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = app;