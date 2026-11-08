export default function QuestionCard({ question, total, selected, onSelect, disabled }) {
  const multipleAnswers = question.questionType === 'MULTIPLE_ANSWER'
  const chosen = selected ? selected.split(',') : []

  function choose(key) {
    if (!multipleAnswers) {
      onSelect(question.questionId, key)
      return
    }
    const next = chosen.includes(key) ? chosen.filter((k) => k !== key) : [...chosen, key]
    onSelect(question.questionId, next.sort().join(','))
  }

  return (
    <article className="card quiz-question-card">
      <p className="eyebrow">
        CÂU {question.order} / {total}
      </p>
      <h2 className="quiz-question-content">{question.content}</h2>
      {question.options.length === 0 && (
        <p className="muted">Câu hỏi này chưa có phương án trả lời.</p>
      )}
      <fieldset className="quiz-options" disabled={disabled}>
        <legend className="sr-only">Chọn một đáp án</legend>
        {question.options.map((option) => (
          <label
            key={option.key}
            className={`quiz-option ${chosen.includes(option.key) ? 'quiz-option-selected' : ''}`}
          >
            <input
              type={multipleAnswers ? 'checkbox' : 'radio'}
              name={`question-${question.questionId}`}
              value={option.key}
              checked={chosen.includes(option.key)}
              onChange={() => choose(option.key)}
            />
            <span className="quiz-option-key">{option.key}</span>
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
    </article>
  )
}
