const deptModel = require('../models').Departamento;

async function createDepartamento (nomeDpt,nomeCoord){
    try{
        const novoDpt = new deptModel({
            nomeDepartamento: nomeDpt,
            nomeCoordenador: nomeCoord,
            numImpressoes: 0
        });
        const resultado = await novoDpt.save();
        return resultado;
    }catch(error){
        console.error("Não foi possivel criar departamento: ", error)
        throw error;
    }
};

async function getDepartamentoId(nome){
    try{
        const tempDpt = await deptModel.findOne({nomeDepartamento: nome});
        if (!tempDpt) return null;
        return tempDpt._id;
    }
    catch(error){
        console.error("Erro ao encontrar o departamento:", error);
        throw error;
    }
};

async function getDepartamentobyNome(nome){
    try{
        const departamento = await deptModel.findOne({nomeDepartamento: nome})
        return departamento;
    }
    catch(error) {
        console.error("Erro ao buscar o departamento:", error);
        throw error;
    }
};

async function getDepartamentoById(id) {
    try {
        const departamento = await deptModel.findById(id);
        return departamento;
    }
    catch (error) {
        console.error("Erro ao buscar o departamento pelo ID:", error);
        throw error;
    }
}; 

module.exports = {
    createDepartamento,
    getDepartamentoId,
    getDepartamentobyNome,
    getDepartamentoById
};