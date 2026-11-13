import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  Building2,
  GraduationCap,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { GradeLevel, UserAccount } from '../types';
import { MASCOT_IMAGE } from '../data/bonbenData';
import {
  initAuth,
  googleSignIn,
  logoutGmail,
  sendSupportEmailViaGmail
} from '../services/gmailAuth';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  currentGrade: GradeLevel;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentGrade,
}) => {
  const [senderName, setSenderName] = useState(currentUser?.fullName || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [gradeInfo, setGradeInfo] = useState(
    currentUser?.className ? `Lớp ${currentUser.className} (Khối ${currentGrade})` : `Lớp ${currentGrade}`
  );
  const [schoolInfo, setSchoolInfo] = useState(currentUser?.school || '');
  const [topic, setTopic] = useState('Hỗ trợ tài khoản & mật khẩu');
  const [issueContent, setIssueContent] = useState('');

  const [needsGmailAuth, setNeedsGmailAuth] = useState<boolean>(false);
  const [isSigningInGmail, setIsSigningInGmail] = useState<boolean>(false);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSenderName(currentUser?.fullName || '');
      setSenderEmail(currentUser?.email || '');
      setGradeInfo(
        currentUser?.className
          ? `Lớp ${currentUser.className} (Khối ${currentGrade})`
          : `Lớp ${currentGrade}`
      );
      setSchoolInfo(currentUser?.school || '');
      setErrorMsg(null);
      setSentSuccess(false);
    }
  }, [isOpen, currentUser, currentGrade]);

  if (!isOpen) return null;

  const handleGoogleSignInClick = async () => {
    setIsSigningInGmail(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsGmailAuth(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập Google thất bại.';
      setErrorMsg(msg);
    } finally {
      setIsSigningInGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await logoutGmail();
    setNeedsGmailAuth(true);
  };

  const handlePrepareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!senderName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!senderEmail.trim() || !senderEmail.trim().toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail liên hệ hợp lệ (@gmail.com).');
      return;
    }
    if (!issueContent.trim() || issueContent.trim().length < 5) {
      setErrorMsg('Vui lòng mô tả chi tiết vấn đề cần hỗ trợ (ít nhất 5 ký tự).');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeSendSupportTicket = async () => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      await sendSupportEmailViaGmail({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim().toLowerCase(),
        gradeInfo: gradeInfo.trim() || `Lớp ${currentGrade}`,
        schoolInfo: schoolInfo.trim(),
        topic,
        issueContent: issueContent.trim(),
      });
      setShowConfirmModal(false);
      setSentSuccess(true);
      setIssueContent('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể gửi yêu cầu hỗ trợ. Vui lòng kiểm tra cấu hình máy chủ gửi email.';
      setErrorMsg(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 max-w-xl w-full overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-sky-400 bg-sky-800 p-0.5 shrink-0">
              <img
                src={MASCOT_IMAGE}
                alt="Bon Ben Support"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  TRUNG TÂM HỖ TRỢ LỚP HỌC BON BEN
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight mt-0.5">
                Gửi Yêu Cầu Hỗ Trợ Tới Ban Quản Trị
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-sky-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Auto-email flow without Google linking */}
          <div className="p-3.5 rounded-2xl border border-sky-200 bg-sky-50/70 flex items-start sm:items-center justify-between gap-3">
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-sky-950">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                <span>Gửi yêu cầu hỗ trợ qua email đăng ký</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Máy chủ sẽ gửi yêu cầu từ bonbenemail@gmail.com tới Ban Quản Trị và gửi bản sao tới email liên hệ, không cần đăng nhập Google.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã sẵn sàng</span>
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {sentSuccess ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg ring-4 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Đã gửi vấn đề hỗ trợ thành công!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Nội dung cần hỗ trợ của <strong>{senderName}</strong> ({senderEmail}) đã được chuyển trực tiếp vào hộp thư của <strong>Ban Quản Trị Lớp học Bon Ben</strong>. Chúng tôi sẽ phản hồi sớm nhất!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSentSuccess(false)}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs cursor-pointer"
                >
                  Gửi thêm vấn đề khác
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePrepareSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Họ và tên người gửi: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gmail liên hệ (@gmail.com): <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="tenban@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Lớp / Khối lớp:
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gradeInfo}
                      onChange={(e) => setGradeInfo(e.target.value)}
                      placeholder={`Ví dụ: Lớp ${currentGrade}A1`}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trường học:
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={schoolInfo}
                      onChange={(e) => setSchoolInfo(e.target.value)}
                      placeholder="Tên trường học của bạn..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Chủ đề cần hỗ trợ:
                </label>
                <div className="relative">
                  <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Hỗ trợ tài khoản & mật khẩu">Hỗ trợ tài khoản & mật khẩu</option>
                    <option value="Thắc mắc bài luyện môn Văn / Toán / Anh">
                      Thắc mắc bài luyện môn Văn / Toán / Anh
                    </option>
                    <option value="Hỗ trợ đổi thông tin Lớp & Trường học">
                      Hỗ trợ đổi thông tin Lớp & Trường học
                    </option>
                    <option value="Báo lỗi kỹ thuật hoặc góp ý hệ thống">
                      Báo lỗi kỹ thuật hoặc góp ý hệ thống
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nội dung vấn đề cần hỗ trợ:{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={4}
                    required
                    value={issueContent}
                    onChange={(e) => setIssueContent(e.target.value)}
                    placeholder="Hãy viết chi tiết vấn đề bạn đang gặp phải để Quản trị viên hỗ trợ..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>Gửi yêu cầu hỗ trợ ngay</span>
              </button>
            </form>
          )}
        </div>

        {/* Mandatory Confirmation Modal before sending support email via Gmail API */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-sky-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Xác nhận gửi yêu cầu hỗ trợ
                  </h4>
                  <p className="text-xs text-slate-500">
                    Nội dung sẽ được chuyển tới hộp thư Ban Quản Trị Lớp học Bon Ben
                  </p>
                </div>
              </div>

              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-200 text-xs space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Nơi tiếp nhận:</span>
                  <strong className="text-sky-900 font-bold">Ban Quản Trị Lớp học Bon Ben</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Người gửi:</span>
                  <strong className="text-slate-800">
                    {senderName.trim()} ({senderEmail.trim().toLowerCase()})
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Chủ đề:</span>
                  <strong className="text-sky-700 text-right">{topic}</strong>
                </div>
                <div className="pt-1 border-t border-sky-200/60">
                  <span className="text-slate-500 font-medium block mb-1">Nội dung vấn đề:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-sky-100 max-h-28 overflow-y-auto whitespace-pre-wrap">
                    {issueContent.trim()}
                  </p>
                </div>
              </div>

              {needsGmailAuth && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-semibold">
                    Vui lòng nhấn nút bên dưới để đăng nhập Google cấp quyền gửi thư hỗ trợ:
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={isSigningInGmail}
                    className="gsi-material-button w-full inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="gsi-material-button-state" />
                    <div className="gsi-material-button-content-wrapper flex items-center gap-2">
                      <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="w-4 h-4 block"
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isSigningInGmail ? 'Đang kết nối Google...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={executeSendSupportTicket}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi về Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Xác nhận gửi ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
