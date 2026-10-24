"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, Loader2 } from "lucide-react"; // <-- NEW IMPORT
import { motion } from "framer-motion";

// Define the structure of our saved reports
interface Report {
  id: string;
  targetRole: string;
  date: string;
  content: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<Report[]>([]);

  // Load history from local storage when the component mounts
  useEffect(() => {
    const saved = localStorage.getItem("attachready_v2_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult("");

    const formData = new FormData();
    const roleInput = document.getElementById("targetRole") as HTMLInputElement;
    const courseInput = document.getElementById("course") as HTMLInputElement;
    const skillsInput = document.getElementById(
      "skills",
    ) as HTMLTextAreaElement;
    const fileInput = document.getElementById("cvUpload") as HTMLInputElement;

    const roleVal = roleInput?.value || "";
    formData.append("target_role", roleVal);
    formData.append("course", courseInput?.value || "");
    formData.append("skills", skillsInput?.value || "");

    if (fileInput?.files?.[0]) {
      formData.append("cv_upload", fileInput.files[0]);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/assess", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.report);

        // Create new report object and save to history
        const newReport: Report = {
          id: Date.now().toString(),
          targetRole: roleVal,
          date: new Date().toLocaleString(),
          content: data.report,
        };

        const updatedHistory = [newReport, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(
          "attachready_v2_history",
          JSON.stringify(updatedHistory),
        );
      } else {
        alert("Error: " + data.detail);
      }
    } catch (error) {
      alert(
        "Network error connecting to backend. Ensure your FastAPI server is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = (id: string) => {
    const updated = history.filter((report) => report.id !== id);
    setHistory(updated);
    localStorage.setItem("attachready_v2_history", JSON.stringify(updated));
  };

  const downloadPDF = (report: Report) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>AttachReady Report - ${report.targetRole}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #18181b; max-width: 800px; margin: 0 auto; padding: 40px; }
              h1 { color: #0f766e; margin-bottom: 5px; }
              h2 { color: #27272a; margin-top: 0; }
              .date { color: #71717a; font-size: 0.9rem; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7; }
              pre { font-family: inherit; white-space: pre-wrap; font-size: 0.95rem; }
            </style>
          </head>
          <body>
            <h1>AttachReady Readiness Report</h1>
            <h2>Target Role: ${report.targetRole}</h2>
            <div class="date">Generated on: ${report.date}</div>
            <pre>${report.content}</pre>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-teal-200 font-sans pb-24">
      {/* Navbar */}
      <header className="px-6 py-4 border-b bg-white flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="font-extrabold text-xl tracking-tight text-zinc-900">
          AttachReady <span className="text-teal-600">AI</span>
        </div>
        <nav className="hidden md:block space-x-4">
          <Button variant="ghost">How it Works</Button>
          <Button className="bg-zinc-900 text-white rounded-full px-6">
            Get Started
          </Button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 flex flex-col items-center pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20 mb-6 shadow-sm">
              ✨ Powered by Google Gemini 3.5 Flash
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]"
          >
            Land Your Dream <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">
              Industrial Attachment.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your CV or paste your skills. Our AI instantly analyzes your
            profile, identifies skill gaps, and generates a personalized 3-step
            action plan to get you hired.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
          >
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 text-md h-12 shadow-md hover:shadow-lg transition-all"
              onClick={() =>
                document
                  .getElementById("assessment")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Analyze My Readiness
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-md h-12 border-zinc-300 hover:bg-zinc-100 transition-all"
              onClick={() =>
                document
                  .getElementById("assessment")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start Free Assessment
            </Button>
          </motion.div>
        </section>

        {/* Assessment Form Card */}
        <section id="assessment">
          <Card className="shadow-xl border-0 ring-1 ring-zinc-200 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="text-center pb-8 pt-10 bg-zinc-900 text-white">
              <CardTitle className="text-3xl font-bold">
                Start Your Free Assessment
              </CardTitle>
              <CardDescription className="text-zinc-400 text-md mt-2">
                No sign-up required. Get your personalized plan in seconds.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3 p-8 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 text-center hover:bg-zinc-100 transition-colors">
                  <p className="text-md font-semibold text-zinc-800">
                    🚀 Fast Track: Upload your CV (PDF)
                  </p>
                  <p className="text-sm text-zinc-500 mb-4 max-w-sm mx-auto">
                    Skip the typing. We will automatically extract your skills
                    and project experience using AI.
                  </p>
                  <Input
                    id="cvUpload"
                    type="file"
                    accept=".pdf"
                    className="max-w-xs mx-auto cursor-pointer bg-white"
                  />
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-200"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-400 text-sm font-medium tracking-widest">
                    OR ENTER MANUALLY
                  </span>
                  <div className="flex-grow border-t border-zinc-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">
                      Target Role <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="targetRole"
                      placeholder="e.g., Software Engineering Intern"
                      className="h-12 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">
                      Course of Study <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="course"
                      placeholder="e.g., Level 6 Diploma in CS"
                      className="h-12 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">
                    Current Technical Skills
                  </label>
                  <Textarea
                    id="skills"
                    placeholder="e.g., Python, React, Next.js, Docker..."
                    className="min-h-[120px] rounded-lg resize-y"
                  />
                </div>

                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-6 rounded-xl h-14 shadow-md transition-transform active:scale-[0.98] flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      AI is Analyzing Your Profile...
                    </>
                  ) : (
                    "Generate AI Readiness Report"
                  )}
                </Button>
              </form>

              {/* Loading Skeleton */}
              {isLoading && (
                <div className="mt-8 p-6 bg-white border border-zinc-200 rounded-xl shadow-sm animate-pulse space-y-6">
                  <div className="h-6 bg-zinc-200 rounded-md w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-100 rounded-md w-full"></div>
                    <div className="h-4 bg-zinc-100 rounded-md w-5/6"></div>
                    <div className="h-4 bg-zinc-100 rounded-md w-4/6"></div>
                  </div>
                  <div className="h-6 bg-zinc-200 rounded-md w-1/4 mt-8"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-100 rounded-md w-full"></div>
                    <div className="h-4 bg-zinc-100 rounded-md w-full"></div>
                    <div className="h-4 bg-zinc-100 rounded-md w-3/4"></div>
                  </div>
                </div>
              )}

              {/* Display Result directly below form temporarily */}
              {result && (
                <div className="mt-8 p-6 bg-zinc-50 border-l-4 border-teal-600 rounded-r-xl">
                  <h3 className="font-bold text-xl mb-4">
                    Your Readiness Report
                  </h3>
                  <pre className="whitespace-pre-wrap font-sans text-zinc-700 leading-relaxed">
                    {result}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* History Section */}
        {history.length > 0 && (
          <section className="space-y-6 pt-12 border-t border-zinc-200">
            <h2 className="text-2xl font-bold text-zinc-900 text-center">
              Your Saved Reports
            </h2>
            <p className="text-center text-zinc-500 text-sm">
              Reports are saved locally in your browser.
            </p>
            <div className="space-y-6">
              {history.map((report) => (
                <Card
                  key={report.id}
                  className="shadow-sm border border-zinc-200 bg-white"
                >
                  <CardHeader className="bg-zinc-50 border-b border-zinc-100 flex flex-row justify-between items-center py-4">
                    <div>
                      <CardTitle className="text-lg font-semibold text-zinc-800">
                        {report.targetRole}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {report.date}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200"
                        onClick={() => downloadPDF(report)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Save PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700 leading-relaxed">
                      {report.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
