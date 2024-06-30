from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.patient_model import Patient


def update_patient_in_db(db: Session, name: str, test_number: int, correct_count: int):
    patient = db.query(Patient).filter(Patient.name == name).first()

    if patient:
        if test_number == 1:
            patient.first_test = correct_count
        elif test_number == 2:
            patient.second_test = correct_count
        elif test_number == 3:
            patient.third_test = correct_count
        elif test_number == 4:
            patient.fourth_test = correct_count
        elif test_number == 5:
            patient.fifth_test = correct_count
        elif test_number == 6:
            patient.sixth_test = correct_count
        else:
            raise HTTPException(status_code=404, detail=f"Test number {test_number} not found.")
    else:
        patient = Patient(
            name=name,
            first_test=correct_count if test_number == 1 else None,
            second_test=correct_count if test_number == 2 else None,
            third_test=correct_count if test_number == 3 else None,
            fourth_test=correct_count if test_number == 4 else None,
            fifth_test=correct_count if test_number == 5 else None,
            sixth_test=correct_count if test_number == 6 else None,
        )
        db.add(patient)

    db.commit()
    return {"name": name, "test_number": test_number, "correct_count": correct_count}
