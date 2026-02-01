from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.schemas.auth import AuthRegisterRequest
from app.schemas.user import UserMeResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserMeResponse,
)
async def register(
    payload: AuthRegisterRequest,
    session: AsyncSession = Depends(get_session),
) -> UserMeResponse:
    service = AuthService(session)
    user = await service.register(email=payload.email, password=payload.password)

    if user is None:
        # попадёт в твой HTTPException handler -> {error, details}
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    return UserMeResponse.model_validate(user)
