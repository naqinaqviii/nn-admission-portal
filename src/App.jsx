import { useState, useRef, useEffect, useCallback } from "react";
import supabase from "./supabaseClient"; // Supabase connection file (default export)

/* ═══════════════════════════════════════════════════════════════
   PALETTE  — Midnight Blue + Electric Teal + Warm White
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:        "#f0f4f8",
  card:      "#ffffff",
  navy:      "#0b1e3d",
  navyMid:   "#13305e",
  navyLight: "#1a4080",
  teal:      "#0ea5a0",
  tealLight: "#2dd4bf",
  tealPale:  "#e6faf9",
  gold:      "#f5a623",
  goldPale:  "#fff8ec",
  text:      "#0f2035",
  muted:     "#5a7184",
  border:    "#d1dce8",
  borderFocus:"#0ea5a0",
  error:     "#dc2626",
  errorPale: "#fff1f1",
  success:   "#059669",
  successPale:"#ecfdf5",
  stripe1:   "#0b1e3d",
  stripe2:   "#0ea5a0",
};

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const STEPS = [
  { id:"personal",   label:"Personal",   icon:"👤", desc:"Identity & contact" },
  { id:"academic",   label:"Academic",   icon:"🎓", desc:"Education history" },
  { id:"program",    label:"Program",    icon:"🏛", desc:"Course selection" },
  { id:"experience", label:"Profile",    icon:"💼", desc:"Experience & goals" },
  { id:"documents",  label:"Documents",  icon:"📎", desc:"Upload files" },
  { id:"review",     label:"Review",     icon:"✅", desc:"Confirm & submit" },
];

const FACULTIES = {
  "Faculty of Engineering": ["Computer Engineering","Electrical Engineering","Mechanical Engineering","Civil Engineering","Software Engineering","Biomedical Engineering","Chemical Engineering"],
  "Faculty of Computing": ["BS Computer Science","BS Data Science","BS Artificial Intelligence","BS Cybersecurity","BS Information Technology","BS Software Engineering"],
  "Faculty of Business": ["BBA","BS Accounting & Finance","BS Economics","BS Marketing","BS HRM","BS Supply Chain Management"],
  "Faculty of Medicine": ["MBBS","BDS","BS Nursing","BS Pharmacy","BS Physiotherapy","BS Public Health"],
  "Faculty of Law": ["LLB (5-Year)","LLB (3-Year)","BS Criminology","BS Political Science","BS International Relations"],
  "Faculty of Arts & Design": ["BFA Fine Arts","BS Architecture","BS Interior Design","BS Graphic Design","BS Fashion Design"],
  "Faculty of Natural Sciences": ["BS Chemistry","BS Physics","BS Mathematics","BS Statistics","BS Biotechnology","BS Environmental Science"],
  "Faculty of Education": ["BS Education","MEd (Evening)","BS Special Education","BS Early Childhood"],
};

const PROVINCES  = ["Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan","Gilgit-Baltistan","Azad Kashmir","Islamabad Capital Territory"];
const COUNTRIES  = ["Pakistan","Afghanistan","Bangladesh","India","Iran","Saudi Arabia","UAE","UK","USA","Canada","China","Other"];
const RELIGIONS  = ["Islam","Christianity","Hinduism","Sikhism","Other","Prefer not to say"];
const BLOOD_GRP  = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"];
const GRADES     = ["A+","A","A-","B+","B","B-","C+","C","D","Distinction","Merit","Pass"];
const DISABILITY = ["None","Visual Impairment","Hearing Impairment","Physical Disability","Learning Disability","Other"];
const HEAR_FROM  = ["Social Media","Friend / Family","School / College","Newspaper / Magazine","Google Search","University Fair","TV / Radio","Other"];
const SHIFTS     = ["Morning (8am–2pm)","Evening (2pm–8pm)"];
const INTAKES    = ["Fall 2025","Spring 2026","Fall 2026"];
const QUOTAS     = ["Open Merit","Sports","Disabled","Province Seat","Overseas Pakistani","Minority","Staff Ward","None"];

const blankWork = () => ({ employer:"", title:"", from:"", to:"", current:false, desc:"" });
const blankCert = () => ({ name:"", org:"", year:"", url:"" });
const blankRef  = () => ({ name:"", relation:"", org:"", email:"", phone:"" });

const INIT = {
  /* personal */
  photo:null, photoURL:null,
  appType:"Undergraduate",
  firstName:"", lastName:"", fatherName:"", motherName:"", guardianName:"",
  cnic:"", dob:"", gender:"", marital:"Single", religion:"", bloodGroup:"",
  nationality:"Pakistani", domicile:"", disability:"None", disabilityDetail:"",
  email:"", phone:"", whatsapp:"", altPhone:"",
  address:"", city:"", district:"", postalCode:"", country:"Pakistan",
  sameAddress:false,
  corrAddress:"", corrCity:"", corrPostal:"",
  emergencyName:"", emergencyRelation:"", emergencyPhone:"", emergencyEmail:"",
  /* academic */
  matric_board:"", matric_year:"", matric_grade:"", matric_pct:"", matric_total:"", matric_obtained:"", matric_subjects:"",
  inter_board:"", inter_year:"", inter_grade:"", inter_pct:"", inter_total:"", inter_obtained:"", inter_subjects:"", inter_group:"",
  hasOLevel:false, oLevel_grades:"", oLevel_year:"",
  hasALevel:false, aLevel_grades:"", aLevel_year:"",
  hasBachelors:false, bach_uni:"", bach_degree:"", bach_year:"", bach_cgpa:"", bach_major:"",
  hasMasters:false, mast_uni:"", mast_degree:"", mast_year:"", mast_cgpa:"",
  gapYear:false, gapReason:"",
  /* program */
  faculty:"", program:"", shift:"", intake:"Fall 2025", quota:"Open Merit",
  secondChoice:"", secondProgram:"",
  hostel:false, transport:false, transportRoute:"",
  scholarshipApply:false, scholarshipType:"",
  testName:"", testScore:"", testDate:"",
  howHeard:"",
  /* experience */
  hasWork:false, work:[ blankWork() ],
  hasExtra:false, extra:"",
  hasCert:false, certs:[ blankCert() ],
  hasRef:false, refs:[ blankRef() ],
  personalStatement:"",
  achievements:"",
  /* documents */
  doc_cnic:null, doc_photo:null, doc_matric:null, doc_inter:null,
  doc_domicile:null, doc_character:null, doc_migration:null,
  doc_hafiz:null, doc_sports:null, doc_scholarship:null, doc_other:null,
  /* review */
  declaration:false, dataConsent:false, feeConsent:false,
};

/* ═══════════════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════════════ */
const validate = (step, f) => {
  const e = {};
  if (step === 0) {
    if (!f.firstName.trim())  e.firstName = "First name required";
    if (!f.lastName.trim())   e.lastName  = "Last name required";
    if (!f.fatherName.trim()) e.fatherName= "Father's name required";
    if (!f.cnic.trim())       e.cnic      = "CNIC/B-Form required";
    if (!f.dob)               e.dob       = "Date of birth required";
    if (!f.gender)            e.gender    = "Gender required";
    if (!f.domicile)          e.domicile  = "Domicile province required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Valid email required";
    if (!/^\d{10,11}$/.test(f.phone.replace(/\D/g,""))) e.phone = "10–11 digit number required";
    if (!f.address.trim())    e.address   = "Address required";
    if (!f.city.trim())       e.city      = "City required";
    if (!f.emergencyName.trim())  e.emergencyName  = "Required";
    if (!f.emergencyPhone.trim()) e.emergencyPhone = "Required";
    if (!f.emergencyRelation.trim()) e.emergencyRelation = "Required";
  }
  if (step === 1) {
    if (!f.matric_board.trim()) e.matric_board = "Board required";
    if (!f.matric_year)         e.matric_year  = "Year required";
    if (!f.matric_grade)        e.matric_grade = "Grade required";
    if (!f.matric_pct.trim())   e.matric_pct   = "Percentage required";
    if (!f.inter_board.trim())  e.inter_board  = "Board required";
    if (!f.inter_year)          e.inter_year   = "Year required";
    if (!f.inter_grade)         e.inter_grade  = "Grade required";
    if (!f.inter_pct.trim())    e.inter_pct    = "Percentage required";
  }
  if (step === 2) {
    if (!f.faculty)  e.faculty  = "Faculty required";
    if (!f.program)  e.program  = "Program required";
    if (!f.shift)    e.shift    = "Shift required";
  }
  if (step === 4) {
    if (!f.doc_cnic)   e.doc_cnic   = "CNIC copy required";
    if (!f.doc_photo)  e.doc_photo  = "Photo required";
    if (!f.doc_matric) e.doc_matric = "Matric cert. required";
    if (!f.doc_inter)  e.doc_inter  = "Inter cert. required";
  }
  if (step === 5) {
    if (!f.declaration) e.declaration = "Declaration acceptance required";
    if (!f.dataConsent) e.dataConsent = "Data consent required";
    if (!f.feeConsent)  e.feeConsent  = "Fee consent required";
  }
  return e;
};

/* ═══════════════════════════════════════════════════════════════
   ATOMS
═══════════════════════════════════════════════════════════════ */
const iSt = (err) => ({
  width:"100%", boxSizing:"border-box", padding:"10px 13px", borderRadius:8,
  border:`1.5px solid ${err ? C.error : C.border}`,
  background: err ? C.errorPale : "#fff",
  color:C.text, fontSize:14, outline:"none", fontFamily:"inherit",
  transition:"border-color .2s, background .2s",
});

const onF = e => e.target.style.borderColor = C.teal;
const onB = (err) => e => e.target.style.borderColor = err ? C.error : C.border;

const F = ({ label, req, err, children, h, t, style={} }) => (
  <div style={{ flex: t?"0 0 calc(33.33% - 10px)": h?"0 0 calc(50% - 8px)":"1 1 100%", minWidth:0, ...style }}>
    {label && <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", color:C.navyMid, textTransform:"uppercase", marginBottom:5, display:"block" }}>
      {label}{req && <span style={{ color:C.error, marginLeft:2 }}>*</span>}
    </label>}
    {children}
    {err && <div style={{ fontSize:11, color:C.error, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>⚠ {err}</div>}
  </div>
);

const Inp = ({ name, value, onChange, errors={}, type="text", placeholder, min, max, disabled }) => (
  <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
    min={min} max={max} disabled={disabled}
    style={{ ...iSt(errors[name]), ...(disabled?{opacity:.6,cursor:"not-allowed"}:{}) }}
    onFocus={onF} onBlur={onB(errors[name])} />
);

const Sel = ({ name, value, onChange, errors={}, options, placeholder }) => (
  <select name={name} value={value} onChange={onChange}
    style={{ ...iSt(errors[name]), cursor:"pointer" }}
    onFocus={onF} onBlur={onB(errors[name])}>
    <option value="">{placeholder||"Select…"}</option>
    {options.map(o => typeof o==="string"
      ? <option key={o} value={o}>{o}</option>
      : <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

const TA = ({ name, value, onChange, placeholder, rows=4 }) => (
  <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ ...iSt(false), resize:"vertical", lineHeight:1.65 }}
    onFocus={onF} onBlur={onB(false)} />
);

const Toggle = ({ label, checked, name, onChange, sub }) => (
  <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", userSelect:"none" }}>
    <div onClick={() => onChange({ target:{ name, type:"checkbox", checked:!checked } })}
      style={{ width:44, height:24, borderRadius:12, background:checked?C.teal:C.border, transition:"background .25s", position:"relative", flexShrink:0, marginTop:2 }}>
      <div style={{ position:"absolute", top:3, left:checked?22:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </div>
    <div>
      <div style={{ fontSize:14, color:C.text, fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{sub}</div>}
    </div>
  </label>
);

const CB = ({ label, checked, name, onChange, err }) => (
  <div>
    <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange}
        style={{ marginTop:3, accentColor:C.teal, width:16, height:16, flexShrink:0 }} />
      <span style={{ fontSize:13, color:C.text, lineHeight:1.65 }}>{label}</span>
    </label>
    {err && <div style={{ fontSize:11, color:C.error, marginTop:3, marginLeft:26 }}>⚠ {err}</div>}
  </div>
);

const SecHead = ({ icon, title, sub }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, paddingBottom:12,
    borderBottom:`2px solid ${C.tealPale}` }}>
    <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.navy},${C.teal})`,
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:14, fontWeight:800, color:C.navy }}>{title}</div>
      {sub && <div style={{ fontSize:12, color:C.muted }}>{sub}</div>}
    </div>
  </div>
);

const InfoBox = ({ children, type="info" }) => {
  const s = { info:{ bg:C.tealPale, border:C.tealLight, text:C.navyMid },
               warn:{ bg:C.goldPale, border:C.gold, text:"#7a5a00" },
               error:{ bg:C.errorPale, border:C.error, text:C.error } }[type];
  return <div style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:9, padding:"13px 16px", fontSize:12.5, color:s.text, lineHeight:1.7, marginTop:10 }}>{children}</div>;
};

const Pill = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} style={{
    padding:"7px 16px", borderRadius:20, border:`1.5px solid ${active?C.teal:C.border}`,
    background:active?C.teal:"#fff", color:active?"#fff":C.muted,
    fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"inherit",
  }}>{label}</button>
);

/* ═══════════════════════════════════════════════════════════════
   PHOTO UPLOAD
═══════════════════════════════════════════════════════════════ */
const PhotoUpload = ({ form, setForm }) => {
  const ref = useRef();
  return (
    <div style={{ display:"flex", gap:20, alignItems:"center", background:`linear-gradient(135deg,${C.tealPale},#f0f8ff)`,
      border:`2px dashed ${C.teal}`, borderRadius:14, padding:"20px 24px", marginBottom:24 }}>
      <div onClick={()=>ref.current.click()} style={{ width:96, height:112, borderRadius:10,
        border:`2.5px solid ${C.teal}`, background:"#fff", display:"flex", alignItems:"center",
        justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0, position:"relative" }}>
        {form.photoURL
          ? <img src={form.photoURL} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
          : <div style={{ textAlign:"center", color:C.muted }}>
              <div style={{ fontSize:30 }}>📷</div>
              <div style={{ fontSize:10, marginTop:4, lineHeight:1.4 }}>Upload<br/>Photo</div>
            </div>}
        {form.photoURL && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"center",
          justifyContent:"center", opacity:0, transition:"opacity .2s" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,.4)";e.currentTarget.style.opacity="1"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0)";e.currentTarget.style.opacity="0"}}>
          <span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>Change</span>
        </div>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden
        onChange={e=>{ const f=e.target.files[0]; if(f) setForm(p=>({...p,photo:f,photoURL:URL.createObjectURL(f)})); }} />
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:6 }}>Passport Size Photograph</div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>
          ✦ Plain white or light background<br/>
          ✦ Clear, front-facing photo<br/>
          ✦ Taken within last 6 months<br/>
          ✦ JPG or PNG, max 2MB
        </div>
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <button type="button" onClick={()=>ref.current.click()} style={{ padding:"7px 16px", borderRadius:7,
            border:`1.5px solid ${C.teal}`, background:"#fff", color:C.teal, fontSize:12,
            fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {form.photo?"Change Photo":"Browse File"}
          </button>
          {form.photo && <button type="button" onClick={()=>setForm(p=>({...p,photo:null,photoURL:null}))} style={{ padding:"7px 14px",
            borderRadius:7, border:`1.5px solid ${C.error}`, background:C.errorPale, color:C.error,
            fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Remove</button>}
        </div>
        {form.photo && <div style={{ fontSize:11, color:C.teal, marginTop:6 }}>✓ {form.photo.name}</div>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT BOX
═══════════════════════════════════════════════════════════════ */
const DocBox = ({ name, label, req, icon, accept=".pdf,.jpg,.jpeg,.png", form, setForm, errors={} }) => {
  const ref = useRef();
  const file = form[name];
  const sizeOk = !file || file.size < 5*1024*1024;
  return (
    <div style={{ flex:"0 0 calc(50% - 8px)", minWidth:0 }}>
      <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", color:C.navyMid,
        textTransform:"uppercase", marginBottom:5, display:"block" }}>
        {label}{req&&<span style={{ color:C.error, marginLeft:2 }}>*</span>}
      </label>
      <div onClick={()=>ref.current.click()} style={{
        border:`2px dashed ${errors[name]?C.error: file?C.teal:C.border}`,
        borderRadius:10, padding:"14px 12px", textAlign:"center", cursor:"pointer",
        background: file ? C.tealPale : "#fafcff",
        transition:"all .2s", position:"relative",
      }}
        onMouseEnter={e=>e.currentTarget.style.background=C.tealPale}
        onMouseLeave={e=>e.currentTarget.style.background=file?C.tealPale:"#fafcff"}>
        <input ref={ref} type="file" accept={accept} hidden
          onChange={e=>setForm(p=>({...p,[name]:e.target.files[0]||null}))} />
        <div style={{ fontSize:22, marginBottom:4 }}>{file?"✅":icon}</div>
        <div style={{ fontSize:12, fontWeight:600, color:file?C.teal:C.muted, wordBreak:"break-all", lineHeight:1.4 }}>
          {file ? file.name : "Click to upload"}
        </div>
        <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>PDF · JPG · PNG · max 5MB</div>
        {file && <div style={{ fontSize:10, color:sizeOk?C.teal:C.error, marginTop:2 }}>
          {sizeOk ? `${(file.size/1024).toFixed(0)} KB` : "⚠ File too large!"}
        </div>}
      </div>
      {errors[name] && <div style={{ fontSize:11, color:C.error, marginTop:3 }}>⚠ {errors[name]}</div>}
      {file && <button type="button" onClick={e=>{e.stopPropagation();setForm(p=>({...p,[name]:null}))}}
        style={{ marginTop:4, fontSize:11, color:C.error, background:"none", border:"none",
          cursor:"pointer", fontFamily:"inherit" }}>✕ Remove</button>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ACADEMIC ROW
═══════════════════════════════════════════════════════════════ */
const AcadBox = ({ title, prefix, form, onChange, errors, extra }) => (
  <div style={{ background:"#f8faff", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"18px 20px", marginBottom:16 }}>
    <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:C.teal }} />{title}
    </div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
      <F label="Board / University" req={prefix!=="mast"} err={errors[`${prefix}_board`]} h>
        <Inp name={`${prefix}_board`} value={form[`${prefix}_board`]||""} onChange={onChange} errors={errors} placeholder="e.g. BISE Karachi / Uni name" />
      </F>
      <F label="Year" req={prefix!=="mast"} err={errors[`${prefix}_year`]} t>
        <Sel name={`${prefix}_year`} value={form[`${prefix}_year`]||""} onChange={onChange} errors={errors}
          options={Array.from({length:25},(_,i)=>String(2025-i))} placeholder="Year" />
      </F>
      <F label="Grade" req={prefix!=="mast"} err={errors[`${prefix}_grade`]} t>
        <Sel name={`${prefix}_grade`} value={form[`${prefix}_grade`]||""} onChange={onChange} errors={errors} options={GRADES} placeholder="Grade" />
      </F>
      <F label={prefix==="bach"||prefix==="mast"?"CGPA":"Percentage %"} req={prefix!=="mast"} err={errors[`${prefix}_pct`]} t>
        <Inp name={`${prefix}_pct`} value={form[`${prefix}_pct`]||""} onChange={onChange} errors={errors}
          placeholder={prefix==="bach"||prefix==="mast"?"e.g. 3.5":"e.g. 78.5"} />
      </F>
      {(prefix==="matric"||prefix==="inter") && <>
        <F label="Total Marks" t><Inp name={`${prefix}_total`} value={form[`${prefix}_total`]||""} onChange={onChange} errors={{}} placeholder="e.g. 1100" /></F>
        <F label="Obtained Marks" t><Inp name={`${prefix}_obtained`} value={form[`${prefix}_obtained`]||""} onChange={onChange} errors={{}} placeholder="e.g. 943" /></F>
        <F label="Main Subjects" h><Inp name={`${prefix}_subjects`} value={form[`${prefix}_subjects`]||""} onChange={onChange} errors={{}} placeholder="e.g. Physics, Chemistry, Math" /></F>
      </>}
      {prefix==="inter" && <F label="Group / Pre-" t><Sel name="inter_group" value={form.inter_group||""} onChange={onChange} errors={{}} options={["Pre-Medical","Pre-Engineering","Commerce","Humanities","Computer Science","General Science","Other"]} placeholder="Group" /></F>}
      {(prefix==="bach"||prefix==="mast") && <>
        <F label="University Name" h><Inp name={`${prefix}_uni`} value={form[`${prefix}_uni`]||""} onChange={onChange} errors={{}} placeholder="University name" /></F>
        <F label="Degree Title" h><Inp name={`${prefix}_degree`} value={form[`${prefix}_degree`]||""} onChange={onChange} errors={{}} placeholder="e.g. BS Computer Science" /></F>
        {prefix==="bach" && <F label="Major"><Inp name="bach_major" value={form.bach_major||""} onChange={onChange} errors={{}} placeholder="Major field" /></F>}
      </>}
      {extra}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STEP 0 — PERSONAL
═══════════════════════════════════════════════════════════════ */
const S0 = ({ form, onChange, setForm, errors }) => {
  const today = new Date().toISOString().split("T")[0];
  return (
  <div>
    <PhotoUpload form={form} setForm={setForm} />

    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", color:C.navyMid, textTransform:"uppercase", marginBottom:8 }}>Application Type</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {["Undergraduate","Postgraduate","PhD","Diploma / Certificate"].map(t => (
          <Pill key={t} label={t} active={form.appType===t} onClick={()=>setForm(f=>({...f,appType:t}))} />
        ))}
      </div>
    </div>

    <SecHead icon="👤" title="Basic Information" sub="As per your CNIC / B-Form / Passport" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="First Name"    req err={errors.firstName}   h><Inp name="firstName"   value={form.firstName}   onChange={onChange} errors={errors} placeholder="Muhammad" /></F>
      <F label="Last Name"     req err={errors.lastName}    h><Inp name="lastName"    value={form.lastName}    onChange={onChange} errors={errors} placeholder="Ahmed" /></F>
      <F label="Father's Name" req err={errors.fatherName}  h><Inp name="fatherName"  value={form.fatherName}  onChange={onChange} errors={errors} placeholder="Abdul Rahman" /></F>
      <F label="Mother's Name"     err={errors.motherName}  h><Inp name="motherName"  value={form.motherName}  onChange={onChange} errors={errors} placeholder="Fatima Bibi" /></F>
      <F label="Guardian Name (if different)" err={errors.guardianName} h><Inp name="guardianName" value={form.guardianName} onChange={onChange} errors={errors} placeholder="If different from father" /></F>
      <F label="CNIC / B-Form / Passport No." req err={errors.cnic} h><Inp name="cnic" value={form.cnic} onChange={onChange} errors={errors} placeholder="42301-1234567-8" /></F>
      <F label="Date of Birth" req err={errors.dob}  t><Inp name="dob" type="date" value={form.dob} onChange={onChange} errors={errors} max={today} /></F>
      <F label="Gender"  req err={errors.gender}  t><Sel name="gender" value={form.gender} onChange={onChange} errors={errors} options={["Male","Female","Non-binary","Prefer not to say"]} placeholder="Select" /></F>
      <F label="Marital Status" t><Sel name="marital" value={form.marital} onChange={onChange} errors={{}} options={["Single","Married","Divorced","Widowed"]} /></F>
      <F label="Religion" t><Sel name="religion" value={form.religion} onChange={onChange} errors={{}} options={RELIGIONS} /></F>
      <F label="Blood Group" t><Sel name="bloodGroup" value={form.bloodGroup} onChange={onChange} errors={{}} options={BLOOD_GRP} /></F>
      <F label="Nationality" h><Sel name="nationality" value={form.nationality} onChange={onChange} errors={{}} options={COUNTRIES} /></F>
      <F label="Domicile Province" req err={errors.domicile} h><Sel name="domicile" value={form.domicile} onChange={onChange} errors={errors} options={PROVINCES} placeholder="Select province" /></F>
      <F label="Disability / Special Need"><Sel name="disability" value={form.disability} onChange={onChange} errors={{}} options={DISABILITY} /></F>
      {form.disability!=="None"&&form.disability!==""&&<F label="Disability Details" h><Inp name="disabilityDetail" value={form.disabilityDetail} onChange={onChange} errors={{}} placeholder="Please describe" /></F>}
    </div>

    <div style={{ height:20 }} />
    <SecHead icon="📞" title="Contact Information" sub="Use your own active numbers and email" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Email Address"  req err={errors.email} h><Inp name="email" type="email" value={form.email} onChange={onChange} errors={errors} placeholder="you@email.com" /></F>
      <F label="WhatsApp No."  t><Inp name="whatsapp" value={form.whatsapp} onChange={onChange} errors={{}} placeholder="Same as phone?" /></F>
      <F label="Mobile Number" req err={errors.phone} t><Inp name="phone" value={form.phone} onChange={onChange} errors={errors} placeholder="0300-1234567" /></F>
      <F label="Alternate Phone" t><Inp name="altPhone" value={form.altPhone} onChange={onChange} errors={{}} placeholder="Optional" /></F>
    </div>

    <div style={{ height:20 }} />
    <SecHead icon="🏠" title="Address Details" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Permanent Address" req err={errors.address}><Inp name="address" value={form.address} onChange={onChange} errors={errors} placeholder="House No., Street, Area" /></F>
      <F label="City / Town" req err={errors.city}  t><Inp name="city" value={form.city} onChange={onChange} errors={errors} placeholder="Karachi" /></F>
      <F label="District"  t><Inp name="district" value={form.district} onChange={onChange} errors={{}} placeholder="District" /></F>
      <F label="Postal Code" t><Inp name="postalCode" value={form.postalCode} onChange={onChange} errors={{}} placeholder="75300" /></F>
      <F label="Country"><Sel name="country" value={form.country} onChange={onChange} errors={{}} options={COUNTRIES} /></F>
    </div>
    <div style={{ marginTop:12, marginBottom:12 }}>
      <Toggle label="Correspondence address is same as permanent address" name="sameAddress" checked={form.sameAddress} onChange={e=>setForm(f=>({...f,sameAddress:e.target.checked}))} />
    </div>
    {!form.sameAddress && <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Correspondence Address"><Inp name="corrAddress" value={form.corrAddress} onChange={onChange} errors={{}} placeholder="Correspondence address" /></F>
      <F label="Corr. City" h><Inp name="corrCity" value={form.corrCity} onChange={onChange} errors={{}} placeholder="City" /></F>
      <F label="Corr. Postal" h><Inp name="corrPostal" value={form.corrPostal} onChange={onChange} errors={{}} placeholder="Postal code" /></F>
    </div>}

    <div style={{ height:20 }} />
    <SecHead icon="🚨" title="Emergency Contact" sub="Person to contact in case of emergency" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Full Name"     req err={errors.emergencyName}     t><Inp name="emergencyName"     value={form.emergencyName}     onChange={onChange} errors={errors} placeholder="Full name" /></F>
      <F label="Relationship"  req err={errors.emergencyRelation} t><Inp name="emergencyRelation" value={form.emergencyRelation} onChange={onChange} errors={errors} placeholder="Father / Mother / Spouse" /></F>
      <F label="Phone Number"  req err={errors.emergencyPhone}    t><Inp name="emergencyPhone"    value={form.emergencyPhone}    onChange={onChange} errors={errors} placeholder="03XX-XXXXXXX" /></F>
      <F label="Email (optional)" h><Inp name="emergencyEmail" value={form.emergencyEmail} onChange={onChange} errors={{}} placeholder="emergency@email.com" /></F>
    </div>
  </div>
);};

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — ACADEMIC
═══════════════════════════════════════════════════════════════ */
const S1 = ({ form, onChange, setForm, errors }) => (
  <div>
    <SecHead icon="🎓" title="Secondary Education (Matric / O-Level)" sub="Grade 9–10 or equivalent" />
    <AcadBox title="Matriculation / SSC" prefix="matric" form={form} onChange={onChange} errors={errors} />

    <div style={{ marginBottom:16 }}>
      <Toggle label="I also have O-Level results" name="hasOLevel" checked={form.hasOLevel} onChange={e=>setForm(f=>({...f,hasOLevel:e.target.checked}))} sub="Cambridge / Edexcel GCSE" />
      {form.hasOLevel && <div style={{ marginTop:12, paddingLeft:54 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
          <F label="O-Level Subject Grades (all subjects)">
            <TA name="oLevel_grades" value={form.oLevel_grades} onChange={onChange} placeholder="Subject - Grade (e.g. Physics - A*, Math - A, Chemistry - B)" rows={3} />
          </F>
          <F label="Year" h><Sel name="oLevel_year" value={form.oLevel_year} onChange={onChange} errors={{}} options={Array.from({length:15},(_,i)=>String(2024-i))} placeholder="Year" /></F>
        </div>
      </div>}
    </div>

    <SecHead icon="🏫" title="Higher Secondary (Intermediate / A-Level)" sub="Grade 11–12 or equivalent" />
    <AcadBox title="Intermediate / HSSC / FA / FSc" prefix="inter" form={form} onChange={onChange} errors={errors} />

    <div style={{ marginBottom:16 }}>
      <Toggle label="I also have A-Level results" name="hasALevel" checked={form.hasALevel} onChange={e=>setForm(f=>({...f,hasALevel:e.target.checked}))} sub="Cambridge / Edexcel A-Level" />
      {form.hasALevel && <div style={{ marginTop:12, paddingLeft:54 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
          <F label="A-Level Subject Grades (all subjects)">
            <TA name="aLevel_grades" value={form.aLevel_grades} onChange={onChange} placeholder="Subject - Grade (e.g. Physics - A, Math - B, CS - A*)" rows={3} />
          </F>
          <F label="Year" h><Sel name="aLevel_year" value={form.aLevel_year} onChange={onChange} errors={{}} options={Array.from({length:15},(_,i)=>String(2024-i))} placeholder="Year" /></F>
        </div>
      </div>}
    </div>

    <SecHead icon="🏛" title="Higher Education (If applicable)" sub="Bachelor's and above — fill if you hold a previous degree" />
    <div style={{ marginBottom:14 }}>
      <Toggle label="I hold a Bachelor's degree" name="hasBachelors" checked={form.hasBachelors} onChange={e=>setForm(f=>({...f,hasBachelors:e.target.checked}))} />
      {form.hasBachelors && <div style={{ marginTop:12 }}><AcadBox title="Bachelor's Degree" prefix="bach" form={form} onChange={onChange} errors={errors} /></div>}
    </div>
    <div style={{ marginBottom:14 }}>
      <Toggle label="I hold a Master's degree" name="hasMasters" checked={form.hasMasters} onChange={e=>setForm(f=>({...f,hasMasters:e.target.checked}))} />
      {form.hasMasters && <div style={{ marginTop:12 }}><AcadBox title="Master's Degree" prefix="mast" form={form} onChange={onChange} errors={errors} /></div>}
    </div>
    <div style={{ marginBottom:14 }}>
      <Toggle label="I have a gap year / break in education" name="gapYear" checked={form.gapYear} onChange={e=>setForm(f=>({...f,gapYear:e.target.checked}))} sub="Explanation may be required" />
    {form.gapYear && <div style={{ marginTop:12, paddingLeft:54 }}>
        <F label="Reason for gap year"><TA name="gapReason" value={form.gapReason} onChange={onChange} placeholder="Briefly explain your gap year…" rows={3} /></F>
      </div>}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — PROGRAM
═══════════════════════════════════════════════════════════════ */
const S2 = ({ form, onChange, setForm, errors }) => {
  const programs = form.faculty ? FACULTIES[form.faculty]||[] : [];
  const programs2 = form.secondFaculty ? FACULTIES[form.secondFaculty]||[] : [];
  return (
  <div>
    <SecHead icon="🏛" title="Program Selection" sub="Select your primary program carefully — this cannot be changed after submission" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Faculty / School" req err={errors.faculty} h>
        <Sel name="faculty" value={form.faculty} onChange={e=>{onChange(e);setForm(f=>({...f,faculty:e.target.value,program:""}))}} errors={errors}
          options={Object.keys(FACULTIES)} placeholder="Select faculty first" />
      </F>
      <F label="Program" req err={errors.program} h>
        <Sel name="program" value={form.program} onChange={onChange} errors={errors}
          options={programs} placeholder={form.faculty?"Choose program":"Select faculty first"} />
      </F>
      <F label="Intake Session" req err={errors.intake} t>
        <Sel name="intake" value={form.intake} onChange={onChange} errors={{}} options={INTAKES} />
      </F>
      <F label="Preferred Shift" req err={errors.shift} t>
        <Sel name="shift" value={form.shift} onChange={onChange} errors={errors} options={SHIFTS} placeholder="Select shift" />
      </F>
      <F label="Admission Quota" t>
        <Sel name="quota" value={form.quota} onChange={onChange} errors={{}} options={QUOTAS} />
      </F>
    </div>

    {form.faculty&&form.program&&(
      <InfoBox>
        🎯 <strong>Primary Choice:</strong> {form.program} &nbsp;|&nbsp; 📅 {form.intake} &nbsp;|&nbsp; 🕐 {form.shift}
      </InfoBox>
    )}

    <div style={{ height:20 }} />
    <SecHead icon="2️⃣" title="Second Choice Program" sub="Optional — will be considered if seats unavailable in first choice" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Second Faculty" h>
        <Sel name="secondFaculty" value={form.secondFaculty||""} onChange={e=>{onChange(e);setForm(f=>({...f,secondFaculty:e.target.value,secondProgram:""}))}} errors={{}}
          options={Object.keys(FACULTIES)} placeholder="Optional" />
      </F>
      <F label="Second Program" h>
        <Sel name="secondProgram" value={form.secondProgram||""} onChange={onChange} errors={{}}
          options={programs2} placeholder={form.secondFaculty?"Choose program":"Select faculty first"} />
      </F>
    </div>

    <div style={{ height:20 }} />
    <SecHead icon="📝" title="Entrance Test Information" sub="If you have appeared in HEC-NAT, SAT, MDCAT, ECAT or university test" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
      <F label="Test Name" t>
        <Sel name="testName" value={form.testName} onChange={onChange} errors={{}}
          options={["HEC-NAT","SAT","MDCAT","ECAT","NUMS","MCAT","University Test","Other"]} placeholder="Select test" />
      </F>
      <F label="Score / Percentile" t><Inp name="testScore" value={form.testScore} onChange={onChange} errors={{}} placeholder="e.g. 75%" /></F>
      <F label="Test Date" t><Inp name="testDate" type="date" value={form.testDate} onChange={onChange} errors={{}} /></F>
    </div>

    <div style={{ height:20 }} />
    <SecHead icon="⚙️" title="Additional Services" sub="Optional — applicable fees will be added to your fee challan" />
    <div style={{ background:"#f8faff", border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
      <Toggle label="On-Campus Hostel Accommodation" name="hostel" checked={form.hostel} onChange={e=>setForm(f=>({...f,hostel:e.target.checked}))} sub="Male & female hostels available on campus" />
      <Toggle label="University Transport Service" name="transport" checked={form.transport} onChange={e=>setForm(f=>({...f,transport:e.target.checked}))} sub="Door-to-door pickup & drop routes available" />
      {form.transport&&<div style={{ paddingLeft:54 }}>
        <F label="Your Area / Route"><Inp name="transportRoute" value={form.transportRoute} onChange={onChange} errors={{}} placeholder="e.g. Gulshan-e-Iqbal, Clifton, PECHS…" /></F>
      </div>}
      <Toggle label="Applying for Merit / Need-Based Scholarship" name="scholarshipApply" checked={form.scholarshipApply} onChange={e=>setForm(f=>({...f,scholarshipApply:e.target.checked}))} />
      {form.scholarshipApply&&<div style={{ paddingLeft:54 }}>
        <F label="Scholarship Type"><Sel name="scholarshipType" value={form.scholarshipType} onChange={onChange} errors={{}} options={["HEC Need-Based","HEC Merit-Based","University Merit","Sports Scholarship","Disabled Person","Minority Scholarship","Other"]} placeholder="Select type" /></F>
        <InfoBox type="warn">⚠️ Scholarship applicants must upload supporting documents (income certificate, bank statement, etc.) in the Documents section.</InfoBox>
      </div>}
      <F label="How did you hear about NN-University?">
        <Sel name="howHeard" value={form.howHeard} onChange={onChange} errors={{}} options={HEAR_FROM} placeholder="Select source" />
      </F>
    </div>
  </div>
);};

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — EXPERIENCE & PROFILE
═══════════════════════════════════════════════════════════════ */
const S3 = ({ form, onChange, setForm }) => {
  const updWork = (i,k,v) => setForm(f=>({...f,work:f.work.map((w,idx)=>idx===i?{...w,[k]:v}:w)}));
  const updCert = (i,k,v) => setForm(f=>({...f,certs:f.certs.map((c,idx)=>idx===i?{...c,[k]:v}:c)}));
  const updRef  = (i,k,v) => setForm(f=>({...f,refs:f.refs.map((r,idx)=>idx===i?{...r,[k]:v}:r)}));

  const dynInp = (val, onChange, placeholder) => (
    <input value={val} onChange={onChange} placeholder={placeholder}
      style={iSt(false)} onFocus={onF} onBlur={onB(false)} />
  );

  return (
  <div>
    <SecHead icon="💼" title="Work Experience" sub="Include jobs, internships, freelance, family business — all count" />
    <Toggle label="I have work or internship experience to declare" name="hasWork" checked={form.hasWork} onChange={e=>setForm(f=>({...f,hasWork:e.target.checked}))} />
    {form.hasWork&&<div style={{ marginTop:14 }}>
      {form.work.map((w,i)=>(
        <div key={i} style={{ background:"#f8faff", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>Experience #{i+1}</div>
            {i>0&&<button type="button" onClick={()=>setForm(f=>({...f,work:f.work.filter((_,x)=>x!==i)}))}
              style={{ background:"none", border:"none", color:C.error, cursor:"pointer", fontSize:13, fontWeight:700 }}>✕ Remove</button>}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            <F label="Employer / Organization" h>{dynInp(w.employer,e=>updWork(i,"employer",e.target.value),"Organization name")}</F>
            <F label="Job Title / Role"        h>{dynInp(w.title,   e=>updWork(i,"title",   e.target.value),"e.g. Software Intern")}</F>
            <F label="From" t><input type="month" value={w.from} onChange={e=>updWork(i,"from",e.target.value)} style={iSt(false)} onFocus={onF} onBlur={onB(false)} /></F>
            <F label="To"   t>
              <input type="month" value={w.to} onChange={e=>updWork(i,"to",e.target.value)} disabled={w.current}
                style={{...iSt(false),...(w.current?{opacity:.5,cursor:"not-allowed"}:{})}} onFocus={onF} onBlur={onB(false)} />
            </F>
            <F t style={{ display:"flex", alignItems:"flex-end", paddingBottom:2 }}>
              <CB label="Currently working here" name={`curr_${i}`} checked={w.current} onChange={e=>updWork(i,"current",e.target.checked)} />
            </F>
            <F label="Responsibilities / Description">
              <textarea value={w.desc} onChange={e=>updWork(i,"desc",e.target.value)} rows={2}
                placeholder="Key responsibilities, projects, achievements…"
                style={{...iSt(false),resize:"vertical",lineHeight:1.6}} onFocus={onF} onBlur={onB(false)} />
            </F>
          </div>
        </div>
      ))}
      <button type="button" onClick={()=>setForm(f=>({...f,work:[...f.work,blankWork()]}))}
        style={{ padding:"9px 18px", border:`1.5px dashed ${C.teal}`, borderRadius:8,
          background:C.tealPale, color:C.teal, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
        + Add Another Experience
      </button>
    </div>}

    <div style={{ height:22 }} />
    <SecHead icon="⚽" title="Extracurricular & Leadership" sub="Sports, student council, clubs, volunteering, community service" />
    <Toggle label="I have extracurricular activities to mention" name="hasExtra" checked={form.hasExtra} onChange={e=>setForm(f=>({...f,hasExtra:e.target.checked}))} />
    {form.hasExtra&&<div style={{ marginTop:12 }}><TA name="extra" value={form.extra} onChange={onChange} placeholder="List your activities, roles, positions held, competitions won, years active…" rows={4} /></div>}

    <div style={{ height:22 }} />
    <SecHead icon="🏆" title="Awards & Achievements" sub="Academic prizes, competition wins, publications, etc." />
    <TA name="achievements" value={form.achievements} onChange={onChange} placeholder="e.g. 1st position in National Science Olympiad 2023, HEC scholarship recipient 2024, IEEE published paper…" rows={3} />

    <div style={{ height:22 }} />
    <SecHead icon="📜" title="Certifications & Courses" sub="Online courses, professional certifications, language tests" />
    <Toggle label="I have certifications or completed courses to list" name="hasCert" checked={form.hasCert} onChange={e=>setForm(f=>({...f,hasCert:e.target.checked}))} />
    {form.hasCert&&<div style={{ marginTop:14 }}>
      {form.certs.map((c,i)=>(
        <div key={i} style={{ background:"#f8faff", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"14px 18px", marginBottom:10, display:"flex", flexWrap:"wrap", gap:12, alignItems:"flex-start" }}>
          <F label="Certificate / Course Name" h>{dynInp(c.name,e=>updCert(i,"name",e.target.value),"e.g. Google Data Analytics")}</F>
          <F label="Issued By" t>{dynInp(c.org, e=>updCert(i,"org", e.target.value),"e.g. Coursera / HEC")}</F>
          <F label="Year"      t>{dynInp(c.year,e=>updCert(i,"year",e.target.value),"2024")}</F>
          <F label="URL (optional)">{dynInp(c.url,e=>updCert(i,"url",e.target.value),"Certificate verification link")}</F>
          {i>0&&<button type="button" onClick={()=>setForm(f=>({...f,certs:f.certs.filter((_,x)=>x!==i)}))}
            style={{ background:"none", border:"none", color:C.error, cursor:"pointer", fontSize:13, fontWeight:700, alignSelf:"flex-end", marginBottom:2 }}>✕</button>}
        </div>
      ))}
      <button type="button" onClick={()=>setForm(f=>({...f,certs:[...f.certs,blankCert()]}))}
        style={{ padding:"9px 18px", border:`1.5px dashed ${C.teal}`, borderRadius:8, background:C.tealPale, color:C.teal, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
        + Add Certificate
      </button>
    </div>}

    <div style={{ height:22 }} />
    <SecHead icon="🤝" title="References / Referees" sub="Academic or professional references (optional but recommended)" />
    <Toggle label="I want to provide referee / reference contacts" name="hasRef" checked={form.hasRef} onChange={e=>setForm(f=>({...f,hasRef:e.target.checked}))} />
    {form.hasRef&&<div style={{ marginTop:14 }}>
      {form.refs.map((r,i)=>(
        <div key={i} style={{ background:"#f8faff", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>Referee #{i+1}</div>
            {i>0&&<button type="button" onClick={()=>setForm(f=>({...f,refs:f.refs.filter((_,x)=>x!==i)}))}
              style={{ background:"none", border:"none", color:C.error, cursor:"pointer", fontSize:13, fontWeight:700 }}>✕</button>}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            <F label="Full Name"    h>{dynInp(r.name,    e=>updRef(i,"name",    e.target.value),"Prof. Dr. / Mr. / Ms.")}</F>
            <F label="Relationship" h>{dynInp(r.relation,e=>updRef(i,"relation",e.target.value),"e.g. Teacher, Employer")}</F>
            <F label="Organization" h>{dynInp(r.org,     e=>updRef(i,"org",     e.target.value),"University / Company")}</F>
            <F label="Email"        h>{dynInp(r.email,   e=>updRef(i,"email",   e.target.value),"referee@org.com")}</F>
            <F label="Phone"        h>{dynInp(r.phone,   e=>updRef(i,"phone",   e.target.value),"Contact number")}</F>
          </div>
        </div>
      ))}
      {form.refs.length<3&&<button type="button" onClick={()=>setForm(f=>({...f,refs:[...f.refs,blankRef()]}))}
        style={{ padding:"9px 18px", border:`1.5px dashed ${C.teal}`, borderRadius:8, background:C.tealPale, color:C.teal, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
        + Add Referee
      </button>}
    </div>}

    <div style={{ height:22 }} />
    <SecHead icon="✍️" title="Personal Statement" sub="Tell us about yourself — motivations, goals, why NN-University" />
    <TA name="personalStatement" value={form.personalStatement} onChange={onChange}
      placeholder="Why do you want to study this program? What are your career goals? What makes you a strong candidate? How will this degree help you? (minimum 150 words recommended)" rows={7} />
    <div style={{ fontSize:11, color:form.personalStatement.trim().split(/\s+/).filter(Boolean).length>=150?C.teal:C.muted, marginTop:5, display:"flex", justifyContent:"flex-end" }}>
      {form.personalStatement.trim().split(/\s+/).filter(Boolean).length} words
      {form.personalStatement.trim().split(/\s+/).filter(Boolean).length>=150&&" ✓ Great length!"}
    </div>
  </div>
);};

/* ═══════════════════════════════════════════════════════════════
   STEP 4 — DOCUMENTS
═══════════════════════════════════════════════════════════════ */
const S4 = ({ form, setForm, errors }) => (
  <div>
    <SecHead icon="📎" title="Required Documents" sub="Upload clear scanned copies — blurry or incomplete files will delay processing" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:24 }}>
      <DocBox name="doc_cnic"   label="CNIC / B-Form Copy"         req icon="🪪" form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_photo"  label="Passport Photograph"         req icon="🖼️" accept="image/*" form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_matric" label="Matric Certificate / DMC"    req icon="📜" form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_inter"  label="Intermediate Certificate / DMC" req icon="📋" form={form} setForm={setForm} errors={errors} />
    </div>

    <SecHead icon="📁" title="Additional Documents" sub="Upload if applicable to your application" />
    <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:16 }}>
      <DocBox name="doc_domicile"    label="Domicile Certificate"      icon="🏠"  form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_character"   label="Character Certificate"     icon="⭐"  form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_migration"   label="Migration Certificate"     icon="📑"  form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_hafiz"       label="Hafiz-e-Quran Certificate" icon="☪️"  form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_sports"      label="Sports Certificate"        icon="🏅"  form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_scholarship" label="Scholarship Documents"     icon="💰"  form={form} setForm={setForm} errors={errors} />
      <DocBox name="doc_other"       label="Other Supporting Document" icon="📎"  form={form} setForm={setForm} errors={errors} />
    </div>

    <InfoBox type="warn">
      ⚠️ <strong>Important:</strong> All documents must be clearly legible and in colour where required. Maximum file size: 5MB per file. Accepted formats: PDF, JPG, PNG. Original documents will be verified at the time of enrolment. Submitting forged documents is a criminal offence.
    </InfoBox>

    {/* Upload progress */}
    {(() => {
      const req = ["doc_cnic","doc_photo","doc_matric","doc_inter"];
      const opt = ["doc_domicile","doc_character","doc_migration","doc_hafiz","doc_sports","doc_scholarship","doc_other"];
      const reqDone = req.filter(k=>form[k]).length;
      const optDone = opt.filter(k=>form[k]).length;
      return (
        <div style={{ marginTop:16, background:"#f8faff", borderRadius:10, padding:"14px 18px", border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:10 }}>Upload Progress</div>
          <div style={{ display:"flex", gap:20 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Required ({reqDone}/{req.length})</div>
              <div style={{ height:6, background:C.border, borderRadius:99 }}>
                <div style={{ height:"100%", width:`${(reqDone/req.length)*100}%`, background:reqDone===req.length?C.teal:C.gold, borderRadius:99, transition:"width .4s" }} />
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Optional ({optDone}/{opt.length})</div>
              <div style={{ height:6, background:C.border, borderRadius:99 }}>
                <div style={{ height:"100%", width:`${(optDone/opt.length)*100}%`, background:C.tealLight, borderRadius:99, transition:"width .4s" }} />
              </div>
            </div>
          </div>
        </div>
      );
    })()}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STEP 5 — REVIEW
═══════════════════════════════════════════════════════════════ */
const RevSec = ({ icon, title, rows }) => {
  const filtered = rows.filter(([,v])=>v&&String(v).trim()&&String(v)!=="false");
  if(!filtered.length) return null;
  return (
    <div style={{ marginBottom:16, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, color:"#fff",
        padding:"11px 16px", fontSize:11, fontWeight:700, letterSpacing:"0.1em",
        textTransform:"uppercase", display:"flex", alignItems:"center", gap:8 }}>
        <span>{icon}</span><span style={{ color:C.tealLight }}>{title}</span>
      </div>
      {filtered.map(([l,v])=>(
        <div key={l} style={{ display:"flex", borderBottom:`1px solid ${C.bg}`, padding:"9px 16px", background:"#fff",
          transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.tealPale}
          onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
          <span style={{ fontSize:12, color:C.muted, width:190, flexShrink:0 }}>{l}</span>
          <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{String(v)}</span>
        </div>
      ))}
    </div>
  );
};

const S5 = ({ form, setForm, errors }) => (
  <div>
    <InfoBox>👁 Review all details carefully. Use ← Back to make corrections. Submission is final and cannot be changed.</InfoBox>
    <div style={{ height:16 }} />

    <RevSec icon="👤" title="Personal Information" rows={[
      ["Application Type",form.appType],["Full Name",`${form.firstName} ${form.lastName}`],
      ["Father's Name",form.fatherName],["Mother's Name",form.motherName],
      ["CNIC / B-Form",form.cnic],["Date of Birth",form.dob],
      ["Gender",form.gender],["Marital Status",form.marital],
      ["Religion",form.religion],["Blood Group",form.bloodGroup],
      ["Nationality",form.nationality],["Domicile",form.domicile],
      ["Disability",form.disability!=="None"?form.disability:""],
      ["Email",form.email],["Phone",form.phone],["WhatsApp",form.whatsapp],
      ["City",form.city],["Permanent Address",form.address],
    ]} />
    <RevSec icon="🚨" title="Emergency Contact" rows={[
      ["Name",form.emergencyName],["Relation",form.emergencyRelation],["Phone",form.emergencyPhone],
    ]} />
    <RevSec icon="🎓" title="Academic History" rows={[
      ["Matric Board",form.matric_board],["Matric Year",form.matric_year],
      ["Matric Grade",form.matric_grade],["Matric %",form.matric_pct],
      ["Matric Subjects",form.matric_subjects],
      ["Inter Board",form.inter_board],["Inter Year",form.inter_year],
      ["Inter Grade",form.inter_grade],["Inter %",form.inter_pct],
      ["Inter Group",form.inter_group],["Inter Subjects",form.inter_subjects],
      ...(form.hasBachelors?[["Bachelor's Uni",form.bach_uni],["Bachelor's Degree",form.bach_degree],["Bachelor's CGPA",form.bach_cgpa]]:[]),
      ...(form.hasMasters?[["Master's Uni",form.mast_uni],["Master's Degree",form.mast_degree],["Master's CGPA",form.mast_cgpa]]:[]),
    ]} />
    <RevSec icon="🏛" title="Program Selection" rows={[
      ["Faculty",form.faculty],["Program",form.program],
      ["Intake",form.intake],["Shift",form.shift],["Quota",form.quota],
      ["Second Choice",form.secondProgram||"None"],
      ["Entrance Test",form.testName?`${form.testName} — ${form.testScore}`:""],
      ["Hostel",form.hostel?"Yes":""],["Transport",form.transport?`Yes — ${form.transportRoute}`:""],
      ["Scholarship",form.scholarshipApply?`Yes — ${form.scholarshipType}`:""],
    ]} />
    <RevSec icon="💼" title="Profile & Experience" rows={[
      ["Work Experience",form.hasWork?`${form.work.length} entr${form.work.length===1?"y":"ies"}`:"None"],
      ["Certifications",form.hasCert?`${form.certs.length} listed`:"None"],
      ["References",form.hasRef?`${form.refs.length} listed`:"None"],
      ["Personal Statement",form.personalStatement?`${form.personalStatement.trim().split(/\s+/).filter(Boolean).length} words`:"Not provided"],
    ]} />
    <RevSec icon="📎" title="Documents Uploaded" rows={[
      ["CNIC / B-Form",form.doc_cnic?.name],["Passport Photo",form.doc_photo?.name],
      ["Matric Certificate",form.doc_matric?.name],["Inter Certificate",form.doc_inter?.name],
      ["Domicile",form.doc_domicile?.name],["Character Cert.",form.doc_character?.name],
      ["Migration",form.doc_migration?.name],["Sports",form.doc_sports?.name],
      ["Scholarship Docs",form.doc_scholarship?.name],["Other",form.doc_other?.name],
    ]} />

    <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:12, padding:"18px 22px", marginBottom:16, color:"#fff" }}>
      <div style={{ fontSize:13, fontWeight:800, marginBottom:8, color:C.tealLight }}>💳 Application Processing Fee</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.7 }}>
          A non-refundable application processing fee of <strong style={{ color:C.gold }}>PKR 1,500</strong> is required.<br/>
          Fee challan will be generated after submission. Deposit within <strong>5 working days</strong>.
        </div>
        <div style={{ background:C.gold, color:C.navy, padding:"6px 16px", borderRadius:8, fontSize:14, fontWeight:800 }}>PKR 1,500</div>
      </div>
    </div>

    <div style={{ background:"#f8faff", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"22px 24px" }}>
      <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
        <span>📋</span> Declaration & Consent
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <CB name="declaration" checked={form.declaration} onChange={e=>setForm(f=>({...f,declaration:e.target.checked}))} err={errors.declaration}
          label="I hereby declare that all information provided in this application is true, accurate and complete to the best of my knowledge. I understand that any misrepresentation may result in immediate cancellation of admission and/or legal action." />
        <CB name="dataConsent" checked={form.dataConsent} onChange={e=>setForm(f=>({...f,dataConsent:e.target.checked}))} err={errors.dataConsent}
          label="I consent to NN-University collecting, storing, and using my personal data for the purpose of processing this admission application and for institutional communications, in accordance with the university's privacy policy." />
        <CB name="feeConsent" checked={form.feeConsent} onChange={e=>setForm(f=>({...f,feeConsent:e.target.checked}))} err={errors.feeConsent}
          label="I acknowledge that the application processing fee of PKR 1,500 is non-refundable and I agree to pay it upon receiving the fee challan within the stipulated time." />
      </div>
    </div>
  </div>
);

const Success = ({ form }) => {
  const appNo = `NN-${form.appType.substring(0,2).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`;
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.navy} 0%,${C.navyLight} 50%,#0a2a50 100%)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Trebuchet MS', 'Gill Sans', sans-serif", padding:24, position:"relative", overflow:"hidden" }}>
      {[["-10%","30%",300],["-5%","-5%",200],["80%","60%",400],["90%","-10%",180]].map(([l,t,sz],i)=>(
        <div key={i} style={{ position:"fixed", left:l, top:t, width:sz, height:sz, borderRadius:"50%",
          background:`radial-gradient(circle,rgba(14,165,160,0.12) 0%,transparent 70%)`, pointerEvents:"none" }} />
      ))}
      <div style={{ background:"#fff", borderRadius:20, padding:"48px 44px", textAlign:"center",
        maxWidth:520, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,0.35)", position:"relative", zIndex:1 }}>
        <div style={{ width:90, height:90, borderRadius:"50%",
          background:`linear-gradient(135deg,${C.teal},${C.tealLight})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 24px", fontSize:42,
          boxShadow:`0 0 0 12px ${C.tealPale}, 0 8px 32px rgba(14,165,160,0.4)` }}>✓</div>
        <div style={{ fontSize:11, letterSpacing:"0.15em", color:C.teal, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Application Submitted Successfully</div>
        <h2 style={{ color:C.navy, fontSize:26, fontWeight:900, margin:"0 0 8px", fontFamily:"'Trebuchet MS', sans-serif" }}>
          Welcome, {form.firstName}!
        </h2>
        <p style={{ color:C.muted, fontSize:14, lineHeight:1.8, margin:"0 0 28px" }}>
          Your admission application to <strong style={{ color:C.navy }}>NN-University</strong> has been received. Our admissions team will review your application and contact you within <strong>3–5 working days</strong>.
        </p>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:14,
          padding:"20px 24px", marginBottom:20, textAlign:"left" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Application Reference Number</div>
          <div style={{ fontSize:24, fontWeight:900, color:C.tealLight, letterSpacing:"0.08em", marginBottom:14 }}>{appNo}</div>
          {[["Program",form.program||"—"],["Faculty",form.faculty||"—"],["Intake",form.intake],["Shift",form.shift||"—"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0",
              borderBottom:"1px solid rgba(255,255,255,0.08)", fontSize:12 }}>
              <span style={{ color:"rgba(255,255,255,0.5)" }}>{l}</span>
              <span style={{ color:"#fff", fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <InfoBox>
          📧 A confirmation email has been sent to <strong>{form.email}</strong>.<br/>
          📄 Your fee challan (PKR 1,500) will be emailed within 24 hours.<br/>
          📞 Helpline: <strong>021-XXXX-XXXX</strong> (Mon–Fri, 9am–5pm)
        </InfoBox>
        <div style={{ marginTop:20, fontSize:12, color:C.muted }}>
          🎓 NN-University · Admissions Office · admissions@nn-university.edu.pk
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN APP (With Minimal Supabase Logic to preserve UI)
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState(INIT);
  const [errors,  setErrors]  = useState({});
  const [saved,   setSaved]   = useState("");
  const [submitted, setSub]   = useState(false);
  const [loading, setLoading] = useState(false); // UI Spinner logic
  const [sideOpen,  setSide]  = useState(false);
  const bodyRef = useRef();

  const onChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type==="checkbox" ? checked : value }));
  }, []);

  useEffect(()=>{
    const t = setTimeout(()=>{ setSaved("Draft saved"); setTimeout(()=>setSaved(""),2200); }, 1800);
    return ()=>clearTimeout(t);
  }, [form]);

  const scrollTop = () => bodyRef.current?.scrollTo({ top:0, behavior:"smooth" });

  // SUPABASE: Upload function
  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('admissions').upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('admissions').getPublicUrl(filePath);
    return publicUrl;
  };

  const next = async () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); scrollTop(); return; }
    setErrors({});

    if (step === STEPS.length - 1) {
      setLoading(true);
      try {
        // 1. Generate Reference Number (Exactly like Success screen)
        const appNo = `NN-${form.appType.substring(0,2).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`;

        // 2. Handle all file fields
        const fileFields = ['photo', 'doc_cnic', 'doc_photo', 'doc_matric', 'doc_inter', 'doc_domicile', 'doc_character', 'doc_migration', 'doc_hafiz', 'doc_sports', 'doc_scholarship', 'doc_other'];
        const finalData = { ...form };
        
        for (const field of fileFields) {
          if (form[field] instanceof File) {
            const folder = field === 'photo' ? 'photos' : 'documents';
            finalData[field] = await uploadFile(form[field], folder);
          }
        }

        // 3. Save to database with Reference Number
        const { error: dbError } = await supabase.from('applications').insert([{
          applicant_name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          program: form.program,
          app_type: form.appType,     // Naya Column
          application_no: appNo,      // Naya Column (Reference No)
          form_data: finalData
        }]);

        if (dbError) throw dbError;
        
        // Success screen par wahi appNo dikhane ke liye hum form state mein save kar dete hain
        setForm(prev => ({...prev, generatedAppNo: appNo})); 
        setSub(true);
      } catch (err) {
        alert("Submission failed: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(s=>s+1); scrollTop();
  };
  
  const back = () => { setErrors({}); setStep(s=>s-1); scrollTop(); };
  const goTo = i => { if(i<step){ setErrors({}); setStep(i); scrollTop(); setSide(false); } };

  if (submitted) return <Success form={form} />;

  const filled = [form.firstName,form.lastName,form.fatherName,form.cnic,form.dob,form.gender,form.email,form.phone,form.domicile,form.address,form.city,form.emergencyName,form.emergencyPhone,form.matric_board,form.matric_year,form.matric_pct,form.inter_board,form.inter_year,form.inter_pct,form.faculty,form.program,form.shift,form.personalStatement.trim()].filter(Boolean).length;
  const pct = Math.round((filled/23)*100);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Trebuchet MS', 'Gill Sans', 'Segoe UI', sans-serif" }}>
      
      {/* Functionality: Full screen loading for better UX */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,30,61,0.8)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #fff", borderTopColor: C.teal, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 15, fontWeight: "bold" }}>Saving Application...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 60%,#0a3060 100%)`,
        padding:"0 0 0", position:"relative", overflow:"hidden" }}>
        {[["-8%","20%",220],["-3%","-20%",160],["75%","40%",300],["90%","-15%",180],["50%","80%",120]].map(([l,t,sz],i)=>(
          <div key={i} style={{ position:"absolute", left:l, top:t, width:sz, height:sz, borderRadius:"50%",
            background:`radial-gradient(circle,rgba(14,165,160,0.${[10,7,8,6,12][i]}) 0%,transparent 70%)`, pointerEvents:"none" }} />
        ))}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 32px",
          borderBottom:"1px solid rgba(255,255,255,0.07)", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12,
              background:`linear-gradient(135deg,${C.teal},${C.tealLight})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
              boxShadow:`0 4px 16px rgba(14,165,160,0.5)` }}>🎓</div>
            <div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff", letterSpacing:"-0.01em" }}>
                NN<span style={{ color:C.tealLight }}>-University</span>
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase" }}>Admissions Portal</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {saved&&<div style={{ fontSize:11, color:C.tealLight, background:"rgba(14,165,160,0.15)", border:`1px solid rgba(14,165,160,0.3)`, borderRadius:20, padding:"4px 12px" }}>💾 {saved}</div>}
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"5px 12px", border:"1px solid rgba(255,255,255,0.1)" }}>Fall 2025 Intake</div>
            <button type="button" onClick={()=>setSide(v=>!v)} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
              {sideOpen?"✕ Close":"☰ Overview"}
            </button>
          </div>
        </div>
        <div style={{ textAlign:"center", padding:"32px 24px 12px", position:"relative", zIndex:1 }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>
            Undergraduate Admission Application
          </h1>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:20 }}>Academic Session 2025–2026 · NN-University</div>
          <div style={{ maxWidth:440, margin:"0 auto 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Form Completion</span>
              <span style={{ fontSize:11, color:pct===100?C.tealLight:C.gold, fontWeight:700 }}>{pct}%{pct===100?" ✓":""}</span>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,0.1)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, transition:"width .5s ease",
                background:pct===100?`linear-gradient(90deg,${C.teal},${C.tealLight})`:`linear-gradient(90deg,${C.gold},${C.teal})` }} />
            </div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", position:"relative", zIndex:1, overflowX:"auto", padding:"0 16px" }}>
          {STEPS.map((s,i)=>{
            const done = i<step, active = i===step;
            return (
              <div key={s.id} onClick={()=>goTo(i)} style={{
                display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 16px 0",
                cursor:done?"pointer":"default", position:"relative",
                borderBottom:active?`3px solid ${C.teal}`:"3px solid transparent",
                transition:"all .25s", minWidth:80,
              }}>
                <div style={{
                  width:34, height:34, borderRadius:10,
                  background:done?C.teal:active?`linear-gradient(135deg,${C.teal},${C.tealLight})`:"rgba(255,255,255,0.07)",
                  border:`1.5px solid ${active||done?C.teal:"rgba(255,255,255,0.15)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:done?14:15, marginBottom:5,
                  boxShadow:active?`0 0 18px rgba(14,165,160,0.6)`:"none",
                  transition:"all .3s",
                }}>{done?"✓":s.icon}</div>
                <div style={{ fontSize:10, color:active?C.tealLight:done?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.28)",
                  fontWeight:active||done?700:400, letterSpacing:"0.05em", textAlign:"center",
                  marginBottom:10, textTransform:"uppercase", whiteSpace:"nowrap" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </header>

      {sideOpen && (
        <div style={{ position:"fixed", top:0, right:0, bottom:0, width:300, background:C.navy,
          zIndex:1000, boxShadow:"-8px 0 40px rgba(0,0,0,0.4)", overflowY:"auto", padding:"20px" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:16, borderBottom:"1px solid rgba(255,255,255,0.1)", paddingBottom:12 }}>
            Application Overview
          </div>
          {STEPS.map((s,i)=>(
            <div key={s.id} onClick={()=>goTo(i)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
              borderRadius:8, marginBottom:6, cursor:i<step?"pointer":"default",
              background:i===step?"rgba(14,165,160,0.15)":i<step?"rgba(14,165,160,0.05)":"transparent",
              border:`1px solid ${i===step?C.teal:"transparent"}`,
            }}>
              <div style={{ width:28, height:28, borderRadius:7,
                background:i<step?C.teal:i===step?`linear-gradient(135deg,${C.teal},${C.tealLight})`:"rgba(255,255,255,0.08)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:i<step?12:14, flexShrink:0 }}>
                {i<step?"✓":s.icon}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:i===step?C.tealLight:i<step?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.35)" }}>{s.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{s.desc}</div>
              </div>
              {i===step && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:C.teal, flexShrink:0 }} />}
            </div>
          ))}
          <div style={{ marginTop:20, padding:"14px 12px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Applicant</div>
            <div style={{ fontSize:13, color:"#fff", fontWeight:700 }}>{form.firstName||"—"} {form.lastName}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{form.email||"No email entered"}</div>
            {form.program&&<div style={{ fontSize:12, color:C.tealLight, marginTop:4 }}>📌 {form.program}</div>}
          </div>
        </div>
      )}

      <main style={{ maxWidth:800, margin:"-2px auto 60px", padding:"0 16px" }}>
        <div style={{ background:C.card, borderRadius:"0 0 18px 18px", boxShadow:"0 16px 60px rgba(11,30,61,0.12)",
          border:`1px solid ${C.border}`, borderTop:"none", overflow:"hidden" }}>

          <div style={{ height:3, background:`linear-gradient(90deg,${C.navy},${C.teal},${C.tealLight})` }} />

          <div style={{ padding:"24px 32px 18px", borderBottom:`1px solid ${C.bg}`, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{ width:32, height:32, borderRadius:9,
                  background:`linear-gradient(135deg,${C.navy},${C.teal})`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{STEPS[step].icon}</div>
                <h2 style={{ fontSize:20, fontWeight:800, color:C.navy, margin:0 }}>
                  {{0:"Personal Information",1:"Academic History",2:"Program Selection",3:"Profile & Experience",4:"Document Upload",5:"Review & Submit"}[step]}
                </h2>
                <span style={{ fontSize:11, color:C.muted, background:C.bg, borderRadius:20, padding:"3px 10px", border:`1px solid ${C.border}` }}>
                  {step+1}/{STEPS.length}
                </span>
              </div>
              <p style={{ fontSize:13, color:C.muted, margin:"0 0 0 42px" }}>
                {{0:"Enter your personal, contact and emergency details as per official documents.",
                  1:"Provide all your educational qualifications from secondary level onwards.",
                  2:"Select your desired program, intake, shift and additional services.",
                  3:"Share your work experience, certifications, references and personal statement.",
                  4:"Upload all required and applicable supporting documents.",
                  5:"Review all information and submit your application."}[step]}
              </p>
            </div>
          </div>

          {Object.keys(errors).length>0 && (
            <div style={{ background:C.errorPale, borderBottom:`1px solid ${C.error}`, padding:"11px 32px",
              fontSize:13, color:C.error, display:"flex", alignItems:"center", gap:8 }}>
              ⚠️ Please fix <strong>{Object.keys(errors).length}</strong> error{Object.keys(errors).length>1?"s":""} to continue.
            </div>
          )}

          <div ref={bodyRef} style={{ padding:"28px 32px", maxHeight:"52vh", overflowY:"auto", background:"#fcfeff" }}>
            {step===0 && <S0 form={form} onChange={onChange} setForm={setForm} errors={errors} />}
            {step===1 && <S1 form={form} onChange={onChange} setForm={setForm} errors={errors} />}
            {step===2 && <S2 form={form} onChange={onChange} setForm={setForm} errors={errors} />}
            {step===3 && <S3 form={form} onChange={onChange} setForm={setForm} />}
            {step===4 && <S4 form={form} setForm={setForm} errors={errors} />}
            {step===5 && <S5 form={form} setForm={setForm} errors={errors} />}
          </div>

          <div style={{ padding:"18px 32px", borderTop:`1px solid ${C.bg}`, display:"flex",
            justifyContent:"space-between", alignItems:"center", background:C.bg }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              {step>0&&<button type="button" onClick={back} style={{ padding:"10px 22px", borderRadius:8,
                border:`1.5px solid ${C.border}`, background:"#fff", color:C.muted,
                fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                transition:"border-color .2s" }}
                onMouseEnter={e=>{e.target.style.borderColor=C.teal;e.target.style.color=C.teal}}
                onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.muted}}>← Back</button>}
              <span style={{ fontSize:12, color:C.muted }}>Step {step+1} of {STEPS.length}</span>
            </div>
            <button type="button" onClick={next} disabled={loading} style={{
              padding:"11px 32px", borderRadius:8, border:"none", cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit",
              background:step===5?`linear-gradient(135deg,${C.success},#10b981)`:`linear-gradient(135deg,${C.navy},${C.teal})`,
              color:"#fff", fontSize:14, fontWeight:700, letterSpacing:"0.03em",
              boxShadow:step===5?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 20px rgba(14,165,160,0.35)`,
              transition:"transform .15s, box-shadow .15s",
              opacity: loading ? 0.7 : 1
            }}
              onMouseEnter={e=>{if(!loading){e.target.style.transform="translateY(-1px)";e.target.style.boxShadow="0 6px 24px rgba(14,165,160,0.5)"}}}
              onMouseLeave={e=>{if(!loading){e.target.style.transform="none";e.target.style.boxShadow=step===5?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 20px rgba(14,165,160,0.35)`}}}>
              {step===5 ? (loading ? "Submitting..." : "✓ Submit Application →") : "Continue →"}
            </button>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:C.muted }}>
          🎓 NN-University &nbsp;·&nbsp; Admissions Office &nbsp;·&nbsp;
          <a href="mailto:admissions@nn-university.edu.pk" style={{ color:C.teal, textDecoration:"none" }}>admissions@nn-university.edu.pk</a>
          &nbsp;·&nbsp; Helpline: 021-XXXX-XXXX
        </div>
      </main>
    </div>
  );
}