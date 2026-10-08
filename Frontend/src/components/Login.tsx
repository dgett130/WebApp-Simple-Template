// src/Login.jsx
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Link } from 'react-router-dom';
import {getErrorMessage} from "../api.ts";

function Login ()  {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { login } = useAuth();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit =  async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(formData.username, formData.password);
        } catch (err) {
            setError(getErrorMessage(err, 'Credenziali non valide.'));
            setLoading(false);
        }

    };

    return (
        <div className="card">
            <h2>Accedi</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" onChange={handleChange} value={formData.username}
                            name="username" autoComplete="username" required/>
                </div>
                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" onChange={handleChange} value={formData.password}
                            required autoComplete="current-password"/>
                </div>
                {error && <p className="error" role={"alert"}>{error}</p>}
                <button type="submit" disabled={loading}>{loading ? 'Accesso...' : 'Accedi'}</button>
            </form>
            <p className="form-footer">Non hai un account? <Link to="/register">Registrati</Link></p>
        </div>
    );
};

export default Login;