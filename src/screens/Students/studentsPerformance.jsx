import { useEffect, useState } from "react";
import BASE_URL from "../../utils/api";

// Utility to safely get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

export default function StudentsPerformance() {
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState("");

  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [attemptDetailsLoading, setAttemptDetailsLoading] = useState(false);

  // --- Fetch students list ---
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      setStudentsError("");

      try {
        const token = getAuthToken();
        if (!token) {
          setStudentsError("Missing authentication token. Please login again.");
          return;
        }

        const res = await fetch(`${BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load students");
        }

        const data = await res.json();

        // Expecting an array of users; if shape is different, gracefully fallback
        const normalizedStudents = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : [];

        setStudents(normalizedStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudentsError(err.message || "Unable to load students");
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // --- Fetch attempts for a specific student ---
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setSelectedAttempt(null);
    setAttemptDetails(null);
    setAttempts([]);
    setAttemptsError("");

    if (!student?._id) return;

    setAttemptsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setAttemptsError("Missing authentication token. Please login again.");
        setAttemptsLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/attempts/student/${student._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load attempts for this student");
      }

      const data = await res.json();
      const normalizedAttempts = Array.isArray(data)
        ? data
        : Array.isArray(data?.attempts)
        ? data.attempts
        : [];

      setAttempts(normalizedAttempts);
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setAttemptsError(err.message || "Unable to load attempts");
    } finally {
      setAttemptsLoading(false);
    }
  };

  // --- Fetch details for a specific attempt (to compute correct/wrong) ---
  const handleSelectAttempt = async (attempt) => {
    setSelectedAttempt(attempt);
    setAttemptDetails(null);
    if (!attempt?._id) return;

    setAttemptDetailsLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/attempts/${attempt._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load attempt details");
      }

      const data = await res.json();
      setAttemptDetails(data);
    } catch (err) {
      console.error("Error fetching attempt details:", err);
    } finally {
      setAttemptDetailsLoading(false);
    }
  };

  // --- Helpers to compute correct / wrong counts from attempt details ---
  const getCorrectWrongCounts = (attempt) => {
    if (!attempt) return { correct: 0, wrong: 0 };

    // 1. Direct top-level fields (ideal)
    if (
      typeof attempt.correctCount === "number" &&
      typeof attempt.wrongCount === "number"
    ) {
      return {
        correct: attempt.correctCount,
        wrong: attempt.wrongCount,
      };
    }

    // 1b. Marks-based snapshot (fallback: treat marks as "correct units")
    if (
      typeof attempt.totalMarksObtained === "number" &&
      typeof attempt.totalMarksSnapshot === "number"
    ) {
      const correct = attempt.totalMarksObtained;
      const wrong = Math.max(
        attempt.totalMarksSnapshot - attempt.totalMarksObtained,
        0
      );
      return { correct, wrong };
    }

    // 2. Nested stats objects (common patterns)
    const nestedStats =
      attempt.stats ||
      attempt.result ||
      attempt.summary ||
      attempt.performance ||
      {};

    if (
      typeof nestedStats.correctCount === "number" &&
      typeof nestedStats.wrongCount === "number"
    ) {
      return {
        correct: nestedStats.correctCount,
        wrong: nestedStats.wrongCount,
      };
    }

    if (
      typeof nestedStats.totalMarksObtained === "number" &&
      typeof nestedStats.totalMarksSnapshot === "number"
    ) {
      const correct = nestedStats.totalMarksObtained;
      const wrong = Math.max(
        nestedStats.totalMarksSnapshot - nestedStats.totalMarksObtained,
        0
      );
      return { correct, wrong };
    }

    if (
      typeof nestedStats.correct === "number" &&
      typeof nestedStats.wrong === "number"
    ) {
      return {
        correct: nestedStats.correct,
        wrong: nestedStats.wrong,
      };
    }

    if (
      typeof nestedStats.correctAnswers === "number" &&
      typeof nestedStats.wrongAnswers === "number"
    ) {
      return {
        correct: nestedStats.correctAnswers,
        wrong: nestedStats.wrongAnswers,
      };
    }

    // 3. Derive from score and total if present
    if (
      typeof attempt.totalQuestions === "number" &&
      typeof attempt.correct === "number"
    ) {
      return {
        correct: attempt.correct,
        wrong: attempt.totalQuestions - attempt.correct,
      };
    }

    if (
      typeof nestedStats.totalQuestions === "number" &&
      typeof nestedStats.correct === "number"
    ) {
      return {
        correct: nestedStats.correct,
        wrong: nestedStats.totalQuestions - nestedStats.correct,
      };
    }

    // 4. Derive from questions array
    const questions = attempt.questions || attempt.responses || [];
    if (Array.isArray(questions) && questions.length > 0) {
      let correct = 0;
      let wrong = 0;

      questions.forEach((q) => {
        const isCorrect =
          q.isCorrect === true ||
          q.correct === true ||
          q.status === "correct" ||
          q.isCorrectAnswer === true;
        if (isCorrect) correct += 1;
        else wrong += 1;
      });

      return { correct, wrong };
    }

    return { correct: 0, wrong: 0 };
  };

  const activeAttemptSummary = getCorrectWrongCounts(
    attemptDetails || selectedAttempt
  );

  const detailAttempt = attemptDetails || selectedAttempt;

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Students Performance
          </h1>
          <p className="text-sm text-slate-500">
            View each student and their attempted papers with quick correctness
            stats.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
        {/* Students list */}
        <section className="col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">
              Students ({students.length})
            </h2>
          </div>

          {studentsLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Loading students...
            </div>
          ) : studentsError ? (
            <div className="flex-1 flex items-center justify-center text-red-500 text-sm px-4 text-center">
              {studentsError}
            </div>
          ) : students.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
              No students found.
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {students.map((student) => (
                <li key={student._id}>
                  <button
                    type="button"
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full flex items-start justify-between px-3 py-3 text-left hover:bg-sky-50 transition ${
                      selectedStudent?._id === student._id
                        ? "bg-sky-100"
                        : "bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {student.name || student.fullName || student.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.email || "No email"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 text-sky-700">
                      {student.role || "Student"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Attempts + details */}
        <section className="col-span-8 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  Attempted Papers
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedStudent
                    ? `Showing attempts for ${
                        selectedStudent.name ||
                        selectedStudent.fullName ||
                        selectedStudent.email
                      }`
                    : "Select a student on the left to view their attempts."}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {attempts.length > 0 && `${attempts.length} attempts`}
              </p>
            </div>

            {!selectedStudent ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
                Select a student from the left panel to see their attempted
                papers.
              </div>
            ) : attemptsLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Loading attempts...
              </div>
            ) : attemptsError ? (
              <div className="flex-1 flex items-center justify-center text-red-500 text-sm px-4 text-center">
                {attemptsError}
              </div>
            ) : attempts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
                No attempts found for this student.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {attempts.map((attempt) => {
                  const summary = getCorrectWrongCounts(attempt);
                  const total = summary.correct + summary.wrong;
                  const accuracy =
                    total > 0 ? Math.round((summary.correct / total) * 100) : 0;

                  return (
                    <button
                      key={attempt._id}
                      type="button"
                      onClick={() => handleSelectAttempt(attempt)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition flex items-center justify-between ${
                        selectedAttempt?._id === attempt._id
                          ? "border-sky-400 bg-sky-50"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {attempt.paper?.paperName ||
                            attempt.paperName ||
                            attempt.paperTitle ||
                            attempt.title ||
                            attempt.paper?.title ||
                            attempt.paper?.name ||
                            "Untitled Paper"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {attempt.startTime ||
                          attempt.createdAt ||
                          attempt.date ||
                          attempt.createdOn
                            ? new Date(
                                attempt.startTime ||
                                  attempt.createdAt ||
                                  attempt.date ||
                                  attempt.createdOn
                              ).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Date not available"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                            Correct: {summary.correct}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold mt-1">
                            Wrong: {summary.wrong}
                          </span>
                        </div>
                        <div className="flex flex-col items-end text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {accuracy}%
                          </span>
                          <span className="">Accuracy</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed summary for selected attempt */}
          {detailAttempt && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {detailAttempt.paper?.paperName ||
                      detailAttempt.paperName ||
                      detailAttempt.paperTitle ||
                      detailAttempt.title ||
                      detailAttempt.paper?.title ||
                      detailAttempt.paper?.name ||
                      "Untitled Paper"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {detailAttempt.student?.name ||
                      detailAttempt.student?.fullName ||
                      selectedStudent?.name ||
                      selectedStudent?.fullName ||
                      "Student"}{" "}
                    · {detailAttempt.student?.email || selectedStudent?.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${
                      detailAttempt.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {detailAttempt.status || "Status N/A"}
                  </span>
                  {attemptDetailsLoading && (
                    <span className="text-[10px] text-slate-400">
                      Updating details...
                    </span>
                  )}
                </div>
              </div>

              {/* High-level stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-slate-100 px-3 py-2 bg-slate-50">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Marks Obtained
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {detailAttempt.totalMarksObtained ?? 0} /{" "}
                    {detailAttempt.paper?.totalMarks ??
                      detailAttempt.totalMarksSnapshot ??
                      0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2 bg-slate-50">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Correct / Wrong
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {activeAttemptSummary.correct} / {activeAttemptSummary.wrong}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2 bg-slate-50">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Accuracy
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {(() => {
                      const total =
                        activeAttemptSummary.correct +
                        activeAttemptSummary.wrong;
                      if (total === 0) return "0%";
                      const pct = Math.round(
                        (activeAttemptSummary.correct / total) * 100
                      );
                      return `${pct}%`;
                    })()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 px-3 py-2 bg-slate-50">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {(() => {
                      const start = detailAttempt.startTime
                        ? new Date(detailAttempt.startTime)
                        : null;
                      const end = detailAttempt.endTime
                        ? new Date(detailAttempt.endTime)
                        : null;
                      if (!start || !end) return "N/A";
                      const ms = end.getTime() - start.getTime();
                      const mins = Math.floor(ms / 60000);
                      const secs = Math.floor((ms % 60000) / 1000);
                      if (mins <= 0) return `${secs}s`;
                      return `${mins}m ${secs}s`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600">
                <div className="rounded-xl border border-slate-100 px-3 py-2 bg-white">
                  <p className="font-semibold text-slate-700 mb-1">
                    Student Details
                  </p>
                  <p>
                    <span className="text-slate-500">Name: </span>
                    {detailAttempt.student?.name ||
                      detailAttempt.student?.fullName ||
                      "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Email: </span>
                    {detailAttempt.student?.email || "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Role: </span>
                    {detailAttempt.student?.role || "Student"}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">Student ID: </span>
                    {detailAttempt.student?._id || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 px-3 py-2 bg-white">
                  <p className="font-semibold text-slate-700 mb-1">
                    Attempt Details
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">Attempt ID: </span>
                    {detailAttempt._id}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">Paper ID: </span>
                    {detailAttempt.paper?._id || "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Started: </span>
                    {detailAttempt.startTime
                      ? new Date(
                          detailAttempt.startTime
                        ).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Ended: </span>
                    {detailAttempt.endTime
                      ? new Date(
                          detailAttempt.endTime
                        ).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Created At: </span>
                    {detailAttempt.createdAt
                      ? new Date(
                          detailAttempt.createdAt
                        ).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Updated At: </span>
                    {detailAttempt.updatedAt
                      ? new Date(
                          detailAttempt.updatedAt
                        ).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Marks Scale: </span>
                    {detailAttempt.totalMarksSnapshot ?? "N/A"}
                  </p>
                </div>
              </div>

              {/* Responses list */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Question-wise Breakdown
                </h4>
                {Array.isArray(detailAttempt.responses) &&
                detailAttempt.responses.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-semibold">
                            Question ID
                          </th>
                          <th className="px-3 py-2 text-left font-semibold">
                            Student Answer
                          </th>
                          <th className="px-3 py-2 text-left font-semibold">
                            Marks
                          </th>
                          <th className="px-3 py-2 text-left font-semibold">
                            Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detailAttempt.responses.map((resp, idx) => (
                          <tr key={`${resp.questionId}-${idx}`}>
                            <td className="px-3 py-2 text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2 text-slate-700 max-w-[140px] truncate">
                              {resp.questionId}
                            </td>
                            <td className="px-3 py-2 text-slate-700 max-w-[220px]">
                              {resp.studentAnswer || (
                                <span className="text-slate-400 italic">
                                  No answer
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {typeof resp.marksAwarded === "number"
                                ? resp.marksAwarded
                                : "-"}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  resp.isCorrect
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {resp.isCorrect ? "Correct" : "Incorrect"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No response details available for this attempt.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


