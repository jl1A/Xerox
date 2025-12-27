const mongoose = require('mongoose');
// Importar os modelos corretamente
const models = require('./models');
const Impressao = models.Impressao;
const Prof = models.Prof;
const Departamento = models.Departamento;

const uri = "mongodb://localhost:27017/Xerox";

async function createComplexOrder() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para criar pedido complexo.");

        // Garantir que existe um professor/departamento para associar
        let dept = await Departamento.findOne({ nome: "Arquitetura" });
        if (!dept) {
            dept = new Departamento({ nome: "Arquitetura", responsavel: "Chefe Arq" });
            await dept.save();
        }

        let prof = await Prof.findOne({ nome: "Prof. Oscar Niemeyer" });
        if (!prof) {
            prof = new Prof({ nome: "Prof. Oscar Niemeyer", departamento: dept._id });
            await prof.save();
        }

        const complexOrder = new Impressao({
            titulo: "Projeto Final - Complexo Residencial",
            profId: prof._id,
            copias: 10,
            tipoPapel: "A3",
            colorida: true,
            folhaDura: true,
            plastificado: true,
            status: false, // Pendente
            recusado: false,
            expedicao: new Date()
        });

        await complexOrder.save();
        console.log("Pedido complexo criado com sucesso!");
        console.log(complexOrder);

    } catch (error) {
        console.error("Erro ao criar pedido:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

createComplexOrder();
