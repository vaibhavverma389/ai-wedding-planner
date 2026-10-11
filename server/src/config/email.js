import nodemailer from 'nodemailer';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

let transporter = null;

try {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
} catch (err) {
  logger.warn(`⚠️ Nodemailer transport setup note: ${err.message}`);
}

/**
 * Send email safely without throwing uncaught exceptions to prevent breaking database transactions
 */
export const sendEmailSafely = async ({ to, subject, html, text }) => {
  if (env.NODE_ENV === 'test') {
    logger.info(`[TEST EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return { messageId: 'mock-test-email-id', accepted: [to] };
  }

  try {
    if (!transporter) {
      logger.warn(`[EMAIL SKIP] Transporter not ready. Subject: ${subject}`);
      return null;
    }
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    });
    logger.info(`✉️ Email dispatched to ${to} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
    return null; // Safe degradation
  }
};
