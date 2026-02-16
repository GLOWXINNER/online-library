from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from bot_app.api.client import LibraryApiClient, ApiError
from bot_app.config import Settings
from bot_app.keyboards.main_menu import guest_menu_kb, user_menu_kb
from bot_app.storage.session_store import InMemorySessionStore

router = Router()


@router.message(CommandStart())
async def cmd_start(
    message: Message,
    api_client: LibraryApiClient,
    session_store: InMemorySessionStore,
    settings: Settings,
) -> None:
    text = (
        "Привет! Я бот онлайн-библиотеки.\n\n"
        "Гостю доступно: 📚 Книги.\n"
        "Для избранного и админ-меню нужно войти."
    )

    user_id = message.from_user.id
    token = await session_store.get_token(user_id)

    miniapp_url = str(settings.miniapp_url) if settings.miniapp_url else None

    # Telegram в проде требует https. Если не https — кнопку WEB не показываем.
    if miniapp_url and not miniapp_url.startswith("https://"):
        miniapp_url = None

    if not token:
        await message.answer(text, reply_markup=guest_menu_kb(miniapp_url))
        if settings.miniapp_url and not str(settings.miniapp_url).startswith("https://"):
            await message.answer("⚠️ Для кнопки WEB нужен https:// URL (туннель/ngrok/cloudflared).")
        elif not settings.miniapp_url:
            await message.answer("⚠️ MINIAPP_URL не задан в .env — кнопка WEB скрыта.")
        return

    try:
        role = await api_client.detect_role(token)
        await session_store.set_role(user_id, role)
        await message.answer(
            f"Вы авторизованы. Роль: {role or 'не определена'}",
            reply_markup=user_menu_kb(is_admin=(role == 'admin'), miniapp_url=miniapp_url),
        )
    except ApiError as e:
        if e.status_code == 401:
            await session_store.clear(user_id)
            await message.answer("Сессия истекла. Войдите заново.", reply_markup=guest_menu_kb(miniapp_url))
        else:
            is_admin = await session_store.is_admin(user_id)
            await message.answer(
                f"⚠️ Не удалось обновить профиль (status={e.status_code}).",
                reply_markup=user_menu_kb(is_admin=is_admin, miniapp_url=miniapp_url),
            )
