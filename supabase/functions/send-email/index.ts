import { SmtpClient } from "jsr:@std/smtp@0.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GMAIL_USER = "bonbenemail@gmail.com";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") || "";

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in Deno
  return btoa(binary);
}

interface EmailRequest {
  type: "verify-otp" | "reset-password" | "support";
  toEmail: string;
  studentName?: string;
  grade?: number;
  otpCode?: string;
  senderName?: string;
  senderEmail?: string;
  gradeInfo?: string;
  schoolInfo?: string;
  topic?: string;
  issueContent?: string;
}

function buildVerifyOtpEmail(name: string, grade: number, otp: string) {
  const subject = `[Lớp học Bon Ben] Mã xác thực 6 số tạo tài khoản: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LỚP HỌC BON BEN</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Hệ thống học tập trực tuyến Toán - Tiếng Việt - Tiếng Anh</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">Xin chào <strong>${name}</strong> (Đăng ký <strong>Lớp ${grade}</strong>),</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          Cảm ơn bạn đã đăng ký tài khoản tại <strong>Lớp học Bon Ben</strong>. Đây là mã xác thực gồm 6 chữ số để hoàn tất tạo tài khoản của bạn:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0369a1; background: #e0f2fe; padding: 14px 28px; border-radius: 12px; border: 2px solid #38bdf8; font-family: monospace;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          Vui lòng quay lại trang đăng ký <strong>Lớp học Bon Ben</strong> và nhập đúng 6 chữ số này để kích hoạt tài khoản. Tuyệt đối không chia sẻ mã này cho người khác.
        </p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">
        Email được gửi tự động từ Hệ thống Lớp học Bon Ben.
      </p>
    </div>
  `.trim();
  return { subject, html };
}

function buildResetPasswordEmail(email: string, name: string, otp: string) {
  const subject = `[Lớp học Bon Ben] Mã 6 số khôi phục mật khẩu tài khoản: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LỚP HỌC BON BEN - KHÔI PHỤC MẬT KHẨU</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Hệ thống học tập trực tuyến Văn - Toán - Anh</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">Xin chào <strong>${name}</strong> (Tài khoản: <strong>${email}</strong>),</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          Hệ thống <strong>Lớp học Bon Ben</strong> vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản Gmail của bạn. Đây là mã xác thực gồm 6 chữ số để đổi mật khẩu mới:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0369a1; background: #e0f2fe; padding: 14px 28px; border-radius: 12px; border: 2px solid #38bdf8; font-family: monospace;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          Vui lòng nhập đúng 6 chữ số này trên cửa sổ <strong>Quên mật khẩu</strong> để thiết lập mật khẩu mới. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">
        Email được gửi tự động từ Hệ thống Lớp học Bon Ben.
      </p>
    </div>
  `.trim();
  return { subject, html };
}

function buildSupportEmail(
  senderName: string,
  senderEmail: string,
  gradeInfo: string,
  schoolInfo: string,
  topic: string,
  issueContent: string
) {
  const subject = `[Hỗ trợ Lớp học Bon Ben] ${topic} - Từ: ${senderName} (${senderEmail})`;
  const escapedIssue = issueContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 19px;">YÊU CẦU HỖ TRỢ MỚI - LỚP HỌC BON BEN</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Gửi trực tiếp về hộp thư Ban Quản Trị Lớp học Bon Ben</p>
      </div>
      <div style="background: #ffffff; padding: 22px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px;">Người gửi:</td>
            <td style="padding: 6px 0;">${senderName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Gmail liên hệ:</td>
            <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${senderEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Lớp / Khối:</td>
            <td style="padding: 6px 0;">${gradeInfo}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Trường học:</td>
            <td style="padding: 6px 0;">${schoolInfo || "Chưa cung cấp"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Chủ đề hỗ trợ:</td>
            <td style="padding: 6px 0;"><strong style="color: #0369a1;">${topic}</strong></td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 13px; font-weight: bold; color: #0f172a; margin: 0 0 8px;">Nội dung vấn đề cần hỗ trợ:</p>
        <div style="background: #f8fafc; padding: 14px 16px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; line-height: 1.6;">
          ${escapedIssue}
        </div>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">
        Yêu cầu hỗ trợ được gửi từ giao diện Lớp học Bon Ben tới Ban Quản Trị.
      </p>
    </div>
  `.trim();
  return { subject, html };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { type, toEmail } = body;

    if (!toEmail || !toEmail.trim()) {
      return new Response(
        JSON.stringify({ error: "Thiếu địa chỉ email người nhận." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let htmlBody = "";
    let recipient = toEmail.trim();

    if (type === "verify-otp") {
      if (!body.otpCode || !body.studentName) {
        return new Response(
          JSON.stringify({ error: "Thiếu thông tin gửi mã xác thực." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const result = buildVerifyOtpEmail(body.studentName, body.grade || 4, body.otpCode);
      subject = result.subject;
      htmlBody = result.html;
    } else if (type === "reset-password") {
      if (!body.otpCode || !body.studentName) {
        return new Response(
          JSON.stringify({ error: "Thiếu thông tin gửi mã khôi phục." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const result = buildResetPasswordEmail(toEmail.trim(), body.studentName, body.otpCode);
      subject = result.subject;
      htmlBody = result.html;
    } else if (type === "support") {
      if (!body.senderName || !body.senderEmail || !body.topic || !body.issueContent) {
        return new Response(
          JSON.stringify({ error: "Thiếu thông tin yêu cầu hỗ trợ." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const result = buildSupportEmail(
        body.senderName,
        body.senderEmail,
        body.gradeInfo || "",
        body.schoolInfo || "",
        body.topic,
        body.issueContent
      );
      subject = result.subject;
      htmlBody = result.html;
      // Support email goes to admin inbox
      recipient = GMAIL_USER;
    } else {
      return new Response(
        JSON.stringify({ error: "Loại email không hợp lệ." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new SmtpClient();
    await client.connect({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_USER,
      password: GMAIL_APP_PASSWORD,
      tls: true,
    });

    const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subject)}?=`;
    const encodedFromName = `=?UTF-8?B?${utf8ToBase64("Lớp học Bon Ben")}?=`;

    await client.send({
      from: `${encodedFromName} <${GMAIL_USER}>`,
      to: recipient,
      subject: encodedSubject,
      content: htmlBody,
      html: true,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email đã được gửi thành công." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định khi gửi email.";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
