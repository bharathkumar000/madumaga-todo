// src/components/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, MapPin, AlignLeft, ChevronLeft, ChevronRight, Tag, Folder, Link as LinkIcon, Plus, Trash2, ChevronDown, Check, Trophy, Bell, Users, IndianRupee, Clock } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, onSave, projects = [], eventToEdit = null, allEvents = [] }) => {
    const [title, setTitle] = useState('');
    const [fromDate, setFromDate] = useState(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0'));
    const [toDate, setToDate] = useState(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0'));
    const [location, setLocation] = useState('');
    const [type, setType] = useState('HACKATHON');
    const [description, setDescription] = useState('');
    const [buildingDescription, setBuildingDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [won, setWon] = useState(false);
    const [links, setLinks] = useState([{ label: '', url: '' }]);
    const [parentId, setParentId] = useState(null);
    const [lastDate, setLastDate] = useState(null);
    const [team, setTeam] = useState('');
    const [price, setPrice] = useState('');
    const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
    const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);
    const [isLastCalendarOpen, setIsLastCalendarOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [fromTime, setFromTime] = useState('09:00 AM');
    const [toTime, setToTime] = useState('06:00 PM');
    const [isFromTimeOpen, setIsFromTimeOpen] = useState(false);
    const [isToTimeOpen, setIsToTimeOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const formatDateLocal = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const resetForm = () => {
        setTitle('');
        setFromDate(formatDateLocal(new Date()));
        setToDate(formatDateLocal(new Date()));
        setLocation('');
        setType('HACKATHON');
        setDescription('');
        setBuildingDescription('');
        setProjectId('');
        setWon(false);
        setLinks([{ label: '', url: '' }]);
        setParentId(null);
        setLastDate(null);
        setTeam('');
        setPrice('');
        setFromTime('09:00 AM');
        setToTime('06:00 PM');
    };

    const parentEvent = parentId ? allEvents.find(e => String(e.id) === String(parentId)) : null;
    const isProjectInherited = !!(parentEvent && parentEvent.projectId);

    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title || '');
            // Handle Parent and Inheritance
            const pId = eventToEdit.parentId || null;
            setParentId(pId);
            const parent = pId ? allEvents.find(e => String(e.id) === String(pId)) : null;

            // Date Inheritance logic
            if (eventToEdit.date) {
                const d = new Date(eventToEdit.date);
                if (!isNaN(d.getTime())) {
                    setFromDate(formatDateLocal(d));
                }
            } else if (parent && parent.date && !eventToEdit.id) {
                const d = new Date(parent.date);
                if (!isNaN(d.getTime())) setFromDate(formatDateLocal(d));
            }

            if (eventToEdit.toDate) {
                const d = new Date(eventToEdit.toDate);
                if (!isNaN(d.getTime())) {
                    setToDate(formatDateLocal(d));
                }
            } else if (parent && parent.toDate && !eventToEdit.id) {
                const d = new Date(parent.toDate);
                if (!isNaN(d.getTime())) setToDate(formatDateLocal(d));
            }
            setDescription(eventToEdit.description || '');
            setBuildingDescription(eventToEdit.buildingDescription || '');

            if (parent && parent.location && !eventToEdit.id) {
                setLocation(parent.location);
            } else {
                setLocation(eventToEdit.location || '');
            }
            
            if (parent && parent.projectId) {
                setProjectId(parent.projectId.toString());
            } else {
                setProjectId(eventToEdit.projectId?.toString() || '');
            }

            setTeam(eventToEdit.team || '');
            setPrice(eventToEdit.price || '');
            setFromTime(eventToEdit.fromTime || '09:00 AM');
            setToTime(eventToEdit.toTime || '06:00 PM');

            setLinks(eventToEdit.links?.length > 0 ? [...eventToEdit.links] : [{ label: '', url: '' }]);
            
            if (eventToEdit.lastDate) {
                const d = new Date(eventToEdit.lastDate);
                if (!isNaN(d.getTime())) {
                    setLastDate(formatDateLocal(d));
                }
            } else {
                setLastDate(null);
            }
        } else {
            resetForm();
        }
    }, [eventToEdit, isOpen, allEvents]);

    const generateDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, current: true, date: new Date(year, month, i) });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
        }
        return days;
    };

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;

        const [fy, fm, fd] = fromDate.split('-').map(Number);
        const fromDateObj = new Date(fy, fm - 1, fd);
        const [ty, tm, td] = toDate.split('-').map(Number);
        const toDateObj = new Date(ty, tm - 1, td);

        let finalLastDate = null;
        if (lastDate) {
            const [ly, lm, ld] = lastDate.split('-').map(Number);
            const lastDateObj = new Date(ly, lm - 1, ld);
            finalLastDate = lastDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        // Colors mapping based on type
        const colors = {
            'HACKATHON': 'from-pink-500 to-rose-500',
            'WORKSHOP': 'from-purple-500 to-pink-600',
            'COLLECTION': 'from-[#4F46E5] to-[#4F46E5]',
            'ROBOTICS': 'from-[#22C7B5] to-[#22C7B5]'
        };

        const t = (type || '').toUpperCase();

        onSave({
            ...(eventToEdit || {}),
            title,
            date: fromDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            toDate: toDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            location: location || 'Online',
            type,
            attendees: 4, // Default team size
            image: eventToEdit?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400",
            color: colors[t] || 'from-blue-500 to-pink-600',
            description,
            buildingDescription,
            projectId: projectId?.toString(),
            won: type === 'HACKATHON' ? won : false,
            links: links.filter(l => l.label && l.url),
            parentId: parentId,
            lastDate: finalLastDate,
            team,
            price,
            fromTime,
            toTime
        });

        resetForm();
        onClose();
    };


    const addLink = () => setLinks([...links, { label: '', url: '' }]);
    const removeLink = (index) => setLinks(links.filter((_, i) => i !== index));
    const updateLink = (index, field, value) => {
        const newLinks = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] backdrop-blur-[6px]">
            <div
                className="w-[520px] rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-300 font-sans border border-white/10 relative group-modal"
                style={{ backgroundColor: '#16191D' }}
            >
                {/* Variant Ambient Glows */}
                <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] blur-[100px] rounded-full animate-pulse transition-all duration-1000 opacity-30 bg-blue-600"></div>
                <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] blur-[60px] rounded-full opacity-20 transition-all duration-700 bg-pink-500"></div>

                {/* Content Area */}
                <div className="relative z-10 bg-gradient-to-br from-white/[0.02] to-transparent p-1">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                            Create New Event
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-90">
                            <X size={18} />
                        </button>
                    </div>


                    <div className="max-h-[min(650px,80vh)] overflow-y-auto custom-scrollbar px-8 pb-6 pt-5 space-y-5">
                        {/* Title & Type Input Container */}
                        <div className="flex items-end gap-x-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Event Name"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-2xl font-black text-white placeholder-gray-600 border-none focus:ring-0 focus:outline-none transition-all"
                                    autoFocus
                                />
                                <div className="h-[1px] w-full bg-gradient-to-r from-pink-500/50 to-transparent mt-1"></div>
                            </div>

                            {/* Type Selector (Moved to Top Right) */}
                            <div className="relative mb-1">
                                <button
                                    onClick={() => {
                                        setIsTypeDropdownOpen(!isTypeDropdownOpen);
                                        setIsProjectDropdownOpen(false);
                                        setIsFromCalendarOpen(false);
                                        setIsToCalendarOpen(false);
                                        setIsLastCalendarOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/type"
                                >
                                    <Tag size={12} className="text-pink-500" />
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">TYPE:</span>
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{type.toLowerCase()}</span>
                                    </div>
                                    <ChevronDown size={12} className={`text-gray-500 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTypeDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-40 bg-[#1A1D21] border border-white/10 rounded-xl shadow-2xl z-[130] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                        {['HACKATHON', 'COLLECTION', 'WORKSHOP', 'ROBOTICS'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => { setType(t); setIsTypeDropdownOpen(false); }}
                                                className={`w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-white/5 transition-colors flex items-center justify-between ${type === t ? 'text-pink-400 bg-pink-500/5' : 'text-gray-400'}`}
                                            >
                                                <span className="capitalize">{t.toLowerCase()}</span>
                                                {type === t && <Check size={10} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team & Price Selector (Side by Side) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 relative">
                                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                                    Team Members
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Rishith, Srinivas..."
                                    value={team}
                                    onChange={(e) => setTeam(e.target.value)}
                                    className="w-full bg-transparent text-xs font-bold text-white placeholder-gray-700 border-none focus:ring-0 focus:outline-none py-1.5"
                                />
                                <div className="h-[1px] w-full bg-white/5 mt-0.5"></div>
                            </div>

                            <div className="space-y-1 relative">
                                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                                    Event Price / Budget
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Free, ₹5,000..."
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-transparent text-xs font-bold text-white placeholder-gray-700 border-none focus:ring-0 focus:outline-none py-1.5"
                                />
                                <div className="h-[1px] w-full bg-white/5 mt-0.5"></div>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 font-bold relative z-20">
                            {/* Dates Header (Only if sub-event to separate from time) */}
                            {parentId && (
                                <div className="col-span-2 flex items-center gap-2 mb-[-8px]">
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Dates</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>
                            )}

                            {/* From Date Picker */}
                            <div className="space-y-1 relative">
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                    <CalendarIcon size={11} />
                                    <span>From Date</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsFromCalendarOpen(!isFromCalendarOpen);
                                        setIsToCalendarOpen(false);
                                        setIsTypeDropdownOpen(false);
                                        setIsProjectDropdownOpen(false);
                                    }}
                                    className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors block w-full text-left py-1"
                                >
                                    {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </button>

                                {isFromCalendarOpen && (
                                    <div className="absolute top-full left-0 mt-4 w-[280px] bg-[#1A1D21] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[120] p-4 scale-in-center animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <div className="text-[11px] font-black text-white uppercase tracking-widest">
                                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </div>
                                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                                <div key={d} className="text-[8px] font-black text-gray-600 text-center uppercase py-1">{d}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {generateDays().map((d, i) => {
                                                const isSelected = formatDateLocal(d.date) === fromDate;
                                                const isToday = formatDateLocal(d.date) === formatDateLocal(new Date());
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => { 
                                                            if (formatDateLocal(d.date) === fromDate) {
                                                                setFromDate(formatDateLocal(new Date()));
                                                            } else {
                                                                setFromDate(formatDateLocal(d.date));
                                                            }
                                                            setIsFromCalendarOpen(false); 
                                                        }}
                                                        className={`text-[10px] h-8 rounded-lg flex items-center justify-center font-bold transition-all ${!d.current ? 'text-gray-700 pointer-events-none opacity-20' : 'text-gray-400 hover:bg-white/5 hover:text-white'} ${isSelected ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:bg-pink-400' : ''} ${isToday && !isSelected ? 'border border-pink-500/30' : ''}`}
                                                    >
                                                        {d.day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* To Date Picker */}
                            <div className="space-y-1 relative">
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                    <CalendarIcon size={11} />
                                    <span>To Date</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsToCalendarOpen(!isToCalendarOpen);
                                        setIsFromCalendarOpen(false);
                                        setIsTypeDropdownOpen(false);
                                        setIsProjectDropdownOpen(false);
                                    }}
                                    className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors block w-full text-left py-1"
                                >
                                    {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </button>

                                {isToCalendarOpen && (
                                    <div className="absolute top-full right-0 mt-4 w-[280px] bg-[#1A1D21] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[120] p-4 scale-in-center animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <div className="text-[11px] font-black text-white uppercase tracking-widest">
                                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </div>
                                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                                <div key={d} className="text-[8px] font-black text-gray-600 text-center uppercase py-1">{d}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {generateDays().map((d, i) => {
                                                const isSelected = formatDateLocal(d.date) === toDate;
                                                const isToday = formatDateLocal(d.date) === formatDateLocal(new Date());
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => { 
                                                            if (formatDateLocal(d.date) === toDate) {
                                                                setToDate(formatDateLocal(new Date()));
                                                            } else {
                                                                setToDate(formatDateLocal(d.date));
                                                            }
                                                            setIsToCalendarOpen(false); 
                                                        }}
                                                        className={`text-[10px] h-8 rounded-lg flex items-center justify-center font-bold transition-all ${!d.current ? 'text-gray-700 pointer-events-none opacity-20' : 'text-gray-400 hover:bg-white/5 hover:text-white'} ${isSelected ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:bg-pink-400' : ''} ${isToday && !isSelected ? 'border border-pink-500/30' : ''}`}
                                                    >
                                                        {d.day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Project Selector - Hidden for sub-events since it's inherited and shown in banner */}
                            {!parentId && (
                                <div className="space-y-1 relative">
                                    <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                        <Folder size={11} />
                                        <span>Link to Project</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isProjectInherited) return; // Lock if inherited
                                            setIsProjectDropdownOpen(!isProjectDropdownOpen);
                                            setIsTypeDropdownOpen(false);
                                            setIsFromCalendarOpen(false);
                                            setIsToCalendarOpen(false);
                                        }}
                                        className={`w-full bg-transparent text-xs font-bold flex items-center justify-between py-1 group/select ${isProjectInherited ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="truncate max-w-[150px] text-gray-300">
                                                {projects.find(p => String(p.id) === String(projectId))?.name || 'Select Project...'}
                                            </span>
                                            {isProjectInherited && (
                                                <span className="text-[7px] text-pink-500 font-black uppercase tracking-widest mt-0.5 whitespace-nowrap">
                                                    Connected to {parentEvent?.title}
                                                </span>
                                            )}
                                        </div>
                                        {!isProjectInherited && (
                                            <ChevronDown size={14} className={`text-gray-600 group-hover/select:text-gray-400 transition-transform flex-shrink-0 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                                        )}
                                        {isProjectInherited && <Check size={12} className="text-pink-500 flex-shrink-0" />}
                                    </button>

                                    {isProjectDropdownOpen && !isProjectInherited && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D21] border border-white/10 rounded-xl shadow-2xl z-[130] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                            <button
                                                onClick={() => { setProjectId(''); setIsProjectDropdownOpen(false); }}
                                                className="w-full px-4 py-2 text-left text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors"
                                            >
                                                None
                                            </button>
                                            {projects.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => { setProjectId(p.id.toString()); setIsProjectDropdownOpen(false); }}
                                                    className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/5 transition-colors flex items-center justify-between ${String(projectId) === String(p.id) ? 'text-pink-400 bg-pink-500/5' : 'text-gray-400'}`}
                                                >
                                                    <span className="truncate">{p.name}</span>
                                                    {String(projectId) === String(p.id) && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Registration Last Date Picker Container - Only if not sub-event */}
                            {!parentId && (
                                <div className="space-y-1 relative">
                                    <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                        <Bell size={11} className="text-pink-500" />
                                        <span>Registration Last Date</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsLastCalendarOpen(!isLastCalendarOpen);
                                            setIsFromCalendarOpen(false);
                                            setIsToCalendarOpen(false);
                                            setIsProjectDropdownOpen(false);
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors block w-full text-left py-1 font-black"
                                    >
                                        {lastDate ? new Date(lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'NONE'}
                                    </button>

                                    {isLastCalendarOpen && (
                                        <div className="absolute top-full right-0 mt-4 w-[280px] bg-[#1A1D21] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[120] p-4 scale-in-center animate-in fade-in zoom-in duration-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <div className="text-[11px] font-black text-white uppercase tracking-widest">
                                                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </div>
                                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                                    <div key={d} className="text-[8px] font-black text-gray-600 text-center uppercase py-1">{d}</div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-1">
                                                {generateDays().map((d, i) => {
                                                    const isSelected = formatDateLocal(d.date) === lastDate;
                                                    const isToday = formatDateLocal(d.date) === formatDateLocal(new Date());
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => { 
                                                                if (formatDateLocal(d.date) === lastDate) {
                                                                    setLastDate(null);
                                                                } else {
                                                                    setLastDate(formatDateLocal(d.date));
                                                                }
                                                                setIsLastCalendarOpen(false); 
                                                            }}
                                                            className={`text-[10px] h-8 rounded-lg flex items-center justify-center font-bold transition-all ${!d.current ? 'text-gray-700 pointer-events-none opacity-20' : 'text-gray-400 hover:bg-white/5 hover:text-white'} ${isSelected ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:bg-pink-400' : ''} ${isToday && !isSelected ? 'border border-pink-500/30' : ''}`}
                                                        >
                                                            {d.day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Time Selectors (Only for Sub Events) */}
                            {parentId && (
                                <>
                                    <div className="col-span-2 flex items-center gap-2 mt-1 mb-[-8px]">
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Timing</span>
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                    </div>

                                    {/* From Time Selector */}
                                    <div className="space-y-1 relative">
                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                            <Clock size={11} className="text-pink-500" />
                                            <span>From Time</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsFromTimeOpen(!isFromTimeOpen);
                                                setIsToTimeOpen(false);
                                                setIsFromCalendarOpen(false);
                                                setIsToCalendarOpen(false);
                                                setIsLastCalendarOpen(false);
                                                setIsTypeDropdownOpen(false);
                                                setIsProjectDropdownOpen(false);
                                            }}
                                            className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors block w-full text-left py-1 font-black"
                                        >
                                            {fromTime}
                                        </button>

                                        {isFromTimeOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-32 max-h-48 overflow-y-auto bg-[#1A1D21] border border-white/10 rounded-xl shadow-2xl z-[130] py-1 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                {Array.from({ length: 24 * 2 }).map((_, i) => {
                                                    const h = Math.floor(i / 2);
                                                    const m = (i % 2) * 30;
                                                    const period = h < 12 ? 'AM' : 'PM';
                                                    const displayH = h % 12 || 12;
                                                    const time = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
                                                    return (
                                                        <button
                                                            key={time}
                                                            onClick={() => { setFromTime(time); setIsFromTimeOpen(false); }}
                                                            className={`w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-white/5 transition-colors ${fromTime === time ? 'text-pink-400 bg-pink-500/5' : 'text-gray-400'}`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* To Time Selector */}
                                    <div className="space-y-1 relative">
                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                            <Clock size={11} className="text-pink-500" />
                                            <span>To Time</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsToTimeOpen(!isToTimeOpen);
                                                setIsFromTimeOpen(false);
                                                setIsFromCalendarOpen(false);
                                                setIsToCalendarOpen(false);
                                                setIsLastCalendarOpen(false);
                                                setIsTypeDropdownOpen(false);
                                                setIsProjectDropdownOpen(false);
                                            }}
                                            className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors block w-full text-left py-1 font-black"
                                        >
                                            {toTime}
                                        </button>

                                        {isToTimeOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-32 max-h-48 overflow-y-auto bg-[#1A1D21] border border-white/10 rounded-xl shadow-2xl z-[130] py-1 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                {Array.from({ length: 24 * 2 }).map((_, i) => {
                                                    const h = Math.floor(i / 2);
                                                    const m = (i % 2) * 30;
                                                    const period = h < 12 ? 'AM' : 'PM';
                                                    const displayH = h % 12 || 12;
                                                    const time = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
                                                    return (
                                                        <button
                                                            key={time}
                                                            onClick={() => { setToTime(time); setIsToTimeOpen(false); }}
                                                            className={`w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-white/5 transition-colors ${toTime === time ? 'text-pink-400 bg-pink-500/5' : 'text-gray-400'}`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {!parentId && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                        <MapPin size={12} className={parentEvent?.location ? "text-pink-500" : ""} />
                                        <span>Location</span>
                                    </div>
                                    {parentEvent?.location && (
                                        <span className="text-[7px] text-pink-500 font-black uppercase tracking-widest">
                                            Inherited from Collection
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. San Francisco, Online..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className={`w-full bg-white/[0.02] text-gray-300 placeholder-gray-700 focus:outline-none text-xs font-bold p-3 rounded-xl border transition-colors ${parentEvent?.location ? 'border-pink-500/20 focus:border-pink-500/40' : 'border-white/5 focus:border-white/10'}`}
                                />
                            </div>
                        )}

                        {/* Building Description */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                <AlignLeft size={12} />
                                <span>What we are building</span>
                            </div>
                            <textarea
                                placeholder="Team objective..."
                                value={buildingDescription}
                                onChange={(e) => setBuildingDescription(e.target.value)}
                                className="w-full bg-white/[0.02] text-gray-300 placeholder-gray-700 resize-none focus:outline-none text-xs font-bold p-3 rounded-xl border border-white/5 min-h-[60px] focus:border-white/10 transition-colors"
                                rows={2}
                            />
                        </div>

                        {/* Quick Links Section (Hidden for sub-events) */}
                        {!parentId && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                        <LinkIcon size={12} className="text-pink-500" />
                                        <span>External Links</span>
                                    </div>
                                    <button
                                        onClick={addLink}
                                        className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-all active:scale-95"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {links.map((link, index) => (
                                        <div key={index} className="flex gap-3 items-center group/link">
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Label..."
                                                    value={link.label}
                                                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                                                    className="w-[120px] bg-white/[0.02] text-gray-300 placeholder-gray-700 focus:outline-none text-[10px] font-bold p-2.5 rounded-xl border border-white/5 focus:border-white/10 transition-colors"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="URL (https://...)"
                                                    value={link.url}
                                                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                                                    className="flex-1 bg-white/[0.02] text-gray-300 placeholder-gray-700 focus:outline-none text-[10px] font-bold p-2.5 rounded-xl border border-white/5 focus:border-white/10 transition-colors"
                                                />
                                            </div>
                                            {links.length > 1 && (
                                                <button
                                                    onClick={() => removeLink(index)}
                                                    className="p-2 rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 transition-all active:scale-90 opacity-0 group-hover/link:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}



                        {/* Hackathon Win Toggle */}
                        {type === 'HACKATHON' && (
                            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group transition-all hover:bg-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl transition-all ${won ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-emerald-500'}`}>
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Hackathon Outcome</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">Did we win this one?</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setWon(!won)}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${won ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${won ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all active:scale-95 border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl text-xs font-black transition-all shadow-xl active:scale-95 text-white bg-pink-600 shadow-pink-500/20 hover:bg-pink-500"
                            >
                                {eventToEdit ? 'Update Event' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;
