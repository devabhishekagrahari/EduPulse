import { Eye, Pencil, Trash2 } from "lucide-react";
import { QuestionDetails } from "./QuestionDetails";

const difficultyClass = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

const typeClass = {
  MCQ: "bg-blue-100 text-blue-700",
  Short: "bg-purple-100 text-purple-700",
  Long: "bg-pink-100 text-pink-700",
  Case: "bg-orange-100 text-orange-700",
};

export function QuestionRow({
  q,
  index,
  isOpen,
  toggle,
  handleAddQuestion,
  handleDeleteQuestion,
  mode = "full",
}) {
  const difficulty = q.difficulty || "Medium";

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition cursor-pointer"
        onClick={() => toggle(q._id)}
      >
        <td className="p-3">
          <input type="checkbox" />
        </td>
        <td className="p-3 font-mono text-center text-gray-700">
          {`Q${String(index + 1).padStart(3, "0")}`}
        </td>
        <td className="p-3 truncate max-w-xs">{q.questionText}</td>

        <td className="p-3 text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              typeClass[q.type] || "bg-gray-100 text-gray-700"
            }`}
          >
            {q.type}
          </span>
        </td>

        <td className="p-3 text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              difficultyClass[difficulty] || "bg-gray-100 text-gray-700"
            }`}
          >
            {difficulty}
          </span>
        </td>

        {/* <td className="p-3">{q.category || "Theory"}</td> */}
        <td className="p-3 flex justify-center items-center space-x-2">
          <button
            onClick={() => handleAddQuestion(q)}
            className=" inline-flex items-center text-blue-600 font-semibold hover:text-teal-700 transition-colors"
          >
            <span className="p-1 self-center">Add</span>
          </button>
          <button
            onClick={() => handleDeleteQuestion(q._id)}
            className=" inline-flex items-center text-red-600 font-semibold hover:text-teal-700 transition-colors"
          >
            <span className="p-1 self-center">Delete</span>
          </button>
        </td>

        {mode === "full" && (
          <>
            {/* <td className="p-3">
              {new Date(q.timestamp).toLocaleDateString()}
            </td> */}
            <td className="p-3 flex-row justify-center items-center space-x-2">
              <button className="p-1 hover:text-blue-600 hover:scale-110 transition">
                <Eye size={16} />
              </button>
              <button className="p-1 hover:text-green-600 hover:scale-110 transition">
                <Pencil size={16} />
              </button>
              <button
                onClick={() => {
                  handleDeleteQuestion(q._id);
                }}
                className="p-1 hover:text-red-600 hover:scale-110 transition"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </>
        )}
      </tr>

      {isOpen && (
        <QuestionDetails q={q} handleAddQuestion={handleAddQuestion} />
      )}
    </>
  );
}
