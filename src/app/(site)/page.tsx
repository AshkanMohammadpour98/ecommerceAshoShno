import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:  "آسو شنو",
  description: "فروشگاه و تعمیرات  موبایل تبلت و کامپیوتر لپ تاپ آسو شنو",
    manifest: '/manifest.json', // <-- فقط این خط رو اضافه کن
  
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
