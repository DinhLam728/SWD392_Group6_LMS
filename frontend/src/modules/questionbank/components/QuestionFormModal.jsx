import { useEffect, useState } from 'react'
import { getCourseModules } from '../services/questionBankService.js'

const SUGGESTED_TOPICS = [
  'Lập trình hướng đối tượng (OOP)',
  'Cơ sở dữ liệu & Truy vấn SQL',
  'Mạng máy tính & An toàn thông tin',
  'Kinh tế vi mô & vĩ mô',
  'Nguyên lý Marketing căn bản',
  'Quản trị tài chính doanh nghiệp',
  'Ngữ pháp tiếng Anh & Từ vựng',
  'Toán cao cấp & Đại số tuyến tính',
  'Xác suất thống kê ứng dụng',
]

function QuestionFormContent({
  onClose,
  onSubmit,
  initialData,
  courseId,
}) {
  const [content, setContent] = useState(initialData?.content || '')
  const [topic, setTopic] = useState(initialData?.topic || '')
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'MEDIUM')
  const [questionType, setQuestionType] = useState(initialData?.questionType || 'MULTIPLE_CHOICE')
  const [moduleId, setModuleId] = useState(initialData?.moduleId != null ? String(initialData.moduleId) : '')
  const [modules, setModules] = useState([])

  useEffect(() => {
    if (!courseId) return
    getCourseModules(courseId).then(setModules).catch(() => setModules([]))
  }, [courseId])

  const [explanation, setExplanation] = useState(initialData?.explanation || '')
  const [options, setOptions] = useState(
    initialData?.options && initialData.options.length > 0
      ? initialData.options
      : [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ]
  )
  const [correctKeys, setCorrectKeys] = useState(
    (initialData?.correctAnswer || 'A').split(',').map((key) => key.trim()).filter(Boolean),
  )
  const multipleAnswers = questionType === 'MULTIPLE_ANSWER'

  const toggleCorrect = (key) => {
    if (!multipleAnswers) {
      setCorrectKeys([key])
    } else if (correctKeys.includes(key)) {
      setCorrectKeys(correctKeys.filter((k) => k !== key))
    } else {
      setCorrectKeys([...correctKeys, key])
    }
  }

  const handleTypeChange = (type) => {
    setQuestionType(type)
    if (type !== 'MULTIPLE_ANSWER' && correctKeys.length > 1) {
      setCorrectKeys([correctKeys[0]])
    }
  }
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOptionTextChange = (index, text) => {
    const updated = [...options]
    updated[index] = { ...updated[index], text }
    setOptions(updated)
  }

  const handleAddOption = () => {
    const nextKey = String.fromCharCode(65 + options.length)
    setOptions([...options, { key: nextKey, text: '' }])
  }

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setErrorMsg('Cần ít nhất 2 phương án lựa chọn.')
      return
    }
    const removedKey = options[index].key
    const updated = options.filter((_, i) => i !== index)
    const rekeyed = updated.map((opt, i) => ({
      ...opt,
      key: String.fromCharCode(65 + i),
    }))
    setOptions(rekeyed)

    const remaining = correctKeys
      .filter((key) => key !== removedKey)
      .map((key) => {
        const oldIndex = options.findIndex((o) => o.key === key)
        return rekeyed[oldIndex > index ? oldIndex - 1 : oldIndex].key
      })
    setCorrectKeys(remaining.length > 0 ? remaining : [rekeyed[0].key])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setErrorMsg('Vui lòng nhập nội dung câu hỏi.')
      return
    }

    const emptyOption = options.find((opt) => !opt.text.trim())
    if (emptyOption) {
      setErrorMsg(`Phương án ${emptyOption.key} không được để trống.`)
      return
    }

    if (correctKeys.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một đáp án đúng.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      await onSubmit({
        courseId: Number(courseId),
        moduleId: moduleId ? Number(moduleId) : null,
        content: content.trim(),
        topic: topic.trim(),
        difficulty,
        questionType,
        correctAnswer: [...correctKeys].sort().join(','),
        explanation: explanation.trim() || undefined,
        options: options.map((opt) => ({
          key: opt.key,
          text: opt.text.trim(),
        })),
      })
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi lưu câu hỏi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lms-modal-dialog">
      <div className="lms-modal-header">
        <div className="lms-modal-title-group">
          <h2 className="lms-modal-title">
            {initialData ? `Chỉnh sửa câu hỏi #${initialData.questionId}` : 'Thêm câu hỏi mới'}
          </h2>
          <p className="lms-modal-subtitle">
            {initialData
              ? 'Cập nhật nội dung câu hỏi, các lựa chọn đáp án và thông tin liên quan.'
              : 'Điền nội dung câu hỏi và các phương án trắc nghiệm bên dưới.'}
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

          <div className="lms-form-group">
            <label className="lms-form-label" style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px', margin: '0 0 6px 0' }}>
              <span>Nội dung câu hỏi</span> <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              className="lms-form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi tại đây..."
              required
            />
          </div>

          <div className="lms-form-row-2">
            <div className="lms-form-group">
              <label className="lms-form-label" style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px', margin: '0 0 6px 0' }}>
                <span>Chủ đề / Phân loại</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                list="topic-suggestions"
                className="lms-form-control"
                style={{ width: '100%' }}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Lập trình OOP, Kinh tế vi mô, Tiếng Anh, v.v..."
                required
              />
              <datalist id="topic-suggestions">
                {Array.from(new Set([...modules.map((m) => m.title), ...SUGGESTED_TOPICS])).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label" style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px', margin: '0 0 6px 0' }}>
                <span>Độ khó</span>
              </label>
              <select
                className="lms-form-select"
                style={{ width: '100%' }}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
          </div>

          <div className="lms-form-row-2">
            <div className="lms-form-group">
              <label className="lms-form-label" style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px', margin: '0 0 6px 0' }}>
                <span>Loại câu hỏi</span>
              </label>
              <select
                className="lms-form-select"
                style={{ width: '100%' }}
                value={questionType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm một đáp án đúng</option>
                <option value="MULTIPLE_ANSWER">Trắc nghiệm nhiều đáp án đúng</option>
              </select>
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label" style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px', margin: '0 0 6px 0' }}>
                <span>Gán vào Module</span>
              </label>
              <select
                className="lms-form-select"
                style={{ width: '100%' }}
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
              >
                <option value="">Kho dự phòng (chưa gán)</option>
                {modules.map((m) => (
                  <option key={m.moduleId} value={m.moduleId}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lms-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <label className="lms-form-label" style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <span>Các phương án lựa chọn</span> <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {multipleAnswers ? 'Tích chọn tất cả các đáp án đúng.' : 'Chọn nút tròn bên cạnh đáp án đúng.'}
                </span>
              </div>
              <button
                type="button"
                className="btn-lms btn-lms-secondary"
                style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '6px' }}
                onClick={handleAddOption}
              >
                + Thêm phương án
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((opt, idx) => {
                const isCorrect = correctKeys.includes(opt.key)
                return (
                  <div
                    key={opt.key}
                    className={`lms-choice-card ${isCorrect ? 'is-correct' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: isCorrect ? '1px solid #86efac' : '1px solid #e2e8f0',
                      backgroundColor: isCorrect ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <label
                      className="lms-choice-radio-label"
                      title={`Đánh dấu ${opt.key} là đáp án đúng`}
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                        margin: 0,
                        cursor: 'pointer',
                        userSelect: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type={multipleAnswers ? 'checkbox' : 'radio'}
                        name="correctAnswerOption"
                        checked={isCorrect}
                        onChange={() => toggleCorrect(opt.key)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#16a34a', margin: 0 }}
                      />
                      <span className="lms-choice-key-badge">{opt.key}</span>
                    </label>

                    <input
                      type="text"
                      className="lms-choice-input"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Nội dung lựa chọn ${opt.key}...`}
                      required
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '13.5px',
                      }}
                    />

                    {isCorrect && (
                      <span className="lms-choice-correct-tag">
                        Đáp án đúng
                      </span>
                    )}

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="btn-choice-remove"
                        title="Xóa lựa chọn này"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'none',
                          minWidth: 'auto',
                          minHeight: 'auto',
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lms-form-group">
            <label className="lms-form-label">
              Giải thích chi tiết / Gợi ý
              <span className="lms-form-label-hint">Tùy chọn</span>
            </label>
            <textarea
              rows={2}
              className="lms-form-textarea"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích lý do tại sao đáp án trên là chính xác..."
            />
          </div>
        </div>

        <div className="lms-modal-footer">
          <button
            type="button"
            className="btn-lms btn-lms-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn-lms btn-lms-primary"
            disabled={submitting}
          >
            {submitting ? 'Đang lưu...' : initialData ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  courseId,
}) {
  if (!isOpen) return null

  return (
    <div className="lms-modal-overlay">
      <QuestionFormContent
        key={initialData ? `edit-${initialData.questionId}` : 'create-new'}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={initialData}
        courseId={courseId}
      />
    </div>
  )
}
