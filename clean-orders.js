const mongoose = require('mongoose');
const { Impressao } = require('./models');

const uri = "mongodb://localhost:27017/Xerox";

async function cleanOrders() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para limpeza...");

        /* 
           Opções:
           1. Deletar TUDO (Ativos e Histórico): Impressao.deleteMany({})
           2. Deletar apenas finalizados: Impressao.deleteMany({ status: true })
           
           Vou configurar para deletar TUDO conforme solicitado ("limpar os pedidos"),
           mas deixo comentado a opção parcial.
        */

        const result = await Impressao.deleteMany({});
        console.log(`\n✅ Sucesso! Total de pedidos removidos: ${result.deletedCount}`);

    } catch (error) {
        console.error("❌ Erro ao limpar pedidos:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Desconectado.");
        process.exit();
    }
}

cleanOrders();
