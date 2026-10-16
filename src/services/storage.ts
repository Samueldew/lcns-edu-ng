import {
  User,
  Applicant,
  Student,
  Course,
  ResultScore,
  FeeItem,
  PaymentRecord,
  Notice,
  AuditLog,
  COLLEGE_CONFIG,
  CMSConfig,
  GalleryItem,
  CBTExam,
  CBTSubmission,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'lcns_erp_users',
  APPLICANTS: 'lcns_erp_applicants',
  STUDENTS: 'lcns_erp_students',
  COURSES: 'lcns_erp_courses',
  RESULTS: 'lcns_erp_results',
  FEES: 'lcns_erp_fees',
  PAYMENTS: 'lcns_erp_payments',
  NOTICES: 'lcns_erp_notices',
  AUDIT_LOGS: 'lcns_erp_audit_logs',
  CURRENT_USER: 'lcns_erp_current_user',
  CMS: 'lcns_erp_cms_config',
  CBT_EXAMS: 'lcns_erp_cbt_exams',
  CBT_SUBMISSIONS: 'lcns_erp_cbt_submissions',
};

const INITIAL_USERS: (User & { password?: string })[] = [
  {
    id: 'usr-admin-1',
    email: 'info@lcns.edu.ng',
    password: 'admin123',
    role: 'ADMIN',
    fullName: 'Director of ICT / Admin',
    status: 'ACTIVE',
    phone: '08126799565',
    createdAt: '2026-01-10',
  },
  {
    id: 'usr-admin-2',
    email: 'lcns.ict@gmail.com',
    password: 'admin123',
    role: 'ADMIN',
    fullName: 'Central ICT Desk',
    status: 'ACTIVE',
    phone: '08126799565',
    createdAt: '2026-01-10',
  },
  {
    id: 'usr-provost',
    email: 'provost@lcns.edu.ng',
    password: 'admin123',
    role: 'PROVOST',
    fullName: 'Prof. Gabriel T. Labe',
    department: 'Office of the Provost',
    status: 'ACTIVE',
    phone: '08034567891',
    createdAt: '2026-01-10',
  },
  {
    id: 'usr-reg',
    email: 'registrar@lcns.edu.ng',
    password: 'admin123',
    role: 'REGISTRAR',
    fullName: 'Barr. Timothy J. Iorbee',
    department: 'Academic Registry',
    status: 'ACTIVE',
    phone: '08023456789',
    createdAt: '2026-01-11',
  },
  {
    id: 'usr-adm',
    email: 'admission@lcns.edu.ng',
    password: 'admin123',
    role: 'ADMISSION_OFFICER',
    fullName: 'Mrs. Bridget N. Terfa',
    department: 'Admissions Unit',
    status: 'ACTIVE',
    phone: '08134567890',
    createdAt: '2026-01-12',
  },
  {
    id: 'usr-exam',
    email: 'exam@lcns.edu.ng',
    password: 'admin123',
    role: 'EXAM_OFFICER',
    fullName: 'Dr. Emmanuel O. Agada',
    department: 'Examination & Records',
    status: 'ACTIVE',
    phone: '08056789012',
    createdAt: '2026-01-12',
  },
  {
    id: 'usr-hod',
    email: 'hod.nursing@lcns.edu.ng',
    password: 'admin123',
    role: 'HOD',
    fullName: 'Dr. (Mrs) Rebecca M. Chia',
    department: 'Department of Nursing Sciences',
    status: 'ACTIVE',
    phone: '08078901234',
    createdAt: '2026-01-12',
  },
  {
    id: 'usr-lec',
    email: 'lecturer@lcns.edu.ng',
    password: 'admin123',
    role: 'LECTURER',
    fullName: 'Nurse Emmanuel Gbaorun (FWACN)',
    department: 'Department of Nursing Sciences',
    status: 'ACTIVE',
    phone: '08167890123',
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-bur',
    email: 'bursar@lcns.edu.ng',
    password: 'admin123',
    role: 'BURSAR',
    fullName: 'Mr. Simon T. Tyavyar (FCA)',
    department: 'College Bursary Department',
    status: 'ACTIVE',
    phone: '08089012345',
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-stu-1',
    email: 'student@lcns.edu.ng',
    matricNo: 'LCNS/2026/ND/014',
    password: 'admin123',
    role: 'STUDENT',
    fullName: 'Deborah Vershima',
    department: 'Department of Nursing Sciences',
    status: 'ACTIVE',
    phone: '08101234567',
    createdAt: '2026-02-01',
  },
  {
    id: 'usr-app-1',
    email: 'applicant@lcns.edu.ng',
    password: 'admin123',
    role: 'APPLICANT',
    fullName: 'Terwase Moses',
    department: 'Admissions Pool',
    status: 'ACTIVE',
    phone: '08145678901',
    createdAt: '2026-02-10',
  },
];

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'app-001',
    formNo: 'LCNS/APP/2026/014',
    fullName: 'Deborah Vershima',
    email: 'student@lcns.edu.ng',
    phone: '08101234567',
    gender: 'Female',
    dob: '2005-04-18',
    stateOfOrigin: 'Benue',
    lga: 'Gboko',
    address: 'No 14 Captain Downes Road, Gboko, Benue State',
    program: 'ND/HND Nursing Sciences (4 Years)',
    jambRegNo: '202640239104EF',
    jambScore: 218,
    olevelExamType: 'WAEC',
    olevelExamYear: '2025',
    olevelGrades: {
      english: 'B3',
      mathematics: 'A1',
      biology: 'A1',
      chemistry: 'B2',
      physics: 'B3',
    },
    sponsorName: 'Mr. Vershima Jacob',
    sponsorPhone: '08031234567',
    status: 'ADMITTED',
    screeningScore: 82,
    screeningDate: '2026-02-15',
    acceptanceFeePaid: true,
    acceptanceReceiptNo: 'LCNS-ACC-2026-9041',
    createdAt: '2026-02-01',
  },
  {
    id: 'app-002',
    formNo: 'LCNS/APP/2026/089',
    fullName: 'Terwase Moses',
    email: 'applicant@lcns.edu.ng',
    phone: '08145678901',
    gender: 'Male',
    dob: '2004-11-22',
    stateOfOrigin: 'Benue',
    lga: 'Vandeikya',
    address: 'Opposite General Hospital, Vandeikya',
    program: 'ND/HND Nursing Sciences (4 Years)',
    jambRegNo: '202639104821GA',
    jambScore: 204,
    olevelExamType: 'WAEC',
    olevelExamYear: '2025',
    olevelGrades: {
      english: 'B3',
      mathematics: 'B2',
      biology: 'B2',
      chemistry: 'C4',
      physics: 'B3',
    },
    sponsorName: 'Elder Moses Terwase',
    sponsorPhone: '08067891234',
    status: 'ADMITTED',
    screeningScore: 78,
    screeningDate: '2026-02-18',
    acceptanceFeePaid: false,
    createdAt: '2026-02-10',
  },
  {
    id: 'app-003',
    formNo: 'LCNS/APP/2026/102',
    fullName: 'Mngunengen Cynthia Aondo',
    email: 'cynthia.aondo@gmail.com',
    phone: '08098765432',
    gender: 'Female',
    dob: '2006-01-05',
    stateOfOrigin: 'Benue',
    lga: 'Konshisha',
    address: 'GRA Extension, Gboko',
    program: 'ND/HND Nursing Sciences (4 Years)',
    jambRegNo: '202691823741AB',
    jambScore: 196,
    olevelExamType: 'NECO',
    olevelExamYear: '2025',
    olevelGrades: {
      english: 'B2',
      mathematics: 'B3',
      biology: 'A1',
      chemistry: 'B3',
      physics: 'C4',
    },
    sponsorName: 'Hon. Aondo Patrick',
    sponsorPhone: '08023456781',
    status: 'ADMITTED',
    screeningScore: 80,
    screeningDate: '2026-02-18',
    acceptanceFeePaid: true,
    acceptanceReceiptNo: 'LCNS-ACC-2026-8812',
    createdAt: '2026-02-12',
  },
  {
    id: 'app-004',
    formNo: 'LCNS/APP/2026/115',
    fullName: 'Iorkase Solomon Shima',
    email: 'shima.solomon@yahoo.com',
    phone: '08129876543',
    gender: 'Male',
    dob: '2005-08-30',
    stateOfOrigin: 'Taraba',
    lga: 'Wukari',
    address: 'Hospital Road, Wukari',
    program: 'ND/HND Nursing Sciences (4 Years)',
    jambRegNo: '202684729103CD',
    jambScore: 188,
    olevelExamType: 'WAEC',
    olevelExamYear: '2025',
    olevelGrades: {
      english: 'C4',
      mathematics: 'B3',
      biology: 'B2',
      chemistry: 'B3',
      physics: 'C5',
    },
    sponsorName: 'Mrs. Shima Comfort',
    sponsorPhone: '08056781234',
    status: 'SCREENED',
    screeningScore: 68,
    screeningDate: '2026-02-22',
    acceptanceFeePaid: false,
    createdAt: '2026-02-14',
  },
  {
    id: 'app-005',
    formNo: 'LCNS/APP/2026/120',
    fullName: 'Aondover Mercy Dooshima',
    email: 'mercy.dooshima@gmail.com',
    phone: '08034567899',
    gender: 'Female',
    dob: '2005-03-12',
    stateOfOrigin: 'Benue',
    lga: 'Ushongo',
    address: 'Lessel Town, Ushongo LGA',
    program: 'ND/HND Nursing Sciences (4 Years)',
    jambRegNo: '202677291845EF',
    jambScore: 215,
    olevelExamType: 'WAEC',
    olevelExamYear: '2025',
    olevelGrades: {
      english: 'A1',
      mathematics: 'B3',
      biology: 'A1',
      chemistry: 'B2',
      physics: 'B2',
    },
    sponsorName: 'Mr. Aondover Joseph',
    sponsorPhone: '08076543210',
    status: 'ADMITTED',
    screeningScore: 85,
    screeningDate: '2026-02-18',
    acceptanceFeePaid: true,
    acceptanceReceiptNo: 'LCNS-ACC-2026-9114',
    createdAt: '2026-02-15',
  }
];

const INITIAL_STUDENTS: Student[] = [
  {
    matricNo: 'LCNS/2026/ND/014',
    fullName: 'Deborah Vershima',
    email: 'student@lcns.edu.ng',
    phone: '08101234567',
    gender: 'Female',
    program: 'ND/HND Nursing Sciences (4 Years)',
    department: 'Department of Nursing Sciences',
    level: 'ND 1',
    session: '2026/2027',
    stateOfOrigin: 'Benue',
    lga: 'Gboko',
    bloodGroup: 'O+',
    genotype: 'AA',
    nextOfKin: 'Mr. Vershima Jacob (Father)',
    nextOfKinPhone: '08031234567',
    admissionYear: 2026,
    status: 'ACTIVE',
  },
  {
    matricNo: 'LCNS/2026/ND/001',
    fullName: 'Aver Grace Terwase',
    email: 'grace.aver@lcns.edu.ng',
    phone: '08022233344',
    gender: 'Female',
    program: 'ND/HND Nursing Sciences (4 Years)',
    department: 'Department of Nursing Sciences',
    level: 'ND 1',
    session: '2026/2027',
    stateOfOrigin: 'Benue',
    lga: 'Buruku',
    bloodGroup: 'A+',
    genotype: 'AA',
    nextOfKin: 'Rev. Terwase Aver (Father)',
    nextOfKinPhone: '08033344455',
    admissionYear: 2026,
    status: 'ACTIVE',
  },
  {
    matricNo: 'LCNS/2026/ND/002',
    fullName: 'Kave Emmanuel Aondofa',
    email: 'kave.emmanuel@lcns.edu.ng',
    phone: '08155566677',
    gender: 'Male',
    program: 'ND/HND Nursing Sciences (4 Years)',
    department: 'Department of Nursing Sciences',
    level: 'ND 1',
    session: '2026/2027',
    stateOfOrigin: 'Benue',
    lga: 'Gboko',
    bloodGroup: 'O+',
    genotype: 'AS',
    nextOfKin: 'Mrs. Kave Lydia (Mother)',
    nextOfKinPhone: '08055566688',
    admissionYear: 2026,
    status: 'ACTIVE',
  },
  {
    matricNo: 'LCNS/2025/ND/028',
    fullName: 'Se-ember Blessing Iortyer',
    email: 'blessing.iortyer@lcns.edu.ng',
    phone: '08066677788',
    gender: 'Female',
    program: 'ND/HND Nursing Sciences (4 Years)',
    department: 'Department of Nursing Sciences',
    level: 'ND 2',
    session: '2026/2027',
    stateOfOrigin: 'Benue',
    lga: 'Tarka',
    bloodGroup: 'B+',
    genotype: 'AA',
    nextOfKin: 'Dr. Iortyer John (Uncle)',
    nextOfKinPhone: '08077788899',
    admissionYear: 2025,
    status: 'ACTIVE',
  },
  {
    matricNo: 'LCNS/2024/HND/005',
    fullName: 'Doofan Joy Ushahemba',
    email: 'doofan.ushahemba@lcns.edu.ng',
    phone: '08177788899',
    gender: 'Female',
    program: 'ND/HND Nursing Sciences (4 Years)',
    department: 'Department of Nursing Sciences',
    level: 'HND 1',
    session: '2026/2027',
    stateOfOrigin: 'Benue',
    lga: 'Makurdi',
    bloodGroup: 'O-',
    genotype: 'AA',
    nextOfKin: 'Mr. Ushahemba Felix',
    nextOfKinPhone: '08088899900',
    admissionYear: 2024,
    status: 'ACTIVE',
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-101',
    code: 'NSC 101',
    title: 'Foundations of Nursing Practice I',
    units: 3,
    level: 'ND 1',
    semester: 'First',
    department: 'Nursing Sciences',
    lecturerName: 'Nurse Emmanuel Gbaorun (FWACN)',
    lecturerEmail: 'lecturer@lcns.edu.ng',
  },
  {
    id: 'crs-102',
    code: 'ANA 101',
    title: 'Gross & Functional Human Anatomy I',
    units: 3,
    level: 'ND 1',
    semester: 'First',
    department: 'Basic Medical Sciences',
    lecturerName: 'Dr. (Mrs) Rebecca M. Chia',
    lecturerEmail: 'hod.nursing@lcns.edu.ng',
  },
  {
    id: 'crs-103',
    code: 'PHS 101',
    title: 'Human Physiology & Homeostasis I',
    units: 3,
    level: 'ND 1',
    semester: 'First',
    department: 'Basic Medical Sciences',
    lecturerName: 'Dr. Emmanuel O. Agada',
    lecturerEmail: 'exam@lcns.edu.ng',
  },
  {
    id: 'crs-104',
    code: 'BCH 101',
    title: 'Medical Biochemistry for Nurses',
    units: 2,
    level: 'ND 1',
    semester: 'First',
    department: 'Basic Medical Sciences',
    lecturerName: 'Prof. G. T. Labe',
    lecturerEmail: 'provost@lcns.edu.ng',
  },
  {
    id: 'crs-105',
    code: 'MIC 101',
    title: 'Medical Microbiology & Infection Control',
    units: 2,
    level: 'ND 1',
    semester: 'First',
    department: 'Basic Medical Sciences',
    lecturerName: 'Nurse Emmanuel Gbaorun (FWACN)',
    lecturerEmail: 'lecturer@lcns.edu.ng',
  },
  {
    id: 'crs-106',
    code: 'CPN 101',
    title: 'Primary Health Care & Community Nursing I',
    units: 2,
    level: 'ND 1',
    semester: 'First',
    department: 'Nursing Sciences',
    lecturerName: 'Dr. (Mrs) Rebecca M. Chia',
    lecturerEmail: 'hod.nursing@lcns.edu.ng',
  },
  {
    id: 'crs-107',
    code: 'GNS 101',
    title: 'Use of English & Communication Skills',
    units: 2,
    level: 'ND 1',
    semester: 'First',
    department: 'General Studies',
    lecturerName: 'Barr. Timothy J. Iorbee',
    lecturerEmail: 'registrar@lcns.edu.ng',
  },
];

const INITIAL_RESULTS: ResultScore[] = [
  {
    id: 'res-001',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'NSC 101',
    courseTitle: 'Foundations of Nursing Practice I',
    units: 3,
    caScore: 26,
    examScore: 56,
    totalScore: 82,
    grade: 'A',
    point: 5,
    remark: 'Excellent',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-002',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'ANA 101',
    courseTitle: 'Gross & Functional Human Anatomy I',
    units: 3,
    caScore: 24,
    examScore: 50,
    totalScore: 74,
    grade: 'A',
    point: 5,
    remark: 'Excellent',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-003',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'PHS 101',
    courseTitle: 'Human Physiology & Homeostasis I',
    units: 3,
    caScore: 22,
    examScore: 46,
    totalScore: 68,
    grade: 'B',
    point: 4,
    remark: 'Very Good',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-004',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'BCH 101',
    courseTitle: 'Medical Biochemistry for Nurses',
    units: 2,
    caScore: 20,
    examScore: 43,
    totalScore: 63,
    grade: 'B',
    point: 4,
    remark: 'Very Good',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-005',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'MIC 101',
    courseTitle: 'Medical Microbiology & Infection Control',
    units: 2,
    caScore: 23,
    examScore: 52,
    totalScore: 75,
    grade: 'A',
    point: 5,
    remark: 'Excellent',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-006',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'CPN 101',
    courseTitle: 'Primary Health Care & Community Nursing I',
    units: 2,
    caScore: 25,
    examScore: 54,
    totalScore: 79,
    grade: 'A',
    point: 5,
    remark: 'Excellent',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-007',
    matricNo: 'LCNS/2026/ND/014',
    studentName: 'Deborah Vershima',
    courseCode: 'GNS 101',
    courseTitle: 'Use of English & Communication Skills',
    units: 2,
    caScore: 24,
    examScore: 48,
    totalScore: 72,
    grade: 'A',
    point: 5,
    remark: 'Excellent',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },

  // Student 2 scores
  {
    id: 'res-008',
    matricNo: 'LCNS/2026/ND/001',
    studentName: 'Aver Grace Terwase',
    courseCode: 'NSC 101',
    courseTitle: 'Foundations of Nursing Practice I',
    units: 3,
    caScore: 25,
    examScore: 48,
    totalScore: 73,
    grade: 'A',
    point: 5,
    remark: 'Excellent',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-009',
    matricNo: 'LCNS/2026/ND/001',
    studentName: 'Aver Grace Terwase',
    courseCode: 'ANA 101',
    courseTitle: 'Gross & Functional Human Anatomy I',
    units: 3,
    caScore: 22,
    examScore: 44,
    totalScore: 66,
    grade: 'B',
    point: 4,
    remark: 'Very Good',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  },
  {
    id: 'res-010',
    matricNo: 'LCNS/2026/ND/002',
    studentName: 'Kave Emmanuel Aondofa',
    courseCode: 'NSC 101',
    courseTitle: 'Foundations of Nursing Practice I',
    units: 3,
    caScore: 20,
    examScore: 42,
    totalScore: 62,
    grade: 'B',
    point: 4,
    remark: 'Very Good',
    semester: 'First',
    session: '2026/2027',
    status: 'APPROVED',
  }
];

const INITIAL_FEES: FeeItem[] = [
  {
    id: 'fee-acc',
    title: 'Provisional Acceptance Fee',
    amount: 25000,
    level: 'ND 1 Entrants',
    program: 'ND/HND Nursing Sciences (4 Years)',
    session: '2026/2027',
    mandatory: true,
    type: 'ACCEPTANCE',
  },
  {
    id: 'fee-tui-nd1',
    title: 'Tuition & Academic Training Fee (First Semester)',
    amount: 185000,
    level: 'ND 1',
    program: 'ND/HND Nursing Sciences (4 Years)',
    session: '2026/2027',
    mandatory: true,
    type: 'TUITION',
  },
  {
    id: 'fee-lab',
    title: 'Clinical Simulation & Skills Laboratory Fee',
    amount: 25000,
    level: 'ND 1',
    program: 'ND/HND Nursing Sciences (4 Years)',
    session: '2026/2027',
    mandatory: true,
    type: 'LAB',
  },
  {
    id: 'fee-clin',
    title: 'Hospital Clinical Postings & Transportation Levy',
    amount: 20000,
    level: 'ND 1',
    program: 'ND/HND Nursing Sciences (4 Years)',
    session: '2026/2027',
    mandatory: true,
    type: 'CLINICAL',
  },
  {
    id: 'fee-host',
    title: 'Campus Hostel Accommodation & Utilities',
    amount: 45000,
    level: 'ND 1 & ND 2',
    program: 'ND/HND Nursing Sciences (4 Years)',
    session: '2026/2027',
    mandatory: false,
    type: 'HOSTEL',
  },
  {
    id: 'fee-idx',
    title: 'NMCN Nursing Council Indexing & Verification',
    amount: 35000,
    level: 'ND 1',
    program: 'ND/HND Nursing Sciences (4 Years)',
    session: '2026/2027',
    mandatory: true,
    type: 'INDEXING',
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    receiptNo: 'LCNS-REC-2026-001',
    rrr: '3402-9182-4410',
    matricOrFormNo: 'LCNS/2026/ND/014',
    payerName: 'Deborah Vershima',
    feeType: 'Tuition & Academic Training Fee (First Semester)',
    amount: 185000,
    session: '2026/2027',
    semester: 'First',
    paymentDate: '2026-02-05 11:24',
    paymentMethod: 'Remita / Card',
    status: 'PAID',
    verifiedBy: 'Mr. Simon T. Tyavyar (Bursar)',
  },
  {
    id: 'pay-002',
    receiptNo: 'LCNS-ACC-2026-9041',
    rrr: '8812-7491-0391',
    matricOrFormNo: 'LCNS/APP/2026/014',
    payerName: 'Deborah Vershima',
    feeType: 'Provisional Acceptance Fee',
    amount: 25000,
    session: '2026/2027',
    paymentDate: '2026-02-02 09:15',
    paymentMethod: 'Remita / Card',
    status: 'PAID',
    verifiedBy: 'System Auto-Receipt',
  },
  {
    id: 'pay-003',
    receiptNo: 'LCNS-REC-2026-002',
    rrr: '7291-3849-1102',
    matricOrFormNo: 'LCNS/2026/ND/014',
    payerName: 'Deborah Vershima',
    feeType: 'Clinical Simulation & Skills Laboratory Fee',
    amount: 25000,
    session: '2026/2027',
    semester: 'First',
    paymentDate: '2026-02-06 14:10',
    paymentMethod: 'Bank Transfer',
    status: 'PAID',
    verifiedBy: 'Mr. Simon T. Tyavyar (Bursar)',
  },
  {
    id: 'pay-004',
    receiptNo: 'LCNS-REC-2026-003',
    rrr: '1092-8472-9932',
    matricOrFormNo: 'LCNS/2026/ND/001',
    payerName: 'Aver Grace Terwase',
    feeType: 'Tuition & Academic Training Fee (First Semester)',
    amount: 185000,
    session: '2026/2027',
    semester: 'First',
    paymentDate: '2026-02-04 16:45',
    paymentMethod: 'Remita / Card',
    status: 'PAID',
    verifiedBy: 'Mr. Simon T. Tyavyar (Bursar)',
  },
  {
    id: 'pay-005',
    receiptNo: 'LCNS-REC-2026-004',
    rrr: '4471-2918-6721',
    matricOrFormNo: 'LCNS/2026/ND/002',
    payerName: 'Kave Emmanuel Aondofa',
    feeType: 'Tuition & Academic Training Fee (First Semester)',
    amount: 185000,
    session: '2026/2027',
    semester: 'First',
    paymentDate: '2026-02-07 10:30',
    paymentMethod: 'Direct Bank Branch',
    status: 'PAID',
    verifiedBy: 'Mr. Simon T. Tyavyar (Bursar)',
  }
];

const INITIAL_NOTICES: Notice[] = [];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-15 08:30:22',
    user: 'info@lcns.edu.ng',
    role: 'ADMIN',
    action: 'System Boot & Backup Verification',
    details: 'College ERP database verified and synchronised with Google Sheets backend.',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-15 09:14:10',
    user: 'admission@lcns.edu.ng',
    role: 'ADMISSION_OFFICER',
    action: 'Admission List Update',
    details: 'Batch 1 merit admission list published (45 candidates admitted).',
  },
  {
    id: 'log-003',
    timestamp: '2026-10-15 10:02:45',
    user: 'bursar@lcns.edu.ng',
    role: 'BURSAR',
    action: 'Payment Receipt Verification',
    details: 'Verified Remita transaction RRR: 3402-9182-4410 for Deborah Vershima (₦185,000).',
  },
  {
    id: 'log-004',
    timestamp: '2026-10-15 11:20:00',
    user: 'exam@lcns.edu.ng',
    role: 'EXAM_OFFICER',
    action: 'Score Moderation Broad Sheet',
    details: 'Moderated First Semester scores for NSC 101 and ANA 101.',
  },
];

const INITIAL_CMS: CMSConfig = {
  logoUrl: '/assets/lcns-logo-original.jpg',
  provostPhotoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
  provostName: 'Prof. Gabriel Terungwa Labe',
  provostTitle: 'Provost, Labe College of Nursing Sciences',
  provostMessage: 'At LCNS Gboko, our solemn oath is to train nurses who embody compassion, scientific rigor, and unflinching integrity. Through our accredited 4-Year ND/HND collegiate curriculum, we raise globally competitive lifesavers for Benue, Nigeria, and the international healthcare community.',
  bishopPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
  bishopName: 'Most Rev. William Avenya',
  bishopTitle: 'Catholic Bishop of Gboko & College Proprietor',
  bishopMessage: 'May the almighty God bless and guide all who enter Labe College of Nursing Sciences to learn, to serve, and to save. We envision this noble citadel of learning as a sanctuary where medical skill meets Christian love and dedicated service to humanity.',
  governorPhotoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600',
  governorName: 'H.E. Rev. Fr. Dr. Hyacinth Iormem Alia',
  governorTitle: 'Executive Governor of Benue State',
  governorMessage: 'Establishing Labe College of Nursing Sciences by Benue State Law is our covenant to transform healthcare delivery, empower youth with collegiate qualifications, and position Gboko as a beacon of medical training in Nigeria.',
  gallery: [
    {
      id: 'gal-1',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      title: 'Clinical Demonstration Room & Practical Ward',
      category: 'Clinical Simulation',
      date: '2026-10-01',
      description: 'High-fidelity demonstration room with advanced clinical mannequins and patient vital sign simulators.'
    },
    {
      id: 'gal-2',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
      title: 'LCNS Girls Hostel & Modern Campus Accommodation',
      category: 'Campus & Facilities',
      date: '2026-10-01',
      description: 'Comfortable, safe, and fully serviced student residence with 24/7 security, solar power, and continuous water supply.'
    },
    {
      id: 'gal-3',
      imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800',
      title: 'Executive Visit of Governor H.E. Rev. Fr. Dr. Hyacinth Iormem Alia',
      category: 'Ceremonies & Events',
      date: '2026-10-02',
      description: 'Official inspection and commissioning address by the Executive Governor of Benue State, patron of healthcare development.'
    },
    {
      id: 'gal-4',
      imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800',
      title: 'His Lordship, Most Rev. William Avenya & Diocesan Clergy',
      category: 'Ceremonies & Events',
      date: '2026-10-01',
      description: 'Episcopal dedication mass and solemn blessing ceremony of the college premises in Gboko.'
    },
    {
      id: 'gal-5',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
      title: 'Maternal & Neonatal Resuscitation Training Suite',
      category: 'Clinical Simulation',
      date: '2026-10-03',
      description: 'Specialized delivery tables, infant warmers, and fetal monitors for clinical midwifery mastery.'
    },
    {
      id: 'gal-6',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
      title: 'Modern Anatomy & Physiology Laboratory',
      category: 'Classrooms & Labs',
      date: '2026-10-03',
      description: 'Medical microscopy, histology equipment, and anatomical models for basic medical sciences.'
    },
    {
      id: 'gal-7',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      title: 'Central ICT & Computer-Based Testing (CBT) Center',
      category: 'Campus & Facilities',
      date: '2026-10-04',
      description: '120-seat high-speed networked workstation laboratory for online examinations and digital research.'
    },
    {
      id: 'gal-8',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      title: 'College E-Library & Medical Research Archive',
      category: 'Classrooms & Labs',
      date: '2026-10-04',
      description: 'Extensive digital and hardcopy repository with subscriptions to leading international nursing journals.'
    },
    {
      id: 'gal-9',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      title: 'Nursing Students Clinical Practicum Session',
      category: 'Clinical Simulation',
      date: '2026-10-05',
      description: 'Students engaged in vital signs assessment and sterile wound dressing techniques.'
    }
  ]
};

const INITIAL_CBT_EXAMS: CBTExam[] = [
  {
    id: 'cbt-exam-applicant-2026',
    title: '2026/2027 Pre-Admission CBT Aptitude & Nursing Screening Test',
    type: 'APPLICANT_SCREENING',
    session: '2026/2027',
    durationMinutes: 30,
    totalMarks: 100,
    isPublished: true,
    createdBy: 'registrar@lcns.edu.ng',
    createdRole: 'REGISTRAR',
    createdAt: '2026-10-10',
    questions: [
      {
        id: 'q-scr-1',
        question: 'Which chamber of the human heart pumps oxygenated blood directly into systemic circulation via the aorta?',
        options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
        correctAnswer: 3,
        explanation: 'The left ventricle has the thickest myocardium and pumps oxygenated blood through the aortic valve into systemic circulation.'
      },
      {
        id: 'q-scr-2',
        question: 'What is the normal physiological resting arterial blood pressure range for a healthy adult in sitting posture?',
        options: ['80/40 mmHg', '120/80 mmHg', '160/100 mmHg', '190/110 mmHg'],
        correctAnswer: 1,
        explanation: 'Standard normal resting blood pressure for a healthy adult is approximately 120/80 mmHg.'
      },
      {
        id: 'q-scr-3',
        question: 'Which organelle is designated the "powerhouse of the cell" responsible for aerobic ATP synthesis?',
        options: ['Ribosome', 'Mitochondria', 'Endoplasmic reticulum', 'Golgi apparatus'],
        correctAnswer: 1,
        explanation: 'Mitochondria generate the majority of cellular adenosine triphosphate (ATP) through oxidative phosphorylation.'
      },
      {
        id: 'q-scr-4',
        question: 'In nursing ethics and jurisprudence, the core principle of "Beneficence" primarily dictates:',
        options: ['Strict non-disclosure of medical records', 'Acting proactively in the best clinical interest and welfare of the patient', 'Allowing patient to leave against medical advice', 'Treating only insured individuals'],
        correctAnswer: 1,
        explanation: 'Beneficence requires healthcare practitioners to act in ways that maximize positive patient health outcomes.'
      },
      {
        id: 'q-scr-5',
        question: 'The alveolar-capillary exchange of oxygen and carbon dioxide in human lungs occurs primarily through:',
        options: ['Active transport against gradient', 'Simple passive diffusion', 'Pinocytosis', 'Facilitated primary transport'],
        correctAnswer: 1,
        explanation: 'Gases diffuse passively from areas of higher partial pressure to lower partial pressure across the respiratory membrane.'
      },
      {
        id: 'q-scr-6',
        question: 'What is the SI unit of measurement for electrical electric current in clinical biomedical monitoring?',
        options: ['Volt (V)', 'Ampere (A)', 'Ohm (Ω)', 'Watt (W)'],
        correctAnswer: 1,
        explanation: 'The ampere is the base SI unit of electrical current.'
      },
      {
        id: 'q-scr-7',
        question: 'Which of the following pH measurements indicates a neutral pure aqueous solution at 25°C?',
        options: ['pH 1.0', 'pH 7.0', 'pH 9.5', 'pH 14.0'],
        correctAnswer: 1,
        explanation: 'A pH of 7.0 represents exact neutrality where hydrogen and hydroxide ion concentrations are equal.'
      },
      {
        id: 'q-scr-8',
        question: 'Identify the word that most accurately completes: "The surgical nurse demonstrated _______ adherence to sterile aseptic field guidelines."',
        options: ['meticulous', 'negligent', 'superficial', 'sporadic'],
        correctAnswer: 0,
        explanation: 'Meticulous means showing great attention to detail and thorough care.'
      },
      {
        id: 'q-scr-9',
        question: 'In transfusion medicine, which ABO/Rh blood type is designated as the universal recipient of packed red cells?',
        options: ['Group O Negative', 'Group A Positive', 'Group B Positive', 'Group AB Positive'],
        correctAnswer: 3,
        explanation: 'Group AB Positive red blood cells lack both anti-A and anti-B antibodies, allowing safe reception of all ABO types.'
      },
      {
        id: 'q-scr-10',
        question: 'What is the primary physiological function of hemoglobin located inside human red blood cells?',
        options: ['Reversible binding and transport of oxygen from lungs to systemic tissues', 'Direct phagocytosis of foreign pathogenic bacteria', 'Fibrin polymerization for vascular clotting', 'Insulin hormone secretion'],
        correctAnswer: 0,
        explanation: 'Hemoglobin binds oxygen molecules cooperatively in alveolar capillaries and releases them in peripheral tissues.'
      }
    ]
  },
  {
    id: 'cbt-exam-nsc101-ca1',
    title: 'NSC 101: Foundations of Nursing Practice I - Continuous Assessment CBT Test',
    type: 'COURSE_TEST',
    courseCode: 'NSC 101',
    courseTitle: 'Foundations of Nursing Practice I',
    session: '2026/2027',
    semester: 'First',
    durationMinutes: 20,
    totalMarks: 30,
    isPublished: true,
    createdBy: 'lecturer@lcns.edu.ng',
    createdRole: 'LECTURER',
    createdAt: '2026-10-12',
    questions: [
      {
        id: 'q-nsc-1',
        question: 'Who is recognized historically as the pioneer founder of modern evidence-based professional nursing?',
        options: ['Clara Barton', 'Florence Nightingale', 'Mary Seacole', 'Dorothea Dix'],
        correctAnswer: 1,
        explanation: 'Florence Nightingale established the philosophical and scientific foundations of modern nursing during the Crimean War.'
      },
      {
        id: 'q-nsc-2',
        question: 'Which step of the five-phase Nursing Process focuses explicitly on setting measurable patient goals?',
        options: ['Assessment', 'Diagnosis', 'Planning', 'Implementation'],
        correctAnswer: 2,
        explanation: 'The planning phase establishes measurable, patient-centered priorities and expected nursing outcomes.'
      },
      {
        id: 'q-nsc-3',
        question: 'When palpating an adult patient’s radial pulse, what is considered the normal expected resting heart rate range?',
        options: ['30 - 50 beats per minute', '60 - 100 beats per minute', '110 - 140 beats per minute', '150 - 180 beats per minute'],
        correctAnswer: 1,
        explanation: 'A normal resting adult heart rate typically falls between 60 and 100 bpm.'
      },
      {
        id: 'q-nsc-4',
        question: 'Surgical asepsis (sterile technique) differs fundamentally from medical asepsis (clean technique) because surgical asepsis:',
        options: ['Merely reduces the microbial load', 'Completely destroys all microorganisms including bacterial spores', 'Requires only soap and water', 'Is only applied in outpatient consulting rooms'],
        correctAnswer: 1,
        explanation: 'Sterile technique completely eliminates all viable pathogens and spores from items entering sterile body cavities.'
      },
      {
        id: 'q-nsc-5',
        question: 'The Five Cs of Best Practice Nursing embraced by LCNS Gboko include Commitment, Conscience, Competence, Compassion, and:',
        options: ['Courage', 'Confidence', 'Calculation', 'Capability'],
        correctAnswer: 1,
        explanation: 'The five Cs are Commitment, Conscience, Competence, Compassion, and Confidence.'
      },
      {
        id: 'q-nsc-6',
        question: 'Subjective clinical findings obtained during a comprehensive patient nursing admission assessment are:',
        options: ['Parameters directly reported and experienced by the patient (e.g. pain severity, nausea)', 'Numerical results from venous blood gas analysis', 'Digital readings recorded on an automated monitor', 'Auscultated breath sounds with a stethoscope'],
        correctAnswer: 0,
        explanation: 'Subjective data consists of symptoms verbally communicated by the client.'
      }
    ]
  }
];

const INITIAL_CBT_SUBMISSIONS: CBTSubmission[] = [
  {
    id: 'sub-app-001',
    examId: 'cbt-exam-applicant-2026',
    examTitle: '2026/2027 Pre-Admission CBT Aptitude & Nursing Screening Test',
    examType: 'APPLICANT_SCREENING',
    userId: 'LCNS/APP/2026/014',
    userFullName: 'Deborah Vershima',
    userEmail: 'student@lcns.edu.ng',
    userRole: 'APPLICANT',
    score: 85,
    totalQuestions: 10,
    percentage: 85,
    answers: { 'q-scr-1': 3, 'q-scr-2': 1, 'q-scr-3': 1, 'q-scr-4': 1, 'q-scr-5': 1, 'q-scr-6': 1, 'q-scr-7': 1, 'q-scr-8': 0, 'q-scr-9': 3, 'q-scr-10': 0 },
    submittedAt: '2026-10-14 11:30',
    status: 'COMPLETED'
  },
  {
    id: 'sub-app-002',
    examId: 'cbt-exam-applicant-2026',
    examTitle: '2026/2027 Pre-Admission CBT Aptitude & Nursing Screening Test',
    examType: 'APPLICANT_SCREENING',
    userId: 'LCNS/APP/2026/002',
    userFullName: 'Terwase Moses',
    userEmail: 'applicant@lcns.edu.ng',
    userRole: 'APPLICANT',
    score: 75,
    totalQuestions: 10,
    percentage: 75,
    answers: { 'q-scr-1': 3, 'q-scr-2': 1, 'q-scr-3': 1, 'q-scr-4': 1, 'q-scr-5': 1, 'q-scr-6': 0, 'q-scr-7': 1, 'q-scr-8': 0, 'q-scr-9': 2, 'q-scr-10': 0 },
    submittedAt: '2026-10-14 14:15',
    status: 'COMPLETED'
  },
  {
    id: 'sub-std-001',
    examId: 'cbt-exam-nsc101-ca1',
    examTitle: 'NSC 101: Foundations of Nursing Practice I - Continuous Assessment CBT Test',
    examType: 'COURSE_TEST',
    courseCode: 'NSC 101',
    userId: 'LCNS/2026/ND/014',
    userFullName: 'Deborah Vershima',
    userEmail: 'student@lcns.edu.ng',
    userRole: 'STUDENT',
    score: 28,
    totalQuestions: 6,
    percentage: 93.3,
    answers: { 'q-nsc-1': 1, 'q-nsc-2': 2, 'q-nsc-3': 1, 'q-nsc-4': 1, 'q-nsc-5': 1, 'q-nsc-6': 0 },
    submittedAt: '2026-10-15 09:45',
    status: 'COMPLETED'
  }
];

// Helper to get from local storage or set initial
function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    // Dispatch custom event for reactive UI updates across components
    window.dispatchEvent(new Event('lcns_storage_update'));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  getUsers: (): (User & { password?: string })[] => getStorage(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUsers: (users: (User & { password?: string })[]) => setStorage(STORAGE_KEYS.USERS, users),

  getApplicants: (): Applicant[] => getStorage(STORAGE_KEYS.APPLICANTS, INITIAL_APPLICANTS),
  saveApplicants: (applicants: Applicant[]) => setStorage(STORAGE_KEYS.APPLICANTS, applicants),

  getStudents: (): Student[] => getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (students: Student[]) => setStorage(STORAGE_KEYS.STUDENTS, students),

  getCourses: (): Course[] => getStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES),
  saveCourses: (courses: Course[]) => setStorage(STORAGE_KEYS.COURSES, courses),

  getResults: (): ResultScore[] => getStorage(STORAGE_KEYS.RESULTS, INITIAL_RESULTS),
  saveResults: (results: ResultScore[]) => setStorage(STORAGE_KEYS.RESULTS, results),

  getFees: (): FeeItem[] => getStorage(STORAGE_KEYS.FEES, INITIAL_FEES),
  saveFees: (fees: FeeItem[]) => setStorage(STORAGE_KEYS.FEES, fees),

  getPayments: (): PaymentRecord[] => getStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments: PaymentRecord[]) => setStorage(STORAGE_KEYS.PAYMENTS, payments),

  getNotices: (): Notice[] => {
    const notices = getStorage(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
    return notices.filter(
      (n) =>
        n.id !== 'not-001' &&
        n.id !== 'not-002' &&
        n.id !== 'not-003' &&
        n.id !== 'not-004' &&
        !n.title?.includes('Commencement of 2026/2027') &&
        !n.title?.includes('NMCN') &&
        !n.title?.includes('Second Batch') &&
        !n.title?.includes('Deadline for Payment')
    );
  },
  saveNotices: (notices: Notice[]) => setStorage(STORAGE_KEYS.NOTICES, notices),

  getAuditLogs: (): AuditLog[] => getStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  saveAuditLogs: (logs: AuditLog[]) => setStorage(STORAGE_KEYS.AUDIT_LOGS, logs),

  getCMSConfig: (): CMSConfig => {
    const config = getStorage(STORAGE_KEYS.CMS, INITIAL_CMS);
    if (!config.logoUrl) {
      config.logoUrl = '/assets/lcns-logo-original.jpg';
    }
    if (!config.gallery || !Array.isArray(config.gallery)) {
      config.gallery = INITIAL_CMS.gallery;
      setStorage(STORAGE_KEYS.CMS, config);
    }
    return config;
  },
  saveCMSConfig: (cms: CMSConfig) => setStorage(STORAGE_KEYS.CMS, cms),

  deleteGalleryItem: (id: string): CMSConfig => {
    const config = StorageService.getCMSConfig();
    const updatedGallery = (config.gallery || []).filter((g) => g.id !== id);
    const updatedConfig: CMSConfig = {
      ...config,
      gallery: updatedGallery,
    };
    setStorage(STORAGE_KEYS.CMS, updatedConfig);
    return updatedConfig;
  },

  getCurrentUser: (): User | null => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    window.dispatchEvent(new Event('lcns_auth_update'));
  },

  logAction: (user: string, role: string, action: string, details: string) => {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      role,
      action,
      details,
    };
    StorageService.saveAuditLogs([newLog, ...logs]);
  },

  deleteUser: (userId: string): (User & { password?: string })[] => {
    const users = StorageService.getUsers();
    const targetUser = users.find((u) => u.id === userId || u.email === userId);
    const updated = users.filter((u) => u.id !== userId && u.email !== userId);
    setStorage(STORAGE_KEYS.USERS, updated);

    // If current logged in user was deleted, clear session
    const current = StorageService.getCurrentUser();
    if (current && (current.id === userId || current.email === userId)) {
      StorageService.setCurrentUser(null);
    }

    StorageService.logAction(
      'admin@lcns.edu.ng',
      'ADMIN',
      'DELETE_USER',
      `Permanently deleted user: ${targetUser?.fullName || userId} (${targetUser?.email || userId})`
    );
    return updated;
  },

  updateUser: (updatedUser: Partial<User> & { id: string }): (User & { password?: string })[] => {
    const users = StorageService.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedUser };
      setStorage(STORAGE_KEYS.USERS, users);

      const current = StorageService.getCurrentUser();
      if (current && current.id === updatedUser.id) {
        StorageService.setCurrentUser({ ...current, ...updatedUser });
      }
    }
    return users;
  },

  updateUserProfilePicture: (identifier: string, photoUrl: string) => {
    const users = StorageService.getUsers();
    const userIndex = users.findIndex((u) => u.id === identifier || u.email === identifier || u.matricNo === identifier);
    if (userIndex !== -1) {
      users[userIndex].photoUrl = photoUrl;
      setStorage(STORAGE_KEYS.USERS, users);
    }

    const curr = StorageService.getCurrentUser();
    if (curr && (curr.id === identifier || curr.email === identifier || curr.matricNo === identifier)) {
      curr.photoUrl = photoUrl;
      StorageService.setCurrentUser(curr);
    }

    // Also update Student or Applicant profile if matching
    const students = StorageService.getStudents();
    const sIdx = students.findIndex((s) => s.matricNo === identifier || s.email === identifier);
    if (sIdx !== -1) {
      students[sIdx].photoUrl = photoUrl;
      StorageService.saveStudents(students);
    }
  },

  resetUserPassword: (identifier: string, newPass: string): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const users = StorageService.getUsers();
    const userIndex = users.findIndex(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.matricNo && u.matricNo.toLowerCase() === cleanId) ||
        u.id.toLowerCase() === cleanId
    );

    if (userIndex === -1) {
      return {
        success: false,
        message: 'No user account found matching that Email or Matric / Form Number.',
      };
    }

    users[userIndex].password = newPass;
    setStorage(STORAGE_KEYS.USERS, users);

    StorageService.logAction(
      users[userIndex].email,
      users[userIndex].role,
      'USER_PASSWORD_RESET',
      `Password successfully reset for account: ${users[userIndex].fullName} (${users[userIndex].email})`
    );

    return {
      success: true,
      message: `Password reset successfully for ${users[userIndex].fullName}! You can now sign in with your new password.`,
    };
  },

  // CBT Screening & Course Tests
  getCBTExams: (): CBTExam[] => getStorage(STORAGE_KEYS.CBT_EXAMS, INITIAL_CBT_EXAMS),
  saveCBTExams: (exams: CBTExam[]) => setStorage(STORAGE_KEYS.CBT_EXAMS, exams),

  togglePublishCBTExam: (examId: string, isPublished: boolean): CBTExam[] => {
    const exams = StorageService.getCBTExams();
    const updated = exams.map((ex) => (ex.id === examId ? { ...ex, isPublished } : ex));
    StorageService.saveCBTExams(updated);
    StorageService.logAction(
      'admin@lcns.edu.ng',
      'ADMIN',
      isPublished ? 'PUBLISH_CBT_EXAM' : 'UNPUBLISH_CBT_EXAM',
      `${isPublished ? 'Published' : 'Unpublished'} CBT Exam ID: ${examId}`
    );
    return updated;
  },

  getCBTSubmissions: (): CBTSubmission[] => getStorage(STORAGE_KEYS.CBT_SUBMISSIONS, INITIAL_CBT_SUBMISSIONS),
  saveCBTSubmission: (sub: CBTSubmission): CBTSubmission[] => {
    const submissions = StorageService.getCBTSubmissions();
    // Filter out previous submission for same exam and user if retaking
    const filtered = submissions.filter((s) => !(s.examId === sub.examId && s.userId === sub.userId));
    const updated = [sub, ...filtered];
    setStorage(STORAGE_KEYS.CBT_SUBMISSIONS, updated);

    // If applicant screening, update applicant record
    if (sub.examType === 'APPLICANT_SCREENING') {
      const applicants = StorageService.getApplicants();
      const updatedApps = applicants.map((a) => {
        if (a.formNo === sub.userId || a.email === sub.userEmail) {
          return {
            ...a,
            screeningScore: sub.score,
            status: sub.percentage >= 60 ? ('SCREENED' as const) : a.status,
          };
        }
        return a;
      });
      StorageService.saveApplicants(updatedApps);
    }

    StorageService.logAction(
      sub.userEmail,
      sub.userRole,
      'CBT_EXAM_SUBMISSION',
      `Completed CBT Exam: ${sub.examTitle} with score ${sub.score} (${sub.percentage}%)`
    );

    return updated;
  },

  resetToDefault: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(INITIAL_APPLICANTS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(INITIAL_RESULTS));
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(INITIAL_FEES));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CMS, JSON.stringify(INITIAL_CMS));
    localStorage.setItem(STORAGE_KEYS.CBT_EXAMS, JSON.stringify(INITIAL_CBT_EXAMS));
    localStorage.setItem(STORAGE_KEYS.CBT_SUBMISSIONS, JSON.stringify(INITIAL_CBT_SUBMISSIONS));
    window.dispatchEvent(new Event('lcns_storage_update'));
  }
};
