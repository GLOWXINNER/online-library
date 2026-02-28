from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from bot_app.api.client import LibraryApiClient, ApiError
from bot_app.config import Settings
from bot_app.keyboards.main_menu import guest_menu_kb, user_menu_kb
from bot_app.storage.session_store import InMemorySessionStore

import ipaddress
import socket
from urllib.parse import urlparse

router = Router()


def _vite_like_urls(miniapp_url: str) -> str:
    p = urlparse(miniapp_url)
    scheme = p.scheme or "http"

    if p.port is not None:
        port = p.port
    else:
        port = 443 if scheme == "https" else 80

    path = p.path or "/"
    if not path.endswith("/"):
        path += "/"

    ips: set[str] = set()

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ips.add(s.getsockname()[0])
        s.close()
    except Exception:
        pass

    try:
        for ip in socket.gethostbyname_ex(socket.gethostname())[2]:
            ips.add(ip)
    except Exception:
        pass

    net_ips: list[str] = []
    for ip in sorted(ips):
        try:
            a = ipaddress.ip_address(ip)
        except ValueError:
            continue
        if a.version != 4 or a.is_loopback:
            continue
        net_ips.append(ip)

    lines = [f"➜  Local:   {scheme}://localhost:{port}{path}"]
    for ip in net_ips:
        lines.append(f"➜  Network: {scheme}://{ip}:{port}{path}")
    return "\n".join(lines)


def _append_links(text: str, miniapp_url: str | None) -> str:
    if not miniapp_url:
        return text
    return text + "\n\n" + _vite_like_urls(miniapp_url)


@router.message(CommandStart())
async def cmd_start(
    message: Message,
    api_client: LibraryApiClient,
    session_store: InMemorySessionStore,
    settings: Settings,
) -> None:
    user_id = message.from_user.id
    token = await session_store.get_token(user_id)

    miniapp_url = str(settings.miniapp_url) if settings.miniapp_url else None

    # Приветствие как было (одно сообщение)
    guest_text = (
        "Привет! Я бот онлайн-библиотеки.\n\n"
        "Гостю доступно: 📚 Книги.\n"
        "Для избранного и админ-меню нужно войти."
    )

    if not token:
        await message.answer(
            _append_links(guest_text, miniapp_url),
            reply_markup=guest_menu_kb(miniapp_url),
        )
        return

    try:
        role = await api_client.detect_role(token)
        await session_store.set_role(user_id, role)

        auth_text = f"Вы авторизованы. Роль: {role or 'не определена'}"
        await message.answer(
            _append_links(auth_text, miniapp_url),
            reply_markup=user_menu_kb(is_admin=(role == "admin"), miniapp_url=miniapp_url),
        )

    except ApiError as e:
        if e.status_code == 401:
            await session_store.clear(user_id)
            await message.answer(
                _append_links("Сессия истекла. Войдите заново.", miniapp_url),
                reply_markup=guest_menu_kb(miniapp_url),
            )
        else:
            is_admin = await session_store.is_admin(user_id)
            await message.answer(
                _append_links(f"⚠️ Не удалось обновить профиль (status={e.status_code}).", miniapp_url),
                reply_markup=user_menu_kb(is_admin=is_admin, miniapp_url=miniapp_url),
            )