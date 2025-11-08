import React, { useState } from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";

// نمایش تک‌نظر
const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1">
    {/* نمایش ستاره‌ها */}
    <div className="flex items-center gap-1 mb-5">
      {[...Array(5)].map((_, index) => (
        <Image
          key={index}
          src="/images/icons/icon-star.svg"
          alt="ستاره"
          width={15}
          height={15}
        />
      ))}
    </div>

    {/* متن نظر */}
    <div className="mb-6">
      <p className={`text-dark ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {testimonial.review}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
      >
        {isExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
      </button>
    </div>

    {/* بخش اطلاعات نویسنده */}
    <a href="#" className="flex items-center gap-4">
      <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
        <Image
          src={testimonial.authorImg}
          alt={testimonial.authorName}
          className="w-12.5 h-12.5 rounded-full overflow-hidden"
          width={50}
          height={50}
        />
      </div>

      <div>
        <h3 className="font-medium text-dark">{testimonial.authorName}</h3>
        <p className="text-custom-sm">{testimonial.authorRole}</p>
      </div>
    </a>
  </div>
  );
};

export default SingleItem;
