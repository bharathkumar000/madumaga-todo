// src/components/Layout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Home, List, CheckSquare, Calendar as CalendarIcon, Settings, Plus, LogIn, Trophy, Award, Database, RotateCw } from 'lucide-react';

const Layout = ({ children, currentView, onNavigate, onComposeClick, onAddProject, onLogout, onProfileClick, currentUser, users = [], onMemberClick, onRefresh }) => {
    const [sidebarWidth, setSidebarWidth] = useState(220);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);

    const sortedMembers = [...users].sort((a, b) => (a.id === currentUser?.id ? -1 : b.id === currentUser?.id ? 1 : 0));

    const startResizing = (e) => {
        setIsResizing(true);
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (mouseMoveEvent) => {
        if (isResizing) {
            const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
            if (newWidth > 160 && newWidth < 480) { // Min 160px, Max 480px
                setSidebarWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans antialiased">
            {/* Left Sidebar */}
            <aside
                ref={sidebarRef}
                className="bg-[#111217] border-r border-[#2C2E33] flex flex-col relative flex-shrink-0"
                style={{ width: sidebarWidth, transition: isResizing ? 'none' : 'width 0.2s ease' }}
            >
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="mb-3 flex items-center gap-2 px-2">
                        <div className="w-5 h-5 rounded bg-white text-black flex items-center justify-center font-bold text-[10px]">✓</div>
                        <h1 className="text-xl font-bold text-white tracking-tight">MADUMAGA🔥</h1>
                    </div>

                    {currentUser && (
                        <div
                            className="mb-4 p-2 rounded-md bg-[#1C1F26]/30 border border-white/5 flex items-center justify-between hover:bg-[#1C1F26]/50 transition-all cursor-pointer group"
                            onClick={onProfileClick}
                        >
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black shadow-lg transition-all group-hover:scale-105 flex-shrink-0
                                    ${currentUser.color === 'blue' ? 'bg-[#3B82F6] shadow-blue-500/20' :
                                        currentUser.color === 'green' ? 'bg-[#10B981] shadow-emerald-500/20' :
                                            currentUser.color === 'rose' ? 'bg-[#F43F5E] shadow-rose-500/20' :
                                                currentUser.color === 'pink' ? 'bg-[#EC4899] shadow-pink-500/20' :
                                                    currentUser.color === 'teal' ? 'bg-[#14B8A6] shadow-teal-500/20' :
                                                        currentUser.color === 'orange' ? 'bg-[#F97316] shadow-orange-500/20' :
                                                            currentUser.color === 'purple' ? 'bg-[#A855F7] shadow-purple-500/20' :
                                                                'bg-[#F59E0B] shadow-amber-500/20'}`}>
                                    {currentUser.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('https')) ? (
                                        <img src={currentUser.avatar} alt="" className="w-full h-full object-cover rounded" />
                                    ) : (
                                        <span>{currentUser.avatar || currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || '?'}</span>
                                    )}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[14px] font-black text-white truncate uppercase italic tracking-tight">{currentUser.name || currentUser.email?.split('@')[0]}</span>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Add Event Button - Prominent */}


                    <nav className="flex-1 space-y-1.5">
                        <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">Main</div>
                        <NavItem
                            icon={<Home size={20} />}
                            label="Dashboard"
                            active={currentView === 'dashboard'}
                            onClick={() => onNavigate('dashboard')}
                        />

                        <NavItem
                            icon={<CalendarIcon size={20} />}
                            label="Calendar"
                            active={currentView === 'calendar'}
                            onClick={() => onNavigate('calendar')}
                        />
                        <NavItem
                            icon={<List size={20} />}
                            label="Projects"
                            active={currentView === 'projects'}
                            onClick={() => onNavigate('projects')}
                        />
                        <NavItem
                            icon={<CheckSquare size={20} />}
                            label="Tasks"
                            active={currentView === 'tasks'}
                            onClick={() => onNavigate('tasks')}
                        />
                        <NavItem
                            icon={<Trophy size={20} />}
                            label="Events"
                            active={currentView === 'events'}
                            onClick={() => onNavigate('events')}
                        />
                        <NavItem
                            icon={<Award size={20} />}
                            label="Achievements"
                            active={currentView === 'achievements'}
                            onClick={() => onNavigate('achievements')}
                        />

                        {/* Team Section */}
                        <div className="mt-8 mb-2 px-2">
                            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <span>Organisation</span>
                                <div className="h-[1px] flex-1 bg-gray-800/50"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-300">TECH NEXUS</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
                                        className="p-1 rounded bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                        title="Refresh Data"
                                    >
                                        <RotateCw size={10} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {sortedMembers.map(member => {
                                        const isMe = member.id === currentUser?.id;
                                        return (
                                            <div key={member.id} onClick={() => onMemberClick?.(member.id)} className="flex items-center gap-2 group cursor-pointer p-1 rounded hover:bg-white/5 transition-all">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-black shadow-md transition-all group-hover:scale-105 relative
                                                    ${member.color === 'blue' ? 'bg-[#3B82F6] shadow-blue-500/20' :
                                                        member.color === 'green' ? 'bg-[#10B981] shadow-emerald-500/20' :
                                                            member.color === 'rose' ? 'bg-[#F43F5E] shadow-rose-500/20' :
                                                                member.color === 'pink' ? 'bg-[#EC4899] shadow-pink-500/20' :
                                                                    member.color === 'teal' ? 'bg-[#14B8A6] shadow-teal-500/20' :
                                                                        member.color === 'orange' ? 'bg-[#F97316] shadow-orange-500/20' :
                                                                            member.color === 'purple' ? 'bg-[#A855F7] shadow-purple-500/20' :
                                                                                'bg-[#F59E0B] shadow-amber-500/20'}`}>
                                                    {member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('https')) ? (
                                                        <img src={member.avatar} alt="" className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <span>{member.avatar || member.name?.charAt(0) || '?'}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col overflow-hidden flex-1">
                                                    <span className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-tight truncate">{member.name}</span>
                                                </div>
                                                {isMe && <span className="text-[8px] px-2 py-1 rounded-md bg-white/5 text-gray-500 font-bold uppercase tracking-wider">Me</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mt-8 mb-2 ml-2">System</div>
                        <NavItem
                            icon={<LogIn size={20} className="rotate-180" />}
                            label="Logout"
                            onClick={onLogout}
                        />
                    </nav>
                </div>

                {/* Resize Handle */}
                <div
                    onMouseDown={startResizing}
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-50 group"
                >
                    <div className="absolute top-0 right-[-2px] w-4 h-full opacity-0 group-hover:opacity-100" /> {/* Larger hit area */}
                </div>
            </aside >

            {/* Main Content Area */}
            < main className="flex-1 flex overflow-hidden relative" >
                {children}
            </main >
        </div >
    );
};

const NavItem = ({ icon, label, active, onClick, action }) => (
    <div
        onClick={onClick}
        className={`
    flex items-center gap-3.5 px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200 text-[15px] group
    ${active
                ? 'bg-[#2C2E33] text-white border-l-[3px] border-[#0066FF]'
                : 'text-gray-400 hover:bg-[#1E2025] hover:text-white'
            }
  `}>
        {icon}
        <span className="font-medium flex-1">{label}</span>
        {action && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {action}
            </div>
        )}
    </div>
);

export default Layout;
