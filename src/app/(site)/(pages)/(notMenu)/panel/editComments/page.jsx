"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ===============================
// تنظیمات
// ===============================
const COMMENTS_URL = "/api/comments";

// ===============================
// Toast Helper
// ===============================
const toast = (title, icon = "success") =>
  Swal.fire({
    title,
    icon,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1600,
  });

// ===============================
// فرم افزودن / ویرایش
// ===============================
const CommentForm = ({ initial, onCancel, onSubmit }) => {
  const [review, setReview] = useState(initial?.review || "");
  const [authorName, setAuthorName] = useState(initial?.authorName || "");
  const [authorRole, setAuthorRole] = useState(initial?.authorRole || "");
  const [authorImg, setAuthorImg] = useState(
    initial?.authorImg || "/images/users/user-01.jpg"
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!review.trim())
      return toast("متن نظر را وارد کنید", "warning");
    if (!authorName.trim())
      return toast("نام نویسنده را وارد کنید", "warning");

    onSubmit({
      review: review.trim(),
      authorName: authorName.trim(),
      authorRole: authorRole.trim(),
      authorImg: authorImg.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-lg p-5 space-y-4"
      >
        <h3 className="font-bold text-lg">
          {initial ? "ویرایش نظر" : "افزودن نظر جدید"}
        </h3>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="متن نظر"
          rows={4}
          className="w-full border rounded-md p-2"
        />

        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="نام نویسنده"
          className="w-full border rounded-md p-2"
        />

        <input
          value={authorRole}
          onChange={(e) => setAuthorRole(e.target.value)}
          placeholder="سمت / نقش"
          className="w-full border rounded-md p-2"
        />

        <input
          value={authorImg}
          onChange={(e) => setAuthorImg(e.target.value)}
          placeholder="آدرس تصویر"
          className="w-full border rounded-md p-2 ltr"
        />

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue text-white rounded-md"
          >
            ذخیره
          </button>
        </div>
      </form>
    </div>
  );
};

// ===============================
// صفحه مدیریت نظرات
// ===============================
export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // دریافت نظرات
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(COMMENTS_URL);
      const data = await res.json();
      setComments(data.data || []);
    } catch {
      toast("خطا در دریافت نظرات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // افزودن
  const createComment = async (data) => {
    const res = await fetch(COMMENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
  };

  // ویرایش
  const updateComment = async (id, data) => {
    const res = await fetch(`${COMMENTS_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
  };

  // حذف
  const deleteComment = async (id) => {
    const confirm = await Swal.fire({
      title: "حذف نظر",
      text: "آیا مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله",
      cancelButtonText: "انصراف",
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${COMMENTS_URL}/${id}`, { method: "DELETE" });
    toast("حذف شد");
    fetchComments();
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateComment(editing._id, data);
        toast("ویرایش شد");
      } else {
        await createComment(data);
        toast("ثبت شد");
      }
      setShowForm(false);
      setEditing(null);
      fetchComments();
    } catch {
      toast("خطا رخ داد", "error");
    }
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold">مدیریت نظرات کاربران</h1>

        <div className="flex gap-2">
          <button
            onClick={fetchComments}
            className="border px-3 py-2 rounded-md"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue text-white px-3 py-2 rounded-md flex gap-1"
          >
            <PlusIcon className="h-5 w-5" />
            افزودن
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">در حال بارگذاری...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comments.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-lg shadow p-4 flex flex-col"
            >
              <div className="flex gap-3 items-center mb-3">
                <img
                  src={c.authorImg}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">{c.authorName}</div>
                  <div className="text-xs text-gray-500">
                    {c.authorRole}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 flex-1">{c.review}</p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditing(c);
                    setShowForm(true);
                  }}
                  className="border px-2 py-1 rounded-md"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={() => deleteComment(c._id)}
                  className="border px-2 py-1 rounded-md text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CommentForm
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}
