document.getElementById('admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    // Basic validation
    if (form.copias.value < 1) {
        alert("Cópias devem ser positivas");
        return;
    }

    const data = {
        cliente: form.cliente.value,
        tipo: 'externo',
        copias: parseInt(form.copias.value),
        tipoPapel: form.tipoPapel.value,
        valor: form.valor.value ? parseFloat(form.valor.value) : 0,
        troco: form.troco.value ? parseFloat(form.troco.value) : 0,
        colorida: form.colorida.checked,
        folhaDura: form.folhaDura.checked,
        plastificado: form.plastificado.checked,
        // Admin default: no user context sent implies Balcão/Pedido Externo in backend,
        // OR we can explicitly say it logic-wise.
        // But backend handles "no user" -> Balcão. Using localStorage user might link to admin which has no dept.
        // Ideally admin creates "Balcão" orders logic.
        // Let's NOT send 'user' so backend defaults to Balcao.
    };

    try {
        const response = await fetch('/api/impressoes/nova', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Pedido de Balcão criado com sucesso!');
            window.location.href = 'index.html';
        } else {
            const err = await response.json();
            alert('Erro: ' + err.error);
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão');
    }
});
