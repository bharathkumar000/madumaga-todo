// src/components/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, MapPin, AlignLeft, ChevronLeft, ChevronRight, Tag, Folder, Link as LinkIcon, Plus, Trash2, ChevronDown, Check, Trophy } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, onSave, projects = [], eventToEdit = null }) => {
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
    const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
    const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
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
    };

    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title || '');
            if (eventToEdit.date) {
                const d = new Date(eventToEdit.date);
                if (!isNaN(d.getTime())) {
                    setFromDate(formatDateLocal(d));
                }
            }
            if (eventToEdit.toDate) {
                const d = new Date(eventToEdit.toDate);
                if (!isNaN(d.getTime())) {
                    setToDate(formatDateLocal(d));
                }
            }
            setLocation(eventToEdit.location || '');
            setType(eventToEdit.type || 'HACKATHON');
            setDescription(eventToEdit.description || '');
            setBuildingDescription(eventToEdit.buildingDescription || '');
            setProjectId(eventToEdit.projectId?.toString() || '');
            setLinks(eventToEdit.links?.length > 0 ? [...eventToEdit.links] : [{ label: '', url: '' }]);
        } else {
            resetForm();
        }
    }, [eventToEdit, isOpen]);

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

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        // Colors mapping based on type
        const colors = {
            'HACKATHON': 'from-purple-500 to-indigo-600',
            'MEETUP': 'from-blue-400 to-cyan-500',
            'WORKSHOP': 'from-pink-500 to-rose-500',
            'CONFERENCE': 'from-amber-400 to-orange-500'
        };

        onSave({
            ...(eventToEdit || {}),
            title,
            date: fromDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            toDate: toDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            location: location || 'Online',
            type,
            attendees: 4, // Default team size
            image: eventToEdit?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400",
            color: colors[type] || 'from-blue-500 to-indigo-600',
            description,
            buildingDescription,
            projectId: projectId?.toString(),
            won: type === 'HACKATHON' ? won : false,
            links: links.filter(l => l.label && l.url)
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
                <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] blur-[60px] rounded-full opacity-20 transition-all duration-700 bg-indigo-500"></div>

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

                    <div className="max-h-[min(650px,80vh)] overflow-y-auto custom-scrollbar px-8 pb-8 pt-6 space-y-6">
                        {/* Title Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Event Name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent text-2xl font-black text-white placeholder-gray-600 border-none focus:ring-0 focus:outline-none transition-all"
                                autoFocus
                            />
                            <div className="h-[1px] w-full bg-gradient-to-r from-indigo-500/50 to-transparent mt-1"></div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5 font-bold relative z-20">
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
                                                        onClick={() => { setFromDate(formatDateLocal(d.date)); setIsFromCalendarOpen(false); }}
                                                        className={`text-[10px] h-8 rounded-lg flex items-center justify-center font-bold transition-all ${!d.current ? 'text-gray-700 pointer-events-none opacity-20' : 'text-gray-400 hover:bg-white/5 hover:text-white'} ${isSelected ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-400' : ''} ${isToday && !isSelected ? 'border border-indigo-500/30' : ''}`}
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
                                                        onClick={() => { setToDate(formatDateLocal(d.date)); setIsToCalendarOpen(false); }}
                                                        className={`text-[10px] h-8 rounded-lg flex items-center justify-center font-bold transition-all ${!d.current ? 'text-gray-700 pointer-events-none opacity-20' : 'text-gray-400 hover:bg-white/5 hover:text-white'} ${isSelected ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-400' : ''} ${isToday && !isSelected ? 'border border-indigo-500/30' : ''}`}
                                                    >
                                                        {d.day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Project Selector */}
                            <div className="space-y-1 relative">
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                    <Folder size={11} />
                                    <span>Link to Project</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsProjectDropdownOpen(!isProjectDropdownOpen);
                                        setIsTypeDropdownOpen(false);
                                        setIsFromCalendarOpen(false);
                                        setIsToCalendarOpen(false);
                                    }}
                                    className="w-full bg-transparent text-xs font-bold text-gray-300 flex items-center justify-between py-1 group/select"
                                >
                                    <span className="truncate max-w-[150px]">
                                        {projects.find(p => String(p.id) === String(projectId))?.name || 'Select Project...'}
                                    </span>
                                    <ChevronDown size={14} className={`text-gray-600 group-hover/select:text-gray-400 transition-transform flex-shrink-0 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProjectDropdownOpen && (
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
                                                className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/5 transition-colors flex items-center justify-between ${String(projectId) === String(p.id) ? 'text-indigo-400 bg-indigo-500/5' : 'text-gray-400'}`}
                                            >
                                                <span className="truncate">{p.name}</span>
                                                {String(projectId) === String(p.id) && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Type Selector */}
                            <div className="space-y-1 relative">
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                    <Tag size={11} />
                                    <span>Type</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsTypeDropdownOpen(!isTypeDropdownOpen);
                                        setIsProjectDropdownOpen(false);
                                        setIsFromCalendarOpen(false);
                                        setIsToCalendarOpen(false);
                                    }}
                                    className="w-full bg-transparent text-xs font-bold text-gray-300 flex items-center justify-between py-1 group/select"
                                >
                                    <span className="capitalize">{type.toLowerCase()}</span>
                                    <ChevronDown size={14} className={`text-gray-600 group-hover/select:text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTypeDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D21] border border-white/10 rounded-xl shadow-2xl z-[130] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                        {['HACKATHON', 'MEETUP', 'WORKSHOP', 'CONFERENCE'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => { setType(t); setIsTypeDropdownOpen(false); }}
                                                className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/5 transition-colors flex items-center justify-between ${type === t ? 'text-indigo-400 bg-indigo-500/5' : 'text-gray-400'}`}
                                            >
                                                <span className="capitalize">{t.toLowerCase()}</span>
                                                {type === t && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                <MapPin size={12} />
                                <span>Location</span>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. San Francisco, Online..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-white/[0.02] text-gray-300 placeholder-gray-700 focus:outline-none text-xs font-bold p-3 rounded-xl border border-white/5 focus:border-white/10 transition-colors"
                            />
                        </div>

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

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                <AlignLeft size={12} />
                                <span>Event Background Info</span>
                            </div>
                            <textarea
                                placeholder="Additional details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/[0.02] text-gray-300 placeholder-gray-700 resize-none focus:outline-none text-xs font-bold p-3 rounded-xl border border-white/5 min-h-[60px] focus:border-white/10 transition-colors"
                                rows={2}
                            />
                        </div>

                        {/* Links Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    <LinkIcon size={12} />
                                    <span>Important Links</span>
                                </div>
                                <button onClick={addLink} className="text-[10px] font-black text-indigo-400 flex items-center gap-1 hover:text-indigo-300">
                                    <Plus size={12} /> ADD LINK
                                </button>
                            </div>
                            <div className="space-y-2">
                                {links.map((link, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Website)"
                                            value={link.label}
                                            onChange={(e) => updateLink(index, 'label', e.target.value)}
                                            className="w-1/3 bg-white/[0.02] text-gray-300 placeholder-gray-700 focus:outline-none text-[10px] font-bold p-2.5 rounded-lg border border-white/5 focus:border-white/10 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            placeholder="URL (https://...)"
                                            value={link.url}
                                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                                            className="flex-1 bg-white/[0.02] text-gray-300 placeholder-gray-700 focus:outline-none text-[10px] font-bold p-2.5 rounded-lg border border-white/5 focus:border-white/10 transition-colors"
                                        />
                                        {links.length > 1 && (
                                            <button onClick={() => removeLink(index)} className="p-2 text-gray-600 hover:text-rose-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

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
                                className="flex-1 py-3 rounded-xl text-xs font-black transition-all shadow-xl active:scale-95 text-white bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-500"
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
