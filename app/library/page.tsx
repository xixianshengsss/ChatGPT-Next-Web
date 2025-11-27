"use client";

import { useMemo, useState } from "react";

import styles from "./library.module.scss";

type BookStatus = "available" | "borrowed";

type BookRecord = {
  id: number;
  title: string;
  author: string;
  year?: string;
  status: BookStatus;
  notes?: string;
};

const statusLabel: Record<BookStatus, string> = {
  available: "在馆",
  borrowed: "已借出",
};

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "available", label: "在馆" },
  { value: "borrowed", label: "已借出" },
];

const defaultForm = {
  title: "",
  author: "",
  year: "",
  status: "available" as BookStatus,
  notes: "",
};

export default function LibraryPage() {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ ...defaultForm });
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredBooks = useMemo(() => {
    const keyword = filter.trim().toLowerCase();

    return books.filter((book) => {
      if (!keyword) return true;

      return [book.title, book.author, book.notes]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword));
    });
  }, [books, filter]);

  const summary = useMemo(() => {
    const total = books.length;
    const borrowed = books.filter((book) => book.status === "borrowed").length;
    return { total, borrowed, available: total - borrowed };
  }, [books]);

  const resetForm = () => {
    setForm({ ...defaultForm });
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.author.trim()) {
      return;
    }

    setBooks((prev) => {
      if (editingId !== null) {
        return prev.map((book) =>
          book.id === editingId ? { ...book, ...form, id: book.id } : book,
        );
      }

      return [
        ...prev,
        {
          ...form,
          id: prev.length ? Math.max(...prev.map((b) => b.id)) + 1 : 1,
        },
      ];
    });

    resetForm();
  };

  const handleEdit = (book: BookRecord) => {
    setForm({
      title: book.title,
      author: book.author,
      year: book.year ?? "",
      status: book.status,
      notes: book.notes ?? "",
    });
    setEditingId(book.id);
  };

  const handleDelete = (id: number) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const toggleStatus = (id: number) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? {
              ...book,
              status: book.status === "available" ? "borrowed" : "available",
            }
          : book,
      ),
    );
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>示例应用</p>
          <h1>图书管理系统</h1>
          <p className={styles.lead}>
            在本地记录馆藏、借阅状态与备忘信息，支持查询、编辑和删除操作。
          </p>
        </div>
        <div className={styles.summary}>
          <div>
            <span className={styles.summaryLabel}>全部</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span className={styles.summaryLabel}>在馆</span>
            <strong>{summary.available}</strong>
          </div>
          <div>
            <span className={styles.summaryLabel}>已借出</span>
            <strong>{summary.borrowed}</strong>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHeader}>
          <div>
            <h2>{editingId ? "编辑图书" : "新增图书"}</h2>
            <p>标题与作者为必填项，其他字段可选。</p>
          </div>
          {editingId !== null && (
            <button type="button" className={styles.secondary} onClick={resetForm}>
              取消编辑
            </button>
          )}
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>书名*</span>
            <input
              name="title"
              placeholder="如：《人类简史》"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </label>
          <label className={styles.field}>
            <span>作者*</span>
            <input
              name="author"
              placeholder="如：尤瓦尔·赫拉利"
              value={form.author}
              onChange={(event) => setForm({ ...form, author: event.target.value })}
              required
            />
          </label>
          <label className={styles.field}>
            <span>出版年份</span>
            <input
              name="year"
              placeholder="如：2014"
              value={form.year}
              onChange={(event) => setForm({ ...form, year: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>状态</span>
            <select
              name="status"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as BookStatus })
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>备注</span>
            <textarea
              name="notes"
              placeholder="借阅人、存放位置等"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </label>
          <div className={styles.actions}>
            <button type="submit">{editingId ? "保存修改" : "添加图书"}</button>
            <button type="button" className={styles.secondary} onClick={resetForm}>
              清空
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHeader}>
          <div>
            <h2>馆藏列表</h2>
            <p>可根据关键字筛选并进行借出、编辑或删除。</p>
          </div>
          <input
            className={styles.search}
            type="search"
            placeholder="搜索书名、作者或备注"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </header>

        {filteredBooks.length === 0 ? (
          <p className={styles.empty}>暂无数据，请先添加图书。</p>
        ) : (
          <ul className={styles.list}>
            {filteredBooks.map((book) => (
              <li key={book.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.cardEyebrow}>{statusLabel[book.status]}</p>
                    <h3>
                      {book.title}
                      {book.year ? <span className={styles.year}>（{book.year}）</span> : null}
                    </h3>
                    <p className={styles.author}>{book.author}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => toggleStatus(book.id)}
                    >
                      {book.status === "available" ? "借出" : "归还"}
                    </button>
                    <button type="button" onClick={() => handleEdit(book)}>
                      编辑
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      onClick={() => handleDelete(book.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
                {book.notes ? <p className={styles.notes}>{book.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
