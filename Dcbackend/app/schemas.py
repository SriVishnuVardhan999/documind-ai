from pydantic import BaseModel, EmailStr
from datetime import datetime


# -------------------------
# User Schemas
# -------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True



# -------------------------
# Document Schemas
# -------------------------

class DocumentResponse(BaseModel):
    id: int
    user_id: int | None
    file_name: str
    file_path: str
    file_type: str | None
    uploaded_at: datetime

    class Config:
        from_attributes = True