'use client';

import React, { useState } from 'react';
import { useClinic } from '@/lib/store';
import { PaymentBill, TreatmentRecord } from '@/types';
import { formatCurrency, formatThaiDate } from '@/lib/utils';
import {
  CreditCard,
  QrCode,
  Upload,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  X,
  Printer,
  ShieldCheck,
  Building2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  Banknote,
  Pill,
  ShoppingBag,
  Zap,
} from 'lucide-react';

export default function OwnerBillingPage() {
  const { currentUser, bills, treatments, pets, uploadPaymentSlip, verifyPayment, payWithCash } = useClinic();

  // Modals state
  const [selectedBillForSlip, setSelectedBillForSlip] = useState<PaymentBill | null>(null);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<PaymentBill | null>(null);

  // Payment tab inside modal: 'promptpay' | 'cash'
  const [paymentMethodTab, setPaymentMethodTab] = useState<'promptpay' | 'cash'>('promptpay');

  // SlipOK / Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipUrl, setSlipUrl] = useState('');
  const [isVerifyingSlipOK, setIsVerifyingSlipOK] = useState(false);
  const [slipOkResult, setSlipOkResult] = useState<any>(null);
  const [isCashPaidSuccess, setIsCashPaidSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const myBills = bills
    .filter((b) => b.ownerId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Open Payment & SlipOK Modal
  const handleOpenSlipModal = (bill: PaymentBill) => {
    setSelectedBillForSlip(bill);
    setPaymentMethodTab('promptpay');
    setSlipFile(null);
    setSlipUrl('');
    setSlipOkResult(null);
    setIsCashPaidSuccess(false);
    setErrorMessage('');
  };

  // Handle Slip File Selection from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพสลิปต้องไม่เกิน 10MB');
        return;
      }
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Automated SlipOK API Verification
  const handleVerifyWithSlipOK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForSlip || !slipUrl) {
      setErrorMessage('กรุณาเลือกไฟล์สลิปโอนเงินก่อนทำการตรวจสอบ');
      return;
    }

    setIsVerifyingSlipOK(true);
    setErrorMessage('');
    setSlipOkResult(null);

    try {
      const formData = new FormData();
      if (slipFile) formData.append('file', slipFile);
      formData.append('amount', String(selectedBillForSlip.totalAmount));
      formData.append('billId', selectedBillForSlip.id);
      formData.append('slipBase64', slipUrl);

      const res = await fetch('/api/slipok/verify', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setSlipOkResult(json.data);
        uploadPaymentSlip(selectedBillForSlip.id, slipUrl);
        verifyPayment(selectedBillForSlip.id, true);
      } else {
        setErrorMessage(json.message || 'การตรวจสอบสลิปไม่ผ่าน กรุณาตรวจสอบยอดเงินหรือภาพสลิป');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ SlipOK API');
    } finally {
      setIsVerifyingSlipOK(false);
    }
  };

  // 1-Click Demo Testing Button for SlipOK Success
  const handleDemoSlipSuccess = () => {
    if (!selectedBillForSlip) return;
    const mockSlip = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';
    const mockResult = {
      transRef: `KBANK_DEMO_${Math.floor(100000 + Math.random() * 900000)}`,
      senderName: currentUser?.name || 'คุณสมชาย ใจดี',
      amount: selectedBillForSlip.totalAmount,
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setSlipUrl(mockSlip);
    setSlipOkResult(mockResult);
    setErrorMessage('');
    uploadPaymentSlip(selectedBillForSlip.id, mockSlip);
    verifyPayment(selectedBillForSlip.id, true);
  };

  // Cash payment confirmation
  const handlePayCash = () => {
    if (!selectedBillForSlip) return;
    payWithCash(selectedBillForSlip.id);
    setIsCashPaidSuccess(true);
  };

  // Fallback Manual Upload for Admin Review
  const handleManualUpload = () => {
    if (!selectedBillForSlip || !slipUrl) return;
    uploadPaymentSlip(selectedBillForSlip.id, slipUrl);
    setSelectedBillForSlip(null);
  };

  const getStatusBadge = (bill: PaymentBill) => {
    switch (bill.status) {
      case 'pending_upload':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">รอชำระเงิน</span>;
      case 'verifying':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">กำลังรอตรวจสอบ</span>;
      case 'paid':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            ✓ ชำระแล้ว ({bill.paymentMethod === 'cash' ? 'เงินสด' : 'พร้อมเพย์'})
          </span>
        );
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">สลิปไม่ผ่านการตรวจสอบ</span>;
    }
  };

  const activeTreatment = selectedBillForSlip
    ? treatments.find((t) => t.id === selectedBillForSlip.treatmentRecordId)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-sky-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            BILLING &amp; OFFICIAL RECEIPTS
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase">
            ระบบชำระเงินและใบเสร็จรับเงิน
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            เลือกชำระเงินผ่าน PromptPay สแกน QR หรือชำระด้วยเงินสดที่เคาน์เตอร์คลินิก
          </p>
        </div>
      </div>

      {/* Modern Midnight Blue Payment Information Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em]">
            PAYMENT INFORMATION
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-white tracking-wide">คลินิกรักษาสัตว์ VetCare จำกัด</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
            <div>ธนาคาร: <strong className="text-white">ธนาคารกสิกรไทย (KBANK)</strong></div>
            <div>เลขที่บัญชี: <strong className="text-sky-300 font-mono text-sm bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-md">090-8-46418-4</strong></div>
            <div>พร้อมเพย์ (PromptPay): <strong className="text-sky-300 font-mono text-sm bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-md">095-550-6741</strong></div>
            <div>ชื่อบัญชี: <strong className="text-white">VetCare Animal Clinic Co., Ltd.</strong></div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl shrink-0 text-center shadow-md border border-slate-800 flex flex-col items-center">
          <div className="w-28 h-28 bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center">
            <img
              src="https://promptpay.io/0955506741.png"
              alt="PromptPay QR Code 0955506741"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <span className="text-[10px] font-bold text-sky-400 block mt-1.5">QR พร้อมเพย์ 095-550-6741</span>
        </div>
      </div>

      {/* Bills List Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-wide">
          รายการบิลค่ารักษาพยาบาล
        </h2>

        {myBills.length > 0 ? (
          <div className="space-y-4">
            {myBills.map((bill) => {
              const tr = treatments.find((t) => t.id === bill.treatmentRecordId);
              const pet = pets.find((p) => p.id === bill.petId);

              return (
                <div
                  key={bill.id}
                  className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4 text-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">บิลเลขที่ #{bill.id}</span>
                        {getStatusBadge(bill)}
                      </div>
                      <div className="font-extrabold text-white text-base mt-1">
                        สัตว์เลี้ยง: {pet?.name} ({pet?.species})
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400">ยอดรวมทั้งสิ้น</div>
                      <div className="text-2xl font-black text-sky-400 font-mono">
                        {formatCurrency(bill.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Treatment details breakdown */}
                  {tr && (
                    <div className="bg-slate-950 rounded-xl p-4 text-xs space-y-2 border border-slate-800">
                      <div className="font-bold text-sky-400 pb-1 border-b border-slate-800">
                        รายการค่าใช้จ่าย (วันที่ตรวจ: {formatThaiDate(tr.date)})
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>ค่าตรวจและบริการทางการแพทย์:</span>
                        <span className="font-semibold text-white">{formatCurrency(tr.serviceFee)}</span>
                      </div>
                      {tr.prescriptions.map((rx, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>
                            {rx.name} ({rx.quantity} {rx.unit}):
                          </span>
                          <span className="font-semibold text-white">{formatCurrency(rx.totalPrice)}</span>
                        </div>
                      ))}
                      {bill.rejectionReason && (
                        <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg text-[11px] mt-2">
                          <strong className="text-rose-400">เหตุผลที่ไม่ผ่านการอนุมัติ:</strong> {bill.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pharmacy Pickup Banner if Paid */}
                  {bill.status === 'paid' && tr && tr.prescriptions.length > 0 && (
                    <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        <span>กรุณาติดต่อรับยาและเวชภัณฑ์ที่เคาน์เตอร์จ่ายยา (ช่องบริการที่ 1)</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                        มีรายการยา {tr.prescriptions.length} รายการ
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-slate-400">
                      สร้างเมื่อ: {bill.createdAt}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(bill.status === 'pending_upload' || bill.status === 'rejected') && (
                        <button
                          onClick={() => handleOpenSlipModal(bill)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>เลือกวิธีชำระเงิน (โอนเงิน / เงินสด)</span>
                        </button>
                      )}

                      {bill.status === 'verifying' && (
                        <span className="text-xs text-sky-300 font-bold bg-sky-950/60 px-3.5 py-2 rounded-xl border border-sky-800/50">
                          สลิปอยู่ระหว่างการตรวจสอบ
                        </span>
                      )}

                      {bill.status === 'paid' && (
                        <button
                          onClick={() => setSelectedBillForReceipt(bill)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>ดู / พิมพ์ใบเสร็จรับเงิน ({bill.receiptNumber})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">ไม่พบประวัติการชำระเงิน</h3>
            <p className="text-xs text-slate-400">คุณยังไม่มีรายการที่ต้องชำระในขณะนี้</p>
          </div>
        )}
      </div>

      {/* ================= Payment Modal (PromptPay & Cash) ================= */}
      {selectedBillForSlip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-800 my-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">ชำระเงินค่ารักษา</h3>
                  <p className="text-[11px] text-sky-400 font-semibold">บิลเลขที่ #{selectedBillForSlip.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBillForSlip(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Result (Both PromptPay and Cash) */}
            {slipOkResult || isCashPaidSuccess ? (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="font-black text-emerald-300 text-base">ชำระเงินสำเร็จเรียบร้อยแล้ว!</h4>
                  <p className="text-emerald-400 text-xs font-semibold">
                    {isCashPaidSuccess
                      ? 'บันทึกการชำระด้วยเงินสดเรียบร้อยแล้ว'
                      : 'ระบบ SlipOK ตรวจสอบสลิปผ่านเรียบร้อยแล้ว 100%'}
                  </p>
                </div>

                {/* SlipOK Details summary */}
                {slipOkResult && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-slate-300 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">รหัสอ้างอิงธนาคาร:</span>
                      <span className="font-mono font-bold text-white">{slipOkResult.transRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ผู้โอนเงิน:</span>
                      <span className="font-semibold text-white">{slipOkResult.senderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ยอดเงินที่ตรวจสอบ:</span>
                      <span className="font-mono font-bold text-emerald-400">{formatCurrency(slipOkResult.amount)}</span>
                    </div>
                  </div>
                )}

                {/* Important Medicine Pickup Box */}
                <div className="p-4 bg-sky-950/50 border border-sky-800/60 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-black text-sm">
                    <Pill className="w-5 h-5 text-sky-400 shrink-0" />
                    <span>กรุณาติดต่อรับยาที่เคาน์เตอร์จ่ายยา</span>
                  </div>
                  <p className="text-sky-200 text-xs leading-relaxed">
                    ขั้นตอนต่อไป: กรุณาติดต่อรับยาและคำแนะนำการใช้ยาจากเภสัชกร/สัตวแพทย์ที่ <strong>เคาน์เตอร์จ่ายยา (ช่องบริการที่ 1)</strong>
                  </p>
                  {activeTreatment && activeTreatment.prescriptions.length > 0 && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <div className="font-bold text-sky-300 border-b border-slate-800 pb-1">รายการยาที่ต้องรับ ({activeTreatment.prescriptions.length} รายการ):</div>
                      {activeTreatment.prescriptions.map((rx, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>&bull; {rx.name}</span>
                          <span className="font-bold text-white">{rx.quantity} {rx.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const b = bills.find((item) => item.id === selectedBillForSlip.id) || selectedBillForSlip;
                    setSelectedBillForSlip(null);
                    setSelectedBillForReceipt(b);
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>ดู / พิมพ์ใบเสร็จรับเงิน</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Total amount summary */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <div className="text-slate-400 font-semibold">ยอดรวมที่ต้องชำระ</div>
                  <div className="text-3xl font-black text-sky-400 font-mono">
                    {formatCurrency(selectedBillForSlip.totalAmount)}
                  </div>
                </div>

                {/* Payment Method Switcher Tabs */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">เลือกช่องทางการชำระเงิน:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab('promptpay')}
                      className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        paymentMethodTab === 'promptpay'
                          ? 'bg-sky-500 text-slate-950 border-sky-500 font-black shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>โอนเงิน / พร้อมเพย์</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab('cash')}
                      className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        paymentMethodTab === 'cash'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span>ชำระด้วยเงินสด</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: PromptPay / QR Bank Transfer */}
                {paymentMethodTab === 'promptpay' && (
                  <form onSubmit={handleVerifyWithSlipOK} className="space-y-4 pt-1">
                    {/* PromptPay QR Code Card */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3 shadow-inner">
                      <div className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>สแกน QR เพื่อชำระเงินผ่าน Mobile Banking</span>
                      </div>

                      {/* Official PromptPay QR Code with amount */}
                      <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-sky-400/40 inline-block">
                        <img
                          src={`https://promptpay.io/0955506741/${selectedBillForSlip.totalAmount}.png`}
                          alt={`PromptPay QR ฿${selectedBillForSlip.totalAmount}`}
                          className="w-44 h-44 object-contain rounded-lg mx-auto"
                        />
                        <div className="text-[10px] font-black text-slate-800 mt-1 uppercase tracking-wider">
                          Thai QR Payment &bull; PromptPay
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-slate-300">
                        <div>ยอดชำระ: <strong className="text-sky-400 font-mono text-base font-black">{formatCurrency(selectedBillForSlip.totalAmount)}</strong></div>
                        <div>ชื่อบัญชี: <strong className="text-white">VetCare Animal Clinic Co., Ltd.</strong></div>
                        <div>พร้อมเพย์: <strong className="text-sky-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">095-550-6741</strong></div>
                        <div>หรือโอนเข้า: <strong className="text-slate-200 font-mono">ธ.กสิกรไทย 090-8-46418-4</strong></div>
                      </div>
                    </div>

                    {/* File picker */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">
                        เลือกรูปภาพสลิปโอนเงินจากเครื่อง *
                      </label>
                      <div className="p-4 bg-slate-950 border border-dashed border-slate-700 rounded-2xl text-center space-y-3">
                        {slipUrl ? (
                          <div className="space-y-2">
                            <img
                              src={slipUrl}
                              alt="Slip Preview"
                              className="max-h-40 rounded-xl mx-auto object-contain shadow-md border border-slate-800"
                            />
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-bold text-[11px] cursor-pointer hover:bg-slate-700">
                              <Upload className="w-3.5 h-3.5 text-sky-400" /> เปลี่ยนรูปภาพสลิป
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center cursor-pointer p-3 hover:bg-slate-850 rounded-xl transition">
                            <Upload className="w-7 h-7 text-sky-400 mb-1.5" />
                            <span className="font-bold text-sky-300 text-xs">คลิกเพื่อเลือกไฟล์รูปภาพสลิป</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">รองรับไฟล์ JPG, PNG, WEBP</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Submit button with SlipOK Auto Verify */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <button
                        type="submit"
                        disabled={isVerifyingSlipOK || !slipUrl}
                        className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 text-xs transition cursor-pointer"
                      >
                        {isVerifyingSlipOK ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>กำลังตรวจสอบสลิป...</span>
                          </>
                        ) : (
                          <span>ตรวจสอบสลิปและยืนยันการชำระเงิน</span>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedBillForSlip(null)}
                          className="hover:underline text-slate-400 cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={handleManualUpload}
                          disabled={!slipUrl}
                          className="text-sky-400 hover:underline disabled:text-slate-600 cursor-pointer font-bold"
                        >
                          ส่งให้เจ้าหน้าที่ตรวจสอบ
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Tab 2: Cash Payment */}
                {paymentMethodTab === 'cash' && (
                  <div className="space-y-4 pt-1">
                    <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl space-y-2 text-emerald-300">
                      <div className="font-bold text-sm flex items-center gap-2 text-emerald-200">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                        <span>ชำระเงินสดที่เคาน์เตอร์คลินิก</span>
                      </div>
                      <p className="text-xs text-emerald-300/80 leading-relaxed">
                        ท่านสามารถยื่นชำระเงินสดจำนวน <strong className="text-emerald-200 font-mono">{formatCurrency(selectedBillForSlip.totalAmount)}</strong> ได้โดยตรงที่เคาน์เตอร์การเงินของคลินิก
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handlePayCash}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer"
                      >
                        <Banknote className="w-4 h-4" />
                        <span>ยืนยันการชำระเงินสด & ออกใบเสร็จ</span>
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedBillForSlip(null)}
                          className="text-[11px] text-slate-400 hover:underline cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= Printable Official Receipt Modal ================= */}
      {selectedBillForReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-slate-800 my-8 text-white print:bg-white print:border-none print:shadow-none print:p-0 print:my-0 print:text-black">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-sky-400 font-black text-lg">
                <ShieldCheck className="w-6 h-6" />
                ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
              </div>
              <button
                onClick={() => setSelectedBillForReceipt(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Content */}
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
                <div className="text-black">ชื่อลูกค้า: <strong className="text-black">{currentUser?.name}</strong></div>
                <div className="text-black">โทร: <strong className="text-black">{currentUser?.phone}</strong></div>
                <div className="text-black">สัตว์เลี้ยง: <strong className="text-black">{pets.find((p) => p.id === selectedBillForReceipt.petId)?.name}</strong></div>
                <div className="text-black">
                  วิธีการชำระ: <strong className="text-black font-bold">
                    {selectedBillForReceipt.paymentMethod === 'cash' ? 'ชำระด้วยเงินสด' : 'โอนเงินผ่านพร้อมเพย์'}
                  </strong>
                </div>
              </div>

              {/* Items Table */}
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
                    <td className="py-2 text-black">ค่าตรวจและบริการทางการแพทย์</td>
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

              {/* Pharmacy pickup instruction in receipt */}
              <div className="p-3 bg-white border border-black rounded-xl text-center text-xs text-black font-semibold space-y-0.5">
                <div className="text-black font-bold">ชำระเงินเรียบร้อยแล้ว</div>
                <div className="text-[11px] text-black">
                  กรุณานำใบเสร็จนี้ติดต่อรับยาและคำแนะนำการใช้ยาที่ <strong className="text-black">เคาน์เตอร์จ่ายยา (ช่องบริการที่ 1)</strong>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-black text-[11px] text-black">
                ขอบคุณที่ไว้วางใจให้ VetCare Clinic ดูแลสุขภาพสัตว์เลี้ยงของคุณ
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20 transition"
              >
                <Printer className="w-4 h-4" /> พิมพ์ใบเสร็จ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
