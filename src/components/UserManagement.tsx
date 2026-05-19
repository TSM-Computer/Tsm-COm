import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Shield, User, Trash2, Mail, BadgeCheck, RefreshCcw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  email: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const fetchUsers = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      alert('กรุณาตั้งค่า Supabase URL และ Key ในเมนู Settings');
      return;
    }
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      name: newName,
      username: newUsername,
      password: newPassword,
      role: newRole,
      email: `${newUsername}@tracker.com`
    };

    const originalUsers = [...users];
    setUsers([...users, newUser]);
    
    const { error } = await supabase
      .from('users')
      .insert([newUser]);

    if (error) {
      console.error('Error adding user:', error);
      alert(`ไม่สามารถเพิ่มผู้ใช้งานได้: ${error.message}`);
      setUsers(originalUsers);
    } else {
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setIsAdding(false);
    }
  };

  const deleteUser = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    if (userToDelete.username === 'admin') {
      alert('ไม่สามารถลบผู้ดูแลระบบหลักได้');
      return;
    }

    if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) {
      const originalUsers = [...users];
      setUsers(users.filter(u => u.id !== id));

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        alert(`ไม่สามารถลบผู้ใช้งานได้: ${error.message}`);
        setUsers(originalUsers);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCcw className="animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-brand-calm uppercase tracking-tight">รายการเพิ่มผู้ใช้งาน</h2>
        <p className="text-sm text-gray-400">เพิ่มและจัดการสิทธิ์การเข้าถึงระบบของบุคลากร</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between hover:border-brand-primary/20 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-secondary/10 text-brand-secondary'
                }`}>
                  <User size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-brand-calm">{user.name}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">
                    Username: {user.username} | Password: {user.password ? '•'.repeat(user.password.length) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteUser(user.id)}
                  className={`p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ${
                    user.username === 'admin' ? 'hidden' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isAdding ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-8 border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-brand-primary/20 hover:text-brand-primary transition-all group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-brand-primary/20">
               <UserPlus size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">+ เพิ่มพนักงานใหม่</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-bg/50 p-8 rounded-[40px] border border-dashed border-brand-primary/30"
          >
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ชื่อ-นามสกุลจริง</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:outline-none transition-all font-bold text-brand-calm shadow-sm"
                    placeholder="Enter full name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:outline-none transition-all font-bold text-brand-calm shadow-sm"
                    placeholder="Enter username..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">รหัสผ่าน (Password)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:outline-none transition-all font-bold text-brand-calm shadow-sm"
                    placeholder="Enter password..."
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">กำหนดสิทธิ์พนักงาน</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:outline-none transition-all font-bold text-brand-calm shadow-sm appearance-none"
                  >
                    <option value="user">USER (บันทึกข้อมูลอย่างเดียว)</option>
                    <option value="admin">ADMIN (จัดการระบบทั้งหมด)</option>
                  </select>
                </div>
                <div className="flex gap-2 w-full md:w-auto md:self-end">
                  <button
                    type="submit"
                    className="flex-1 md:px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:opacity-90 transition-all"
                  >
                    ยืนยัน
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-4 bg-white text-gray-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-gray-100 hover:bg-gray-50 mb-0"
                  >
                    X
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
