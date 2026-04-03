import { useEffect, useState } from "react";
import { Download, Copy, Save, Bold, Italic, List, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { getApiErrorMessage } from "@/lib/api";
import { getCoverLetter, updateCoverLetter } from "@/lib/coverLetters";

export function Editor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) {
        setError("Missing cover letter id.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const letter = await getCoverLetter(id);
        setTitle(letter.title);
        setContent(letter.content || "");
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load cover letter."));
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [id]);

  const handleSave = async () => {
    if (!id) {
      return;
    }

    setError("");

    try {
      await updateCoverLetter(id, {
        title,
        content,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save cover letter."));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Mock download functionality
    alert("PDF download would start here");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Cover Letter
            </h1>
            <p className="text-gray-600">Refine and customize your cover letter</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            Loading cover letter...
          </div>
        ) : (
          <>

        {/* Toolbar */}
        <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Bold">
              <Bold className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Italic">
              <Italic className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="List">
              <List className="w-5 h-5 text-gray-700" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <span className="text-sm text-gray-600">
              {content.split(" ").length} words
            </span>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cover letter title"
            className="w-full border-b border-gray-200 px-8 py-4 text-lg font-semibold text-gray-900 focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-8 min-h-[500px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy to Clipboard
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Tips for a great cover letter:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Customize the greeting with the hiring manager's name if possible</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Use specific examples from your experience that match the job requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Keep it concise - aim for 250-400 words</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Proofread carefully for any typos or errors</span>
            </li>
          </ul>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
