// Simple Auth Guard
(function () {
    const user = localStorage.getItem('xerox_user');
    const role = localStorage.getItem('xerox_role');
    const path = window.location.pathname;

    // Se não tiver usuário e não estiver na tela de login, redireciona
    if (!user && path !== '/login.html') {
        window.location.href = '/login.html';
        return;
    }

    // Restrição Diretoria: Só pode acessar paginas da diretoria
    if (user && role === 'diretoria') {
        if (!path.includes('diretoria.html') && !path.includes('diretoria_detalhes.html')) {
            window.location.href = 'diretoria.html';
        }
    }
})();

// Logout helper
function logout() {
    localStorage.removeItem('xerox_user');
    window.location.href = '/login.html';
}
