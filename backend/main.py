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
    You are a career advisor for TVET students.
    Student Course: {course}
    Target Role: {target_role}
    Background Context (Skills/CV): {final_context}

    Provide a structured readiness report containing:
    1. Strengths
    2. Potential Skill Gaps
    3. A 3-step actionable preparation plan.
    
    Format the output in plain text with clear bullet points. Keep it professional.
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