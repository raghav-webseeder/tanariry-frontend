import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Download, Plus, Search, Home, Edit, Trash } from "lucide-react";
import { useCategoryStore } from "../store/CategoryStore";
import { toast } from "react-toastify";

const BreadcrumbNav = () => (
  <div className="flex items-center text-gray-500 mb-3 md:mb-4 text-xs sm:text-sm">
    <Link to="/catalogue" className="flex items-center hover:text-[#293a90]">
      <Home size={14} className="mr-1" />
      <span>Catalogue</span>
    </Link>
    <span className="mx-2">/</span>
    <span>Categories</span>
  </div>
);

// Row Component
const Row = ({ item, onDelete, onCategoryClick }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="py-2 px-4">
      <div
        className="text-xs font-medium text-[#293a90] cursor-pointer hover:underline"
        onClick={() => onCategoryClick(item._id)}
      >
        {item.name || "Unnamed"}
      </div>
    </td>
    <td className="py-2 px-4">
      <span className="text-xs text-gray-600">
        {item.subCategories && item.subCategories.length > 0
          ? item.subCategories
            .map((sc) => `${sc.name}`)
            .join(", ")
          : "None"}
      </span>
    </td>
    <td className="py-2 px-4 flex gap-2 items-center">
      <Edit
        onClick={() => onCategoryClick(item._id)}
        className="p-1 text-[#293a90] hover:bg-[#293a90]/10 rounded cursor-pointer"
        size={20}
        title="Edit"
      />
      <Trash
        onClick={() => onDelete(item._id)}
        className="p-1 text-[#eb0082] hover:bg-[#eb0082]/10 rounded cursor-pointer"
        size={20}
        title="Delete"
      />
    </td>
  </tr>
);

// Main Categories Component
const CategoriesPage = () => {
  const navigate = useNavigate();
  const { fetchCategories, deleteCategory } = useCategoryStore();

  //  Initialize as empty array
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch categories
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCategories();

      console.log("Fetch Categories Response:", response); // Debug

      //  Handle different response structures
      let categoriesData = [];

      if (Array.isArray(response)) {
        // If response is directly an array
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // If response has data property with array
        categoriesData = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        // If response has categories property
        categoriesData = response.categories;
      }

      setCategories(categoriesData);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      setError(err.message || "Failed to fetch categories");
      toast.error(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  //  Filter categories - ensure categories is array
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((category) => {
      const categoryName = category.name || "";
      const matchesSearch =
        categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
        (category.subCategories &&
          Array.isArray(category.subCategories) &&
          category.subCategories.some((sc) => {
            const scName = sc.name || sc || "";
            return (
              scName.toLowerCase().includes(searchText.toLowerCase())
            );
          }));
      return matchesSearch;
    })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Export functionality
  const handleExport = (format = "csv") => {
    const headers = ["Category Name", "Subcategories"];
    const exportData =
      filteredCategories.length > 0 ? filteredCategories : categories;
    const dataRows = exportData.map((category) => [
      category.name || "Unnamed",
      category.subCategories && Array.isArray(category.subCategories)
        ? category.subCategories
          .map((sc) => `${sc.name}`)
          .join(", ")
        : "None",
    ]);

    let content, mimeType, fileName;
    if (format === "csv") {
      content = [headers, ...dataRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");
      mimeType = "text/csv";
      fileName = `categories-${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      content = [headers, ...dataRows].map((row) => row.join("\t")).join("\n");
      mimeType = "text/tab-separated-values";
      fileName = `categories-${new Date().toISOString().split("T")[0]}.xls`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    setLoading(true);
    try {
      await deleteCategory(id);
      setCategories(categories.filter((cat) => cat._id !== id));
      toast.success("Category removed successfully");
    } catch (err) {
      setError(err.message || "Failed to delete category");
      toast.error(err.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (id) => {
    navigate(`/catalogue/categories/${id}`);
  };

  const handleAddNew = () => {
    navigate("/catalogue/categories/addcategory");
  };

  //  Stats - ensure categories is array
  const totalCategories = Array.isArray(categories) ? categories.length : 0;
  const totalSubCategories = Array.isArray(categories)
    ? categories.reduce(
      (acc, c) =>
        acc +
        (c.subCategories && Array.isArray(c.subCategories)
          ? c.subCategories.length
          : 0),
      0
    )
    : 0;

  // Clear filters
  const handleClearFilters = () => {
    setSearchText("");
    setCurrentPage(1);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#293a90]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-end gap-2 mb-4 py-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-[#293a90] hover:bg-[#293a90]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/*  Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Total Categories
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {totalCategories.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-[#293a90]/10">
                <Users className="h-4 w-4 text-[#293a90]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Total Subcategories
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {totalSubCategories.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-green-50">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 w-full">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search categories, subcategory names, or labels..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#293a90] focus:border-[#293a90] text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible w-full">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategories
                  </th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!loading && paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <Row
                      key={category._id}
                      item={category}
                      onDelete={handleDelete}
                      onCategoryClick={handleCategoryClick}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <span className="text-xs">No categories found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between w-full">
              <div className="text-xs text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredCategories.length)}{" "}
                of {filteredCategories.length} results
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 text-xs rounded ${currentPage === page
                      ? "bg-[#293a90] text-white border border-[#293a90]"
                      : "border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
