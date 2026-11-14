import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  Conversation,
  DirectMessage,
  FriendRequest,
  Friendship,
  SocialMemberProfile,
  UserAccount,
} from '../types';
import { lookupDirectoryByUsername } from '../services/usernames';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  ensureConversation,
  markConversationRead,
  otherMemberProfile,
  profileFromDirectory,
  removeFriend,
  sendDirectMessage,
  sendFriendRequest,
  subscribeToConversations,
  subscribeToFriendRequests,
  subscribeToFriendships,
  subscribeToMessages,
} from '../services/social';

interface SocialHubProps {
  currentUser: UserAccount | null;
  onNotice?: (message: string) => void;
}

type SocialTab = 'friends' | 'find' | 'messages';
type Relation = 'friend' | 'outgoing' | 'incoming' | 'none';

const ROLE_LABELS: Record<UserAccount['role'], string> = {
  student: 'Học sinh',
  teacher: 'Giáo viên',
  school: 'Nhà trường',
  parent: 'Phụ huynh',
  admin: 'Quản trị viên',
};

const formatTime = (timestamp: number): string =>
  new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(timestamp);

const formatDay = (timestamp: number): string =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp);

const describeProfile = (profile: SocialMemberProfile): string => {
  const parts: string[] = [ROLE_LABELS[profile.role] || 'Thành viên'];
  if (profile.role === 'student' && profile.grade) parts.push(`Khối ${profile.grade}`);
  if (profile.className) parts.push(`Lớp ${profile.className}`);
  if (profile.school) parts.push(profile.school);
  return parts.join(' · ');
};

const Avatar: React.FC<{ profile: SocialMemberProfile; size?: string }> = ({
  profile,
  size = 'h-10 w-10',
}) => (
  <span
    className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-black text-emerald-800`}
  >
    {profile.avatar ? (
      <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" />
    ) : (
      (profile.fullName || '?').charAt(0).toUpperCase()
    )}
  </span>
);

export const SocialHub: React.FC<SocialHubProps> = ({ currentUser, onNotice }) => {
  const myUid = currentUser ? currentUser.firebaseUid || currentUser.id : '';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SocialTab>('friends');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SocialMemberProfile | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [pendingTargetUid, setPendingTargetUid] = useState<string | null>(null);

  const [activeChat, setActiveChat] = useState<{
    conversationId: string;
    peer: SocialMemberProfile;
  } | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!myUid) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setFriendships([]);
      setConversations([]);
      return;
    }
    const handleError = (error: unknown) => {
      console.error('SOCIAL_HUB_SUBSCRIPTION_ERROR:', error);
      setErrorMessage('Không tải được dữ liệu kết bạn. Hãy kiểm tra kết nối rồi thử lại.');
    };
    const unsubscribers = [
      subscribeToFriendRequests(myUid, (incoming, outgoing) => {
        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
      }, handleError),
      subscribeToFriendships(myUid, setFriendships, handleError),
      subscribeToConversations(myUid, setConversations, handleError),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [myUid]);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    return subscribeToMessages(activeChat.conversationId, setMessages, (error) => {
      console.error('SOCIAL_HUB_MESSAGES_ERROR:', error);
      setErrorMessage('Không tải được tin nhắn của cuộc trò chuyện này.');
    });
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  if (!currentUser || !myUid) return null;

  const unreadMessages = conversations.reduce(
    (total, conversation) => total + (conversation.unread?.[myUid] || 0),
    0
  );
  const badgeCount = incomingRequests.length + unreadMessages;

  const relationTo = (targetUid: string): Relation => {
    if (friendships.some((item) => item.members.includes(targetUid))) return 'friend';
    if (outgoingRequests.some((item) => item.toUid === targetUid)) return 'outgoing';
    if (incomingRequests.some((item) => item.fromUid === targetUid)) return 'incoming';
    return 'none';
  };

  const runAction = async (
    action: () => Promise<void>,
    successMessage: string,
    fallbackError: string
  ) => {
    try {
      await action();
      setErrorMessage(null);
      onNotice?.(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackError;
      setErrorMessage(message);
      onNotice?.(`⛔ ${message}`);
    }
  };

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (!term) return;
    setIsSearching(true);
    setSearchResult(null);
    setSearchFeedback(null);
    setErrorMessage(null);
    try {
      const entry = await lookupDirectoryByUsername(term);
      if (!entry) {
        setSearchFeedback('Không tìm thấy tài khoản nào có tên này.');
        return;
      }
      if (entry.uid === myUid) {
        setSearchFeedback('Đây chính là tài khoản của bạn.');
        return;
      }
      setSearchResult(profileFromDirectory(entry));
    } catch (error) {
      console.error('SOCIAL_HUB_SEARCH_ERROR:', error);
      setSearchFeedback('Không tra cứu được tên tài khoản. Vui lòng thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (target: SocialMemberProfile) => {
    setPendingTargetUid(target.uid);
    try {
      const outcome = await sendFriendRequest(currentUser, target);
      setErrorMessage(null);
      onNotice?.(
        outcome === 'accepted'
          ? `🎉 ${target.fullName} cũng đã gửi lời mời. Hai bạn đã trở thành bạn bè!`
          : `✅ Đã gửi lời mời kết bạn tới ${target.fullName}. Hãy chờ họ đồng ý.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không gửi được lời mời kết bạn.';
      setErrorMessage(message);
      onNotice?.(`⛔ ${message}`);
    } finally {
      setPendingTargetUid(null);
    }
  };

  const handleOpenChat = async (peer: SocialMemberProfile) => {
    try {
      const conversationId = await ensureConversation(currentUser, peer);
      setActiveChat({ conversationId, peer });
      setActiveTab('messages');
      await markConversationRead(conversationId, myUid);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không mở được cuộc trò chuyện.';
      setErrorMessage(message);
      onNotice?.(`⛔ ${message}`);
    }
  };

  const handleOpenConversation = async (conversation: Conversation) => {
    const peer = otherMemberProfile(conversation.members, conversation.profiles, myUid);
    if (!peer) return;
    setActiveChat({ conversationId: conversation.id, peer });
    try {
      await markConversationRead(conversation.id, myUid);
    } catch (error) {
      console.error('SOCIAL_HUB_MARK_READ_ERROR:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChat || !draft.trim() || isSending) return;
    setIsSending(true);
    const text = draft;
    setDraft('');
    try {
      await sendDirectMessage(activeChat.conversationId, currentUser, text);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không gửi được tin nhắn.';
      setErrorMessage(message);
      onNotice?.(`⛔ ${message}`);
      setDraft(text);
    } finally {
      setIsSending(false);
    }
  };

  const renderRequestCard = (request: FriendRequest, incoming: boolean) => {
    const profile = incoming ? request.fromProfile : request.toProfile;
    return (
      <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-start gap-3">
          <Avatar profile={profile} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-extrabold text-slate-900">{profile.fullName}</div>
            {profile.username && (
              <div className="truncate text-[11px] text-slate-500">@{profile.username}</div>
            )}
            <div className="mt-0.5 truncate text-[11px] text-slate-500">
              {describeProfile(profile)}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {incoming ? (
            <>
              <button
                type="button"
                onClick={() =>
                  void runAction(
                    () => acceptFriendRequest(request),
                    `🎉 Bạn và ${profile.fullName} đã trở thành bạn bè!`,
                    'Không chấp nhận được lời mời.'
                  )
                }
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" /> Đồng ý
              </button>
              <button
                type="button"
                onClick={() =>
                  void runAction(
                    () => declineFriendRequest(request.id),
                    'Đã từ chối lời mời kết bạn.',
                    'Không từ chối được lời mời.'
                  )
                }
                className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" /> Từ chối
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                void runAction(
                  () => cancelFriendRequest(request.id),
                  'Đã thu hồi lời mời kết bạn.',
                  'Không thu hồi được lời mời.'
                )
              }
              className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <Clock className="h-3.5 w-3.5" /> Đang chờ · Thu hồi
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFindTab = () => (
    <div className="space-y-4 p-4">
      <div>
        <label htmlFor="social-search" className="text-xs font-bold text-slate-600">
          Nhập đúng tên tài khoản để tìm bạn
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="social-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleSearch();
            }}
            placeholder="Ví dụ: nguyenvanan01"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isSearching}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Tìm
          </button>
        </div>
      </div>

      {searchFeedback && (
        <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">{searchFeedback}</p>
      )}

      {searchResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start gap-3">
            <Avatar profile={searchResult} size="h-12 w-12" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-extrabold text-slate-900">{searchResult.fullName}</div>
              {searchResult.username && (
                <div className="truncate text-xs text-slate-500">@{searchResult.username}</div>
              )}
              <div className="mt-0.5 truncate text-xs text-slate-600">
                {describeProfile(searchResult)}
              </div>
            </div>
          </div>
          <div className="mt-3">
            {relationTo(searchResult.uid) === 'friend' ? (
              <button
                type="button"
                onClick={() => void handleOpenChat(searchResult)}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
              >
                <MessageCircle className="h-4 w-4" /> Nhắn tin
              </button>
            ) : relationTo(searchResult.uid) === 'outgoing' ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-600">
                <Clock className="h-4 w-4" /> Đã gửi lời mời, đang chờ đồng ý
              </span>
            ) : relationTo(searchResult.uid) === 'incoming' ? (
              <button
                type="button"
                onClick={() =>
                  void handleSendFriendRequest(searchResult)
                }
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" /> Chấp nhận lời mời kết bạn
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSendFriendRequest(searchResult)}
                disabled={pendingTargetUid === searchResult.uid}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {pendingTargetUid === searchResult.uid ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Gửi lời mời kết bạn
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderFriendsTab = () => (
    <div className="space-y-5 p-4">
      {incomingRequests.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-700">
            Lời mời đã nhận · {incomingRequests.length}
          </h3>
          <div className="space-y-2">
            {incomingRequests.map((request) => renderRequestCard(request, true))}
          </div>
        </section>
      )}

      {outgoingRequests.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
            Lời mời đã gửi · {outgoingRequests.length}
          </h3>
          <div className="space-y-2">
            {outgoingRequests.map((request) => renderRequestCard(request, false))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
          Bạn bè · {friendships.length}
        </h3>
        {friendships.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            Bạn chưa có người bạn nào. Hãy sang tab “Tìm bạn” để kết nối.
          </p>
        ) : (
          <div className="space-y-2">
            {friendships.map((friendship) => {
              const peer = otherMemberProfile(friendship.members, friendship.profiles, myUid);
              if (!peer) return null;
              return (
                <div
                  key={friendship.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <Avatar profile={peer} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-extrabold text-slate-900">{peer.fullName}</div>
                    {peer.username && (
                      <div className="truncate text-[11px] text-slate-500">@{peer.username}</div>
                    )}
                    <div className="mt-0.5 truncate text-[11px] text-slate-500">
                      {describeProfile(peer)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleOpenChat(peer)}
                      aria-label={`Nhắn tin với ${peer.fullName}`}
                      className="rounded-xl bg-sky-600 p-2 text-white hover:bg-sky-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void runAction(
                          () => removeFriend(friendship),
                          `Đã hủy kết bạn với ${peer.fullName}.`,
                          'Không hủy được kết bạn.'
                        )
                      }
                      aria-label={`Hủy kết bạn với ${peer.fullName}`}
                      className="rounded-xl border border-slate-300 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  const renderMessagesTab = () => {
    if (activeChat) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setActiveChat(null);
                setDraft('');
              }}
              aria-label="Quay lại danh sách tin nhắn"
              className="rounded-lg p-1 text-slate-600 hover:bg-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar profile={activeChat.peer} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-extrabold text-slate-900">
                {activeChat.peer.fullName}
              </div>
              <div className="truncate text-[11px] text-slate-500">
                {describeProfile(activeChat.peer)}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-slate-100/60 p-4">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
              </p>
            ) : (
              messages.map((message) => {
                const isMine = message.senderUid === myUid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${isMine ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'}`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <span
                        className={`mt-1 block text-right text-[10px] ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}
                      >
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendMessage();
                }
              }}
              rows={1}
              placeholder="Nhập tin nhắn..."
              className="max-h-28 min-h-[42px] min-w-0 flex-1 resize-none rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={!draft.trim() || isSending}
              aria-label="Gửi tin nhắn"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        {conversations.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            Chưa có cuộc trò chuyện nào. Kết bạn rồi bấm biểu tượng tin nhắn để bắt đầu.
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const peer = otherMemberProfile(conversation.members, conversation.profiles, myUid);
              if (!peer) return null;
              const unread = conversation.unread?.[myUid] || 0;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => void handleOpenConversation(conversation)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50 ${unread > 0 ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}
                >
                  <Avatar profile={peer} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-extrabold text-slate-900">
                        {peer.fullName}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {conversation.lastMessageAt ? formatDay(conversation.lastMessageAt) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-500">
                        {conversation.lastMessage
                          ? `${conversation.lastSenderUid === myUid ? 'Bạn: ' : ''}${conversation.lastMessage}`
                          : 'Chưa có tin nhắn'}
                      </span>
                      {unread > 0 && (
                        <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Mở trung tâm kết bạn, ${badgeCount} thông tin mới`}
        className="fixed bottom-20 right-4 z-40 flex h-12 items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 text-xs font-extrabold text-emerald-900 shadow-xl hover:bg-emerald-50"
      >
        <span className="relative">
          <Users className="h-4 w-4" />
          {badgeCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </span>
        <span>Kết bạn</span>
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
            aria-labelledby="social-hub-title"
            className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-emerald-900 px-5 py-4 text-white">
              <div>
                <h2 id="social-hub-title" className="font-extrabold">
                  Kết bạn &amp; nhắn tin
                </h2>
                <p className="mt-0.5 text-[11px] text-emerald-200">
                  {incomingRequests.length} lời mời · {friendships.length} bạn bè ·{' '}
                  {unreadMessages} tin chưa đọc
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng trung tâm kết bạn"
                className="rounded-xl p-2 text-emerald-100 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <nav className="flex shrink-0 border-b border-slate-200 bg-slate-50">
              {(
                [
                  { id: 'friends', label: 'Bạn bè', count: incomingRequests.length },
                  { id: 'find', label: 'Tìm bạn', count: 0 },
                  { id: 'messages', label: 'Tin nhắn', count: unreadMessages },
                ] as { id: SocialTab; label: string; count: number }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'messages') setActiveChat(null);
                  }}
                  className={`relative flex-1 px-4 py-3 text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-white text-emerald-800' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                      {tab.count > 99 ? '99+' : tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {errorMessage && (
              <p
                role="alert"
                className="shrink-0 border-b border-red-200 bg-red-50 px-5 py-2.5 text-xs text-red-800"
              >
                {errorMessage}
              </p>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeTab === 'friends' && renderFriendsTab()}
              {activeTab === 'find' && renderFindTab()}
              {activeTab === 'messages' && renderMessagesTab()}
            </div>
          </section>
        </div>
      )}
    </>
  );
};
