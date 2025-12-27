const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = require('./models');
const Usuario = models.Usuario;

const uri = "mongodb://localhost:27017/Xerox";

async function createAdminUser() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para criar usuário.");

        const usuario = "admin";
        const senha = "123";

        // Verifica se já existe
        const existe = await Usuario.findOne({ usuario });

        if (existe) {
            console.log("Usuário 'admin' já existe. Atualizando senha...");
            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(senha, salt);
            existe.senha = hashSenha;
            await existe.save();
            console.log("Senha do 'admin' atualizada para '123'.");
        } else {
            console.log("Criando usuário 'admin'...");
            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(senha, salt);

            const novoUsuario = new Usuario({
                usuario,
                senha: hashSenha
            });

            await novoUsuario.save();
            console.log("Usuário 'admin' criado com sucesso!");
        }

    } catch (error) {
        console.error("Erro ao gerenciar usuário:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

createAdminUser();
