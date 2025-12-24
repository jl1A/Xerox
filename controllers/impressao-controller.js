const impressaoModel = require('../models').Impressao;
const profModel = require('../models').Prof;
const departamentoModel = require('../models').Departamento;

async function createImpressao(titulo, professorId, tipoPapel, numPaginas, colorida, folhaDura, plastificado) {
    try {
        const novaImpressao = new impressaoModel({
            titulo: titulo,
            profId: professorId, 
            copias: numPaginas,
            tipoPapel: tipoPapel,
            colorida: colorida,
            folhaDura: folhaDura,
            plastificado: plastificado,
        });
        const resultado = await novaImpressao.save();
        return resultado;
    } catch (error) {
        console.error("Erro ao criar impressão:", error);
        throw error;
    }
};

async function getImpressaobyDepartamento(departamentoId) {
    try {
        const impressoes = await impressaoModel.find({departamento: departamentoId});
        return impressoes;
    } catch (error) {
        console.error("Erro ao buscar impressões pelo departamento:", error);
        throw error;
    }
};

async function getImpressaoById(id) {
    try {
        const impressao = await impressaoModel.findById(id);
        return impressao;
    } catch (error) {
        console.error("Erro ao buscar a impressão pelo ID:", error);
        throw error;
    }
};
async function getLastNumimpressoes(num){
    try {
        const impressao = await impressaoModel.find().sort({ _id: -1 }).limit(num);
        return impressao;
    } catch (error) {
        console.error("Erro ao buscar a impressão pelo ID:", error);
        throw error;
    }
}

async function getPageImpressao(page, limit){
    try {
        const impressoes = await impressaoModel.find()
            .skip((page - 1) * limit)
            .limit(limit);
        return impressoes;
    } catch (error) {
        console.error("Erro ao buscar as impressões paginadas:", error);
        throw error;
    }
};

async function concluirImpressão(id,departamentoId,professorId,numImpressions) {
    try {
        const impressaoAtualizada = await impressaoModel.findByIdAndUpdate
        (id, { status: true, conclusao: Date.now() }, { new: true });
            // Atualizar o contador de impressões no departamento
        await departamentoModel.updateOne({ _id: departamentoId }, { $inc: { numImpressoes: numImpressions } });
        // Atualizar o contador de impressões no professor
        await profModel.updateOne({ _id: professorId }, { $inc: { numImpressões: numImpressions } });

        return impressaoAtualizada;
    } catch (error) {
        console.error("Erro ao concluir a impressão:", error);
        throw error;
    }
     -0
};

async function getPendingImpressões() {
    try {
        const impressoesPendentes = await impressaoModel.find({ status: false });
        return impressoesPendentes;
    } catch (error) {
        console.error("Erro ao buscar impressões pendentes:", error);
        throw error;
    };
};

async function deleteImpressão(id) {
    try {
        const resultado = await impressaoModel.findByIdAndDelete(id);
        return resultado;
    } catch (error) {
        console.error("Erro ao deletar a impressão:", error);
        throw error;
    }
};

module.exports = {
    createImpressao,
    getImpressaobyDepartamento,
    getImpressaoById,
    getLastNumimpressoes,
    concluirImpressão,
    getPendingImpressões,
    deleteImpressão
};