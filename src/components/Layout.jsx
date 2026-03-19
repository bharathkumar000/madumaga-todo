// src/components/Layout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Home, List, CheckSquare, Calendar as CalendarIcon, Settings, Plus, LogIn, Trophy, Award, Database, RotateCw, Menu, X as CloseIcon } from 'lucide-react';

const Layout = ({ children, currentView, onNavigate, onComposeClick, onAddProject, onLogout, onProfileClick, currentUser, users = [], onMemberClick, onRefresh }) => {
    const [sidebarWidth, setSidebarWidth] = useState(220);
    const [isResizing, setIsResizing] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sortedMembers = [...users].sort((a, b) => {
        const isSathwik = (u) => u.name?.toUpperCase() === 'SATHWIK' || u.email?.toUpperCase() === 'SATHWIK@MADUMAGA.COM' || u.email?.toUpperCase() === '123@MADUMAGA.COM';
        if (isSathwik(a)) return -1;
        if (isSathwik(b)) return 1;
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return 0;
    });

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
            {/* Mobile Header */}
            {isMobile && (
                <div className="lg:hidden h-16 bg-[#111217] border-b border-[#2C2E33] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-[60]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs">✓</div>
                        <h1 className="text-lg font-bold text-white tracking-tight">MADUMAGA🔥</h1>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            )}

            {/* Sidebar Overlay for Mobile */}
            {isMobile && isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside
                ref={sidebarRef}
                className={`bg-[#111217] border-r border-[#2C2E33] flex flex-col relative flex-shrink-0 transition-all duration-300 z-[80]
                    ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl overflow-hidden' : 'relative'}
                    ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}`}
                style={{ 
                    width: isMobile ? '280px' : sidebarWidth, 
                    transition: isResizing ? 'none' : 'transform 0.3s ease, width 0.2s ease' 
                }}
            >
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header - Hidden on Mobile sidebar because of mobile header */}
                    {!isMobile && (
                        <div className="mb-3 flex items-center gap-2 px-2">
                            <div className="w-5 h-5 rounded bg-white text-black flex items-center justify-center font-bold text-[10px]">✓</div>
                            <h1 className="text-xl font-bold text-white tracking-tight">MADUMAGA🔥</h1>
                        </div>
                    )}
                    
                    {/* Progress spacer for mobile because of fixed header */}
                    {isMobile && <div className="h-4" />}

                    {currentUser && (
                        <div
                            className="mb-4 p-2.5 rounded-xl bg-[#1C1F26]/30 border border-white/5 flex items-center justify-between hover:bg-[#1C1F26]/50 transition-all cursor-pointer group"
                            onClick={() => { onProfileClick(); isMobile && setIsMobileMenuOpen(false); }}
                        >
                            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black shadow-lg transition-all group-hover:scale-105 flex-shrink-0
                                    ${currentUser.color === 'blue' ? 'bg-[#3B82F6] shadow-blue-500/20' :
                                        currentUser.color === 'green' ? 'bg-[#10B981] shadow-emerald-500/20' :
                                            currentUser.color === 'rose' ? 'bg-[#F43F5E] shadow-rose-500/20' :
                                                currentUser.color === 'pink' ? 'bg-[#EC4899] shadow-pink-500/20' :
                                                    currentUser.color === 'teal' ? 'bg-[#14B8A6] shadow-teal-500/20' :
                                                        currentUser.color === 'orange' ? 'bg-[#F97316] shadow-orange-500/20' :
                                                            currentUser.color === 'purple' ? 'bg-[#A855F7] shadow-purple-500/20' :
                                                                'bg-[#F59E0B] shadow-amber-500/20'}`}>
                                    {currentUser.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('https')) ? (
                                        <img src={currentUser.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span>{currentUser.avatar || currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || '?'}</span>
                                    )}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[14px] font-black text-white truncate uppercase italic tracking-tight">{currentUser.name || currentUser.email?.split('@')[0]}</span>
                                        {currentUser.isGuest && (
                                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black tracking-[0.1em]">GUEST</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Add Event Button - Prominent */}


                    <nav className="flex-1 space-y-1.5">
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-2">Main Terminal</div>
                        <NavItem
                            icon={<Home size={20} />}
                            label="Dashboard"
                            active={currentView === 'dashboard'}
                            onClick={() => { onNavigate('dashboard'); isMobile && setIsMobileMenuOpen(false); }}
                        />

                        <NavItem
                            icon={<CalendarIcon size={20} />}
                            label="Calendar"
                            active={currentView === 'calendar'}
                            onClick={() => { onNavigate('calendar'); isMobile && setIsMobileMenuOpen(false); }}
                        />
                        <NavItem
                            icon={<CheckSquare size={20} />}
                            label="Tasks"
                            active={currentView === 'tasks'}
                            onClick={() => { onNavigate('tasks'); isMobile && setIsMobileMenuOpen(false); }}
                        />
                        <NavItem
                            icon={<List size={20} />}
                            label="Projects"
                            active={currentView === 'projects'}
                            onClick={() => { onNavigate('projects'); isMobile && setIsMobileMenuOpen(false); }}
                        />
                        <NavItem
                            icon={<Trophy size={20} />}
                            label="Events"
                            active={currentView === 'events'}
                            onClick={() => { onNavigate('events'); isMobile && setIsMobileMenuOpen(false); }}
                        />
                        <NavItem
                            icon={<Award size={20} />}
                            label="Achievements"
                            active={currentView === 'achievements'}
                            onClick={() => { onNavigate('achievements'); isMobile && setIsMobileMenuOpen(false); }}
                        />

                        {/* Team Section */}
                        <div className="mt-8 mb-2 px-2">
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span>Organisation</span>
                                <div className="h-[1px] flex-1 bg-gray-800/30"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-gray-500 tracking-widest">TECH NEXUS</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
                                        className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                        title="Refresh Data"
                                    >
                                        <RotateCw size={10} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {sortedMembers.map(member => {
                                        const isMe = member.id === currentUser?.id;
                                        return (
                                            <div key={member.id} onClick={() => { onMemberClick?.(member.id); isMobile && setIsMobileMenuOpen(false); }} className="flex items-center gap-2.5 group cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-all">
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
                                                        <img src={member.avatar} alt="" className="w-full h-full object-cover rounded-sm" />
                                                    ) : (
                                                        <span>{member.avatar || member.name?.charAt(0) || '?'}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col overflow-hidden flex-1">
                                                    <span className={`text-[12px] font-bold group-hover:text-white transition-colors uppercase tracking-tight truncate 
                                                        ${(member.name?.toUpperCase() === 'SATHWIK' || member.email?.toUpperCase() === 'SATHWIK@MADUMAGA.COM' || member.email?.toUpperCase() === '123@MADUMAGA.COM') ? 'text-amber-400' : 'text-gray-400'}`}>
                                                        {member.name}
                                                    </span>
                                                </div>
                                                {(member.name?.toUpperCase() === 'SATHWIK' || member.email?.toUpperCase() === 'SATHWIK@MADUMAGA.COM' || member.email?.toUpperCase() === '123@MADUMAGA.COM') && (
                                                    <span className="text-[7px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black uppercase tracking-[0.1em] border border-amber-500/20">Mentor</span>
                                                )}
                                                {isMe && !(member.name?.toUpperCase() === 'SATHWIK' || member.email?.toUpperCase() === 'SATHWIK@MADUMAGA.COM' || member.email?.toUpperCase() === '123@MADUMAGA.COM') && (
                                                    <span className="text-[8px] px-2 py-1 rounded-md bg-white/5 text-gray-500 font-bold uppercase tracking-wider">Me</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mt-8 mb-4 ml-2">Secure Termination</div>
                        <NavItem
                            icon={<LogIn size={20} className="rotate-180 text-rose-500/70" />}
                            label="Logout"
                            onClick={() => { onLogout(); isMobile && setIsMobileMenuOpen(false); }}
                        />
                    </nav>
                </div>

                {/* Resize Handle - Hidden on Mobile */}
                {!isMobile && (
                    <div
                        onMouseDown={startResizing}
                        className="absolute top-0 right-[-2px] w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-[100] group"
                    >
                        <div className="absolute top-0 right-[-4px] w-4 h-full" /> {/* Larger hit area */}
                    </div>
                )}
            </aside >

            {/* Main Content Area */}
            <main className={`flex-1 flex overflow-hidden relative transition-all duration-300 ${isMobile ? 'pt-16' : ''}`}>
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
