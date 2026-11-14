import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, MessageSquare, X } from 'lucide-react';
import type { Conversation, DirectMessage, SocialMemberProfile, UserAccount } from '../types';
import {
  otherMemberProfile,
  subscribeToConversations,
  subscribeToMessages,
} from '../services/social';

interface AdminChatHistoryModalProps {
  account: UserAccount | null;
  onClose: () => void;
}

const ROLE_LABELS: Record<UserAccount['role'], string> = {
  student: 'Học sinh',
  teacher: 'Giáo viên',
  school: 'Nhà trường',
  parent: 'Phụ huynh',
  admin: 'Quản trị viên',
};

const formatDateTime = (timestamp: number): string =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp);

const describeProfile = (profile: SocialMemberProfile): string => {
  const parts: string[] = [ROLE_LABELS[profile.role] || 'Thành viên'];
  if (profile.role === 'student' && profile.grade) parts.push(`Khối ${profile.grade}`);
  if (profile.className) parts.push(`Lớp ${profile.className}`);
  if (profile.school) parts.push(profile.school);
  return parts.join(' · ');
};

/**
 * Cho phép Admin xem toàn bộ lịch sử trò chuyện của một tài khoản:
 * liệt kê mọi hội thoại (từ trước tới nay) và nội dung tin nhắn.
 */
export const AdminChatHistoryModal: React.FC<AdminChatHistoryModalProps> = ({
  account,
  onClose,
}) => {
  const uid = account ? account.firebaseUid || account.id : '';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<{
    conversationId: string;
    peer: SocialMemberProfile;
  } | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  useEffect(() => {
    if (!uid) {
      setConversations([]);
      return;
    }
    setIsLoading(true);
    setActiveChat(null);
    setErrorMessage(null);
    return subscribeToConversations(
      uid,
      (items) => {
        setConversations(items);
        setIsLoading(false);
      },
      (error) => {
        console.error('ADMIN_CHAT_HISTORY_CONVERSATIONS_ERROR:', error);
        setErrorMessage('Không tải được danh sách cuộc trò chuyện của tài khoản này.');
        setIsLoading(false);
      }
    );
  }, [uid]);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    return subscribeToMessages(activeChat.conversationId, setMessages, (error) => {
      console.error('ADMIN_CHAT_HISTORY_MESSAGES_ERROR:', error);
      setErrorMessage('Không tải được nội dung tin nhắn.');
    });
  }, [activeChat]);

  if (!account || !uid) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-chat-history-title"
        className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
          <div className="min-w-0">
            <h2 id="admin-chat-history-title" className="font-extrabold">
              Lịch sử trò chuyện
            </h2>
            <p className="mt-0.5 truncate text-[11px] text-slate-300">
              {account.fullName}
              {account.username ? ` · @${account.username}` : ''} · {account.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng lịch sử trò chuyện"
            className="rounded-xl p-2 text-slate-200 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {errorMessage && (
          <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-2.5 text-xs text-red-800">
            {errorMessage}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeChat ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActiveChat(null)}
                  aria-label="Quay lại danh sách cuộc trò chuyện"
                  className="rounded-lg p-1 text-slate-600 hover:bg-slate-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold text-slate-900">
                    Trò chuyện với {activeChat.peer.fullName}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {describeProfile(activeChat.peer)}
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto bg-slate-100/60 p-4">
                {messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Cuộc trò chuyện này chưa có tin nhắn.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isTarget = message.senderUid === uid;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isTarget ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${isTarget ? 'bg-white text-slate-800' : 'bg-slate-700 text-white'}`}
                        >
                          <p className="mb-0.5 text-[10px] font-bold opacity-70">
                            {message.senderName}
                          </p>
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <span className="mt-1 block text-right text-[10px] opacity-70">
                            {formatDateTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              {isLoading ? (
                <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tải lịch sử trò chuyện...
                </p>
              ) : conversations.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  Tài khoản này chưa có cuộc trò chuyện nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => {
                    const peer = otherMemberProfile(
                      conversation.members,
                      conversation.profiles,
                      uid
                    );
                    if (!peer) return null;
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setActiveChat({ conversationId: conversation.id, peer })}
                        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <MessageSquare className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-extrabold text-slate-900">
                              {peer.fullName}
                            </span>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {conversation.lastMessageAt
                                ? formatDateTime(conversation.lastMessageAt)
                                : ''}
                            </span>
                          </div>
                          <span className="truncate text-xs text-slate-500">
                            {conversation.lastMessage || 'Chưa có tin nhắn'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
