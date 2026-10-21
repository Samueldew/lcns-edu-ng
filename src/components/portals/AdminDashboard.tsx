                      </div>
                      <div className="text-[11px] text-slate-600">{u.email} - {u.level} - {u.phone}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {ALL_ROLES.map(r=>(
                          <button key={r.value} onClick={()=>assignRole(u.email, r.value)} className={`px-2 py-1 rounded-xl text-[9px] font-black border ${u.role===r.value?'bg-slate-900 text-white':'bg-white'}`}>{r.value.replace('_',' ')}</button>
                        ))}
                      </div>
                      <button onClick={()=>deleteUser(u.email, u.fullName||u.email, u.matricNumber||u.staffId)} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black">DELETE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'promotion' && <StudentPromotion />}
      {activeAdminTab === 'settings' && <AdminSettings />}
      {activeAdminTab === 'management' && <AdminManagement />}
      {activeAdminTab === 'gallery' && <AdminGallery />}
      {activeAdminTab === 'cbt' && <CBTExamManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab === 'courses' && (<div className="bg-white rounded-3xl border-2 p-4"><h2 className="font-black">📚 Courses - {courses.length} - Lecturers {lecturers.length}</h2><div className="overflow-x-auto border-2 rounded-xl mt-3"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Lecturer</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-2 font-mono">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.lecturer}</td></tr>)}</tbody></table></div></div>)}
      {activeAdminTab === 'applicants' && (<div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">🎓 Applicants - App {appStatus.isOpen?'OPEN':'CLOSED'}</div><AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} /></div>)}
      {activeAdminTab === 'system' && (<div className="bg-white rounded-3xl border-2 p-6 text-xs"><h3 className="font-black">System Health</h3><p>Session: {currentSession} - Matric Year: {currentYear}</p><p>Users: {users.length}</p><p>Score Sheets Submitted: {backendData.tables?.student_scores || 0} - Lecturers submissions visible here!</p></div>)}
    </div>
  );
};

export default AdminDashboard;
