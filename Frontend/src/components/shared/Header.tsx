import {useAuth} from "../../contexts/auth-context.ts";
import {NavLink} from "react-router-dom";


function Header() {
    const {token, user, logout} = useAuth();
    return (
        <header className="app-header">
            <div className="app-header-inner">
                <span className="brand">WebApp</span>
                <nav className="nav">
                    {token ? (
                        <>
                        <NavLink to="/profile">
                            Profilo
                        </NavLink>
                        <NavLink to="/vehicles">
                            Veicoli
                        </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Accedi</NavLink>
                            <NavLink to="/register">Registrati</NavLink>
                        </>
                    )}
                </nav>
                {token && (
                    <>
                        {user && <span className="nav-user">{user.username}</span>}
                        <button type="button" className="secondary" onClick={logout}>Esci</button>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;