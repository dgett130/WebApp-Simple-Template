import { useState, type FormEvent } from "react";

export default function AddVehicleForm({ addVehicle }: { addVehicle: (name: string) => void }) {

    const [vehicleName, setVehicleName] = useState('');
    const [pending, setPending] = useState<boolean>(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = vehicleName.trim();
        if (!name) {
            return
        }
        setPending(true);
        try {
            await addVehicle(name);
            setVehicleName('')
        } finally {
            setPending(false);
        }
    }

    return (
        <form className={"inline-form"} onSubmit={handleSubmit}>
            <input
            type="text"
            aria-label={'Nome del veicolo'}
            value={vehicleName}
            onChange={event => setVehicleName(event.target.value)}
            placeholder='Inserisci il nome del veicolo' />
            <button type="submit" disabled={pending || !vehicleName.trim()}>Aggiungi veicolo</button>
        </form>
    )

}