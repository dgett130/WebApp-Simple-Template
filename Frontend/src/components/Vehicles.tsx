import {useCallback, useEffect, useState} from "react";
import AddVehicleForm from "./AddVehicleForm.tsx";
import api, {getErrorMessage} from "../api";

interface Vehicle {
    name: string;
}

export default function VehicleList() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadVehicles = useCallback(() =>
        api.get<{vehicles: Vehicle[]}>('/vehicles')
            .then(response => {setVehicles(response.data.vehicles ?? [])})
        .catch(error => {
            setVehicles(current => current ?? []);
            setError(getErrorMessage(error, 'Impossibile caricare i veicoli'));
        }), []);

    const addVehicle = async (vehicleName: string) => {
        setError(null);
        try {
            await api.post('/vehicles', {name: vehicleName});
            await loadVehicles();
        } catch (error) {
            setError(getErrorMessage(error, 'Impossibile aggiungere il veicolo'));
        }
    }

    useEffect(() => {
        void loadVehicles();
    },[loadVehicles]);

    return (
        <div className="card wide">
            <h2>Veicoli</h2>
            {vehicles === null ? (
                <p className="muted">Caricamento...</p>
            ) : vehicles.length === 0 ? (
                <p className="muted">Nessun veicolo ancora. Aggiungine uno qui sotto.</p>
            ) : (
                <ul className="list">
                    {vehicles.map((vehicle, index) => (
                        <li key={index}>{vehicle.name}</li>
                    ))}
                </ul>
            )}
            {error && (
                <p className="error" role={"alert"} style={{marginBottom: '1rem'}}>{error}</p>
            )}
            <AddVehicleForm addVehicle={addVehicle} />
        </div>
    )
}