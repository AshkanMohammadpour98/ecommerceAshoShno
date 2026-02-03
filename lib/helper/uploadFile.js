// helper/uploadFile.js
// 🟢 این تابع یک helper است که فایل را به Supabase آپلود کرده و URL عمومی برمی‌گرداند
export async function uploadFileToSupabase(file, targetFolder = 'uploads') {
  if (!file) return null

  try {
    // 🔹 تبدیل فایل به Base64 برای ارسال به API
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })

    // 🔹 درخواست POST به API آپلود
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64,
        fileName: file.name,
        targetFolder, // انتخاب پوشه: 'icons', 'images', 'uploads'
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')

    return data.url // 🔹 URL عمومی فایل
  } catch (err) {
    console.error('Upload Helper Error:', err)
    return null
  }
}
