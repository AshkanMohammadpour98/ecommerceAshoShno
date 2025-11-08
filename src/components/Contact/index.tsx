import React from "react";
import Breadcrumb from "../Common/Breadcrumb";

const Contact = () => {
  return (
    <>
      {/* مسیر پیمایش */}
      <Breadcrumb title={"تماس با ما"} pages={["contact"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            
            {/* اطلاعات تماس */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="font-medium text-xl text-dark">
                  اطلاعات تماس
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-4">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* آیکون شخص */}
                      <path fillRule="evenodd" clipRule="evenodd" d="..." fill="#3C50E0"/>
                    </svg>
                    نام: تیم پشتیبانی سایت
                  </p>

                  <p className="flex items-center gap-4">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* آیکون تلفن */}
                      <path d="..." fill="#3C50E0"/>
                    </svg>
                    تلفن: ۰۲۱-۱۲۳۴۵۶۷۸۹
                  </p>

                  <p className="flex gap-4">
                    <svg className="mt-0.5 shrink-0" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* آیکون آدرس */}
                      <path d="..." fill="#3C50E0"/>
                    </svg>
                    آدرس: تهران، خیابان مثال، پلاک ۱۲۳
                  </p>
                </div>
              </div>
            </div>

            {/* فرم تماس */}
            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <form>
                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="firstName" className="block mb-2.5">
                      نام <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder="نام خود را وارد کنید"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="lastName" className="block mb-2.5">
                      نام خانوادگی <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder="نام خانوادگی خود را وارد کنید"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="subject" className="block mb-2.5">
                      موضوع
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      placeholder="موضوع پیام خود را وارد کنید"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="phone" className="block mb-2.5">
                      تلفن
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      placeholder="شماره تلفن خود را وارد کنید"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="mb-7.5">
                  <label htmlFor="message" className="block mb-2.5">
                    پیام
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    placeholder="پیام خود را تایپ کنید"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  ارسال پیام
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
