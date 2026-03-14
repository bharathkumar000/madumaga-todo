import React from 'react';
import { Trophy, Star, Target, Zap, Award, CheckCircle2 } from 'lucide-react';

const AchievementsView = ({ projects = [], events = [] }) => {
    const wonEventsCount = events.filter(e => e.won).length;

    const achievements = [
        {
            id: 1,
            title: "First Victory",
            description: `Secured your first event victory. The beginning of a legacy!`,
            icon: <Award className="text-blue-400" />,
            progress: Math.min((wonEventsCount / 1) * 100, 100),
            earned: wonEventsCount >= 1,
            date: wonEventsCount >= 1 ? "Achieved" : null
        },
        {
            id: 2,
            title: "Hackathon Champion",
            description: `Won 3 events. The team is on fire!`,
            icon: <Trophy className="text-amber-400" />,
            progress: Math.min((wonEventsCount / 3) * 100, 100),
            earned: wonEventsCount >= 3,
            date: wonEventsCount >= 3 ? "Achieved" : null
        },
        {
            id: 3,
            title: "Consistency King",
            description: `Secured 5 victories. Dominating the field regularly.`,
            icon: <Target className="text-emerald-400" />,
            progress: Math.min((wonEventsCount / 5) * 100, 100),
            earned: wonEventsCount >= 5,
            date: wonEventsCount >= 5 ? "Achieved" : null
        },
        {
            id: 4,
            title: "Collab Legend",
            description: `Achieved 10 event wins. Absolute legends of the grid.`,
            icon: <Star className="text-purple-400" />,
            progress: Math.min((wonEventsCount / 10) * 100, 100),
            earned: wonEventsCount >= 10,
            date: wonEventsCount >= 10 ? "Achieved" : null
        }
    ];

    return (
        <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Team Achievements</h1>
                <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest leading-loose">
                    Celebrating real wins: Hackathon and Event Victories.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {achievements.map((ach) => (
                    <div
                        key={ach.id}
                        className={`relative rounded-3xl p-6 border transition-all duration-500 group overflow-hidden
                            ${ach.earned
                                ? 'bg-[#16191D] border-white/10 hover:border-white/20'
                                : 'bg-[#16191D]/50 border-white/5 opacity-70 grayscale'}`}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-white/50">
                            {ach.earned ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> EARNED
                                </span>
                            ) : (
                                <span className="text-gray-600">IN PROGRESS</span>
                            )}
                        </div>

                        <div className="flex flex-col h-full">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {ach.icon}
                            </div>

                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 italic">
                                {ach.title}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic mb-6">
                                {ach.description}
                            </p>

                            <div className="mt-auto">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Progress</span>
                                    <span className="text-xs font-black text-gray-400">{Math.round(ach.progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r rounded-full transition-all duration-1000
                                            ${ach.earned ? 'from-emerald-500 to-teal-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'from-gray-700 to-gray-600'}`}
                                        style={{ width: `${ach.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {ach.date && (
                                <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                    Status: {ach.date}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsView;
