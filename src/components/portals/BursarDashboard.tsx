import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { PaymentRecord, FeeItem, Applicant, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Printer,
  TrendingUp,
  Download,
  Filter,
  Receipt,
  Clock,
  Plus,
  Users,
  Check,
  X,
  FileText,
  ShieldCheck,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';

export const BursarDashboard: React.FC = () => {
  const [bursarTab, setBursarTab] = useState<'payments' | 'applicants'>('applicants');
  const [payments, setPayments] = useState<PaymentRecord[]>(StorageService.getPayments());
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());
  const [searchPayment, setSearchPayment] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Applicant Clearance State
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<'ALL' | 'PENDING_BURSAR' | 'BURSAR_CLEARED' | 'REJECTED'>('PENDING_BURSAR');
  const [viewingProofApplicant, setViewingProofApplicant] = useState<Applicant | null>(null);
  const [rejectingApplicant, setRejectingApplicant] = useState<Applicant | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedClearedSlipApplicant, setSelectedClearedSlipApplicant] = useState<Applicant | null>(null);

  // New Manual Payment State
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payerMatric, setPayerMatric] = useState('LCNS/2026/ND/014');
  const [payerName, setPayerName] = useState('Deborah Vershima');
  const [payerFeeType, setPayerFeeType] = useState('Tuition & Academic Training Fee (First Semester)');
  const [payerAmount, setPayerAmount] = useState<number>(185000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('Remita / Card');

  useEffect(() => {
    const handleStorageUpdate = () => {
      setPayments(StorageService.getPayments());
      setApplicants(StorageService.getApplicants());
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, []);

  const pendingApplicantsCount = applicants.filter(
    (a) => a.status === 'PENDING_BURSAR' || a.bursarStatus === 'PENDING_BURSAR'
  ).length;

  const filteredPayments = payments.filter((p) => {
    return (
      p.matricOrFormNo.toLowerCase().includes(searchPayment.toLowerCase()) ||
      p.payerName.toLowerCase().includes(searchPayment.toLowerCase()) ||
      p.rrr.toLowerCase().includes(searchPayment.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchPayment.toLowerCase())
    );
  });

  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.formNo.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.phone.toLowerCase().includes(applicantSearch.toLowerCase());

    const isPending = a.status === 'PENDING_BURSAR' || a.bursarStatus === 'PENDING_BURSAR';
    const isCleared = a.status === 'BURSAR_CLEARED' || a.bursarStatus === 'CLEARED';
    const isRejected = a.status === 'REJECTED' || a.bursarStatus === 'REJECTED';

    let matchesStatus = true;
    if (applicantStatusFilter === 'PENDING_BURSAR') {
      matchesStatus = isPending;
    } else if (applicantStatusFilter === 'BURSAR_CLEARED') {
      matchesStatus = isCleared;
    } else if (applicantStatusFilter === 'REJECTED') {
      matchesStatus = isRejected;
    }

    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

  // Clearance Actions
  const handleClearApplicant = (applicantId: string) => {
    const updated = StorageService.clearApplicantByBursar(
      applicantId,
      'Bank payment proof audited, matched with ledger and cleared.'
    );
    setApplicants(updated);
  };

  const handleOpenReject = (applicant: Applicant) => {
    setRejectingApplicant(applicant);
    setRejectionReason('Payment receipt unreadable or incomplete bank transaction reference.');
  };

  const handleConfirmReject = () => {
    if (!rejectingApplicant || !rejectionReason.trim()) return;
    const updated = StorageService.rejectApplicantByBursar(
      rejectingApplicant.id,
      rejectionReason.trim()
    );
    setApplicants(updated);
    setRejectingApplicant(null);
    setRejectionReason('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const receiptNo = `LCNS-REC-2026-${String(payments.length + 1).padStart(3, '0')}`;
    const rrr = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentRecord = {
      id: 'pay-' + Date.now(),
      receiptNo,
      rrr,
      matricOrFormNo: payerMatric,
      payerName,
      feeType: payerFeeType,
      amount: payerAmount,
      session: COLLEGE_CONFIG.CURRENT_SESSION,
      semester: 'First',
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      paymentMethod,
      status: 'PAID',
      verifiedBy: 'Mr. Simon T. Tyavyar (Bursar)',
    };

    const updated = [newPayment, ...payments];
    StorageService.savePayments(updated);
    setPayments(updated);
    StorageService.logAction(
      'bursar@lcns.edu.ng',
      'BURSAR',
      'RECORD_PAYMENT',
      `Issued receipt ${receiptNo} (RRR: ${rrr}) for ${payerName} - ₦${payerAmount.toLocaleString()}`
    );

    setShowAddPayment(false);
    setSelectedReceipt(newPayment);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Bursary &amp; Accounts Department &bull; College Bursar
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Mr. Simon T. Tyavyar (FCA)
            </h1>
            <p className="text-xs text-emerald-200">
              Revenue Reconciliation, Remita Verification, Applicant Clearance &amp; Official Receipts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddPayment(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Official Receipt</span>
            </button>
          </div>
        </div>

        {/* Revenue & Clearance Counters */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-emerald-300 block text-[10px] font-bold uppercase">Total Revenue Collected</span>
            <span className="text-xl font-black text-amber-400 font-mono-code">
              ₦{totalCollected.toLocaleString()}
            </span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-amber-300 block text-[10px] font-bold uppercase">Pending Applicant Clearance</span>
            <span className="text-xl font-black text-amber-300 font-mono-code">
              {pendingApplicantsCount} Awaiting Audit
            </span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-blue-300 block text-[10px] font-bold uppercase">Verified Transactions</span>
            <span className="text-xl font-black text-white font-mono-code">
              {payments.filter((p) => p.status === 'PAID').length} Payments Logged
            </span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button
          onClick={() => setBursarTab('applicants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            bursarTab === 'applicants'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Applicant Payment Clearance (/bursar/applicants)</span>
          {pendingApplicantsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {pendingApplicantsCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setBursarTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            bursarTab === 'payments'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Revenue &amp; Student Fee Payments Register</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white font-bold">
            {payments.length}
          </span>
        </button>
      </div>

      {/* TAB 1: APPLICANT PAYMENT CLEARANCE */}
      {bursarTab === 'applicants' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                placeholder="Search applicant name, form no, phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={applicantStatusFilter}
                onChange={(e) => setApplicantStatusFilter(e.target.value as any)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="PENDING_BURSAR">Pending Bursar Clearance ({pendingApplicantsCount})</option>
                <option value="BURSAR_CLEARED">Bursar Cleared</option>
                <option value="REJECTED">Bursar Rejected</option>
                <option value="ALL">All Applicants ({applicants.length})</option>
              </select>
            </div>
          </div>

          {/* APPLICANT CARDS / TABLE */}
          {filteredApplicants.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-bold text-xs">No applicants matching this clearance filter.</p>
              <p className="text-[11px] text-slate-400">All applications under this category have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase tracking-wider border-b border-emerald-200">
                  <tr>
                    <th className="p-3">Applicant Photo &amp; Name</th>
                    <th className="p-3">Application Number</th>
                    <th className="p-3">Course Choice 1 &amp; 2</th>
                    <th className="p-3">Proof of Bank Payment</th>
                    <th className="p-3">Clearance Status</th>
                    <th className="p-3 text-right">Bursar Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplicants.map((app) => {
                    const isPending =
                      app.status === 'PENDING_BURSAR' || app.bursarStatus === 'PENDING_BURSAR';
                    const isCleared =
                      app.status === 'BURSAR_CLEARED' ||
                      app.status === 'ADMITTED' ||
                      app.bursarStatus === 'CLEARED';
                    const isRejected =
                      app.status === 'REJECTED' || app.bursarStatus === 'REJECTED';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        {/* Photo & Name */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                              {app.passportPhotoUrl ? (
                                <img
                                  src={app.passportPhotoUrl}
                                  alt={app.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 uppercase block">{app.fullName}</span>
                              <span className="text-[11px] text-slate-500">{app.email} &bull; {app.phone}</span>
                              <span className="text-[10px] text-slate-400 block">{app.stateOfOrigin} / {app.lga}</span>
                            </div>
                          </div>
                        </td>

                        {/* App Number */}
                        <td className="p-3">
                          <span className="font-mono-code font-bold text-[#0a4d2e] block text-xs">{app.formNo}</span>
                          <span className="text-[10px] text-slate-500 font-mono-code">JAMB: {app.jambRegNo} ({app.jambScore})</span>
                        </td>

                        {/* Course Choice */}
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block text-xs">
                            1: {app.courseChoice1 || app.program}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            2: {app.courseChoice2 || 'HND Nursing Sciences'}
                          </span>
                        </td>

                        {/* Payment Document */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setViewingProofApplicant(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0a4d2e] border border-emerald-300 rounded-xl font-bold text-[11px] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-700" />
                            <span>View Bank PDF Receipt</span>
                          </button>
                        </td>

                        {/* Clearance Status */}
                        <td className="p-3">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>PENDING BURSAR</span>
                            </span>
                          )}
                          {isCleared && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                              <ShieldCheck className="w-3 h-3 text-[#22c55e]" />
                              <span>BURSAR CLEARED</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-900 text-[10px] font-black uppercase tracking-wider">
                              <X className="w-3 h-3 text-red-700" />
                              <span>REJECTED</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleClearApplicant(app.id)}
                                  className="px-3 py-1.5 bg-[#0a4d2e] hover:bg-[#06321e] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>CLEAR</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReject(app)}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>REJECT</span>
                                </button>
                              </>
                            )}

                            {isCleared && (
                              <button
                                type="button"
                                onClick={() => setSelectedClearedSlipApplicant(app)}
                                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-300" />
                                <span>Official Cleared Slip</span>
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
          )}
        </div>
      )}

      {/* TAB 2: REVENUE & STUDENT PAYMENTS REGISTER */}
      {bursarTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchPayment}
                onChange={(e) => setSearchPayment(e.target.value)}
                placeholder="Search by RRR, Receipt No, Matric, Name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Receipt / RRR</th>
                  <th className="p-3">Payer &amp; Matric No</th>
                  <th className="p-3">Fee Description</th>
                  <th className="p-3 text-right">Amount (₦)</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-mono-code font-bold text-emerald-900 block">{p.receiptNo}</span>
                      <span className="text-[10px] text-slate-500 font-mono-code">RRR: {p.rrr}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 uppercase block">{p.payerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono-code">{p.matricOrFormNo}</span>
                    </td>
                    <td className="p-3 text-slate-700">{p.feeType}</td>
                    <td className="p-3 font-mono-code font-bold text-emerald-900 text-right text-sm">
                      ₦{p.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{p.paymentMethod}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> PAID
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-3 py-1 bg-[#0a4d2e] hover:bg-[#06321e] text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 ml-auto"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW PROOF OF PAYMENT MODAL */}
      {viewingProofApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold uppercase font-serif-crest text-sm">Proof of Bank Payment</h3>
                <p className="text-xs text-emerald-300">
                  {viewingProofApplicant.fullName} &bull; {viewingProofApplicant.formNo}
                </p>
              </div>
              <button
                onClick={() => setViewingProofApplicant(null)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Document Name:</span>
                  <span className="font-mono-code font-bold text-slate-900">
                    {viewingProofApplicant.paymentReceiptName || 'Proof_of_Payment.pdf'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Applicant Email:</span>
                  <span className="text-slate-900">{viewingProofApplicant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Phone Number:</span>
                  <span className="text-slate-900">{viewingProofApplicant.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Current Status:</span>
                  <span className="font-bold uppercase text-[#0a4d2e]">{viewingProofApplicant.status}</span>
                </div>
              </div>

              {/* Document Preview Box */}
              <div className="border-2 border-dashed border-[#0a4d2e]/40 rounded-2xl p-4 bg-emerald-50/40 text-center space-y-3">
                {viewingProofApplicant.paymentReceiptPdfUrl?.startsWith('data:image/') ? (
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 shadow-xs">
                    <img
                      src={viewingProofApplicant.paymentReceiptPdfUrl}
                      alt="Payment Receipt"
                      className="w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="py-6 space-y-2">
                    <FileText className="w-12 h-12 text-[#0a4d2e] mx-auto" />
                    <p className="text-xs font-bold text-slate-800">
                      Official Bank Payment Voucher (Attached)
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Remita RRR Electronic Transaction Slip / Bank Branch Deposit Teller Receipt.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClearApplicant(viewingProofApplicant.id);
                    setViewingProofApplicant(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#0a4d2e] hover:bg-[#06321e] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>CLEAR PAYMENT &amp; APPROVE</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingProofApplicant;
                    setViewingProofApplicant(null);
                    handleOpenReject(target);
                  }}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all"
                >
                  REJECT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">Reject Payment Clearance</h3>
                <p className="text-xs text-slate-500">
                  {rejectingApplicant.fullName} ({rejectingApplicant.formNo})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                placeholder="State why the payment was rejected..."
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectingApplicant(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL CLEARED APPLICATION SLIP MODAL */}
      {selectedClearedSlipApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="text-xs font-bold text-[#0a4d2e] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bursary Stamped Registration Slip</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3.5 py-1.5 bg-[#0a4d2e] hover:bg-[#06321e] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedClearedSlipApplicant(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Slip Template */}
            <div className="border-2 border-[#0a4d2e] rounded-xl p-6 bg-white shadow-sm print-page relative text-xs text-slate-800 space-y-4">
              <div className="text-center pb-3 border-b-2 border-[#0a4d2e]">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <CollegeLogo size="sm" />
                  <div>
                    <h2 className="text-base font-black uppercase font-serif-crest text-emerald-950">
                      Labe College of Nursing Sciences, Gboko
                    </h2>
                    <p className="text-[10px] font-bold text-[#0a4d2e] uppercase">
                      2026/2027 Admissions Screening Acknowledgement Slip
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Official Email: info@lcns.edu.ng | Support: 08126799565 ICT
                    </p>
                  </div>
                </div>
              </div>

              {/* Details + Passport Top Right */}
              <div className="grid grid-cols-3 gap-4 items-start">
                <div className="col-span-2 space-y-1.5">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Application Form No:</span>
                    <span className="font-mono-code font-bold text-[#0a4d2e] text-sm">
                      {selectedClearedSlipApplicant.formNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Candidate Full Name:</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {selectedClearedSlipApplicant.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Course Choice 1:</span>
                    <span className="font-bold text-[#0a4d2e]">
                      {selectedClearedSlipApplicant.courseChoice1 || selectedClearedSlipApplicant.program}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Course Choice 2:</span>
                    <span className="font-semibold text-slate-700">
                      {selectedClearedSlipApplicant.courseChoice2 || 'HND Nursing Sciences'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">JAMB UTME:</span>
                    <span className="font-bold">
                      {selectedClearedSlipApplicant.jambRegNo} ({selectedClearedSlipApplicant.jambScore})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Origin:</span>
                    <span>
                      {selectedClearedSlipApplicant.stateOfOrigin} / {selectedClearedSlipApplicant.lga}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-28 h-36 border-2 border-[#0a4d2e] rounded-xl overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center">
                    {selectedClearedSlipApplicant.passportPhotoUrl ? (
                      <img
                        src={selectedClearedSlipApplicant.passportPhotoUrl}
                        alt="Passport"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Official Passport</span>
                </div>
              </div>

              {/* Official Bursar Cleared Stamp */}
              <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-950">
                    BURSARY AUDIT STATUS:
                  </div>
                  <div className="text-xs font-black text-emerald-800">
                    ★ BURSAR CLEARED &bull; PAYMENT VERIFIED ★
                  </div>
                  <div className="text-[10px] text-emerald-900 font-mono-code">
                    Date: {selectedClearedSlipApplicant.bursarClearedDate || new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-emerald-950">Mr. Simon T. Tyavyar (FCA)</div>
                  <div className="text-[9px] text-emerald-700 italic">College Bursar &amp; Chief Financial Officer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Official Payment Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3 py-1.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Stamped Receipt Paper */}
            <div className="border-4 border-double border-emerald-900 p-6 rounded-xl bg-white shadow-sm print-page space-y-4 text-xs text-slate-800 relative">
              <div className="text-center pb-3 border-b-2 border-emerald-900">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <CollegeLogo size="sm" />
                  <div>
                    <h2 className="text-base font-black uppercase font-serif-crest text-emerald-950">
                      Labe College of Nursing Sciences, Gboko
                    </h2>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">
                      Bursary &amp; Accounts Department &bull; Official Payment Receipt
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Official Email: info@lcns.edu.ng | Support: 08126799565 ICT
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-b pb-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Official Receipt No:</span>
                  <span className="font-mono-code font-bold text-emerald-950 text-sm">{selectedReceipt.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Remita Retrieval Ref (RRR):</span>
                  <span className="font-mono-code font-bold text-slate-900">{selectedReceipt.rrr}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Paid By:</span>
                  <span className="font-bold text-slate-950 uppercase">{selectedReceipt.payerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Matric / Form No:</span>
                  <span className="font-mono-code font-bold text-slate-900">{selectedReceipt.matricOrFormNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Transaction Date:</span>
                  <span>{selectedReceipt.paymentDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Payment Method:</span>
                  <span className="font-semibold">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700 block">{selectedReceipt.feeType}</span>
                  <span className="text-[10px] text-slate-500">Session: {selectedReceipt.session} ({selectedReceipt.semester} Semester)</span>
                </div>
                <span className="font-mono-code font-black text-lg text-emerald-900">
                  ₦{selectedReceipt.amount.toLocaleString()}
                </span>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <span>Verified by: </span>
                  <strong className="text-slate-800">{selectedReceipt.verifiedBy}</strong>
                </div>
                <div className="text-right border-2 border-emerald-800 p-1 rounded font-mono-code text-[10px] text-emerald-900 font-bold uppercase">
                  ✓ LCNS BURSARY CLEARED
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MANUAL MODAL */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase">Record Bank / Remita Payment</h3>
              <button onClick={() => setShowAddPayment(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Matric or Form No *</label>
                <input
                  type="text"
                  value={payerMatric}
                  onChange={(e) => setPayerMatric(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payer Full Name *</label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Description *</label>
                <select
                  value={payerFeeType}
                  onChange={(e) => setPayerFeeType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-medium"
                >
                  <option value="Tuition & Academic Training Fee (First Semester)">Tuition &amp; Training (1st Semester)</option>
                  <option value="Tuition & Academic Training Fee (Second Semester)">Tuition &amp; Training (2nd Semester)</option>
                  <option value="Provisional Acceptance Fee">Provisional Acceptance Fee</option>
                  <option value="Clinical Logbook & Nursing Kit Fee">Clinical Logbook &amp; Nursing Kit</option>
                  <option value="Hostel Accommodation & Utility Levy">Hostel Accommodation &amp; Utility</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₦) *</label>
                  <input
                    type="number"
                    value={payerAmount}
                    onChange={(e) => setPayerAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="Remita / Card">Remita / Card</option>
                    <option value="Bank Branch Deposit">Bank Branch Deposit</option>
                    <option value="Direct Transfer">Direct Transfer</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white font-bold rounded-xl shadow-md"
                >
                  Save &amp; Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
