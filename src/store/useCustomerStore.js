import { create } from "zustand";
import axiosInstance from "../../utils/axios";

const useCustomerStore = create((set) => ({
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/users?role=customer");
      set({ customers: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  fetchCustomerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      const customer =
        response.data.success && response.data.data
          ? response.data.data
          : response.data;
      set({ currentCustomer: customer, loading: false });
      return customer;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      throw error;
    }
  },

  createCustomer: async (customerData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(
        "/customers/create",
        customerData
      );
      set((state) => ({
        customers: [...state.customers, response.data.customer],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  updateCustomer: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      console.log(updatedData);
      const response = await axiosInstance.put(
        `/customers/update/${id}`,
        updatedData
      );
      set((state) => ({
        customers: state.customers.map((customer) =>
          customer._id === id ? response.data.customer : customer
        ),
        currentCustomer:
          state.currentCustomer?._id === id
            ? response.data.customer
            : state.currentCustomer,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/customers/delete/${id}`);
      set((state) => ({
        customers: state.customers.filter((customer) => customer._id !== id),
        currentCustomer:
          state.currentCustomer?._id === id ? null : state.currentCustomer,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  updateAddress: async (userId, addressIndex, addressData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/users/${userId}/addresses/${addressIndex}`,
        addressData
      );
      set({ currentCustomer: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      throw error;
    }
  },

  deleteAddress: async (userId, addressIndex) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete(
        `/users/${userId}/addresses/${addressIndex}`
      );
      set({ currentCustomer: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        loading: false,
      });
      throw error;
    }
  },
}));

export default useCustomerStore;
