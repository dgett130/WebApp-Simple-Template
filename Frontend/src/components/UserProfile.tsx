// src/UserProfile.jsx

import { useAuth } from '../contexts/auth-context';

function UserProfile ()  {
    const { user, logout } = useAuth();

    if (!user) {
        return <p className="muted" style={{ textAlign: 'center'}}>Caricamento...</p>
    }

    return (
        <div className="card">
            <h2>Profilo</h2>
            <div className="profile-row">
                <span className="muted">Username</span>
                <span>{user.username}</span>
            </div>
            <div className="profile-row">
                <span className="muted">Email</span>
                <span>{user.email}</span>
            </div>
            <div className="profile-actions">
                <button className="secondary" type={"button"} onClick={logout}>Esci</button>
            </div>
        </div>
    );
};

export default UserProfile;