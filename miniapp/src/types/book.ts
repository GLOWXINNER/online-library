export type BookListItem = {
  id: number;
  title: string;
  year: number;
  authors: string[];
  genres: string[];
};

export type BookDetail = {
  id: number;
  title: string;
  description?: string | null;
  year: number;
  isbn?: string | null;
  authors: string[];
  genres: string[];
};

export type BookCreateRequest = {
  title: string;
  description?: string | null;
  year: number;
  isbn?: string | null;
  authors: string[]; // учебно: вводим именами
  genres: string[];
};
