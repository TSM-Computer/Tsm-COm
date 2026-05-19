import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Save, Key, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabaseConfig, updateSupabaseLocalConfig } from '../lib/supabase';

export default function SupabaseSettings() {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url || '');
  const [key, setKey] = useState(config.key || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseLocalConfig(url.trim(), key.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-brand-calm uppercase tracking-tighter flex items-center gap-3">
          <Database className="text-brand-primary" />
          การตั้งค่า Supabase API
        </h3>
        {config.isConfigured ? (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 size={12} />
            เชื่อมต่อแล้ว
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <AlertCircle size={12} />
            ยังไม่ได้ตั้งค่า
          </span>
        )}
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary/20" />
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe size={12} />
              SUPABASE PROJECT URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-brand-calm font-medium disabled:opacity-50"
              disabled={config.isFromEnv}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Key size={12} />
              SUPABASE ANON KEY
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="your-anon-key"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-brand-calm font-medium disabled:opacity-50"
              disabled={config.isFromEnv}
            />
          </div>

          {config.isFromEnv && (
            <p className="text-[10px] text-brand-primary font-bold bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10">
              * ข้อมูลถูกโหลดจาก Environment Variables ระบบ (Vercel/Settings) ระบบจะไม่ให้แก้ไขผ่านช่องทางนี้เพื่อความปลอดภัย
            </p>
          )}

          {!config.isFromEnv && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-brand-calm text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:opacity-95 transition-all uppercase tracking-widest text-xs"
            >
              <Save size={16} />
              {isSaved ? 'บันทึกสำเร็จ (กำลังรีโหลด...)' : 'บันทึกการตั้งค่า'}
            </motion.button>
          )}
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
          <p className="text-[10px] font-black text-brand-calm uppercase tracking-widest">วิธีหาข้อมูล:</p>
          <ol className="text-xs text-gray-500 space-y-1 list-decimal ml-4">
            <li>ไปที่ Supabase Dashboard (supabase.com)</li>
            <li>เลือก Project ของคุณ</li>
            <li>ไปที่เมนู Settings หรือ Project Settings {'>'} API</li>
            <li>คัดลอก "Project URL" และ "anon public key" มาใส่ที่นี่</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
