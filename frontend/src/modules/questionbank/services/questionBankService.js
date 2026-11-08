import { apiClient } from '../../../shared/api/apiClient.js'

const MOCK_STORAGE_KEY = 'lms_question_bank_en_v4'

try {
  localStorage.removeItem('lms_question_bank_mock_data')
  localStorage.removeItem('lms_question_bank_v2')
  localStorage.removeItem('lms_question_bank_v3')
} catch {
}

export const PRESET_SAMPLE_QUESTIONS = [
  {
    questionId: 101,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'OOP Inheritance & Polymorphism',
    difficulty: 'EASY',
    content: 'In Java, which keyword is used by a subclass to inherit from a parent class?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: 'implements' },
      { key: 'B', text: 'extends' },
      { key: 'C', text: 'inherits' },
      { key: 'D', text: 'super' },
    ],
    correctAnswer: 'B',
    explanation: 'The "extends" keyword establishes an inheritance relationship between a subclass and a superclass.',
  },
  {
    questionId: 102,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: 1,
    quizTitle: 'Quiz 01: Core OOP Concepts',
    topic: 'Encapsulation & Abstraction',
    difficulty: 'MEDIUM',
    content: 'How is encapsulation typically implemented in Java Object-Oriented Programming?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: 'Declaring fields as private and providing public getter and setter methods' },
      { key: 'B', text: 'Declaring all fields and methods as public for open access' },
      { key: 'C', text: 'Marking all instance variables with the final modifier' },
      { key: 'D', text: 'Deriving from multiple base classes simultaneously' },
    ],
    correctAnswer: 'A',
    explanation: 'Encapsulation safeguards internal object state by hiding instance variables and exposing controlled accessors/mutators.',
  },
  {
    questionId: 103,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'Spring Boot REST MVC',
    difficulty: 'EASY',
    content: 'In Spring Boot MVC, which annotation designates a controller that automatically serializes return values into JSON responses?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: '@Controller' },
      { key: 'B', text: '@RestController' },
      { key: 'C', text: '@Service' },
      { key: 'D', text: '@Repository' },
    ],
    correctAnswer: 'B',
    explanation: '@RestController combines @Controller and @ResponseBody to streamline REST API development.',
  },
  {
    questionId: 104,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: 1,
    quizTitle: 'Quiz 01: Core OOP Concepts',
    topic: 'Spring Data JPA & ORM',
    difficulty: 'HARD',
    content: 'Which interface in Spring Data JPA supplies standard persistence operations such as findAll(), save(), and findById()?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: 'JpaRepository' },
      { key: 'B', text: 'JdbcTemplate' },
      { key: 'C', text: 'EntityInterface' },
      { key: 'D', text: 'DataMapping' },
    ],
    correctAnswer: 'A',
    explanation: 'JpaRepository extends PagingAndSortingRepository and CrudRepository with full JPA capabilities.',
  },
  {
    questionId: 105,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'OOP Inheritance & Polymorphism',
    difficulty: 'HARD',
    content: 'Which mechanism implements Runtime Polymorphism in Java?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: 'Method Overloading' },
      { key: 'B', text: 'Method Overriding' },
      { key: 'C', text: 'Encapsulation' },
      { key: 'D', text: 'Constructor Chaining' },
    ],
    correctAnswer: 'B',
    explanation: 'Method overriding enables dynamic method dispatch at runtime based on the actual instantiated object type.',
  },
  {
    questionId: 106,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'Exception Handling',
    difficulty: 'HARD',
    content: 'Which annotation is combined with @ExceptionHandler to configure centralized Global Exception Handling in Spring Boot?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: '@RestControllerAdvice' },
      { key: 'B', text: '@ErrorHandler' },
      { key: 'C', text: '@GlobalInterceptor' },
      { key: 'D', text: '@ResponseStatus' },
    ],
    correctAnswer: 'A',
    explanation: '@RestControllerAdvice captures exceptions globally and structures them into standardized JSON error payloads.',
  },
  {
    questionId: 107,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'Encapsulation & Abstraction',
    difficulty: 'EASY',
    content: 'Can an abstract class in Java define concrete methods with complete implementation bodies?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: 'Yes, an abstract class can contain both abstract and concrete methods' },
      { key: 'B', text: 'No, abstract classes are strictly limited to abstract method declarations' },
      { key: 'C', text: 'Only when all declared class fields are marked static' },
      { key: 'D', text: 'Only when implementing the Serializable interface' },
    ],
    correctAnswer: 'A',
    explanation: 'Abstract classes in Java can provide default concrete implementations alongside abstract method definitions.',
  },
  {
    questionId: 108,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'Spring Boot REST MVC',
    difficulty: 'MEDIUM',
    content: 'Which Spring annotation is used to extract path parameters from a URI template such as /api/v1/questions/{id}?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: '@RequestParam' },
      { key: 'B', text: '@PathVariable' },
      { key: 'C', text: '@RequestBody' },
      { key: 'D', text: '@ModelAttribute' },
    ],
    correctAnswer: 'B',
    explanation: '@PathVariable binds URI template variables directly into controller handler method arguments.',
  },
  {
    questionId: 109,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'Spring Data JPA & ORM',
    difficulty: 'MEDIUM',
    content: 'Which JPA annotation models a relationship where many questions are associated with a single course?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: '@OneToMany' },
      { key: 'B', text: '@ManyToOne' },
      { key: 'C', text: '@ManyToMany' },
      { key: 'D', text: '@Embedded' },
    ],
    correctAnswer: 'B',
    explanation: '@ManyToOne establishes the foreign key relationship mapping multiple question records to one course record.',
  },
  {
    questionId: 110,
    courseId: 1,
    courseTitle: 'Object-Oriented Programming (Java) SWD392',
    quizId: null,
    quizTitle: null,
    topic: 'Exception Handling',
    difficulty: 'EASY',
    content: 'Which block in a Java try-catch-finally statement always executes regardless of whether an exception is thrown?',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { key: 'A', text: 'catch' },
      { key: 'B', text: 'finally' },
      { key: 'C', text: 'throw' },
      { key: 'D', text: 'try' },
    ],
    correctAnswer: 'B',
    explanation: 'The finally block ensures critical cleanup and resource deallocation logic executes in all circumstances.',
  },
]

const SAMPLE_LOOKUP = new Map(PRESET_SAMPLE_QUESTIONS.map((q) => [q.questionId, q]))

function inferTopic(content, id = 0) {
  const text = (content || '').toLowerCase()
  if (text.includes('kế thừa') || text.includes('đa hình') || text.includes('extends') || text.includes('polymorphism') || text.includes('inherit')) {
    return 'OOP Inheritance & Polymorphism'
  }
  if (text.includes('đóng gói') || text.includes('trừu tượng') || text.includes('encapsulation') || text.includes('abstract')) {
    return 'Encapsulation & Abstraction'
  }
  if (text.includes('mvc') || text.includes('rest') || text.includes('controller') || text.includes('pathvariable')) {
    return 'Spring Boot REST MVC'
  }
  if (text.includes('jpa') || text.includes('repository') || text.includes('crud') || text.includes('manytoone')) {
    return 'Spring Data JPA & ORM'
  }
  if (text.includes('ngoại lệ') || text.includes('exception') || text.includes('finally') || text.includes('advice')) {
    return 'Exception Handling'
  }
  const defaultTopics = [
    'OOP Inheritance & Polymorphism',
    'Encapsulation & Abstraction',
    'Spring Boot REST MVC',
    'Spring Data JPA & ORM',
    'Exception Handling',
  ]
  return defaultTopics[Math.abs(id) % defaultTopics.length]
}

function inferDifficulty(content, id = 0) {
  const text = (content || '').toLowerCase()
  if (text.includes('keyword') || text.includes('từ khóa') || text.includes('finally') || text.includes('which keyword') || text.includes('cơ bản')) {
    return 'EASY'
  }
  if (text.includes('runtime') || text.includes('polymorphism') || text.includes('advice') || text.includes('restcontrolleradvice') || text.includes('kế thừa từ đâu')) {
    return 'HARD'
  }
  const diffs = ['EASY', 'MEDIUM', 'HARD']
  return diffs[Math.abs(id) % diffs.length]
}

function normalizeQuestion(q, idx = 0) {
  const sample = SAMPLE_LOOKUP.get(q.questionId)
  if (sample) {
    return {
      ...sample,
      quizId: q.quizId !== undefined ? q.quizId : sample.quizId,
      quizTitle: q.quizTitle !== undefined ? q.quizTitle : sample.quizTitle,
    }
  }

  const topic = q.topic && q.topic !== 'Chủ đề chung' && q.topic !== 'General Topic' ? q.topic : inferTopic(q.content, q.questionId || idx)
  const difficulty = q.difficulty ? q.difficulty.toUpperCase() : inferDifficulty(q.content, q.questionId || idx)

  return {
    ...q,
    topic,
    difficulty,
  }
}

function getMockStore() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) {
      const sanitized = PRESET_SAMPLE_QUESTIONS.map(normalizeQuestion)
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(sanitized))
      return sanitized
    }
    const parsed = JSON.parse(raw)
    const sanitized = parsed.map(normalizeQuestion)
    return sanitized
  } catch {
    return PRESET_SAMPLE_QUESTIONS.map(normalizeQuestion)
  }
}

function saveMockStore(data) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
  } catch {
  }
}

export async function getCourseQuestions(courseId, {
  page = 0,
  size = 10,
  sort,
  quizId,
  unassignedOnly,
  keyword,
  difficulty,
  topic,
} = {}) {
  try {
    const query = { page, size }
    if (sort) query.sort = sort
    if (quizId != null && quizId !== '') query.quizId = quizId
    if (unassignedOnly) query.unassignedOnly = true
    if (topic && topic !== 'ALL') query.topic = topic
    if (difficulty && difficulty !== 'ALL') query.difficulty = difficulty
    if (keyword && keyword.trim()) query.keyword = keyword.trim()

    const res = await apiClient(`courses/${courseId}/questions`, { query })
    if (res?.data?.items) {
      let items = res.data.items.map(normalizeQuestion)
      if (difficulty && difficulty !== 'ALL') {
        const diffUpper = difficulty.trim().toUpperCase()
        items = items.filter((q) => (q.difficulty || '').trim().toUpperCase() === diffUpper)
      }
      if (topic && topic !== 'ALL') {
        const topicLower = topic.trim().toLowerCase()
        items = items.filter((q) => {
          const itemTopic = (q.topic || '').trim().toLowerCase()
          return itemTopic === topicLower || itemTopic.includes(topicLower) || topicLower.includes(itemTopic)
        })
      }
      res.data.items = items
    }
    return res
  } catch (error) {
    console.warn('[QuestionBank] Backend unreachable. Using offline mock repository:', error.message)
    const allCourseQuestions = getMockStore().filter((q) => Number(q.courseId) === Number(courseId))

    let list = [...allCourseQuestions]

    if (unassignedOnly) {
      list = list.filter((q) => q.quizId == null)
    } else if (quizId != null && quizId !== '') {
      list = list.filter((q) => Number(q.quizId) === Number(quizId))
    }

    if (difficulty && difficulty !== 'ALL') {
      const diffUpper = difficulty.trim().toUpperCase()
      list = list.filter((q) => (q.difficulty || '').trim().toUpperCase() === diffUpper)
    }

    if (topic && topic !== 'ALL') {
      const topicLower = topic.trim().toLowerCase()
      list = list.filter((q) => {
        const itemTopic = (q.topic || '').trim().toLowerCase()
        return itemTopic === topicLower || itemTopic.includes(topicLower) || topicLower.includes(itemTopic)
      })
    }

    if (keyword && keyword.trim()) {
      const term = keyword.trim().toLowerCase()
      list = list.filter((q) => {
        const contentMatch = (q.content || '').toLowerCase().includes(term)
        const topicMatch = (q.topic || '').toLowerCase().includes(term)
        const optionMatch = (q.options || []).some((opt) => (opt.text || '').toLowerCase().includes(term))
        return contentMatch || topicMatch || optionMatch
      })
    }

    if (sort === 'content,asc') {
      list.sort((a, b) => a.content.localeCompare(b.content))
    } else if (sort === 'questionId,asc') {
      list.sort((a, b) => a.questionId - b.questionId)
    } else {
      list.sort((a, b) => b.questionId - a.questionId)
    }

    const totalElements = list.length
    const totalPages = Math.ceil(totalElements / size) || 1
    const paged = list.slice(page * size, (page + 1) * size)

    const totalEasy = allCourseQuestions.filter((q) => (q.difficulty || '').toUpperCase() === 'EASY').length
    const totalMedium = allCourseQuestions.filter((q) => (q.difficulty || '').toUpperCase() === 'MEDIUM').length
    const totalHard = allCourseQuestions.filter((q) => (q.difficulty || '').toUpperCase() === 'HARD').length
    const totalAssigned = allCourseQuestions.filter((q) => q.quizId != null).length
    const totalReserve = allCourseQuestions.filter((q) => q.quizId == null).length

    return {
      code: 'SUCCESS',
      message: 'Success (Mock Repository)',
      data: {
        items: paged,
        page,
        size,
        totalElements,
        totalPages,
        stats: {
          total: allCourseQuestions.length,
          easy: totalEasy,
          medium: totalMedium,
          hard: totalHard,
          assigned: totalAssigned,
          reserve: totalReserve,
        },
      },
    }
  }
}

export async function getQuestionBankStats(courseId) {
  try {
    const res = await apiClient(`courses/${courseId}/question-bank/stats`)
    if (res?.data) {
      return res.data
    }
  } catch (error) {
    console.warn('[QuestionBank] Failed to fetch server stats. Calculating dynamically:', error.message)
  }

  const all = getMockStore().filter((q) => Number(q.courseId) === Number(courseId))
  return {
    total: all.length,
    easy: all.filter((q) => (q.difficulty || '').toUpperCase() === 'EASY').length,
    medium: all.filter((q) => (q.difficulty || '').toUpperCase() === 'MEDIUM').length,
    hard: all.filter((q) => (q.difficulty || '').toUpperCase() === 'HARD').length,
    assigned: all.filter((q) => q.quizId != null).length,
    reserve: all.filter((q) => q.quizId == null).length,
  }
}

export async function createQuestion(data, headers) {
  try {
    return await apiClient('questions', { method: 'POST', body: data, headers })
  } catch {
    const list = getMockStore()
    const newId = list.reduce((max, item) => Math.max(max, item.questionId || 0), 100) + 1
    const newQuestion = {
      questionId: newId,
      courseId: data.courseId,
      courseTitle: `Course #${data.courseId}`,
      quizId: data.quizId || null,
      quizTitle: data.quizId ? `Quiz #${data.quizId}` : null,
      topic: data.topic || 'OOP Inheritance & Polymorphism',
      difficulty: (data.difficulty || 'MEDIUM').toUpperCase(),
      content: data.content,
      questionType: data.questionType || 'MULTIPLE_CHOICE',
      options: data.options || [],
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || '',
    }
    list.unshift(newQuestion)
    saveMockStore(list)
    return {
      code: 'SUCCESS',
      message: 'Created successfully',
      data: newQuestion,
    }
  }
}

export async function updateQuestion(questionId, data, headers) {
  try {
    return await apiClient(`questions/${questionId}`, { method: 'PUT', body: data, headers })
  } catch {
    const list = getMockStore()
    const index = list.findIndex((q) => Number(q.questionId) === Number(questionId))
    if (index !== -1) {
      list[index] = {
        ...list[index],
        quizId: data.quizId || null,
        quizTitle: data.quizId ? `Quiz #${data.quizId}` : null,
        topic: data.topic || list[index].topic,
        difficulty: (data.difficulty || list[index].difficulty || 'MEDIUM').toUpperCase(),
        content: data.content,
        questionType: data.questionType,
        options: data.options || [],
        correctAnswer: data.correctAnswer,
        explanation: data.explanation !== undefined ? data.explanation : list[index].explanation,
      }
      saveMockStore(list)
    }
    return {
      code: 'SUCCESS',
      message: 'Updated successfully',
      data: list[index],
    }
  }
}

export async function deleteQuestion(questionId, headers) {
  try {
    return await apiClient(`questions/${questionId}`, { method: 'DELETE', headers })
  } catch {
    const list = getMockStore()
    const updated = list.filter((q) => Number(q.questionId) !== Number(questionId))
    saveMockStore(updated)
    return null
  }
}

export async function bulkDeleteQuestions(questionIds) {
  const idsSet = new Set(questionIds.map(Number))
  const list = getMockStore()
  const updated = list.filter((q) => !idsSet.has(Number(q.questionId)))
  saveMockStore(updated)
  return { code: 'SUCCESS', message: `Deleted ${questionIds.length} questions successfully.` }
}

export async function bulkAssignQuiz(questionIds, quizId, quizTitle = '') {
  const idsSet = new Set(questionIds.map(Number))
  const list = getMockStore()
  for (const q of list) {
    if (idsSet.has(Number(q.questionId))) {
      q.quizId = quizId ? Number(quizId) : null
      q.quizTitle = quizId ? (quizTitle || `Quiz #${quizId}`) : null
    }
  }
  saveMockStore(list)
  return { code: 'SUCCESS', message: 'Assigned successfully' }
}

export async function generateAiQuestions(params) {
  try {
    return await apiClient('question-bank/generate-ai', {
      method: 'POST',
      body: params,
    })
  } catch {
    const mockGenerated = Array.from({ length: params.numberOfQuestions || 3 }, (_, idx) => {
      const diff = idx % 3 === 0 ? 'EASY' : idx % 3 === 1 ? 'MEDIUM' : 'HARD'
      return {
        content: `[Gemini AI (${params.topic})] Practice question #${idx + 1} regarding ${params.topic}?`,
        topic: params.topic,
        difficulty: params.difficultyLevel === 'MIXED' ? diff : params.difficultyLevel,
        questionType: 'MULTIPLE_CHOICE',
        options: [
          { key: 'A', text: `Option A for question #${idx + 1}` },
          { key: 'B', text: `Accurate standard answer choice B` },
          { key: 'C', text: `Alternative edge-case choice C` },
          { key: 'D', text: `Distractor option D` },
        ],
        correctAnswer: 'B',
        explanation: `Choice B is correct according to the standard principles of ${params.topic}.`,
      }
    })
    return {
      code: 'SUCCESS',
      message: 'Generated questions successfully (AI Mock)',
      data: mockGenerated,
    }
  }
}

export async function batchSaveQuestions(questionsList) {
  try {
    return await apiClient('question-bank/batch-save', {
      method: 'POST',
      body: {
        courseId: questionsList[0]?.courseId || 1,
        quizId: questionsList[0]?.quizId || null,
        questions: questionsList,
      },
    })
  } catch {
    const list = getMockStore()
    let maxId = list.reduce((max, item) => Math.max(max, item.questionId || 0), 100)
    for (const q of questionsList) {
      maxId += 1
      list.unshift({
        questionId: maxId,
        courseId: q.courseId,
        courseTitle: `Course #${q.courseId}`,
        quizId: q.quizId || null,
        quizTitle: q.quizId ? `Quiz #${q.quizId}` : null,
        topic: q.topic || 'OOP Inheritance & Polymorphism',
        difficulty: (q.difficulty || 'MEDIUM').toUpperCase(),
        content: q.content,
        questionType: q.questionType || 'MULTIPLE_CHOICE',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      })
    }
    saveMockStore(list)
    return {
      code: 'SUCCESS',
      message: 'Batch saved successfully',
      data: questionsList,
    }
  }
}

export function exportBankToJson(courseId) {
  const list = getMockStore().filter((q) => Number(q.courseId) === Number(courseId))
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(list, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `question_bank_course_${courseId}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}
