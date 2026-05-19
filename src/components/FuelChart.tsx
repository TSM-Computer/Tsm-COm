import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FuelEntry } from '../types';
import { startOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';

interface FuelChartProps {
  entries: FuelEntry[];
}

export default function FuelChart({ entries }: FuelChartProps) {
  // Aggregate data for the last 14 days or current month
  const now = new Date();
  
  // Find the reference date: Use today, but if there's no data for today's month, 
  // find the most recent entry's month so the chart isn't empty.
  const hasDataThisMonth = entries.some(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const latestDate = entries.length > 0 
    ? new Date(Math.max(...entries.map(e => new Date(e.date).getTime())))
    : now;

  const referenceDate = hasDataThisMonth ? now : latestDate;
  const monthStart = startOfMonth(referenceDate);
  
  const days = eachDayOfInterval({
    start: monthStart,
    end: referenceDate
  });

  const chartData = days.map(day => {
    const dayEntries = entries.filter(e => isSameDay(new Date(e.date), day));
    const total = dayEntries.reduce((sum, e) => sum + e.amount, 0);
    return {
      date: format(day, 'd MMM', { locale: th }),
      amount: total
    };
  });

  const displayMonth = format(referenceDate, 'MMMM', { locale: th });

  return (
    <div className="flex flex-col gap-3" key={`chart-${entries.length}`}>
      <div className="flex justify-between items-end px-2">
        <h3 className="font-bold text-brand-calm">แนวโน้มค่าน้ำมัน</h3>
        <span className="text-[10px] text-gray-400">{displayMonth}</span>
      </div>
      <div className="h-64 bg-[#F9FAFB] rounded-2xl p-4 shadow-sm border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#FF6B6B" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
