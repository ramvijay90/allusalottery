import connectToDatabase from '@/lib/db';
import State from '@/models/State';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { Users, Globe, Trophy, Activity } from 'lucide-react';

async function getStats() {
    try {
        await connectToDatabase();
        const stateCount = await State.countDocuments();
        const gameCount = await Game.countDocuments();
        const resultCount = await Result.countDocuments();

        return {
            states: stateCount,
            games: gameCount,
            results: resultCount
        };
    } catch (e) {
        return { states: 0, games: 0, results: 0 };
    }
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total States</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.states}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Globe size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Games</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.games}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Results</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.results.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Trophy size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">System Status</p>
                            <h3 className="text-xl font-bold text-green-600 mt-1">Operational</h3>
                        </div>
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <p className="text-sm text-slate-600">Scheduler ran successfully at 2:00 AM</p>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="text-sm text-slate-600">Updated Arizona Pick 3 Results</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
