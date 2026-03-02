import api from "./api";

export const getListings = async (params) => {
  const res = await api.get("/listings", { params });
  return res.data;
};

export const getListing = async (id) => {
  const res = await api.get(`/listings/${id}`);
  return res.data;
};

export const createListing = async (formData) => {
  const res = await api.post("/listings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateListing = async (id, formData) => {
  const res = await api.put(`/listings/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteListing = async (id) => {
  const res = await api.delete(`/listings/${id}`);
  return res.data;
};

export const getMyListings = async () => {
  const res = await api.get("/listings/my");
  return res.data;
};