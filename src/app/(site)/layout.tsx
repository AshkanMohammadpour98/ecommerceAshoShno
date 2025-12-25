"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

// import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { usePathname } from "next/navigation";
// import { UserProvider, useUser } from "@/app/context/UserContext"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  const pathname = usePathname(); // مسیر فعلی
  // 🔹 چک می‌کنیم مسیر /panel هست یا نه
  const isPanel = pathname?.startsWith("/panel");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  // const user = useUser(); // 🟢 

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning={true}>
      <body>
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <ReduxProvider>
              <CartModalProvider>
                <ModalProvider>
                  <PreviewSliderProvider>
                    {!isPanel && <Header />}
                          
                            
                    {children}
                          

                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                  </PreviewSliderProvider>
                </ModalProvider>
              </CartModalProvider>
            </ReduxProvider>
            {/* <ScrollToTop /> */}
            {!isPanel && <Footer />}

          </>
        )}
      </body>
    </html>
  );
}
