import api from "./api";

export const autofillListing = async (formData) => {
  const res = await api.post("/ai/autofill", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const suggestPrice = async (data) => {
  const res = await api.post("/ai/price-suggest", data);
  return res.data;
};