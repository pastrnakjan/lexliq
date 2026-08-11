const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'wes1-smtp.wedos.net',
  port: 587,
  secure: false,
  auth: {
    user: 'info@lexliq.cz',
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { jmeno, email, spolecnost, typ_poptavky, zprava } = req.body;

  if (!jmeno || !email) {
    return res.status(400).json({ ok: false, error: 'Vyplňte jméno a e-mail.' });
  }

  try {
    await transporter.sendMail({
      from: '"Lexliq web" <info@lexliq.cz>',
      to: 'info@lexliq.cz',
      replyTo: email,
      subject: `Nová poptávka – ${jmeno}`,
      text: [
        `Jméno: ${jmeno}`,
        `E-mail: ${email}`,
        `Společnost: ${spolecnost || '–'}`,
        `Typ poptávky: ${typ_poptavky || '–'}`,
        ``,
        `Zpráva:`,
        zprava || '–',
      ].join('\n'),
      html: `
        <p><strong>Jméno:</strong> ${jmeno}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Společnost:</strong> ${spolecnost || '–'}</p>
        <p><strong>Typ poptávky:</strong> ${typ_poptavky || '–'}</p>
        <hr>
        <p><strong>Zpráva:</strong><br>${(zprava || '–').replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('SMTP error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
