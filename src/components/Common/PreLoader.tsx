import React from "react";

// ⏳ PreLoader: کامپوننت نمایش لودر هنگام بارگذاری صفحه
const PreLoader = () => {
  return (
    //  ظرف اصلی: تمام صفحه، سفید، وسط چین
    <div className="fixed left-0 top-0 z-999999 flex h-screen w-screen items-center justify-center bg-white">
      
      {/* 🔵 دایره گردان */}
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue border-t-transparent"></div>
    </div>
  );
};

export default PreLoader;
