const impressaoModel = require('../models').Impressao;
const profModel = require('../models').Prof;
const departamentoModel = require('../models').Departamento;

async function createImpressao(titulo, profId, tipoPapel, copias, colorida, folhaDura, plastificado, tipo = 'interno', status = false) {
    try {
        const novaImpressao = new impressaoModel({
            titulo,
            profId,
            copias,
            tipoPapel,
            colorida,
            folhaDura,
            plastificado,
            tipo,
            status, // Usa o status passado
            conclusao: status ? Date.now() : undefined // Se já nasce concluido, marca data
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
        const impressoes = await impressaoModel.find({ departamento: departamentoId });
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
async function getLastNumimpressoes(num) {
    try {
        const impressao = await impressaoModel.find().sort({ _id: -1 }).limit(num);
        return impressao;
    } catch (error) {
        console.error("Erro ao buscar a impressão pelo ID:", error);
        throw error;
    }
}

async function getPageImpressao(page, limit) {
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

async function concluirImpressão(id) {
    try {
        // 1. Buscar a impressão para pegar os dados (copias, profId)
        const impressao = await impressaoModel.findById(id).populate('profId');
        if (!impressao) {
            throw new Error("Impressão não encontrada");
        }

        if (impressao.status === true) {
            return impressao; // Já concluída
        }

        // 2. Atualizar status da impressão
        const impressaoAtualizada = await impressaoModel.findByIdAndUpdate(
            id,
            { status: true, conclusao: Date.now() },
            { new: true }
        );

        const numImpressions = impressao.copias || 0;
        const professor = impressao.profId;

        if (professor) {
            // 3. Atualizar o contador de impressões no professor
            await profModel.updateOne({ _id: professor._id }, { $inc: { numImpressões: numImpressions } });

            // 4. Atualizar o contador de impressões no departamento
            if (professor.departamento) {
                await departamentoModel.updateOne({ _id: professor.departamento }, { $inc: { numImpressoes: numImpressions } });
            }
        }

        return impressaoAtualizada;
    } catch (error) {
        console.error("Erro ao concluir a impressão:", error);
        throw error;
    }
};

async function getPendingImpressões(page = 1, limit = 6, requestingUser = null) {
    try {
        // Default Admin View: All internally generated orders that are not rejected and NOT completed.
        let query = { status: false, recusado: { $ne: true }, tipo: 'interno' };

        // Filtragem por usuário/departamento
        if (requestingUser) {
            const user = await require('../models').Usuario.findOne({ usuario: requestingUser });
            if (user && user.role === 'dept' && user.departamento) {
                // Buscar professores deste departamento
                const profs = await profModel.find({ departamento: user.departamento });
                const profIds = profs.map(p => p._id);

                // Para o Departamento, mostramos:
                // 1. Pedidos Pendentes (status: false)
                // 2. Pedidos Concluídos mas NÃO Recebidos (status: true, recebido: false)
                query = {
                    $or: [
                        { status: false, recusado: { $ne: true }, profId: { $in: profIds } },
                        { status: true, recebido: false, profId: { $in: profIds } }
                    ]
                };
            }
        }

        const total = await impressaoModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const impressoesPendentes = await impressaoModel.find(query)
            .sort({ _id: -1 }) // Newest first
            .populate('profId')
            .skip(skip)
            .limit(limit);

        return {
            data: impressoesPendentes,
            meta: {
                total,
                totalPages,
                currentPage: parseInt(page),
                limit
            }
        };
    } catch (error) {
        console.error("Erro ao buscar impressões pendentes:", error);
        throw error;
    };
};

async function confirmarRecebimento(id) {
    try {
        const impressaoAtualizada = await impressaoModel.findByIdAndUpdate(
            id,
            { recebido: true },
            { new: true }
        );
        return impressaoAtualizada;
    } catch (error) {
        console.error("Erro ao confirmar recebimento:", error);
        throw error;
    }
}

async function recusarImpressao(id) {
    try {
        const impressaoAtualizada = await impressaoModel.findByIdAndUpdate(
            id,
            { recusado: true }, // Marca como recusado
            { new: true }
        );
        return impressaoAtualizada;
    } catch (error) {
        console.error("Erro ao recusar a impressão:", error);
        throw error;
    }
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

async function getHistory(page = 1, limit = 6, requestingUser = null) {
    try {
        const query = { status: true };

        // Filtragem por usuário/departamento
        if (requestingUser) {
            const user = await require('../models').Usuario.findOne({ usuario: requestingUser });
            if (user && user.role === 'dept' && user.departamento) {
                const profs = await profModel.find({ departamento: user.departamento });
                const profIds = profs.map(p => p._id);
                query.profId = { $in: profIds };
            }
        }

        const total = await impressaoModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const impressoes = await impressaoModel.find(query)
            .sort({ conclusao: -1 })
            .skip(skip)
            .limit(limit)
            .populate('profId');

        return {
            data: impressoes,
            meta: {
                total,
                totalPages,
                currentPage: parseInt(page),
                limit
            }
        };
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
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
    recusarImpressao,
    deleteImpressão,
    getHistory,
    confirmarRecebimento
};