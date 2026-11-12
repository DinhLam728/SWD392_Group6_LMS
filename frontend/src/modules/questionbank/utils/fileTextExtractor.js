import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
}

/**
 * Extracts plain text from various file formats (.txt, .md, .docx, .pdf, code files).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  if (!file) return ''

  const name = file.name.toLowerCase()

  // 1. Word Document (.docx)
  if (name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    const text = result.value || ''
    if (!text.trim()) {
      throw new Error('File Word rỗng hoặc không có nội dung chữ.')
    }
    return text.trim()
  }

  // 2. PDF Document (.pdf)
  if (name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    const pdfDoc = await loadingTask.promise
    let fullText = ''

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageStrings = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ')
      if (pageStrings.trim()) {
        fullText += (pageNum > 1 ? '\n\n' : '') + `[Trang ${pageNum}]\n` + pageStrings.trim()
      }
    }

    if (!fullText.trim()) {
      throw new Error('File PDF không chứa văn bản (có thể là file scan dạng ảnh). Vui lòng dùng file PDF có chữ hoặc file văn bản.')
    }
    return fullText.trim()
  }

  // 3. Reject legacy .doc (binary Word format from 97-2003)
  if (name.endsWith('.doc')) {
    throw new Error('Định dạng .doc (Word 97-2003) cũ không được hỗ trợ trực tiếp. Vui lòng lưu lại thành .docx hoặc .txt rồi thử lại.')
  }

  // 4. Plain text / Markdown / Source code files
  try {
    const text = await file.text()
    if (!text.trim()) {
      throw new Error('File rỗng hoặc không chứa nội dung.')
    }
    return text.trim()
  } catch (err) {
    throw new Error(err.message || 'Không thể đọc nội dung file văn bản.')
  }
}

