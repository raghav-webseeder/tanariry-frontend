import { create } from "zustand";
import axiosInstance from "../../utils/axios";

const useHelpStore = create((set) => ({
  loading: false,
  error: null,
  successMessage: null,
  submittedRequest: null,

  submitHelpRequest: async (helpData) => {
    set({
      loading: true,
      error: null,
      successMessage: null,
      submittedRequest: null,
    });
    try {
      const formData = new FormData();
      formData.append("name", helpData.name);
      formData.append("email", helpData.email);
      formData.append("subject", helpData.subject);
      formData.append("message", helpData.message);

      if (helpData.images && helpData.images.length > 0) {
        helpData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await axiosInstance.post("/help/send-email", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Help Request Response:", response.data);

      set({
        loading: false,
        successMessage:
          response.data.message ||
          "Your message has been sent successfully! Our support team will get back to you soon.",
        error: null,
        submittedRequest: response.data,
      });

      return response.data;
    } catch (error) {
      console.error("Help Request Error:", error.response?.data);
      set({
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to submit help request. Please try again later.",
        loading: false,
        successMessage: null,
        submittedRequest: null,
      });
      throw error;
    }
  },

  clearMessages: () =>
    set({
      error: null,
      successMessage: null,
    }),

  resetStore: () =>
    set({
      loading: false,
      error: null,
      successMessage: null,
      submittedRequest: null,
    }),
}));

export default useHelpStore;
