import json

from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from app.dependencies.database.database import get_db
from app.models.patient_model import Patient
from app.utils.ai_integration import classify_images_internal
from app.utils.db import update_patient_in_db
from app.utils.generate_recommendations import generate_recommendations

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
    return db.query(Patient).order_by(desc(Patient.id)).all()


@app.post("/classify-strict-db-1")
async def classify_strict_db(
        id: int = Form(...),
        test_number: int = Form(...),
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
        db: Session = Depends(get_db),
):
    gesture_names_list = gesture_names.split(',')
    total_count = 0

    if len(gesture_names_list) % 3 != 0 or len(images) % 3 != 0:
        return {"status": "error", "message": "Gesture names and images must be in multiples of 3"}

    for i in range(0, len(images), 3):
        batch_gesture_names = gesture_names_list[i:i + 3]
        batch_gesture_names_string = ",".join(batch_gesture_names)
        batch_images = images[i:i + 3]

        result = classify_images_internal(batch_gesture_names_string, batch_images, strict=True)
        correct_count = result["correct_count"]

        if correct_count > 0:
            total_count += 1

    update_patient_in_db(db, id, test_number, total_count)
    return {"status": "success"}


@app.post("/classify-not-strict-db-1")
async def classify_not_strict_db(
        id: int = Form(...),
        test_number: int = Form(...),
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
        db: Session = Depends(get_db),
):
    gesture_names_list = gesture_names.split(',')
    total_count = 0

    # Ensure that the lengths of gesture_names_list and images are multiples of 3
    if len(gesture_names_list) % 5 != 0 or len(images) % 5 != 0:
        return {"status": "error", "message": "Gesture names and images must be in multiples of 3"}

    for i in range(0, len(images), 5):
        batch_gesture_names = gesture_names_list[i:i + 5]
        batch_gesture_names_string = ",".join(batch_gesture_names)
        batch_images = images[i:i + 5]

        result = classify_images_internal(batch_gesture_names_string, batch_images, strict=True)
        correct_count = result["correct_count"]

        if correct_count > 0:
            total_count += 1

    update_patient_in_db(db, id, test_number, total_count)
    return {"status": "success"}


@app.post("/diagnosis")
async def create_diagnosis(
        name: str = Form(...),
        gender: str = Form(...),
        age: str = Form(...),
        moca: Optional[str] = Form(None),
        db: Session = Depends(get_db)
):
    try:
        new_patient = Patient(
            name=name,
            gender=gender,
            age=age,
            moca=moca,
            first_test=None,
            second_test=None,
            third_test=None,
            fourth_test=None,
            fifth_test=None,
            sixth_test=None,
            to_remember=None
        )
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)

        return {
            "id": new_patient.id,
            "name": name,
            "gender": gender,
            "age": age,
            "moca": moca
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/results/{id}")
def get_results(id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    diagnosis = ""
    if not patient:
        return "Пациент не найден"

    if patient:
        test_scores = [patient.first_test, patient.second_test, patient.third_test, patient.fourth_test]
        res = sum(score or 0 for score in test_scores)

        if 50 <= int(patient.age) <= 55:
            res -= 1
        elif 56 <= int(patient.age) <= 60:
            res -= 2
        elif 61 <= int(patient.age) <= 65:
            res -= 3
        elif int(patient.age) >= 66:
            res -= 4

        if res >= 17:
            diagnosis = "Очень хорошие когнитивные способности"
        elif 16 >= res >= 13:
            diagnosis = "Не наблюдается когнитивных снижений (здоров)"
        elif 12 >= res >= 10:
            diagnosis = "Легкое когнитивное снижение"
        elif 9 >= res >= 7:
            diagnosis = "Умеренное когнитивное снижение"
        elif 6 >= res >= 0:
            diagnosis = "Грубое когнитивное снижение"
        else:
            diagnosis = "Некорректный результат"

    if patient.recommendations:
        return [{
            "name": patient.name,
            "age": patient.age,
            "predicted_diagnosis": diagnosis,
        },
            json.loads(patient.recommendations)
        ]
    recommendations = generate_recommendations(diagnosis, patient.age)
    patient.recommendations = recommendations
    db.commit()
    return [{
        "name": patient.name,
        "age": patient.age,
        "predicted_diagnosis": diagnosis,
    },
        json.loads(patient.recommendations)
    ]

# @app.get("/lol")
# def change(db: Session = Depends(get_db)):
#     patients = db.query(Patient).all()
#
#     # Rearrange second_test, third_test, and fourth_test for each patient
#     for patient in patients:
#         second_test_value = patient.second_test
#         third_test_value = patient.third_test
#         fourth_test_value = patient.fourth_test
#
#         patient.second_test = third_test_value
#         patient.third_test = fourth_test_value
#         patient.fourth_test = second_test_value
#     db.commit()
#     return "Success"
