from pydantic import Field, field_validator

from app.schemas.base import BaseSchema


class BookListItemResponse(BaseSchema):
    id: int
    title: str
    year: int
    authors: list[str]
    genres: list[str]


class BookDetailResponse(BaseSchema):
    id: int
    title: str
    description: str | None = None
    year: int
    isbn: str | None = None
    authors: list[str]
    genres: list[str]


class BookCreateRequest(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    year: int = Field(ge=0, le=2100)
    isbn: str | None = Field(default=None, max_length=32)

    # В MVP удобнее принимать имена, чтобы создать книгу одним запросом
    authors: list[str] = Field(min_length=1)
    genres: list[str] = Field(min_length=1)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title must not be empty")
        return v

    @field_validator("isbn")
    @classmethod
    def normalize_isbn(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v = v.strip()
        return v or None

    @field_validator("authors", "genres")
    @classmethod
    def normalize_list_names(cls, v: list[str]) -> list[str]:
        cleaned: list[str] = []
        for item in v:
            item = item.strip()
            if not item:
                continue
            if item not in cleaned:
                cleaned.append(item)
        if not cleaned:
            raise ValueError("list must contain at least one non-empty value")
        return cleaned
