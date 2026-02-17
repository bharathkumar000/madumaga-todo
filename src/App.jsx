import React, { useState, useEffect, useCallback } from 'react';
import { addDays, isSameDay, isBefore, startOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { supabase } from './supabase';

// Components
import Layout from './components/Layout';
import DashboardShell from './components/DashboardShell';
import EventsView from './components/EventsView';
import AchievementsView from './components/AchievementsView';
import AddTaskModal from './components/AddTaskModal';
import AddProjectModal from './components/AddProjectModal';
import AddEventModal from './components/AddEventModal';
import EventDetailModal from './components/EventDetailModal';
import ProfileModal from './components/ProfileModal';
import LoginPage from './components/LoginPage';

const getTodayStr = (offset = 0) => {
    const d = addDays(new Date(), offset);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const USERS = [
    { id: 'bharathece2006@gmail.com', name: 'Bharath', color: 'blue' },
    { id: 'rishithsgowda13@gmail.com', name: 'Rishith', color: 'amber' },
    { id: 'vvce25cse0639@vvce.ac.in', name: 'Srinivas', color: 'green' }
];

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    // 1. Auth Observer
    useEffect(() => {
        const ALLOWED_EMAILS = [
            'bharathece2006@gmail.com',
            'rishithsgowda13@gmail.com',
            'vvce25cse0639@vvce.ac.in',
        ];

        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        const handleSession = async (session) => {
            if (session?.user) {
                const user = session.user;
                // Security check
                if (!ALLOWED_EMAILS.includes(user.email)) {
                    console.error("Unauthorized access attempt:", user.email);
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                    return;
                }

                setIsAuthenticated(true);

                // Fetch or Create Profile
                const { data: profile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setCurrentUser(profile);
                } else {
                    // Create initial profile
                    const knownUser = USERS.find(u => u.id === user.email);
                    const newProfile = {
                        id: user.id,
                        email: user.email,
                        name: knownUser?.name || user.email.split('@')[0],
                        color: knownUser?.color || 'blue',
                        bio: '',
                        last_seen: new Date().toISOString()
                    };

                    const { data: createdProfile, error: createError } = await supabase
                        .from('users')
                        .insert([newProfile])
                        .select()
                        .single();

                    if (!createError) {
                        setCurrentUser(createdProfile);
                    }
                }
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        };

        return () => subscription.unsubscribe();
    }, []);

    // 2. Real-time Data Sync (Tasks, Projects, Events)
    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchData = async () => {
            const { data: tasksData } = await supabase.from('tasks').select('*');
            if (tasksData) setTasks(tasksData.map(t => ({ ...t, title: t.task_name, id: t.id })));

            const { data: projectsData } = await supabase.from('projects').select('*');
            if (projectsData) setProjects(projectsData.map(p => ({ ...p, name: p.title, id: p.id })));

            const { data: eventsData } = await supabase.from('events').select('*');
            if (eventsData) setEvents(eventsData);

            const { data: usersData } = await supabase.from('users').select('*');
            if (usersData) setAllUsers(usersData);
        };

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('db_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, { ...payload.new, title: payload.new.task_name, id: payload.new.id }]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...payload.new, title: payload.new.task_name, id: payload.new.id } : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setProjects(prev => [...prev, { ...payload.new, name: payload.new.title, id: payload.new.id }]);
                } else if (payload.eventType === 'UPDATE') {
                    setProjects(prev => prev.map(p => p.id === payload.new.id ? { ...payload.new, name: payload.new.title, id: payload.new.id } : p));
                } else if (payload.eventType === 'DELETE') {
                    setProjects(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setEvents(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                    setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
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
    }, [currentUser?.id]);

    // 3. Auto-Categorize Tasks based on Date (Healing Logic)
    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const today = startOfDay(new Date());

        tasks.forEach(async (task) => {
            // Only sync incomplete tasks with dates
            if (!task.date || task.completed) return;

            try {
                // Try to parse the date from rawDate or date string
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

                // If status is irrelevant or wrong, sync it
                const syncableStatuses = ['DELAYED', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'UPCOMING', 'WAITING', 'todo', 'NO_DUE_DATE', ''];
                if (task.status !== expectedStatus && syncableStatuses.includes(task.status || '')) {
                    await supabase.from('tasks').update({ status: expectedStatus }).eq('id', task.id);
                }
            } catch (e) {
                // Silently fail if date parsing fails
            }
        });
    }, [tasks.length, currentView]); // Re-sync on length change or view change

    // View Persistence (Simplified)
    useEffect(() => {
        const savedView = localStorage.getItem('todo_currentView');
        if (savedView) setCurrentView(savedView);
    }, []);

    useEffect(() => {
        localStorage.setItem('todo_currentView', currentView);
    }, [currentView]);

    const handleLogin = (user) => {
        // Authenticated users are handled by onAuthStateChanged
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

    const handleAddTask = async (taskData) => {
        try {
            if (editingTask) {
                const mappedUpdates = {};
                if (taskData.title) mappedUpdates.task_name = taskData.title;
                if (taskData.projectId) mappedUpdates.project_id = taskData.projectId;
                if (taskData.assignedTo) mappedUpdates.assigned_to = taskData.assignedTo;
                if (taskData.rawDate) mappedUpdates.raw_date = taskData.rawDate;
                if (taskData.status) mappedUpdates.status = taskData.status;
                if (taskData.priority) mappedUpdates.priority = taskData.priority;
                if (taskData.date) mappedUpdates.date = taskData.date;
                if (taskData.time) mappedUpdates.time = taskData.time;
                if (taskData.color) mappedUpdates.color = taskData.color;

                const { error } = await supabase
                    .from('tasks')
                    .update(mappedUpdates)
                    .eq('id', editingTask.id);

                if (error) throw error;
                setEditingTask(null);
            } else {
                // NEW: Supabase Logic
                const { data, error } = await supabase
                    .from('tasks')
                    .insert([
                        {
                            task_name: taskData.title,
                            project_id: taskData.projectId || taskData.projectName,
                            user_id: (await supabase.auth.getUser()).data.user?.id,
                            status: taskData.status || "todo",
                            assigned_to: taskData.assignedTo,
                            priority: taskData.priority,
                            date: taskData.date
                        }
                    ])
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setTasks(prev => [...prev, { ...data[0], title: data[0].task_name, id: data[0].id }]);
                }
            }
        } catch (error) {
            console.error("Error adding/updating task:", error);
        }
    };

    const handleAddProject = async (newProject) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([
                    {
                        title: newProject.title,
                        description: newProject.description || '',
                        status: newProject.status || 'Planning',
                        user_id: (await supabase.auth.getUser()).data.user?.id
                    }
                ])
                .select();

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
            if (eventToEdit) {
                const { error } = await supabase
                    .from('events')
                    .update(newEvent)
                    .eq('id', eventToEdit.id);

                if (error) throw error;
                setEventToEdit(null);
            } else {
                const { error } = await supabase
                    .from('events')
                    .insert([{
                        ...newEvent,
                        user_id: (await supabase.auth.getUser()).data.user?.id,
                        completed: false,
                        project_id: newEvent.projectId
                    }]);

                if (error) throw error;
            }
        } catch (error) {
            console.error("Error adding/updating event:", error);
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

    const handleToggleEventComplete = async (eventId) => {
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) return;
            const { error } = await supabase
                .from('events')
                .update({ completed: !event.completed })
                .eq('id', eventId);

            if (error) throw error;

            if (selectedEvent?.id === eventId) {
                setSelectedEvent(prev => ({ ...prev, completed: !prev.completed }));
            }
        } catch (error) {
            console.error("Error toggling event:", error);
        }
    };

    const handleUpdateProfile = async (updatedUser) => {
        try {
            if (!currentUser) return;
            const { error } = await supabase
                .from('users')
                .update({ ...updatedUser, last_seen: new Date().toISOString() })
                .eq('id', currentUser.id);

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
            const taskToDuplicate = tasks.find(task => task.id === taskId);
            if (!taskToDuplicate) return;

            const { id, ...data } = taskToDuplicate;
            // Map known fields to DB columns
            const { error } = await supabase.from('tasks').insert([{
                task_name: `${data.title} (Copy)`,
                project_id: data.projectId || null,
                user_id: (await supabase.auth.getUser()).data.user?.id,
                status: data.status || 'todo',
                assigned_to: data.assignedTo || null,
                priority: data.priority || null,
                date: data.date || null
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
            if (updates.assignedTo) mappedUpdates.assigned_to = updates.assignedTo;
            if (updates.rawDate) mappedUpdates.raw_date = updates.rawDate;

            // Direct mapping for matching keys
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

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} users={allUsers} />;
    }


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
                // Switch to a task-centric view if not already in one
                if (['events', 'achievements', 'projects'].includes(currentView)) {
                    setCurrentView('dashboard');
                }
            }}
        >
            {currentView === 'events' ? (
                <EventsView
                    events={events}
                    projects={projects}
                    onAddEvent={() => setIsEventModalOpen(true)}
                    onEventClick={handleEventClick}
                />
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
                    onAddTask={() => setIsModalOpen(true)}
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
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={handleAddTask}
                users={allUsers}
                currentUser={currentUser}
                projects={projects}
                taskToEdit={editingTask}
            />
            <AddProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSave={handleAddProject}
            />
            <AddEventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEventToEdit(null);
                }}
                onSave={handleAddEvent}
                projects={projects}
                eventToEdit={eventToEdit}
            />

            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onToggleComplete={handleToggleEventComplete}
                projects={projects}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                users={allUsers}
            />

        </Layout>
    );
}
export default App;