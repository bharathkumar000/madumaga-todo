// src/components/DashboardShell.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TaskBoard from './TaskBoard';
import CalendarGrid from './CalendarGrid';
import ProjectsView from './ProjectsView';
import ProjectDetailView from './ProjectDetailView';
import TasksView from './TasksView';
import TaskWaitingList from './TaskWaitingList';

const MemoizedTaskBoard = React.memo(TaskBoard);
const MemoizedCalendarGrid = React.memo(CalendarGrid);
const MemoizedProjectsView = React.memo(ProjectsView);
const MemoizedTasksView = React.memo(TasksView);
const MemoizedTaskWaitingList = React.memo(TaskWaitingList);
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    closestCorners
} from '@dnd-kit/core';
import { ChevronLeft, Target, Calendar, CheckCircle2, PlayCircle, Clock, Trash2, Folder } from 'lucide-react';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { isSameDay, isBefore, startOfDay, endOfWeek, endOfMonth, isAfter } from 'date-fns';

const dropAnimation = {
    duration: 150,
    easing: 'ease-out',
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.4',
            },
        },
    }),
};

const DashboardShell = ({ currentView, tasks, setTasks, onAddTask, projects, setProjects, onAddProject, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, events, onUpdateTask, onDeleteProject, onUpdateProject, selectedMemberId, onClearMemberFilter, allUsers, currentUser, projectFiles, onUploadFile, onAddTextAsset, onDeleteFile }) => {
    const [activeTask, setActiveTask] = useState(null);
    const [activeProject, setActiveProject] = useState(null);

    const getRealId = useCallback((id) => {
        if (!id) return id;
        const idStr = id.toString();
        if (idStr.startsWith('waiting-')) return idStr.replace('waiting-', '');
        if (idStr.startsWith('board-')) return idStr.replace('board-', '');
        if (idStr.startsWith('calendar-')) return idStr.replace('calendar-', '');
        return idStr;
    }, []);

    // Resizing State for Right Sidebar
    const [rightSidebarWidth, setRightSidebarWidth] = useState(320); // Width increased to match reference pic
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);

    const startResizing = useCallback((e) => {
        e.preventDefault(); // Prevent text selection
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent) => {
        if (isResizing) {
            const startX = mouseMoveEvent.clientX;
            const newWidth = window.innerWidth - startX;
            if (newWidth > 200 && newWidth < 600) {
                setRightSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // Reset project selection when view changes
    useEffect(() => {
        if (currentView !== 'projects') {
            setSelectedProjectId(null);
        }
    }, [currentView]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Slightly higher to prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        document.body.classList.add('is-dragging');
        const realId = getRealId(active.id);
        if (active.data.current?.type === 'Task') {
            const task = tasks.find(t => t.id === realId);
            setActiveTask(task);
            setActiveProject(null);
        } else if (active.data.current?.type === 'Project') {
            const project = projects.find(p => p.id === realId);
            setActiveProject(project);
            setActiveTask(null);
        }
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const realActiveId = getRealId(activeId);
        const realOverId = getRealId(overId);

        if (realActiveId === realOverId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isActiveProject = active.data.current?.type === 'Project';
        const isOverProject = over.data.current?.type === 'Project';

        // Project Reordering
        if (isActiveProject && isOverProject) {
            setProjects((items) => {
                const oldIndex = items.findIndex((i) => i.id === realActiveId);
                const newIndex = items.findIndex((i) => i.id === realOverId);
                return arrayMove(items, oldIndex, newIndex);
            });
            return;
        }

        if (!isActiveTask) return;

        // Moving Task over Task (reorder only, no Firestore write needed for order)
        if (isActiveTask && isOverTask) {
            // Only block if both are calendar tasks (no reordering in calendar)
            if (currentView === 'calendar' && String(overId).startsWith('calendar-')) return;
            // We no longer setTasks here. Status changes happen in handleDragEnd.
        }

        // Moving Task over Column - defer to handleDragEnd
        // No local state mutation here.
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && over.id.toString().includes('T')) {
            // It's likely a calendar slot (ISO string includes 'T')
            // Format: "2023-10-27T10:00:00.000Z-14" (Day-Hour)
            try {
                const idString = over.id.toString();
                const lastHyphenIndex = idString.lastIndexOf('-');
                const dayIso = idString.substring(0, lastHyphenIndex);
                const hourStr = idString.substring(lastHyphenIndex + 1);

                const hour = parseInt(hourStr);
                const date = new Date(dayIso);

                const newDateTime = new Date(date);
                newDateTime.setHours(hour);

                const taskDateString = newDateTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const taskTimeString = newDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                // Determine Status based on Date
                let newStatus = 'UPCOMING';
                const today = startOfDay(new Date());
                const taskDate = startOfDay(newDateTime);

                if (isBefore(taskDate, today)) {
                    newStatus = 'DELAYED';
                } else if (isSameDay(taskDate, today)) {
                    newStatus = 'TODAY';
                } else if (isBefore(taskDate, endOfWeek(today, { weekStartsOn: 0 }))) {
                    newStatus = 'THIS_WEEK';
                } else if (isBefore(taskDate, endOfMonth(today))) {
                    newStatus = 'THIS_MONTH';
                } else {
                    newStatus = 'UPCOMING';
                }

                const updates = {
                    status: newStatus,
                    date: taskDateString,
                    time: taskTimeString,
                    rawDate: newDateTime.toISOString()
                };

                const realActiveId = getRealId(active.id);

                // Optimistic: update UI instantly
                setTasks(prev => prev.map(t =>
                    t.id === realActiveId ? { ...t, ...updates } : t
                ));
                // Then sync to Firestore in background
                onUpdateTask(realActiveId, updates);

            } catch (e) {
                console.error("Failed to parse calendar drop", e);
            }
        } else if (over) {
            // Dropped on a column or task in a column
            const overId = over.id;
            const validContainers = ['waiting', 'DELAYED', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'UPCOMING', 'NO_DUE_DATE'];

            let targetStatus = overId;
            const realOverId = getRealId(overId);
            const realActiveId = getRealId(active.id);

            if (!validContainers.includes(overId)) {
                const overTask = tasks.find(t => t.id === realOverId);
                if (overTask) targetStatus = overTask.status;
            }

            if (validContainers.includes(targetStatus)) {
                const updates = { status: targetStatus };
                const today = new Date();

                if (targetStatus === 'TODAY') {
                    updates.date = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    updates.time = '10:00 AM';
                    updates.rawDate = today.toISOString();
                } else if (targetStatus === 'THIS_WEEK') {
                    const nextDay = new Date(today);
                    nextDay.setDate(today.getDate() + 1);
                    updates.date = nextDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    updates.time = '11:00 AM';
                    updates.rawDate = nextDay.toISOString();
                } else if (targetStatus === 'WAITING' || targetStatus === 'NO_DUE_DATE') {
                    updates.date = '';
                    updates.time = '';
                    updates.rawDate = '';
                } else if (targetStatus === 'DELAYED') {
                    const task = tasks.find(t => t.id === realActiveId);
                    if (!task?.date) {
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        updates.date = yesterday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                        updates.rawDate = yesterday.toISOString();
                    }
                }

                // Optimistic: update UI instantly
                setTasks(prev => prev.map(t =>
                    t.id === realActiveId ? { ...t, ...updates } : t
                ));
                // Then sync to Firestore in background
                onUpdateTask(realActiveId, updates);
            }
        }

        setActiveTask(null);
        setActiveProject(null);
        document.body.classList.remove('is-dragging');
    };



    const filteredTasks = useMemo(() => {
        if (!selectedMemberId) return tasks || [];
        return (tasks || []).filter(t => {
            const isAssigned = Array.isArray(t.assignedTo)
                ? t.assignedTo.includes(selectedMemberId)
                : t.assignedTo === selectedMemberId;
            return isAssigned || t.userId === selectedMemberId;
        });
    }, [tasks, selectedMemberId]);

    const waitingTasks = useMemo(() => {
        return filteredTasks.filter(t => !t.completed && !t.date);
    }, [filteredTasks]);

    const boardTasks = useMemo(() => {
        return filteredTasks.filter(t => t.date || (t.status !== 'waiting' && t.status !== 'todo' && t.status));
    }, [filteredTasks]);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
        >
            <div className="flex flex-1 h-full w-full">
                {/* Center Column: Board or Calendar */}
                <div className="flex-1 bg-background overflow-hidden w-full flex flex-col">
                    {currentView === 'calendar' ? (
                        <MemoizedCalendarGrid
                            tasks={filteredTasks}
                            events={events}
                            projects={projects}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onUpdateTask={onUpdateTask}
                            selectedMemberId={selectedMemberId}
                            onClearMemberFilter={onClearMemberFilter}
                            allUsers={allUsers}
                        />
                    ) : currentView === 'projects' ? (
                        selectedProjectId ? (
                            <ProjectDetailView
                                project={projects.find(p => p.id === selectedProjectId)}
                                tasks={tasks}
                                onBack={() => setSelectedProjectId(null)}
                                onToggleTask={onToggleTask}
                                onDeleteProject={onDeleteProject}
                                onUpdateProject={onUpdateProject}
                                currentUser={currentUser}
                                projectFiles={projectFiles}
                                onUploadFile={onUploadFile}
                                onAddTextAsset={onAddTextAsset}
                                onDeleteFile={onDeleteFile}
                            />
                        ) : (
                            <MemoizedProjectsView
                                projects={projects}
                                tasks={tasks}
                                onAddProject={onAddProject}
                                onProjectClick={(id) => setSelectedProjectId(id)}
                                onDeleteProject={onDeleteProject}
                            />
                        )
                    ) : currentView === 'tasks' ? (
                        <MemoizedTasksView tasks={filteredTasks} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onDuplicateTask={onDuplicateTask} onEditTask={onEditTask} selectedMemberId={selectedMemberId} onClearMemberFilter={onClearMemberFilter} allUsers={allUsers} />
                    ) : (
                        <MemoizedTaskBoard
                            tasks={filteredTasks}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onDuplicateTask={onDuplicateTask}
                            onEditTask={onEditTask}
                            selectedMemberId={selectedMemberId}
                            onClearMemberFilter={onClearMemberFilter}
                            allUsers={allUsers}
                        />
                    )}
                </div>

                {/* Right Sidebar: Waiting List - Hidden in tasks view */}
                {currentView !== 'tasks' && (
                    <aside
                        ref={sidebarRef}
                        className="flex-shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col h-full bg-card/10 backdrop-blur-sm relative"
                        style={{ width: rightSidebarWidth, transition: isResizing ? 'none' : 'width 0.2s ease' }}
                    >
                        {/* Resize Handle */}
                        <div
                            onMouseDown={startResizing}
                            className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-50 group hover:shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                        >
                            <div className="absolute top-0 left-[-2px] w-4 h-full opacity-0 group-hover:opacity-100" />
                        </div>

                        <MemoizedTaskWaitingList
                            tasks={waitingTasks}
                            onAddTask={onAddTask}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onDuplicateTask={onDuplicateTask}
                            onEditTask={onEditTask}
                            allUsers={allUsers}
                        />
                    </aside>
                )}
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div className="w-[240px] pointer-events-none">
                        <div
                            className={`relative px-2 py-1.5 rounded-lg border border-white/10 shadow-2xl overflow-hidden bg-[#16191D] scale-105`}
                            style={{
                                backgroundImage: (() => {
                                    const assignee = allUsers.find(u => u.id === activeTask.assignedTo) || allUsers.find(u => u.id === activeTask.userId);
                                    const c = assignee?.color || activeTask.color || 'blue';
                                    const taskColor = c === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
                                        c === 'green' ? 'rgba(16, 185, 129, 0.4)' :
                                            (c === 'amber' || c === 'yellow') ? 'rgba(245, 158, 11, 0.4)' :
                                                c === 'rose' ? 'rgba(244, 63, 94, 0.4)' :
                                                    c === 'pink' ? 'rgba(236, 72, 153, 0.4)' :
                                                        c === 'teal' ? 'rgba(20, 184, 166, 0.4)' :
                                                            c === 'orange' ? 'rgba(249, 115, 22, 0.4)' :
                                                                c === 'purple' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255,255,255,0.05)';
                                    return `
                                        radial-gradient(circle at top right, rgba(0,0,0,0.6) 0%, transparent 50%),
                                        radial-gradient(circle at bottom right, ${taskColor} 0%, transparent 70%)
                                    `;
                                })()
                            }}
                        >
                            {/* Ambient Glows */}
                            {(() => {
                                const assignee = allUsers.find(u => u.id === activeTask.assignedTo) || allUsers.find(u => u.id === activeTask.userId);
                                const c = assignee?.color || activeTask.color || 'blue';
                                const glowColor = c === 'blue' ? '#3B82F6' : c === 'green' ? '#10B981' : (c === 'amber' || c === 'yellow') ? '#F59E0B' : c === 'rose' ? '#F43F5E' : c === 'pink' ? '#EC4899' : c === 'teal' ? '#14B8A6' : c === 'orange' ? '#F97316' : c === 'purple' ? '#A855F7' : '#8AB4F8';
                                return (
                                    <>
                                        <div
                                            className="absolute -top-10 -left-10 w-[120px] h-[120px] blur-[45px] rounded-full opacity-30"
                                            style={{ backgroundColor: glowColor }}
                                        ></div>
                                        <div
                                            className="absolute -bottom-10 -right-10 w-[150px] h-[150px] blur-[45px] rounded-full opacity-90"
                                            style={{ backgroundColor: glowColor }}
                                        ></div>
                                    </>
                                );
                            })()}

                            <div className="relative z-10 p-1.5">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[12px] font-black tracking-tight leading-tight uppercase text-white mb-1 truncate">
                                            {activeTask.title}
                                        </h3>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <div className="text-[7px] font-black text-white/90 uppercase tracking-widest leading-none">
                                                {activeTask.time ? `${activeTask.time} — ${(() => {
                                                    const match = activeTask.time.match(/(\d+):(\d+)\s?(AM|PM)/i);
                                                    if (!match) return '';
                                                    let h = parseInt(match[1]);
                                                    const m = parseInt(match[2]);
                                                    const ampm = match[3].toUpperCase();
                                                    if (ampm === 'PM' && h < 12) h += 12;
                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                    const d = new Date();
                                                    d.setHours(h, m + (activeTask.duration || 60));
                                                    // Note: format is available in DashboardShell or I can just use a simple template
                                                    const nh = d.getHours();
                                                    const nm = d.getMinutes();
                                                    const nampm = nh >= 12 ? 'PM' : 'AM';
                                                    return `${nh % 12 || 12}:${nm.toString().padStart(2, '0')} ${nampm}`;
                                                })()}` : 'No Time'}
                                            </div>
                                            {activeTask.time && (
                                                <div className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">
                                                    {(activeTask.duration || 60) >= 60 ? `${Math.floor((activeTask.duration || 60) / 60)}h ${(activeTask.duration || 60) % 60}m` : `${activeTask.duration || 60}m`}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        {activeTask.priority && (
                                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border 
                                                ${activeTask.priority === 'High' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                    activeTask.priority === 'Mid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                {activeTask.priority}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <div className="p-1 rounded bg-white/5 border border-white/5 text-gray-600">
                                                <Calendar size={10} strokeWidth={3} />
                                            </div>
                                            <div className="p-1 rounded-md bg-white/5 border border-white/5 text-gray-600">
                                                <Calendar size={10} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 mt-2">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-white/20 shadow-lg"
                                        style={{
                                            background: (() => {
                                                const assignee = allUsers.find(u => u.id === activeTask.assignedTo || u.id === activeTask.userId);
                                                const c = assignee?.color || 'blue';
                                                return c === 'blue' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' :
                                                    c === 'green' ? 'linear-gradient(135deg, #10B981, #059669)' :
                                                        c === 'amber' || c === 'yellow' ? 'linear-gradient(135deg, #F59E0B, #D97706)' :
                                                            c === 'rose' ? 'linear-gradient(135deg, #F43F5E, #E11D48)' :
                                                                c === 'pink' ? 'linear-gradient(135deg, #EC4899, #BE185D)' :
                                                                    'linear-gradient(135deg, #3B82F6, #1D4ED8)';
                                            })()
                                        }}
                                    >
                                        {(allUsers.find(u => u.id === activeTask.assignedTo || u.id === activeTask.userId)?.name?.charAt(0) || activeTask.creatorInitial || 'B')?.toUpperCase()}
                                    </div>
                                    <span className="text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-[0.1em] border border-white/5 bg-white/5 text-gray-400">
                                        {activeTask.tag || 'TASK'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeProject ? (
                    <div className="w-[320px] pointer-events-none">
                        <div className="bg-[#1C1F26] p-4 rounded-lg border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] rotate-2 scale-105 transition-transform overflow-hidden relative">
                            {/* Ambient Project Glow */}
                            <div className="absolute -top-10 -right-10 w-[150px] h-[150px] bg-[#4F46E5]/20 blur-[50px] rounded-full" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 bg-gray-800 rounded-lg text-[#4F46E5]">
                                    <Folder size={24} />
                                </div>
                            </div>
                            <h3 className="font-black text-xl mb-1 text-white relative z-10 tracking-tight uppercase">{activeProject.name}</h3>
                            <p className="text-sm text-gray-400 mb-4 relative z-10">{activeProject.tasks} active tasks</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-800 relative z-10">
                                <span className="text-[10px] font-black px-2 py-1 rounded bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 uppercase tracking-widest">{activeProject.status}</span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext >
    );
};

export default DashboardShell;
