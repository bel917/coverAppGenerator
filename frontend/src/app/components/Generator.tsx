import { useState } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { getApiErrorMessage } from "@/lib/api";
import { generateCoverLetter } from "@/lib/coverLetters";
import { uploadCv } from "@/lib/cvs";

export function Generator() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    tone: "professional",
    cvFile: null as File | null,
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generatedId, setGeneratedId] = useState<number | null>(null);
  const [uploadedCvId, setUploadedCvId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleCvChange = async (file: File) => {
    setFormData({ ...formData, cvFile: file });
    setError("");
    setIsUploadingCv(true);

    try {
      const uploaded = await uploadCv({
        title: file.name.replace(/\.[^.]+$/, "") || "Uploaded CV",
        file,
      });
      setUploadedCvId(uploaded.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to upload CV."));
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleGenerate = async () => {
    setError("");
    setIsGenerating(true);
    try {
      const generated = await generateCoverLetter({
        cv_id: uploadedCvId ?? undefined,
        job_description_text: formData.jobDescription,
        title: formData.jobTitle || undefined,
        tone: formData.tone,
        language: "en",
      });

      setGeneratedLetter(generated.content || "");
      setGeneratedId(generated.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to generate cover letter."));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generate Cover Letter
          </h1>
          <p className="text-gray-600">
            Fill in the details and let AI create your perfect cover letter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Input Form */}
          <div className="space-y-6">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {/* CV Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-gray-900 mb-3">Upload CV</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your CV here, or click to browse
                </p>
                <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      void handleCvChange(e.target.files[0]);
                    }
                  }}
                />
                {formData.cvFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                    <FileText className="w-5 h-5" />
                    <span>{isUploadingCv ? "Uploading..." : formData.cvFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-gray-900 mb-3">Job Title</label>
              <input
                type="text"
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
              />
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-gray-900 mb-3">
                Job Description / Requirements
              </label>
              <textarea
                rows={8}
                placeholder="Paste the job description or key requirements here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={formData.jobDescription}
                onChange={(e) =>
                  setFormData({ ...formData, jobDescription: e.target.value })
                }
              />
            </div>

            {/* Tone Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-gray-900 mb-3">
                Tone (Optional)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["professional", "casual", "confident"].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setFormData({ ...formData, tone })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.tone === tone
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isUploadingCv || !formData.jobDescription}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Right Side - Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-8 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Generating your cover letter...</p>
              </div>
            ) : generatedLetter ? (
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-4 whitespace-pre-wrap text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto">
                  {generatedLetter}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => generatedId && navigate(`/editor/${generatedId}`)}
                    disabled={!generatedId}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit & Refine
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600">
                  Your generated cover letter will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
