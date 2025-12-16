import React from "react";

const Categories = ({ categories }) => {
  console.log(categories , 'categories 7888888888');
  
  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">دسته بندی ها </h2>
      </div>

     {
      categories.map(item=> (
         <div key={item.name} className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <button className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue">
            {item.name}
            <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
              {item.products}
            </span>
          </button>
        </div>
      </div>
      ))
     }
    </div>
  );
};

export default Categories;
