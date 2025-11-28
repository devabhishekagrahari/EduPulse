export function QuestionDetails({ q, handleAddQuestion }) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={9} className="p-6 text-gray-700">
        {/* Image Preview */}
        {q.imageUrl && (
          <div className="mb-4">
            <img
              src={q.imageUrl}
              alt="question"
              className="max-w-sm rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Question Meta Info */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    <div>
            <span className="font-semibold">Questions:</span>{" "}
            {q.questionText}
          </div>
          <div>
            <span className="font-semibold">Options:</span>{" "}
            {q.options?.join(", ")}
          </div>
          <div>
            <span className="font-semibold">Answer:</span> {q.correctAnswer}
          </div>
          <div>
            <span className="font-semibold">Marks:</span> +{q.posMarks} / -
            {q.negMarks}
          </div>
          <div>
            <span className="font-semibold">Unit:</span> {q.unit}
          </div>
          <div>
            <span className="font-semibold">Chapter:</span> {q.chapter}
          </div>
          <div>
            <span className="font-semibold">Sub-Chapter:</span> {q.subChapter}
          </div>
          <div>
            <span className="font-semibold">Sub-Sub-Chapter:</span>{" "}
            {q.subSubChapter}
          </div>
          <div>
            <span className="font-semibold">Created By:</span> {q.createdBy}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Timestamp:</span>{" "}
            {new Date(q.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Add Question Button */}
        <button
          onClick={() => handleAddQuestion(q)}
          className="mt-4 inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors"
        >
          <span className="mr-1">➕</span> Add Question
        </button>
      </td>
    </tr>
  );
}
