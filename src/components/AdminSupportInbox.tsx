import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Loader2, Mail, MailOpen, Inbox } from 'lucide-react';
import type { SupportTicket } from '../types';
import { markSupportTicketHandled, subscribeToSupportTickets } from '../services/firebaseNotifications';
import { FIREBASE_ADMIN_EMAIL } from '../services/firebaseAdminAuth';

type TicketFilter = 'pending' | 'handled' | 'all';

const formatDateTime = (value: number): string =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const AdminSupportInbox: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState<TicketFilter>('pending');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [handlingId, setHandlingId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToSupportTickets(
      (nextTickets) => {
        setTickets(nextTickets);
        setIsLoading(false);
      },
      (error) => {
        console.error('FIREBASE_SUPPORT_TICKETS_LIST_ERROR:', error);
        setErrorMessage(`Không tải được hộp thư hỗ trợ: ${error.message}`);
        setIsLoading(false);
      }
    );
  }, []);

  const pendingCount = tickets.filter((ticket) => !ticket.handled).length;

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchFilter =
        filter === 'all' ||
        (filter === 'pending' && !ticket.handled) ||
        (filter === 'handled' && ticket.handled);
      const matchSearch =
        !keyword ||
        ticket.senderName.toLowerCase().includes(keyword) ||
        ticket.senderEmail.toLowerCase().includes(keyword) ||
        (ticket.senderUsername || '').toLowerCase().includes(keyword) ||
        ticket.issueContent.toLowerCase().includes(keyword) ||
        ticket.topic.toLowerCase().includes(keyword);
      return matchFilter && matchSearch;
    });
  }, [tickets, filter, search]);

  const handleMarkHandled = async (ticketId: string) => {
    setHandlingId(ticketId);
    setErrorMessage(null);
    try {
      await markSupportTicketHandled(ticketId, FIREBASE_ADMIN_EMAIL);
    } catch (error: unknown) {
      console.error('FIREBASE_SUPPORT_TICKET_UPDATE_ERROR:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Không cập nhật được trạng thái thư hỗ trợ.'
      );
    } finally {
      setHandlingId(null);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <Inbox className="h-5 w-5 text-sky-600" />
              Hộp thư hỗ trợ từ học sinh, giáo viên &amp; nhà trường ({tickets.length})
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Toàn bộ yêu cầu hỗ trợ được lưu trên Firebase và đồng bộ tới mọi thiết bị. Còn{' '}
              <strong>{pendingCount}</strong> thư chưa xử lý.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['pending', `Chưa xử lý (${pendingCount})`],
                ['handled', `Đã xử lý (${tickets.length - pendingCount})`],
                ['all', `Tất cả (${tickets.length})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold ${
                  filter === value ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
          >
            {errorMessage}
          </div>
        )}

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên, Gmail, chủ đề hoặc nội dung..."
          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"
        />

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải hộp thư hỗ trợ...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
            Không có thư hỗ trợ nào khớp điều kiện lọc.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredTickets.map((ticket) => (
              <article
                key={ticket.id}
                className={`space-y-3 rounded-2xl border p-4 ${
                  ticket.handled ? 'border-emerald-200 bg-emerald-50/40' : 'border-sky-200 bg-sky-50/40'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{ticket.senderName}</span>
                      {ticket.senderUsername && (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          @{ticket.senderUsername}
                        </span>
                      )}
                      <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {ticket.senderEmail}
                      </span>
                      {ticket.handled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          ĐÃ XỬ LÝ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                          <Clock className="h-3 w-3" />
                          CHƯA XỬ LÝ
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span>
                        Chủ đề: <strong className="text-sky-800">{ticket.topic || 'Không rõ'}</strong>
                      </span>
                      {ticket.gradeInfo && <span>· Lớp: {ticket.gradeInfo}</span>}
                      {ticket.schoolInfo && <span>· Trường: {ticket.schoolInfo}</span>}
                      <span>· Gửi lúc: {formatDateTime(ticket.createdAt)}</span>
                    </div>
                  </div>

                  <a
                    href={`mailto:${ticket.senderEmail}?subject=${encodeURIComponent(
                      `Phản hồi hỗ trợ: ${ticket.topic || 'Lớp học Bon Ben'}`
                    )}`}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Trả lời qua Gmail
                  </a>
                </div>

                <p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800">
                  {ticket.issueContent}
                </p>

                {!ticket.handled && (
                  <button
                    type="button"
                    disabled={handlingId === ticket.id}
                    onClick={() => handleMarkHandled(ticket.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {handlingId === ticket.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MailOpen className="h-3.5 w-3.5" />
                    )}
                    Đánh dấu đã xử lý
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
