import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { PaymentRecord, FeeItem, COLLEGE_CONFIG } from '../../types';
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
} from 'lucide-react';

export const BursarDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>(StorageService.getPayments());
  const [fees, setFees] = useState<FeeItem[]>(StorageService.getFees());
  const [searchPayment, setSearchPayment] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // New Manual Payment State
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payerMatric, setPayerMatric] = useState('LCNS/2026/ND/014');
  const [payerName, setPayerName] = useState('Deborah Vershima');
  const [payerFeeType, setPayerFeeType] = useState('Tuition & Academic Training Fee (First Semester)');
  const [payerAmount, setPayerAmount] = useState<number>(185000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('Remita / Card');

  const filteredPayments = payments.filter((p) => {
    return (
      p.matricOrFormNo.toLowerCase().includes(searchPayment.toLowerCase()) ||
      p.payerName.toLowerCase().includes(searchPayment.toLowerCase()) ||
      p.rrr.toLowerCase().includes(searchPayment.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchPayment.toLowerCase())
    );
  });

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

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

  const handlePrintReceipt = () => {
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
              Revenue Reconciliation, Remita Verification &amp; Official Receipts
            </p>
          </div>
          <button
            onClick={() => setShowAddPayment(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Official Receipt</span>
          </button>
        </div>

        {/* Revenue Counters */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-emerald-300 block text-[10px] font-bold uppercase">Total Revenue Collected</span>
            <span className="text-xl font-black text-amber-400 font-mono-code">
              ₦{totalCollected.toLocaleString()}
            </span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-blue-300 block text-[10px] font-bold uppercase">Verified Transactions</span>
            <span className="text-xl font-black text-white font-mono-code">
              {payments.filter((p) => p.status === 'PAID').length} Records
            </span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-amber-300 block text-[10px] font-bold uppercase">Payment Gateway</span>
            <span className="text-sm font-bold text-emerald-200 block">Remita / Direct Central Bank</span>
          </div>
        </div>
      </div>

      {/* PAYMENTS SEARCH & LIST */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchPayment}
              onChange={(e) => setSearchPayment(e.target.value)}
              placeholder="Search by RRR, Receipt No, Matric, Name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
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
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 ml-auto"
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

      {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Official Payment Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1"
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
              {/* Header */}
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

              {/* Receipt details */}
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
                  <span>{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Fee Item:</span>
                  <span className="font-bold text-emerald-950 text-xs">{selectedReceipt.feeType}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Total Amount Paid:</span>
                  <span className="text-lg font-black text-emerald-900 font-mono-code">
                    ₦{selectedReceipt.amount.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* Signatures & Stamp */}
              <div className="pt-4 flex justify-between items-end">
                <div>
                  <div className="w-32 border-b border-slate-700 mb-1 font-serif font-bold text-emerald-900 text-xs">
                    Simon T. Tyavyar
                  </div>
                  <p className="font-bold text-slate-900 text-[11px]">Mr. Simon T. Tyavyar (FCA)</p>
                  <p className="text-[10px] text-slate-500">College Bursar / Authorized Signatory</p>
                </div>

                <div className="w-20 h-20 border-2 border-emerald-900 rounded-full flex flex-col items-center justify-center p-1 text-[8px] font-black text-emerald-900 uppercase text-center">
                  <span>BURSARY</span>
                  <span className="text-red-700 font-bold">PAID</span>
                  <span>LCNS GBOKO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD MANUAL PAYMENT MODAL */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
              Record Student Payment &amp; Issue Receipt
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Matric / Form No *</label>
                <input
                  type="text"
                  required
                  value={payerMatric}
                  onChange={(e) => setPayerMatric(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payer Full Name *</label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Category *</label>
                <select
                  value={payerFeeType}
                  onChange={(e) => setPayerFeeType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="Tuition & Academic Training Fee (First Semester)">Tuition Fee (₦185,000)</option>
                  <option value="Provisional Acceptance Fee">Acceptance Fee (₦25,000)</option>
                  <option value="Clinical Simulation & Skills Laboratory Fee">Clinical Simulation Lab (₦25,000)</option>
                  <option value="Hospital Clinical Postings & Transportation Levy">Hospital Postings (₦20,000)</option>
                  <option value="NMCN Nursing Council Indexing & Verification">NMCN Indexing (₦35,000)</option>
                  <option value="Campus Standard Hostel Accommodation & Utilities">Hostel (₦45,000)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount Paid (₦) *</label>
                  <input
                    type="number"
                    required
                    value={payerAmount}
                    onChange={(e) => setPayerAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Remita / Card">Remita / Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Direct Bank Branch">Bank Branch Deposit</option>
                    <option value="POS Counter">POS Counter</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-md"
                >
                  Save &amp; Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
