const mongoose = require('mongoose');
const models = require('./models');
const Impressao = models.Impressao;
const Prof = models.Prof;
const Departamento = models.Departamento;

const uri = "mongodb://localhost:27017/Xerox";

const titles = [
    "Apostila de Cálculo I", "Prova de História", "Relatório de Biologia",
    "TCC Parte 1", "Flyer Evento", "Lista de Exercícios Física",
    "Manual do Laboratório", "Artigo Científico", "Planta Baixa Térreo", "Convite Formatura"
];

const papers = ["A4", "A3", "A5"];

async function createManyOrders() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para criar múltiplos pedidos.");

        // Garantir dept/prof base
        let dept = await Departamento.findOne({ nome: "Geral" });
        if (!dept) {
            dept = new Departamento({ nome: "Geral", responsavel: "Coordenação" });
            await dept.save();
        }

        let prof = await Prof.findOne({ nome: "Prof. Aleatório" });
        if (!prof) {
            prof = new Prof({ nome: "Prof. Aleatório", departamento: dept._id });
            await prof.save();
        }

        const orders = [];

        for (let i = 0; i < 10; i++) {
            orders.push({
                titulo: titles[i],
                profId: prof._id,
                copias: Math.floor(Math.random() * 50) + 1,
                tipoPapel: papers[Math.floor(Math.random() * papers.length)],
                colorida: Math.random() > 0.5,
                folhaDura: Math.random() > 0.7,
                plastificado: Math.random() > 0.8,
                status: false,
                recusado: false,
                expedicao: new Date()
            });
        }

        await Impressao.insertMany(orders);
        console.log("10 pedidos criados com sucesso!");

    } catch (error) {
        console.error("Erro ao criar pedidos:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

createManyOrders();
