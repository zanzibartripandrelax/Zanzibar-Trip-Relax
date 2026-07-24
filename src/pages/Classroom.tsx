import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, BookOpen, Users, FileText, Megaphone, Plus, 
  ExternalLink, LogOut, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, MessageSquare
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initClassroomAuth, classroomGoogleSignIn, getClassroomAccessToken, classroomLogout,
  fetchCourses, fetchCourseWork, fetchAnnouncements, fetchStudents, fetchTeachers,
  createAnnouncement, createCourseWork,
  ClassroomCourse, CourseWorkItem, AnnouncementItem, ClassroomUser
} from '../lib/classroomAuth';

interface ClassroomProps {
  navigate: (page: any) => void;
}

export default function Classroom({ navigate }: ClassroomProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data States
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [fetchingCourses, setFetchingCourses] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'coursework' | 'roster'>('announcements');

  // Selected Course Detail States
  const [courseWork, setCourseWork] = useState<CourseWorkItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [students, setStudents] = useState<ClassroomUser[]>([]);
  const [teachers, setTeachers] = useState<ClassroomUser[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Creation Modals & Forms
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [announcementText, setAnnouncementText] = useState<string>('');
  const [postingAnnouncement, setPostingAnnouncement] = useState<boolean>(false);

  const [showCourseWorkModal, setShowCourseWorkModal] = useState<boolean>(false);
  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
  const [assignmentDesc, setAssignmentDesc] = useState<string>('');
  const [assignmentPoints, setAssignmentPoints] = useState<number>(100);
  const [postingAssignment, setPostingAssignment] = useState<boolean>(false);

  // Confirmation state
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    type: 'announcement' | 'assignment';
    title: string;
    details: string;
  } | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initClassroomAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        setLoading(false);
        loadCourses(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const res = await classroomGoogleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await loadCourses(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await classroomLogout();
    setUser(null);
    setAccessToken(null);
    setCourses([]);
    setSelectedCourse(null);
  };

  const loadCourses = async (token: string) => {
    setFetchingCourses(true);
    try {
      const data = await fetchCourses(token);
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        handleSelectCourse(data[0], token);
      }
    } catch (err: any) {
      console.error('Failed to load courses:', err);
    } finally {
      setFetchingCourses(false);
    }
  };

  const handleSelectCourse = async (course: ClassroomCourse, tokenOverride?: string) => {
    setSelectedCourse(course);
    const token = tokenOverride || accessToken || getClassroomAccessToken();
    if (!token) return;

    setLoadingDetails(true);
    try {
      const [cw, ann, st, tc] = await Promise.all([
        fetchCourseWork(token, course.id).catch(() => []),
        fetchAnnouncements(token, course.id).catch(() => []),
        fetchStudents(token, course.id).catch(() => []),
        fetchTeachers(token, course.id).catch(() => []),
      ]);
      setCourseWork(cw);
      setAnnouncements(ann);
      setStudents(st);
      setTeachers(tc);
    } catch (err) {
      console.error('Error fetching course details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const requestCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !selectedCourse) return;

    setPendingConfirmAction({
      type: 'announcement',
      title: 'Post New Announcement',
      details: `Are you sure you want to post this announcement to "${selectedCourse.name}"? This action will publish live content to all enrolled students.`
    });
  };

  const requestCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !selectedCourse) return;

    setPendingConfirmAction({
      type: 'assignment',
      title: 'Publish New Assignment',
      details: `Are you sure you want to create assignment "${assignmentTitle}" in "${selectedCourse.name}" with max score of ${assignmentPoints} points?`
    });
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirmAction || !selectedCourse) return;
    const token = accessToken || getClassroomAccessToken();
    if (!token) return;

    if (pendingConfirmAction.type === 'announcement') {
      setPostingAnnouncement(true);
      try {
        const newAnn = await createAnnouncement(token, selectedCourse.id, announcementText);
        setAnnouncements(prev => [newAnn, ...prev]);
        setAnnouncementText('');
        setShowAnnouncementModal(false);
      } catch (err: any) {
        alert(`Error creating announcement: ${err.message}`);
      } finally {
        setPostingAnnouncement(false);
      }
    } else if (pendingConfirmAction.type === 'assignment') {
      setPostingAssignment(true);
      try {
        const newWork = await createCourseWork(token, selectedCourse.id, {
          title: assignmentTitle,
          description: assignmentDesc,
          maxPoints: assignmentPoints
        });
        setCourseWork(prev => [newWork, ...prev]);
        setAssignmentTitle('');
        setAssignmentDesc('');
        setShowCourseWorkModal(false);
      } catch (err: any) {
        alert(`Error creating assignment: ${err.message}`);
      } finally {
        setPostingAssignment(false);
      }
    }

    setPendingConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Banner Header */}
      <div className="bg-[#0B3B8C] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wide uppercase text-amber-300 backdrop-blur-sm">
              <GraduationCap size={16} /> Google Workspace Integration
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Google Classroom Portal
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Seamlessly connect Zanzibar Trip & Relax educational workshops, guide training courses, and eco-conservation classes directly with your Google Classroom account.
            </p>
          </div>

          {/* Auth Button Header */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/20 backdrop-blur-md">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border-2 border-amber-400" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-snug">{user.displayName || 'Classroom User'}</p>
                  <p className="text-[11px] text-blue-200 truncate max-w-[160px]">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="gsi-material-button group inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3 rounded-2xl shadow-lg border border-slate-200 hover:border-amber-400 transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <div className="gsi-material-button-icon w-6 h-6 flex-shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {signingIn ? 'Signing in...' : 'Sign in with Google'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {!user ? (
          /* Logged-out Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6 mt-6">
            <div className="w-20 h-20 bg-blue-50 text-[#0B3B8C] rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-blue-100">
              <GraduationCap size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Connect Your Google Classroom</h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                Sign in with your Google account to view active courses, read announcements, inspect assignments, and manage class rosters with permission.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="inline-flex items-center gap-3 bg-[#0B3B8C] hover:bg-blue-900 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition-all active:scale-95"
              >
                <GraduationCap size={20} />
                <span>{signingIn ? 'Authenticating...' : 'Sign In To Access Courses'}</span>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-slate-500">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700 mb-1">✓ Course Roster</p>
                <p>View teachers and students enrolled in your active classes.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700 mb-1">✓ Assignments</p>
                <p>Track coursework items, due dates, and max point values.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700 mb-1">✓ Announcements</p>
                <p>Post class updates and news with user authorization.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3B8C] flex items-center justify-center font-bold">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{courses.length}</p>
                  <p className="text-xs text-slate-500 font-medium">Active Enrolled Courses</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{courseWork.length}</p>
                  <p className="text-xs text-slate-500 font-medium">Course Assignments</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{students.length + teachers.length}</p>
                  <p className="text-xs text-slate-500 font-medium">Class Members</p>
                </div>
              </div>
            </div>

            {/* Content Split: Left Course List, Right Active Course Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Courses Sidebar (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <BookOpen size={18} className="text-[#0B3B8C]" /> My Courses
                  </h3>
                  <button
                    onClick={() => accessToken && loadCourses(accessToken)}
                    disabled={fetchingCourses}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Refresh Courses"
                  >
                    <RefreshCw size={16} className={fetchingCourses ? 'animate-spin' : ''} />
                  </button>
                </div>

                {fetchingCourses ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                    <RefreshCw size={20} className="animate-spin mx-auto text-[#0B3B8C]" />
                    <p>Loading Google Classroom courses...</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-500 text-xs space-y-2">
                    <p className="font-semibold text-slate-700">No active classes found</p>
                    <p>You are not currently enrolled as a student or teacher in any active Google Classroom course.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {courses.map(c => {
                      const isSelected = selectedCourse?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCourse(c)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-blue-50/70 border-[#0B3B8C] shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{c.name}</h4>
                              {c.section && <p className="text-xs text-slate-500 font-medium mt-0.5">{c.section}</p>}
                            </div>
                            <ChevronRight size={16} className={isSelected ? 'text-[#0B3B8C]' : 'text-slate-300'} />
                          </div>
                          {c.room && (
                            <div className="mt-3 text-[11px] font-medium text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg inline-block">
                              Room: {c.room}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Course Detail Panel (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
                {selectedCourse ? (
                  <>
                    {/* Course Banner */}
                    <div className="bg-gradient-to-r from-[#0B3B8C] to-blue-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-amber-300">
                          {selectedCourse.courseState || 'ACTIVE CLASS'}
                        </span>
                        <h2 className="text-2xl font-black">{selectedCourse.name}</h2>
                        {selectedCourse.descriptionHeading && (
                          <p className="text-xs text-blue-100 font-medium line-clamp-1">{selectedCourse.descriptionHeading}</p>
                        )}
                      </div>

                      {selectedCourse.alternateLink && (
                        <a
                          href={selectedCourse.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
                        >
                          <span>Open in Google Classroom</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* Class Navigation Tabs */}
                    <div className="flex border-b border-slate-200 gap-6 text-sm font-bold text-slate-500">
                      <button
                        onClick={() => setActiveTab('announcements')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                          activeTab === 'announcements'
                            ? 'border-[#0B3B8C] text-[#0B3B8C]'
                            : 'border-transparent hover:text-slate-800'
                        }`}
                      >
                        <Megaphone size={16} /> Stream & Announcements ({announcements.length})
                      </button>

                      <button
                        onClick={() => setActiveTab('coursework')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                          activeTab === 'coursework'
                            ? 'border-[#0B3B8C] text-[#0B3B8C]'
                            : 'border-transparent hover:text-slate-800'
                        }`}
                      >
                        <FileText size={16} /> Coursework & Assignments ({courseWork.length})
                      </button>

                      <button
                        onClick={() => setActiveTab('roster')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                          activeTab === 'roster'
                            ? 'border-[#0B3B8C] text-[#0B3B8C]'
                            : 'border-transparent hover:text-slate-800'
                        }`}
                      >
                        <Users size={16} /> Roster ({teachers.length + students.length})
                      </button>
                    </div>

                    {/* Tab 1: Stream & Announcements */}
                    {activeTab === 'announcements' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-900 text-sm">Class Stream</h4>
                          <button
                            onClick={() => setShowAnnouncementModal(true)}
                            className="inline-flex items-center gap-1.5 bg-[#0B3B8C] hover:bg-blue-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                          >
                            <Plus size={14} /> Post Announcement
                          </button>
                        </div>

                        {loadingDetails ? (
                          <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                            <RefreshCw size={20} className="animate-spin mx-auto text-[#0B3B8C]" />
                            <p>Fetching announcements...</p>
                          </div>
                        ) : announcements.length === 0 ? (
                          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-500 text-xs space-y-2">
                            <MessageSquare size={28} className="mx-auto text-slate-400" />
                            <p className="font-semibold text-slate-700">No announcements posted yet</p>
                            <p>Share something with your class by clicking "Post Announcement" above.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {announcements.map(ann => (
                              <div key={ann.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                                <p className="text-slate-800 text-sm whitespace-pre-line leading-relaxed">{ann.text}</p>
                                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium pt-1">
                                  <span>{ann.creationTime ? new Date(ann.creationTime).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}</span>
                                  {ann.alternateLink && (
                                    <a href={ann.alternateLink} target="_blank" rel="noreferrer" className="text-[#0B3B8C] hover:underline flex items-center gap-1 font-semibold">
                                      View <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Coursework & Assignments */}
                    {activeTab === 'coursework' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-900 text-sm">Classroom Work & Assignments</h4>
                          <button
                            onClick={() => setShowCourseWorkModal(true)}
                            className="inline-flex items-center gap-1.5 bg-[#0B3B8C] hover:bg-blue-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                          >
                            <Plus size={14} /> Create Assignment
                          </button>
                        </div>

                        {loadingDetails ? (
                          <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                            <RefreshCw size={20} className="animate-spin mx-auto text-[#0B3B8C]" />
                            <p>Loading coursework items...</p>
                          </div>
                        ) : courseWork.length === 0 ? (
                          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-500 text-xs space-y-2">
                            <FileText size={28} className="mx-auto text-slate-400" />
                            <p className="font-semibold text-slate-700">No assignments created yet</p>
                            <p>Teachers can create assignments to share coursework tasks and grading criteria.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {courseWork.map(work => (
                              <div key={work.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-sm">{work.title}</h5>
                                    {work.description && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{work.description}</p>}
                                  </div>
                                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg whitespace-nowrap">
                                    {work.maxPoints ? `${work.maxPoints} pts` : 'Ungraded'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-200/50">
                                  <span>Due: {work.dueDate ? `${work.dueDate.year}-${work.dueDate.month}-${work.dueDate.day}` : 'No due date'}</span>
                                  {work.alternateLink && (
                                    <a href={work.alternateLink} target="_blank" rel="noreferrer" className="text-[#0B3B8C] hover:underline flex items-center gap-1 font-semibold">
                                      View Assignment <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Class Roster */}
                    {activeTab === 'roster' && (
                      <div className="space-y-6">
                        {/* Teachers */}
                        <div className="space-y-3">
                          <h4 className="font-extrabold text-[#0B3B8C] text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                            <GraduationCap size={16} /> Teachers ({teachers.length})
                          </h4>
                          {teachers.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No teacher profiles listed.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {teachers.map(t => (
                                <div key={t.userId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                                  {t.profile?.photoUrl ? (
                                    <img src={t.profile.photoUrl} alt="Teacher" className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#0B3B8C] text-white font-bold text-xs flex items-center justify-center">
                                      T
                                    </div>
                                  )}
                                  <div className="text-xs">
                                    <p className="font-bold text-slate-800">{t.profile?.name?.fullName || 'Teacher'}</p>
                                    <p className="text-slate-400 truncate text-[11px]">{t.profile?.emailAddress || t.userId}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Students */}
                        <div className="space-y-3">
                          <h4 className="font-extrabold text-emerald-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Users size={16} /> Enrolled Students ({students.length})
                          </h4>
                          {students.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No students enrolled yet or roster permission required.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {students.map(s => (
                                <div key={s.userId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                                  {s.profile?.photoUrl ? (
                                    <img src={s.profile.photoUrl} alt="Student" className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                                      S
                                    </div>
                                  )}
                                  <div className="text-xs">
                                    <p className="font-bold text-slate-800">{s.profile?.name?.fullName || 'Enrolled Student'}</p>
                                    <p className="text-slate-400 truncate text-[11px]">{s.profile?.emailAddress || s.userId}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    Select a course from the left sidebar to view stream, assignments, and class members.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Post Announcement */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone size={18} className="text-[#0B3B8C]" /> Post Announcement
            </h3>
            <p className="text-xs text-slate-500">
              Share a live update, announcement, or notice with all students enrolled in <strong className="text-slate-800">{selectedCourse?.name}</strong>.
            </p>

            <form onSubmit={requestCreateAnnouncement} className="space-y-4">
              <textarea
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="Type your class announcement here..."
                rows={4}
                required
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white outline-none"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0B3B8C] hover:bg-blue-900 rounded-xl shadow-xs"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment */}
      {showCourseWorkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-[#0B3B8C]" /> Create New Assignment
            </h3>
            <p className="text-xs text-slate-500">
              Publish a new coursework assignment in <strong className="text-slate-800">{selectedCourse?.name}</strong>.
            </p>

            <form onSubmit={requestCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={e => setAssignmentTitle(e.target.value)}
                  placeholder="e.g., Zanzibar Spice & Ecosystem Research Task"
                  required
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  value={assignmentDesc}
                  onChange={e => setAssignmentDesc(e.target.value)}
                  placeholder="Provide instructions for students..."
                  rows={3}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Points Score</label>
                <input
                  type="number"
                  value={assignmentPoints}
                  onChange={e => setAssignmentPoints(Number(e.target.value))}
                  min={0}
                  max={1000}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseWorkModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0B3B8C] hover:bg-blue-900 rounded-xl shadow-xs"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit User Confirmation Modal (Mandatory Workspace Policy Rule) */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-200">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">{pendingConfirmAction.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pendingConfirmAction.details}</p>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 font-medium">
              ⚠️ Content will be published directly to user's Google Classroom account.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingConfirmAction(null)}
                disabled={postingAnnouncement || postingAssignment}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                disabled={postingAnnouncement || postingAssignment}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0B3B8C] hover:bg-blue-900 rounded-xl shadow-xs flex items-center gap-2"
              >
                {(postingAnnouncement || postingAssignment) ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Confirm & Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
