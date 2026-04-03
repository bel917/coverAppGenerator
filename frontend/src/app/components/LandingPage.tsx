import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FileText, Zap, CheckCircle, Sparkles } from "lucide-react";
import { getCurrentUser, getStoredUser, hasStoredToken, type AuthUser } from "@/lib/auth";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function LandingPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());

  const userInitials = (() => {
    if (!currentUser?.name) {
      return "US";
    }

    const parts = currentUser.name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
  })();

  useEffect(() => {
    const run = async () => {
      if (!hasStoredToken()) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    };

    void run();
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate personalized cover letters in seconds, not hours",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced AI analyzes your CV and job requirements for perfect matches",
    },
    {
      icon: CheckCircle,
      title: "Tailored Content",
      description: "Each cover letter is customized to the specific job and company",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">CoverLetter AI</span>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="group relative">
                <Avatar className="h-10 w-10 border border-blue-100 shadow-sm">
                  <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="invisible absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  <Link
                    to="/dashboard"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/generate"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Generate
                  </Link>
                  <Link
                    to="/profile"
                    className="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-gray-900 px-4 py-2">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create tailored cover letters in seconds
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Let AI write professional, personalized cover letters that get you noticed.
            Upload your CV, paste the job description, and get a perfect cover letter instantly.
          </p>
          <Link
            to={currentUser ? "/generate" : "/login"}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Sparkles className="w-5 h-5" />
            {currentUser ? "Generate Cover Letter" : "Login to Get Started"}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600">Start for free, upgrade as you grow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                3 cover letters per month
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Basic AI generation
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                PDF export
              </li>
            </ul>
            {currentUser ? (
              <Link
                to="/dashboard"
                className="block text-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="block text-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          <div className="bg-blue-600 p-8 rounded-xl shadow-lg relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm">
              Popular
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-blue-100 mb-6">For serious job seekers</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$9</span>
              <span className="text-blue-100">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                Unlimited cover letters
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                Advanced AI generation
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                Multiple tone options
              </li>
              <li className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                Priority support
              </li>
            </ul>
            {currentUser ? (
              <Link
                to="/dashboard"
                className="block text-center w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Open Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="block text-center w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Pro Trial
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-900">CoverLetter AI</span>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered cover letter generation for job seekers
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            © 2026 CoverLetter AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
