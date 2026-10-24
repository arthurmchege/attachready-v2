from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import PyPDF2
import os
from dotenv import load_dotenv
import io

# Load the Gemini API key securely
load_dotenv()

app = FastAPI()

# SECURITY: Allow our Next.js frontend (port 3000) to talk to this API (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize official Gemini SDK
client = genai.Client()

@app.post("/api/assess")
async def assess(
    target_role: str = Form(...),
    course: str = Form(...),
    skills: str = Form(""),
    cv_upload: UploadFile = File(None)
):
    extracted_text = ""
    
    # 1. Handle the new PDF Upload feature
    if cv_upload and cv_upload.filename.endswith('.pdf'):
        try:
            # Read the PDF directly from memory (no saving to disk required!)
            contents = await cv_upload.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")

    # 2. Combine PDF text with any manually typed skills
    final_context = f"Manual Skills: {skills}\nExtracted CV Text: {extracted_text}"

    # 3. Construct the prompt
    prompt = f"""
    You are an expert career advisor for TVET students.
    Student Course: {course}
    Target Role: {target_role}
    Background Context (Skills/CV): {final_context}

    Provide a highly structured readiness report containing:
    1. A brief executive summary.
    2. Key Strengths (bullet points).
    3. Potential Skill Gaps (bullet points).
    4. A 3-Step Actionable Preparation Plan.
    
    CRITICAL INSTRUCTION: Format the output STRICTLY in Markdown. 
    - Use ## for main headings and ### for subheadings.
    - Use **bolding** for emphasis on key technologies or concepts.
    - Use unordered lists (-) for all bullet points.
    - Keep the tone encouraging, professional, and highly specific to the tech stack.
    - Do NOT include a generic main title (like "# Readiness Report"), start directly with the content.
    """

    try:
        # 4. Call Gemini
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=prompt
        )
        # FastAPI automatically converts dictionaries to JSON!
        return {"report": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))