
// // src/utils/ConnectDB.js
// import mongoose from "mongoose";

// export default async function connectDB() {
//     try {
//         // چک کردن وضعیت اتصال
//         if (mongoose.connections[0].readyState) {
//             console.log('✅ از قبل متصل به دیتابیس هستیم')
//             return
//         }
        
//         // اتصال جدید
//         await mongoose.connect(process.env.MONGO_URI)
//         console.log('✅ اتصال جدید به next1codeDB موفق بود')

//     } catch(err) {
//         console.error('❌ خطا در اتصال به دیتابیس:', err.message)
//         throw err  // خطا رو به بالا پرتاب کن
//     }
// }

// src/utils/ConnectDB.js
import mongoose from "mongoose";

export default async function connectDB() {
    try {
        if (mongoose.connections[0].readyState) {
            return;
        }
        
        console.log("در حال تلاش برای اتصال به:", process.env.MONGO_URI); // برای تست

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ اتصال به MongoDB Atlas موفق بود');

    } catch(err) {
        console.error('❌ جزئیات خطا:', err); // این خط در ترمینال علت اصلی را میگوید
        throw err;
    }
}
