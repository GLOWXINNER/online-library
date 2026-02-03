import os
import time
from pathlib import Path

from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, FSInputFile

from bot_app.api.client import LibraryApiClient, ApiError
from bot_app.fsm.admin_states import AdminAddBookFSM, AdminDeleteBookFSM
from bot_app.keyboards.main_menu import guest_menu_kb, user_menu_kb, cancel_kb, confirm_kb
from bot_app.storage.session_store import InMemorySessionStore

router = Router()


async def _ensure_admin(message: Message, session_store: InMemorySessionStore) -> bool:
    token = await session_store.get_token(message.from_user.id)
    if not token:
        await message.answer("🔐 Нужно войти.", reply_markup=guest_menu_kb())
        return False
    if not await session_store.is_admin(message.from_user.id):
        await message.answer("⛔ Недостаточно прав. Требуется роль admin.")
        return False
    return True


@router.message(F.text == "➕ Добавить книгу")
async def admin_add_book_start(message: Message, state: FSMContext, session_store: InMemorySessionStore) -> None:
    if not await _ensure_admin(message, session_store):
        return
    await state.clear()
    await state.set_state(AdminAddBookFSM.title)
    await message.answer("➕ Добавление книги\n\nВведите title:", reply_markup=cancel_kb())


@router.message(AdminAddBookFSM.title)
async def admin_add_book_title(message: Message, state: FSMContext) -> None:
    title = (message.text or "").strip()
    if len(title) < 2:
        await message.answer("Слишком короткий title. Введите title:")
        return
    await state.update_data(title=title)
    await state.set_state(AdminAddBookFSM.year)
    await message.answer("Введите year (например 2020):", reply_markup=cancel_kb())


@router.message(AdminAddBookFSM.year)
async def admin_add_book_year(message: Message, state: FSMContext) -> None:
    raw = (message.text or "").strip()
    if not raw.isdigit():
        await message.answer("Year должен быть числом (например 2020). Введите year:")
        return

    year = int(raw)
    if year < 0 or year > 2100:
        await message.answer("Year должен быть в диапазоне 0..2100. Введите year:")
        return

    await state.update_data(year=year)
    await state.set_state(AdminAddBookFSM.authors)
    await message.answer(
        "Введите authors (через запятую).\n"
        "Можно имена: 'Pushkin, Tolstoy'\n"
        "или IDs: '1,2,3'\n"
        "⚠️ Нужно минимум 1 автор.",
        reply_markup=cancel_kb(),
    )


@router.message(AdminAddBookFSM.authors)
async def admin_add_book_authors(message: Message, state: FSMContext) -> None:
    authors = (message.text or "").strip()
    parts = [p.strip() for p in authors.split(",") if p.strip()]
    if not parts:
        await message.answer("Нужно указать минимум 1 автора. Введите authors:")
        return
    await state.update_data(authors=authors)
    await state.set_state(AdminAddBookFSM.genres)
    await message.answer(
        "Введите genres (через запятую).\n"
        "Можно имена: 'Fantasy, Drama'\n"
        "или IDs: '1,2'\n"
        "⚠️ Нужно минимум 1 жанр.",
        reply_markup=cancel_kb(),
    )


@router.message(AdminAddBookFSM.genres)
async def admin_add_book_genres(message: Message, state: FSMContext) -> None:
    genres = (message.text or "").strip()
    parts = [p.strip() for p in genres.split(",") if p.strip()]
    if not parts:
        await message.answer("Нужно указать минимум 1 жанр. Введите genres:")
        return

    await state.update_data(genres=genres)
    await state.set_state(AdminAddBookFSM.confirm)

    data = await state.get_data()
    title = data["title"]
    year = data["year"]
    authors = data["authors"]

    await message.answer(
        "Проверьте данные:\n\n"
        f"Title: {title}\n"
        f"Year: {year}\n"
        f"Authors: {authors}\n"
        f"Genres: {genres}\n\n"
        "Подтвердите создание книги:",
        reply_markup=confirm_kb(),
    )


@router.message(AdminAddBookFSM.confirm, F.text == "✅ Да")
async def admin_add_book_confirm_yes(
    message: Message,
    state: FSMContext,
    api_client: LibraryApiClient,
    session_store: InMemorySessionStore,
) -> None:
    if not await _ensure_admin(message, session_store):
        await state.clear()
        return

    token = await session_store.get_token(message.from_user.id)
    data = await state.get_data()

    try:
        created = await api_client.create_book(
            token=token,
            title=data["title"],
            year=data["year"],
            authors_raw=data["authors"],
            genres_raw=data["genres"],
        )
    except ApiError as e:
        if e.status_code == 401:
            await session_store.clear(message.from_user.id)
            await message.answer("Сессия истекла. Войдите заново.", reply_markup=guest_menu_kb())
        elif e.status_code == 403:
            await message.answer("⛔ API отказало: требуется роль admin.")
        else:
            await message.answer(f"Не удалось создать книгу (status={e.status_code}).\nДетали: {e.payload}")
        await state.clear()
        return

    await state.clear()
    await message.answer(
        f"✅ Книга создана!\nID: {created.id}\nTitle: {created.title}",
        reply_markup=user_menu_kb(is_admin=True),
    )


@router.message(AdminAddBookFSM.confirm)
async def admin_add_book_confirm_other(message: Message) -> None:
    # Не очищаем state, чтобы пользователь не терял введённые данные
    await message.answer("Нажмите «✅ Да» для создания или «❌ Отмена».", reply_markup=confirm_kb())


@router.message(F.text == "🗑 Удалить книгу")
async def admin_delete_book_start(message: Message, state: FSMContext, session_store: InMemorySessionStore) -> None:
    if not await _ensure_admin(message, session_store):
        return
    await state.clear()
    await state.set_state(AdminDeleteBookFSM.book_id)
    await message.answer("🗑 Удаление книги\n\nВведите ID книги:", reply_markup=cancel_kb())


@router.message(AdminDeleteBookFSM.book_id)
async def admin_delete_book_do(
    message: Message,
    state: FSMContext,
    api_client: LibraryApiClient,
    session_store: InMemorySessionStore,
) -> None:
    if not await _ensure_admin(message, session_store):
        await state.clear()
        return

    raw = (message.text or "").strip()
    if not raw.isdigit():
        await message.answer("Введите числовой ID книги:")
        return

    token = await session_store.get_token(message.from_user.id)
    book_id = int(raw)

    try:
        await api_client.delete_book(token, book_id)
    except ApiError as e:
        if e.status_code == 404:
            await message.answer("Книга не найдена.")
        elif e.status_code == 401:
            await session_store.clear(message.from_user.id)
            await message.answer("Сессия истекла. Войдите заново.", reply_markup=guest_menu_kb())
        elif e.status_code == 403:
            await message.answer("⛔ API отказало: требуется роль admin.")
        else:
            await message.answer(f"Не удалось удалить книгу (status={e.status_code}).\nДетали: {e.payload}")
        await state.clear()
        return

    await state.clear()
    await message.answer(f"✅ Книга id={book_id} удалена.", reply_markup=user_menu_kb(is_admin=True))


@router.message(F.text == "⬇️ Экспорт CSV")
async def admin_export_csv(
    message: Message,
    api_client: LibraryApiClient,
    session_store: InMemorySessionStore,
) -> None:
    if not await _ensure_admin(message, session_store):
        return

    token = await session_store.get_token(message.from_user.id)

    try:
        csv_file = await api_client.export_books_csv(token)
    except ApiError as e:
        if e.status_code == 401:
            await session_store.clear(message.from_user.id)
            await message.answer("Сессия истекла. Войдите заново.", reply_markup=guest_menu_kb())
        elif e.status_code == 403:
            await message.answer("⛔ API отказало: требуется роль admin.")
        else:
            await message.answer(f"Не удалось экспортировать CSV (status={e.status_code}).\nДетали: {e.payload}")
        return

    exports_dir = Path("exports")
    exports_dir.mkdir(parents=True, exist_ok=True)

    ts = int(time.time())
    safe_name = f"{ts}_{os.path.basename(csv_file.filename)}"
    path = exports_dir / safe_name
    path.write_bytes(csv_file.content)

    await message.answer("Готово! Отправляю файл…")
    await message.answer_document(
        document=FSInputFile(path),
        caption="⬇️ Экспорт книг в CSV",
    )
