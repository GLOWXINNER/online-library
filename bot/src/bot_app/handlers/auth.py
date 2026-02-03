from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext

from bot_app.api.client import LibraryApiClient, ApiError
from bot_app.fsm.auth_states import RegisterFSM, LoginFSM
from bot_app.keyboards.main_menu import guest_menu_kb, user_menu_kb, cancel_kb
from bot_app.storage.session_store import InMemorySessionStore

router = Router()


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _looks_like_email(email: str) -> bool:
    return "@" in email and "." in email and len(email) >= 5


@router.message(F.text == "📝 Регистрация")
async def register_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(RegisterFSM.email)
    await message.answer("📝 Регистрация\n\nВведите email:", reply_markup=cancel_kb())


@router.message(RegisterFSM.email)
async def register_email(message: Message, state: FSMContext) -> None:
    email = _normalize_email(message.text or "")
    if not _looks_like_email(email):
        await message.answer("Похоже на неверный email. Попробуйте ещё раз:")
        return

    await state.update_data(email=email)
    await state.set_state(RegisterFSM.password)
    await message.answer("Введите пароль (минимум 6 символов):", reply_markup=cancel_kb())


@router.message(RegisterFSM.password)
async def register_password(message: Message, state: FSMContext, api_client: LibraryApiClient) -> None:
    password = (message.text or "").strip()
    if len(password) < 6:
        await message.answer("Пароль слишком короткий. Введите пароль (минимум 6 символов):")
        return

    data = await state.get_data()
    email = data["email"]

    try:
        await api_client.register(email=email, password=password)
    except ApiError as e:
        details = f"\n\nДетали: {e.payload}" if e.payload else ""
        await message.answer(f"Не удалось зарегистрироваться (status={e.status_code}).{details}", reply_markup=guest_menu_kb())
        await state.clear()
        return

    await state.clear()
    await message.answer("✅ Регистрация успешна!\n\nТеперь нажмите «🔑 Вход».", reply_markup=guest_menu_kb())


@router.message(F.text == "🔑 Вход")
async def login_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(LoginFSM.email)
    await message.answer("🔑 Вход\n\nВведите email:", reply_markup=cancel_kb())


@router.message(LoginFSM.email)
async def login_email(message: Message, state: FSMContext) -> None:
    email = _normalize_email(message.text or "")
    if not _looks_like_email(email):
        await message.answer("Похоже на неверный email. Попробуйте ещё раз:")
        return

    await state.update_data(email=email)
    await state.set_state(LoginFSM.password)
    await message.answer("Введите пароль:", reply_markup=cancel_kb())


@router.message(LoginFSM.password)
async def login_password(
    message: Message,
    state: FSMContext,
    api_client: LibraryApiClient,
    session_store: InMemorySessionStore,
) -> None:
    password = (message.text or "").strip()
    if not password:
        await message.answer("Пароль не может быть пустым. Введите пароль:")
        return

    data = await state.get_data()
    email = data["email"]

    try:
        token = await api_client.login(email=email, password=password)
    except ApiError as e:
        if e.status_code == 401:
            await message.answer("❌ Неверный email или пароль.", reply_markup=guest_menu_kb())
        else:
            details = f"\n\nДетали: {e.payload}" if e.payload else ""
            await message.answer(f"Не удалось выполнить вход (status={e.status_code}).{details}", reply_markup=guest_menu_kb())
        await state.clear()
        return

    user_id = message.from_user.id
    await session_store.set_token(user_id, token.access_token)

    # определяем роль (по /auth/me или fallback claim role)
    try:
        role = await api_client.detect_role(token.access_token)
    except Exception:
        role = None

    await session_store.set_role(user_id, role)

    await state.clear()
    await message.answer(
        f"✅ Вход выполнен!\nРоль: {role or 'не определена'}",
        reply_markup=user_menu_kb(is_admin=(role == "admin")),
    )


@router.message(F.text == "❌ Отмена")
async def cancel(message: Message, state: FSMContext, session_store: InMemorySessionStore) -> None:
    await state.clear()
    role = await session_store.get_role(message.from_user.id)
    token = await session_store.get_token(message.from_user.id)
    if token:
        await message.answer("Отменено.", reply_markup=user_menu_kb(is_admin=(role == "admin")))
    else:
        await message.answer("Отменено.", reply_markup=guest_menu_kb())


@router.message(F.text == "🚪 Выйти")
async def logout(message: Message, session_store: InMemorySessionStore) -> None:
    await session_store.clear(message.from_user.id)
    await message.answer("Вы вышли из аккаунта.", reply_markup=guest_menu_kb())
