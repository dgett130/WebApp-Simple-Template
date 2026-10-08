import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';

import Header from "./components/shared/Header.tsx";
import Register from "./components/Register.tsx";
import Login from "./components/Login.tsx";
import UserProfile from "./components/UserProfile.tsx";
import {type ReactElement} from "react";
import {useAuth} from "./contexts/auth-context.ts";
import VehicleList from "./components/Vehicles.tsx";

function RequireAuth({children}: {children: ReactElement}) {
    const {token} = useAuth();
    return token ? children : <Navigate to={"/login"} replace/>;
}

function App () {
    return (
        <Router>
            <AuthProvider>
                <Header></Header>
                <main className="container">
                    <Routes>
                        <Route path="/" element={ <Navigate to={"/profile"} replace /> } />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<RequireAuth><UserProfile/></RequireAuth>} />
                        <Route path="/vehicles" element={<RequireAuth><VehicleList/></RequireAuth>} />
                        <Route path="*" element={<Navigate to={"/"} replace />} />
                    </Routes>
                </main>
            </AuthProvider>
        </Router>

    );
};

export default App;