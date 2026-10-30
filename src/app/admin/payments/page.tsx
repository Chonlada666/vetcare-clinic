'use client';

import React, { useState, useEffect } from 'react';
import { useClinic } from '@/lib/store';
import { PaymentBill } from '@/types';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Clock,
  Printer,
  X,
  Search,
  ShieldCheck,
  Building2,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Settings,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const { bills, treatments, pets, users, verifyPayment } = useClinic();
  const [selectedBillForSlip, setSelectedBillForSlip] = useState<PaymentBill | null>(null);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<PaymentBill | null>(null);
  const [rejectModalBill, setRejectModalBill] = useState<PaymentBill | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // SlipOK API Config State
  const [slipOkStatus, setSlipOkStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [inputBranchId, setInputBranchId] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState('');

  // Fetch SlipOK connection status
  const fetchSlipOkStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/slipok/status');
      const data = await res.json();
      setSlipOkStatus(data);
    } catch (err) {
      console.error('Failed to fetch SlipOK status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchSlipOkStatus();
  }, []);

  const handleSaveSlipOkConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputApiKey.trim() || !inputBranchId.trim()) return;
    setIsSavingConfig(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/slipok/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputApiKey.trim(),
          branchId: inputBranchId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigMessage('เชื่อมต่อ SlipOK ของจริงสำเร็จเรียบร้อยแล้ว!');
        fetchSlipOkStatus();
        setTimeout(() => {
          setIsConfigModalOpen(false);
          setConfigMessage('');
          setInputApiKey('');
          setInputBranchId('');
        }, 1500);
      } else {
        setConfigMessage(data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch (err: any) {
      setConfigMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const filteredBills = bills
    .filter((b) => (filterStatus === 'all' ? true : b.status === filterStatus))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleApprove = (billId: string) => {
    verifyPayment(billId, true);
    setSelectedBillForSlip(null);
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalBill) return;
    verifyPayment(rejectModalBill.id, false, rejectReason || 'ยอดเงินไม่ตรง หรือสลิปไม่ถูกต้อง');
    setRejectModalBill(null);
    setSelectedBillForSlip(null);
    setRejectReason('');
  };

  const getStatusBadge = (status: PaymentBill['status']) => {
    switch (status) {
      case 'pending_upload':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">รอลูกค้าแนบสลิป</span>;
      case 'verifying':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">รอตรวจสอบสลิป</span>;
      case 'paid':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ชำระแล้ว (ออกใบเสร็จแล้ว)</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">ไม่ผ่านการตรวจสอบ</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            PAYMENT VERIFICATION &amp; RECEIPTS
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            ระบบตรวจสอบการชำระเงิน &amp; ออกใบเสร็จ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ตรวจสอบความถูกต้องของสลิปโอนเงิน อนุมัติยอด และออกใบเสร็จรับเงินให้แก่เจ้าของสัตว์เลี้ยง
          </p>
        </div>

        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-md transition text-xs cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>ตั้งค่าเชื่อมต่อ SlipOK ของจริง</span>
        </button>
      </div>

      {/* SlipOK API Integration Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              SLIPOK OFFICIAL API INTEGRATION
            </span>
            {slipOkStatus?.isConfigured ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                เชื่อมต่อระบบจริง (Live API Active)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                โหมด Simulation (ยังไม่ได้ใส่ API Key จริง)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            {slipOkStatus?.isConfigured
              ? `ระบบเชื่อมต่อกับ Branch ID: ${slipOkStatus.branchId} (API Key: ${slipOkStatus.maskedApiKey || '***'}) ตรวจสอบสลิปผ่านธนาคารอัตโนมัติ 100%`
              : 'สามารถคลิกปุ่ม "ตั้งค่าเชื่อมต่อ SlipOK ของจริง" เพื่อใส่ API Key และ Branch ID ได้ทันที'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchSlipOkStatus}
            disabled={isLoadingStatus}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            title="รีเฟรชสถานะ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            {slipOkStatus?.isConfigured ? 'แก้ไขการเชื่อมต่อ' : 'เชื่อมต่อ SlipOK เดี๋ยวนี้'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'verifying', label: 'รอตรวจสอบสลิป (สำคัญ)' },
          { key: 'paid', label: 'ชำระเงินเรียบร้อยแล้ว' },
          { key: 'pending_upload', label: 'รอลูกค้าแนบสลิป' },
          { key: 'rejected', label: 'ปฏิเสธ / ไม่ผ่าน' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === f.key
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payment Verification Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
              <tr>
                <th className="p-4">รหัสบิล / วันที่</th>
                <th className="p-4">ลูกค้า & สัตว์เลี้ยง</th>
                <th className="p-4 text-right">ยอดรวมค่าบริการ</th>
                <th className="p-4 text-center">หลักฐานสลิป</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBills.map((bill) => {
                const pet = pets.find((p) => p.id === bill.petId);
                const owner = users.find((u) => u.id === bill.ownerId);

                return (
                  <tr key={bill.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <strong className="font-mono text-white text-xs">#{bill.id}</strong>
                      <div className="text-[11px] text-slate-400">{bill.createdAt}</div>
                      {bill.receiptNumber && (
                        <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                          {bill.receiptNumber}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-extrabold text-white text-sm">{owner?.name || 'ลูกค้า'}</div>
                      <div className="text-xs text-slate-400">
                        สัตว์เลี้ยง: {pet?.name} ({pet?.species}) &bull; โทร: {owner?.phone}
                      </div>
                    </td>

                    <td className="p-4 text-right font-mono font-black text-sky-400 text-sm">
                      {formatCurrency(bill.totalAmount)}
                    </td>

                    <td className="p-4 text-center">
                      {bill.slipUrl ? (
                        <button
                          onClick={() => setSelectedBillForSlip(bill)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-sky-950/60 text-sky-300 hover:bg-sky-900/80 rounded-lg text-xs font-bold border border-sky-800/60 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> ดูภาพสลิป
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">ไม่มีสลิป</span>
                      )}
                    </td>

                    <td className="p-4">{getStatusBadge(bill.status)}</td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {bill.status === 'verifying' && (
                          <>
                            <button
                              onClick={() => handleApprove(bill.id)}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                            >
                              อนุมัติสลิป
                            </button>
                            <button
                              onClick={() => setRejectModalBill(bill)}
                              className="px-3 py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/60 rounded-xl font-bold text-xs transition cursor-pointer"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        )}

                        {bill.status === 'paid' && (
                          <button
                            onClick={() => setSelectedBillForReceipt(bill)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs border border-slate-700 transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ดูใบเสร็จ</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlipOK Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <button
            type="button"
            aria-label="ปิดหน้าต่างตั้งค่า SlipOK"
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm -z-10 cursor-default"
            onClick={() => setIsConfigModalOpen(false)}
          />
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-800 my-8 text-white relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">ตั้งค่าเชื่อมต่อ SlipOK ของจริง</h3>
                  <p className="text-[11px] text-slate-400">ระบุ API Key และ Branch ID ที่ได้จาก SlipOK.com</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {configMessage && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold border ${configMessage.includes('สำเร็จ') ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300' : 'bg-rose-950/50 border-rose-800/50 text-rose-300'}`}>
                {configMessage}
              </div>
            )}

            <form onSubmit={handleSaveSlipOkConfig} className="space-y-4 text-xs">
              <div className="p-3.5 bg-sky-950/40 border border-sky-800/50 rounded-2xl text-sky-200 space-y-1">
                <strong className="block text-white text-xs">วิธีรับ API Key และ Branch ID จาก SlipOK:</strong>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300">
                  <li>ไปที่เว็บไซต์ <a href="https://slipok.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-bold">slipok.com</a> แล้วล็อกอินเข้าสู่ระบบ</li>
                  <li>สร้างหรือเลือกสาขา (Branch) ที่ต้องการ</li>
                  <li>คัดลอก <strong>Branch ID</strong> และ <strong>API Key (x-authorization)</strong> มาวางในช่องด้านล่าง</li>
                </ol>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">SlipOK Branch ID (รหัสสาขา) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 12345 หรือ branch_abc"
                  value={inputBranchId}
                  onChange={(e) => setInputBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">SlipOK API Key (x-authorization) *</label>
                <input
                  type="password"
                  required
                  placeholder="SLIPOK_XXXXX"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingConfig ? 'กำลังบันทึก...' : 'บันทึก & เชื่อมต่อ SlipOK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Preview & Quick Action Modal */}
      {selectedBillForSlip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl my-8 border border-slate-800 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base">ตรวจสอบหลักฐานการโอนเงิน (สลิป)</h3>
              <button onClick={() => setSelectedBillForSlip(null)} className="text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">ยอดเงินที่ต้องชำระ:</span>
                <span className="text-lg font-black text-sky-400 font-mono">
                  {formatCurrency(selectedBillForSlip.totalAmount)}
                </span>
              </div>

              {selectedBillForSlip.slipUrl && (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src={selectedBillForSlip.slipUrl}
                    alt="Payment Slip"
                    className="w-full max-h-80 object-contain mx-auto"
                  />
                </div>
              )}

              {selectedBillForSlip.status === 'verifying' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setRejectModalBill(selectedBillForSlip)}
                    className="flex-1 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/60 font-bold rounded-xl transition cursor-pointer"
                  >
                    ปฏิเสธสลิป
                  </button>
                  <button
                    onClick={() => handleApprove(selectedBillForSlip.id)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    อนุมัติ & ออกใบเสร็จ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalBill && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-xs text-white">
            <h3 className="font-black text-white text-base">ระบุเหตุผลที่ปฏิเสธสลิป</h3>
            <form onSubmit={handleRejectConfirm} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">เหตุผลที่ปฏิเสธ *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="เช่น ยอดเงินในสลิปไม่ตรงกับยอดบิล, สลิปซ้ำ หรือภาพไม่ชัดเจน..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalBill(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md">
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal for Admin */}
      {selectedBillForReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-slate-800 my-8 text-white print:bg-white print:border-none print:shadow-none print:p-0 print:my-0 print:text-black">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-sky-400 font-black text-lg">
                <ShieldCheck className="w-6 h-6" />
                ใบเสร็จรับเงินคลินิก (Official Receipt)
              </div>
              <button onClick={() => setSelectedBillForReceipt(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="receipt-print-area space-y-5 text-xs text-black border border-black p-6 rounded-2xl bg-white shadow-inner">
              <div className="flex justify-between items-start border-b border-black pb-4 text-black">
                <div>
                  <h3 className="font-extrabold text-black text-base">VetCare Animal Clinic</h3>
                  <p className="text-black">123 ถนนสุขุมวิท 71 แขวงพระโขนงเหนือ เขตวัฒนา กทม. 10110</p>
                  <p className="text-black">เลขประจำตัวผู้เสียภาษี: 0105565012345 &bull; โทร 02-999-8888</p>
                </div>
                <div className="text-right text-black">
                  <div className="font-bold text-black text-sm font-mono">{selectedBillForReceipt.receiptNumber}</div>
                  <div className="text-[11px] text-black">วันที่: {selectedBillForReceipt.paidAt || '2026-08-24'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3.5 rounded-xl border border-black text-black">
                <div className="text-black">ลูกค้า: <strong className="text-black">{users.find((u) => u.id === selectedBillForReceipt.ownerId)?.name}</strong></div>
                <div className="text-black">สัตว์เลี้ยง: <strong className="text-black">{pets.find((p) => p.id === selectedBillForReceipt.petId)?.name}</strong></div>
                <div className="text-black">สถานะ: <strong className="text-black font-bold">ชำระเงินเรียบร้อยแล้ว</strong></div>
                <div className="text-black">เจ้าหน้าที่ผู้อนุมัติ: <strong className="text-black">Admin Officer</strong></div>
              </div>

              <table className="w-full text-left text-xs text-black">
                <thead>
                  <tr className="border-b border-black text-black">
                    <th className="pb-2 text-black font-bold">รายการ</th>
                    <th className="pb-2 text-right text-black font-bold">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30 text-black">
                  {treatments
                    .find((t) => t.id === selectedBillForReceipt.treatmentRecordId)
                    ?.prescriptions.map((rx, i) => (
                      <tr key={i} className="py-2 text-black">
                        <td className="py-2 text-black">{rx.name} ({rx.quantity} {rx.unit})</td>
                        <td className="py-2 text-right font-mono text-black">{formatCurrency(rx.totalPrice)}</td>
                      </tr>
                    ))}
                  <tr className="text-black">
                    <td className="py-2 text-black">ค่าบริการตรวจรักษาทางการแพทย์</td>
                    <td className="py-2 text-right font-mono text-black">
                      {formatCurrency(
                        treatments.find((t) => t.id === selectedBillForReceipt.treatmentRecordId)?.serviceFee || 0
                      )}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold text-sm text-black">
                    <td className="pt-3 text-black">ยอดรวมทั้งสิ้น (Net Total):</td>
                    <td className="pt-3 text-right font-mono text-black font-black">
                      {formatCurrency(selectedBillForReceipt.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> สั่งพิมพ์ใบเสร็จ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
