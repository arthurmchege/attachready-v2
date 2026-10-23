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

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-teal-200 font-sans">
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

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Land Your Dream <br className="hidden md:block" /> Industrial
            Attachment.
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Upload your CV or paste your skills. Our AI instantly analyzes your
            profile, identifies skill gaps, and generates a personalized 3-step
            action plan to get you hired.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 text-md h-12"
            >
              Analyze My Readiness
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-md h-12 border-zinc-300"
            >
              View Example Report
            </Button>
          </div>
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
              {/* File Upload Upgrade */}
              <div className="space-y-3 p-8 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 text-center hover:bg-zinc-100 transition-colors">
                <p className="text-md font-semibold text-zinc-800">
                  🚀 Fast Track: Upload your CV (PDF)
                </p>
                <p className="text-sm text-zinc-500 mb-4 max-w-sm mx-auto">
                  Skip the typing. We will automatically extract your skills and
                  project experience using AI.
                </p>
                <Input
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
                    placeholder="e.g., Software Engineering Intern"
                    className="h-12 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">
                    Course of Study <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Level 6 Diploma in CS"
                    className="h-12 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">
                  Current Technical Skills
                </label>
                <Textarea
                  placeholder="e.g., Python, React, Next.js, Docker..."
                  className="min-h-[120px] rounded-lg resize-y"
                />
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-6 rounded-xl h-14 shadow-md transition-transform active:scale-[0.98]">
                Generate AI Readiness Report
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
