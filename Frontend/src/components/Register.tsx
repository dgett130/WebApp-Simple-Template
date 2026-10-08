// src/Register.jsx
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Link } from "react-router-dom";
import {getErrorMessage} from "../api.ts";

function Register () {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register(formData.username, formData.email, formData.password);
        } catch (error) {
            setError(getErrorMessage(error, 'Registrazione non riuscita.'));
            setLoading(false);
        }

    };

    return (
        <div className="card">
            <h2>Crea un account</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange}
                            required autoComplete={"username"}/>
                </div>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                    required autoComplete={"email"}/>
                </div>
                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                    required autoComplete={"new-password"}/>
                </div>
                 {error && <p className="error" role={"alert"}>{error}</p>}
                <button type={"submit"} disabled={loading}>{loading ? 'Registrazione...' : 'Registrati'}</button>
            </form>
            <p className="form-footer">
                Hai gia` un account? <Link to="/login">Accedi</Link>
            </p>
        </div>
    );
};

export default Register;