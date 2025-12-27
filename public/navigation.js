document.addEventListener('DOMContentLoaded', () => {
    // Dynamic navigation based on role
    const role = localStorage.getItem('xerox_role') || 'dept';
    const newOrderLink = document.querySelector('a[href*="novo_pedido"]'); // Matches novo_pedido.html or similar

    // Also try to find by ID if we added it, but let's be robust
    // In index.html/historico.html it might be plain "novo_pedido.html"
    // In new files I added id="nav-new-order"

    const links = document.querySelectorAll('a');
    links.forEach(link => {
        // If link points to new order page
        if (link.getAttribute('href') === 'novo_pedido.html' || link.id === 'nav-new-order') {
            if (role === 'admin') {
                link.setAttribute('href', 'novo_pedido_admin.html');
            } else {
                link.setAttribute('href', 'novo_pedido.html');
            }
        }
    });

    // Also update "active" class if we are on the page
    const currentPath = window.location.pathname;
    if (currentPath.includes('novo_pedido_admin.html') && role !== 'admin') {
        // Non-admins shouldn't be here
        window.location.href = 'novo_pedido.html';
    }
    if (currentPath.includes('novo_pedido.html') && role === 'admin') {
        // Admins shouldn't be here (according to user request "different page")
        window.location.href = 'novo_pedido_admin.html';
    }
});
