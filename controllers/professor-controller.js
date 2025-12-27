const profModel = require('../models').Prof;

async function createProfessor(nome, departamentoId) {
    try {
        const novoProfessor = new profModel({
            nome: nome,
            departamento: departamentoId,
            numImpressões: 0
        });
        const resultado = await novoProfessor.save();
        return resultado;
    } catch (error) {
        console.error("Erro ao encontrar o departamento:", error);
        throw error;
    }
};

async function getProfessorById(id) {
    try {
        const professor = await profModel.findById(id);
        return professor;
    } catch (error) {
        console.error("Erro ao encontrar o departamento: ", error);
        throw error;
    }
};

async function getProfessorId(nome) {
    try {
        const tempProf = profModel.findOne({ nome: nome });
        return tempDpt._id;
    } catch {
        console.error("Erro ao encontrar o departamento:", error);
        throw error;
    }
};
async function getProfessorbyName(nome) {
    try {
        const professor = await profModel.findOne({ nome: nome });
        return professor;
    } catch (error) {
        console.error("Erro ao buscar professor pelo nome:", error);
        throw error;
    }
};

async function getProfessorByDept(deptId) {
    try {
        return await profModel.find({ departamento: deptId });
    } catch (error) {
        throw error;
    }
}

async function getProfessorbydepartamento(departamentoId) {
    try {
        const departamento = await profModel.find({ departamento: departamentoId });
        return departamento;
    }
    catch (error) {
        console.error("Erro ao buscar professores pelo departamento:", error);
        throw error;
    }
};

async function getAllProfessorsNames() {
    try {
        const professors = await profModel.find().select('nome -_id');
        return professors;
    }
    catch (error) {
        console.error("Erro ao buscar nomes dos professores:", error);
        throw error;
    }
};

async function updateProfessorImpressao(id, numImpressions) {
    try {
        const resultado = await profModel.updateOne({ _id: id }, { $inc: { numImpressoes: numImpressions } });
        return resultado;
    }
    catch (error) {
        console.error("Erro ao atualizar número de impressões do professor:", error);
        throw error;
    }
};

async function getimpressaoByProfessor(id) {
    try {
        const impressao = await profModel.findById(id).select('numImpressões');
        return impressao;
    }
    catch (error) {
        console.error("Erro ao buscar número de impressões do professor:", error);
        throw error;
    }
};
async function updateimpressoesProfessor(id, numImpressions) {
    try {
        const resultado = await profModel.updateOne({ _id: id }, { $inc: { numImpressões: numImpressions } });
        return resultado;
    }
    catch (error) {
        console.error("Erro ao atualizar número de impressões do professor:", error);
        throw error;
    }
};

module.exports = {
    createProfessor,
    getProfessorById,
    getProfessorId,
    getProfessorbyName,
    getProfessorbydepartamento,
    getProfessorByDept,
    getAllProfessorsNames,
    updateProfessorImpressao,
    getimpressaoByProfessor,
    updateimpressoesProfessor
};
