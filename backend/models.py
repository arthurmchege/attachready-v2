from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    target_role = Column(String, index=True)
    course = Column(String)
    skills = Column(Text)
    report_content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)