from sqlalchemy.orm import Session
from fastapi import FastAPI, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.dependencies.database.database import get_db
from app.models.patient_model import Patient
from app.utils.ai_integration import classify_images_internal
from app.utils.db import update_patient_in_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def get_all_patients(db: Session = Depends(get_db)):
    return db.query(Patient).order_by(Patient.id).all()


@app.post("/classify-strict")
async def classify_strict(
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
):
    return classify_images_internal(gesture_names, images, strict=True)


@app.post("/classify-not-strict")
async def classify_not_strict(
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
):
    return classify_images_internal(gesture_names, images, strict=False)


@app.post("/classify-strict-db")
async def classify_strict_db(
        name: str = Form(...),
        test_number: int = Form(...),
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
        db: Session = Depends(get_db)
):
    result = classify_images_internal(gesture_names, images, strict=True)
    correct_count = result["correct_count"]
    return update_patient_in_db(db, name, test_number, correct_count)


@app.post("/classify-not-strict-db")
async def classify_not_strict_db(
        name: str = Form(...),
        test_number: int = Form(...),
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
        db: Session = Depends(get_db)
):
    result = classify_images_internal(gesture_names, images, strict=False)
    correct_count = result["correct_count"]
    return update_patient_in_db(db, name, test_number, correct_count)


@app.post("/update-to-remember")
async def update_to_remember(
        name: str = Form(...),
        to_remember: str = Form(...),
        db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.name == name).first()

    if patient:
        patient.to_remember = to_remember
    else:
        patient = Patient(
            name=name,
            to_remember=to_remember,
            first_test=None,
            second_test=None,
            third_test=None,
            fourth_test=None,
            fifth_test=None,
            sixth_test=None,
            diagnosis=None
        )
        db.add(patient)

    db.commit()
    return {"name": name, "to_remember": to_remember}


@app.get("/get-gestures-by-name")
async def get_gestures_by_name(
        name: str,
        db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.name == name).first()

    if patient:
        return {"name": name, "to_remember": patient.to_remember}
    else:
        return {"error": "Patient not found"}


@app.post("/diagnosis")
async def update_diagnosis(
        name: str = Form(...),
        diagnosis: str = Form(...),
        db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.name == name).first()

    if patient:
        patient.diagnosis = diagnosis
    else:
        patient = Patient(
            name=name,
            diagnosis=diagnosis,
            first_test=None,
            second_test=None,
            third_test=None,
            fourth_test=None,
            fifth_test=None,
            sixth_test=None,
            to_remember=None
        )
        db.add(patient)

    db.commit()
    return {"name": name, "diagnosis": diagnosis}
