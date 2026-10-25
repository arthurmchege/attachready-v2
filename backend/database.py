from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# We default to a local SQLite database for fast development. 
# When we deploy, we just add DATABASE_URL=postgresql://... to the .env file!
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attachready.db")

# SQLite specifically requires check_same_thread=False. Postgres does not.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()