export default async function handler(req, res) {
  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // 驗證 email 格式
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '請輸入有效的 Email' });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '伺服器設定錯誤' });
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, message: '訂閱成功！感謝您的加入 🎉' });
    } else if (response.status === 422) {
      // 已訂閱
      return res.status(200).json({ success: true, message: '您已經訂閱過了，感謝支持！' });
    } else {
      return res.status(400).json({ error: '訂閱失敗，請稍後再試' });
    }
  } catch (err) {
    return res.status(500).json({ error: '網路錯誤，請稍後再試' });
  }
}
