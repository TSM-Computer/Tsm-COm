import React, { useState } from 'react';
import { Fuel, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FuelEntry } from '../types';

interface FuelFormProps {
  onAddEntry: (entry: Omit<FuelEntry, 'id'>) => void;
}

export default function FuelForm({ onAddEntry }: FuelFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [trip_type, setTripType] = useState<'daily' | 'round-trip'>('round-trip');
  const [trips, setTrips] = useState<string>('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onAddEntry({
      date: new Date(date).toISOString(),
      amount: Number(amount),
      trip_type,
      trips: trip_type === 'round-trip' ? Number(trips) || 1 : undefined,
    });
    setAmount('');
    setTrips('1');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-brand-primary/10 rounded-xl">
          <Fuel className="w-5 h-5 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-brand-calm">เพิ่มบันทึกใหม่</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">จำนวนเงิน (บาท)</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="฿0.00"
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all text-2xl font-black text-brand-calm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">วันที่</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all appearance-none text-sm font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ประเภท</label>
            <select
              value={trip_type}
              onChange={(e) => setTripType(e.target.value as any)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all appearance-none text-sm font-medium"
            >
              <option value="round-trip">ไป-กลับ</option>
              <option value="daily">รายวัน</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {trip_type === 'round-trip' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">จำนวนเที่ยว</label>
              <input
                type="number"
                value={trips}
                onChange={(e) => setTrips(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all text-sm font-medium"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-red-100 hover:bg-brand-primary/90 transition-all uppercase tracking-widest text-sm"
        >
          <Plus className="w-5 h-5" />
          บันทึกรายการ
        </motion.button>
      </form>
    </motion.div>
  );
}
