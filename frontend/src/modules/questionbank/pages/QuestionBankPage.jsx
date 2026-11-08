import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { ApiError } from '../../../shared/api/ApiError.js'
import {
  getCourseQuestions,
  getQuestionBankStats,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkDeleteQuestions,
  bulkAssignQuiz,
  exportBankToJson,
} from '../services/questionBankService.js'
import { QuestionBankTable } from '../components/QuestionBankTable.jsx'
import { QuestionFormModal } from '../components/QuestionFormModal.jsx'
import { AiGeneratorModal } from '../components/AiGeneratorModal.jsx'
import { BulkAssignModal } from '../components/BulkAssignModal.jsx'
import { listMyCourses } from '../../course/services/teacherCourseService.js'
import '../styles/questionBank.css'

const PRESET_TOPICS = [
  'OOP Inheritance & Polymorphism',
  'Encapsulation & Abstraction',
  'Spring Boot REST MVC',
  'Spring Data JPA & ORM',
  'Exception Handling',
]

export function QuestionBankPage() {
  const [myCourses, setMyCourses] = useState([])
  const [activeCourseId, setActiveCourseId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    assigned: 0,
    reserve: 0,
  })

  const [keywordInput, setKeywordInput] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('ALL')
  const [difficultyFilter, setDifficultyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortOption, setSortOption] = useState('questionId,desc')
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedIds, setSelectedIds] = useState(new Set())

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)

  useEffect(() => {
    listMyCourses({ page: 0, size: 100 }).then((res) => {
      const items = res.data.items
      setMyCourses(items)
      if (items.length > 0) setActiveCourseId(items[0].courseId)
      else setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!activeCourseId) return
    let active = true
    getQuestionBankStats(activeCourseId).then((realStats) => {
      if (active && realStats) {
        setStats(realStats)
      }
    })
    return () => {
      active = false
    }
  }, [activeCourseId, refreshKey])

  useEffect(() => {
    if (!activeCourseId) return
    let active = true

    getCourseQuestions(activeCourseId, {
      page,
      size: pageSize,
      sort: sortOption,
      unassignedOnly: statusFilter === 'RESERVE',
      topic: topicFilter,
      difficulty: difficultyFilter,
      keyword: searchFilter.trim() || undefined,
    })
      .then((response) => {
        if (!active) return
        let items = response?.data?.items || []
        if (statusFilter === 'ASSIGNED') {
          items = items.filter((q) => q.quizId != null)
        }
        setQuestions(items)
        setTotalPages(response?.data?.totalPages || 0)
        setTotalElements(response?.data?.totalElements || 0)
        if (response?.data?.stats) {
          setStats(response.data.stats)
        }
        setSelectedIds(new Set())
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        if (error instanceof ApiError) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('Unable to load question bank data. Please verify network connection.')
        }
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [
    activeCourseId,
    page,
    pageSize,
    statusFilter,
    topicFilter,
    difficultyFilter,
    searchFilter,
    sortOption,
    refreshKey,
  ])

  const triggerReload = () => {
    setLoading(true)
    setErrorMessage('')
    setRefreshKey((k) => k + 1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchFilter(keywordInput)
      setPage(0)
    }, 180)
    return () => clearTimeout(timer)
  }, [keywordInput])

  const handleChangeCourse = (e) => {
    setActiveCourseId(Number(e.target.value))
    setPage(0)
    setLoading(true)
  }

  const handleClearSearch = () => {
    setKeywordInput('')
    setSearchFilter('')
    setPage(0)
  }

  const handleResetFilters = () => {
    setKeywordInput('')
    setSearchFilter('')
    setTopicFilter('ALL')
    setDifficultyFilter('ALL')
    setStatusFilter('ALL')
    setSortOption('questionId,desc')
    setPage(0)
    triggerReload()
  }

  const hasActiveFilters =
    searchFilter !== '' || topicFilter !== 'ALL' || difficultyFilter !== 'ALL' || statusFilter !== 'ALL'

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(questions.map((q) => q.questionId)))
    }
  }

  const handleOpenCreateModal = () => {
    setEditingQuestion(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q)
    setIsFormModalOpen(true)
  }

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }
    try {
      await deleteQuestion(questionId)
      setMessage('Question deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
      triggerReload()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to delete question.')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    if (editingQuestion) {
      await updateQuestion(editingQuestion.questionId, formData)
      setMessage('Question updated successfully!')
    } else {
      await createQuestion(formData)
      setMessage('New question added to bank successfully!')
    }
    setTimeout(() => setMessage(''), 3000)
    triggerReload()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected questions?`)) {
      return
    }
    await bulkDeleteQuestions(Array.from(selectedIds))
    setMessage(`Successfully deleted ${selectedIds.size} questions!`)
    setTimeout(() => setMessage(''), 3000)
    triggerReload()
  }

  const handleBulkAssignConfirm = async (quizId, quizTitle) => {
    await bulkAssignQuiz(Array.from(selectedIds), quizId, quizTitle)
    setMessage(
      quizId
        ? `Successfully assigned ${selectedIds.size} questions to Quiz #${quizId}!`
        : `Moved ${selectedIds.size} questions to the Reserve Bank!`
    )
    setTimeout(() => setMessage(''), 3000)
    triggerReload()
  }

  const startItem = page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="lms-page-wrapper">
      <div className="breadcrumb registration-breadcrumb" aria-label="Đường dẫn trang">
        <Link to="/courses">Khóa học</Link><span aria-hidden="true"> / </span><span aria-current="page">Ngân hàng câu hỏi</span>
      </div>

      <div className="lms-container">
        <div className="lms-compact-header">
          <div className="lms-header-info">
            <h1 className="lms-title-main">Question Bank</h1>
            <span className="lms-course-badge">
              {myCourses.find((course) => course.courseId === activeCourseId)?.title ?? 'Chưa có khóa học'}
            </span>
          </div>

          <div className="lms-header-buttons">
            <button
              type="button"
              className="btn-lms btn-lms-primary"
              onClick={handleOpenCreateModal}
            >
              + Add Question
            </button>
            <button
              type="button"
              className="btn-lms btn-lms-ai"
              onClick={() => setIsAiModalOpen(true)}
            >
              Generate with AI
            </button>
            <button
              type="button"
              className="btn-lms btn-lms-secondary"
              onClick={() => exportBankToJson(activeCourseId)}
              title="Export questions to JSON"
            >
              Export JSON
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </div>
        )}

        <div className="lms-compact-kpi-row">
          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">Total Questions</span>
              <span className="lms-compact-kpi-icon slate">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
            </div>
            <div className="lms-compact-kpi-val">{stats.total}</div>
            <div className="lms-compact-kpi-sub">
              <span>{stats.assigned} in Quiz</span>
              <span>•</span>
              <span>{stats.reserve} in Bank</span>
            </div>
          </div>

          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">Difficulty Spread</span>
              <span className="lms-compact-kpi-icon amber">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
            </div>
            <div className="lms-diff-chip-group">
              <span className="lms-diff-chip easy">
                <strong>{stats.easy}</strong> Easy
              </span>
              <span className="lms-diff-chip med">
                <strong>{stats.medium}</strong> Med
              </span>
              <span className="lms-diff-chip hard">
                <strong>{stats.hard}</strong> Hard
              </span>
            </div>
            <div className="lms-compact-kpi-sub">
              <span>Distributed across course</span>
            </div>
          </div>

          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">In Quiz</span>
              <span className="lms-compact-kpi-icon blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
            </div>
            <div className="lms-compact-kpi-val" style={{ color: '#2563eb' }}>
              {stats.assigned}
            </div>
            <div className="lms-compact-kpi-sub">
              <span>Assigned to quizzes</span>
            </div>
          </div>

          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">In Bank</span>
              <span className="lms-compact-kpi-icon indigo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </span>
            </div>
            <div className="lms-compact-kpi-val" style={{ color: '#4f46e5' }}>
              {stats.reserve}
            </div>
            <div className="lms-compact-kpi-sub">
              <span>Available for quizzes</span>
            </div>
          </div>
        </div>

        <div className="lms-table-workspace">
          <div className="lms-table-toolbar">
            <div className="lms-toolbar-left">
              <div className="lms-search-wrapper">
                <span className="lms-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="lms-search-input"
                  aria-label="Tìm câu hỏi"
                  placeholder="Tìm nội dung, chủ đề hoặc đáp án..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                />
                {keywordInput && (
                  <button
                    type="button"
                    className="lms-search-clear"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="lms-toolbar-filters">
                <select
                  className="lms-form-select"
                  aria-label="Chủ đề"
                  value={topicFilter}
                  onChange={(e) => {
                    setTopicFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <option value="ALL">All Topics</option>
                  {PRESET_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  className="lms-form-select"
                  aria-label="Độ khó"
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <select
                  className="lms-form-select"
                  aria-label="Trạng thái"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">In Quiz</option>
                  <option value="RESERVE">In Bank</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn-lms btn-lms-secondary"
                    onClick={handleResetFilters}
                    style={{ fontSize: '12px', padding: '4px 8px', color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="lms-toolbar-right">
              <div className="lms-course-switcher">
                <label htmlFor="question-bank-course">Khóa học</label>
                <select
                  id="question-bank-course"
                  className="lms-form-control"
                  value={activeCourseId ?? ''}
                  onChange={handleChangeCourse}
                  disabled={myCourses.length === 0}
                >
                  {myCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="lms-bulk-banner">
              <div>
                Selected <strong>{selectedIds.size}</strong> questions
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-lms btn-lms-primary"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setIsBulkAssignOpen(true)}
                >
                  Assign to Quiz
                </button>
                <button
                  type="button"
                  className="btn-lms btn-lms-danger"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          <QuestionBankTable
            questions={questions}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
            onOpenCreate={handleOpenCreateModal}
            onOpenAi={() => setIsAiModalOpen(true)}
          />

          {totalElements > 0 && (
            <div className="lms-table-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span>
                  Showing <strong>{startItem} - {endItem}</strong> of <strong>{totalElements}</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Rows:</span>
                  <select
                    className="lms-form-select"
                    style={{ padding: '2px 6px', fontSize: '12px' }}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setPage(0)
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="lms-pagination-controls">
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                  title="First page"
                >
                  «
                </button>
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  title="Previous page"
                >
                  ‹
                </button>
                <span style={{ padding: '0 8px', fontWeight: 600, color: '#1e293b' }}>
                  Page {page + 1} of {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  title="Next page"
                >
                  ›
                </button>
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(totalPages - 1)}
                  title="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingQuestion}
        courseId={activeCourseId}
      />

      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        courseId={activeCourseId}
        onSavedSuccess={() => {
          setMessage('Imported questions from Gemini AI successfully!')
          setTimeout(() => setMessage(''), 4000)
          triggerReload()
        }}
      />

      <BulkAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkAssignConfirm}
      />
    </div>
  )
}
