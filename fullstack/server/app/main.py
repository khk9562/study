from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config.database import get_db, engine, Base
from app.models.user import User

# 모든 모델의 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.post("/users/")
def create_user(email: str, username: str, db: Session = Depends(get_db)):
    try:
        user = User(email=email, username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"message": "User created successfully", "user": user}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": users}