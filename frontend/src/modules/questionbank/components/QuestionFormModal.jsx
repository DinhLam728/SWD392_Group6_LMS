import { useState } from 'react'

const SUGGESTED_TOPICS = [
  'OOP Inheritance & Polymorphism',
  'Encapsulation & Abstraction',
  'Spring Boot REST MVC',
  'Spring Data JPA & ORM',
  'Exception Handling',
  'Transaction & Security',
]

function QuestionFormContent({
  onClose,
  onSubmit,
  initialData,
  courseId,
}) {
  const [content, setContent] = useState(initialData?.content || '')
  const [topic, setTopic] = useState(initialData?.topic || 'OOP Inheritance & Polymorphism')
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'MEDIUM')
  const [questionType, setQuestionType] = useState(initialData?.questionType || 'MULTIPLE_CHOICE')
  const [quizId, setQuizId] = useState(initialData?.quizId != null ? String(initialData.quizId) : '')
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
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || 'A')
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
      setErrorMsg('At least 2 choices are required.')
      return
    }
    const removedKey = options[index].key
    const updated = options.filter((_, i) => i !== index)
    const rekeyed = updated.map((opt, i) => ({
      ...opt,
      key: String.fromCharCode(65 + i),
    }))
    setOptions(rekeyed)

    if (correctAnswer === removedKey) {
      setCorrectAnswer(rekeyed[0]?.key || 'A')
    } else {
      const oldIndex = options.findIndex((o) => o.key === correctAnswer)
      if (oldIndex > index && oldIndex - 1 < rekeyed.length) {
        setCorrectAnswer(rekeyed[oldIndex - 1].key)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setErrorMsg('Please enter question prompt.')
      return
    }

    const emptyOption = options.find((opt) => !opt.text.trim())
    if (emptyOption) {
      setErrorMsg(`Choice ${emptyOption.key} cannot be empty.`)
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      await onSubmit({
        courseId: Number(courseId),
        quizId: quizId.trim() ? Number(quizId) : null,
        content: content.trim(),
        topic: topic.trim(),
        difficulty,
        questionType,
        correctAnswer,
        explanation: explanation.trim() || undefined,
        options: options.map((opt) => ({
          key: opt.key,
          text: opt.text.trim(),
        })),
      })
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while saving question.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lms-modal-dialog">
      <div className="lms-modal-header">
        <div className="lms-modal-title-group">
          <h2 className="lms-modal-title">
            {initialData ? `Edit Question #${initialData.questionId}` : 'Add New Question'}
          </h2>
          <p className="lms-modal-subtitle">
            {initialData
              ? 'Update the question prompt, answer choices, and metadata.'
              : 'Fill in the prompt and multiple-choice options below.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lms-modal-close"
          title="Close dialog"
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
            <label className="lms-form-label">
              Question Prompt <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              className="lms-form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your question prompt here..."
              required
            />
          </div>

          <div className="lms-form-row-2">
            <div className="lms-form-group">
              <label className="lms-form-label">
                Topic / Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                list="topic-suggestions"
                className="lms-form-control"
                style={{ width: '100%' }}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. OOP Inheritance & Polymorphism"
                required
              />
              <datalist id="topic-suggestions">
                {SUGGESTED_TOPICS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label">Difficulty</label>
              <select
                className="lms-form-select"
                style={{ width: '100%' }}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="lms-form-row-2">
            <div className="lms-form-group">
              <label className="lms-form-label">Question Type</label>
              <select
                className="lms-form-select"
                style={{ width: '100%' }}
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice (Single Answer)</option>
              </select>
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label">
                Assign to Quiz ID
                <span className="lms-form-label-hint">Leave empty for Reserve Bank</span>
              </label>
              <input
                type="number"
                className="lms-form-control"
                style={{ width: '100%' }}
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                placeholder="e.g. 1"
                min="1"
              />
            </div>
          </div>

          <div className="lms-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <label className="lms-form-label" style={{ margin: 0 }}>
                  Answer Choices <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Select the radio button next to the correct answer.
                </span>
              </div>
              <button
                type="button"
                className="btn-lms btn-lms-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={handleAddOption}
              >
                + Add Option
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((opt, idx) => {
                const isCorrect = correctAnswer === opt.key
                return (
                  <div
                    key={opt.key}
                    className={`lms-choice-card ${isCorrect ? 'is-correct' : ''}`}
                  >
                    <label
                      className="lms-choice-radio-label"
                      title={`Mark ${opt.key} as correct answer`}
                    >
                      <input
                        type="radio"
                        name="correctAnswerOption"
                        checked={isCorrect}
                        onChange={() => setCorrectAnswer(opt.key)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#16a34a' }}
                      />
                      <span className="lms-choice-key-badge">{opt.key}</span>
                    </label>

                    <input
                      type="text"
                      className="lms-choice-input"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Option ${opt.key} text...`}
                      required
                    />

                    {isCorrect && (
                      <span className="lms-choice-correct-tag">
                        Correct Answer
                      </span>
                    )}

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="btn-choice-remove"
                        title="Remove option"
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
              Explanation / Feedback
              <span className="lms-form-label-hint">Optional</span>
            </label>
            <textarea
              rows={2}
              className="lms-form-textarea"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the correct answer is right..."
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
            Cancel
          </button>
          <button
            type="submit"
            className="btn-lms btn-lms-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Question'}
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
