from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo


def _is_https(url: str) -> bool:
    return url.startswith("https://")


def guest_menu_kb(miniapp_url: str | None = None) -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = []

    # Telegram WebApp-кнопка принимает ТОЛЬКО https://
    if miniapp_url and _is_https(miniapp_url):
        rows.append([KeyboardButton(text="WEB", web_app=WebAppInfo(url=miniapp_url))])

    rows.append([KeyboardButton(text="📚 Книги")])
    rows.append([KeyboardButton(text="🔑 Вход"), KeyboardButton(text="📝 Регистрация")])

    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        input_field_placeholder="Выберите действие",
    )


def user_menu_kb(is_admin: bool, miniapp_url: str | None = None) -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = []

    # Telegram WebApp-кнопка принимает ТОЛЬКО https://
    if miniapp_url and _is_https(miniapp_url):
        rows.append([KeyboardButton(text="WEB", web_app=WebAppInfo(url=miniapp_url))])

    rows.append([KeyboardButton(text="📚 Книги"), KeyboardButton(text="⭐ Избранное")])

    if is_admin:
        rows.append([KeyboardButton(text="🛠 Админ")])

    rows.append([KeyboardButton(text="🚪 Выйти")])

    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        input_field_placeholder="Меню",
    )


def admin_menu_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="➕ Добавить книгу")],
            [KeyboardButton(text="🗑 Удалить книгу")],
            [KeyboardButton(text="⬇️ Экспорт CSV")],
            [KeyboardButton(text="⬅️ Назад")],
        ],
        resize_keyboard=True,
        input_field_placeholder="Админ-меню",
    )


def cancel_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="❌ Отмена")]],
        resize_keyboard=True,
        input_field_placeholder="Отмена",
    )


def confirm_kb() -> ReplyKeyboardMarkup:
    # ВАЖНО: используем "✅ Да", потому что хендлер в admin.py будет ждать именно это
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="✅ Да")],
            [KeyboardButton(text="❌ Отмена")],
        ],
        resize_keyboard=True,
        input_field_placeholder="Подтверждение",
    )