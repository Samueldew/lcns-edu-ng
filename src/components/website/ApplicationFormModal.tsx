  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportPhotoUrl || !paymentReceiptPdfUrl) {
      alert('Both Passport Photograph and Proof of Bank Payment are required.');
      return;
    }

    setSubmitting(true);
    try {
      // === FORCED ND/HND 4YEARS ===
      const forcedCourse1 = 'ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4)';
      const forcedCourse2 = 'ND/HND Nursing Sciences - 4 Years Collegiate';
      const forcedProgram = 'ND/HND Nursing Sciences (4 Years)';
      
      const applicantData = {
        fullName,
        email,
        phone,
        gender,
        dob,
        stateOfOrigin,
        lga,
        address,
        courseChoice1: forcedCourse1,
        courseChoice2: forcedCourse2,
        program: forcedProgram as any,
        jambRegNo,
        jambScore,
        passportPhotoUrl,
        paymentReceiptPdfUrl,
        paymentReceiptName: paymentReceiptName || 'Proof_of_Payment.pdf',
        olevelExamType,
        olevelExamYear,
        olevelGrades: {
          english,
          mathematics,
          biology,
          chemistry,
          physics,
        },
        sponsorName: sponsorName || 'Parent / Guardian',
        sponsorPhone: sponsorPhone || phone,
      };

      // === 1. FIRST SAVE TO SUPABASE BACKEND (REAL APPLICANT) ===
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
        const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const formNo = `LCNS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*100)}`;
          
          // Insert to public.applications table - MAIN TABLE FOR BURSAR
          const { error: appError } = await supabase.from('applications').insert({
            id: formNo,
            applicant_name: fullName,
            email: email,
            phone: phone,
            choice_one: forcedCourse1,
            choice_two: forcedCourse2,
            jamb_reg_no: jambRegNo,
            jamb_score: jambScore,
            status: 'PENDING_BURSAR',
            full_data: applicantData,
            biodata: {
              gender, dob, stateOfOrigin, lga, address, 
              sponsorName, sponsorPhone,
              olevel: { olevelExamType, olevelExamYear, english, mathematics, biology, chemistry, physics }
            },
            created_at: new Date().toISOString()
          });
          
          if (appError) {
            console.warn('applications insert error:', appError.message);
          } else {
            console.log('✅ Saved to applications table:', formNo);
          }

          // Also insert to college_applications for backup
          await supabase.from('college_applications').insert({
            form_no: formNo,
            full_application: applicantData,
            status: 'PENDING_BURSAR',
            created_at: new Date().toISOString()
          });

          // Attach formNo to applicantData for ApiService
          (applicantData as any).formNo = formNo;
        }
      } catch (supaErr: any) {
        console.warn('Supabase direct insert skipped:', supaErr.message);
        // Continue to ApiService - don't block
      }

      // === 2. THEN SAVE VIA ApiService (localStorage fallback) ===
      const result = await ApiService.submitApplication(applicantData);
      setSubmittedApplicant(result);
      setSubmitting(false);

      // Celebration
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

    } catch (err: any) {
      setSubmitting(false);
      alert('Error submitting application: ' + err.message);
      console.error(err);
    }
  };
