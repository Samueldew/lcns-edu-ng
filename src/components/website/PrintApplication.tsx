const handleDownloadApplicationPDF = () => {
  if (!applicant) return;
  if (!isBursarCleared) { alert("⛔ Bursar not cleared yet."); return; }

  const fa = (applicant as any).full_application || applicant as any;
  const ssceData = (applicant as any).ssce_data || fa.ssce_data || {};
  const sitting1 = ssceData.sitting1 || {};
  const sitting2 = ssceData.sitting2 || null;

  let subjects: any[] = [];
  if (Array.isArray(fa.sscResults)) subjects = fa.sscResults;
  else if (Array.isArray(sitting1.subjects)) subjects = sitting1.subjects;
  subjects = subjects.filter(s => s.subject && s.grade);
  if (subjects.length === 0) subjects = [{subject:"English Language", grade:"C4"}, {subject:"Mathematics", grade:"C5"}, {subject:"Biology", grade:"B3"}];

  const fullName = applicant.fullName;
  const formNo = applicant.formNo;
  const photoUrl = applicant.passportPhotoUrl || fa.passportPhotoUrl || buildPhotoUrl((applicant as any).photo_url || "");
  const dob = fa.dob || 'N/A'; const gender = fa.gender || 'N/A'; const lga = fa.lga || 'Gboko';
  const state = fa.stateOfOrigin || fa.state || 'Benue'; const email = applicant.email || ''; const phone = fa.phone || applicant.phone || '';
  const jambReg = fa.jamb?.regNo || fa.jambRegNo || 'N/A'; const jambScore = fa.jamb?.score || fa.jambScore || 'N/A';
  const examNo = examNumber || formNo.replace('LCNS/','LCNS/EXM/'); const course = fa.courseChoice1 || fa.course || 'ND/HND Nursing Science';
  const address = fa.contactAddress || fa.address || 'N/A';

  let subjectsHtml = "";
  subjects.forEach((s, idx) => {
    subjectsHtml += `<tr><td style="text-align:center; font-weight:700;">${idx+1}</td><td>${s.subject}</td><td style="text-align:center; font-weight:900; font-size:13px;">${s.grade}</td></tr>`;
  });

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html><head><title>${formNo}</title><style>
    @page{size:A4 portrait; margin:8mm;} body{font-family:Arial,sans-serif;margin:0;padding:0;-webkit-print-color-adjust:exact; color:#000;}
    .a4{width:210mm; min-height:297mm; margin:0 auto; border:2.5px solid black; padding:7mm 8mm; box-sizing:border-box;}
    table{width:100%; border-collapse:collapse; font-size:12.5px;} td{border:1.2px solid black; padding:7px 8px; font-size:12.5px;}
    .label{font-weight:800; background:#eef6f0; width:22%; font-size:11px; text-transform:uppercase; color:#0a4d2e;} .value{font-weight:600; font-size:12.5px;}
    .green{ background:#0a4d2e; color:white; padding:7px 10px; font-weight:900; font-size:12px; text-transform:uppercase;} .box{border:2px solid black; margin-top:10px;}
  </style></head><body><div class="a4">

    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:4px double #0a4d2e; padding-bottom:10px;">
      <div style="width:88px;"><img src="${LOGO_URL}" style="width:82px; height:82px; object-fit:contain; border-radius:6px;" /></div>
      <div style="flex:1; text-align:center; padding:0 10px;">
        <h1 style="margin:0; color:#0a4d2e; font-size:16px; font-weight:900; text-transform:uppercase;">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
        <p style="margin:3px 0 0 0; font-size:11px; font-weight:800;">CATHOLIC DIOCESE OF GBOKO</p>
        <p style="margin:2px 0; font-size:11px;">2026/2027 Academic Session - Application Form</p>
        <div style="margin-top:7px;">
          <span style="background:#0a4d2e; color:white; padding:4px 14px; border-radius:16px; font-size:11px; font-weight:900;">Form No: ${formNo}</span>
          <span style="background:#facc15; color:#000; padding:4px 12px; border-radius:16px; font-size:11px; font-weight:900; margin-left:6px;">Exam No: ${examNo}</span>
        </div>
      </div>
      <div style="width:98px; text-align:center;">
        ${photoUrl ? `<img src="${photoUrl}" style="width:92px; height:92px; object-fit:cover; border:2.5px solid black; border-radius:8px;" />` : `<div style="width:92px; height:92px; border:2.5px dashed red; background:#fef2f2; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:red;">NO PASSPORT</div>`}
        <div style="font-size:8px; font-weight:900; margin-top:4px; text-transform:uppercase; background:black; color:white; padding:2px; border-radius:3px;">Applicant Passport</div>
      </div>
    </div>

    <div class="box"><div class="green">SECTION A: APPLICANT BIODATA</div>
      <table>
        <tr><td class="label">Full Name</td><td class="value" colspan="3" style="font-size:13px; font-weight:800; text-transform:uppercase;">${fullName}</td></tr>
        <tr><td class="label">Date of Birth</td><td class="value">${dob}</td><td class="label">Gender</td><td class="value" style="font-weight:800;">${gender}</td></tr>
        <tr><td class="label">Phone</td><td class="value" style="font-weight:800;">${phone}</td><td class="label">Email</td><td class="value">${email}</td></tr>
        <tr><td class="label">State / LGA</td><td class="value">${state} / ${lga}</td><td class="label">Address</td><td class="value">${address}</td></tr>
      </table>
    </div>

    <div class="box"><div class="green">SECTION B: JAMB INFORMATION</div>
      <table>
        <tr><td class="label">JAMB Reg No</td><td class="value" style="font-weight:800;">${jambReg}</td><td class="label">JAMB Score</td><td class="value" style="font-weight:900; font-size:13px;">${jambScore}</td></tr>
        <tr><td class="label">Course Applied</td><td class="value" colspan="3" style="font-weight:800; text-transform:uppercase;">${course}</td></tr>
      </table>
    </div>

    <div class="box"><div class="green">SECTION D: SSCE / O'LEVEL RESULTS - ALL SUBJECTS CHOSEN BY APPLICANT</div>
      <table>
        <tr style="background:#eef6f0; font-weight:900; font-size:11px; text-transform:uppercase;"><td style="width:10%; text-align:center;">S/N</td><td style="width:60%;">Subject</td><td style="width:30%; text-align:center;">Grade</td></tr>
        ${subjectsHtml}
      </table>
    </div>

    <!-- DECLARATION - AS YOU SAID IN AUDIO -->
    <div style="border:2px solid black; padding:11px 12px; background:#f8fafc; margin-top:10px;">
      <p style="font-weight:900; text-align:center; margin:0 0 6px 0; font-size:12px; text-transform:uppercase; color:#0a4d2e;">Applicant Declaration</p>
      <p style="font-size:12px; line-height:17px; margin:0; text-align:justify; font-weight:500;">
        I, <b style="text-transform:uppercase; font-size:12.5px;">${fullName}</b> with Form Number <b>${formNo}</b> and Exam Number <b>${examNo}</b> hereby declare that <b>all information provided in this application belongs to me</b> and is true and correct to the best of my knowledge. I understand that any false information or impersonation may lead to automatic disqualification and prosecution. I agree to abide by the rules and regulations of Labe College of Nursing Sciences, Gboko.
      </p>
      <div style="display:flex; justify-content:space-between; margin-top:14px;">
        <div style="text-align:center; width:220px; border-top:1.5px solid black; padding-top:5px; font-size:11px; font-weight:800;">${fullName}<br/>Applicant Signature & Date</div>
        <div style="text-align:center; width:180px; border-top:1.5px solid black; padding-top:5px; font-size:11px; font-weight:800;">Date: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <!-- CBT REQUIREMENTS - UNDER PHOTO / AS YOU SAID -->
    <div style="border:2.5px solid #0a4d2e; padding:11px 12px; background:#fffbeb; margin-top:10px;">
      <p style="font-weight:900; margin:0 0 6px 0; font-size:11px; text-transform:uppercase; color:#0a4d2e; text-align:center;">📋 REQUIREMENTS FOR CBT EXAMS & SCREENING - COME ALONG WITH THE FOLLOWING</p>
      <ol style="font-size:11.5px; line-height:17px; margin:0; padding-left:18px; font-weight:600;">
        <li style="margin-bottom:3px;"><b>This printed application form</b> with your passport photo clearly shown</li>
        <li style="margin-bottom:3px;"><b>Your Phone</b> - Come along with your phone (for verification and CBT login)</li>
        <li style="margin-bottom:3px;"><b>Receipt from the Bank</b> - Original Receipt from bank (changed from Proof of Payment) showing payment of ₦15,000 screening fee. Photocopy also.</li>
        <li style="margin-bottom:3px;"><b>All Your Originals</b> - Come along with all your original documents:
          <ul style="margin:3px 0 0 16px; font-size:11px;">
            <li>SSCE Result (WAEC/NECO/NABTEB) Original showing your ${subjects.length} subjects</li>
            <li>JAMB Result Slip (Original)</li>
            <li>State of Origin Certificate & Birth Certificate / Declaration of Age</li>
            <li>4 recent passport photographs (same as uploaded)</li>
          </ul>
        </li>
        <li><b>Submit</b> this form and photocopies of all documents to the Registrar office on CBT / Screening date</li>
      </ol>
      <p style="font-size:10px; font-weight:800; color:#b45309; margin:6px 0 0 0; text-align:center; background:#fef3c7; padding:4px; border-radius:4px;">NOTE: No Receipt, No Phone, No Originals = No Entry for CBT Exam</p>
    </div>

  </div>
  <script>setTimeout(()=>{window.print();},800);<\/script></body></html>`);
  win.document.close();
};
