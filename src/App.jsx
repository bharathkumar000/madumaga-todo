import React, { useState, useEffect, useCallback } from 'react';
import { addDays, isSameDay, isBefore, startOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

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

const INITIAL_TASKS = [
    {
        id: '1',
        title: 'Design System Review',
        projectName: 'Website Redesign',
        status: 'SCHEDULED',
        date: getTodayStr(0),
        time: '11:00 AM',
        tag: 'DESIGN',
        userId: '1',
        creatorName: 'Bharath',
        creatorInitial: 'B',
        color: 'bg-blue-600/90 from-blue-600 to-indigo-700 text-white',
        priority: 'High',
        isGradient: true
    },
    {
        id: '2',
        title: 'Client Meeting Preparation',
        projectName: 'Marketing Campaign',
        status: 'WAITING',
        tag: 'MEETING',
        userId: '2',
        creatorName: 'Rishith',
        creatorInitial: 'R',
        color: 'bg-amber-500/90 from-amber-500 to-orange-600 text-white',
        priority: 'Mid',
        isGradient: true
    },
    {
        id: '3',
        title: 'Fix Layout Bug on Mobile',
        projectName: 'Mobile App',
        status: 'WAITING',
        tag: 'DEV',
        userId: '3',
        creatorName: 'Srinivas',
        creatorInitial: 'S',
        color: 'bg-emerald-600/90 from-emerald-600 to-teal-700 text-white',
        priority: 'Low',
        isGradient: true
    }
];

const USERS = [
    { id: 'bharathece2006@gmail.com', name: 'Bharath', color: 'blue' },
    { id: 'rishithsgowda13@gmail.com', name: 'Rishith', color: 'amber' },
    { id: 'vvce25cse0639@vvce.ac.in', name: 'Srinivas', color: 'green' }
];

const INITIAL_PROJECTS = [
    {
        id: 1,
        name: 'Website Redesign',
        status: 'Completed',
        tasks: 12,
        goals: ['Refresh visual identity', 'Optimize mobile performance', 'Integrate new CMS'],
        startDate: '01 Jan 2026',
        endDate: '30 Mar 2026'
    },
    {
        id: 2,
        name: 'Mobile App',
        status: 'Planning',
        tasks: 5,
        goals: ['Define user flows', 'Create high-fidelity wireframes', 'Select tech stack'],
        startDate: '15 Feb 2026',
        endDate: '15 Jun 2026'
    },
    {
        id: 3,
        name: 'Marketing Campaign',
        status: 'Active',
        tasks: 8,
        goals: ['Launch social media blitz', 'Coordinate with influencers', 'Track conversion rates'],
        startDate: '10 Feb 2026',
        endDate: '10 Apr 2026'
    },
];

const INITIAL_EVENTS = [
    {
        id: 1,
        title: "Global AI Hackathon 2026",
        date: "15 Mar 2026",
        location: "San Francisco, CA (Stanford Campus)",
        type: "HACKATHON",
        attendees: 4,
        image: "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=400",
        color: "from-pink-500 to-rose-500",
        description: "Participating in the Stanford AI Safety Hackathon as a team. Focus on robust agentic alignment.",
        buildingDescription: "We are building an autonomous auditing system for LLM transaction logs to detect misalignment in real-time.",
        won: true,
        projectId: 1, // Linked to Website Redesign for now as placeholder
        links: [
            { label: 'College Site', url: 'https://stanford.edu' },
            { label: 'Hackathon Rules', url: 'https://hackathon.stanford.edu' }
        ]
    },
    {
        id: 2,
        title: "React Summit & Meetup",
        date: "22 Apr 2026",
        location: "Online / Team Office",
        type: "MEETUP",
        attendees: 3,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400",
        color: "from-blue-400 to-cyan-500",
        description: "Internal team sync during the React Summit. Goal: Refactor our component library.",
        buildingDescription: "Migrating our core design tokens to a CSS-in-JS alternative with zero-runtime overhead.",
        allottedThings: "Internal Design Docs, Cursor Pro Subscriptions, Pizza & Coffee.",
        projectId: 2,
        links: [
            { label: 'Summit Link', url: 'https://reactsummit.com' }
        ]
    }
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

    // 1. Auth Observer
    useEffect(() => {
        const ALLOWED_EMAILS = [
            'bharathece2006@gmail.com',
            'rishithsgowda13@gmail.com',
            'vvce25cse0639@vvce.ac.in',
        ];

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Security check: Only allow specific emails
                const isAllowed = ALLOWED_EMAILS.includes(user.email);

                if (!isAllowed) {
                    console.error("Unauthorized access attempt:", user.email);
                    await signOut(auth);
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                    return;
                }

                setIsAuthenticated(true);
                // Listen to personal profile changes
                const userRef = doc(db, 'users', user.uid);
                const unsubProfile = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCurrentUser({ id: user.uid, ...docSnap.data() });
                    } else {
                        // Create initial profile if it doesn't exist
                        const knownUser = USERS.find(u => u.id === user.email);
                        const initialProfile = {
                            name: knownUser?.name || user.displayName || user.email.split('@')[0],
                            color: knownUser?.color || 'blue',
                            bio: '',
                            id: user.uid
                        };
                        setDoc(userRef, initialProfile);
                        setCurrentUser(initialProfile);
                    }
                });
                return () => unsubProfile();
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Real-time Data Sync (Tasks, Projects, Events)
    useEffect(() => {
        if (!currentUser?.id) return;

        // Sync Tasks
        const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(items);
        }, (error) => {
            console.error("Firestore Tasks Listener Error:", error);
        });

        // Sync Projects
        const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(items);
        });

        // Sync Events
        const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(items);
        });

        // Sync All Users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(items);
        });

        return () => {
            unsubTasks();
            unsubProjects();
            unsubEvents();
            unsubUsers();
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
                    await updateDoc(doc(db, 'tasks', task.id), { status: expectedStatus });
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
            await signOut(auth);
            setIsAuthenticated(false);
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const [editingTask, setEditingTask] = useState(null);

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
                const taskRef = doc(db, 'tasks', editingTask.id);
                await updateDoc(taskRef, taskData);
                setEditingTask(null);
            } else {
                await addDoc(collection(db, 'tasks'), {
                    ...taskData,
                    status: taskData.status || "todo",
                    userId: currentUser?.id, // Creator
                    assignedTo: taskData.assignedTo || currentUser?.id,
                    creatorName: currentUser?.name || 'Bharath',
                    creatorInitial: (currentUser?.name || 'B').charAt(0),
                    color: taskData.color || 'blue',
                    isGradient: true,
                    completed: false,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error("Error adding/updating task:", error);
        }
    };

    const handleAddProject = async (newProject) => {
        try {
            await addDoc(collection(db, 'projects'), {
                ...newProject,
                name: newProject.title,
                tasks: 0,
                userId: currentUser?.id
            });
        } catch (error) {
            console.error("Error adding project:", error);
        }
    };

    const handleAddEvent = async (newEvent) => {
        try {
            if (eventToEdit) {
                const eventRef = doc(db, 'events', eventToEdit.id);
                await updateDoc(eventRef, newEvent);
                setEventToEdit(null);
            } else {
                await addDoc(collection(db, 'events'), {
                    ...newEvent,
                    userId: currentUser?.id,
                    completed: false
                });
            }
        } catch (error) {
            console.error("Error adding/updating event:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(db, 'events', eventId));
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleToggleEventComplete = async (eventId) => {
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) return;
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, { completed: !event.completed });

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
            const userRef = doc(db, 'users', currentUser.id);
            await setDoc(userRef, { ...updatedUser, lastSeen: new Date() }, { merge: true });
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleToggleTask = useCallback(async (taskId) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, { completed: !task.completed });
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    }, [tasks]);

    const handleDeleteTask = useCallback(async (taskId) => {
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }, []);

    const handleDuplicateTask = useCallback(async (taskId) => {
        try {
            const taskToDuplicate = tasks.find(task => task.id === taskId);
            if (!taskToDuplicate) return;

            const { id, ...data } = taskToDuplicate;
            await addDoc(collection(db, 'tasks'), {
                ...data,
                title: `${data.title} (Copy)`
            });
        } catch (error) {
            console.error("Error duplicating task:", error);
        }
    }, [tasks]);

    const handleUpdateTask = useCallback(async (taskId, updates) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, updates);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }, []);

    const handleDeleteProject = async (projectId) => {
        try {
            await deleteDoc(doc(db, 'projects', projectId));
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