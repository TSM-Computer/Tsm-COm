import { FuelEntry } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';
import { Trash2, MapPin, FileUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { useRef, useState } from 'react';

interface EntryListProps {
  entries: FuelEntry[];
  onDelete: (id: string) => void;
  onImport?: (newEntries: Omit<FuelEntry, 'id'>[]) => void;
}

export default function EntryList({ entries, onDelete, onImport }: EntryListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<Omit<FuelEntry, 'id'>[] | null>(null);
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const importedEntries: Omit<FuelEntry, 'id'>[] = data.map((row: any) => {
          const dateVal = row['วันที่ (date)'] || row.date || row['วันที่'] || row['Date'];
          const amountVal = row['จำนวนเงิน (amount)'] || row.amount || row['จำนวนเงิน'] || row['ราคา'] || row['Amount'];
          const typeVal = String(row['ประเภท (tripType)'] || row.tripType || row['ประเภท'] || row['Type'] || '').trim();
          const noteVal = row.note || row['หมายเหตุ'] || row['Note'] || '';

          let tripType: 'daily' | 'round-trip' = 'daily';
          if (typeVal.includes('ไป-กลับ') || typeVal.includes('ไปกลับ') || typeVal.toLowerCase().includes('round')) {
            tripType = 'round-trip';
          }

          let finalDate: string;
          try {
            finalDate = dateVal instanceof Date ? dateVal.toISOString() : new Date(dateVal).toISOString();
            if (finalDate === 'Invalid Date') throw new Error();
          } catch (e) {
            finalDate = new Date().toISOString();
          }

          return {
            date: finalDate,
            amount: Number(String(amountVal).replace(/[^0-9.-]+/g, "")) || 0,
            tripType,
            note: String(noteVal || '')
          };
        });

        if (importedEntries.length > 0) {
          setPendingEntries(importedEntries);
        } else {
          alert("ไม่พบข้อมูลที่สามารถนำเข้าได้");
        }
      } catch (err) {
        console.error("Failed to parse Excel:", err);
        alert("ไม่สามารถนำเข้าข้อมูลได้ กรุณาตรวจสอบรูปแบบไฟล์ Excel ของคุณ");
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    if (pendingEntries && onImport) {
      onImport(pendingEntries);
      setPendingEntries(null);
      // Optional: replace alert with a toast if needed, but alert is direct legacy feedback
      alert(`นำเข้าข้อมูลสำเร็จ ${pendingEntries.length} รายการ!`);
    }
  };

  const cancelImport = () => {
    setPendingEntries(null);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'วันที่ (date)': '2024-05-19',
        'จำนวนเงิน (amount)': 500,
        'ประเภท (tripType)': 'ไป-กลับ'
      },
      {
        'วันที่ (date)': '2024-05-20',
        'จำนวนเงิน (amount)': 1000,
        'ประเภท (tripType)': 'รายวัน'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fuel_Template");
    XLSX.writeFile(wb, "fuel_tracker_template.xlsx");
  };

  if (entries.length === 0 && !onImport) {
    return (
      <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-gray-400">ยังไม่มีข้อมูลการบันทึก</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 relative">
      {/* Import Status Banner */}
      <AnimatePresence>
        {pendingEntries && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                <FileUp size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-brand-calm uppercase tracking-wider">พบข้อมูลใหม่ {pendingEntries.length} รายการ</p>
                <p className="text-[10px] text-gray-500 font-medium">กรุณากดปุ่มบันทึกเพื่อนำข้อมูลเข้าสู่ระบบ Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={confirmImport}
                className="flex-1 md:flex-none px-6 py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-100 hover:opacity-90 transition-all active:scale-95"
              >
                บันทึกนำเข้าข้อมูล
              </button>
              <button 
                onClick={cancelImport}
                className="px-4 py-3 bg-white text-gray-400 border border-gray-100 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-brand-calm">ประวัติการบันทึก</h3>
        {onImport && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-1.5 text-gray-400 hover:text-brand-primary transition-colors"
              >
                <Info size={16} />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 text-[10px] leading-relaxed text-gray-500">
                  <p className="font-bold text-brand-calm mb-1">หัวคอลัมน์ที่ต้องการ (Excel):</p>
                  <p className="mb-2">วันที่, จำนวนเงิน, ประเภท, หมายเหตุ</p>
                  <div className="bg-gray-50 p-2 rounded-lg space-y-1">
                    <p className="font-bold underline">รูปแบบประเภท:</p>
                    <p>- "รายวัน" สำหรับรายวัน</p>
                    <p>- "ไป-กลับ" สำหรับไป-กลับ</p>
                  </div>
                  <button 
                    onClick={downloadTemplate}
                    className="mt-3 w-full py-2 bg-brand-primary text-white rounded-lg font-bold hover:opacity-90 transition-all"
                  >
                    ดาวน์โหลดไฟล์ตัวอย่าง
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-md shadow-red-100"
            >
              <FileUp size={14} />
              Import Excel
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400">คลิกปุ่ม Import เพื่อนำเข้าข้อมูล หรือเริ่มบันทึกใหม่</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {sortedEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-brand-primary/10 transition-all group"
            >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                entry.tripType === 'round-trip' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <MapPin className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-calm">
                  {entry.tripType === 'round-trip' ? 'ไป-กลับ' : 'รายวัน'}
                </p>
                <p className="text-[10px] text-gray-400">{formatDate(entry.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <p className={`font-black ${
                entry.tripType === 'round-trip' ? 'text-orange-600' : 'text-blue-600'
              }`}>{formatCurrency(entry.amount)}</p>
              
              <button
                onClick={() => onDelete(entry.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      )}
    </div>
  );
}
