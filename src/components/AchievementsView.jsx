import React from 'react';
import { Trophy, Star, Target, Zap, Award, CheckCircle2 } from 'lucide-react';

const AchievementsView = ({ projects = [], events = [] }) => {
    const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;
    const hackathonWinsCount = events.filter(e => e.type === 'HACKATHON' && e.won).length;
    const totalEventsCount = events.length;

    const achievements = [
        {
            id: 1,
            title: "Project Master",
            description: `Fully completed ${completedProjectsCount} major projects. Keep shipping!`,
            icon: <Award className="text-blue-400" />,
            progress: Math.min((completedProjectsCount / 3) * 100, 100),
            earned: completedProjectsCount >= 3,
            date: completedProjectsCount >= 3 ? "Achieved" : null
        },
        {
            id: 2,
            title: "Hackathon Champion",
            description: `Won ${hackathonWinsCount} hackathons. The team is on fire!`,
            icon: <Trophy className="text-amber-400" />,
            progress: Math.min((hackathonWinsCount / 1) * 100, 100),
            earned: hackathonWinsCount >= 1,
            date: hackathonWinsCount >= 1 ? "Achieved" : null
        },
        {
            id: 3,
            title: "Consistency King",
            description: `Participated in ${totalEventsCount} community events.`,
            icon: <Target className="text-emerald-400" />,
            progress: Math.min((totalEventsCount / 5) * 100, 100),
            earned: totalEventsCount >= 5,
            date: totalEventsCount >= 5 ? "Achieved" : null
        },
        {
            id: 4,
            title: "Collab Legend",
            description: "Contributed to multiple team projects.",
            icon: <Star className="text-purple-400" />,
            progress: Math.min((projects.length / 5) * 100, 100),
            earned: projects.length >= 5,
        }
    ];

    return (
        <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Team Achievements</h1>
                <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest leading-loose">
                    Celebrating real wins: Project completions and Hackathon victories.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
