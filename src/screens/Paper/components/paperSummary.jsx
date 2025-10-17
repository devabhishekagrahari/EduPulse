 import { useEffect } from "react";
import BASE_URL from '../../../utils/api' ;

export default function PaperSummary({
  selectedQuestions,
  templateName,
  setTemplateName,
  paperName,
  setPaperName,
  totalMarks,
  setTotalMarks,
  hours,
  setHours,
  minutes,
  setMinutes,
  instructions,
  setPaperInstructions,
  sections,
  setSections,
}) {
  useEffect(() => {
    const total = sections.reduce((acc, section) => acc + (section.marks || 0), 0);
    setTotalMarks(total);
  }, [sections]);

 const savePaperToLocal = (newPaper) => {
    try {
      const stored = localStorage.getItem("papers");
      const papers = stored ? JSON.parse(stored) : [];

      const index = papers.findIndex((p) => p.paperName === newPaper.paperName);
      if (index !== -1) {
        papers[index] = newPaper; // replace existing
      } else {
        papers.push(newPaper);
      }

      localStorage.setItem("papers", JSON.stringify(papers));
      console.log("🗃️ Paper saved locally under 'papers'");
    } catch (err) {
      console.error("❌ Failed to save paper:", err);
    }
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...sections];
    if (field === "sectionMarks") {
      updatedSections[index].questionNumbersRaw = value;
      const parsed = value
        .split(",")
        .map((num) => parseInt(num.trim()))
        .filter((num) => !isNaN(num));
      updatedSections[index].sectionMarks = parsed;
    } else if (field === "marks" || field === "questionCount") {
      updatedSections[index][field] = parseInt(value);
    } else {
      updatedSections[index][field] = value;
    }
    setSections(updatedSections);
  };

  const handleAddSection = () => {
    const newSection = {
      name: "",
      sectionMarks: 0,
      questionCount:0,
      questions: [], // 👈 track questions assigned to this section
    };
    setSections([...sections, newSection]);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const paperData = {
    templateName,
    paperName,
    totalMarks,
    //hours,
    //minutes,
    //instructions,
    sections,
  };

  console.log("📤 Submitted Paper Data:", paperData);
  savePaperToLocal(paperData);
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/papers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(paperData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Failed to save paper:", result);
      alert(`❌ Error: ${result.error || "Something went wrong"}`);
    } else {
      console.log("✅ Paper saved:", result);
      alert("✅ Paper created successfully!");
    }
  } catch (error) {
    console.error("🚨 Network error while saving paper:", error);
    alert("🚨 Network error. Please try again later.");
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 w-full flex flex-col rounded-2xl bg-white shadow-sm"
    >
      <h2 className="text-xl font-bold pb-4">Generate Question Papers</h2>
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">🧾 Template Name</label>
        <input
          type="text"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 
            focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Enter your template name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">📄 Paper Name</label>
        <input
          type="text"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 
            focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
          value={paperName}
          onChange={(e) => setPaperName(e.target.value)}
          placeholder="Enter your paper name"
          required
        />
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700">🎯 Total Marks</label>
        <input
          type="number"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 
            focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
          value={totalMarks}
          onChange={(e) => setTotalMarks(parseInt(e.target.value))}
          placeholder="Enter the maximun marks"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block font-medium text-gray-700 mb-2">🎯 Exam Duration</label>
        <div className="flex gap-4">
          {/* Hours Input */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Hours</label>
            <input
            type="number"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 
            focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            placeholder="Duration in hours"
            required
            />
          </div>

          {/* Minutes Input */}
          <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Minutes</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 
            focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            placeholder="Duration in minutes"
            required
          />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">📄 Instructions(Optional)</label>
        <input
          type="text"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 
            focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
          value={instructions}
          onChange={(e) => setPaperInstructions(e.target.value)}
          placeholder="Enter the maximun marks"
        />
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-sky-200 text-blue-800 uppercase tracking-wider">
            <tr>
              <th className="border px-4 py-2 text-left">Section</th>
              <th className="border px-4 py-2 text-left">Section Marks</th>
              <th className="border px-4 py-2 text-left">No. of Questions</th>
              <th className="border px-4 py-2 text-left">Total Section Marks</th>            
              <th className="border px-4 py-2 text-left">Assigned Questions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, index) => (
              <tr key={index} className="hover:bg-blue-50 align-top">
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border rounded"
                    value={section.name}
                    onChange={(e) => handleSectionChange(index, "name", e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border rounded"
                    placeholder="1"
                    value={section.sectionMarks}
                    onChange={(e) =>
                      handleSectionChange(index, "sectionMarks", e.target.value)
                    }
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded"
                    value={section.questionCount}
                    readOnly
                    onChange={(e) =>
                      handleSectionChange(index, "questionCount", e.target.value)
                    }
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded"
                    value={section.marks}
                    readOnly
                    onChange={(e) => handleSectionChange(index, "marks", e.target.value)}
                  />
                </td>
                
                <td className="border px-2 py-1 max-w-[200px] overflow-auto">
                  {section.questions?.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {section.questions.map((q, i) => (
                        <li key={i} className="text-xs">
                          {q.questionText.slice(0, 60)}...
                          <span className="ml-1 text-gray-500">+{q.posMarks}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">No questions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleAddSection}
          className="mt-2 flex px-4 py-2 text-xl bg-gradient-to-r from-blue-500 via-sky-400 to-[#27E9F7] text-white rounded hover:bg-teal-700 transition"
        >
          + Add Section
        </button>

        <button
          type="submit"
          className="mt-2 flex px-4 py-2 text-xl bg-gradient-to-r from-blue-500 via-sky-400 to-[#27E9F7] text-white rounded hover:bg-blue-700 transition"
        >
          💾 Save Paper
        </button>
      </div>
    </form>
  );
}
