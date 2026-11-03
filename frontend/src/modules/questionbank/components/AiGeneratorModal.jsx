import { useState } from 'react'
import { generateAiQuestions, batchSaveQuestions } from '../services/questionBankService.js'

const QUICK_TOPICS = [
  'OOP Inheritance and Polymorphism',
  'Encapsulation and Abstraction',
  'Spring Boot REST Architecture',
  'Spring Data JPA and Hibernate',
  'Exception Handling & Status Codes',
]

export function AiGeneratorModal({ isOpen, onClose, courseId, onSavedSuccess }) {
  const [topic, setTopic] = useState('OOP Inheritance and Polymorphism')
  const [contextMaterial, setContextMaterial] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [difficultyLevel, setDifficultyLevel] = useState('MIXED')
  const [targetQuizId, setTargetQuizId] = useState('')

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [generatedItems, setGeneratedItems] = useState([])
  const [selectedIndices, setSelectedIndices] = useState(new Set())

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      setErrorMsg('Please specify the topic or learning objective.')
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
      })
      const list = response.data || []
      setGeneratedItems(list)
      setSelectedIndices(new Set(list.map((_, i) => i)))
      if (list.length === 0) {
        setErrorMsg('No questions were generated. Please try again with more specific subject matter.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to AI generation service.')
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

  const handleBatchSave = async () => {
    const chosenQuestions = generatedItems
      .filter((_, i) => selectedIndices.has(i))
      .map((q) => ({
        courseId: Number(courseId),
        quizId: targetQuizId.trim() ? Number(targetQuizId) : null,
        content: q.content,
        topic: q.topic || topic,
        difficulty: q.difficulty || 'MEDIUM',
        questionType: 'MULTIPLE_CHOICE',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: q.options || [],
      }))

    if (chosenQuestions.length === 0) {
      setErrorMsg('Please select at least 1 question to import.')
      return
    }

    setSaving(true)
    setErrorMsg('')
    try {
      await batchSaveQuestions(chosenQuestions)
      onSavedSuccess()
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while saving questions into bank.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lms-modal-overlay">
      <div className="lms-modal-dialog lms-modal-dialog-lg">
        <div className="lms-modal-header">
          <div className="lms-modal-title-group">
            <h2 className="lms-modal-title">Generate Questions with AI</h2>
            <p className="lms-modal-subtitle">
              Quickly draft multiple-choice questions for your course topics.
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
                Topic / Subject Area <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="lms-form-control"
                style={{ width: '100%' }}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. OOP Inheritance, Spring Boot REST..."
                required
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Quick suggestions:</span>
                {QUICK_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="lms-form-row-2">
              <div className="lms-form-group">
                <label className="lms-form-label">Difficulty Distribution</label>
                <select
                  className="lms-form-select"
                  style={{ width: '100%' }}
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <option value="MIXED">Mixed (Balanced)</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="lms-form-group">
                <label className="lms-form-label">Number of Questions</label>
                <select
                  className="lms-form-select"
                  style={{ width: '100%' }}
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label">
                Context or Lecture Material
                <span className="lms-form-label-hint">Optional</span>
              </label>
              <textarea
                rows={2}
                className="lms-form-textarea"
                value={contextMaterial}
                onChange={(e) => setContextMaterial(e.target.value)}
                placeholder="Paste code snippets, syllabus extracts, or lecture notes to guide generation..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={generating}
                className="btn-lms btn-lms-ai"
                style={{ padding: '8px 20px' }}
              >
                {generating ? 'Generating Questions...' : 'Generate Questions'}
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
                  Preview: {generatedItems.length} questions generated
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-lms btn-lms-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                    onClick={handleSelectAll}
                  >
                    {selectedIndices.size === generatedItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    Selected: <strong>{selectedIndices.size}</strong>/{generatedItems.length}
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
                  Destination Quiz ID:
                </span>
                <input
                  type="number"
                  className="lms-form-control"
                  style={{ width: '80px', padding: '4px 8px', textAlign: 'center' }}
                  placeholder="ID"
                  value={targetQuizId}
                  onChange={(e) => setTargetQuizId(e.target.value)}
                />
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  (Leave blank to keep in Reserve Bank)
                </span>
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
                                color: opt.key === item.correctAnswer ? '#15803d' : '#334155',
                                fontWeight: opt.key === item.correctAnswer ? 600 : 400,
                              }}
                            >
                              <strong>{opt.key}.</strong> {opt.text}
                            </div>
                          ))}
                        </div>
                        {item.explanation && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                            Explanation: {item.explanation}
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
            Cancel
          </button>
          {generatedItems.length > 0 && (
            <button
              type="button"
              className="btn-lms btn-lms-primary"
              disabled={saving || selectedIndices.size === 0}
              onClick={handleBatchSave}
            >
              {saving ? 'Importing questions...' : `Import ${selectedIndices.size} Questions to Bank`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
