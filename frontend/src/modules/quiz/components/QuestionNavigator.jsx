export default function QuestionNavigator({ questions, answers, currentIndex, onJump }) {
  return (
    <nav className="quiz-navigator" aria-label="Danh sách câu hỏi">
      {questions.map((question, index) => {
        const answered = Boolean(answers[question.questionId])
        const state = index === currentIndex ? 'current' : answered ? 'answered' : 'empty'
        return (
          <button
            key={question.questionId}
            type="button"
            className={`quiz-nav-item quiz-nav-${state}`}
            aria-current={index === currentIndex ? 'step' : undefined}
            aria-label={`Câu ${question.order}${answered ? ', đã trả lời' : ', chưa trả lời'}`}
            onClick={() => onJump(index)}
          >
            {question.order}
          </button>
        )
      })}
    </nav>
  )
}
