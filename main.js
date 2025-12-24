// Carregando módulos
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose'); 

// Carregando modelos e controllers
const {Departamento, Prof, Impressao} = require('./models');
const professorController = require('./controllers/professor-controller');
const departamentoController = require('./controllers/departamento-controller');
const impressaoController = require('./controllers/impressao-controller');
    
const { get } = require('http');




const uri = "mongodb://localhost:27017/Xerox";
const port = 3000;

async function run(){
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB");
        // Criação de um novo departamento
        // const novoDepartamento = await departamentoController.createDepartamento("Educação infantil");
        // console.log("Novo Departamento criado:", novoDepartamento);

        // const novoProfessor = await professorController.createProfessor("Ana Maria", novoDepartamento._id);
        // console.log("Novo Professor criado:", novoProfessor);

        // const novaImpressao = await impressaoController.createImpressao("Relatório de atividades", novoProfessor._id, "A4", 15, true, false, true);
        // console.log("Nova Impressão criada:", novaImpressao);

        const impressão = await impressaoController.getImpressaoById('694bf2ebf6073ffb4b455977');
        const professor = await professorController.getProfessorById(impressão.profId);
        const  departamento = await departamentoController.getDepartamentoById(professor.departamento);
        console.log("Impressão carregada:", impressão);
        console.log("Professor da impressão:", professor);
        console.log("Departamento do professor:", departamento);

        const impressaoConcluida = await impressaoController.concluirImpressão(impressão._id, departamento.id, professor._id, 15);
        console.log("Impressão concluída:", impressaoConcluida);


    } catch(erro) {
        console.error('Erro: ', erro);
    }finally{
        await mongoose.connection.close();
        console.log("Conexão fechada. Script finalizado.");
    }
}


run();