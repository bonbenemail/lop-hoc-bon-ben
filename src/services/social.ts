import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  BlockedRelation,
  Conversation,
  DirectMessage,
  FriendRequest,
  Friendship,
  SocialMemberProfile,
  UserAccount,
  UserDirectoryEntry,
} from '../types';
import { getFirebaseApp } from './firebaseAdminAuth';

const getDb = () => getFirestore(getFirebaseApp());

/** Khóa ghép cặp uid theo thứ tự cố định -> cùng 1 document cho cả 2 chiều. */
export const pairId = (a: string, b: string): string => [a, b].sort().join('__');

export const requireUid = (account: UserAccount): string => {
  const uid = account.firebaseUid || account.id;
  if (!uid) throw new Error('Tài khoản chưa được liên kết với Firebase.');
  return uid;
};

export const buildMemberProfile = (account: UserAccount): SocialMemberProfile =>
  cleanMemberProfile({
    uid: requireUid(account),
    username: account.username,
    fullName: account.fullName,
    avatar: account.avatar,
    role: account.role,
    grade: account.grade,
    className: account.className,
    school: account.school,
  });

export const profileFromDirectory = (entry: UserDirectoryEntry): SocialMemberProfile =>
  cleanMemberProfile({
    uid: entry.uid,
    username: entry.username,
    fullName: entry.fullName,
    avatar: entry.avatar,
    role: entry.role,
    grade: entry.grade,
    className: entry.className,
    school: entry.school,
  });

/**
 * Loại bỏ mọi giá trị undefined khỏi hồ sơ thành viên trước khi ghi lên Firestore
 * (Firestore không chấp nhận field value là undefined). Các trường tuỳ chọn
 * (username/avatar/grade/className/school) chỉ được thêm khi có giá trị.
 */
export const cleanMemberProfile = (profile: SocialMemberProfile): SocialMemberProfile => {
  const cleaned: SocialMemberProfile = {
    uid: profile.uid,
    fullName: profile.fullName?.trim() || 'Người dùng',
    role: profile.role || 'student',
    username: profile.username || '',
  };
  if (profile.avatar) cleaned.avatar = profile.avatar;
  if (typeof profile.grade === 'number') cleaned.grade = profile.grade;
  if (profile.className) cleaned.className = profile.className;
  if (profile.school) cleaned.school = profile.school;
  return cleaned;
};

/** Lấy hồ sơ của người còn lại trong một hội thoại/kết bạn. */
export const otherMemberProfile = (
  members: string[],
  profiles: Record<string, SocialMemberProfile>,
  myUid: string
): SocialMemberProfile | null => {
  const otherUid = members.find((member) => member !== myUid);
  if (!otherUid) return null;
  return (
    profiles?.[otherUid] ?? {
      uid: otherUid,
      fullName: 'Người dùng',
      role: 'student',
    }
  );
};

/* ------------------------------------------------------------------ */
/* Lời mời kết bạn                                                     */
/* ------------------------------------------------------------------ */

/**
 * Lắng nghe toàn bộ lời mời kết bạn liên quan tới uid và tách sẵn
 * danh sách đã nhận (incoming) / đã gửi (outgoing) đang chờ phản hồi.
 */
export const subscribeToFriendRequests = (
  uid: string,
  callback: (
    incoming: FriendRequest[],
    outgoing: FriendRequest[]
  ) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  const requestsQuery = query(
    collection(getDb(), 'friendRequests'),
    where('members', 'array-contains', uid)
  );
  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, 'id'>) }))
        .sort((a, b) => b.createdAt - a.createdAt);
      const incoming = requests.filter(
        (request) => request.status === 'pending' && request.toUid === uid
      );
      const outgoing = requests.filter(
        (request) => request.status === 'pending' && request.fromUid === uid
      );
      callback(incoming, outgoing);
    },
    (error) => onError?.(error)
  );
};

export type FriendRequestOutcome = 'pending' | 'accepted';

/** Gửi lời mời kết bạn. Nếu người kia đã mời trước đó thì tự động chấp nhận. */
export const sendFriendRequest = async (
  me: UserAccount,
  target: SocialMemberProfile
): Promise<FriendRequestOutcome> => {
  const myUid = requireUid(me);
  if (!target.uid || target.uid === myUid) {
    throw new Error('Bạn không thể tự kết bạn với chính mình.');
  }
  const id = pairId(myUid, target.uid);
  const ref = doc(getDb(), 'friendRequests', id);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    const existing = {
      id,
      ...(snapshot.data() as Omit<FriendRequest, 'id'>),
    } as FriendRequest;
    if (existing.status === 'accepted') {
      throw new Error('Hai bạn đã là bạn bè rồi.');
    }
    if (existing.status === 'pending') {
      if (existing.fromUid === myUid) {
        throw new Error('Bạn đã gửi lời mời kết bạn rồi. Hãy chờ phản hồi.');
      }
      await acceptFriendRequest(existing);
      return 'accepted';
    }
    await deleteDoc(ref);
  }
  const now = Date.now();
  await setDoc(ref, {
    fromUid: myUid,
    toUid: target.uid,
    members: [myUid, target.uid],
    fromProfile: buildMemberProfile(me),
    toProfile: cleanMemberProfile(target),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  return 'pending';
};

/** Chấp nhận lời mời: cập nhật trạng thái và tạo quan hệ bạn bè. */
export const acceptFriendRequest = async (request: FriendRequest): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);
  batch.update(doc(db, 'friendRequests', request.id), {
    status: 'accepted',
    updatedAt: Date.now(),
  });
  batch.set(doc(db, 'friendships', pairId(request.fromUid, request.toUid)), {
    members: [request.fromUid, request.toUid],
    profiles: {
      [request.fromUid]: cleanMemberProfile(request.fromProfile),
      [request.toUid]: cleanMemberProfile(request.toProfile),
    },
    createdAt: Date.now(),
  });
  await batch.commit();
};

export const declineFriendRequest = async (requestId: string): Promise<void> => {
  await updateDoc(doc(getDb(), 'friendRequests', requestId), {
    status: 'declined',
    updatedAt: Date.now(),
  });
};

export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  await deleteDoc(doc(getDb(), 'friendRequests', requestId));
};

/* ------------------------------------------------------------------ */
/* Bạn bè                                                              */
/* ------------------------------------------------------------------ */

export const subscribeToFriendships = (
  uid: string,
  callback: (friendships: Friendship[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  const friendshipsQuery = query(
    collection(getDb(), 'friendships'),
    where('members', 'array-contains', uid)
  );
  return onSnapshot(
    friendshipsQuery,
    (snapshot) => {
      const friendships = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<Friendship, 'id'>) }))
        .sort((a, b) => b.createdAt - a.createdAt);
      callback(friendships);
    },
    (error) => onError?.(error)
  );
};

/** Hủy kết bạn: xóa quan hệ bạn bè và hội thoại dùng chung id. */
export const removeFriend = async (friendship: Friendship): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, 'friendships', friendship.id));
  batch.delete(doc(db, 'conversations', friendship.id));
  await batch.commit();
};

/* ------------------------------------------------------------------ */
/* Hội thoại & tin nhắn                                                */
/* ------------------------------------------------------------------ */

export const subscribeToConversations = (
  uid: string,
  callback: (conversations: Conversation[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  const conversationsQuery = query(
    collection(getDb(), 'conversations'),
    where('members', 'array-contains', uid)
  );
  return onSnapshot(
    conversationsQuery,
    (snapshot) => {
      const conversations = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<Conversation, 'id'>) }))
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      callback(conversations);
    },
    (error) => onError?.(error)
  );
};

/** Đảm bảo hội thoại giữa 2 người bạn đã tồn tại và trả về id hội thoại. */
export const ensureConversation = async (
  me: UserAccount,
  friend: SocialMemberProfile
): Promise<string> => {
  const myUid = requireUid(me);
  const id = pairId(myUid, friend.uid);
  const db = getDb();
  const ref = doc(db, 'conversations', id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    const now = Date.now();
    await setDoc(ref, {
      members: [myUid, friend.uid],
      profiles: {
        [myUid]: buildMemberProfile(me),
        [friend.uid]: cleanMemberProfile(friend),
      },
      lastMessage: '',
      lastMessageAt: now,
      lastSenderUid: '',
      unread: { [myUid]: 0, [friend.uid]: 0 },
      createdAt: now,
    });
  }
  return id;
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: DirectMessage[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  const messagesQuery = query(
    collection(getDb(), 'conversations', conversationId, 'messages')
  );
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<DirectMessage, 'id'>) }))
        .sort((a, b) => a.createdAt - b.createdAt);
      callback(messages);
    },
    (error) => onError?.(error)
  );
};

export const sendDirectMessage = async (
  conversationId: string,
  me: UserAccount,
  text: string
): Promise<void> => {
  const myUid = requireUid(me);
  const trimmed = text.trim();
  if (!trimmed) return;
  const db = getDb();
  const conversationRef = doc(db, 'conversations', conversationId);
  const snapshot = await getDoc(conversationRef);
  if (!snapshot.exists()) throw new Error('Cuộc trò chuyện không tồn tại.');
  const members = (snapshot.data().members as string[]) || [];
  if (!members.includes(myUid)) {
    throw new Error('Bạn không thuộc cuộc trò chuyện này.');
  }
  // Hội thoại dùng chung id với quan hệ chặn: nếu tồn tại thì không cho gửi.
  const blockSnapshot = await getDoc(doc(db, 'blocks', conversationId));
  if (blockSnapshot.exists()) {
    throw new Error('Không thể gửi tin nhắn vì cuộc trò chuyện này đang bị chặn.');
  }
  const recipient = members.find((member) => member !== myUid) ?? '';
  const now = Date.now();
  const batch = writeBatch(db);
  batch.set(doc(collection(db, 'conversations', conversationId, 'messages')), {
    senderUid: myUid,
    senderName: me.fullName,
    text: trimmed,
    members,
    createdAt: now,
  });
  const conversationUpdate: Record<string, unknown> = {
    lastMessage: trimmed,
    lastMessageAt: now,
    lastSenderUid: myUid,
    [`unread.${myUid}`]: 0,
  };
  if (recipient) {
    conversationUpdate[`unread.${recipient}`] = increment(1);
  }
  batch.update(conversationRef, conversationUpdate);
  await batch.commit();
};

export const markConversationRead = async (
  conversationId: string,
  uid: string
): Promise<void> => {
  await updateDoc(doc(getDb(), 'conversations', conversationId), {
    [`unread.${uid}`]: 0,
  });
};

/* ------------------------------------------------------------------ */
/* Chặn / bỏ chặn                                                      */
/* ------------------------------------------------------------------ */

export const subscribeToBlocks = (
  uid: string,
  callback: (blocks: BlockedRelation[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  const blocksQuery = query(
    collection(getDb(), 'blocks'),
    where('members', 'array-contains', uid)
  );
  return onSnapshot(
    blocksQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<BlockedRelation, 'id'>) }))
          .sort((a, b) => b.createdAt - a.createdAt)
      );
    },
    (error) => onError?.(error)
  );
};

/** Chặn một người dùng: hội thoại dùng chung id nên tin nhắn sẽ bị dừng hai chiều. */
export const blockUser = async (
  me: UserAccount,
  peer: SocialMemberProfile
): Promise<void> => {
  const myUid = requireUid(me);
  if (!peer.uid || peer.uid === myUid) {
    throw new Error('Bạn không thể chặn chính mình.');
  }
  const id = pairId(myUid, peer.uid);
  await setDoc(doc(getDb(), 'blocks', id), {
    members: [myUid, peer.uid],
    blockerUid: myUid,
    blockedUid: peer.uid,
    profiles: {
      [myUid]: buildMemberProfile(me),
      [peer.uid]: cleanMemberProfile(peer),
    },
    createdAt: Date.now(),
  });
};

export const unblockUser = async (blockId: string): Promise<void> => {
  await deleteDoc(doc(getDb(), 'blocks', blockId));
};
