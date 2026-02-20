import React, { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from './supabase';
import Layout from './components/Layout';
import DashboardShell from './components/DashboardShell';
import AddTaskModal from './components/AddTaskModal';
import AddProjectModal from './components/AddProjectModal';
import AddEventModal from './components/AddEventModal';
import EventDetailModal from './components/EventDetailModal';
import ProfileModal from './components/ProfileModal';
import LoginPage from './components/LoginPage';
import EventsView from './components/EventsView';
import AchievementsView from './components/AchievementsView';
import { startOfDay, isBefore, isSameDay, endOfWeek, endOfMonth } from 'date-fns';

function App() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    // 1. Auth State Listener
    useEffect(() => {
        if (!supabase?.auth) return;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsAuthenticated(true);
                setCurrentUser(session.user);
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapTask = useCallback((t) => ({
        ...t,
        title: t.task_name,
        id: t.id,
        projectId: t.project_id,
        userId: t.user_id,
        assignedTo: t.assigned_to,
        rawDate: t.raw_date
    }), []);

    // 2. Real-time Data Sync (Tasks, Projects, Events)
    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchData = async () => {
            try {
                const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*');
                if (tasksError) throw tasksError;
                if (tasksData) setTasks(tasksData.map(mapTask));

                const { data: projectsData, error: projError } = await supabase.from('projects').select('*');
                if (projError) throw projError;
                if (projectsData) setProjects(projectsData.map(p => ({
                    ...p,
                    name: p.title,
                    id: p.id,
                    userId: p.user_id
                })));

                const { data: eventsData, error: eventsError } = await supabase.from('events').select('*');
                if (eventsError) throw eventsError;
                if (eventsData) setEvents(eventsData.map(e => ({
                    ...e,
                    toDate: e.to_date,
                    buildingDescription: e.building_description,
                    projectId: e.project_id,
                    userId: e.user_id,
                    teams: e.teams || []
                })));

                const { data: usersData, error: usersError } = await supabase.from('users').select('*');
                if (usersError) throw usersError;
                if (usersData) setAllUsers(usersData);
            } catch (err) {
                console.error("Critical Error Fetching Data:", err.message);
            }
        };

        fetchData();

        // Realtime Subscriptions
        const channel = supabase
            .channel('db_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => {
                        if (prev.find(t => t.id === payload.new.id)) return prev;
                        return [...prev, mapTask(payload.new)];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapTask(payload.new);
                    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                const mapProj = (p) => ({ ...p, name: p.title, id: p.id, userId: p.user_id });
                if (payload.eventType === 'INSERT') {
                    setProjects(prev => [...prev, mapProj(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapProj(payload.new);
                    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                } else if (payload.eventType === 'DELETE') {
                    setProjects(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
                const mapEv = (e) => ({ ...e, toDate: e.to_date, buildingDescription: e.building_description, projectId: e.project_id, userId: e.user_id, teams: e.teams || [] });
                if (payload.eventType === 'INSERT') {
                    setEvents(prev => [...prev, mapEv(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapEv(payload.new);
                    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
                } else if (payload.eventType === 'DELETE') {
                    setEvents(prev => prev.filter(e => e.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setAllUsers(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                    setAllUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, mapTask]);

    // 3. Auto-Categorize Tasks based on Date (Healing Logic)
    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const today = startOfDay(new Date());

        tasks.forEach(async (task) => {
            if (!task.date || task.completed) return;

            try {
                const taskDate = task.rawDate ? startOfDay(new Date(task.rawDate)) : startOfDay(new Date(task.date));
                if (isNaN(taskDate.getTime())) return;

                let expectedStatus = 'UPCOMING';
                if (isBefore(taskDate, today)) {
                    expectedStatus = 'DELAYED';
                } else if (isSameDay(taskDate, today)) {
                    expectedStatus = 'TODAY';
                } else if (isBefore(taskDate, endOfWeek(today, { weekStartsOn: 0 }))) {
                    expectedStatus = 'THIS_WEEK';
                } else if (isBefore(taskDate, endOfMonth(today))) {
                    expectedStatus = 'THIS_MONTH';
                }

                const syncableStatuses = ['DELAYED', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'UPCOMING', 'WAITING', 'todo', 'NO_DUE_DATE', ''];
                if (task.status !== expectedStatus && syncableStatuses.includes(task.status || '')) {
                    await supabase.from('tasks').update({ status: expectedStatus }).eq('id', task.id);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
    }, [tasks.length, currentView]);

    // View Persistence
    useEffect(() => {
        const savedView = localStorage.getItem('todo_currentView');
        if (savedView) setCurrentView(savedView);
    }, []);

    useEffect(() => {
        localStorage.setItem('todo_currentView', currentView);
    }, [currentView]);

    const handleLogin = (user) => {
        // Authenticated by listener
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const handleEditEvent = (event) => {
        setEventToEdit(event);
        setSelectedEvent(null);
        setIsEventModalOpen(true);
    };

    const [newTaskDefaults, setNewTaskDefaults] = useState(null);

    const handleAddTask = async (taskData) => {
        try {
            const primaryAssignee = Array.isArray(taskData.assignedTo) ? taskData.assignedTo[0] : taskData.assignedTo;

            if (editingTask) {
                const mappedUpdates = {
                    task_name: taskData.title,
                    project_id: taskData.projectId || null,
                    assigned_to: primaryAssignee,
                    raw_date: taskData.rawDate || null,
                    status: taskData.status,
                    priority: taskData.priority,
                    date: taskData.date || null,
                    time: taskData.time || null,
                    color: taskData.color || null
                };

                const { error } = await supabase.from('tasks').update(mappedUpdates).eq('id', editingTask.id);
                if (error) throw error;
                setEditingTask(null);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                const { data, error } = await supabase.from('tasks').insert([{
                    task_name: taskData.title,
                    project_id: taskData.projectId || null,
                    user_id: user?.id,
                    status: taskData.status || "WAITING",
                    assigned_to: primaryAssignee,
                    priority: taskData.priority,
                    date: taskData.date || null,
                    time: taskData.time || null,
                    raw_date: taskData.rawDate || null,
                    color: taskData.color || null
                }]).select();

                if (error) throw error;
                if (data && data.length > 0) {
                    setTasks(prev => {
                        if (prev.find(t => t.id === data[0].id)) return prev;
                        return [...prev, mapTask(data[0])];
                    });
                }
            }
        } catch (error) {
            console.error("Error in handleAddTask:", error);
        }
    };

    const handleAddProject = async (newProject) => {
        try {
            const { data, error } = await supabase.from('projects').insert([{
                title: newProject.title,
                description: newProject.description || '',
                status: newProject.status || 'Planning',
                user_id: (await supabase.auth.getUser()).data.user?.id
            }]).select();
            if (error) throw error;
            if (data && data.length > 0) {
                setProjects(prev => [...prev, { ...data[0], name: data[0].title, id: data[0].id }]);
            }
        } catch (error) {
            console.error("Error adding project:", error);
        }
    };

    const handleAddEvent = async (newEvent) => {
        try {
            const mappedEvent = {
                title: newEvent.title,
                date: newEvent.date,
                to_date: newEvent.toDate || null,
                location: newEvent.location || 'Online',
                type: newEvent.type,
                attendees: newEvent.attendees,
                image: newEvent.image,
                color: newEvent.color,
                description: newEvent.description,
                building_description: newEvent.buildingDescription || null,
                project_id: newEvent.projectId || null,
                won: newEvent.won,
                links: newEvent.links || [],
                teams: newEvent.teams || [],
                user_id: (await supabase.auth.getUser()).data.user?.id,
                completed: false
            };

            if (eventToEdit) {
                const { error } = await supabase.from('events').update(mappedEvent).eq('id', eventToEdit.id);
                if (error) throw error;
                setEventToEdit(null);
            } else {
                const { error } = await supabase.from('events').insert([mappedEvent]);
                if (error) throw error;
            }
        } catch (error) {
            console.error("Error in handleAddEvent:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleUpdateEvent = async (eventId, updates) => {
        try {
            const mappedUpdates = { ...updates };
            if (updates.toDate) mappedUpdates.to_date = updates.toDate;
            if (updates.buildingDescription) mappedUpdates.building_description = updates.buildingDescription;
            if (updates.projectId) mappedUpdates.project_id = updates.projectId;
            if (updates.userId) mappedUpdates.user_id = updates.userId;

            // Cleanup camelCase
            delete mappedUpdates.toDate;
            delete mappedUpdates.buildingDescription;
            delete mappedUpdates.projectId;
            delete mappedUpdates.userId;

            const { error } = await supabase.from('events').update(mappedUpdates).eq('id', eventId);
            if (error) throw error;
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
            if (selectedEvent?.id === eventId) setSelectedEvent(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleToggleEventComplete = async (eventId) => {
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) return;
            const { error } = await supabase.from('events').update({ completed: !event.completed }).eq('id', eventId);
            if (error) throw error;
            if (selectedEvent?.id === eventId) setSelectedEvent(prev => ({ ...prev, completed: !prev.completed }));
        } catch (error) {
            console.error("Error toggling event:", error);
        }
    };

    const handleUpdateProfile = async (updatedUser) => {
        try {
            if (!currentUser) return;
            const { error } = await supabase.from('users').update({ ...updatedUser, last_seen: new Date().toISOString() }).eq('id', currentUser.id);
            if (error) throw error;
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleToggleTask = useCallback(async (taskId) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', taskId);
            if (error) throw error;
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    }, [tasks]);

    const handleDeleteTask = useCallback(async (taskId) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }, []);

    const handleDuplicateTask = useCallback(async (taskId) => {
        try {
            const taskToDuplicate = tasks.find(t => t.id === taskId);
            if (!taskToDuplicate) return;
            const { id, ...data } = taskToDuplicate;
            const { error } = await supabase.from('tasks').insert([{
                task_name: `${data.title} (Copy)`,
                project_id: data.projectId || null,
                user_id: (await supabase.auth.getUser()).data.user?.id,
                status: data.status || 'todo',
                assigned_to: data.assignedTo || null,
                priority: data.priority || null,
                date: data.date || null,
                time: data.time || null,
                color: data.color || null
            }]);
            if (error) throw error;
        } catch (error) {
            console.error("Error duplicating task:", error);
        }
    }, [tasks]);

    const handleUpdateTask = useCallback(async (taskId, updates) => {
        try {
            const mappedUpdates = {};
            if (updates.title) mappedUpdates.task_name = updates.title;
            if (updates.projectId) mappedUpdates.project_id = updates.projectId;
            if (updates.assignedTo) mappedUpdates.assigned_to = Array.isArray(updates.assignedTo) ? updates.assignedTo[0] : updates.assignedTo;
            if (updates.rawDate) mappedUpdates.raw_date = updates.rawDate;
            if (updates.status) mappedUpdates.status = updates.status;
            if (updates.priority) mappedUpdates.priority = updates.priority;
            if (updates.date) mappedUpdates.date = updates.date;
            if (updates.time) mappedUpdates.time = updates.time;

            if (Object.keys(mappedUpdates).length === 0) return;
            const { error } = await supabase.from('tasks').update(mappedUpdates).eq('id', taskId);
            if (error) throw error;
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }, []);

    const handleDeleteProject = async (projectId) => {
        try {
            const { error } = await supabase.from('projects').delete().eq('id', projectId);
            if (error) throw error;
            setCurrentView('projects');
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleEditTask = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setEditingTask(task);
            setIsModalOpen(true);
        }
    };

    if (!isAuthenticated) return <LoginPage onLogin={handleLogin} users={allUsers} />;

    return (
        <Layout
            currentView={currentView}
            onNavigate={(view) => { setCurrentView(view); setSelectedMemberId(null); }}
            onComposeClick={() => setIsModalOpen(true)}
            onAddProject={() => setIsProjectModalOpen(true)}
            onLogout={handleLogout}
            onProfileClick={() => setIsProfileModalOpen(true)}
            currentUser={currentUser}
            users={allUsers}
            onMemberClick={(memberId) => {
                setSelectedMemberId(memberId);
                if (['events', 'achievements', 'projects'].includes(currentView)) setCurrentView('dashboard');
            }}
        >
            {currentView === 'events' ? (
                <EventsView events={events} projects={projects} onAddEvent={() => setIsEventModalOpen(true)} onEventClick={handleEventClick} />
            ) : currentView === 'achievements' ? (
                <AchievementsView projects={projects} events={events} currentUser={currentUser} />
            ) : (
                <DashboardShell
                    currentView={currentView}
                    tasks={tasks}
                    setTasks={setTasks}
                    projects={projects}
                    setProjects={setProjects}
                    events={events}
                    onAddTask={(defaults = null) => { setNewTaskDefaults(defaults); setIsModalOpen(true); }}
                    onAddProject={() => setIsProjectModalOpen(true)}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onDuplicateTask={handleDuplicateTask}
                    onEditTask={handleEditTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteProject={handleDeleteProject}
                    selectedMemberId={selectedMemberId}
                    onClearMemberFilter={() => setSelectedMemberId(null)}
                    allUsers={allUsers}
                    currentUser={currentUser}
                />
            )}
            <AddTaskModal
                isOpen={isModalOpen} initialValues={newTaskDefaults}
                onClose={() => { setIsModalOpen(false); setEditingTask(null); setNewTaskDefaults(null); }}
                onSave={handleAddTask} users={allUsers} currentUser={currentUser} projects={projects} taskToEdit={editingTask}
            />
            <AddProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleAddProject} />
            <AddEventModal isOpen={isEventModalOpen} onClose={() => { setIsEventModalOpen(false); setEventToEdit(null); }} onSave={handleAddEvent} projects={projects} eventToEdit={eventToEdit} />
            <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onEdit={handleEditEvent} onDelete={handleDeleteEvent} onToggleComplete={handleToggleEventComplete} onUpdateEvent={handleUpdateEvent} projects={projects} users={allUsers} />
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentUser={currentUser} onUpdateProfile={handleUpdateProfile} users={allUsers} />
        </Layout>
    );
}

export default App;