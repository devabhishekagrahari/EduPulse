import { useState } from "react";
import { usePaperData } from "../../../../context/appProvider";
import { useQuestions } from "./useQuestions";
import { QuestionFilters } from "./QuestionFilters";
import { QuestionRow } from "./QuestionRow";
import BASE_URL from "../../../../utils/api";

export function QuestionList({ mode = "full" }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    unit: "",
    chapter: "",
    subChapter: "",
    subSubChapter: "",
    createdBy: "admin@example.com",
    type: "MCQ",
  });

  const { sections, setSections, selectedQuestions, setSelectedQuestions } =
    usePaperData();

  const { questions, dropdowns } = useQuestions(filters);
  const [openQuestionId, setOpenQuestionId] = useState(null);

  const toggleQuestion = (id) =>
    setOpenQuestionId((prev) => (prev === id ? null : id));

  function handleAddQuestion(q) {
    const sectionNames = sections.map((s) => s.name);
    const sectionName = prompt(`Select section: ${sectionNames.join(", ")}`);
    const selectedSectionIndex = sections.findIndex(
      (s) => s.name === sectionName
    );

    if (
      selectedSectionIndex !== -1 &&
      !sections[selectedSectionIndex].questions.find(
        (item) => item._id === q._id
      )
    ) {
      const updatedSections = [...sections];
      const section = updatedSections[selectedSectionIndex];
      section.questionCount += 1;
      section.questions.push({ ...q });
      section.marks = section.sectionMarks * section.questionCount;
      setSections(updatedSections);
    } else {
      alert(
        "Either no section selected or question already exists in the section."
      );
      return;
    }

    if (!selectedQuestions.find((item) => item._id === q._id)) {
      setSelectedQuestions([...selectedQuestions, { ...q }]);
    }
  }

  async function handleDeleteQuestion(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/questions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log("response:", res);
      }

      // refresh UI
      alert("Question deleted successfully ✅");
      window.location.reload();
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete question.");
    }
  }

  // Filter questions by search + dropdown filters
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q._id.toLowerCase().includes(search.toLowerCase());

    const matchesUnit = filters.unit ? q.unit === filters.unit : true;
    const matchesChapter = filters.chapter
      ? q.chapter === filters.chapter
      : true;
    const matchesSubChapter = filters.subChapter
      ? q.subChapter === filters.subChapter
      : true;
    const matchesSubSubChapter = filters.subSubChapter
      ? q.subSubChapter === filters.subSubChapter
      : true;

    return (
      matchesSearch &&
      matchesUnit &&
      matchesChapter &&
      matchesSubChapter &&
      matchesSubSubChapter
    );
  });

  return (
    <div className="p-6 w-full flex flex-col rounded-2xl bg-white shadow-sm">
      <QuestionFilters
        filters={filters}
        setFilters={setFilters}
        dropdowns={dropdowns}
        search={search}
        setSearch={setSearch}
      />
      <div className="overflow-x-auto max-h-[650px] overflow-y-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3">ID</th>
              <th className="p-3 text-left">Question</th>
              <th className="p-3">Type</th>
              <th className="p-3">Difficulty</th>
              {/* <th className="p-3">Category</th> */}
              <th className="p-8">Add Question Item</th>
              {mode === "full" && (
                <>
                  {/* <th className="p-3">Last Modified</th> */}
                  <th className="p-3">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, i) => (
                <QuestionRow
                  key={q._id}
                  q={q}
                  index={i}
                  isOpen={openQuestionId === q._id}
                  toggle={toggleQuestion}
                  handleAddQuestion={handleAddQuestion}
                  handleDeleteQuestion={handleDeleteQuestion}
                  mode={mode}
                />
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
