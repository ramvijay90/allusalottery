'use client';

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';

interface State {
    _id: string;
    name: string;
    slug: string;
}

export default function DataManagementPage() {
    const [states, setStates] = useState<State[]>([]);

    useEffect(() => {
        fetch('/api/states')
            .then(res => res.json())
            .then(data => setStates(data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Data Management</h1>
            <p className="text-slate-500">Edit results directly if the scraper missed something.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {states.map(state => (
                    <div key={state._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{state.name}</h3>
                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                                <Edit size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">Manage games and results for {state.name}.</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
