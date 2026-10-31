export function printFullApplicationForm(app: any) {
  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) {
    alert("Pop-up blocked! Please allow pop-ups for lcns.edu.ng and try again.");
    return;
  }

  const photo = app.photo_url || app.full_application?.passportPhotoUrl || app.passport_url || app.application_data?.passportUrl || "";
  const logo = "/lcns-logo.png"; // FIXED - you had .png.jpg
  const biodata = app.full_application || app.application_data || app;
  
  const jamb = biodata.jamb || biodata.jambInfo || {};
  const ssc = biodata.sscResults || biodata.ssc_details || biodata.oLevel || [];
  const sponsor = biodata.sponsor || biodata.guardian || {};
  
  const jambRegNo = jamb.regNo || biodata.jambRegNo || biodata.jambNumber || biodata.jamb_registration_number || app.jamb_reg_no || "";
  const jambScore = jamb.score || jamb.totalScore || biodata.jambScore || biodata.utmeScore || app.jamb_score || "";
  const jambYear = jamb.year || biodata.jambYear || "2026";
  const jambSubjects = jamb.subjects || biodata.jambSubjects || [];
  const safe = (v: any) => (v == null ? "" : String(v).replace(/</g, "&lt;"));

  w.document.write(`
  <html>
  <head>
    <title>LCNS Application - ${safe(app.form_no || app.application_number)}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, sans-serif; font-size: 11px; color: #111; line-height: 1.35; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #000; padding-bottom: 10px; }
      .logo { width: 90px; height: 90px; object-fit: contain; }
      .school { text-align: center; flex: 1; }
      .school h1 { margin: 0; font-size: 17px; font-weight: 900; text-transform: uppercase; color: #0a3326; }
      .school h2 { margin: 2px 0; font-size: 10px; font-weight: 700; }
      .school h3 { margin: 4px 0; font-size: 13px; font-weight: 900; background: #0a3326; color: white; display: inline-block; padding: 3px 12px; border-radius: 4px; }
      .passport { width: 110px; height: 130px; object-fit: cover; border: 2px solid #000; border-radius: 4px; }
      .app-no { text-align: center; margin: 10px 0; font-weight: 900; font-size: 11px; background: #fef9c3; border: 1px solid #000; padding: 6px; }
      .section { margin-top: 10px; border: 1px solid #000; border-radius: 4px; overflow: hidden; }
      .section-title { background: #0a3326; color: white; padding: 5px 10px; font-weight: 900; font-size: 11px; text-transform: uppercase; }
      .section-body { padding: 8px 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 18px; }
      .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px 18px; }
      .field { border-bottom: 1px dotted #999; padding: 3px 0; }
      .field b { font-size: 10px; color: #444; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th, td { border: 1px solid #000; padding: 4px 5px; text-align: left; font-size: 10px; }
      th { background: #f0fdf4; }
      .jamb-box { background: #eff6ff; border: 2px solid #2563eb; padding: 8px; border-radius: 6px; }
      .exam-box { background: #fffbeb; border: 2px solid #f59e0b; padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; }
      .declaration { margin-top: 14px; border: 1px solid #000; padding: 10px; border-radius: 4px; font-size: 10px; }
      .sign-row { display: flex; justify-content: space-between; margin-top: 24px; }
      .sign { width: 45%; border-top: 1px solid #000; padding-top: 5px; text-align: center; font-weight: 700; font-size: 10px; }
      .footer { margin-top: 12px; background: #fef2f2; border: 2px solid #dc2626; padding: 8px; text-align: center; font-weight: 900; font-size: 10px; border-radius: 6px; }
      @media print { .no-print { display: none !important; } }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="${logo}" class="logo" onerror="this.src='/vite.svg'" />
      <div class="school">
        <h1>Labe College of Nursing Sciences, Gboko</h1>
        <h2>Catholic Diocese of Gboko, Benue State</h2>
        <h2>PMB 101, Gboko - Benue State</h2>
        <h3>APPLICATION FORM 2026/2027</h3>
      </div>
      ${photo ? `<img src="${safe(photo)}" class="passport" onerror="this.style.display='none'" />` : `<div class="passport" style="display:flex;align-items:center;justify-content:center;font-size:9px">No Photo</div>`}
    </div>

    <div class="app-no">APPLICATION NUMBER: ${safe(app.form_no || app.application_number)} | EXAM NO: ${safe(app.exam_no || app.exam_number || 'N/A')} | JAMB NO: ${safe(jambRegNo || 'N/A')} | DATE: ${new Date().toLocaleDateString()}</div>

    <div class="section"><div class="section-title">A. BIODATA</div><div class="section-body"><div class="grid">
      <div class="field"><b>Full Name:</b> ${safe(app.full_name || biodata.fullName)}</div>
      <div class="field"><b>Gender:</b> ${safe(biodata.gender || biodata.sex)}</div>
      <div class="field"><b>DOB:</b> ${safe(biodata.dob || biodata.dateOfBirth)}</div>
      <div class="field"><b>Phone:</b> ${safe(biodata.phone || app.phone)}</div>
      <div class="field"><b>Email:</b> ${safe(biodata.email || app.email)}</div>
      <div class="field"><b>State:</b> ${safe(biodata.stateOfOrigin || biodata.state)}</div>
      <div class="field"><b>LGA:</b> ${safe(biodata.lga)}</div>
      <div class="field"><b>Address:</b> ${safe(biodata.address || biodata.contactAddress)}</div>
      <div class="field"><b>Program:</b> ${safe(biodata.program || app.course || 'ND/HND Nursing')}</div>
      <div class="field"><b>Religion:</b> ${safe(biodata.religion)}</div>
    </div></div></div>

    <div class="section"><div class="section-title">B. JAMB / UTME</div><div class="section-body"><div class="jamb-box">
      <div class="grid3">
        <div class="field"><b>JAMB Reg No:</b> ${safe(jambRegNo || 'N/A')}</div>
        <div class="field"><b>JAMB Score:</b> ${safe(jambScore || 'N/A')}</div>
        <div class="field"><b>Year:</b> ${safe(jambYear)}</div>
      </div>
      <div style="margin-top:6px"><b>Subject Combination:</b>
        <table><tr><th>S/N</th><th>Subject</th><th>Score</th></tr>
        ${(jambSubjects && jambSubjects.length>0 ? jambSubjects : [
          {subject: biodata.jambSubject1 || 'English', score: biodata.jambScore1},
          {subject: biodata.jambSubject2 || 'Biology', score: biodata.jambScore2},
          {subject: biodata.jambSubject3 || 'Chemistry', score: biodata.jambScore3},
          {subject: biodata.jambSubject4 || 'Physics', score: biodata.jambScore4},
        ].filter((s:any)=>s.subject)).map((s:any,i:number)=>`<tr><td>${i+1}</td><td>${safe(s.subject || s.name)}</td><td>${safe(s.score)}</td></tr>`).join('') || '<tr><td colspan="3">Not filled</td></tr>'}
        <tr style="background:#dbeafe;font-weight:900"><td colspan="2">TOTAL</td><td>${safe(jambScore)}</td></tr>
        </table>
      </div>
    </div></div></div>

    <div class="section"><div class="section-title">C. SSC / O'LEVEL</div><div class="section-body">
      <p style="margin:0 0 4px"><b>Type:</b> ${safe(biodata.sscExamType || 'WAEC/NECO')} | <b>Year:</b> ${safe(biodata.sscYear)} | <b>Exam No:</b> ${safe(biodata.sscExamNumber)}</p>
      <table><tr><th>S/N</th><th>Subject</th><th>Grade</th></tr>
      ${(Array.isArray(ssc) && ssc.length>0 ? ssc : [
        {subject:biodata.subject1, grade:biodata.grade1},{subject:biodata.subject2, grade:biodata.grade2},{subject:biodata.subject3, grade:biodata.grade3},{subject:biodata.subject4, grade:biodata.grade4},{subject:biodata.subject5, grade:biodata.grade5},{subject:biodata.subject6, grade:biodata.grade6},{subject:biodata.subject7, grade:biodata.grade7},{subject:biodata.subject8, grade:biodata.grade8},
      ].filter((s:any)=>s.subject)).map((s:any,i:number)=>`<tr><td>${i+1}</td><td>${safe(s.subject || s.name)}</td><td>${safe(s.grade)}</td></tr>`).join('') || '<tr><td colspan="3">No SSC details</td></tr>'}
      </table>
    </div></div>

    <div class="section"><div class="section-title">D. SPONSOR / NEXT OF KIN</div><div class="section-body"><div class="grid">
      <div class="field"><b>Sponsor:</b> ${safe(sponsor.name || biodata.sponsorName || biodata.nextOfKinName)}</div>
      <div class="field"><b>Relationship:</b> ${safe(sponsor.relationship || biodata.sponsorRelationship)}</div>
      <div class="field"><b>Phone:</b> ${safe(sponsor.phone || biodata.sponsorPhone)}</div>
      <div class="field"><b>Address:</b> ${safe(sponsor.address || biodata.sponsorAddress)}</div>
    </div></div></div>

    <div class="section"><div class="section-title">E. EXAMINATION DETAILS</div><div class="section-body"><div class="exam-box">
      <div><b>Date:</b> ${safe(app.exam_date || 'To be set')}</div><div><b>Batch:</b> ${safe(app.exam_batch || '35/hr')}</div><div><b>Time:</b> ${safe(app.exam_time_slot || 'Pending')}</div><div><b>Venue:</b> School CBT Centre</div>
    </div><p style="font-size:9px;margin-top:4px">If miss batch due to network/light, can join NEXT batch (later), not earlier.</p></div></div>

    <div class="declaration">
      <b>DECLARATION:</b> I, <b>${safe(app.full_name)}</b>, JAMB No: ${safe(jambRegNo)} Score: ${safe(jambScore)}, declare all info are true.
      <div class="sign-row"><div class="sign">Candidate: ${safe(app.full_name)}<br/>Reg: ${safe(jambRegNo)}<br/>Date: ${new Date().toLocaleDateString()}</div><div class="sign">Signature<br/><br/>_________________________</div></div>
    </div>

    <div class="footer">
      Come with this form, Original JAMB Result (Reg: ${safe(jambRegNo)} Score: ${safe(jambScore)}), SSC originals, payment evidence on exam day.
      <br/><br/>
      <button onclick="window.print()" class="no-print" style="padding:10px 25px;background:#0a3326;color:white;border:none;border-radius:8px;font-weight:900;cursor:pointer">🖨️ PRINT NOW</button>
    </div>
  </body>
  </html>`);
  w.document.close();
  setTimeout(()=>w.focus(), 300);
}
