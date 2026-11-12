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
  bulkAssignModule,
  getCourseModules,
  exportBankToJson,
} from '../services/questionBankService.js'
import { QuestionBankTable } from '../components/QuestionBankTable.jsx'
import { QuestionFormModal } from '../components/QuestionFormModal.jsx'
import { AiGeneratorModal } from '../components/AiGeneratorModal.jsx'
import { BulkAssignModal } from '../components/BulkAssignModal.jsx'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal.jsx'
import { listMyCourses } from '../../course/services/teacherCourseService.js'
import '../styles/questionBank.css'

const PRESET_TOPICS = [
  'Lập trình hướng đối tượng (Kế thừa & Đa hình)',
  'Đóng gói & Trừu tượng hóa',
  'Spring Boot REST API & MVC',
  'Spring Data JPA & Hibernate ORM',
  'Xử lý ngoại lệ & Mã trạng thái HTTP',
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
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    question: null,
    isBulk: false,
    error: '',
    busy: false,
  })
  const [modules, setModules] = useState([])

  useEffect(() => {
    if (!activeCourseId) return
    getCourseModules(activeCourseId).then(setModules).catch(() => setModules([]))
  }, [activeCourseId])

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
    getQuestionBankStats(activeCourseId).then((res) => {
      if (active && res) {
        setStats(res.data || res)
      }
    }).catch(() => {})
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
      assignedOnly: statusFilter === 'ASSIGNED',
      unassignedOnly: statusFilter === 'RESERVE',
      moduleId: /^\d+$/.test(statusFilter) ? statusFilter : undefined,
      topic: topicFilter,
      difficulty: difficultyFilter,
      keyword: searchFilter.trim() || undefined,
    })
      .then((response) => {
        if (!active) return
        setQuestions(response?.data?.items || [])
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
          setErrorMessage('Không thể tải dữ liệu ngân hàng câu hỏi. Vui lòng kiểm tra lại kết nối mạng.')
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
    setStatusFilter('ALL')
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

  const handleOpenDeleteModal = (q) => {
    const isAssigned = Boolean(q.quizId)
    setDeleteModalState({
      isOpen: true,
      question: q,
      isBulk: false,
      error: isAssigned
        ? `Không thể xóa câu hỏi này vì câu hỏi đã được gán vào bài kiểm tra "${q.quizTitle || 'Quiz #' + q.quizId}". Thao tác xóa bị từ chối.`
        : '',
      busy: false,
    })
  }

  const handleOpenBulkDeleteModal = () => {
    if (selectedIds.size === 0) return
    const assigned = questions.filter((q) => selectedIds.has(q.questionId) && q.quizId)
    setDeleteModalState({
      isOpen: true,
      question: null,
      isBulk: true,
      error: assigned.length > 0
        ? `Không thể xóa vì có ${assigned.length} câu hỏi đã được gán vào module hoặc bài kiểm tra. Vui lòng bỏ chọn hoặc gỡ gán các câu hỏi này trước khi xóa.`
        : '',
      busy: false,
    })
  }

  const handleConfirmDelete = async () => {
    if (deleteModalState.isBulk) {
      setDeleteModalState((prev) => ({ ...prev, busy: true, error: '' }))
      try {
        await bulkDeleteQuestions(Array.from(selectedIds))
        setMessage(`Đã xóa thành công ${selectedIds.size} câu hỏi!`)
        setSelectedIds(new Set())
        setDeleteModalState({ isOpen: false, question: null, isBulk: false, error: '', busy: false })
        setTimeout(() => setMessage(''), 3000)
        triggerReload()
      } catch (err) {
        setDeleteModalState((prev) => ({
          ...prev,
          busy: false,
          error: err.message || 'Xóa các câu hỏi đã chọn thất bại.',
        }))
      }
    } else if (deleteModalState.question) {
      setDeleteModalState((prev) => ({ ...prev, busy: true, error: '' }))
      try {
        await deleteQuestion(deleteModalState.question.questionId)
        setMessage('Xóa câu hỏi thành công!')
        setDeleteModalState({ isOpen: false, question: null, isBulk: false, error: '', busy: false })
        setTimeout(() => setMessage(''), 3000)
        triggerReload()
      } catch (err) {
        setDeleteModalState((prev) => ({
          ...prev,
          busy: false,
          error: err.message || 'Xóa câu hỏi thất bại.',
        }))
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.questionId, formData)
        setMessage('Cập nhật câu hỏi thành công!')
      } else {
        await createQuestion(formData)
        setMessage('Thêm câu hỏi mới vào ngân hàng thành công!')
      }
      setTimeout(() => setMessage(''), 3000)
      triggerReload()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Lưu câu hỏi thất bại.')
      }
      throw err
    }
  }

  const handleBulkAssignConfirm = async (moduleId, moduleTitle) => {
    try {
      await bulkAssignModule(Array.from(selectedIds), moduleId)
      setMessage(
        moduleId
          ? `Đã gán thành công ${selectedIds.size} câu hỏi vào ${moduleTitle}!`
          : `Đã chuyển ${selectedIds.size} câu hỏi về Kho dự phòng!`
      )
      setSelectedIds(new Set())
      setTimeout(() => setMessage(''), 3000)
      triggerReload()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Gán câu hỏi vào module thất bại.')
      }
    }
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
            <h1 className="lms-title-main">Ngân hàng câu hỏi</h1>
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
              + Thêm câu hỏi
            </button>
            <button
              type="button"
              className="btn-lms btn-lms-ai"
              onClick={() => setIsAiModalOpen(true)}
            >
              Tạo bằng AI
            </button>
            <button
              type="button"
              className="btn-lms btn-lms-secondary"
              onClick={() => exportBankToJson(activeCourseId, questions)}
              title="Xuất danh sách câu hỏi ra file JSON"
            >
              Xuất JSON
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
              <span className="lms-compact-kpi-label">Tổng số câu hỏi</span>
              <span className="lms-compact-kpi-icon slate">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
            </div>
            <div className="lms-compact-kpi-val">{stats.total}</div>
            <div className="lms-compact-kpi-sub">
              <span>{stats.assigned} Trong module</span>
              <span>•</span>
              <span>{stats.reserve} Trong kho</span>
            </div>
          </div>

          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">Phân bổ độ khó</span>
              <span className="lms-compact-kpi-icon amber">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
            </div>
            <div className="lms-diff-chip-group">
              <span className="lms-diff-chip easy">
                <strong>{stats.easy}</strong> Dễ
              </span>
              <span className="lms-diff-chip med">
                <strong>{stats.medium}</strong> Vừa
              </span>
              <span className="lms-diff-chip hard">
                <strong>{stats.hard}</strong> Khó
              </span>
            </div>
            <div className="lms-compact-kpi-sub">
              <span>Phân bổ trong toàn khóa học</span>
            </div>
          </div>

          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">Đã gán vào Module</span>
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
              <span>Đang dùng trong các bài học</span>
            </div>
          </div>

          <div className="lms-compact-kpi-card">
            <div className="lms-compact-kpi-header">
              <span className="lms-compact-kpi-label">Kho dự phòng</span>
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
              <span>Chưa gán vào module nào</span>
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
                    title="Xóa tìm kiếm"
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
                  <option value="ALL">Tất cả chủ đề</option>
                  {Array.from(
                    new Set([
                      ...questions.map((q) => q.topic).filter(Boolean),
                      ...modules.map((m) => m.title).filter(Boolean),
                      ...PRESET_TOPICS,
                    ])
                  ).map((t) => (
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
                  <option value="ALL">Tất cả độ khó</option>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
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
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ASSIGNED">Đã gán vào module</option>
                  <option value="RESERVE">Chưa gán (Kho dự phòng)</option>
                  {modules.map((m) => (
                    <option key={m.moduleId} value={m.moduleId}>Module: {m.title}</option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn-lms btn-lms-secondary"
                    onClick={handleResetFilters}
                    style={{ fontSize: '12px', padding: '4px 8px', color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    Đặt lại bộ lọc
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
                Đã chọn <strong>{selectedIds.size}</strong> câu hỏi
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-lms btn-lms-primary"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setIsBulkAssignOpen(true)}
                >
                  Gán vào Module
                </button>
                <button
                  type="button"
                  className="btn-lms btn-lms-danger"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={handleOpenBulkDeleteModal}
                >
                  Xóa các câu đã chọn
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
            onDelete={handleOpenDeleteModal}
            onOpenCreate={handleOpenCreateModal}
            onOpenAi={() => setIsAiModalOpen(true)}
            page={page}
            pageSize={pageSize}
          />

          {totalElements > 0 && (
            <div className="lms-table-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span>
                  Hiển thị <strong>{startItem} - {endItem}</strong> trên tổng số <strong>{totalElements}</strong> câu hỏi
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Số dòng:</span>
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
                  title="Trang đầu"
                >
                  «
                </button>
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  title="Trang trước"
                >
                  ‹
                </button>
                <span style={{ padding: '0 8px', fontWeight: 600, color: '#1e293b' }}>
                  Trang {page + 1} / {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  title="Trang sau"
                >
                  ›
                </button>
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(totalPages - 1)}
                  title="Trang cuối"
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
          setMessage('Đã nhập câu hỏi từ Gemini AI vào ngân hàng thành công!')
          setTimeout(() => setMessage(''), 4000)
          triggerReload()
        }}
      />

      <BulkAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        courseId={activeCourseId}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkAssignConfirm}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, question: null, isBulk: false, error: '', busy: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModalState.isBulk ? 'Xóa câu hỏi hàng loạt' : 'Xóa câu hỏi'}
        message={
          deleteModalState.isBulk
            ? `Bạn có chắc chắn muốn xóa ${selectedIds.size} câu hỏi đã chọn khỏi ngân hàng câu hỏi? Thao tác này không thể hoàn tác.`
            : deleteModalState.question
            ? `Bạn có chắc chắn muốn xóa câu hỏi #${deleteModalState.question.questionId}: "${deleteModalState.question.content?.length > 80 ? deleteModalState.question.content.slice(0, 80) + '...' : deleteModalState.question.content}"? Thao tác này không thể hoàn tác.`
            : ''
        }
        error={deleteModalState.error}
        isBlocked={Boolean(deleteModalState.error)}
        busy={deleteModalState.busy}
      />
    </div>
  )
}
