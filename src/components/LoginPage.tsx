import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, LogIn, Droplet, RefreshCcw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      if (username === 'admin' && password === 'admin') {
        onLogin('admin');
      } else {
        setError('กรุณาตั้งค่า Supabase URL และ Key ในเมนู Settings (หรือใช้ admin/admin)');
      }
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('role, password')
        .eq('username', username)
        .single();

      if (dbError || !data) {
        setError('ไม่พบชื่อผู้ใช้นี้ในระบบ');
      } else if (data.password !== password) {
        setError('รหัสผ่านไม่ถูกต้อง');
      } else {
        onLogin(data.role as UserRole);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="header-gradient p-10 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center border border-white/30 mx-auto mb-6 backdrop-blur-md"
          >
            <Droplet className="w-8 h-8 text-white fill-current" />
          </motion.div>
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Fuel Tracker</h1>
          <p className="text-xs opacity-80 uppercase tracking-widest font-medium">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">ชื่อผู้ใช้</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all font-medium text-brand-calm"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">รหัสผ่าน</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all font-medium text-brand-calm"
                  placeholder="Password"
                  required
                />
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 header-gradient text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-red-100 hover:opacity-90 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCcw size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} className="mr-1" />
            )}
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </motion.button>

          <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest pt-2">
            ระบบเชื่อมต่อฐานข้อมูล Supabase เพื่อใช้งานจริง
          </p>
        </form>
      </motion.div>
    </div>
  );
}
