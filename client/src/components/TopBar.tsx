// React unused
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
    title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('xerox_user');
        localStorage.removeItem('xerox_role');
        navigate('/login');
    };

    return (
        <header className="top-bar">
            <h1>{title}</h1>
            <button onClick={handleLogout} className="btn-logout">
                <LogOut size={18} />
                Sair
            </button>
        </header>
    );
};

export default TopBar;
