const mongoose = require('mongoose');

// Definição dos Schemas
const departamentoSchema = new mongoose.Schema({
    nomeDepartamento: String,
    nomeCoordenador: String,
    numImpressoes: Number
});

const profSchema = new mongoose.Schema({
    nome: String,
    departamento: {type: mongoose.Schema.Types.ObjectId, ref: 'Departamento'},
    numImpressões: Number
});

const impressaoSchema = new mongoose.Schema({
    titulo: String,
    
    // Referência (Link) para o Professor
    profId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Prof',
        required: true
    },

    copias: { type: Number, required: true },
    tipoPapel: { type: String, enum: ['A4', 'A3', 'A5'], default: 'A4' },
    // Opções de Acabamento (booleans)
    colorida: { type: Boolean, default: false },
    folhaDura: { type: Boolean, default: false },
    plastificado: { type: Boolean, default: false },
    
    // Datas e Status
    expedicao: { type: Date, default: Date.now },
    status: { type: Boolean, default: false } // false = pendente, true = concluído
});

const Departamento = mongoose.model('Departamento', departamentoSchema);
const Prof = mongoose.model('Prof', profSchema);
const Impressao = mongoose.model('Impressao', impressaoSchema);

module.exports = {
    Departamento,
    Prof,
    Impressao,
};


