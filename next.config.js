// next.config.js

// 1. پکیج next-pwa رو با تنظیماتش فراخوانی می‌کنیم
const withPWA = require('next-pwa')({
  dest: 'public', // بهش میگیم فایل‌های PWA رو کجا بسازه
  disable: process.env.NODE_ENV === 'development', // در حالت توسعه (dev) غیرفعالش می‌کنیم
});

// 2. تنظیمات اصلی نکست شما (که فعلاً خالیه)
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // اگر در آینده تنظیمات دیگه‌ای داشتی، اینجا اضافه کن
};

// 3. در نهایت، تنظیمات نکست رو با تنظیمات PWA ادغام و export می‌کنیم
module.exports = withPWA(nextConfig);