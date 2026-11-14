import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Loader2, Send, Users } from 'lucide-react';
import type { FirebaseUserProfile, NotificationAudienceRole, NotificationDisplayMode } from '../types';
import { getFirebaseUserProfiles, sendNotifications } from '../services/firebaseNotifications';
import { FIREBASE_ADMIN_EMAIL } from '../services/firebaseAdminAuth';

type AudienceMode = 'all' | 'role' | 'selected';

const roleLabels: Record<NotificationAudienceRole, string> = {
  student: 'Học sinh',
  teacher: 'Giáo viên',
  school: 'Nhà trường',
};

export const AdminNotificationsPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<FirebaseUserProfile[]>([]);
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('all');
  const [selectedRole, setSelectedRole] = useState<NotificationAudienceRole>('student');
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [displayMode, setDisplayMode] = useState<NotificationDisplayMode>('inbox');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getFirebaseUserProfiles()
      .then((users) => {
        if (active) setProfiles(users);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : 'Không tải được danh sách tài khoản Firebase.'
        );
      })
      .finally(() => {
        if (active) setIsLoadingProfiles(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    const search = recipientSearch.trim().toLocaleLowerCase();
    return profiles.filter(
      (profile) =>
        (!search ||
          profile.fullName.toLocaleLowerCase().includes(search) ||
          profile.email.toLocaleLowerCase().includes(search)) &&
        (audienceMode !== 'role' || profile.role === selectedRole)
    );
  }, [profiles, recipientSearch, audienceMode, selectedRole]);

  const recipients = useMemo(() => {
    if (audienceMode === 'all') return profiles;
    if (audienceMode === 'role') {
      return profiles.filter((profile) => profile.role === selectedRole);
    }
    const selected = new Set(selectedUids);
    return profiles.filter((profile) => selected.has(profile.uid));
  }, [profiles, audienceMode, selectedRole, selectedUids]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Hãy nhập tiêu đề và nội dung thông báo.');
      return;
    }
    if (recipients.length === 0) {
      setErrorMessage('Nhóm người nhận hiện không có tài khoản Firebase đã xác minh.');
      return;
    }

    setIsSending(true);
    try {
      const count = await sendNotifications(recipients, {
        title: title.trim(),
        message: message.trim(),
        displayMode,
        createdBy: FIREBASE_ADMIN_EMAIL,
      });
      setSuccessMessage(`Đã gửi thông báo tới ${count} tài khoản.`);
      setTitle('');
      setMessage('');
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không gửi được thông báo. Hãy kiểm tra kết nối và quyền Firestore.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecipient = (uid: string) => {
    setSelectedUids((current) =>
      current.includes(uid) ? current.filter((value) => value !== uid) : [...current, uid]
    );
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <Bell className="h-5 w-5 text-sky-600" />
          Soạn thông báo
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Thông báo được lưu trong Firebase và gửi vào hộp thư của từng tài khoản đã xác minh.
        </p>

        {errorMessage && (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSend} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">
              Tiêu đề
              <input
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal"
                placeholder="Nhập tiêu đề thông báo"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Nội dung
              <textarea
                required
                maxLength={4000}
                rows={7}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-normal"
                placeholder="Viết nội dung thông báo..."
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-slate-700">Kiểu thông báo</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-xl border p-3 text-xs ${displayMode === 'prominent' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                  <input
                    type="radio"
                    name="notification-display-mode"
                    value="prominent"
                    checked={displayMode === 'prominent'}
                    onChange={() => setDisplayMode('prominent')}
                    className="mr-2 accent-amber-500"
                  />
                  <strong className="text-amber-900">Nổi bật</strong>
                  <span className="mt-1 block pl-5 text-slate-600">Hiện bảng nổi bật khi người nhận đang trực tuyến, đồng thời lưu trong hộp thư.</span>
                </label>
                <label className={`cursor-pointer rounded-xl border p-3 text-xs ${displayMode === 'inbox' ? 'border-sky-400 bg-sky-50' : 'border-slate-200'}`}>
                  <input
                    type="radio"
                    name="notification-display-mode"
                    value="inbox"
                    checked={displayMode === 'inbox'}
                    onChange={() => setDisplayMode('inbox')}
                    className="mr-2 accent-sky-600"
                  />
                  <strong className="text-sky-900">Chìm</strong>
                  <span className="mt-1 block pl-5 text-slate-600">Chỉ gửi vào hộp thư; không bật bảng thông báo khi đang trực tuyến.</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Users className="h-4 w-4 text-sky-600" />
              Người nhận
            </div>
            <div className="grid gap-2">
              {([
                ['all', 'Toàn bộ tài khoản'],
                ['role', 'Theo nhóm vai trò'],
                ['selected', 'Chọn từng người'],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="notification-audience"
                    checked={audienceMode === value}
                    onChange={() => setAudienceMode(value)}
                    className="accent-sky-600"
                  />
                  {label}
                </label>
              ))}
            </div>

            {audienceMode === 'role' && (
              <label className="block text-xs font-bold text-slate-700">
                Vai trò
                <select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value as NotificationAudienceRole)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <option key={role} value={role}>{label}</option>
                  ))}
                </select>
              </label>
            )}

            {audienceMode !== 'all' && (
              <div className="space-y-2">
                <input
                  type="search"
                  value={recipientSearch}
                  onChange={(event) => setRecipientSearch(event.target.value)}
                  placeholder="Tìm tên hoặc email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
                {audienceMode === 'selected' && (
                  <p className="text-[11px] text-slate-600">Đã chọn {selectedUids.length} người</p>
                )}
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                  {isLoadingProfiles ? (
                    <p className="p-3 text-xs text-slate-500">Đang tải tài khoản...</p>
                  ) : filteredProfiles.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500">Không tìm thấy tài khoản.</p>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <label key={profile.uid} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-xs hover:bg-sky-50">
                        {audienceMode === 'selected' ? (
                          <input
                            type="checkbox"
                            checked={selectedUids.includes(profile.uid)}
                            onChange={() => toggleRecipient(profile.uid)}
                            className="mt-0.5 accent-sky-600"
                          />
                        ) : (
                          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-sky-100" />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-slate-800">{profile.fullName}</span>
                          <span className="block truncate text-slate-500">{profile.email} · {roleLabels[profile.role]}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <p className="text-xs font-bold text-sky-800">
              {isLoadingProfiles ? 'Đang xác định người nhận...' : `Sẽ gửi tới ${recipients.length} tài khoản`}
            </p>
            <button
              type="submit"
              disabled={isSending || isLoadingProfiles || recipients.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
