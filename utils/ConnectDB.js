
// src/utils/ConnectDB.js
import mongoose from "mongoose";

export default async function connectDB() {
    try {
        // چک کردن وضعیت اتصال
        if (mongoose.connections[0].readyState) {
            console.log('✅ از قبل متصل به دیتابیس هستیم')
            return
        }
        
        // اتصال جدید
        await mongoose.connect('mongodb://localhost:27017/next1codeDB')
        console.log('✅ اتصال جدید به next1codeDB موفق بود')

    } catch(err) {
        console.error('❌ خطا در اتصال به دیتابیس:', err.message)
        throw err  // خطا رو به بالا پرتاب کن
    }
}
