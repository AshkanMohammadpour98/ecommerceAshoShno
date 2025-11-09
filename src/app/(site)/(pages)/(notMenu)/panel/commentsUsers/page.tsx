"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// اگر در محیط‌های مختلف اجرا می‌کنی، بهتره از env استفاده کنی
const API_URL =
  process.env.NEXT_PUBLIC_COMMENTS_API_URL || "http://localhost:3001/commentsUsersData";

type CommentItem = {
  id?: number | string; // برای ویرایش/حذف ضروری است
  review: string;
  authorName: string;
  authorImg: string;
  authorRole: string;
};

const formatFa = (s: string | number) =>
  new Intl.NumberFormat("fa-IR").format(Number(s || 0));

const shorten = (txt: string, max = 140) =>
  txt?.length > max ? `${txt.slice(0, max)}…` : txt;

const CommentsPage: React.FC = () => {
  const [data, setData] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");

  const [editing, setEditing] = useState<CommentItem | null>(null);
  const [deleting, setDeleting] = useState<CommentItem | null>(null);

  const [busySave, setBusySave] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`خطای سرور: ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("داده دریافتی آرایه نیست.");
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "بروز خطا در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const authors = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => d.authorName && set.add(d.authorName));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();
    return data.filter((item) => {
      const passAuthor = authorFilter === "all" || item.authorName === authorFilter;
      const inText =
        !qNorm ||
        item.review?.toLowerCase().includes(qNorm) ||
        item.authorName?.toLowerCase().includes(qNorm) ||
        item.authorRole?.toLowerCase().includes(qNorm);
      return passAuthor && inText;
    });
  }, [data, q, authorFilter]);

  const onOpenEdit = (item: CommentItem) => setEditing(item);
  const onCloseEdit = () => setEditing(null);

  const onOpenDelete = (item: CommentItem) => setDeleting(item);
  const onCloseDelete = () => setDeleting(null);

  const handleSave = async (payload: CommentItem) => {
    if (!payload.id) {
      alert("برای ویرایش، فیلد id لازم است.");
      return;
    }
    setBusySave(true);

    // Optimistic update
    const prev = [...data];
    setData((d) => d.map((x) => (x.id === payload.id ? { ...x, ...payload } : x)));

    try {
      const res = await fetch(`${API_URL}/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`ویرایش ناموفق: ${res.status}`);
      onCloseEdit();
    } catch (e: any) {
      // revert
      setData(prev);
      alert(e?.message || "خطا در ذخیره تغییرات");
    } finally {
      setBusySave(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting?.id) {
      alert("برای حذف، فیلد id لازم است.");
      return;
    }
    setBusyDelete(true);

    // Optimistic remove
    const prev = [...data];
    setData((d) => d.filter((x) => x.id !== deleting.id));

    try {
      const res = await fetch(`${API_URL}/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`حذف ناموفق: ${res.status}`);
      onCloseDelete();
    } catch (e: any) {
      setData(prev);
      alert(e?.message || "خطا در حذف آیتم");
    } finally {
      setBusyDelete(false);
    }
  };

  return (
    <main dir="rtl" className="bg-gray-2 min-h-screen py-10">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-dark text-2xl font-semibold">مدیریت نظرات</h1>
            <p className="text-body text-custom-sm mt-1">
              نمایش، جستجو، ویرایش و حذف نظرات نویسندگان
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-3 px-3.5 py-2 text-dark hover:bg-gray-1 transition-colors"
              title="بروزرسانی"
            >
              <ArrowPathIcon className="w-5 h-5 text-blue" />
              بروزرسانی
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-4" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو در متن نظر، نام یا نقش نویسنده..."
                className="w-full pr-3 pl-10 py-2.5 rounded-md border border-gray-3 bg-white text-dark placeholder:text-dark-5 focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute left-10 top-1/2 -translate-y-1/2 text-dark-4 hover:text-dark"
                  aria-label="پاک کردن جستجو"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-md border border-gray-3 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-blue/30"
            >
              <option value="all">همه نویسنده‌ها</option>
              {authors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[10px] bg-white shadow-2 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-2" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-2 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-2 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-2 rounded w-11/12" />
                  <div className="h-3 bg-gray-2 rounded w-10/12" />
                  <div className="h-3 bg-gray-2 rounded w-8/12" />
                </div>
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="bg-red-light-6 border border-red-light-4 rounded-md p-4 text-red">
            <p className="mb-3">خطا در دریافت داده‌ها: {err}</p>
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 rounded-md bg-blue text-white px-4 py-2 hover:bg-blue-dark transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[10px] shadow-2 p-8 text-center">
            <p className="text-dark font-medium">موردی یافت نشد</p>
            <p className="text-dark-4 text-custom-sm mt-1">
              عبارت جستجو یا فیلتر نویسنده را تغییر دهید.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[10px] shadow-2 overflow-hidden">
              <div className="grid grid-cols-[2fr_1.2fr_3fr_120px] gap-0 border-b border-gray-3 px-5 py-4 text-dark font-medium">
                <div>نویسنده</div>
                <div>نقش</div>
                <div>متن نظر</div>
                <div className="text-left">عملیات</div>
              </div>

              <ul className="divide-y divide-gray-3">
                {filtered.map((item) => (
                  <li
                    key={item.id ?? `${item.authorName}-${item.review.slice(0, 10)}`}
                    className="grid grid-cols-[2fr_1.2fr_3fr_120px] items-center px-5 py-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-2 flex items-center justify-center shrink-0">
                        {item.authorImg ? (
                          <Image
                            src={item.authorImg || null}
                            alt={item.authorName || null}
                            width={44}
                            height={44}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-dark-4 text-2xs">بدون تصویر</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-dark truncate">{item.authorName || "—"}</p>
                        <p className="text-dark-4 text-custom-xs truncate">
                          {item.authorImg?.replace("/images/users/", "") || ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-dark">{item.authorRole || "—"}</div>

                    <div className="text-body text-custom-sm">
                      {shorten(item.review || "")}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenEdit(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-3 px-2.5 py-1.5 text-dark hover:bg-gray-1 transition-colors"
                        title="ویرایش"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-blue" />
                        ویرایش
                      </button>
                      <button
                        onClick={() => onOpenDelete(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-light-4 text-red px-2.5 py-1.5 hover:bg-red-light-6 transition-colors"
                        title="حذف"
                      >
                        <TrashIcon className="w-5 h-5" />
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id ?? `${item.authorName}-${item.review.slice(0, 10)}`}
                  className="bg-white rounded-[10px] shadow-2 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-2 flex items-center justify-center">
                      {item.authorImg ? (
                        <Image
                          src={item.authorImg || null}
                          alt={item.authorName || null}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-dark-4 text-2xs">بدون تصویر</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-dark font-medium truncate">
                        {item.authorName || "—"}
                      </p>
                      <p className="text-dark-4 text-custom-xs">{item.authorRole || "—"}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-body text-custom-sm">{shorten(item.review || "", 180)}</p>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenEdit(item)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-3 px-3 py-1.5 text-dark hover:bg-gray-1 transition-colors"
                      title="ویرایش"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-blue" />
                      ویرایش
                    </button>
                    <button
                      onClick={() => onOpenDelete(item)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-light-4 text-red px-3 py-1.5 hover:bg-red-light-6 transition-colors"
                      title="حذف"
                    >
                      <TrashIcon className="w-5 h-5" />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editing && (
          <EditModal
            item={editing}
            onClose={onCloseEdit}
            onSave={handleSave}
            busy={busySave}
          />
        )}

        {/* Delete Confirm */}
        {deleting && (
          <ConfirmDelete
            item={deleting}
            onCancel={onCloseDelete}
            onConfirm={handleDelete}
            busy={busyDelete}
          />
        )}
      </div>
    </main>
  );
};

export default CommentsPage;

/* ---------- Components: EditModal & ConfirmDelete ---------- */

function EditModal({
  item,
  onClose,
  onSave,
  busy,
}: {
  item: CommentItem;
  onClose: () => void;
  onSave: (payload: CommentItem) => void;
  busy: boolean;
}) {
  const [form, setForm] = useState<CommentItem>(item);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validate = () => {
    const e: any = {};
    if (!form.authorName?.trim()) e.authorName = "نام نویسنده را وارد کنید.";
    if (!form.review?.trim()) e.review = "متن نظر را وارد کنید.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[640px] bg-white rounded-[10px] shadow-3 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-dark text-lg font-medium">ویرایش نظر</h3>
          <button
            onClick={onClose}
            className="text-dark-4 hover:text-dark p-1 rounded-md"
            aria-label="بستن"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4" dir="rtl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-custom-xs text-dark-4 mb-1">نام نویسنده</label>
              <input
                value={form.authorName || ""}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className={`w-full rounded-md border ${
                  errors.authorName ? "border-red" : "border-gray-3"
                } bg-white px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-blue/30`}
              />
              {errors.authorName && (
                <p className="text-red text-2xs mt-1">{errors.authorName}</p>
              )}
            </div>

            <div>
              <label className="block text-custom-xs text-dark-4 mb-1">نقش نویسنده</label>
              <input
                value={form.authorRole || ""}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                className="w-full rounded-md border border-gray-3 bg-white px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-custom-xs text-dark-4 mb-1">آدرس تصویر</label>
            <input
              value={form.authorImg || ""}
              onChange={(e) => setForm({ ...form, authorImg: e.target.value })}
              dir="ltr"
              placeholder="/images/users/user-01.jpg"
              className="w-full rounded-md border border-gray-3 bg-white px-3 py-2 text-dark placeholder:text-dark-5 focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
          </div>

          <div>
            <label className="block text-custom-xs text-dark-4 mb-1">متن نظر</label>
            <textarea
              value={form.review || ""}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              rows={5}
              className={`w-full rounded-md border ${
                errors.review ? "border-red" : "border-gray-3"
              } bg-white px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-blue/30`}
            />
            {errors.review && <p className="text-red text-2xs mt-1">{errors.review}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-3 px-4 py-2 text-dark hover:bg-gray-1 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-blue text-white px-5 py-2 font-medium hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDelete({
  item,
  onCancel,
  onConfirm,
  busy,
}: {
  item: CommentItem;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[480px] bg-white rounded-[10px] shadow-3 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-light-6 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red" />
          </div>
          <div className="flex-1">
            <h4 className="text-dark font-medium">حذف نظر</h4>
            <p className="text-body text-custom-sm mt-1">
              آیا از حذف نظر «{item.authorName || "بدون نام"}» مطمئن هستید؟ این عمل قابل
              بازگشت نیست.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-3 px-4 py-2 text-dark hover:bg-gray-1 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-red text-white px-4 py-2 hover:bg-red-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "در حال حذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}