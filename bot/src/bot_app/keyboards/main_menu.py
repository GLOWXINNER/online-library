from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo


def guest_menu_kb(miniapp_url: str | None = None) -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = []

    if miniapp_url:
        rows.append([KeyboardButton(text="WEB", web_app=WebAppInfo(url=miniapp_url))])

    rows.append([KeyboardButton(text="📚 Книги")])
    rows.append([KeyboardButton(text="🔐 Войти"), KeyboardButton(text="🆕 Регистрация")])

    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        input_field_placeholder="Выберите действие",
    )


def user_menu_kb(is_admin: bool, miniapp_url: str | None = None) -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = []

    if miniapp_url:
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


def cancel_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="❌ Отмена")]],
        resize_keyboard=True,
        input_field_placeholder="Отмена",
    )


def confirm_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="✅ Подтвердить")],
            [KeyboardButton(text="❌ Отмена")],
        ],
        resize_keyboard=True,
        input_field_placeholder="Подтверждение",
    )
