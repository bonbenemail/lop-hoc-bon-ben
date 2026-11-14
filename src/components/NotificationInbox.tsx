import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import type { UserNotification } from '../types';
import {
  markUserNotificationRead,
  subscribeToUserInbox,
} from '../services/firebaseNotifications';

interface NotificationInboxProps {
  uid: string | null;
}

const formatDate = (timestamp: number): string =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);

export const NotificationInbox: React.FC<NotificationInboxProps> = ({ uid }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<UserNotification | null>(null);
  const [prominentNotification, setProminentNotification] = useState<UserNotification | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasReceivedInitialSnapshot = useRef(false);
  const knownNotificationIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    setNotifications([]);
    setSelectedNotification(null);
    setProminentNotification(null);
    setErrorMessage(null);
    hasReceivedInitialSnapshot.current = false;
    knownNotificationIds.current = new Set();
    if (!uid) return;

    return subscribeToUserInbox(
      uid,
      (nextNotifications) => {
        if (hasReceivedInitialSnapshot.current) {
          const newlyArrived = nextNotifications.find(
            (notification) =>
              !knownNotificationIds.current.has(notification.id) &&
              !notification.read &&
              notification.displayMode === 'prominent'
          );
          if (newlyArrived) setProminentNotification(newlyArrived);
        }
        hasReceivedInitialSnapshot.current = true;
        knownNotificationIds.current = new Set(
          nextNotifications.map((notification) => notification.id)
        );
        setNotifications(nextNotifications);
        setErrorMessage(null);
      },
      (error) => {
        console.error('FIREBASE_NOTIFICATION_INBOX_ERROR:', error);
        setErrorMessage('Không tải được hộp thư. Hãy kiểm tra kết nối Firebase rồi thử lại.');
      }
    );
  }, [uid]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleOpenNotification = async (notification: UserNotification) => {
    setSelectedNotification(notification);
    setProminentNotification(null);
    if (!uid || notification.read) return;
    try {
      await markUserNotificationRead(uid, notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      setSelectedNotification((current) =>
        current?.id === notification.id ? { ...current, read: true } : current
      );
    } catch (error) {
      console.error('FIREBASE_NOTIFICATION_READ_ERROR:', error);
      setErrorMessage('Không đánh dấu đã đọc được. Vui lòng thử lại.');
    }
  };

  if (!uid) return null;

  return (
    <>
      {prominentNotification && (
        <div
          role="alert"
          className="fixed left-1/2 top-20 z-[70] w-[min(92vw,640px)] -translate-x-1/2 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-2xl sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950">
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-wide text-amber-800">
                Thông báo nổi bật từ Admin
              </div>
              <h2 className="mt-1 font-extrabold text-slate-950">{prominentNotification.title}</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {prominentNotification.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setProminentNotification(null)}
              aria-label="Đóng thông báo nổi bật"
              className="rounded-lg p-1 text-slate-500 hover:bg-amber-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Mở hộp thư, ${unreadCount} thông báo chưa đọc`}
        className="fixed bottom-5 right-4 z-40 flex h-12 items-center gap-2 rounded-full border border-sky-300 bg-white px-4 text-xs font-extrabold text-sky-900 shadow-xl hover:bg-sky-50"
      >
        <span className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <span>Hộp thư</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-inbox-title"
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-sky-900 px-5 py-4 text-white">
              <div>
                <h2 id="notification-inbox-title" className="font-extrabold">
                  Hộp thư thông báo
                </h2>
                <p className="mt-0.5 text-[11px] text-sky-200">
                  {unreadCount} thông báo chưa đọc
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedNotification(null);
                }}
                aria-label="Đóng hộp thư"
                className="rounded-xl p-2 text-sky-100 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {errorMessage && (
              <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-xs text-red-800">
                {errorMessage}
              </p>
            )}

            {selectedNotification ? (
              <article className="overflow-y-auto p-5">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="mb-4 text-xs font-bold text-sky-700 hover:underline"
                >
                  ← Quay lại danh sách
                </button>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${selectedNotification.displayMode === 'prominent' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>
                  {selectedNotification.displayMode === 'prominent' ? 'NỔI BẬT' : 'THÔNG BÁO'}
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                  {selectedNotification.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  {formatDate(selectedNotification.createdAt)}
                </p>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {selectedNotification.message}
                </p>
                <p className="mt-6 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  {selectedNotification.read ? 'Đã đọc' : 'Đã đánh dấu đã đọc'}
                </p>
              </article>
            ) : (
              <div className="overflow-y-auto p-3 sm:p-4">
                {notifications.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Hộp thư của bạn hiện chưa có thông báo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => void handleOpenNotification(notification)}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors hover:border-sky-300 hover:bg-sky-50 ${notification.read ? 'border-slate-200 bg-white' : 'border-sky-200 bg-sky-50/70'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-extrabold text-slate-900">{notification.title}</span>
                          {!notification.read && (
                            <span className="shrink-0 rounded-full bg-sky-600 px-2 py-0.5 text-[9px] font-black text-white">
                              MỚI
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-slate-600">
                          {notification.message}
                        </p>
                        <span className="mt-2 block text-[10px] text-slate-400">
                          {formatDate(notification.createdAt)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};
