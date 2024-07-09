from sqlalchemy import Column, Integer, String, SmallInteger

from app.dependencies.database.database import Base


class Patient(Base):
    __tablename__ = 'patients'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    gender = Column(String)
    age = Column(Integer)
    to_remember = Column(String)
    first_test = Column(SmallInteger)
    second_test = Column(SmallInteger)
    third_test = Column(SmallInteger)
    fourth_test = Column(SmallInteger)
    fifth_test = Column(SmallInteger)
    sixth_test = Column(SmallInteger)
    diagnosis = Column(String)
    moca = Column(String)
    recommendations = Column(String)