const mongoose = require('mongoose');
const departamentoController = require('./controllers/departamento-controller');
const professorController = require('./controllers/professor-controller');
const impressaoController = require('./controllers/impressao-controller');

const uri = "mongodb://localhost:27017/Xerox";

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB");

        // 1. Garantir Departamento
        let dept = await departamentoController.getDepartamentobyNome("Tecnologia");
        if (!dept) {
            console.log("Criando departamento Tecnologia...");
            dept = await departamentoController.createDepartamento("Tecnologia", "Coordenador TI");
        }
        console.log("Departamento ID:", dept._id);

        // 2. Garantir Professor
        let prof = await professorController.getProfessorbyName("João Dev");
        if (!prof) {
            console.log("Criando professor João Dev...");
            prof = await professorController.createProfessor("João Dev", dept._id);
        }
        console.log("Professor ID:", prof._id);

        // 3. Criar Impressão Pendente
        const titulos = ["Prova de História", "Apostila de Ciências", "Exercícios de Matemática", "Comunicado aos Pais", "Projeto de Artes"];
        const randomTitulo = titulos[Math.floor(Math.random() * titulos.length)];
        const randomCopias = Math.floor(Math.random() * 50) + 10;

        console.log(`Criando nova impressão: ${randomTitulo}...`);
        const novaImpressao = await impressaoController.createImpressao(
            randomTitulo,          // Título Aleatório
            prof._id,              // ID do Professor
            "A4",                  // Tipo de Papel
            randomCopias,          // Cópias Aleatórias
            Math.random() > 0.5,   // Random Colorida
            false,                 // Folha Dura
            false                  // Plastificado
        );

        console.log("Impressão criada com sucesso:", novaImpressao);

    } catch (error) {
        console.error("Erro no seed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

seed();
