import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Student, COLLEGE_CONFIG } from '../../types';
import {
  FileText,
  Search,
  Users,
  Award,
  CheckCircle2,
  Printer,
  Download,
  Filter,
  UserCheck,
} from 'lucide-react';

export const RegistrarDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<Student | null>(null);
  const [letterType, setLetterType] = useState<'attestation' | 'english' | 'indexing'>('attestation');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handlePrintLetter = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Academic Registry &bull; Office of the Registrar
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Barr. Timothy J. Iorbee
            </h1>
            <p className="text-xs text-emerald-200">
              Student Records, Matriculation Roll, and Official Attestation Unit
            </p>
          </div>
          <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800 text-center">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Total Matriculated</span>
            <span className="text-xl font-mono-code font-black text-amber-400">{students.length} Records</span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Matric No, Name or Program..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Collegiate Levels (4 Years)</option>
              <option value="ND 1">ND 1 (First Year)</option>
              <option value="ND 2">ND 2 (Second Year)</option>
              <option value="HND 1">HND 1 (Third Year)</option>
              <option value="HND 2">HND 2 (Final Year)</option>
            </select>
          </div>
        </div>

        {/* STUDENT MATRICULATION REGISTER TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase tracking-wider border-b border-emerald-200">
              <tr>
                <th className="p-3">Matriculation No</th>
                <th className="p-3">Student Full Name</th>
                <th className="p-3">Programme &amp; Level</th>
                <th className="p-3">State / LGA</th>
                <th className="p-3">Blood / Genotype</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Official Letters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.matricNo} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono-code font-bold text-emerald-900">{s.matricNo}</td>
                  <td className="p-3 font-bold text-slate-900 uppercase">{s.fullName}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800">{s.program}</span>
                    <span className="block text-[10px] text-slate-500">{s.level} &bull; {s.session}</span>
                  </td>
                  <td className="p-3 text-slate-600">{s.stateOfOrigin} ({s.lga})</td>
                  <td className="p-3 text-slate-700 font-mono-code">{s.bloodGroup} / {s.genotype}</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> Matriculated
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedStudentForLetter(s)}
                      className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-[11px] shadow-xs"
                    >
                      Issue Letter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REGISTRY LETTER MODAL */}
      {selectedStudentForLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">Select Document:</span>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value as any)}
                  className="p-1.5 border border-slate-300 rounded text-xs font-bold text-emerald-900"
                >
                  <option value="attestation">Letter of Attestation &amp; Bonafide Student</option>
                  <option value="english">English Language Proficiency</option>
                  <option value="indexing">NMCN Council Indexing Verification</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintLetter}
                  className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForLetter(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Letter Paper Template */}
            <div className="border-2 border-emerald-900 p-8 rounded-xl bg-white shadow-sm print-page space-y-4 text-xs text-slate-800">
              <div className="text-center pb-4 border-b-2 border-emerald-900">
                <h2 className="text-lg font-black uppercase font-serif-crest text-emerald-950">
                  Labe College of Nursing Sciences, Gboko
                </h2>
                <p className="text-[11px] font-bold text-emerald-800 uppercase">
                  Academic Registry &bull; P.M.B. 104, Gboko, Benue State
                </p>
                <p className="text-[10px] text-slate-500">
                  Email: info@lcns.edu.ng | Support: 08126799565 ICT | lcns.edu.ng
                </p>
                <div className="text-[10px] text-slate-500 mt-2">
                  Ref: LCNS/REG/ATTEST/{new Date().getFullYear()}/089 &bull; Date: {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="text-center font-bold text-sm uppercase underline font-serif-crest text-emerald-950 py-2">
                {letterType === 'attestation' && 'LETTER OF ATTESTATION & BONAFIDE STUDENT STATUS'}
                {letterType === 'english' && 'CERTIFICATE OF ENGLISH LANGUAGE PROFICIENCY'}
                {letterType === 'indexing' && 'NURSING & MIDWIFERY COUNCIL INDEXING CLEARANCE'}
              </div>

              <div className="space-y-3 leading-relaxed text-justify">
                <p>
                  This is to certify that <strong>{selectedStudentForLetter.fullName.toUpperCase()}</strong> with Matriculation Number <strong>{selectedStudentForLetter.matricNo}</strong> is a registered bonafide student of <strong>Labe College of Nursing Sciences, Gboko, Benue State</strong>.
                </p>
                <p>
                  The student is presently in <strong>{selectedStudentForLetter.level}</strong> pursuing the accredited programme in <strong>{selectedStudentForLetter.program}</strong> (Session: {selectedStudentForLetter.session}).
                </p>
                {letterType === 'english' && (
                  <p>
                    We further confirm that the medium of instruction, clinical lectures, medical textbooks, and examination in this college is exclusively English Language. The student exhibits high fluency in oral and written clinical communications.
                  </p>
                )}
                <p>
                  The student is of good moral conduct and has complied with all institutional regulations, clinical ethics, and matriculation oaths. This document is issued upon request for official purposes.
                </p>
              </div>

              <div className="pt-8 flex justify-between items-end">
                <div>
                  <div className="w-36 border-b border-slate-800 mb-1 font-serif-crest font-bold text-emerald-900">
                    Barr. T. J. Iorbee
                  </div>
                  <p className="font-bold text-slate-900">Barr. Timothy J. Iorbee</p>
                  <p className="text-[10px] text-slate-500">Registrar &bull; LCNS Gboko</p>
                </div>
                <div className="w-20 h-20 border border-emerald-900 rounded-full flex flex-col items-center justify-center text-[8px] font-bold text-emerald-900 uppercase text-center">
                  <span>Seal of Registry</span>
                  <span>LCNS GBOKO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
