export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, email, size, time } = req.body;

  if (!name || !company || !email) {
    return res.status(400).json({ error: '請填寫必填欄位' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // 若還沒設定 Resend，仍回傳成功（避免前端卡住）
    console.log('Demo request (no Resend key):', { name, company, email, size, time });
    return res.status(200).json({ success: true });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Here Hear 官網 <onboarding@resend.dev>',
        to: ['service@herehearkk.com'],
        reply_to: email,
        subject: `【預約 Demo】${company} - ${name}`,
        html: `
          <h2>新的 Demo 預約</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:120px;">姓名</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${name}</td></tr>
            <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">公司</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${company}</td></tr>
            <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">員工人數</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${size || '未填寫'}</td></tr>
            <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">方便時間</td><td style="padding:8px 12px;">${time || '未填寫'}</td></tr>
          </table>
          <p style="margin-top:20px;color:#6b7280;font-size:14px;">此訊息由 here-hear.ai 官網自動發送</p>
        `,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(200).json({ success: true }); // 即使寄信失敗也不讓使用者卡住
    }
  } catch (err) {
    console.error('Demo API error:', err);
    return res.status(200).json({ success: true });
  }
}
