"use client";
import Link from "next/link";

export default function Panels() {
  return (
    <section className="flex flex-col gap-4 bg-gray-100 p-8">
      <Link
        href="/panel/addProduct"
        className="block px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        افزودن محصول
      </Link>
      <Link
        href="/panel/editProduct"
        className="block px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        ویرایش محصول
      </Link>
    </section>
  );
}



