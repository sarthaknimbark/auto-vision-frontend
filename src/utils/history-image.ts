/** URLs that work in <img src> for saved assessments */
export function historyImageSrc(url: string | undefined | null): string | null {
  if (url == null || typeof url !== 'string') return null
  const t = url.trim()
  if (!t) return null
  if (t.startsWith('data:image/')) return t
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('blob:')) return t
  return null
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}


export async function fileToCompressedJpegDataUrl(
  file: File,
  maxEdge = 1600,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file)
  }

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) {
    return readFileAsDataUrl(file)
  }

  try {
    let { width, height } = bitmap
    const scale = Math.min(1, maxEdge / Math.max(width, height))
    width = Math.round(width * scale)
    height = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return readFileAsDataUrl(file)
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    bitmap.close?.()
    return readFileAsDataUrl(file)
  }
}
