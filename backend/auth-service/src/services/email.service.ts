import nodemailer from "nodemailer";

// Transport Nodemailer pour Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<void> {
  const confirmLink = `${process.env.FRONTEND_URL}/confirm?token=${token}`;

  const mailOptions = {
    from: `"Query Forge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirmez votre inscription - Query Forge",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Bienvenue sur Query Forge ! 🎉</h2>
        <p>Merci de vous être inscrit sur notre plateforme.</p>
        <p>Pour activer votre compte, cliquez sur le lien ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirmer mon compte
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette inscription, 
          vous pouvez ignorer cet email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
