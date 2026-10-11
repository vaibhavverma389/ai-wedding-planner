import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  DollarSign,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { apiClient } from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

export const WeddingPlannerPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('budget'); // 'budget', 'functions', 'tasks', 'rsvp'

  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSubEventModal, setShowSubEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: 'Decor & Mandap',
    title: '',
    estimatedCost: 50000,
    actualCost: 50000,
    isPaid: false
  });

  const [newSubEvent, setNewSubEvent] = useState({
    name: '',
    time: '10:00 AM',
    venue: '',
    guestCount: 150
  });

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Decor',
    priority: 'MEDIUM'
  });

  const [newGuest, setNewGuest] = useState({
    name: '',
    side: 'MUTUAL',
    rsvpStatus: 'ATTENDING',
    attendingCount: 2,
    dietaryPreference: 'VEG'
  });

  // Query wedding planner data
  const { data: response, isLoading } = useQuery({
    queryKey: ['myEventPlanner'],
    queryFn: () => apiClient.get('/events/my-event')
  });

  const eventData = response?.data?.event;
  const analytics = response?.data?.analytics;

  // Mutations
  const addExpenseMutation = useMutation({
    mutationFn: (data) => apiClient.post('/events/budget', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEventPlanner']);
      setShowExpenseModal(false);
      setNewExpense({ category: 'Decor & Mandap', title: '', estimatedCost: 50000, actualCost: 50000, isPaid: false });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/events/budget/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['myEventPlanner'])
  });

  const addSubEventMutation = useMutation({
    mutationFn: (data) => apiClient.post('/events/sub-events', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEventPlanner']);
      setShowSubEventModal(false);
      setNewSubEvent({ name: '', time: '10:00 AM', venue: '', guestCount: 150 });
    }
  });

  const deleteSubEventMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/events/sub-events/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['myEventPlanner'])
  });

  const addTaskMutation = useMutation({
    mutationFn: (data) => apiClient.post('/events/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEventPlanner']);
      setShowTaskModal(false);
      setNewTask({ title: '', category: 'Decor', priority: 'MEDIUM' });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (id) => apiClient.patch(`/events/tasks/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries(['myEventPlanner'])
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/events/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['myEventPlanner'])
  });

  const addGuestMutation = useMutation({
    mutationFn: (data) => apiClient.post('/events/guests', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEventPlanner']);
      setShowGuestModal(false);
      setNewGuest({ name: '', side: 'MUTUAL', rsvpStatus: 'ATTENDING', attendingCount: 2, dietaryPreference: 'VEG' });
    }
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/events/guests/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['myEventPlanner'])
  });

  if (isLoading) {
    return <LoadingSpinner text="Organizing your wedding schedule and budget..." fullPage />;
  }

  // Days countdown calculation
  const primaryDate = eventData?.primaryDate ? new Date(eventData.primaryDate) : new Date();
  const daysRemaining = Math.max(0, Math.ceil((primaryDate - new Date()) / (1000 * 60 * 60 * 24)));

  // Budget chart data
  const budgetChartData = eventData?.budgetExpenses?.map((item) => ({
    name: item.title.slice(0, 15),
    Estimated: item.estimatedCost,
    Actual: item.actualCost
  })) || [];

  const COLORS = ['#881337', '#D97706', '#9F1239', '#F59E0B', '#B45309', '#BE123C'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header Banner with Countdown */}
      <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-wedding-lg flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400 font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Wedding Planner</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            {eventData?.weddingTitle || "Our Grand Wedding"}
          </h1>
          <p className="text-xs text-ivory-200 mt-1">
            Target Date: {primaryDate.toLocaleDateString('en-IN', { dateStyle: 'long' })} • Location: {eventData?.city}
          </p>
        </div>

        {/* Regal Countdown Pill */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 text-center flex items-center gap-6">
          <div>
            <div className="font-serif text-3xl sm:text-5xl font-bold text-gold-400">
              {daysRemaining}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-ivory-200 mt-1">
              Days to Celebration
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Total Budget</div>
          <div className="text-xl font-bold text-maroon-900">
            ₹{analytics?.totalBudget?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Remaining: ₹{analytics?.remainingBudget?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Actual Committed</div>
          <div className="text-xl font-bold text-stone-900">
            ₹{analytics?.totalActual?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            ₹{analytics?.totalPaid?.toLocaleString('en-IN')} settled
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Tasks Checklist</div>
          <div className="text-xl font-bold text-stone-900">
            {analytics?.tasksCompleted} / {analytics?.totalTasks}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            {analytics?.tasksProgressPercent}% tasks done
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Confirmed Guests</div>
          <div className="text-xl font-bold text-gold-700">
            {analytics?.confirmedGuests} Guests
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Total Invited: {analytics?.totalGuests}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-ivory-200 gap-4 overflow-x-auto text-sm font-semibold">
        {[
          { key: 'budget', label: 'Budget & Expenses', icon: DollarSign },
          { key: 'functions', label: 'Functions & Schedule', icon: Calendar },
          { key: 'tasks', label: 'To-Do Checklist', icon: CheckSquare },
          { key: 'rsvp', label: 'Guests & RSVP', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-maroon-900 text-maroon-900 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: BUDGET & EXPENSES */}
      {activeTab === 'budget' && (
        <div className="space-y-8">
          {/* Visual Chart Card */}
          <div className="bg-white p-6 rounded-2xl border border-ivory-200 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">
              Estimated vs. Actual Category Outlay
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <XAxis dataKey="name" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="Estimated" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#881337" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-ivory-200 overflow-hidden shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">Itemized Expenses</h3>
              <Button variant="primary" size="sm" onClick={() => setShowExpenseModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Expense
              </Button>
            </div>

            <div className="divide-y divide-ivory-100">
              {eventData?.budgetExpenses?.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-stone-900">{item.title}</span>
                    <span className="ml-2 text-[10px] text-stone-400 bg-ivory-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-stone-500">
                      Est: ₹{item.estimatedCost?.toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold text-maroon-900">
                      Act: ₹{item.actualCost?.toLocaleString('en-IN')}
                    </span>
                    <Badge variant={item.isPaid ? 'success' : 'warning'} size="sm">
                      {item.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                    <button
                      onClick={() => deleteExpenseMutation.mutate(item._id)}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUNCTIONS & SCHEDULE */}
      {activeTab === 'functions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-stone-900">Ceremonies & Functions</h3>
            <Button variant="primary" size="sm" onClick={() => setShowSubEventModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Function
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventData?.subEvents?.map((fn) => (
              <div key={fn._id} className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm space-y-3 relative">
                <button
                  onClick={() => deleteSubEventMutation.mutate(fn._id)}
                  className="absolute top-4 right-4 text-stone-300 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-xs font-bold text-gold-700 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>{fn.date ? new Date(fn.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Date TBD'}</span>
                </div>
                <h4 className="font-serif text-2xl font-bold text-stone-900">{fn.name}</h4>
                <div className="text-xs text-stone-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Time: {fn.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Venue: {fn.venue || 'Private Venue'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>Expected Guests: {fn.guestCount} People</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TO-DO CHECKLIST */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-ivory-200">
            <h3 className="font-serif text-xl font-bold text-stone-900">Wedding Tasks Checklist</h3>
            <Button variant="primary" size="sm" onClick={() => setShowTaskModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Task
            </Button>
          </div>

          <div className="space-y-3">
            {eventData?.tasks?.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-ivory-200 hover:bg-ivory-50 transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTaskMutation.mutate(task._id)}
                    className="w-5 h-5 accent-maroon-900 rounded cursor-pointer"
                  />
                  <span className={`${task.isCompleted ? 'line-through text-stone-400' : 'text-stone-900 font-medium'}`}>
                    {task.title}
                  </span>
                  <span className="text-[10px] bg-ivory-100 text-stone-500 px-2 py-0.5 rounded uppercase">
                    {task.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={task.priority === 'HIGH' ? 'danger' : 'gold'} size="sm">
                    {task.priority}
                  </Badge>
                  <button
                    onClick={() => deleteTaskMutation.mutate(task._id)}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GUESTS & RSVP */}
      {activeTab === 'rsvp' && (
        <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-ivory-200">
            <h3 className="font-serif text-xl font-bold text-stone-900">Guest List & RSVP Tracker</h3>
            <Button variant="primary" size="sm" onClick={() => setShowGuestModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Guest
            </Button>
          </div>

          <div className="divide-y divide-ivory-100">
            {eventData?.guests?.map((guest) => (
              <div key={guest._id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <div className="font-semibold text-stone-900">{guest.name}</div>
                  <div className="text-stone-500 text-xs">
                    {guest.side} Side • {guest.dietaryPreference}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-stone-700">Attending: {guest.attendingCount}</span>
                  <Badge variant={guest.rsvpStatus === 'ATTENDING' ? 'success' : 'warning'} size="sm">
                    {guest.rsvpStatus}
                  </Badge>
                  <button
                    onClick={() => deleteGuestMutation.mutate(guest._id)}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-wedding-lg space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-900">Add Budget Expense</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addExpenseMutation.mutate(newExpense);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-500 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sangeet DJ sound system"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                >
                  <option value="Decor & Mandap">Decor & Mandap</option>
                  <option value="Catering & Food">Catering & Food</option>
                  <option value="Baraat & Cars">Baraat & Cars</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Outfits & Jewelry">Outfits & Jewelry</option>
                  <option value="Music, DJ & Lights">Music, DJ & Lights</option>
                  <option value="Mehendi & Makeup">Mehendi & Makeup</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-500 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={newExpense.estimatedCost}
                    onChange={(e) => setNewExpense({ ...newExpense, estimatedCost: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-500 mb-1">Actual Cost (₹)</label>
                  <input
                    type="number"
                    value={newExpense.actualCost}
                    onChange={(e) => setNewExpense({ ...newExpense, actualCost: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowExpenseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
