from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import PyPDF2
import os
from dotenv import load_dotenv
import io
from sqlalchemy.orm import Session

# Import our new database files
import models
from database import engine, SessionLocal

# Load environment variables
load_dotenv()

# Create the database tables automatically when the server starts
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# SECURITY: Allow our Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize official Gemini SDK
client = genai.Client()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/assess")
async def assess(
    target_role: str = Form(...),
    course: str = Form(...),
    skills: str = Form(""),
    cv_upload: UploadFile = File(None),
    db: Session = Depends(get_db) # Inject the database session
):
    extracted_text = ""
    
    if cv_upload and cv_upload.filename.endswith('.pdf'):
        try:
            contents = await cv_upload.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")

    final_context = f"Manual Skills: {skills}\nExtracted CV Text: {extracted_text}"

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
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=prompt
        )
        
        # Save the generated report to the database!
        db_report = models.Report(
            target_role=target_role,
            course=course,
            skills=skills,
            report_content=response.text
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        return {"report": response.text, "id": db_report.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    """Fetch all saved reports from the database, newest first."""
    try:
        # We order by ID descending so the newest reports appear at the top
        reports = db.query(models.Report).order_by(models.Report.id.desc()).all()
        
        # Format the data to match what our Next.js frontend expects
        formatted_reports = []
        for r in reports:
            formatted_reports.append({
                "id": str(r.id),
                "targetRole": r.target_role,
                # Convert the datetime object to a readable string
                "date": r.created_at.strftime("%m/%d/%Y, %I:%M:%S %p") if r.created_at else "Unknown Date",
                "content": r.report_content
            })
        return formatted_reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a specific report from the database."""
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        db.delete(report)
        db.commit()
        return {"message": "Report deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))