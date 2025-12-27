const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = require('./models');
const Usuario = models.Usuario;
const Departamento = models.Departamento;
const Prof = models.Prof;
const Impressao = models.Impressao;

const uri = "mongodb://localhost:27017/Xerox";

async function createDeptUserAndData() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB.");

        // 1. Criar Departamento 'Juridico'
        let dept = await Departamento.findOne({ nomeDepartamento: "Juridico" });
        if (!dept) {
            dept = new Departamento({ nomeDepartamento: "Juridico", nomeCoordenador: "Dr. Marcos", numImpressoes: 0 });
            await dept.save();
            console.log("Departamento 'Juridico' criado.");
        }

        // 2. Criar Usuário 'departamento' vinculado ao 'Juridico'
        const login = "departamento";
        const senha = "123";
        let user = await Usuario.findOne({ usuario: login });

        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        if (user) {
            user.senha = hashSenha;
            user.role = 'dept';
            user.departamento = dept._id;
            await user.save();
            console.log("Usuário 'departamento' atualizado.");
        } else {
            user = new Usuario({
                usuario: login,
                senha: hashSenha,
                role: 'dept',
                departamento: dept._id
            });
            await user.save();
            console.log("Usuário 'departamento' criado.");
        }

        // 3. Criar Professor do Juridico
        let prof = await Prof.findOne({ nome: "Advogado Junior" });
        if (!prof) {
            prof = new Prof({ nome: "Advogado Junior", departamento: dept._id, numImpressões: 0 });
            await prof.save();
        }

        // 4. Criar Pedidos para esse professor (para aparecerem no painel dele)
        const pedidos = [
            { titulo: "Contrato Social v1", copias: 2, status: false }, // Pendente
            { titulo: "Procuração Geral", copias: 1, status: false },   // Pendente
            { titulo: "Petição Inicial Anexos", copias: 5, status: true, conclusao: new Date() } // Histórico
        ];

        for (const p of pedidos) {
            const novaImpressao = new Impressao({
                titulo: p.titulo,
                profId: prof._id,
                copias: p.copias,
                tipoPapel: 'A4',
                status: p.status,
                conclusao: p.conclusao || undefined,
                expedicao: new Date()
            });
            await novaImpressao.save();
        }
        console.log("Pedidos para o departamento 'Juridico' criados.");

    } catch (error) {
        console.error("Erro:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

createDeptUserAndData();
