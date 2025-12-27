const mongoose = require('mongoose');
const impressaoModel = require('./models').Impressao;

const uri = "mongodb://localhost:27017/Xerox";

async function clearOrders() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB");

        const result = await impressaoModel.deleteMany({ status: false });
        console.log(`Removidos ${result.deletedCount} pedidos pendentes.`);

    } catch (error) {
        console.error("Erro ao limpar pedidos:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

clearOrders();
