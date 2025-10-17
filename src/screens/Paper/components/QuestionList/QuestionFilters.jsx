import { Link } from "react-router-dom";

export function QuestionFilters({ filters, setFilters, dropdowns, search, setSearch }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
    console.log("dropdowns:",dropdowns)
  return (

    <>
      {/* Search */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search questions by keyword, ID or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-2/3 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
        />
   
        <Link
          to="/add-question"
         className="mt-2 flex px-4 py-2 text-xl !bg-blue-600 !text-white rounded  transition"
        >
          + Add Question
        </Link>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["unit", "chapter", "subChapter", "subSubChapter"].map((field) => (
          <select
            key={field}
            name={field}
            value={filters[field]}
            onChange={handleChange}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {field}</option>
            {dropdowns[field+"s"]?.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        ))}
      </div>
    </>
  );
}
