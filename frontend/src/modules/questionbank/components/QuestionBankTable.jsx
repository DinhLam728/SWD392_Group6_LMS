import { useState } from 'react'

export function QuestionBankTable({
  questions,
  loading,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onOpenCreate,
  onOpenAi,
  page = 0,
  pageSize = 10,
}) {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#ffffff' }}>
        <div
          style={{
            display: 'inline-block',
            width: '28px',
            height: '28px',
            border: '2px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'lmsSpin 0.8s linear infinite',
            marginBottom: '8px',
          }}
        />
        <style>{`@keyframes lmsSpin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>Đang tải danh sách câu hỏi...</div>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 16px',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
          Không tìm thấy câu hỏi nào
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '440px', lineHeight: 1.5 }}>
          Không có câu hỏi nào khớp với tìm kiếm hoặc bộ lọc của bạn. Bạn có thể tự soạn câu hỏi mới hoặc tạo tự động bằng AI.
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="btn-lms btn-lms-primary" onClick={onOpenCreate}>
            + Thêm câu hỏi
          </button>
          <button type="button" className="btn-lms btn-lms-ai" onClick={onOpenAi}>
            Tạo bằng AI
          </button>
        </div>
      </div>
    )
  }

  const allSelected = questions.length > 0 && selectedIds.size === questions.length

  const renderDifficultyBadge = (diff) => {
    const d = (diff || '').trim().toUpperCase()
    if (d === 'EASY') {
      return <span className="badge-lms badge-diff-easy">Dễ</span>
    }
    if (d === 'HARD') {
      return <span className="badge-lms badge-diff-hard">Khó</span>
    }
    return <span className="badge-lms badge-diff-medium">Trung bình</span>
  }

  const renderStatusBadge = (q) => {
    if (q.quizId) {
      return (
        <span className="badge-lms badge-quiz-assigned" title={q.quizTitle || `Bài kiểm tra #${q.quizId}`}>
          {q.quizTitle || `Bài kiểm tra #${q.quizId}`}
        </span>
      )
    }
    return (
      <span className="badge-lms badge-quiz-reserve">
        Kho dự phòng
      </span>
    )
  }

  return (
    <div className="lms-table-scroll-container">
      <table className="lms-grid-table">
        <thead>
          <tr>
            <th className="lms-col-select" style={{ width: '38px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                title="Chọn tất cả"
              />
            </th>
            <th className="lms-col-id" style={{ width: '60px', textAlign: 'center' }}>STT</th>
            <th className="lms-col-prompt">Nội dung câu hỏi & Lựa chọn</th>
            <th className="lms-col-topic" style={{ width: '170px' }}>Chủ đề</th>
            <th className="lms-col-diff" style={{ width: '90px', textAlign: 'center' }}>Độ khó</th>
            <th className="lms-col-status" style={{ width: '110px', textAlign: 'center' }}>Trạng thái</th>
            <th className="lms-col-actions" style={{ width: '160px', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => {
            const isChecked = selectedIds.has(q.questionId)
            const isExpanded = expandedId === q.questionId
            const isAssigned = Boolean(q.quizId)
            const sttNumber = page * pageSize + index + 1
            return (
              <tr key={q.questionId} className={isChecked ? 'selected' : ''}>
                <td className="lms-col-select" style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSelect(q.questionId)}
                    style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                </td>

                <td className="lms-col-id" style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>
                    {sttNumber}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }} title={`Mã hệ thống: #${q.questionId}`}>
                    #{q.questionId}
                  </div>
                </td>

                <td className="lms-col-prompt">
                  <div className="lms-question-cell">
                    <div className="lms-mobile-badges">
                      <span className="lms-mobile-id-badge">STT {sttNumber} (#{q.questionId})</span>
                      {renderDifficultyBadge(q.difficulty)}
                      {renderStatusBadge(q)}
                      <span className="badge-lms badge-topic">{q.topic || 'Chung'}</span>
                    </div>

                    <div className={`lms-question-text ${isExpanded ? 'expanded' : ''}`}>
                      {q.content}
                    </div>

                    <div className="lms-question-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(q.questionId)}
                        className="btn-toggle-options"
                        style={{
                          background: isExpanded ? '#e0e7ff' : '#f1f5f9',
                          color: isExpanded ? '#4338ca' : '#2563eb',
                          border: isExpanded ? '1px solid #c7d2fe' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          boxShadow: 'none',
                          minHeight: 'auto',
                          minWidth: 'auto',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{isExpanded ? '▾' : '▸'}</span>
                        <span>{isExpanded ? 'Ẩn các lựa chọn' : 'Xem các lựa chọn'}</span>
                      </button>

                      <span style={{ color: '#64748b' }}>
                        {q.questionType === 'MULTIPLE_ANSWER' ? 'Đáp án đúng' : 'Đáp án đúng'}: <strong style={{ color: '#15803d', fontWeight: 700 }}>Đáp án {q.correctAnswer}</strong>
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="lms-options-box">
                        <div className="lms-options-grid">
                          {q.options?.map((opt) => {
                            const isCorrect = String(q.correctAnswer).toUpperCase().split(',').map((key) => key.trim()).includes(String(opt.key).trim().toUpperCase())
                            return (
                              <div
                                key={opt.key}
                                className={`lms-option-item ${isCorrect ? 'correct' : ''}`}
                              >
                                <strong style={{ color: isCorrect ? '#065f46' : '#111827' }}>{opt.key}.</strong>
                                <span style={{ flex: 1 }}>{opt.text}</span>
                                {isCorrect && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>✓ Đúng</span>}
                              </div>
                            )
                          })}
                        </div>
                        {q.explanation && (
                          <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                            <strong>Giải thích:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                <td className="lms-col-topic">
                  <span className="badge-lms badge-topic" title={q.topic}>
                    {q.topic || 'Chung'}
                  </span>
                </td>

                <td className="lms-col-diff" style={{ textAlign: 'center' }}>
                  {renderDifficultyBadge(q.difficulty)}
                </td>

                <td className="lms-col-status" style={{ textAlign: 'center' }}>
                  {renderStatusBadge(q)}
                </td>

                <td className="lms-col-actions" style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(q)}
                      title="Sửa câu hỏi"
                      className="btn-action-icon"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(q)}
                      title="Xóa câu hỏi"
                      className="btn-action-icon btn-action-delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
