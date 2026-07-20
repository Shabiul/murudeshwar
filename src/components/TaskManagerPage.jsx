import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = ['Reception', 'Housekeeping', 'Maintenance', 'Restaurant', 'Scuba', 'Rentals'];
const KANBAN_COLUMNS = ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

const MOCK_TASKS = [
  { id: '1', title: 'Prepare room key cards', description: 'Double check keys for rooms 101-105 checkin', department: 'Reception', assigned_to_name: 'Anita Devi', status: 'Pending', due_date: '2026-07-18T10:00:00Z', priority: 'Medium', comments: [{ id: 'c1', author: 'Anita Devi', text: 'Checked key card reader, working fine.', created_at: '2026-07-17T09:30:00Z' }], activity: [{ id: 'a1', text: 'Task created', created_at: '2026-07-17T09:00:00Z' }] },
  { id: '2', title: 'Scuba tank pressure check', description: 'Inspect 10 oxygen cylinders for morning dive', department: 'Scuba', assigned_to_name: 'Ramesh Kumar', status: 'In Progress', due_date: '2026-07-17T18:00:00Z', priority: 'High', comments: [], activity: [{ id: 'a2', text: 'Status changed to In Progress by Ramesh Kumar', created_at: '2026-07-17T10:15:00Z' }] },
  { id: '3', title: 'Procure fresh sea bass', description: 'Coordinate with local fish market for restaurant supplies', department: 'Restaurant', assigned_to_name: 'Chef Suresh', status: 'Completed', due_date: '2026-07-16T12:00:00Z', priority: 'High', comments: [], activity: [{ id: 'a3', text: 'Status marked Completed by Chef Suresh', created_at: '2026-07-16T11:45:00Z' }] },
];

export default function TaskManagerPage() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Filters
  const [filterDept, setFilterDept] = useState('All');

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Task creation fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Reception');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Comment field
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const staffRes = await supabase.from('staff').select('id, full_name');
      const taskRes = await supabase.from('tasks').select('*').order('due_date', { ascending: true });

      if (staffRes.error || taskRes.error) {
        throw new Error('Task tables not configured');
      }

      setStaff(staffRes.data || []);
      const mappedTasks = taskRes.data.map(t => {
        const staffObj = staffRes.data.find(s => s.id === t.assigned_to);
        return {
          ...t,
          assigned_to_name: staffObj ? staffObj.full_name : 'Unassigned',
          comments: t.comments || [],
          activity: t.activity || [{ id: 'init', text: 'Task initialized', created_at: t.created_at || new Date().toISOString() }]
        };
      });
      setTasks(mappedTasks);
      setIsDemo(false);
    } catch (err) {
      console.warn('Tasks database schemas not configured. Loading demo simulator.', err.message);
      setTasks(MOCK_TASKS);
      setStaff([
        { id: 's1', full_name: 'Anita Devi' },
        { id: 's2', full_name: 'Ramesh Kumar' },
        { id: 's3', full_name: 'Chef Suresh' },
      ]);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const staffObj = staff.find(s => s.id === assignedTo);
    const payload = {
      title,
      description,
      department,
      assigned_to: assignedTo || null,
      status: 'Pending',
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      comments: [],
      activity: [{ id: Date.now().toString(), text: 'Task created', created_at: new Date().toISOString() }]
    };

    if (isDemo) {
      setTasks([{ id: Date.now().toString(), ...payload, assigned_to_name: staffObj ? staffObj.full_name : 'Unassigned' }, ...tasks]);
      setIsModalOpen(false);
      resetForm();
      return;
    }

    try {
      const { error } = await supabase.from('tasks').insert([payload]);
      if (error) throw error;
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    const timeNow = new Date().toISOString();
    const logEntry = { id: Date.now().toString(), text: `Status updated to ${newStatus}`, created_at: timeNow };

    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    const updatedActivity = [...(targetTask.activity || []), logEntry];

    if (isDemo) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, activity: updatedActivity } : t));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus, activity: updatedActivity });
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, activity: updatedActivity })
        .eq('id', taskId);

      if (error) throw error;
      fetchData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus, activity: updatedActivity });
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now().toString(),
      author: 'Administrator',
      text: newComment,
      created_at: new Date().toISOString()
    };

    const updatedComments = [...(selectedTask.comments || []), commentObj];
    const updatedActivity = [...(selectedTask.activity || []), { id: Date.now().toString(), text: 'New comment added', created_at: new Date().toISOString() }];

    if (isDemo) {
      const updatedList = tasks.map(t => t.id === selectedTask.id ? { ...t, comments: updatedComments, activity: updatedActivity } : t);
      setTasks(updatedList);
      setSelectedTask({ ...selectedTask, comments: updatedComments, activity: updatedActivity });
      setNewComment('');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ comments: updatedComments, activity: updatedActivity })
        .eq('id', selectedTask.id);

      if (error) throw error;
      setNewComment('');
      fetchData();
      setSelectedTask({ ...selectedTask, comments: updatedComments, activity: updatedActivity });
    } catch (err) {
      alert('Error posting comment: ' + err.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment('Reception');
    setAssignedTo('');
    setDueDate('');
    setPriority('Medium');
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'High': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-250 text-amber-700 dark:text-amber-300';
      case 'Emergency': return 'bg-rose-50 dark:bg-rose-950/30 border-rose-250 text-rose-700 dark:text-rose-300 font-bold';
      default: return 'bg-stone-50 dark:bg-stone-800 border-stone-200 text-stone-600 dark:text-stone-300';
    }
  };

  return (
    <CrmLayout title="Resort Kanban Board" subtitle="Organize receptionist, diving instructors, rental agents, and kitchen chores.">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 shadow-sm">
        <div className="flex gap-2 items-center text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider">Dept Filter:</span>
          {['All', ...DEPARTMENTS].map(dept => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterDept === dept
                  ? 'bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-900'
                  : 'bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 text-stone-600 dark:text-stone-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-sm"
        >
          Create Task
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col && (filterDept === 'All' || t.department === filterDept));
            return (
              <div key={col} className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-200/40 dark:border-stone-850 min-h-[500px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{col}</span>
                  <span className="bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-600 dark:text-stone-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-250/50 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{task.department}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm text-stone-900 dark:text-stone-100 line-clamp-2 mb-2">{task.title}</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">{task.description}</p>
                      
                      <div className="flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-100 dark:border-stone-850 pt-2">
                        <span className="font-medium">{task.assigned_to_name || 'Unassigned'}</span>
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN') : 'No due'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                <h2 className="font-serif text-lg text-stone-900 dark:text-stone-50">Create Universal Chore</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Inspect scuba oxygen tanks"
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Chore Details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2.5"
                    placeholder="Detail instructions for the staff..."
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Department *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm border border-stone-200 dark:border-stone-750 bg-transparent text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Details & comments Side-Panel */}
      <AnimatePresence>
        {isDetailOpen && selectedTask && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex justify-end z-50">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-stone-900 w-full max-w-lg h-full flex flex-col justify-between shadow-2xl border-l border-stone-200 dark:border-stone-800"
            >
              <div>
                {/* Header */}
                <div className="p-6 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center bg-stone-50 dark:bg-stone-850">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{selectedTask.department}</span>
                    <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mt-1">{selectedTask.title}</h3>
                  </div>
                  <button onClick={() => setIsDetailOpen(false)} className="text-stone-400 hover:text-stone-600 text-2xl">
                    &times;
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
                  {/* Status update buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Chore Status</label>
                    <div className="flex flex-wrap gap-2">
                      {KANBAN_COLUMNS.map(col => (
                        <button
                          key={col}
                          onClick={() => handleUpdateStatus(selectedTask.id, col)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedTask.status === col
                              ? 'bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-900'
                              : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info fields */}
                  <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200/40 dark:border-stone-800 space-y-3">
                    <p className="text-sm text-stone-700 dark:text-stone-300 font-serif">{selectedTask.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-stone-200/40">
                      <div>
                        <span className="text-stone-400">Assigned To:</span>
                        <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{selectedTask.assigned_to_name}</p>
                      </div>
                      <div>
                        <span className="text-stone-400">Due Date:</span>
                        <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                          {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleString('en-IN') : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments log */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Comments & Notes</h4>
                    <div className="space-y-3">
                      {(selectedTask.comments || []).length === 0 ? (
                        <p className="text-xs text-stone-400 italic">No notes posted yet.</p>
                      ) : (
                        (selectedTask.comments || []).map(comm => (
                          <div key={comm.id} className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-150 text-xs">
                            <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                              <span className="font-bold">{comm.author}</span>
                              <span>{new Date(comm.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-stone-700 dark:text-stone-300">{comm.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Activity Logs */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Activity History</h4>
                    <div className="space-y-2 border-l-2 border-stone-150 pl-4 text-xs text-stone-500">
                      {(selectedTask.activity || []).map(act => (
                        <div key={act.id} className="relative py-1">
                          <span className="font-medium text-stone-700 dark:text-stone-300">{act.text}</span>
                          <span className="block text-[9px] text-stone-400 mt-0.5">{new Date(act.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment input footer */}
              <form onSubmit={handleAddComment} className="p-4 border-t border-stone-100 dark:border-stone-850 bg-stone-50 dark:bg-stone-850 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post updates or comment..."
                  className="flex-grow text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 rounded-xl px-3 py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-900 text-xs font-bold rounded-xl"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CrmLayout>
  );
}
