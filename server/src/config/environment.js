import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/shaadisaathi'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DEFAULT_PLATFORM_COMMISSION_PERCENT: z.coerce.number().default(10),
  DEFAULT_GST_PERCENT: z.coerce.number().default(18),
  RENTAL_HOLD_DURATION_MINUTES: z.coerce.number().default(15),
  CLOUDINARY_CLOUD_NAME: z.string().default('shaadisaathi_media'),
  CLOUDINARY_API_KEY: z.string().default('123456789012345'),
  CLOUDINARY_API_SECRET: z.string().default('dev_cloudinary_secret_fallback'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_shaadisaathi123'),
  RAZORPAY_KEY_SECRET: z.string().default('test_razorpay_secret_key_12345'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('test_webhook_secret_key_12345'),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().default('test_smtp_user'),
  SMTP_PASS: z.string().default('test_smtp_pass'),
  SMTP_FROM: z.string().default('ShaadiSaathi <noreply@shaadisaathi.in>')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ FATAL: Invalid environment variables configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsedEnv.success ? parsedEnv.data : {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shaadisaathi',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_super_secure_fallback',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_super_secure_fallback',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  DEFAULT_PLATFORM_COMMISSION_PERCENT: 10,
  DEFAULT_GST_PERCENT: 18,
  RENTAL_HOLD_DURATION_MINUTES: 15,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_shaadisaathi123',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'test_razorpay_secret_key_12345',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_key_12345',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '2525', 10),
  SMTP_USER: process.env.SMTP_USER || 'test_smtp_user',
  SMTP_PASS: process.env.SMTP_PASS || 'test_smtp_pass',
  SMTP_FROM: process.env.SMTP_FROM || 'ShaadiSaathi <noreply@shaadisaathi.in>'
};
