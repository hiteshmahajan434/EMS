// import "dotenv/config";
// import nodemailer from "nodemailer";

// const smtpPort = Number(process.env.SMTP_PORT || 587);
// if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
//     throw new Error("SMTP_PORT must be a valid TCP port");
// }

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
//     port: smtpPort,
//     secure: process.env.SMTP_SECURE
//         ? process.env.SMTP_SECURE === "true"
//         : smtpPort === 465,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
//     connectionTimeout: 10_000,
//     greetingTimeout: 10_000,
//     socketTimeout: 20_000,
// });

// const sendEmail = async ({ to, subject, body }) => {
//     const missingConfig = ["SMTP_USER", "SMTP_PASS", "SENDER_EMAIL"]
//         .filter((name) => !process.env[name]);

//     if (missingConfig.length) {
//         throw new Error(`Missing email configuration: ${missingConfig.join(", ")}`);
//     }

//     if (!to || !subject || !body) {
//         throw new Error("Email recipient, subject, and body are required");
//     }

//     return transporter.sendMail({
//         from: {
//             name: process.env.SENDER_NAME || "OneCore",
//             address: process.env.SENDER_EMAIL,
//         },
//         to,
//         subject,
//         html: body,
//     });
// };

// export default sendEmail;

import "dotenv/config";
import nodemailer from "nodemailer";

// Render's free tier blocks outbound SMTP (ports 25/465/587), so when
// BREVO_API_KEY is set we send over HTTPS (port 443) via Brevo's API instead.
// Without it, we fall back to SMTP (works locally and on paid hosts).

let transporter;
const getTransporter = () => {
    if (transporter) return transporter;

    const smtpPort = Number(process.env.SMTP_PORT || 587);
    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
        throw new Error("SMTP_PORT must be a valid TCP port");
    }

    transporter = nodemailer.createTransport({
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
    return transporter;
};

const sendViaBrevoApi = async ({ to, subject, body }) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: process.env.SENDER_NAME || "OneCore",
                email: process.env.SENDER_EMAIL,
            },
            to: [{ email: to }],
            subject,
            htmlContent: body,
        }),
        signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Brevo API error ${response.status}: ${details}`);
    }
    return response.json();
};

const sendEmail = async ({ to, subject, body }) => {
    const useApi = Boolean(process.env.BREVO_API_KEY);
    const required = useApi
        ? ["SENDER_EMAIL"]
        : ["SMTP_USER", "SMTP_PASS", "SENDER_EMAIL"];
    const missingConfig = required.filter((name) => !process.env[name]);

    if (missingConfig.length) {
        throw new Error(`Missing email configuration: ${missingConfig.join(", ")}`);
    }

    if (!to || !subject || !body) {
        throw new Error("Email recipient, subject, and body are required");
    }

    if (useApi) {
        return sendViaBrevoApi({ to, subject, body });
    }

    return getTransporter().sendMail({
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