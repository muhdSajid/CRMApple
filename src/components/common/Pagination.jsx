import React, { useState } from "react";

const PaginationComponant = ({ totalPages = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPages = [1, 2, 3, 4];
      const endPage = totalPages;

      if (currentPage <= 3) {
        pages.push(...startPages, "...", endPage);
      } else if (currentPage >= endPage - 2) {
        pages.push(1, "...", endPage - 3, endPage - 2, endPage - 1, endPage);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", endPage);
      }
    }

    return pages;
  };

  const changePage = (page) => {
    if (page === "..." || page === currentPage) return;
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex justify-end space-x-1 pt-5">
      <button
        className={`px-3 py-1 rounded-md text-sm ${
          currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
        }`}
        onClick={goToPrevious}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            page === currentPage
              ? "bg-sky-900 text-white"
              : page === "..."
              ? "cursor-default"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => changePage(page)}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button
        className={`px-3 py-1 rounded-md text-sm ${
          currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-200 bg-gray-100"
        }`}
        onClick={goToNext}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationComponant;
