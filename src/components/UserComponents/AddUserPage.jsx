import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Home,
  User,
  Mail,
  Lock,
  Shield,
  Clock,
  Phone,
} from "lucide-react";
import useUserStore from "../../store/useUserStore";

const menuItems = [
  { label: "Categories", path: "/catalogue/categories" },
  { label: "Users", path: "/users" },
  { label: "Products", path: "/catalogue/product" },
  { label: "Orders", path: "/sales/orders" },
  { label: "Customers", path: "/customers" },
  { label: "Finance", path: "/finance" },
  { label: "Report", path: "/report" },
  { label: "Enquiry", path: "/support" },
  { label: "Help", path: "/help" },
  { label: "Settings", path: "/settings" },
];

const AddUserPage = () => {
  const navigate = useNavigate();
  const { createUser } = useUserStore();

  //  Added phone and role
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "userpannel", // Default role
  });

  const [loading, setLoading] = useState(false);

  const modules = menuItems.map((item) => ({
    key: item.path,
    label: item.label,
  }));

  const [selectedModules, setSelectedModules] = useState([]);

  const handleModuleToggle = (key) => {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.firstName || !formData.email || !formData.password) {
        toast.error("Please fill all required fields");
        setLoading(false);
        return;
      }

      //  Check if phone is required for customer role
      if (formData.role === "customer" && !formData.phone) {
        toast.error("Phone number is required for customer role");
        setLoading(false);
        return;
      }

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        modules: selectedModules,
      };

      //  Add phone only if provided
      if (formData.phone) {
        payload.phone = formData.phone.trim();
      }

      console.log("Create User Payload:", payload);

      await createUser(payload);
      toast.success("User created successfully");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "userpannel",
      });
      setSelectedModules([]);
      navigate("/users");
    } catch (err) {
      console.error("Create User Error:", err);
      toast.error(
        err.response?.data?.message ||
        "Failed to create user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      role: "userpannel",
    });
    setSelectedModules([]);
    navigate("/users");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const FooterButtons = ({ onCancel, loading }) => (
    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-xs font-medium bg-[#293a90] hover:bg-[#293a90]/90 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Clock size={12} className="animate-spin inline mr-2" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4 w-full">
        <div className="flex justify-between items-center py-2 mb-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Form Fields */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <User size={14} />
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <User size={14} />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Enter last name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <Mail size={14} />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Enter email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <Lock size={14} />
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Enter password"
                  />
                </div>

                {/*  Phone Number - Required for customer */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <Phone size={14} />
                    Phone Number {formData.role === "customer" && "*"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required={formData.role === "customer"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Enter phone number"
                  />
                  {formData.role === "customer" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Required for customer role
                    </p>
                  )}
                </div>

                {/*  Role Dropdown */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <Shield size={14} />
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  >
                    {/* <option value="admin">Admin</option> */}
                    <option value="userpannel">Panel User</option>
                    {/* <option value="customer">Customer</option> */}
                  </select>
                </div>
              </div>
            </div>

            {/* Modules Section */}
            {formData.role !== "customer" && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Shield size={16} />
                    Module Access
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {modules.map(({ key, label }) => (
                      <label
                        key={key}
                        className="relative border border-gray-200 hover:shadow-md transition-shadow rounded-lg p-4 cursor-pointer flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(key)}
                          onChange={() => handleModuleToggle(key)}
                          className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{label}</span>
                      </label>
                    ))}
                    {selectedModules.length === 0 && (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        <Shield size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">No modules selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <FooterButtons onCancel={handleCancel} loading={loading} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
