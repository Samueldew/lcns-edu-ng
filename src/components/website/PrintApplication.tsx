export function printFullApplicationForm(app: any) {
  const w = window.open("", "_blank");
  if (!w) return;

  const photo = app.photo_url || app.full_application?.passportPhotoUrl || app.passport_url || "";
  const logo = "/lcns-logo.png.jpg";
  const biodata = app.full_application || app.application_data || app;
  
  const jamb = biodata.jamb || biodata.jambInfo || {};
  const ssc = biodata.sscResults || biodata.ssc_details || biodata.oLevel || [];
  const sponsor = biodata.sponsor || biodata.guardian || {};
  
  // JAMB data - no centre, no first choice
  const jambRegNo = jamb.regNo || biodata.jambRegNo || biodata.jambNumber || biodata.jamb_registration_number || biodata.jambNo || app.jamb_reg_no || "";
  const jambScore = jamb.score || jamb.totalScore || biodata.jambScore || biodata.utmeScore || app.jamb_score || "";
  const jambYear = jamb.year || biodata.jambYear || biodata.utmeYear || "2026";
  const jambSubjects = jamb.subjects || biodata.jambSubjects || [];
  
  w.document.write(`
  <html>
  <head>
    <title>LCNS Application Form - ${app.form_no || app.application_number}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #111; line-height: 1.4; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #000; padding-bottom: 10px; }
      .logo { width: 90px; height: 90px; object-fit: contain; }
      .school { text-align: center; flex: 1; }
      .school h1 { margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; color: #0a3326; }
      .school h2 { margin: 2px 0; font-size: 11px; font-weight: 700; }
      .school h3 { margin: 4px 0; font-size: 14px; font-weight: 900; background: #0a3326; color: white; display: inline-block; padding: 3px 12px; border-radius: 4px; }
      .passport { width: 110px; height: 130px; object-fit: cover; border: 2px solid #000; border-radius: 4px; }
      .app-no { text-align: center; margin: 10px 0; font-weight: 900; font-size: 12px; background: #fef9c3; border: 1px solid #000; padding: 6px; }
      .section { margin-top: 12px; border: 1px solid #000; border-radius: 4px; overflow: hidden; }
      .section-title { background: #0a3326; color: white; padding: 5px 10px; font-weight: 900; font-size: 12px; text-transform: uppercase; }
      .section-body { padding: 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
      .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 20px; }
      .field { border-bottom: 1px dotted #999; padding: 3px 0; }
      .field b { font-size: 11px; color: #444; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th, td { border: 1px solid #000; padding: 5px; text-align: left; font-size: 11px; }
      th { background: #f0fdf4; }
      .exam-box { background: #fffbeb; border: 2px solid #f59e0b; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; }
      .exam-box div { font-weight: 800; }
      .jamb-box { background: #eff6ff; border: 2px solid #2563eb; padding: 10px; border-radius: 6px; }
      .declaration { margin-top: 18px; border: 1px solid #000; padding: 12px; border-radius: 4px; }
      .sign-row { display: flex; justify-content: space-between; margin-top: 30px; }
      .sign { width: 45%; border-top: 1px solid #000; padding-top: 5px; text-align: center; font-weight: 700; font-size: 11px; }
      .footer { margin-top: 15px; background: #fef2f2; border: 2px solid #dc2626; padding: 8px; text-align: center; font-weight: 900; font-size: 11px; border-radius: 6px; }
      @media print { button { display: none; } }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="${logo}" class="logo" onerror="this.style.display='none'" />
      <div class="school">
        <h1>Labe College of Nursing Sciences, Gboko</h1>
        <h2>College of Nursing Sciences Gboko, Benue State</h2>
        <h2>PMB 101, Gboko - Benue State, Nigeria</h2>
        <h3>APPLICATION FORM 2026/2027 Academic Session</h3>
      </div>
      ${photo ? `<img src="${photo}" class="passport" />` : `<div class="passport" style="display:flex;align-items:center;justify-content:center;font-size:10px">No Photo</div>`}
    </div>

    <div class="app-no">APPLICATION NUMBER: ${app.form_no || app.application_number} | EXAM NO: ${app.exam_no || app.exam_number || 'N/A'} | JAMB NO: ${jambRegNo || 'N/A'} | DATE: ${new Date().toLocaleDateString()}</div>

    <div class="section">
      <div class="section-title">A. BIODATA - Personal Information</div>
      <div class="section-body">
        <div class="grid">
          <div class="field"><b>Full Name:</b> ${app.full_name || biodata.fullName || ''}</div>
          <div class="field"><b>Gender:</b> ${biodata.gender || biodata.sex || ''}</div>
          <div class="field"><b>Date of Birth:</b> ${biodata.dob || biodata.dateOfBirth || ''}</div>
          <div class="field"><b>Phone:</b> ${biodata.phone || app.phone || ''}</div>
          <div class="field"><b>Email:</b> ${biodata.email || app.email || ''}</div>
          <div class="field"><b>State of Origin:</b> ${biodata.stateOfOrigin || biodata.state || ''}</div>
          <div class="field"><b>LGA:</b> ${biodata.lga || ''}</div>
          <div class="field"><b>Marital Status:</b> ${biodata.maritalStatus || ''}</div>
          <div class="field"><b>Address:</b> ${biodata.address || biodata.contactAddress || ''}</div>
          <div class="field"><b>Program/Course:</b> ${biodata.program || app.course || app.program || 'Nursing'}</div>
          <div class="field"><b>Religion:</b> ${biodata.religion || ''}</div>
          <div class="field"><b>Next of Kin:</b> ${biodata.nextOfKinName || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">B. JAMB / UTME INFORMATION</div>
      <div class="section-body">
        <div class="jamb-box">
          <div class="grid3">
            <div class="field"><b>JAMB Registration Number:</b> ${jambRegNo || 'N/A'}</div>
            <div class="field"><b>JAMB Score / Total:</b> ${jambScore || 'N/A'}</div>
            <div class="field"><b>JAMB Year:</b> ${jambYear}</div>
          </div>
          <div style="margin-top:8px">
            <b>JAMB Subject Combination & Scores:</b>
            <table>
              <tr><th>S/N</th><th>Subject</th><th>Score</th></tr>
              ${(jambSubjects && jambSubjects.length > 0 ? jambSubjects : [
                { subject: biodata.jambSubject1 || 'English Language', score: biodata.jambScore1 || '' },
                { subject: biodata.jambSubject2 || 'Biology', score: biodata.jambScore2 || '' },
                { subject: biodata.jambSubject3 || 'Chemistry', score: biodata.jambScore3 || '' },
                { subject: biodata.jambSubject4 || 'Physics', score: biodata.jambScore4 || '' },
              ].filter(s=>s.subject)).map((s:any,i:number)=>`
                <tr><td>${i+1}</td><td>${s.subject || s.name || ''}</td><td>${s.score || s.mark || ''}</td></tr>
              `).join('') || '<tr><td colspan="3">JAMB subjects not filled</td></tr>'}
              <tr style="background:#dbeafe;font-weight:900"><td colspan="2">TOTAL JAMB SCORE</td><td>${jambScore || ''}</td></tr>
            </table>
          </div>
          <p style="font-size:9px;margin-top:4px">JAMB Result Slip: ${biodata.jambResultUrl ? 'Uploaded' : 'Not uploaded'} | Status: ${biodata.jambStatus || 'Verified'}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">C. SSC / O'LEVEL RESULT DETAILS - As Uploaded</div>
      <div class="section-body">
        <p><b>Exam Type:</b> ${biodata.sscExamType || biodata.examType || 'WAEC/NECO'} | <b>Year:</b> ${biodata.sscYear || ''} | <b>Exam No:</b> ${biodata.sscExamNumber || ''}</p>
        <table>
          <tr><th>S/N</th><th>Subject</th><th>Grade</th></tr>
          ${(Array.isArray(ssc) && ssc.length > 0 ? ssc : [
            { subject: biodata.subject1, grade: biodata.grade1 },
            { subject: biodata.subject2, grade: biodata.grade2 },
            { subject: biodata.subject3, grade: biodata.grade3 },
            { subject: biodata.subject4, grade: biodata.grade4 },
            { subject: biodata.subject5, grade: biodata.grade5 },
            { subject: biodata.subject6, grade: biodata.grade6 },
            { subject: biodata.subject7, grade: biodata.grade7 },
            { subject: biodata.subject8, grade: biodata.grade8 },
          ].filter(s=>s.subject)).map((s:any,i:number)=>`
            <tr><td>${i+1}</td><td>${s.subject || s.name || ''}</td><td>${s.grade || s.score || ''}</td></tr>
          `).join('') || '<tr><td colspan="3">No SSC details filled</td></tr>'}
        </table>
        <p style="font-size:10px;margin-top:4px">Uploads: ${biodata.sscResultUrl ? 'SSC Result Uploaded' : 'Not uploaded'} | Other Docs: ${biodata.otherDocs || 'N/A'}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">D. SPONSOR / NEXT OF KIN DETAILS</div>
      <div class="section-body">
        <div class="grid">
          <div class="field"><b>Sponsor Name:</b> ${sponsor.name || biodata.sponsorName || biodata.nextOfKinName || ''}</div>
          <div class="field"><b>Relationship:</b> ${sponsor.relationship || biodata.sponsorRelationship || ''}</div>
          <div class="field"><b>Sponsor Phone:</b> ${sponsor.phone || biodata.sponsorPhone || ''}</div>
          <div class="field"><b>Sponsor Address:</b> ${sponsor.address || biodata.sponsorAddress || ''}</div>
          <div class="field"><b>Next of Kin:</b> ${biodata.nextOfKinName || ''}</div>
          <div class="field"><b>Next of Kin Phone:</b> ${biodata.nextOfKinPhone || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">E. EXAMINATION DETAILS - Attitude / CBT Test</div>
      <div class="section-body">
        <div class="exam-box">
          <div>Exam Date: ${app.exam_date || 'To be set'}</div>
          <div>Batch: ${app.exam_batch || 'Not batched - 35/hr'}</div>
          <div>Time: ${app.exam_time_slot || 'Pending'}</div>
          <div>Venue: School CBT Centre</div>
        </div>
        <p style="font-size:10px;margin-top:6px">Note: If miss batch due to network/light, can join NEXT batch (later), not earlier batch. Example: Batch A 9-10am misses, can write 10-11am till 6pm.</p>
      </div>
    </div>

    <div class="declaration">
      <b>DECLARATION:</b> I, <b>${app.full_name}</b>, JAMB No: ${jambRegNo} Score: ${jambScore}, declare that all information including JAMB details, biodata, SSC, sponsor are true and correct. False info = disqualification.
      <div class="sign-row">
        <div class="sign">Candidate Name: ${app.full_name}<br/>JAMB Reg: ${jambRegNo}<br/>Date: ${new Date().toLocaleDateString()}</div>
        <div class="sign">Candidate Signature<br/><br/><br/>_________________________</div>
      </div>
    </div>

    <div class="footer">
      IMPORTANT: Come along with this printed Application Form, Original JAMB Result (Reg: ${jambRegNo} Score: ${jambScore}), SSC originals, evidence of payment on exam day and submit at Registrar Office. Without this form you will NOT be allowed to write exam.
      <br/><br/>
      <button onclick="window.print()" style="padding:10px 25px;background:#0a3326;color:white;border:none;border-radius:8px;font-weight:900;cursor:pointer">🖨️ PRINT NOW</button>
    </div>
  </body>
  </html>
  `);
  w.document.close();
}
