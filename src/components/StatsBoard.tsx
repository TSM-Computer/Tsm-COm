import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { Stats } from '../types';
import { TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface StatsBoardProps {
  stats: Stats;
}

export default function StatsBoard({ stats }: StatsBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        key={`weekly-${stats.weeklyAverage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-[#F0F7FF] p-4 rounded-2xl border border-[#D9E9FF]"
      >
        <p className="text-[#4D96FF] text-[10px] font-bold uppercase mb-1">เฉลี่ยรายสัปดาห์</p>
        <h2 className="text-xl font-extrabold text-brand-calm">{formatCurrency(stats.weeklyAverage)}</h2>
        <div className="w-full bg-[#D9E9FF] h-1 mt-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: stats.weeklyAverage > 0 ? '70%' : '0%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-[#4D96FF] h-full rounded-full"
          />
        </div>
      </motion.div>

      <motion.div
        key={`monthly-${stats.monthlyAverage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-[#F0FFF4] p-4 rounded-2xl border border-[#D1FADF]"
      >
        <p className="text-[#6BCB77] text-[10px] font-bold uppercase mb-1">เฉลี่ยรายเดือน</p>
        <h2 className="text-xl font-extrabold text-brand-calm">{formatCurrency(stats.monthlyAverage)}</h2>
        <div className="w-full bg-[#D1FADF] h-1 mt-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: stats.monthlyAverage > 0 ? '85%' : '0%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-[#6BCB77] h-full rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
