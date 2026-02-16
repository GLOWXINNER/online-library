from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo


def miniapp_inline_kb(url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📱 Открыть Mini App",
                    web_app=WebAppInfo(url=url),
                )
            ]
        ]
    )
