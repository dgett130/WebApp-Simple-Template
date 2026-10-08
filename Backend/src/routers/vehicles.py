from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from auth.auth_handler import get_current_active_user
from database import get_db
from schemas import VehicleList, VehicleResponse, VehicleCreate
from models import User, Vehicle

router = APIRouter()

@router.get('/vehicles', response_model=VehicleList)
def list_vehicles(current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    vehicles = (
        db.query(Vehicle)
        .filter(Vehicle.owner_id == current_user.id)
        .order_by(Vehicle.id)
        .all()
    )
    return {"vehicles": vehicles}

@router.post('/vehicles', response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def add_vehicle(vehicle: VehicleCreate,
                current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    name = vehicle.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Il nome del veicolo non puo` essere vuoto.")
    db_vehicle = Vehicle(name=name, owner_id=current_user.id)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle