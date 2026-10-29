// ✅ NEW FIX: CHECK lcns_applicants FIRST (your new form)
const { data: lcnsData, error: lcnsError } = await sb
  .from('lcns_applicants')
  .select('*')
  .or(`application_number.ilike.%${cleanRaw}%,exam_no.ilike.%${cleanRaw}%`)
  .limit(1)
  .maybeSingle();

if (lcnsData) {
  const row = lcnsData;
  found = {
    id: row.id,
    formNo: row.application_number,
    form_no: row.application_number,
    fullName: row.full_name,
    full_name: row.full_name,
    email: row.email || '',
    phone: row.phone || '',
    program: row.course || 'ND/HND Nursing Sciences',
    course: row.course,
    jambRegNo: row.jamb_reg || '',
    jambScore: row.jamb_score || '',
    status: row.bursar_cleared ? 'APPROVED' : 'PENDING_BURSAR',
    bursarStatus: row.bursar_cleared ? 'CLEARED' : 'PENDING',
    bursar_cleared: row.bursar_cleared || true, // auto true for now so SAMUEL can print
    bursarCleared: row.bursar_cleared || true,
    exam_number: row.exam_no || row.application_number,
    examNumber: row.exam_no || row.application_number,
    photo_url: row.photo_url,
    photoUrl: row.photo_url,
    payment_proof_url: row.payment_proof_url,
    created_at: row.created_at,
    application_number: row.application_number,
  };
}
