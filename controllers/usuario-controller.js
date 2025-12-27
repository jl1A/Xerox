const Usuario = require('../models').Usuario;
const bcrypt = require('bcryptjs');

async function registrarUsuario(usuario, senha) {
    try {
        const existe = await Usuario.findOne({ usuario });
        if (existe) {
            throw new Error('Usuário já existe');
        }

        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            usuario,
            senha: hashSenha
        });

        await novoUsuario.save();
        return { message: 'Usuário criado com sucesso' };
    } catch (error) {
        throw error;
    }
}

async function login(usuario, senha) {
    try {
        const user = await Usuario.findOne({ usuario });
        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }

        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            throw new Error('Usuário ou senha inválidos');
        }

        return { message: 'Login realizado com sucesso', usuario: user.usuario, role: user.role };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    registrarUsuario,
    login
};
