const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = require('./models');

const Departamento = models.Departamento;
const Prof = models.Prof;
const Impressao = models.Impressao;
const Usuario = models.Usuario;

const uri = "mongodb://localhost:27017/Xerox";

async function seedSchoolData() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para reset escolar.");

        // 1. Limpar Tudo
        await Impressao.deleteMany({});
        await Prof.deleteMany({});
        await Departamento.deleteMany({});
        await Usuario.deleteMany({});
        console.log("Banco de dados limpo.");

        // 2. Criar Departamentos Escolares
        const deptsData = [
            { nome: "Diversificado", coord: "Coord. Daniel", user: "diversificado" },
            { nome: "Pré-Escola", coord: "Coord. Ana", user: "pre" },
            { nome: "Anos Iniciais", coord: "Coord. Beatriz", user: "iniciais" },
            { nome: "Anos Finais", coord: "Coord. Carlos", user: "finais" }
        ];

        const deptsMap = {};

        // 2.1 Criar Usuários "Sistema"
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash("123", salt);

        await new Usuario({
            usuario: "xerox",
            senha: hashSenha,
            role: "admin"
        }).save();
        console.log("Usuário 'xerox' (role: admin) criado.");

        // Criar usuário Diretoria
        await new Usuario({
            usuario: "diretoria",
            senha: hashSenha,
            role: "diretoria"
        }).save();
        console.log("Usuário 'diretoria' criado.");

        for (const d of deptsData) {
            // Criar Dept
            const newDept = new Departamento({
                nomeDepartamento: d.nome,
                nomeCoordenador: d.coord,
                numImpressoes: 0
            });
            await newDept.save();
            deptsMap[d.user] = newDept; // Guardar referencia para usar no usuario

            // Criar Usuário do Dept
            await new Usuario({
                usuario: d.user,
                senha: hashSenha, // Todos com senha '123'
                role: "dept",
                departamento: newDept._id
            }).save();

            console.log(`Departamento '${d.nome}' e usuário '${d.user}' criados.`);
        }

        // 3. Criar Professores e Pedidos

        // Dados para Pré-Escola (pre)
        const profsPre = ["Tia Ju (Pré I)", "Tia Sol (Pré II)", "Prof. Carol (Música)"];
        const pedidosPre = [
            { titulo: "Desenho para Colorir - Páscoa", copias: 15, status: false },
            { titulo: "Atividade Coordenação Motora", copias: 20, status: true, conclusao: new Date(Date.now() - 100000000) },
            { titulo: "Aviso caderno de recados", copias: 15, status: false, tipoPapel: "A5" } // A5 might be rejected by model enum, let's use A4
        ];
        // Fix A5 to A4 as per model enum change
        pedidosPre[2].tipoPapel = "A4";

        await createDataForDept(deptsMap["pre"], profsPre, pedidosPre);

        // Dados para Anos Iniciais (iniciais)
        const profsIniciais = ["Prof. Maria (1º Ano)", "Prof. João (3º Ano)", "Prof. Clara (5º Ano)"];
        const pedidosIniciais = [
            { titulo: "Atividade de Alfabetização - Vogais", copias: 25, status: false, colorida: true },
            { titulo: "Prova de Matemática - Adição", copias: 28, status: false },
            { titulo: "Recorte e Cole - Animais", copias: 25, status: false, folhaDura: true },
            { titulo: "Lista de Materiais", copias: 25, status: true, conclusao: new Date(Date.now() - 86400000) }
        ];
        await createDataForDept(deptsMap["iniciais"], profsIniciais, pedidosIniciais);

        // Dados para Anos Finais (finais)
        const profsFinais = ["Prof. Roberto (Matemática)", "Prof. Julia (Português)", "Prof. Marcos (História)"];
        const pedidosFinais = [
            { titulo: "Lista de Exercícios - Álgebra", copias: 30, status: false },
            { titulo: "Texto para Interpretação", copias: 30, status: false, tipoPapel: "A4" },
            { titulo: "Mapa Mundi - Mudo", copias: 30, status: true, conclusao: new Date() }
        ];
        await createDataForDept(deptsMap["finais"], profsFinais, pedidosFinais);

        // Dados para Diversificado (diversificado)
        const profsDiv = ["Prof. Lucas (Robótica)", "Prof. Fernanda (Artes)", "Treinador Paulo (Esportes)"];
        const pedidosDiv = [
            { titulo: "Manual do Kit Robótica", copias: 15, status: false, folhaDura: true },
            { titulo: "Partituras Coral", copias: 40, status: false },
            { titulo: "Ficha de Inscrição Campeonato", copias: 100, status: true, conclusao: new Date() }
        ];
        await createDataForDept(deptsMap["diversificado"], profsDiv, pedidosDiv);


        console.log("Todos os dados escolares gerados com sucesso!");

    } catch (error) {
        console.error("Erro ao gerar dados:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

async function createDataForDept(deptObj, profNames, ordersData) {
    for (const pName of profNames) {
        const prof = new Prof({ nome: pName, departamento: deptObj._id, numImpressões: 0 });
        await prof.save();

        // Distribuir pedidos entre os profs (simples: todos pedidos pra todos ou random, vou dar alguns pra cada)
        // Vou dar 1 ou 2 pedidos aleatorios dessa lista pra cada prof
        const numOrders = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numOrders; i++) {
            const orderTemplate = ordersData[Math.floor(Math.random() * ordersData.length)];
            const impressao = new Impressao({
                titulo: orderTemplate.titulo,
                profId: prof._id,
                copias: orderTemplate.copias,
                tipoPapel: orderTemplate.tipoPapel || 'A4',
                colorida: orderTemplate.colorida || false,
                folhaDura: orderTemplate.folhaDura || false,
                plastificado: orderTemplate.plastificado || false,
                status: orderTemplate.status, // true/false
                conclusao: orderTemplate.conclusao,
                expedicao: new Date(),
                recusado: false
            });
            await impressao.save();
        }
    }
}

seedSchoolData();
