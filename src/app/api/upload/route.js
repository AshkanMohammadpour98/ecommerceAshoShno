
import { supabase } from '../../../../lib/supabase' // مسیر دقیق

export async function POST(req) {
  try {
    const body = await req.json()
    const { file, fileName } = body

    if (!file || !fileName) {
      return new Response(JSON.stringify({ error: 'No file sent' }), { status: 400 })
    }

    // تبدیل base64 به buffer
    const base64 = file.split(',')[1]
    const buffer = Buffer.from(base64, 'base64')

    // مسیر فایل داخل Bucket باید بدون اسلش ابتدایی و فقط مسیر داخل bucket باشه
    const path = `products/${Date.now()}_${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')   // bucket public
      .upload(path, buffer, {
        contentType: 'image/png', // یا image/webp
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(path)

    return new Response(JSON.stringify({ url: publicUrl.publicUrl }), { status: 200 })
  } catch (err) {
    console.error('Upload error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// import { supabase } from '../../../../lib/supabase' // مسیر دقیق اتصال به Supabase

// // 🟢 POST: آپلود فایل به Supabase
// export async function POST(req) {
//   try {
//     const body = await req.json()
//     const { file, fileName, targetFolder } = body // file: base64 | fileName: اسم فایل | targetFolder: پوشه داخل bucket

//     if (!file || !fileName) {
//       return new Response(JSON.stringify({ error: 'No file sent' }), { status: 400 })
//     }

//     // 🔹 تبدیل Base64 به Buffer برای آپلود
//     const base64 = file.split(',')[1] // حذف metadata مثل "data:image/png;base64,"
//     const buffer = Buffer.from(base64, 'base64')

//     // 🔹 بررسی پوشه مقصد و انتخاب پیشفرض در صورت اشتباه
//     const validFolders = ['icons', 'images', 'uploads']
//     const folder = validFolders.includes(targetFolder) ? targetFolder : 'uploads'

//     // 🔹 مسیر فایل داخل bucket
//     const path = `${folder}/${Date.now()}_${fileName}`

//     // 🔹 آپلود به bucket 'asoShno'
//     const { error: uploadError } = await supabase.storage
//       .from('asoShno')
//       .upload(path, buffer, {
//         contentType: fileName.endsWith('.webp')
//           ? 'image/webp'
//           : fileName.endsWith('.png')
//           ? 'image/png'
//           : 'application/octet-stream', // fallback برای فایل غیر تصویری
//         upsert: true // جایگزینی فایل در صورت وجود
//       })

//     if (uploadError) throw uploadError

//     // 🔹 گرفتن URL عمومی
//     const { data: publicUrl } = supabase.storage.from('asoShno').getPublicUrl(path)

//     return new Response(JSON.stringify({ url: publicUrl.publicUrl }), { status: 200 })
//   } catch (err) {
//     console.error('Upload error:', err)
//     return new Response(JSON.stringify({ error: err.message }), { status: 500 })
//   }
// }
