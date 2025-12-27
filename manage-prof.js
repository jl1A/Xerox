const mongoose = require('mongoose');
const models = require('./models');
const Prof = models.Prof;
const Departamento = models.Departamento;
const Usuario = models.Usuario;

const uri = "mongodb://localhost:27017/Xerox";

async function manageProf() {
    // Uso: 
    // Adicionar: node manage-prof.js add <NomeDoProf> <UsuarioDoDept>
    // Remover:   node manage-prof.js remove <NomeDoProf>

    const action = process.argv[2]; // 'add' ou 'remove'
    const profName = process.argv[3];
    const deptUser = process.argv[4]; // Apenas para 'add'

    if (!action || !profName) {
        console.log("Uso:");
        console.log("  Adicionar: node manage-prof.js add \"Nome do Prof\" <usuario_dept>");
        console.log("  Remover:   node manage-prof.js remove \"Nome do Prof\"");
        console.log("Exemplos:");
        console.log("  node manage-prof.js add \"Prof. Substituto\" finais");
        console.log("  node manage-prof.js remove \"Prof. Joao\"");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB.");

        if (action === 'add') {
            if (!deptUser) {
                console.log("Erro: Para adicionar, informe o usuário do departamento (ex: 'finais', 'geral', 'pre').");
                process.exit(1);
            }

            // 1. Achar o departamento pelo usuario (que é unique e facil de digitar)
            // Primeiro achamos o Usuario para pegar o ID do Dept
            const userObj = await Usuario.findOne({ usuario: deptUser }).populate('departamento');

            if (!userObj || !userObj.departamento) {
                console.log(`Erro: Usuário de departamento '${deptUser}' não encontrado ou não tem departamento vinculado.`);
                process.exit(1);
            }

            const deptId = userObj.departamento._id;
            const deptName = userObj.departamento.nomeDepartamento;

            // 2. Criar Prof
            const novoProf = new Prof({
                nome: profName,
                departamento: deptId,
                numImpressões: 0
            });

            await novoProf.save();
            console.log(`Sucesso! '${profName}' adicionado ao departamento '${deptName}'.`);

        } else if (action === 'remove') {
            const result = await Prof.deleteOne({ nome: profName });

            if (result.deletedCount > 0) {
                console.log(`Sucesso! '${profName}' removido.`);
            } else {
                console.log(`Erro: Professor '${profName}' não encontrado.`);
            }
        } else {
            console.log("Ação inválida. Use 'add' ou 'remove'.");
        }

    } catch (error) {
        console.error("Erro:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

manageProf();
