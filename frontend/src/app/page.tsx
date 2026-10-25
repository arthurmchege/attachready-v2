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
import { Download, Trash2, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { marked } from "marked";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const API_BASE_URL = "https://attachready-api.onrender.com";

  // NEW: Fetch history directly from the FastAPI database
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  // Load history on initial render
  useEffect(() => {
    fetchHistory();
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

    formData.append("target_role", roleInput?.value || "");
    formData.append("course", courseInput?.value || "");
    formData.append("skills", skillsInput?.value || "");

    if (fileInput?.files?.[0]) {
      formData.append("cv_upload", fileInput.files[0]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/assess`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.report);
        toast.success("AI Readiness Report generated and saved!");
        // Refresh the dashboard to show the newly saved report from the DB
        fetchHistory();
      } else {
        toast.error("Error: " + data.detail);
      }
    } catch (error) {
      toast.error(
        "Network error connecting to backend. Ensure your FastAPI server is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Delete the report directly from the database
  const deleteReport = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory(history.filter((report) => report.id !== id));
        toast.info("Report permanently deleted.");
        setSelectedReport(null);
      } else {
        toast.error("Failed to delete report from database.");
      }
    } catch (error) {
      toast.error("Network error while deleting.");
    }
  };

  const downloadPDF = (report: Report) => {
    toast.success(`Preparing PDF for ${report.targetRole}...`);
    const htmlContent = marked.parse(report.content) as string;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>AttachReady Report - ${report.targetRole}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #18181b; max-width: 800px; margin: 0 auto; padding: 40px; }
              h1 { color: #0f766e; margin-bottom: 5px; font-size: 28px; }
              .header-meta { color: #71717a; font-size: 0.95rem; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7; }
              h2 { color: #0f766e; margin-top: 32px; margin-bottom: 16px; font-size: 20px; border-bottom: 1px solid #ccfbf1; padding-bottom: 8px; }
              h3 { color: #18181b; margin-top: 24px; margin-bottom: 12px; font-size: 18px; }
              p { margin-bottom: 16px; color: #3f3f46; }
              ul { margin-bottom: 24px; padding-left: 24px; }
              li { margin-bottom: 8px; color: #3f3f46; }
              strong { color: #18181b; font-weight: 600; background-color: #f0fdfa; padding: 2px 4px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>AttachReady Readiness Report</h1>
            <div class="header-meta">
              Target Role: <strong>${report.targetRole}</strong><br>
              Generated on: ${report.date}
            </div>
            <div class="report-content">
              ${htmlContent}
            </div>
            <script>
              window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 250); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl font-bold text-teal-800 mt-8 mb-4 border-b border-teal-100 pb-2"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-lg font-bold text-zinc-900 mt-6 mb-3"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 space-y-2 mb-6" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li
            className="text-zinc-700 leading-relaxed marker:text-teal-500"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-4 text-zinc-700 leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong
            className="font-semibold text-zinc-900 bg-teal-50 px-1 rounded"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

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
          </motion.div>
        </section>

        {/* Assessment Form Card */}
        <section id="assessment" className="scroll-mt-24">
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
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />{" "}
                      Analyzing Profile...
                    </>
                  ) : (
                    "Generate AI Readiness Report"
                  )}
                </Button>
              </form>

              {isLoading && (
                <div className="mt-8 p-6 bg-white border border-zinc-200 rounded-xl shadow-sm animate-pulse space-y-6">
                  <div className="h-6 bg-zinc-200 rounded-md w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-100 rounded-md w-full"></div>
                    <div className="h-4 bg-zinc-100 rounded-md w-5/6"></div>
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-8 p-6 bg-zinc-50 border-l-4 border-teal-600 rounded-r-xl shadow-sm">
                  <h3 className="font-bold text-xl mb-6 text-zinc-900">
                    Your AI Readiness Report
                  </h3>
                  <div className="font-sans">
                    <MarkdownRenderer content={result} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Dashboard Grid */}
        {history.length > 0 && (
          <section className="space-y-8 pt-12 border-t border-zinc-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-zinc-900">
                Your Dashboard
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                Click any saved report to view, export, or manage it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((report) => (
                <Card
                  key={report.id}
                  className="cursor-pointer group hover:border-teal-500 hover:shadow-md transition-all duration-200 bg-white"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <CardTitle className="text-lg font-bold text-zinc-800 group-hover:text-teal-700 transition-colors line-clamp-2">
                          {report.targetRole}
                        </CardTitle>
                        <CardDescription className="flex items-center text-xs text-zinc-500">
                          <FileText className="w-3 h-3 mr-1.5" />
                          {report.date.split(",")[0]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal Dialog */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto bg-white sm:rounded-2xl p-0">
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="pr-8">
              <DialogTitle className="text-2xl font-bold text-zinc-900 leading-tight">
                {selectedReport?.targetRole}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-zinc-500">
                Generated on {selectedReport?.date}
              </DialogDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-teal-700 border-teal-200 hover:bg-teal-50"
                onClick={() => selectedReport && downloadPDF(selectedReport)}
              >
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() =>
                  selectedReport && deleteReport(selectedReport.id)
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="px-6 md:px-12 pb-12 pt-4">
            {selectedReport && (
              <MarkdownRenderer content={selectedReport.content} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
