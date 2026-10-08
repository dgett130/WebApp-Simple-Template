from typing import List

from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserCreate(BaseModel):
    email: str
    password: str
    username: str

class UserResponse(BaseModel):
    username: str
    email: str | None = None

class UserInDB(BaseModel):
    hashed_password: str

class VehicleCreate(BaseModel):
    name: str

class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str

class VehicleList(BaseModel):
    vehicles: List[VehicleResponse]