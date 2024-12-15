from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# MySQL 연결 설정
MYSQL_USER = os.getenv("DB_USERNAME", "root")
MYSQL_PASSWORD = os.getenv("DB_PASSWORD", "your_password")
# MYSQL_HOST = os.getenv("DB_HOST", "127.0.0.1")
MYSQL_HOST = os.getenv("DB_HOST", "localhost")
MYSQL_PORT = os.getenv("DB_PORT", "3306")
MYSQL_DATABASE = os.getenv("DB_NAME", "STARTDB")

# MySQL URL 생성
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# Create MySQL engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class
Base = declarative_base()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()