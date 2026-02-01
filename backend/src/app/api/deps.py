from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_session
from app.models.user import User, UserRole


async def get_current_user(
    session: AsyncSession = Depends(get_session),
    x_user_id: int | None = Header(default=None, alias="X-User-Id"),
) -> User:
    """
    DEV-зависимость: пользователь определяется заголовком X-User-Id.
    Позже заменим на JWT (Authorization: Bearer ...).
    """
    if x_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id header (dev auth).",
        )

    res = await session.execute(select(User).where(User.id == x_user_id))
    user = res.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for given X-User-Id.",
        )
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin only",
        )
    return current_user
