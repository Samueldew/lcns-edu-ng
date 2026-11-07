// src/utils/gpa.ts - NBTE / Nursing ND System

export function getGradePoint(score: number) {
  if (score >= 70) return { grade: 'A', point: 4.0 };
  if (score >= 60) return { grade: 'AB', point: 3.5 };
  if (score >= 50) return { grade: 'B', point: 3.0 };
  if (score >= 45) return { grade: 'BC', point: 2.5 };
  if (score >= 40) return { grade: 'C', point: 2.0 };
  if (score >= 35) return { grade: 'CD', point: 1.5 };
  if (score >= 30) return { grade: 'D', point: 1.0 };
  return { grade: 'F', point: 0 };
}

// GPA for one semester
export function calculateGPA(results: any[]) {
  let totalPoints = 0;
  let totalUnits = 0;
  const detailed = results.map((r: any) => {
    const score = Number(r.score ?? r.total_score ?? r.totalScore ?? 0);
    const unit = Number(r.credit_unit ?? r.unit ?? r.units ?? 0);
    const { grade, point } = getGradePoint(score);
    const qualityPoint = point * unit;
    totalPoints += qualityPoint;
    totalUnits += unit;
    return { ...r, score, unit, grade, point, qualityPoint };
  });
  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
  return { detailed, totalPoints, totalUnits, gpa: Number(gpa.toFixed(2)) };
}

// CGPA across ALL semesters - do NOT average GPAs
export function calculateCGPA(allResults: any[]) {
  return calculateGPA(allResults); // same formula, just all semesters together
}
