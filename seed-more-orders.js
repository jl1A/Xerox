const mongoose = require('mongoose');
const models = require('./models');

const Departamento = models.Departamento;
const Prof = models.Prof;
const Impressao = models.Impressao;
const Usuario = models.Usuario;

const uri = "mongodb://localhost:27017/Xerox";

async function seedMoreOrders() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB para criar pedidos extras...");

        // Buscar departamentos e seus professores
        const depts = await Departamento.find({});

        const newOrders = [
            { titulo: "Avisos de Reunião de Pais", copias: 150, tipoPapel: "A4", deptName: "Administração", status: false },
            { titulo: "Atividade de Geografia - Mapas", copias: 30, tipoPapel: "A3", colorida: true, deptName: "Anos Finais (6º ao 9º)", status: false },
            { titulo: "Prova Recuperação Biologia", copias: 15, tipoPapel: "A4", deptName: "Ensino Médio", status: false },
            { titulo: "Desenhos para Colorir - Natal", copias: 40, tipoPapel: "A4", deptName: "Educação Infantil", status: false },
            { titulo: "Relatório Pedagógico Semestral", copias: 5, tipoPapel: "A4", folhaDura: true, deptName: "Anos Iniciais (1º ao 5º)", status: false },
            { titulo: "Cartazes Feira de Ciências", copias: 10, tipoPapel: "A3", colorida: true, plastificado: true, deptName: "Ensino Médio", status: false }
        ];

        for (const order of newOrders) {
            // Achar dept
            // Note: O nome exato pode variar dependendo do seed anterior, vou tentar match parcial ou usar a logica de usuarios
            const dept = depts.find(d => d.nomeDepartamento.includes(order.deptName) || d.nomeDepartamento === order.deptName);

            if (dept) {
                // Achar um prof desse dept
                const profs = await Prof.find({ departamento: dept._id });
                if (profs.length > 0) {
                    const randomProf = profs[Math.floor(Math.random() * profs.length)];

                    const novaImpressao = new Impressao({
                        titulo: order.titulo,
                        profId: randomProf._id,
                        copias: order.copias,
                        tipoPapel: order.tipoPapel,
                        colorida: order.colorida || false,
                        folhaDura: order.folhaDura || false,
                        plastificado: order.plastificado || false,
                        tipo: 'interno',
                        status: false, // Pendente
                        recusado: false,
                        expedicao: new Date()
                    });

                    await novaImpressao.save();
                    console.log(`Pedido '${order.titulo}' criado para ${randomProf.nome} (${dept.nomeDepartamento}).`);
                } else {
                    console.log(`Nenhum professor encontrado para o departamento ${dept.nomeDepartamento}`);
                }
            } else {
                console.log(`Departamento não encontrado para: ${order.deptName}`);
            }
        }

        console.log("Novos pedidos internos criados com sucesso!");

    } catch (error) {
        console.error("Erro ao criar pedidos:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão fechada.");
    }
}

seedMoreOrders();
