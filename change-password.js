const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models').Usuario;

const uri = "mongodb://localhost:27017/Xerox";

async function changePassword() {
    // Pegar argumentos da linha de comando: node change-password.js <usuario> <nova_senha>
    const userToChange = process.argv[2];
    const newPassword = process.argv[3];

    if (!userToChange || !newPassword) {
        console.log("Uso: node change-password.js <usuario> <nova_senha>");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB.");

        const user = await Usuario.findOne({ usuario: userToChange });

        if (!user) {
            console.log(`Usuário '${userToChange}' não encontrado.`);
            process.exit(1);
        }

        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(newPassword, salt);

        user.senha = hashSenha;
        await user.save();

        console.log(`Senha do usuário '${userToChange}' alterada com sucesso!`);

    } catch (error) {
        console.error("Erro ao alterar senha:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

changePassword();
