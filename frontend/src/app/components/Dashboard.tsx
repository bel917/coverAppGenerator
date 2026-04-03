import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PlusCircle, FileText, Calendar, Search, Filter } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { listCoverLetters, type CoverLetter } from "@/lib/coverLetters";

export function Dashboard() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await listCoverLetters();
        setCoverLetters(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load cover letters."));
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Manage your cover letters and create new ones</p>
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Cover Letter
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Filter</span>
          </button>
        </div>
      </div>

      {/* Cover Letters List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Cover Letters</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-600">Loading cover letters...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : coverLetters.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No cover letters yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first AI-powered cover letter to get started
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Create Cover Letter
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {coverLetters.map((letter) => (
              <div
                key={letter.id}
                className="p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                      {letter.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {letter.job_description?.company_name || "No company set"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(letter.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/editor/${letter.id}`}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
