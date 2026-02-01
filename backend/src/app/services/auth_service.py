from __future__ import annotations

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.repositories.users_repo import UsersRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.users_repo = UsersRepository(session)

    async def register(self, *, email: str, password: str):
        # нормализация (на всякий)
        email_norm = email.strip().lower()

        existing = await self.users_repo.get_by_email(email_norm)
        if existing:
            return None  # сигнал "занято"

        password_hash = pwd_context.hash(password)

        try:
            user = await self.users_repo.create(email=email_norm, password_hash=password_hash)
        except IntegrityError:
            # на случай гонки (если два запроса одновременно)
            return None

        return user
