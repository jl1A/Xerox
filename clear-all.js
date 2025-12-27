const mongoose = require('mongoose');
const models = require('./models');
const Impressao = models.Impressao;

const uri = "mongodb://localhost:27017/Xerox";

async function clearAllRequests() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para limpeza total.");

        // Remove TODAS as impressões (pendentes, concluídas, recusadas)
        const result = await Impressao.deleteMany({});
        console.log(`Removidos ${result.deletedCount} pedidos do banco de dados (Histórico e Ativos).`);

    } catch (error) {
        console.error("Erro ao limpar pedidos:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

clearAllRequests();
