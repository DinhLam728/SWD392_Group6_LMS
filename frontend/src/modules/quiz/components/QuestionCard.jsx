export default function QuestionCard({ question, total, selected, onSelect, disabled }) {
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
            className={`quiz-option ${selected === option.key ? 'quiz-option-selected' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.questionId}`}
              value={option.key}
              checked={selected === option.key}
              onChange={() => onSelect(question.questionId, option.key)}
            />
            <span className="quiz-option-key">{option.key}</span>
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
    </article>
  )
}
