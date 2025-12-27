const app = require('./api-server');
const mongoose = require('mongoose');

const uri = "mongodb://localhost:27017/Xerox";
const port = 3000;

async function startServer() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB");

        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
            console.log(`Acesse: http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Erro ao iniciar servidor:", error);
    }
}

startServer();
