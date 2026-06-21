from fastapi import APIRouter, Depends, Query, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from backend.app.database.connection import get_db
from backend.app.models.news import UserPreference

router = APIRouter()

class PreferencesSchema(BaseModel):
    interests: List[str]

@router.get("", response_model=dict)
def get_preferences(
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = x_user_id or "guest_user"
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    
    interests = []
    if pref and pref.interests:
        interests = [i.strip() for i in pref.interests.split(",") if i.strip()]
        
    return {
        "status": "ok",
        "user_id": user_id,
        "interests": interests
    }

@router.post("", response_model=dict)
def save_preferences(
    req: PreferencesSchema,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = x_user_id or "guest_user"
    interests_str = ",".join([i.strip().lower() for i in req.interests if i.strip()])
    
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if pref:
        pref.interests = interests_str
    else:
        pref = UserPreference(user_id=user_id, interests=interests_str)
        db.add(pref)
        
    db.commit()
    db.refresh(pref)
    
    return {
        "status": "ok",
        "user_id": user_id,
        "interests": [i.strip() for i in pref.interests.split(",") if i.strip()]
    }
