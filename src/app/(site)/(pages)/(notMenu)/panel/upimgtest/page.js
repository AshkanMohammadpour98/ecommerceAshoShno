

'use client'
import { useState } from 'react'

export default function UploadImage() {
  const [imageUrl, setImageUrl] = useState('')

  const upload = async (file) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          fileName: file.name
        })
      })

      const data = await res.json()
      if (res.ok) setImageUrl(data.url)
      else console.error('Upload failed:', data.error)
    }

    reader.readAsDataURL(file)
  }

  return (
    <div>
      <input type="file" onChange={e => upload(e.target.files[0])} />
      {imageUrl && (
        <img src={imageUrl} alt="uploaded" style={{ width: 200, marginTop: 10 }} />
      )}
    </div>
  )
}
