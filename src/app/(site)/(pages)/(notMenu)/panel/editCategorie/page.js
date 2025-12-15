"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // مودال‌ها
  const [viewModal, setViewModal] = useState(null); // دسته‌ای که در مودال نمایش داده می‌شود
  const [editModal, setEditModal] = useState(null); // دسته‌ای که در مودال ویرایش قرار دارد

  // فرم ویرایش
  const [editForm, setEditForm] = useState({ name: "", products: 0, img: "" });
  const [editPreview, setEditPreview] = useState(null);
  const [editNoImage, setEditNoImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // فیلتر/جستجو
  const [query, setQuery] = useState("");

  // ref برای جلوگیری از leak object URLs
  const prevObjectUrlRef = useRef(null);

  // fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categorys");
      if (!res.ok) throw new Error("Cannot fetch categories");
      const data = await res.json();
      setCategories(data.data);
    } catch (err) {
      console.error(err);
      Swal.fire("خطا", "مشکلی در دریافت دسته‌بندی‌ها پیش آمد.", "error");
    }
  };

  useEffect(() => {
   fetchCategories();

    // cleanup on unmount: revoke any created object URLs
    return () => {
      if (prevObjectUrlRef.current) {
        try { URL.revokeObjectURL(prevObjectUrlRef.current); } catch {}
      }
    };
  }, []);

  // ---------- VIEW MODAL ----------
  const openViewModal = (cat) => setViewModal(cat);
  const closeViewModal = () => setViewModal(null);

  // ---------- DELETE ----------
  const handleDelete = async (cat) => {
    const confirm = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: `دسته‌بندی "${cat.name}" حذف خواهد شد.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "انصراف",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/api/categorys/${cat._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");

      // update local state
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      Swal.fire("حذف شد", "دسته‌بندی با موفقیت حذف شد.", "success");
      await fetchCategories();

    } catch (err) {
      console.error(err);
      Swal.fire("خطا", "حذف موفق نبود. دوباره تلاش کنید.", "error");
    }
  };

  // ---------- EDIT ----------
  const openEditModal = (cat) => {
    setEditModal(cat);
    setEditForm({ name: cat.name || "", products: cat.products ?? 0, img: cat.img || "" });
    setEditPreview(cat.img || null);
    setEditNoImage(cat.img === "/images/notImg.png" || !cat.img);
  };

  const closeEditModal = () => {
    // revoke prev object url if any
    if (prevObjectUrlRef.current) {
      try { URL.revokeObjectURL(prevObjectUrlRef.current); } catch {}
      prevObjectUrlRef.current = null;
    }
    setEditModal(null);
    setEditForm({ name: "", products: 0, img: "" });
    setEditPreview(null);
    setEditNoImage(false);
    setSubmitting(false);
  };

  const handleEditInput = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // revoke previous object url
    if (prevObjectUrlRef.current) {
      try { URL.revokeObjectURL(prevObjectUrlRef.current); } catch {}
    }
    const url = URL.createObjectURL(file);
    prevObjectUrlRef.current = url;
    setEditPreview(url);
    setEditForm((p) => ({ ...p, img: url }));
    setEditNoImage(false);
  };

  const toggleEditNoImage = () => {
    setEditNoImage((v) => {
      const next = !v;
      if (next) {
        // set default image
        setEditPreview("/images/notImg.png");
        setEditForm((p) => ({ ...p, img: "/images/notImg.png" }));
      } else {
        setEditPreview(null);
        setEditForm((p) => ({ ...p, img: "" }));
      }
      return next;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || editForm.name.trim() === "") {
      Swal.fire("خطا", "نام دسته‌بندی الزامی است.", "error");
      return;
    }
    if (!editForm.img) {
      Swal.fire("خطا", "لطفا تصویر را انتخاب کنید یا گزینه بدون عکس را فعال کنید.", "error");
      return;
    }

    setSubmitting(true);

    try {
      // fetch categories for duplicate check
      const resAll = await fetch("http://localhost:3000/api/categorys");
      const allCats = await resAll.json();

      // duplicate name check (exclude current editing _id)
      const dup = allCats.data.find(
        (c) => c.name.toLowerCase() === editForm.name.trim().toLowerCase() && c._id !== editModal._id
      );
      if (dup) {
        Swal.fire("نام تکراری", "این نام قبلاً استفاده شده. یک نام دیگر انتخاب کنید.", "warning");
        setSubmitting(false);
        return;
      }

      // prepare updated object (we keep products the same)
      const updated = {
        ...editModal,
        name: editForm.name.trim(),
        products: Number(editForm.products) || 0,
        img: editForm.img,
      };

      // send PUT (یا PATCH بسته به API)
      const res = await fetch(`http://localhost:3000/api/categorys/${editModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("update failed");

      // update local state
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      Swal.fire("ذخیره شد", "تغییرات با موفقیت ذخیره شدند.", "success");
      closeEditModal();
    } catch (err) {
      console.error(err);
      Swal.fire("خطا", "مشکلی پیش آمد. دوباره تلاش کنید.", "error");
      setSubmitting(false);
    }
  };

  // filtered categories by query
const filtered = categories.filter((c) =>
  c?.name?.toLowerCase().includes(query.trim().toLowerCase())
);

  // ---------- small helper UI pieces ----------
  const ActionBtn = ({ onClick, children, className = "" }) => (
    <button
      onClick={onClick}
      className={
        "px-3 py-1 text-sm rounded-md border hover:shadow-sm transition " + className
      }
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-1">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">مدیریت دسته‌بندی‌ها</h1>
            <p className="text-sm text-meta-4 mt-1">اینجا می‌تونی دسته‌ها رو مشاهده، ویرایش یا حذف کنی.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              aria-label="جستجوی دسته‌بندی"
              placeholder="جستجو بر اساس نام..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-3 bg-white focus:ring-2 focus:ring-blue outline-none text-sm"
            />
            {/* اگر خواستی لینک به صفحه افزودن */}
            <Link
              href="/panel/addCategorie"
              className="px-4 py-2 rounded-lg bg-blue text-white text-sm shadow hover:bg-blue-dark transition"
            >
              افزودن دسته‌بندی جدید
            </Link>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length > 0 ? (
            filtered.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-2xl p-4 shadow-2 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border">
                    <img
                      src={cat.img || "/images/notImg.png"}
                      alt={cat.name || null}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-dark">{cat.name}</h3>
                    <p className="text-sm text-meta-4 mt-1">محصولات: {cat.products}</p>
                    <p className="text-xs text-gray-5 mt-3 line-clamp-2">
                      شناسه: {cat._id}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 justify-end">
                  <ActionBtn
                    onClick={() => openViewModal(cat)}
                    className="bg-white text-dark border-gray-3 hover:bg-gray-1"
                  >
                    نمایش
                  </ActionBtn>

                  <ActionBtn
                    onClick={() => openEditModal(cat)}
                    className="bg-blue text-white border-blue hover:bg-blue-dark"
                  >
                    ویرایش
                  </ActionBtn>

                  <ActionBtn
                    onClick={() => handleDelete(cat)}
                    className="bg-red text-white border-red hover:bg-red-dark"
                  >
                    حذف
                  </ActionBtn>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-1">
              <p className="text-sm text-gray-6">هیچ دسته‌بندی‌ای یافت نشد.</p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- VIEW MODAL ---------- */}
      {viewModal && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeViewModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-3 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeViewModal}
              className="absolute top-4 left-4 text-gray-500 hover:text-dark text-lg"
              aria-label="بستن"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 rounded-lg overflow-hidden border">
                <img
                  src={viewModal.img || "/images/notImg.png"}
                  alt={viewModal.name || null}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-dark mb-2">{viewModal.name}</h2>
                <p className="text-sm text-meta-4 mb-3">محصولات: {viewModal.products}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      closeViewModal();
                      openEditModal(viewModal);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue text-white"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => {
                      closeViewModal();
                      handleDelete(viewModal);
                    }}
                    className="px-4 py-2 rounded-lg bg-red text-white"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- EDIT MODAL ---------- */}
      {editModal && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl p-6 relative shadow-3 overflow-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeEditModal}
              className="absolute top-4 left-4 text-gray-500 hover:text-dark text-lg"
              aria-label="بستن"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-dark mb-4">ویرایش دسته‌بندی</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark mb-2">نام دسته‌بندی *</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInput}
                  className="w-full px-3 py-2 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue outline-none"
                  placeholder="مثلا: Desktop"
                />
              </div>

              <div>
                <label className="block text-sm text-dark mb-2">تعداد محصولات</label>
                <input
                  name="products"
                  value={editForm.products}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-gray-3 bg-gray-2 cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark">تصویر دسته‌بندی *</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editNoImage}
                      onChange={toggleEditNoImage}
                      className="w-4 h-4"
                    />
                    بدون عکس
                  </label>
                </div>

                {!editNoImage && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full text-sm"
                  />
                )}

                {editPreview && (
                  <div className="mt-3">
                    <img
                      src={editPreview || null}
                      alt="preview"
                      className="w-28 h-28 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg border hover:shadow-sm"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue text-white disabled:opacity-60"
                >
                  {submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
