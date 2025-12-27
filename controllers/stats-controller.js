const Impressao = require('../models').Impressao;
const Prof = require('../models').Prof;
const Departamento = require('../models').Departamento;

async function getStats() {
    try {
        // 1. Gastos por Departamento (Volume de Cópias)
        // Precisamos agregar impressões -> join professor -> group by departamento
        const statsDepartamento = await Impressao.aggregate([
            { $match: { status: true } }, // Apenas concluídos contam como gasto real? Ou todos? Geralmente concluídos.
            {
                $lookup: {
                    from: "profs",
                    localField: "profId",
                    foreignField: "_id",
                    as: "professor"
                }
            },
            { $unwind: "$professor" },
            {
                $lookup: {
                    from: "departamentos",
                    localField: "professor.departamento",
                    foreignField: "_id",
                    as: "dept"
                }
            },
            { $unwind: "$dept" },
            {
                $group: {
                    _id: "$dept.nomeDepartamento",
                    totalCopias: { $sum: "$copias" },
                    countPedidos: { $sum: 1 }
                }
            },
            { $sort: { totalCopias: -1 } }
        ]);

        // 2. Todos os Professores (para tabela e top charts)
        const topProfessores = await Impressao.aggregate([
            { $match: { status: true } },
            {
                $group: {
                    _id: "$profId",
                    totalCopias: { $sum: "$copias" },
                    countPedidos: { $sum: 1 }
                }
            },
            { $sort: { totalCopias: -1 } },
            // Removed limit to get full list for table
            {
                $lookup: {
                    from: "profs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "professor"
                }
            },
            { $unwind: "$professor" },
            {
                $project: {
                    nome: "$professor.nome",
                    totalCopias: 1,
                    countPedidos: 1
                }
            }
        ]);

        return {
            departamentos: statsDepartamento,
            professores: topProfessores
        };

    } catch (error) {
        console.error("Erro ao gerar estatísticas:", error);
        throw error;
    }
}

module.exports = {
    getStats
};
