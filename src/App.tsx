/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { FuelEntry, Stats, UserRole } from './types';
import FuelForm from './components/FuelForm';
import StatsBoard from './components/StatsBoard';
import FuelChart from './components/FuelChart';
import EntryList from './components/EntryList';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';
import SupabaseSettings from './components/SupabaseSettings';
import { formatCurrency } from './lib/utils';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, isSameMonth, isSameYear } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, LogOut, LayoutDashboard, Users, RefreshCcw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const AUTH_KEY = 'fuel_tracker_auth';
const ROLE_KEY = 'fuel_tracker_role';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [adminView, setAdminView] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    weeklyAverage: 0,
    monthlyAverage: 0,
    totalThisMonth: 0,
  });

  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('fuel_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  }, []);

  // Load auth state and data
  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    const role = localStorage.getItem(ROLE_KEY) as UserRole;
    if (auth === 'true' && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      fetchEntries();
    } else {
      setIsLoading(false);
    }
  }, [fetchEntries]);

  // Calculate stats when entries change
  useEffect(() => {
    calculateStats();
  }, [entries]);

  const calculateStats = () => {
    if (entries.length === 0) {
      setStats({ weeklyAverage: 0, monthlyAverage: 0, totalThisMonth: 0 });
      return;
    }

    const now = new Date();
    
    // Find the reference date: Use today, but if there's no data for today's month, 
    // find the most recent entry's month so the dashboard isn't empty after import.
    const hasDataThisMonth = entries.some(e => 
      isSameMonth(new Date(e.date), now) && 
      isSameYear(new Date(e.date), now)
    );

    const latestEntryDate = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.date;
    
    const referenceDate = hasDataThisMonth ? now : new Date(latestEntryDate);
    
    // Total for that month
    const mStart = startOfMonth(referenceDate);
    const mEnd = endOfMonth(referenceDate);
    const monthEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d >= mStart && d <= mEnd;
    });
    
    const totalMonth = monthEntries.reduce((sum, e) => sum + e.amount, 0);

    // Week total relative to reference
    const wStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const wEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
    const weekEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d >= wStart && d <= wEnd;
    });
    
    const totalWeek = weekEntries.reduce((sum, e) => sum + e.amount, 0);

    setStats({
      totalThisMonth: totalMonth,
      weeklyAverage: totalWeek,
      monthlyAverage: totalMonth,
    });
  };

  const handleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(ROLE_KEY, role);
    fetchEntries();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    setEntries([]);
  };

  const handleAddEntry = async (newEntry: Omit<FuelEntry, 'id'>) => {
    if (!isSupabaseConfigured) {
      alert('กรุณาตั้งค่า Supabase URL และ Key ในเมนู Settings ก่อนใช้งาน');
      return;
    }
    const entry = {
      ...newEntry,
      id: crypto.randomUUID(),
    };
    
    setEntries(prev => [entry, ...prev]);

    const { error } = await supabase
      .from('fuel_entries')
      .insert([entry]);

    if (error) {
      console.error('Error adding entry:', error);
      alert(`ไม่สามารถบันทึกข้อมูลได้: ${error.message}`);
      fetchEntries(); // Revert local state
    }
  };

  const handleImportEntries = async (newEntries: Omit<FuelEntry, 'id'>[]) => {
    const entriesWithId: FuelEntry[] = newEntries.map(e => ({
      ...e,
      id: crypto.randomUUID()
    }));
    
    setEntries(prev => [...entriesWithId, ...prev]);

    const { error } = await supabase
      .from('fuel_entries')
      .insert(entriesWithId);

    if (error) {
      console.error('Error importing entries:', error);
      alert(`ไม่สามารถนำเข้าข้อมูลได้: ${error.message}`);
      fetchEntries(); // Revert local state
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const originalEntries = [...entries];
    setEntries(prev => prev.filter(e => e.id !== id));

    const { error } = await supabase
      .from('fuel_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      alert(`ไม่สามารถลบข้อมูลได้: ${error.message}`);
      setEntries(originalEntries); // Revert
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCcw className="text-brand-primary w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col max-w-7xl mx-auto relative lg:shadow-none font-sans">
      {/* Header Section */}
      <header className="header-gradient p-8 pb-12 text-white rounded-b-[32px] shadow-lg lg:rounded-b-[48px] lg:px-12 lg:pb-16 transition-all duration-500">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10 lg:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs opacity-80 font-light uppercase tracking-wider">ยินดีต้อนรับ</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${isAdmin ? 'bg-white text-brand-primary' : 'bg-white/20 text-white'}`}>
                {isAdmin ? '🛡️ Admin' : '👤 User'}
              </span>
            </div>
            <h1 className="text-2xl font-black lg:text-3xl">Fuel Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchEntries}
              className="p-3 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-xl hover:bg-white/20 transition-all text-white"
              title="Refresh Data"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-xl hover:bg-white/20 transition-all text-white"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm shadow-xl">
              <Droplet className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
        </motion.div>
        
        {isAdmin && (
          <motion.div 
            key={`header-stats-${stats.totalThisMonth}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm lg:max-w-md shadow-2xl"
          >
            <p className="text-xs lg:text-sm opacity-90 font-medium">ยอดรวมประหยัด/ใช้จ่ายเดือนนี้ (Admin View)</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl lg:text-5xl font-black">{formatCurrency(stats.totalThisMonth)}</span>
              <span className="text-[10px] lg:text-xs bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                {entries.length > 0 ? 'กำลังประมวลผล' : 'เริ่มบันทึกเลย'}
              </span>
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1 -mt-8 bg-white rounded-t-[32px] lg:rounded-t-[48px] p-6 lg:p-12 space-y-8 shadow-inner overflow-y-auto min-h-[500px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Sidebar: Navigation (Admin Only) */}
          {isAdmin && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-brand-bg/50 p-6 rounded-[32px] border border-gray-100 sticky top-8">
                <h3 className="font-black text-brand-calm mb-6 uppercase tracking-[0.2em] flex items-center gap-2 text-[10px] opacity-40">
                   ระบบบริหารจัดการ
                </h3>
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setAdminView('dashboard')}
                    className={`p-5 rounded-[24px] flex items-center gap-4 transition-all ${
                      adminView === 'dashboard' 
                      ? 'bg-brand-primary text-white shadow-xl shadow-red-100' 
                      : 'bg-white text-gray-400 hover:text-brand-calm border border-gray-50 hover:border-brand-primary/20'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">ภาพรวมระบบ</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setAdminView('users')}
                    className={`p-5 rounded-[24px] flex items-center gap-4 transition-all ${
                      adminView === 'users' 
                      ? 'bg-brand-primary text-white shadow-xl shadow-red-100' 
                      : 'bg-white text-gray-400 hover:text-brand-calm border border-gray-50 hover:border-brand-primary/20'
                    }`}
                  >
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">การจัดการผู้ใช้งาน</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setAdminView('settings')}
                    className={`p-5 rounded-[24px] flex items-center gap-4 transition-all ${
                      adminView === 'settings' 
                      ? 'bg-brand-primary text-white shadow-xl shadow-red-100' 
                      : 'bg-white text-gray-400 hover:text-brand-calm border border-gray-50 hover:border-brand-primary/20'
                    }`}
                  >
                    <RefreshCcw className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">ตั้งค่า API</span>
                  </motion.button>

                  <div className="p-6 bg-brand-bg rounded-[32px] border border-gray-100 mt-6 hidden lg:block">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       </div>
                       <p className="text-[10px] font-black text-brand-calm uppercase tracking-widest">สถานะ: แอดมิน</p>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                       คุณกำลังใช้งานในสิทธิ์สูงสุด สามารถเข้าถึงข้อมูลและจัดการบัญชีได้ทั้งหมด
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Center Column: Dynamic Content Area */}
          <div className={isAdmin ? 'lg:col-span-9 space-y-8' : 'lg:col-span-12 space-y-8'}>
            {isAdmin ? (
              <AnimatePresence mode="wait">
                  {adminView === 'dashboard' ? (
                    <motion.div
                      key="admin-dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                      <div className="lg:col-span-8 space-y-8">
                        <StatsBoard stats={stats} />
                        <FuelChart entries={entries} />
                        <EntryList entries={entries} onDelete={handleDeleteEntry} onImport={handleImportEntries} />
                      </div>
                      <div className="lg:col-span-4 space-y-8">
                         <FuelForm onAddEntry={handleAddEntry} />
                         <div className="p-6 bg-brand-bg rounded-3xl border border-gray-100">
                            <h4 className="font-bold text-brand-calm mb-2 text-sm">เคล็ดลับแอดมิน</h4>
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                              ระบบรวบรวมค่าน้ำมันทั้งหมดเพื่อคำนวณงบประมาณรายเดือนโดยอัตโนมัติ
                            </p>
                         </div>
                      </div>
                    </motion.div>
                  ) : adminView === 'users' ? (
                    <motion.div
                      key="admin-users"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <UserManagement />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="admin-settings"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <SupabaseSettings />
                    </motion.div>
                  )}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto space-y-8"
              >
                <div className="text-center py-8">
                  <h2 className="text-2xl font-black text-brand-calm mb-2">สวัสดี ยินดีต้อนรับ!</h2>
                  <p className="text-gray-500 text-sm">บันทึกข้อมูลค่าน้ำมันของคุณในแบบรายวันหรือไป-กลับ</p>
                </div>
                <FuelForm onAddEntry={handleAddEntry} />
                <div className="p-6 bg-brand-bg rounded-3xl border border-gray-100 italic text-center">
                   "ประหยัดวันนี้ เพื่ออนาคตที่ดีกว่า"
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar / Form for Admin (already handled by grid inside switch for dashboard) */}
        </div>

        <footer className="pt-12 text-center text-gray-400 text-[10px] uppercase tracking-widest pb-8">
          <p>© 2024 Fuel Tracker App. ระบบเชื่อมต่อฐานข้อมูลSupabase เพื่อการใช้งานจริง</p>
        </footer>
      </main>
    </div>
  );
}
