document.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('xerox_user');
    const select = document.getElementById('professor');

    if (!user) {
        alert("Sessão inválida. Por favor faça login novamente.");
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`/api/professores?user=${encodeURIComponent(user)}`);
        const profs = await response.json();

        select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
        if (profs.length > 0) {
            profs.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nome; // We use name as ID for now because backend looks up by name
                opt.innerText = p.nome;
                select.appendChild(opt);
            });
        } else {
            const opt = document.createElement('option');
            opt.innerText = "Nenhum professor encontrado";
            select.appendChild(opt);
        }
    } catch (e) {
        console.error("Erro ao carregar professores:", e);
    }
});

document.querySelector('.new-order-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.innerText;

    // Validar números negativos
    if (form.copias.value < 1) {
        alert("O número de cópias deve ser positivo.");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    // Coletar dados de Prazo
    const dia = document.getElementById('prazoDia').value;
    const mes = document.getElementById('prazoMes').value;
    const ano = document.getElementById('prazoAno').value;
    let prazo = null;
    if (dia && mes && ano) {
        prazo = `${ano}-${mes}-${dia}`; // Format used commonly, or pass parts
    }

    // Coletar dados do formulário
    const data = {
        titulo: form.titulo.value,
        copias: form.copias.value,
        tipoPapel: form.tipoPapel.value,
        professor: form.professor ? form.professor.value : null,
        prazo: prazo,
        colorida: form.colorida.checked,
        folhaDura: form.folhaDura.checked,
        plastificado: form.plastificado.checked,
        user: localStorage.getItem('xerox_user')
    };

    try {
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        const response = await fetch('/api/impressoes/nova', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let errorMsg = 'Erro ao comunicar com servidor';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (jsonError) {
                // Se não for JSON (ex: 404 HTML), tenta ler como texto
                const text = await response.text();
                // Se for HTML de erro, geralmente começa com tags, então mostramos o status
                errorMsg = `Erro ${response.status} (${response.statusText})`;
                console.error("Resposta não-JSON recebida:", text);
            }
            throw new Error(errorMsg);
        }

        // Sucesso!
        alert('Pedido criado com sucesso!');
        window.location.href = 'index.html'; // Redireciona para o dashboard

    } catch (error) {
        console.error(error);
        alert('Erro ao criar pedido: ' + error.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
