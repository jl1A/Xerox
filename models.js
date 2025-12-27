const mongoose = require('mongoose');

// Definição dos Schemas
const departamentoSchema = new mongoose.Schema({
    nomeDepartamento: String,
    nomeCoordenador: String,
    numImpressoes: { type: Number, default: 0, min: 0 }
});

const profSchema = new mongoose.Schema({
    nome: String,
    departamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Departamento' },
    numImpressões: { type: Number, default: 0, min: 0 }
});

const impressaoSchema = new mongoose.Schema({
    titulo: String,

    // Referência (Link) para o Professor
    profId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prof',
        required: true
    },

    copias: { type: Number, required: true, min: 1 },
    tipoPapel: { type: String, enum: ['A4', 'A3'], default: 'A4' },
    tipo: { type: String, enum: ['interno', 'externo'], default: 'interno' },
    // Opções de Acabamento (booleans)
    colorida: { type: Boolean, default: false },
    folhaDura: { type: Boolean, default: false },
    plastificado: { type: Boolean, default: false },

    // Datas e Status
    tipo: { type: String, enum: ['interno', 'externo'], default: 'interno' },
    recebido: { type: Boolean, default: false },
    expedicao: { type: Date, default: Date.now },
    status: { type: Boolean, default: false }, // false = pendente, true = concluídao
    recusado: { type: Boolean, default: false }, // Tag para pedidos cancelados/recusados (X)
    conclusao: { type: Date } // Data de conclusão real
});

const usuarioSchema = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: { type: String, enum: ['admin', 'dept', 'diretoria'], default: 'dept' },
    departamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Departamento' }
});

const Departamento = mongoose.model('Departamento', departamentoSchema);
const Prof = mongoose.model('Prof', profSchema);
const Impressao = mongoose.model('Impressao', impressaoSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = {
    Departamento,
    Prof,
    Impressao,
    Usuario
};


