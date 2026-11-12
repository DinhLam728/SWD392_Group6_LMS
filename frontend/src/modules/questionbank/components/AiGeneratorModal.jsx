import { useEffect, useState, useRef } from 'react'
import { generateAiQuestions, batchSaveQuestions, getCourseModules } from '../services/questionBankService.js'
import { extractTextFromFile } from '../utils/fileTextExtractor.js'

const SAMPLE_SUBJECT_CATEGORIES = {
  IT: {
    label: 'CNTT & Lập trình',
    topics: [
      'Lập trình hướng đối tượng (OOP)',
      'Cơ sở dữ liệu & Truy vấn SQL',
      'Mạng máy tính & Giao thức mạng',
      'Cấu trúc dữ liệu & Thuật toán',
      'An toàn & Bảo mật thông tin',
    ],
  },
  BUSINESS: {
    label: 'Kinh tế & Quản trị',
    topics: [
      'Kinh tế vi mô: Cung cầu & Giá cả',
      'Kinh tế vĩ mô: Lạm phát & GDP',
      'Nguyên lý Marketing căn bản',
      'Quản trị tài chính doanh nghiệp',
      'Quản trị nhân lực & Hành vi tổ chức',
    ],
  },
  LANGUAGES: {
    label: 'Ngoại ngữ (Tiếng Anh)',
    topics: [
      'Ngữ pháp tiếng Anh: Các thì cơ bản',
      'Từ vựng tiếng Anh thương mại',
      'Đọc hiểu & Ngữ cảnh giao tiếp',
      'Cấu trúc ngữ pháp nâng cao',
    ],
  },
  SCIENCE: {
    label: 'Toán & Khoa học',
    topics: [
      'Toán rời rạc & Lý thuyết đồ thị',
      'Đại số tuyến tính & Ma trận',
      'Xác suất & Thống kê ứng dụng',
      'Giải tích: Đạo hàm & Tích phân',
    ],
  },
}

export function AiGeneratorModal({ isOpen, onClose, courseId, onSavedSuccess }) {
  const [topic, setTopic] = useState('')
  const [activeCategory, setActiveCategory] = useState('MODULES')
  const [contextMaterial, setContextMaterial] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [difficultyLevel, setDifficultyLevel] = useState('MIXED')
  const [targetModuleId, setTargetModuleId] = useState('')
  const [modules, setModules] = useState([])
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE')

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [generatedItems, setGeneratedItems] = useState([])
  const [selectedIndices, setSelectedIndices] = useState(new Set())
  const [attachedFile, setAttachedFile] = useState(null)
  const [fileReading, setFileReading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !courseId) return
    getCourseModules(courseId)
      .then((items) => {
        setModules(items)
        if (items.length > 0) {
          setActiveCategory('MODULES')
          if (!topic) {
            setTopic(items[0].title)
            setTargetModuleId(String(items[0].moduleId))
          }
        } else {
          setActiveCategory('IT')
        }
      })
      .catch(() => {
        setModules([])
        setActiveCategory('IT')
      })
  }, [isOpen, courseId])

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      setErrorMsg('Vui lòng nhập chủ đề hoặc mục tiêu học tập.')
      return
    }

    setGenerating(true)
    setErrorMsg('')
    try {
      const response = await generateAiQuestions({
        courseId: Number(courseId),
        topic: topic.trim(),
        contextMaterial: contextMaterial.trim() || undefined,
        numberOfQuestions: Number(numberOfQuestions),
        difficultyLevel,
        questionType,
      })
      const list = response.data || []
      setGeneratedItems(list)
      setSelectedIndices(new Set(list.map((_, i) => i)))
      if (list.length === 0) {
        setErrorMsg('Không có câu hỏi nào được tạo. Vui lòng thử lại với chủ đề chi tiết hơn.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể kết nối đến dịch vụ AI tạo câu hỏi.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleSelect = (index) => {
    const next = new Set(selectedIndices)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    setSelectedIndices(next)
  }

  const handleSelectAll = () => {
    if (selectedIndices.size === generatedItems.length) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(generatedItems.map((_, i) => i)))
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Dung lượng file không được vượt quá 5MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFileReading(true)
    setErrorMsg('')
    try {
      const text = await extractTextFromFile(file)
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      })
      setContextMaterial(text)
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' ').trim()
      if (cleanFileName) {
        setTopic(cleanFileName)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể đọc nội dung file. Vui lòng chọn file Word (.docx), PDF hoặc file văn bản.')
    } finally {
      setFileReading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = () => {
    setAttachedFile(null)
    setContextMaterial('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleBatchSave = async () => {
    const chosenQuestions = generatedItems
      .filter((_, i) => selectedIndices.has(i))
      .map((q) => ({
        courseId: Number(courseId),
        moduleId: targetModuleId ? Number(targetModuleId) : null,
        content: q.content,
        topic: q.topic || topic,
        difficulty: q.difficulty || 'MEDIUM',
        questionType: q.questionType || questionType,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: q.options || [],
      }))

    if (chosenQuestions.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 câu hỏi để thêm vào ngân hàng.')
      return
    }

    setSaving(true)
    setErrorMsg('')
    try {
      await batchSaveQuestions(chosenQuestions)
      onSavedSuccess()
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi lưu câu hỏi vào ngân hàng.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lms-modal-overlay">
      <div className="lms-modal-dialog lms-modal-dialog-lg">
        <div className="lms-modal-header">
          <div className="lms-modal-title-group">
            <h2 className="lms-modal-title">Tạo câu hỏi bằng AI</h2>
            <p className="lms-modal-subtitle">
              Tạo nhanh các câu hỏi trắc nghiệm tự động theo chủ đề bài học.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lms-modal-close"
            title="Đóng"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              minWidth: 'auto',
              minHeight: 'auto',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div className="lms-modal-body">
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="lms-form-group">
              <label className="lms-form-label">
                <span>Chủ đề / Lĩnh vực kiến thức</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="lms-form-control"
                style={{ width: '100%' }}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Nhập bất kỳ môn học, chủ đề nào (Ví dụ: Kinh tế vi mô, Tiếng Anh chuyên ngành, Mạng máy tính, Giải tích, v.v.)..."
                required
              />

              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Gợi ý theo ngành/môn:</span>
                  {modules.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory('MODULES')}
                      style={{
                        background: activeCategory === 'MODULES' ? '#2563eb' : '#f1f5f9',
                        color: activeCategory === 'MODULES' ? '#ffffff' : '#475569',
                        border: activeCategory === 'MODULES' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📚 Module khóa học
                    </button>
                  )}
                  {Object.entries(SAMPLE_SUBJECT_CATEGORIES).map(([catKey, catVal]) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setActiveCategory(catKey)}
                      style={{
                        background: activeCategory === catKey ? '#2563eb' : '#f1f5f9',
                        color: activeCategory === catKey ? '#ffffff' : '#475569',
                        border: activeCategory === catKey ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {catVal.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {activeCategory === 'MODULES' &&
                    modules.map((m) => (
                      <button
                        key={m.moduleId}
                        type="button"
                        onClick={() => {
                          setTopic(m.title)
                          setTargetModuleId(String(m.moduleId))
                        }}
                        style={{
                          background: topic === m.title ? '#e0e7ff' : '#f8fafc',
                          border: topic === m.title ? '1px solid #6366f1' : '1px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '3px 10px',
                          fontSize: '11.5px',
                          color: topic === m.title ? '#4338ca' : '#334155',
                          fontWeight: topic === m.title ? 600 : 400,
                          cursor: 'pointer',
                        }}
                        title={`Chọn module: ${m.title}`}
                      >
                        {m.title}
                      </button>
                    ))}

                  {activeCategory !== 'MODULES' &&
                    SAMPLE_SUBJECT_CATEGORIES[activeCategory]?.topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        style={{
                          background: topic === t ? '#e0e7ff' : '#f8fafc',
                          border: topic === t ? '1px solid #6366f1' : '1px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '3px 10px',
                          fontSize: '11.5px',
                          color: topic === t ? '#4338ca' : '#334155',
                          fontWeight: topic === t ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="lms-form-row-2">
              <div className="lms-form-group">
                <label className="lms-form-label">Phân bố độ khó</label>
                <select
                  className="lms-form-select"
                  style={{ width: '100%' }}
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <option value="MIXED">Hỗn hợp (Cân bằng)</option>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>

              <div className="lms-form-group">
                <label className="lms-form-label">Số lượng câu hỏi</label>
                <select
                  className="lms-form-select"
                  style={{ width: '100%' }}
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                >
                  <option value={3}>3 Câu hỏi</option>
                  <option value={5}>5 Câu hỏi</option>
                  <option value={10}>10 Câu hỏi</option>
                </select>
              </div>
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label">Loại câu hỏi</label>
              <select
                className="lms-form-select"
                style={{ width: '100%' }}
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm 1 đáp án đúng (Single Answer)</option>
                <option value="MULTIPLE_ANSWER">Trắc nghiệm nhiều đáp án đúng (Multiple Answers)</option>
              </select>
            </div>

            <div className="lms-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                <label className="lms-form-label" style={{ margin: 0 }}>
                  <span>Tài liệu tham khảo / Ngữ cảnh bài học</span>
                  <span className="lms-form-label-hint">Tùy chọn</span>
                </label>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".docx,.pdf,.txt,.md,.markdown,.java,.py,.sql,.json,.csv,.js,.jsx,.ts,.tsx,.html,.css"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-lms btn-lms-secondary"
                    style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileReading}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    {fileReading ? 'Đang đọc...' : 'Đính kèm file (.docx, .pdf, .txt...)'}
                  </button>
                </div>
              </div>

              {attachedFile && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                    <span>📄</span>
                    <strong style={{ fontWeight: 600 }}>{attachedFile.name}</strong>
                    <span style={{ color: '#64748b', fontSize: '11.5px' }}>({attachedFile.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Gỡ file đính kèm"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '2px 6px',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <textarea
                rows={3}
                className="lms-form-textarea"
                value={contextMaterial}
                onChange={(e) => setContextMaterial(e.target.value)}
                placeholder="Dán đoạn mã ví dụ, đề cương hoặc ghi chú bài giảng để AI bám sát (hoặc bấm nút Đính kèm file ở trên)..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={generating}
                className="btn-lms btn-lms-ai"
                style={{ padding: '8px 20px' }}
              >
                {generating ? 'Đang tạo câu hỏi...' : 'Tạo câu hỏi AI'}
              </button>
            </div>
          </form>

          {generatedItems.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                  Xem trước: Đã tạo {generatedItems.length} câu hỏi
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-lms btn-lms-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                    onClick={handleSelectAll}
                  >
                    {selectedIndices.size === generatedItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    Đã chọn: <strong>{selectedIndices.size}</strong>/{generatedItems.length}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Lưu vào Module:
                </span>
                <select
                  className="lms-form-select"
                  style={{ flex: 1, minWidth: '180px' }}
                  value={targetModuleId}
                  onChange={(e) => setTargetModuleId(e.target.value)}
                >
                  <option value="">Ngân hàng tự do (Chưa gán)</option>
                  {modules.map((m) => (
                    <option key={m.moduleId} value={m.moduleId}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {generatedItems.map((item, idx) => {
                  const isChecked = selectedIndices.has(idx)
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                        backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(idx)}
                        style={{ marginTop: '4px', cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                      <div style={{ flex: 1, fontSize: '13.5px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                          #{idx + 1}. {item.content}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '12.5px' }}>
                          {item.options?.map((opt) => (
                            <div
                              key={opt.key}
                              style={{
                                color: String(item.correctAnswer).split(',').map((key) => key.trim()).includes(opt.key) ? '#15803d' : '#334155',
                                fontWeight: String(item.correctAnswer).split(',').map((key) => key.trim()).includes(opt.key) ? 600 : 400,
                              }}
                            >
                              <strong>{opt.key}.</strong> {opt.text}
                            </div>
                          ))}
                        </div>
                        {item.explanation && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                            Giải thích: {item.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lms-modal-footer">
          <button
            type="button"
            className="btn-lms btn-lms-secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          {generatedItems.length > 0 && (
            <button
              type="button"
              className="btn-lms btn-lms-primary"
              disabled={saving || selectedIndices.size === 0}
              onClick={handleBatchSave}
            >
              {saving ? 'Đang thêm câu hỏi...' : `Thêm ${selectedIndices.size} câu hỏi vào ngân hàng`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
