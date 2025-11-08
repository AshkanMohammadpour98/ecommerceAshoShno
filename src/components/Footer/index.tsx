import React, { useState, useEffect } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChevronLeftIcon,
  ArrowUpIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleBottomCenterTextIcon, // جایگزین HeadphonesIcon
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowUpIcon as ArrowUpSolidIcon,
} from "@heroicons/react/24/solid";

const Footer = () => {
  const year = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // نمایش دکمه اسکرول بر اساس موقعیت صفحه
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // تابع اسکرول به بالای صفحه
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // لینک‌های شبکه‌های اجتماعی با رنگ‌های کانفیگ
  const socialLinks = [
    { 
      name: "اینستاگرام", 
      icon: "📸", 
      url: "#", 
      bgClass: "hover:bg-red-light hover:border-red-light" 
    },
    { 
      name: "تلگرام", 
      icon: "✈️", 
      url: "#", 
      bgClass: "hover:bg-blue hover:border-blue" 
    },
    { 
      name: "واتساپ", 
      icon: "💬", 
      url: "#", 
      bgClass: "hover:bg-green hover:border-green" 
    },
    { 
      name: "لینکدین", 
      icon: "💼", 
      url: "#", 
      bgClass: "hover:bg-blue-dark hover:border-blue-dark" 
    },
  ];

  // لینک‌های سریع
  const quickLinks = [
    { title: "صفحه اصلی", url: "/" },
    { title: "فروشگاه", url: "/shop" },
    { title: "محصولات", url: "/products" },
    { title: "درباره ما", url: "/about" },
    { title: "تماس با ما", url: "/contact" },
    { title: "وبلاگ", url: "/blog" },
  ];

  // خدمات با آیکون‌های اصلاح شده
  const services = [
    { title: "گارانتی اصالت کالا", icon: ShieldCheckIcon },
    { title: "ارسال سریع و رایگان", icon: TruckIcon },
    { title: "پشتیبانی 24/7", icon: ChatBubbleBottomCenterTextIcon }, // آیکون اصلاح شده
    { title: "پرداخت امن", icon: CreditCardIcon },
  ];

  return (
    <footer className="relative bg-gray-1 dark:bg-dark overflow-hidden font-euclid-circular-a" dir="rtl">
      {/* پترن پس‌زمینه دکوراتیو */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute -top-40 -right-40 w-100 h-100 bg-blue rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-100 h-100 bg-teal rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        
        {/* بخش ویژگی‌ها */}
        <div className="border-b border-gray-3 dark:border-dark-4 py-10 lg:py-15">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-blue-light-5 dark:bg-blue-dark/10 flex items-center justify-center group-hover:bg-blue dark:group-hover:bg-blue transition-all duration-300">
                  <service.icon className="w-7 h-7 text-blue dark:text-blue-light group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-custom-sm font-medium text-dark dark:text-white group-hover:text-blue dark:group-hover:text-blue-light transition-colors">
                  {service.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* بخش نیوزلتر */}
        <div className="border-b border-gray-3 dark:border-dark-4 py-10 lg:py-12.5">
          <div className="bg-gradient-to-r from-blue to-teal rounded-[10px] p-7.5 md:p-10 shadow-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6.5">
              {/* عنوان نیوزلتر */}
              <div className="text-center lg:text-right">
                <h3 className="text-heading-6 md:text-heading-5 font-bold text-white mb-2.5">
                  عضویت در خبرنامه آسو شنو
                </h3>
                <p className="text-blue-light-4 text-custom-sm md:text-base">
                  از جدیدترین محصولات و تخفیف‌های ویژه باخبر شوید
                </p>
              </div>
              
              {/* فرم عضویت */}
              <div className="w-full lg:w-auto">
                <form className="flex flex-col sm:flex-row gap-3.5 max-w-[450px] mx-auto lg:mx-0">
                  <input
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    className="flex-1 px-5 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 focus:outline-none focus:border-white focus:bg-white/20 transition-all duration-300"
                  />
                  <button 
                    type="submit"
                    className="px-7.5 py-3.5 bg-white text-blue font-medium rounded-lg hover:bg-gray-1 transition-all duration-300 transform hover:scale-105 shadow-2"
                  >
                    عضویت در خبرنامه
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* محتوای اصلی فوتر */}
        <div className="py-12.5 lg:py-17.5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-15">
            
            {/* ستون 1 - اطلاعات شرکت */}
            <div className="lg:col-span-1">
              {/* لوگو و نام شرکت */}
              <div className="mb-7.5">
                <div className="flex items-center gap-3 mb-5">
                  <BuildingStorefrontIcon className="w-10 h-10 text-blue" />
                  <h2 className="text-heading-5 font-bold text-dark dark:text-white">
                    آسو شنو
                  </h2>
                </div>
                <p className="text-meta-2 dark:text-dark-5 text-custom-sm leading-[1.7]">
                  فروشگاه معتبر فروش و تعمیرات لپ‌تاپ، موبایل و لوازم جانبی با بیش از 10 سال سابقه درخشان
                </p>
              </div>

              {/* اطلاعات تماس */}
              <ul className="space-y-4 mb-7.5">
                <li>
                  <a href="tel:+982112345678" className="flex items-center gap-3.5 text-body dark:text-dark-5 hover:text-blue dark:hover:text-blue-light transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-gray-2 dark:bg-dark-3/20 flex items-center justify-center group-hover:bg-blue-light-5 dark:group-hover:bg-blue/20 transition-colors">
                      <PhoneIcon className="w-4.5 h-4.5 text-meta-2 dark:text-dark-4 group-hover:text-blue transition-colors" />
                    </div>
                    <span className="text-custom-sm" dir="ltr">021-12345678</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:info@asoshno.com" className="flex items-center gap-3.5 text-body dark:text-dark-5 hover:text-blue dark:hover:text-blue-light transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-gray-2 dark:bg-dark-3/20 flex items-center justify-center group-hover:bg-blue-light-5 dark:group-hover:bg-blue/20 transition-colors">
                      <EnvelopeIcon className="w-4.5 h-4.5 text-meta-2 dark:text-dark-4 group-hover:text-blue transition-colors" />
                    </div>
                    <span className="text-custom-sm">info@asoshno.com</span>
                  </a>
                </li>
                <li className="flex items-start gap-3.5 text-body dark:text-dark-5">
                  <div className="w-9 h-9 rounded-lg bg-gray-2 dark:bg-dark-3/20 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-4.5 h-4.5 text-meta-2 dark:text-dark-4" />
                  </div>
                  <span className="text-custom-sm">اشنویه، خیابان انقلاب، فروشگاه آسو شنو</span>
                </li>
                <li className="flex items-center gap-3.5 text-body dark:text-dark-5">
                  <div className="w-9 h-9 rounded-lg bg-gray-2 dark:bg-dark-3/20 flex items-center justify-center">
                    <ClockIcon className="w-4.5 h-4.5 text-meta-2 dark:text-dark-4" />
                  </div>
                  <span className="text-custom-sm">شنبه تا پنجشنبه: 9 صبح - 9 شب</span>
                </li>
              </ul>

              {/* شبکه‌های اجتماعی */}
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    aria-label={social.name}
                    className={`w-10 h-10 rounded-lg border-2 border-gray-3 dark:border-dark-4 bg-white dark:bg-dark-2 flex items-center justify-center hover:text-white transition-all duration-300 transform hover:scale-110 ${social.bgClass}`}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ستون 2 - لینک‌های سریع */}
            <div className="lg:pr-10">
              <h3 className="text-custom-1 font-semibold text-dark dark:text-white mb-7.5 relative">
                دسترسی سریع
                <span className="absolute -bottom-2 right-0 w-12.5 h-1 bg-gradient-to-r from-blue to-blue-light rounded-full"></span>
              </h3>
              <ul className="space-y-3.5">
                {quickLinks.map((link) => (
                  <li key={link.title}>
                    <a 
                      href={link.url} 
                      className="flex items-center gap-2.5 text-body dark:text-dark-5 hover:text-blue dark:hover:text-blue-light transition-all duration-300 group"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      <span className="text-custom-sm group-hover:translate-x-1 transition-transform duration-300">
                        {link.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ستون 3 - خدمات ویژه */}
            <div>
              <h3 className="text-custom-1 font-semibold text-dark dark:text-white mb-7.5 relative">
                خدمات ویژه
                <span className="absolute -bottom-2 right-0 w-12.5 h-1 bg-gradient-to-r from-teal to-green rounded-full"></span>
              </h3>
              <ul className="space-y-3.5">
                <li className="flex items-center gap-2.5 text-custom-sm text-body dark:text-dark-5">
                  <span className="w-2 h-2 bg-green rounded-full"></span>
                  تعمیرات تخصصی لپ‌تاپ
                </li>
                <li className="flex items-center gap-2.5 text-custom-sm text-body dark:text-dark-5">
                  <span className="w-2 h-2 bg-green rounded-full"></span>
                  تعویض قطعات اصلی
                </li>
                <li className="flex items-center gap-2.5 text-custom-sm text-body dark:text-dark-5">
                  <span className="w-2 h-2 bg-green rounded-full"></span>
                  ارتقاء سخت‌افزار
                </li>
                <li className="flex items-center gap-2.5 text-custom-sm text-body dark:text-dark-5">
                  <span className="w-2 h-2 bg-green rounded-full"></span>
                  مشاوره رایگان خرید
                </li>
                <li className="flex items-center gap-2.5 text-custom-sm text-body dark:text-dark-5">
                  <span className="w-2 h-2 bg-green rounded-full"></span>
                  گارانتی معتبر
                </li>
                <li className="flex items-center gap-2.5 text-custom-sm text-body dark:text-dark-5">
                  <span className="w-2 h-2 bg-green rounded-full"></span>
                  خدمات پس از فروش
                </li>
              </ul>
            </div>

            {/* ستون 4 - نمادها و اعتماد */}
            <div>
              <h3 className="text-custom-1 font-semibold text-dark dark:text-white mb-7.5 relative">
                مجوزها و نمادها
                <span className="absolute -bottom-2 right-0 w-12.5 h-1 bg-gradient-to-r from-orange to-yellow rounded-full"></span>
              </h3>
              
              {/* نمادهای اعتماد */}
              <div className="grid grid-cols-2 gap-3 mb-7.5">
                {['enamad', 'samandehi', 'kasbokar', 'rezayat'].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-gray-2 dark:bg-dark-2 rounded-lg p-4 flex items-center justify-center h-20 hover:shadow-2 transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <span className="text-2xs text-meta-2 dark:text-dark-5">نماد {item}</span>
                  </div>
                ))}
              </div>

              {/* روش‌های پرداخت */}
              <div>
                <p className="text-custom-sm font-medium text-dark-2 dark:text-dark-5 mb-3.5">
                  روش‌های پرداخت امن:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 bg-gray-2 dark:bg-dark-2 rounded-lg text-custom-xs text-body dark:text-dark-5 hover:bg-blue-light-5 dark:hover:bg-blue/10 hover:text-blue transition-all cursor-pointer">
                    💳 کارت بانکی
                  </span>
                  <span className="px-3.5 py-1.5 bg-gray-2 dark:bg-dark-2 rounded-lg text-custom-xs text-body dark:text-dark-5 hover:bg-green-light-5 dark:hover:bg-green/10 hover:text-green transition-all cursor-pointer">
                    💰 نقدی
                  </span>
                  <span className="px-3.5 py-1.5 bg-gray-2 dark:bg-dark-2 rounded-lg text-custom-xs text-body dark:text-dark-5 hover:bg-yellow-light-2 dark:hover:bg-yellow/10 hover:text-yellow-dark transition-all cursor-pointer">
                    📱 کیف پول
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* بخش کپی‌رایت */}
        <div className="border-t border-gray-3 dark:border-dark-4 py-6.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* متن کپی‌رایت */}
            <div className="text-center sm:text-right">
              <p className="text-custom-sm text-body dark:text-dark-5">
                © {year} فروشگاه آسو شنو - تمامی حقوق محفوظ است
              </p>
              <p className="text-custom-xs text-meta-4 dark:text-dark-4 mt-1">
                طراحی و توسعه با ❤️ توسط تیم فنی آسو شنو
              </p>
            </div>

            {/* لینک‌های قانونی */}
            <div className="flex items-center gap-5 text-custom-sm">
              <a href="/privacy" className="text-body dark:text-dark-5 hover:text-blue dark:hover:text-blue-light transition-colors">
                حریم خصوصی
              </a>
              <span className="text-gray-4 dark:text-dark-3">|</span>
              <a href="/terms" className="text-body dark:text-dark-5 hover:text-blue dark:hover:text-blue-light transition-colors">
                شرایط استفاده
              </a>
              <span className="text-gray-4 dark:text-dark-3">|</span>
              <a href="/rules" className="text-body dark:text-dark-5 hover:text-blue dark:hover:text-blue-light transition-colors">
                قوانین
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* دکمه بازگشت به بالا - سمت راست و مربع شکل */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12.5 h-12.5 bg-gradient-to-r from-blue to-blue-light text-white rounded-lg shadow-3 hover:shadow-testimonial transform hover:scale-110 transition-all duration-300 flex items-center justify-center group z-999 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
        aria-label="بازگشت به بالا"
      >
        <ArrowUpSolidIcon className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
    </footer>
  );
};

export default Footer;