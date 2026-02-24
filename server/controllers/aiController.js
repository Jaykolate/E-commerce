const { analyzeClothingImage, suggestPrice } = require("../services/aiService");

// @POST /api/ai/autofill — upload image, get listing data back
const autofillListing = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image" });
  }

  const mimeType = req.file.mimetype;
  const result = await analyzeClothingImage(req.file.buffer, mimeType);

  res.status(200).json({
    message: "AI analysis complete",
    data: result,
  });
};

// @POST /api/ai/price-suggest — get price suggestion
const priceSuggest = async (req, res) => {
  const { brand, category, condition } = req.body;

  if (!brand || !category || !condition) {
    return res.status(400).json({ message: "brand, category and condition are required" });
  }

  const result = await suggestPrice(brand, category, condition);
  res.status(200).json({ message: "Price suggestion ready", data: result });
};

module.exports = { autofillListing, priceSuggest };