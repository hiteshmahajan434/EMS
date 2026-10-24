import "dotenv/config";
import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 587);
if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port");
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: smtpPort,
    secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
});

const sendEmail = async ({ to, subject, body }) => {
    const missingConfig = ["SMTP_USER", "SMTP_PASS", "SENDER_EMAIL"]
        .filter((name) => !process.env[name]);

    if (missingConfig.length) {
        throw new Error(`Missing email configuration: ${missingConfig.join(", ")}`);
    }

    if (!to || !subject || !body) {
        throw new Error("Email recipient, subject, and body are required");
    }

    return transporter.sendMail({
        from: {
            name: process.env.SENDER_NAME || "OneCore",
            address: process.env.SENDER_EMAIL,
        },
        to,
        subject,
        html: body,
    });
};

export default sendEmail;