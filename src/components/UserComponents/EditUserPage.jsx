// src/components/UserComponents/EditUserPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, User, Mail, Shield, Clock, X } from "lucide-react";
import { RefreshCw } from "lucide-react";
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

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchUserById, updateUser } = useUserStore();

  const [currentUser, setCurrentUser] = useState(null);

  //  Changed: Separate firstName and lastName
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const modules = menuItems.map((item) => ({
    key: item.path,
    label: item.label,
  }));

  const [selectedModules, setSelectedModules] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const userData = await fetchUserById(id);
        setCurrentUser(userData);

        //  Changed: Set firstName and lastName separately
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email,
        });

        setSelectedModules(userData.modules || []);
      } catch (err) {
        toast.error("User not found");
        navigate("/users");
      } finally {
        setUserLoading(false);
      }
    };

    if (id) {
      loadUser();
    }
  }, [id, fetchUserById, navigate]);

  const handleModuleToggle = (key) => {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  //  Changed: Submit with firstName and lastName
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.firstName) {
        toast.error("First name is required");
        setLoading(false);
        return;
      }

      //  Send firstName and lastName separately
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        modules: selectedModules,
      };

      console.log("Update Payload:", payload); // Debug

      await updateUser(id, payload);
      toast.success("User updated successfully");
      navigate("/users");
    } catch (err) {
      console.error("Update Error:", err);
      toast.error(
        err.response?.data?.message ||
        "Failed to update user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            User not found. Please go back.
          </p>
          <button
            onClick={() => navigate("/users")}
            className="mt-4 px-4 py-2 bg-[#293a90] text-white rounded-lg text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
          "Update"
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-4 w-full">
        {/* Top bar with breadcrumb and buttons */}
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
                {/*  Changed: First Name field */}
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

                {/*  Changed: Last Name field */}
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

                {/* Email field */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                    <Mail size={14} />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-50"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>

            {/* Modules Section */}
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
                    <div
                      key={key}
                      className="relative border border-gray-200 hover:shadow-md transition-shadow rounded-lg p-4"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(key)}
                          onChange={() => handleModuleToggle(key)}
                          className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{label}</span>
                      </label>
                    </div>
                  ))}
                  {selectedModules.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      <Shield
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <p className="text-xs">No modules selected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FooterButtons onCancel={handleCancel} loading={loading} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserPage;
