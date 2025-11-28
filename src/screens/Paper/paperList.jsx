import React, { useEffect, useState } from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Header,
  Footer,
  TabStopPosition,
  TabStopType,
  ImageRun,
  BorderStyle,
} from "docx";
import logo from "../../assets/logo.jpg";
import { saveAs } from "file-saver";
import BASE_URL from "../../utils/api";

export default function ViewPapers() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [editing, setEditing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const savePaperLocally = (newPaper) => {
    try {
      if (!newPaper || typeof newPaper !== "object") return;

      const existing = JSON.parse(localStorage.getItem("papers")) || [];

      // Match by both templateName + paperName
      const filtered = existing.filter((p) => {
        if (newPaper.templateName && newPaper.paperName) {
          return !(
            p.templateName === newPaper.templateName &&
            p.paperName === newPaper.paperName
          );
        }
        // fallback: compare full object
        return JSON.stringify(p) !== JSON.stringify(newPaper);
      });

      const updated = [newPaper, ...filtered];
      localStorage.setItem("papers", JSON.stringify(updated));
    } catch (err) {
      console.error("❌ Failed to save paper locally:", err);
    }
  };
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to add a question.");
    return;
  }

  const getLocalPapers = () => {
    try {
      const data = localStorage.getItem("papers");
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("❌ Failed to read papers from localStorage:", err);
      return [];
    }
  };

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const localPapers = getLocalPapers();
        if (localPapers.length > 0) {
          setPapers(localPapers);
          return;
        }

        const res = await fetch(`${BASE_URL}/papers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setPapers(data);
      } catch (err) {
        console.error("❌ Error loading papers:", err);
      }
    };

    loadPapers();
  }, []);

  const groupedPapers = papers.reduce((acc, paper) => {
    const key = paper.templateName || "Untitled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(paper);
    return acc;
  }, {});

  const handleSectionChange = (sectionIndex, field, value) => {
    const updatedSections = [...selectedPaper.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      [field]: value,
    };
    setSelectedPaper({ ...selectedPaper, sections: updatedSections });
  };

  const handleQuestionChange = (sectionIndex, questionIndex, field, value) => {
    const updatedSections = [...selectedPaper.sections];
    const updatedQuestions = [...updatedSections[sectionIndex].questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };
    updatedSections[sectionIndex].questions = updatedQuestions;
    setSelectedPaper({ ...selectedPaper, sections: updatedSections });
  };

  const regeneratePaper = async () => {
    savePaperLocally(selectedPaper);
    try {
      const res = await fetch(`${BASE_URL}/papers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPaper),
      });
      const data = await res.json();
      alert("✅ Paper updated successfully!");
      console.log("Updated:", data);
    } catch (err) {
      alert("❌ Update failed");
      console.error(err);
    }
  };

  const downloadPdf = async (selectedPaper) => {
    if (!selectedPaper || !selectedPaper.sections) {
      console.error("❌ Invalid selectedPaper:", selectedPaper);
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    let y = 10;

    // Logo
    img.onload = () => {
      doc.addImage(img, "JPEG", 10, y, 24, 24);

      doc.setFont("times", "normal");

      // Paper Name
      doc.setFontSize(16);
      doc.setFont("times", "bold");

      const pageWidth = doc.internal.pageSize.getWidth();

      const template = `${selectedPaper.templateName}`;
      doc.text(
        template,
        (pageWidth - doc.getTextWidth(template)) / 2,
        (y += 5)
      );

      const title = `${selectedPaper.paperName}`;
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, (y += 7));

      // Created by
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      const subtitle = `Created By: ${selectedPaper.createdBy}`;
      doc.text(
        subtitle,
        (pageWidth - doc.getTextWidth(subtitle)) / 2,
        (y += 7)
      );

      // Time(left side)
      doc.setFont("times", "bold");
      doc.text(`Time: 3hrs`, 10, (y += 11));
      doc.text(`Total Marks: ${selectedPaper.totalMarks}`, pageWidth - 10, y, {
        align: "right",
      });

      // Margin Line
      doc.setLineWidth(0.2);
      doc.line(10, (y += 5), pageWidth - 10, y);

      // Intructions (Static)
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.text("Instructions:", 10, (y += 10));

      doc.setFont("times", "normal");
      doc.setFontSize(12);
      y += 7;
      const instructions = [
        "1. All questions are compulsory.",
        "2. Answer neatly in the space provided.",
        "3. Do not use calculators unless specified.",
        "4. Manage your time wisely.",
      ];
      instructions.forEach((inst) => {
        doc.text(inst, 15, y);
        y += 7;
      });

      // Margin Line
      doc.setLineWidth(0.2);
      doc.line(10, y, pageWidth - 10, y);

      // Section
      y += 10;

      selectedPaper.sections.forEach((section, secIndex) => {
        doc.setFont("times", "bold");
        doc.setFontSize(14);

        const sectionTitle = `Section ${section.name}  (Marks: ${section.sectionMarks})`;
        doc.text(sectionTitle, pageWidth / 2, y, { align: "center" });
        y += 10;

        section.questions.forEach((q, qIndex) => {
          if (y > 270) {
            doc.addPage();
            y = 10;
          }

          doc.setFont("times", "normal");
          doc.setFontSize(12);
          doc.text(`${secIndex + 1}.${qIndex + 1}) ${q.questionText}`, 10, y);
          y += 7;

          (q.options ?? []).forEach((opt, optIndex) => {
            doc.text(`   ${String.fromCharCode(65 + optIndex)}. ${opt}`, 15, y);
            y += 6;
          });

          doc.setTextColor(0);
          y += 10;
        });

        y += 5;
      });

      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.text(
        `Created At: ${new Date(selectedPaper.createdAt).toLocaleString()}`,
        10,
        290
      );

      doc.save(`${selectedPaper.paperName.replace(/\s+/g, "_")}.pdf`);
    };
  };

  const downloadWord = async (selectedPaper) => {
    if (!selectedPaper || !selectedPaper.sections) {
      console.error("❌ Invalid selectedPaper:", selectedPaper);
      return;
    }

    // Logo
    const response = await fetch(logo);
    const logoBuffer = await response.arrayBuffer();

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 500, right: 500, bottom: 500, left: 500 },
            },
          },

          children: [
            // === Table 1: Logo + Top 3 Lines ===
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          spacing: { before: 0, after: 0 },
                          children: [
                            new ImageRun({
                              data: logoBuffer,
                              transformation: { width: 90, height: 90 },
                            }),
                          ],
                        }),
                      ],
                      width: { size: 12, type: "pct" },
                      borders: {
                        top: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                        bottom: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                        left: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                        right: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          indent: { left: -500 },
                          children: [
                            new TextRun({
                              text: selectedPaper.templateName || "Template",
                              font: "Times New Roman",
                              bold: true,
                              size: 32,
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,

                          spacing: { before: 50 },
                          indent: { left: -300 },
                          children: [
                            new TextRun({
                              text: selectedPaper.paperName || "Exam Paper",
                              font: "Times New Roman",
                              bold: true,
                              size: 32,
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,

                          spacing: { before: 50 },
                          indent: { left: -300 },
                          children: [
                            new TextRun({
                              text: `Created By: ${selectedPaper.createdBy}`,
                              font: "Times New Roman",
                              size: 24,
                            }),
                          ],
                        }),
                      ],
                      width: { size: 92, type: "pct" },
                      verticalAlign: "center",
                      borders: {
                        top: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                        bottom: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                        left: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                        right: {
                          style: BorderStyle.NONE,
                          size: 0,
                          color: "FFFFFF",
                        },
                      },
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: "pct" },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
            }),

            // Time (left) + Marks (right)
            new Paragraph({
              spacing: { after: 200, before: 200 },
              tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
              children: [
                new TextRun({
                  text: `Time: 3 hrs`,
                  bold: true,
                  font: "Times New Roman",
                  size: 24,
                }),
                new TextRun({ text: "\t" }),
                new TextRun({
                  text: `Total Marks: ${selectedPaper.totalMarks || 0}`,
                  bold: true,
                  font: "Times New Roman",
                  size: 24,
                }),
              ],
            }),
            // Line Above Instructions
            new Paragraph({
              spacing: { before: 50 },
              border: { top: { style: "single", size: 6, color: "000000" } },
            }),

            // Instructions
            new Paragraph({
              spacing: { before: 100, after: 100 },
              children: [
                new TextRun({
                  text: "Instructions:",
                  font: "Times New Roman",
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            ...[
              "1. All questions are compulsory.",
              "2. Answer neatly in the space provided.",
              "3. Do not use calculators unless specified.",
              "4. Manage your time wisely.",
            ].map(
              (inst) =>
                new Paragraph({
                  spacing: { after: 140 }, // 7pt
                  indent: { left: 300 }, // ~0.15 inch left indent
                  children: [
                    new TextRun({
                      text: inst,
                      font: "Times New Roman",
                      size: 24, // 12 pt
                    }),
                  ],
                })
            ),

            // Line Below Instructions
            new Paragraph({
              border: { bottom: { style: "single", size: 6, color: "000000" } },
            }),

            // Sections & Questions
            ...selectedPaper.sections.flatMap((section, sIdx) => [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 200 },
                children: [
                  new TextRun({
                    text: `Section ${section.name} (Marks: ${section.sectionMarks})`,
                    font: "Times New Roman",
                    bold: true,
                    size: 26,
                  }),
                ],
              }),
              ...section.questions.flatMap((q, qIdx) => [
                new Paragraph({
                  spacing: { before: 200, after: 100 },
                  children: [
                    new TextRun({
                      text: `${sIdx + 1}.${qIdx + 1}) ${q.questionText}`,
                      font: "Times New Roman",
                      size: 24,
                    }),
                  ],
                }),
                ...q.options.map(
                  (opt, j) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `   ${String.fromCharCode(65 + j)}. ${opt}`,
                          font: "Times New Roman",
                          size: 24,
                        }),
                      ],
                    })
                ),
              ]),
            ]),
          ],

          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: `Created At: ${new Date(
                        selectedPaper.createdAt
                      ).toLocaleString()}`,
                      italics: true,
                      font: "Times New Roman",
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
          },
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${selectedPaper.paperName || "ExamPaper"}.docx`);
  };

  return (
    <div className="p-6 w-full flex flex-col rounded-2xl bg-white shadow-sm">
      <h2 className="text-xl font-bold pb-4">View Question Papers</h2>
      <div className="space-y-2">
        {Object.keys(groupedPapers).length === 0 ? (
          <p className="text-gray-500 "> No Paper Found</p>
        ) : (
          Object.keys(groupedPapers).map((template) => (
            <div key={template}>
              <h3 className="text-lg font-semibold">📂 {template}</h3>
              <ul className="pl-4 list-disc">
                {groupedPapers[template].map((paper) => (
                  <li
                    key={paper._id}
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedPaper(paper);
                      setEditing(false);
                    }}
                  >
                    {paper.paperName}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {selectedPaper && (
        <div className="border p-4 rounded bg-gray-100">
          <h3 className="text-xl font-semibold">
            📄 {selectedPaper.paperName} ({selectedPaper.templateName})
          </h3>

          <button
            className="mt-2 px-3 py-1 !bg-yellow-500 text-white rounded"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel Edit" : "Edit"}
          </button>
          <button
            className="mt-2 px-3 py-1 !bg-yellow-500 text-white rounded ml-2"
            onClick={async () => {
              setDownloading(true);
              await downloadPdf(selectedPaper);
              setDownloading(false);
            }}
            disabled={!selectedPaper}
          >
            {downloading ? "Downloading..." : "Download Pdf"}
          </button>
          <button
            className="mt-2 ml-2 px-3 py-1 !bg-blue-500 text-white rounded"
            onClick={() => downloadWord(selectedPaper)}
          >
            Download Word
          </button>

          {editing && (
            <form
              className="space-y-4 mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                regeneratePaper();
              }}
            >
              {selectedPaper.sections.map((section, sIdx) => (
                <div key={sIdx} className="border p-4 bg-white rounded">
                  <label className="block font-medium">Section Name</label>
                  <input
                    className="border p-1 w-full mb-2"
                    value={section.name}
                    onChange={(e) =>
                      handleSectionChange(sIdx, "name", e.target.value)
                    }
                  />
                  <label className="block font-medium">Section Marks</label>
                  <input
                    className="border p-1 w-full mb-2"
                    value={
                      Array.isArray(section.sectionMarks)
                        ? section.sectionMarks[0]
                        : section.sectionMarks
                    }
                    onChange={(e) =>
                      handleSectionChange(sIdx, "sectionMarks", [
                        Number(e.target.value),
                      ])
                    }
                  />
                  <label className="block font-medium">Questions</label>
                  {section.questions.map((q, qIdx) => (
                    <div key={q._id} className="border p-2 mb-2 rounded">
                      <label className="block text-sm font-medium">
                        Question Text
                      </label>
                      <input
                        className="border p-1 w-full mb-1 text-sm"
                        value={q.questionText}
                        onChange={(e) =>
                          handleQuestionChange(
                            sIdx,
                            qIdx,
                            "questionText",
                            e.target.value
                          )
                        }
                      />
                      <label className="block text-sm font-medium">
                        Options (comma separated)
                      </label>
                      <input
                        className="border p-1 w-full mb-1 text-sm"
                        // 1. Sanitize the 'value' prop: If q.options is null/undefined, use an empty array []
                        //    before calling .join(", "). This prevents a crash on initial render.
                        value={(q.options ?? []).join(", ")}
                        onChange={(e) =>
                          handleQuestionChange(
                            sIdx,
                            qIdx,
                            "options",
                            // 2. Sanitize the input value:
                            e.target.value
                              .split(",")
                              .map((opt) => opt.trim())
                              // Filters out empty strings ("")
                              .filter(Boolean)
                          )
                        }
                      />
                      <label className="block text-sm font-medium">
                        Correct Answer
                      </label>
                      <input
                        className="border p-1 w-full mb-1 text-sm"
                        value={q.correctAnswer}
                        onChange={(e) =>
                          handleQuestionChange(
                            sIdx,
                            qIdx,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
              <button
                type="submit"
                className="mt-4 px-4 py-2 !bg-green-600 text-white rounded"
              >
                🔄 Regenerate Paper
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
