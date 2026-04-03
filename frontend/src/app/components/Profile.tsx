import { useEffect, useState } from "react";
import { User, Mail, FileText, Trash2, Upload, Save } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { deleteCv, listCvs, type Cv } from "@/lib/cvs";

export function Profile() {
  const [savedCVs, setSavedCVs] = useState<Cv[]>([]);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    defaultTone: "professional",
    language: "english",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [user, cvs] = await Promise.all([getCurrentUser(), listCvs()]);
        setProfileData((current) => ({
          ...current,
          name: user.name,
          email: user.email,
        }));
        setSavedCVs(
          cvs.map((cv) => ({
            ...cv,
            name: cv.file_name,
            size: cv.file_size ? `${Math.round(cv.file_size / 1024)} KB` : "Unknown size",
            date: cv.created_at,
          }))
        );
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load profile."));
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  const handleDeleteCv = async (id: number) => {
    try {
      await deleteCv(id);
      setSavedCVs((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete CV."));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and saved documents
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-900 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CV Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Saved CVs
              </h2>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Upload New CV
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-600">Loading profile...</div>
          ) : savedCVs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No CVs uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCVs.map((cv) => (
                <div
                  key={cv.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{cv.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {cv.size} • Uploaded {new Date(cv.date || cv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeleteCv(cv.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 mb-2">
                Default Cover Letter Tone
              </label>
              <select
                value={profileData.defaultTone}
                onChange={(e) =>
                  setProfileData({ ...profileData, defaultTone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="confident">Confident</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-900 mb-2">Language</label>
              <select
                value={profileData.language}
                onChange={(e) =>
                  setProfileData({ ...profileData, language: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscription
          </h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Free Plan</p>
              <p className="text-sm text-gray-600">2 of 3 cover letters used this month</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
