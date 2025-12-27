const mongoose = require('mongoose');
const models = require('./models');
const Impressao = models.Impressao;
const Prof = models.Prof;
const Departamento = models.Departamento;

const uri = "mongodb://localhost:27017/Xerox";

const titles = [
    "Apostila de Cálculo I", "Prova de História", "Relatório de Biologia",
    "TCC Parte 1", "Flyer Evento", "Lista de Exercícios Física",
    "Manual do Laboratório", "Artigo Científico", "Planta Baixa Térreo", "Convite Formatura",
    "Projeto Arquitetonico", "Tese Doutorado", "Provas Finais 3o Ano", "Cronograma 2024"
];

const papers = ["A4", "A3", "A5"];

async function seedFreshData() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB.");

        // Limpar TUDO antes
        await Impressao.deleteMany({});
        console.log("Banco de impressões limpo.");

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
        const now = new Date();

        // 5 Pedidos Pendentes (Ativos)
        for (let i = 0; i < 5; i++) {
            orders.push({
                titulo: titles[i % titles.length],
                profId: prof._id,
                copias: Math.floor(Math.random() * 30) + 1,
                tipoPapel: papers[Math.floor(Math.random() * papers.length)],
                colorida: Math.random() > 0.5,
                folhaDura: Math.random() > 0.7,
                plastificado: Math.random() > 0.8,
                status: false,
                recusado: false,
                expedicao: new Date()
            });
        }

        // 10 Pedidos Concluídos (Histórico) com DATA DE CONCLUSÃO preenchida
        for (let i = 0; i < 10; i++) {
            // Data de conclusão aleatória nas últimas 24h
            const conclusaoDate = new Date(now.getTime() - Math.floor(Math.random() * 86400000));

            orders.push({
                titulo: titles[(i + 5) % titles.length], // Titulos diferentes
                profId: prof._id,
                copias: Math.floor(Math.random() * 50) + 1,
                tipoPapel: papers[Math.floor(Math.random() * papers.length)],
                colorida: Math.random() > 0.5,
                folhaDura: Math.random() > 0.7,
                plastificado: Math.random() > 0.8,
                status: true, // CONCLUÍDO
                recusado: false,
                expedicao: new Date(conclusaoDate.getTime() - 3600000), // Criado 1h antes de concluir
                conclusao: conclusaoDate // TEM QUE TER DATA
            });
        }

        await Impressao.insertMany(orders);
        console.log("Novos dados gerados: 5 Ativos, 10 Histórico (com data).");

    } catch (error) {
        console.error("Erro ao gerar dados:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

seedFreshData();
