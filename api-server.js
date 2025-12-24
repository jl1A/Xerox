const express = require('express');
const app = express();
const port = 3000;


// Importar controllers
const professorController = require('../controllers/professor-controller');
const departamentoController = require('../controllers/departamento-controller');
const impressaoController = require('../controllers/impressao-controller');

// --------------------------------- Rotas ---------------------------------

// Rota para listar professores
app.post('/api/professores/list', (req, res) => {
    try {
        // 
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is required' });
        }
        const data = meuHandler(res);
        res.status(201).json({professores: data});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Todo: Adicionar mais rotas 
module.exports = app;