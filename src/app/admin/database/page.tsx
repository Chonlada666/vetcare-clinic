'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import {
  Database,
  Search,
  FolderTree,
  FileCode2,
  Table,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  CreditCard,
  Pill,
  PawPrint,
  HeartPulse,
  ClipboardList,
  Users,
  Stethoscope,
} from 'lucide-react';
import { formatThaiDate } from '@/lib/utils';

type CollectionKey =
  | 'appointments'
  | 'bills'
  | 'medicines'
  | 'pets'
  | 'services'
  | 'treatments'
  | 'users'
  | 'vets';

interface CollectionMeta {
  key: CollectionKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const COLLECTIONS: CollectionMeta[] = [
  {
    key: 'appointments',
    name: 'appointments',
    icon: Calendar,
    description: 'รายการคิวนัดหมายตรวจรักษาทั้งหมด',
    color: 'text-sky-500 bg-sky-50 border-sky-200',
  },
  {
    key: 'bills',
    name: 'bills',
    icon: CreditCard,
    description: 'บิลค่ารักษา การเงิน และสลิปโอน',
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
  {
    key: 'medicines',
    name: 'medicines',
    icon: Pill,
    description: 'คลังยาและเวชภัณฑ์ (8 ชนิด)',
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    key: 'pets',
    name: 'pets',
    icon: PawPrint,
    description: 'ทะเบียนประวัติสัตว์เลี้ยงทั้งหมด',
    color: 'text-pink-500 bg-pink-50 border-pink-200',
  },
  {
    key: 'services',
    name: 'services',
    icon: HeartPulse,
    description: 'อัตราค่าบริการและหัตถการ (9 บริการ)',
    color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  },
  {
    key: 'treatments',
    name: 'treatments',
    icon: ClipboardList,
    description: 'เวชระเบียนประวัติการรักษา (EMR)',
    color: 'text-violet-500 bg-violet-50 border-violet-200',
  },
  {
    key: 'users',
    name: 'users',
    icon: Users,
    description: 'บัญชีลูกค้าและเจ้าของสัตว์เลี้ยง',
    color: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  {
    key: 'vets',
    name: 'vets',
    icon: Stethoscope,
    description: 'สัตวแพทย์และตารางเวลาปฏิบัติงาน',
    color: 'text-teal-500 bg-teal-50 border-teal-200',
  },
];

export default function DatabaseExplorerPage() {
  const {
    appointments,
    bills,
    medicines,
    pets,
    services,
    treatments,
    users,
    vets,
    isFirestoreConnected,
    resetToMockData,
  } = useClinic();

  const [selectedCollection, setSelectedCollection] = useState<CollectionKey>('appointments');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [viewMode, setViewMode] = useState<'fields' | 'json'>('fields');
  const [copied, setCopied] = useState(false);

  // Map collection data
  const dataMap: Record<CollectionKey, any[]> = {
    appointments,
    bills,
    medicines,
    pets,
    services,
    treatments,
    users,
    vets,
  };

  const currentDocs = dataMap[selectedCollection] || [];

  // Filter docs
  const filteredDocs = currentDocs.filter((doc) => {
    if (!searchDocQuery.trim()) return true;
    const query = searchDocQuery.toLowerCase();
    const docStr = JSON.stringify(doc).toLowerCase();
    return docStr.includes(query) || (doc.id && String(doc.id).toLowerCase().includes(query));
  });

  // Selected document object
  const activeDoc =
    currentDocs.find((d) => d.id === selectedDocId) || filteredDocs[0] || currentDocs[0] || null;

  // Auto select first document when collection changes
  React.useEffect(() => {
    if (currentDocs.length > 0) {
      setSelectedDocId(currentDocs[0].id);
    } else {
      setSelectedDocId('');
    }
  }, [selectedCollection]);

  const handleCopyJson = () => {
    if (activeDoc) {
      navigator.clipboard.writeText(JSON.stringify(activeDoc, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to render type badge
  const renderTypeBadge = (val: any) => {
    if (val === null) return <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">null</span>;
    if (Array.isArray(val)) return <span className="text-[10px] text-purple-300 font-mono px-1.5 py-0.5 bg-purple-950/60 border border-purple-800/40 rounded">array ({val.length})</span>;
    if (typeof val === 'number') return <span className="text-[10px] text-sky-300 font-mono px-1.5 py-0.5 bg-sky-950/60 border border-sky-800/40 rounded">number</span>;
    if (typeof val === 'boolean') return <span className="text-[10px] text-amber-300 font-mono px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/40 rounded">boolean</span>;
    if (typeof val === 'object') return <span className="text-[10px] text-indigo-300 font-mono px-1.5 py-0.5 bg-indigo-950/60 border border-indigo-800/40 rounded">map</span>;
    return <span className="text-[10px] text-emerald-300 font-mono px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-800/40 rounded">string</span>;
  };

  return (
    <div className="space-y-6 text-white pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            GOOGLE CLOUD FIRESTORE DATABASE EXPLORER
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            ฐานข้อมูลคลาวด์สด (Live Database)
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            โปรเจกต์: <code className="text-sky-300 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">it-project-c699e</code> &bull; ซิงค์ข้อมูล Real-Time โดยตรง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-2 rounded-md text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>สถานะ: เชื่อมต่อ Real-Time</span>
          </span>
          <button
            onClick={() => {
              if (confirm('ต้องการซิงค์ข้อมูลและรีเซ็ตฐานข้อมูลเป็นค่ามาตรฐานหรือไม่?')) {
                resetToMockData();
              }
            }}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-md border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>รีเฟรชฐานข้อมูล</span>
          </button>
        </div>
      </div>

      {/* 3-Column Firestore Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden min-h-[620px]">
        {/* Column 1: Collections List (3 Cols) */}
        <div className="lg:col-span-3 border-r border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-sky-400" />
              Collections (8)
            </h3>
          </div>

          <div className="space-y-1.5">
            {COLLECTIONS.map((c) => {
              const Icon = c.icon;
              const count = dataMap[c.key]?.length || 0;
              const isSelected = selectedCollection === c.key;

              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCollection(c.key)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-black'
                      : 'hover:bg-slate-800 text-slate-300 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : 'text-sky-400'}`} />
                    <span className="text-xs truncate">{c.name}</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Documents List (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 p-4 space-y-4 flex flex-col bg-slate-900/50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Documents ({filteredDocs.length})
            </h3>
          </div>

          {/* Search Documents */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหา ID หรือข้อมูล..."
              value={searchDocQuery}
              onChange={(e) => setSearchDocQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Document ID List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[480px] flex-1 pr-1">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                // Determine preview title
                const title =
                  doc.name ||
                  doc.petName ||
                  doc.symptoms ||
                  doc.receiptNumber ||
                  (doc.timeSlot ? `${doc.date} (${doc.timeSlot})` : doc.id);

                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full p-3 rounded-2xl text-left transition border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-sky-500/60 text-white font-bold shadow-xs ring-1 ring-sky-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <code className="text-xs font-bold text-sky-400 font-mono truncate">{doc.id}</code>
                      {doc.status && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.status}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{title}</p>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                ไม่พบข้อมูล Document
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Document Fields & JSON Inspector (5 Cols) */}
        <div className="lg:col-span-5 p-5 space-y-4 flex flex-col bg-slate-950/40">
          {activeDoc ? (
            <>
              {/* Doc Inspector Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Document Path</span>
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1 mt-0.5">
                    <span className="text-sky-400">{selectedCollection}</span> /{' '}
                    <span className="text-indigo-400">{activeDoc.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'fields' ? 'json' : 'fields')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    {viewMode === 'fields' ? <FileCode2 className="w-3.5 h-3.5 text-purple-400" /> : <Table className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{viewMode === 'fields' ? 'ดู Raw JSON' : 'ดูแบบตารางฟิลด์'}</span>
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    title="คัดลอก JSON"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* View Mode 1: Fields Tree */}
              {viewMode === 'fields' ? (
                <div className="space-y-2 overflow-y-auto max-h-[480px] flex-1 pr-1">
                  {Object.entries(activeDoc).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{key}</span>
                        {renderTypeBadge(val)}
                      </div>
                      <div className="text-xs text-slate-300 font-mono break-all pt-0.5">
                        {typeof val === 'object' && val !== null ? (
                          <pre className="text-[11px] bg-slate-900 border border-slate-800 text-emerald-400 p-2.5 rounded-xl overflow-x-auto">
                            {JSON.stringify(val, null, 2)}
                          </pre>
                        ) : typeof val === 'boolean' ? (
                          <span className={val ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {String(val)}
                          </span>
                        ) : (
                          <span>{String(val)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* View Mode 2: Raw JSON Editor View */
                <div className="flex-1 overflow-hidden flex flex-col">
                  <pre className="flex-1 p-4 bg-slate-950 text-emerald-400 rounded-2xl text-xs font-mono overflow-auto leading-relaxed border border-slate-800 shadow-inner">
                    {JSON.stringify(activeDoc, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              กรุณาเลือก Document เพื่อดูข้อมูลฟิลด์
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
