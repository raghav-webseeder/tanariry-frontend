import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search,
  Download,
  RefreshCw,
  ShoppingBag,
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import useOrderStore from "../../store/useOrderStore";

const OrdersTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    fetchOrders,
    changeOrderStatus,
    fetchOrderSummary,
    deleteOrder,
    orders,
    summary,
    loading,
    error,
  } = useOrderStore();

  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ✅ FIXED: Load orders on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchOrders(1, 20), fetchOrderSummary()]);
      } catch (err) {
        toast.error("Failed to fetch orders");
      }
    };
    loadData();
  }, [fetchOrders, fetchOrderSummary]);

  // Handle store errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // ✅ FIXED: Date handling - Safe date parsing
  const mappedData = orders.map((order) => ({
    key: order._id,
    id: order._id,
    date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A",
    rawDate: order.createdAt,
    customer:
      `${order.customerId?.firstName || ""} ${
        order.customerId?.lastName || ""
      }`.trim() || "N/A",
    orderStatus: order.status || "pending",
    paymentStatus: order.paymentInfo?.status || "pending",
    total: `₹${(order.totalAmount / 100 || 0).toFixed(2)}`,
    orderDetails: order,
  }));

  // Filters and sorting
  useEffect(() => {
    let filtered = mappedData;

    if (searchText) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.orderStatus === filterStatus);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "date":
          aValue = new Date(a.rawDate || 0);
          bValue = new Date(b.rawDate || 0);
          break;
        case "total":
          aValue = parseFloat(a.total.replace(/[₹,]/g, ""));
          bValue = parseFloat(b.total.replace(/[₹,]/g, ""));
          break;
        case "customer":
          aValue = a.customer.toLowerCase();
          bValue = b.customer.toLowerCase();
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [mappedData, searchText, filterStatus, sortBy, sortOrder]);

  const handleStatusChange = async (record, type, value) => {
    try {
      await changeOrderStatus(record.id, { status: value });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ✅ FIXED: ABSOLUTE PATHS - This is the KEY FIX!
  const handleViewDetails = (orderId, orderDetails) => {
    console.log(
      "Navigating to details:",
      `/sales/orders/order-details/${orderId}`
    ); // Debug
    navigate(`/sales/orders/order-details/${orderId}`, {
      state: { order: orderDetails },
    });
    window.location.reload();
  };

  const handleEditOrder = (orderId, orderDetails) => {
    console.log("Navigating to edit:", `/sales/orders/order-update/${orderId}`); // Debug
    navigate(`/sales/orders/order-update/${orderId}`, {
      state: { order: orderDetails },
    });
    window.location.reload();
  };

  const handleDeleteOrder = async (orderId, customerName) => {
    if (
      !window.confirm(
        `Delete order for ${customerName}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteOrder(orderId);
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-blue-50 text-blue-700 border border-blue-200",
      confirmed: "bg-green-50 text-green-700 border border-green-200",
      shipped: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      delivered: "bg-purple-50 text-purple-700 border border-purple-200",
      cancelled: "bg-red-50 text-red-700 border border-red-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border border-gray-200";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Total Orders
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {(summary?.totalOrders || orders.length)?.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-md bg-blue-50">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#293a90] focus:border-[#293a90] text-sm"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#293a90]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((record) => (
                  <tr
                    key={record.key}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#293a90]">
                        {record.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {record.date}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.customer}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={record.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            record,
                            "orderStatus",
                            e.target.value
                          )
                        }
                        className={`px-3 py-1 text-sm rounded-full border font-medium ${getStatusColor(
                          record.orderStatus
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {record.total}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {/* ✅ FIXED: Eye button - ABSOLUTE PATH */}
                        <button
                          onClick={() =>
                            handleViewDetails(record.id, record.orderDetails)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {/* ✅ FIXED: Edit button - ABSOLUTE PATH */}
                        <button
                          onClick={() =>
                            handleEditOrder(record.id, record.orderDetails)
                          }
                          className="p-2 text-[#293a90] hover:bg-[#293a90]/10 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Edit Order"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteOrder(record.id, record.customer)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <span className="text-sm">No orders found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                  {filteredData.length} results
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      currentPage <= 3 ? i + 1 : totalPages - 4 + i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          currentPage === page
                            ? "bg-[#293a90] text-white border-[#293a90]"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
