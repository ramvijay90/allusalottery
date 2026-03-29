export default function SettingsPage() {
    return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>

            <form className="space-y-6 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Site Title</label>
                    <input type="text" defaultValue="LottoGlobal" className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Results refresh rate (seconds)</label>
                    <input type="number" defaultValue="60" className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>

                <div className="pt-4">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save Changes</button>
                </div>
            </form>
        </div>
    );
}
