export type UserRole =
  | 'ADMIN'
  | 'PROVOST'
  | 'REGISTRAR'
  | 'ADMISSION_OFFICER'
  | 'EXAM_OFFICER'
  | 'HOD'
  | 'LECTURER'
  | 'BURSAR'
  | 'STUDENT'
  | 'APPLICANT';

export interface User {
  id: string;
  email: string;
  matricNo?: string;
  role: UserRole;
  fullName: string;
  department?: string;
  phone?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Applicant {
  id: string;
  formNo: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  dob: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  program: 'ND/HND Nursing Sciences (4 Years)';
  jambRegNo: string;
  jambScore: number;
  olevelExamType: 'WAEC' | 'NECO' | 'NABTEB';
  olevelExamYear: string;
  olevelGrades: {
    english: string;
    mathematics: string;
    biology: string;
    chemistry: string;
    physics: string;
  };
  sponsorName: string;
  sponsorPhone: string;
  status: 'SUBMITTED' | 'SCREENED' | 'ADMITTED' | 'REJECTED';
  screeningScore?: number;
  screeningDate?: string;
  acceptanceFeePaid: boolean;
  acceptanceReceiptNo?: string;
  createdAt: string;
}

export interface Student {
  matricNo: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  program: string;
  department: string;
  level: 'ND 1' | 'ND 2' | 'HND 1' | 'HND 2';
  session: string;
  stateOfOrigin: string;
  lga: string;
  bloodGroup: string;
  genotype: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  photoUrl?: string;
  admissionYear: number;
  status: 'ACTIVE' | 'GRADUATED' | 'WITHDRAWN';
}

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  level: string;
  semester: 'First' | 'Second';
  department: string;
  lecturerName: string;
  lecturerEmail?: string;
}

export interface ResultScore {
  id: string;
  matricNo: string;
  studentName?: string;
  courseCode: string;
  courseTitle?: string;
  units: number;
  caScore: number; // Max 30
  examScore: number; // Max 70
  totalScore: number; // Max 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  point: number; // 5, 4, 3, 2, 0
  remark: string;
  semester: 'First' | 'Second';
  session: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

export interface FeeItem {
  id: string;
  title: string;
  amount: number;
  level: string;
  program: string;
  session: string;
  mandatory: boolean;
  type: 'TUITION' | 'ACCEPTANCE' | 'LAB' | 'CLINICAL' | 'HOSTEL' | 'EXAM' | 'INDEXING';
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  rrr: string; // Remita Retrieval Reference
  matricOrFormNo: string;
  payerName: string;
  feeType: string;
  amount: number;
  session: string;
  semester?: string;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Remita / Card' | 'Direct Bank Branch' | 'POS Counter';
  status: 'PAID' | 'PENDING' | 'FAILED';
  verifiedBy?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetRole: 'ALL' | 'STUDENT' | 'STAFF' | 'APPLICANT';
  category: 'ACADEMIC' | 'ADMISSIONS' | 'BURSARY' | 'GENERAL';
  date: string;
  author: string;
  pinned?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  date: string;
  matricNo: string;
  studentName: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: 'Campus & Facilities' | 'Clinical Simulation' | 'Ceremonies & Events' | 'Classrooms & Labs';
  date: string;
  description?: string;
}

export interface CMSConfig {
  logoUrl?: string;
  provostPhotoUrl?: string;
  provostName: string;
  provostTitle: string;
  provostMessage: string;
  bishopPhotoUrl?: string;
  bishopName: string;
  bishopTitle: string;
  bishopMessage: string;
  governorPhotoUrl?: string;
  governorName?: string;
  governorTitle?: string;
  governorMessage?: string;
  gallery: GalleryItem[];
}

export interface CBTQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options [A, B, C, D]
  correctAnswer: number; // 0, 1, 2, 3
  explanation?: string;
}

export interface CBTExam {
  id: string;
  title: string;
  type: 'APPLICANT_SCREENING' | 'COURSE_TEST';
  courseCode?: string; // For student course tests e.g. 'NSC 101'
  courseTitle?: string;
  session: string;
  semester?: string;
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  createdBy: string;
  createdRole: string;
  createdAt: string;
  questions: CBTQuestion[];
}

export interface CBTSubmission {
  id: string;
  examId: string;
  examTitle: string;
  examType: 'APPLICANT_SCREENING' | 'COURSE_TEST';
  courseCode?: string;
  userId: string; // applicant formNo or student matricNo
  userFullName: string;
  userEmail: string;
  userRole: 'APPLICANT' | 'STUDENT';
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: { [questionId: string]: number };
  submittedAt: string;
  status: 'COMPLETED';
}

export interface GradingScale {
  min: number;
  max: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  point: number;
  remark: string;
}

export const COLLEGE_CONFIG = {
  COLLEGE_NAME: "Labe College of Nursing Sciences, Gboko",
  COLLEGE_SHORT: "LCNS",
  MOTTO: "Learn, Serve & Save",
  OFFICIAL_EMAIL: "info@lcns.edu.ng",
  ADMIN_EMAIL: "info@lcns.edu.ng",
  ADMIN_EMAIL2: "lcns.ict@gmail.com",
  ADMIN_PASS: "admin123",
  SUPPORT_PHONE: "08126799565 ICT",
  LOCATION: "Off Gboko Hill, Along Agbile Road, Gboko, Benue State, Nigeria",
  PHYSICAL_ADDRESS: "Off Gboko Hill, Along Agbile Road, Gboko, Benue State",
  PRIMARY_COLOR: "#0a4d2e",
  SECONDARY_COLOR: "#22c55e",
  ACCENT_COLOR: "#ca8a04",
  DIOCESE: "Catholic Diocese of Gboko",
  ESTABLISHMENT_LAW: "Established by Benue State Law 2026",
  GOVERNOR: "His Excellency, Rev. Fr. Dr. Hyacinth Iormem Alia",
  BISHOP: "Most Rev. William Avenya",
  PROGRAMME_NAME: "ND/HND Nursing Sciences (4-Year Uninterrupted Collegiate Programme)",
  PROGRAMME_DURATION: "4 Years (2 Years ND + 2 Years HND)",
  AWARDS: "ND & HND Nursing Sciences, RN & RPHN Licenses (NMCN), NYSC Mobilization",
  MATRIC_PREFIX: "LCNS",
  SHEET_URL: "https://script.google.com/macros/s/AKfycbxzjD6Z9ytBYjZtdJoEJHSB6PoXh_uRixcbBhsqTisvrSnoQK9EHImtKeCmMI-9113O/exec",
  CURRENT_SESSION: "2026/2027",
  CURRENT_SEMESTER: "First",
  MIN_JAMB_SCORE: 150,
  GRADING: [
    { min: 70, max: 100, grade: "A", point: 5, remark: "Excellent" },
    { min: 60, max: 69, grade: "B", point: 4, remark: "Very Good" },
    { min: 50, max: 59, grade: "C", point: 3, remark: "Good" },
    { min: 40, max: 49, grade: "D", point: 2, remark: "Pass" },
    { min: 0, max: 39, grade: "F", point: 0, remark: "Fail - Carryover" }
  ] as GradingScale[]
};
