from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


def guest_menu_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📚 Книги")],
            [KeyboardButton(text="📝 Регистрация"), KeyboardButton(text="🔑 Вход")],
        ],
        resize_keyboard=True,
        input_field_placeholder="Выберите действие…",
    )


def user_menu_kb(is_admin: bool = False) -> ReplyKeyboardMarkup:
    rows = [
        [KeyboardButton(text="📚 Книги")],
        [KeyboardButton(text="⭐ Избранное")],
    ]
    if is_admin:
        rows.extend(
            [
                [KeyboardButton(text="➕ Добавить книгу"), KeyboardButton(text="🗑 Удалить книгу")],
                [KeyboardButton(text="⬇️ Экспорт CSV")],
            ]
        )
    rows.append([KeyboardButton(text="🚪 Выйти")])

    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        input_field_placeholder="Выберите действие…",
    )


def cancel_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="❌ Отмена")]],
        resize_keyboard=True,
        input_field_placeholder="Можно отменить…",
    )


def confirm_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="✅ Да"), KeyboardButton(text="❌ Отмена")]],
        resize_keyboard=True,
        input_field_placeholder="Подтвердите действие…",
    )
