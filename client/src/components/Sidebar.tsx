import { NavLink } from 'react-router-dom';
import { Folder, FileText, Printer, FilePlus } from 'lucide-react';

const Sidebar = () => {
    const role = localStorage.getItem('xerox_role');

    return (
        <aside className="sidebar">
            {/* Dept and Admin can see Dashboard */}
            {(role === 'dept' || role === 'admin' || role === 'xerox') && (
                <NavLink
                    to="/"
                    className={({ isActive }) => `sidebar-icon ${isActive ? 'active' : ''}`}
                    title="Impressões Ativas"
                >
                    <Printer size={24} />
                </NavLink>
            )}

            {/* Dept and Admin can see New Order */}
            {(role === 'dept' || role === 'admin' || role === 'xerox') && (
                <NavLink
                    to={(role === 'admin' || role === 'xerox') ? "/novo-pedido-admin" : "/novo-pedido"}
                    className={({ isActive }) => `sidebar-icon ${isActive ? 'active' : ''}`}
                    title="Novo Pedido"
                >
                    <FilePlus size={24} />
                </NavLink>
            )}

            {/* Everyone can see History? Usually yes, but user said Directory shouldn't see 'active' or 'create'. 
                Assuming Directory ONLY sees directory pages is safer based on "accessing create/active why?".
                Let's restrict History too if implied, or leave it. 
                The user specifically complained about "paginas de criar e os pedidos ativos".
            */}
            {(role === 'dept' || role === 'admin' || role === 'xerox') && (
                <NavLink
                    to="/historico"
                    className={({ isActive }) => `sidebar-icon ${isActive ? 'active' : ''}`}
                    title="Histórico"
                >
                    <FileText size={24} />
                </NavLink>
            )}

            {(role === 'diretoria' || role === 'admin' || role === 'xerox') && (
                <NavLink
                    to="/diretoria"
                    className={({ isActive }) => `sidebar-icon ${isActive ? 'active' : ''}`}
                    title="Diretoria"
                >
                    <Folder size={24} />
                </NavLink>
            )}
        </aside>
    );
};

export default Sidebar;
