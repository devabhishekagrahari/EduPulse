import { useEffect, useState, useCallback, useMemo } from "react";
import BASE_URL from '../../utils/api' ;

// --- 1. DUMMY QUESTION BANK (Used for demonstration) ---
const DUMMY_QUESTION_BANK = [
  { "questionText": "What is the primary objective of **Knowledge Distillation** in Deep Learning?", "group": "Deep Learning", "difficulty": "Hard", "posMarks": 8, "type": "Short Answer", "correctAnswer": "Transfer knowledge from a large teacher model to a smaller student model." },
  { "questionText": "In **Sensor Fusion** for autonomous systems, what is the term for combining data from multiple sensors?", "group": "Robotics", "difficulty": "Medium", "posMarks": 4, "type": "MCQ", "correctAnswer": "Perception Fusion" },
  { "questionText": "Which type of **Adversarial Search** algorithm enhances Minimax by introducing a **cutoff test**?", "group": "Search", "difficulty": "Medium", "posMarks": 4, "type": "MCQ", "correctAnswer": "Depth-Limited Minimax" },
  { "questionText": "What is the primary concept that **Dempster-Shafer Theory (DST)** adds to traditional probability theory?", "group": "Uncertainty", "difficulty": "Hard", "posMarks": 8, "type": "Short Answer", "correctAnswer": "Distinguishes between lack of belief and disbelief." },
  { "questionText": "In **Computer Vision**, the process of identifying a boundary and assigning a label to every pixel in an image is known as:", "group": "Deep Learning", "difficulty": "Medium", "posMarks": 4, "type": "MCQ", "correctAnswer": "Semantic Segmentation" },
  { "questionText": "The **Dependency Parsing** task in NLP aims to extract which type of structure from a sentence?", "group": "NLP", "difficulty": "Hard", "posMarks": 4, "type": "MCQ", "correctAnswer": "The grammatical relationships and dependencies between words." },
  { "questionText": "In the context of **Robot Path Planning**, a method that uses randomized sampling to quickly explore the search space is called:", "group": "Robotics", "difficulty": "Hard", "posMarks": 4, "type": "MCQ", "correctAnswer": "Rapidly-exploring Random Tree (RRT)" },
  { "questionText": "TRUE or FALSE: In **First-Order Logic (FOL)**, a sentence is said to be **Satisfiable**.", "group": "Knowledge Representation", "difficulty": "Easy", "posMarks": 2, "type": "True/False", "correctAnswer": "TRUE" },
  { "questionText": "What is the primary drawback of using the **Mean Squared Error (MSE)** loss function?", "group": "Machine Learning", "difficulty": "Medium", "posMarks": 8, "type": "Short Answer", "correctAnswer": "Gradient vanishes when output is saturated, slowing learning." },
  { "questionText": "Which type of learning environment is best characterized by the agent’s actions influencing future states?", "group": "Fundamentals", "difficulty": "Medium", "posMarks": 4, "type": "MCQ", "correctAnswer": "Sequential" }
];


// --- 2. RANDOM SELECTION FUNCTION (Handles 'Select All' groups) ---
const selectRandomQuestions = (questionBank, difficulty, count, groups) => {
  // If groups array is empty, pull all unique groups from the bank.
  const groupsToFilterBy = (groups && groups.length > 0) 
    ? groups 
    : [...new Set(questionBank.map(q => q.group))];
    
  if (groupsToFilterBy.length === 0 || !count) return [];
    
  const filteredQuestions = questionBank.filter(q =>
    q.difficulty === difficulty && groupsToFilterBy.includes(q.group)
  );
  
  if (filteredQuestions.length < count) {
    console.warn(
      `⚠️ Insufficient questions found for Difficulty: ${difficulty}, Topics: ${groupsToFilterBy.join(', ')}. Found ${filteredQuestions.length}, needed ${count}. Returning all available.`
    );
    return filteredQuestions; 
  }

  const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count);
};


export default function AutomatedPaper({
  questionBankData = DUMMY_QUESTION_BANK, 
}) {
  
  // 📚 LOCAL STATE MANAGEMENT 
  const [templateName, setTemplateName] = useState('');
  const [paperName, setPaperName] = useState('');
  const [totalMarks, setTotalMarks] = useState(0);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [instructions, setPaperInstructions] = useState('');
  const [sections, setSections] = useState([]); // Initialized as an array

  // 🔥 Extract unique groups for the dropdown options
  const uniqueGroups = useMemo(() => {
    const groups = questionBankData.map(q => q.group);
    return ["", ...new Set(groups)].sort(); // Add empty option ("") and sort
  }, [questionBankData]);
  
  // Calculate total marks
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
        papers[index] = newPaper;
      } else {
        papers.push(newPaper);
      }

      localStorage.setItem("papers", JSON.stringify(papers));
      console.log("🗃️ Paper saved locally under 'papers'");
    } catch (err) {
      console.error("❌ Failed to save paper:", err);
    }
  };


  // Updated handler for all section inputs
  const handleSectionChange = useCallback((index, field, value) => {
    const updatedSections = [...sections];
    
    if (field === "questionCount" || field === "sectionMarks") {
      updatedSections[index][field] = parseInt(value) || 0; 
    } else if (field === "groupsInput") {
      const selectedGroup = String(value || ''); 
      updatedSections[index].groupsInput = selectedGroup; 
      
      // Update groups array: If selectedGroup is "", groups is [], allowing "select all" logic.
      updatedSections[index].groups = selectedGroup ? [selectedGroup] : [];
    } else {
      updatedSections[index][field] = value;
    }
    setSections(updatedSections);
  }, [sections]);

  
  const handleAddSection = () => {
    const newSection = {
      name: `Section ${sections.length + 1}`,
      difficulty: "Medium", 
      groupsInput: "", // Default: "--- Select Topic (All) ---"
      groups: [], 
      questionCount: 5, 
      sectionMarks: 4, 
      marks: 0, 
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  // Function to generate questions for a section
  const handleGenerateQuestions = (sectionIndex) => {
    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];
    
    if (section.questionCount === 0) {
      alert("Please specify the number of questions to select.");
      return;
    }

    const selected = selectRandomQuestions(
      questionBankData, 
      section.difficulty,
      section.questionCount,
      section.groups 
    );

    const totalSectionMarks = selected.reduce(
        (sum, q) => sum + (q.posMarks || section.sectionMarks), 
        0
    );
    
    updatedSections[sectionIndex].questions = selected;
    updatedSections[sectionIndex].questionCount = selected.length; 
    updatedSections[sectionIndex].marks = totalSectionMarks; 

    setSections(updatedSections);
    console.log(`✅ Generated ${selected.length} questions for ${section.name}. Total marks: ${totalSectionMarks}`);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Clean data for submission, ensuring required fields are included for server validation
  const sectionsToSubmit = sections.map(s => ({
    name: s.name,
    difficulty: s.difficulty,
    groups: s.groups,
    questionCount: s.questionCount,
    marks: s.marks,
    questions: s.questions.map(q => ({ 
        questionText: q.questionText, 
        type: q.type, 
        correctAnswer: q.correctAnswer, 
        // Include other essential question data
        difficulty: q.difficulty,
        group: q.group,
        posMarks: q.posMarks || s.sectionMarks 
    })),
  }));

  const paperData = {
    templateName,
    paperName,
    totalMarks,
    hours,
    minutes,
    instructions,
    sections: sectionsToSubmit,
  };

  console.log("📤 Submitted Paper Data:", paperData);
  savePaperToLocal(paperData); 

  // API Submission Logic
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
      
      {/* --- Paper Metadata Inputs --- */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-700">🧾 Template Name</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter your template name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">📄 Paper Name</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
            value={paperName}
            onChange={(e) => setPaperName(e.target.value)}
            placeholder="Enter your paper name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">🎯 Total Marks (Auto-Calc)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 outline-none"
            value={totalMarks}
            readOnly
            placeholder="Auto-calculated"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Duration (Hours)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            placeholder="0"
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Duration (Minutes)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">📄 Instructions (Optional)</label>
        <textarea
          rows="2"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-sky-400 outline-none"
          value={instructions}
          onChange={(e) => setPaperInstructions(e.target.value)}
          placeholder="e.g., Answer any five questions."
        />
      </div>

      {/* --- Sections Table --- */}
      <h3 className="text-lg font-semibold mb-3 mt-4">Section Configuration</h3>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-sky-200 text-blue-800 uppercase tracking-wider">
            <tr>
              <th className="border px-4 py-2 text-left">Section Name</th>
              <th className="border px-4 py-2 text-left">Difficulty</th>
              <th className="border px-4 py-2 text-left">Topic (Group)</th>
              <th className="border px-4 py-2 text-left">Marks/Q (Default)</th>
              <th className="border px-4 py-2 text-left">No. to Select</th>
              <th className="border px-4 py-2 text-center">Action</th>
              <th className="border px-4 py-2 text-left">Total Section Marks</th>            
              <th className="border px-4 py-2 text-left">Assigned Questions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, index) => (
              <tr key={index} className="hover:bg-blue-50 align-top">
                {/* 1. Section Name */}
                <td className="border px-2 py-1 max-w-[120px]">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border rounded"
                    value={section.name}
                    onChange={(e) => handleSectionChange(index, "name", e.target.value)}
                  />
                </td>
                
                {/* 2. Difficulty Selection */}
                <td className="border px-2 py-1 max-w-[100px]">
                  <select
                    className="w-full px-2 py-1 border rounded bg-white"
                    value={section.difficulty}
                    onChange={(e) => handleSectionChange(index, "difficulty", e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </td>

                {/* 3. Topics (Groups) - DROPDOWN */}
                <td className="border px-2 py-1 max-w-[200px]">
                  <select
                    className="w-full px-2 py-1 border rounded bg-white"
                    value={section.groupsInput || ''}
                    onChange={(e) => handleSectionChange(index, "groupsInput", e.target.value)}
                  >
                    {uniqueGroups.map(group => (
                      <option key={group} value={group}>
                        {group || "--- Select Topic (All) ---"}
                      </option>
                    ))}
                  </select>
                </td>

                {/* 4. Marks per Question (Default) */}
                <td className="border px-2 py-1 max-w-[80px]">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded"
                    placeholder="4"
                    value={section.sectionMarks}
                    onChange={(e) => handleSectionChange(index, "sectionMarks", e.target.value)}
                  />
                </td>
                
                {/* 5. Number of Questions to Select */}
                <td className="border px-2 py-1 max-w-[80px]">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded"
                    value={section.questionCount}
                    onChange={(e) => handleSectionChange(index, "questionCount", e.target.value)}
                  />
                </td>
                
                {/* 6. Action Button: GENERATE */}
                <td className="border px-2 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleGenerateQuestions(index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded transition"
                  >
                    Generate
                  </button>
                </td>

                {/* 7. Total Section Marks (Read Only) */}
                <td className="border px-2 py-1 max-w-[100px]">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border rounded bg-gray-100"
                    value={section.marks}
                    readOnly
                  />
                </td>
                
                {/* 8. Assigned Questions List */}
                <td className="border px-2 py-1 max-w-[200px] overflow-auto">
                  {section.questions?.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {section.questions.map((q, i) => (
                        <li key={i} className="text-xs">
                          {q.questionText.slice(0, 40)}...
                          <span className="ml-1 text-gray-500 font-semibold">
                            [{q.posMarks || section.sectionMarks} M]
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Click Generate</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={handleAddSection}
          className="flex px-4 py-2 text-xl bg-gradient-to-r from-teal-500 via-cyan-400 to-[#47E9F7] text-white rounded hover:opacity-90 transition shadow-md"
        >
          ➕ Add Section
        </button>

        <button
          type="submit"
          className="flex px-6 py-2 text-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded hover:opacity-90 transition shadow-lg font-bold"
        >
          💾 Save & Submit Paper
        </button>
      </div>
    </form>
  );
}