import Contact from "@/components/Contact";
import { Metadata } from "next";

// توضیحات متا: مشخص می‌کنه این صفحه تماس با ما برای سایت فروش و تعمیر لپ‌تاپ، موبایل و هدفون هست
export const metadata: Metadata = {
  title: "تماس با ما | سایت فروش و تعمیر لپ‌تاپ، موبایل و هدفون",
  description: "در این صفحه می‌توانید با ما تماس بگیرید و برای خرید یا تعمیر لپ‌تاپ، موبایل و هدفون خود درخواست ثبت کنید.",
};

const ContactPage = () => {
  return (
    <main>
      {/* کامپوننت اصلی فرم تماس */}
      <Contact />
    </main>
  );
};

export default ContactPage;
