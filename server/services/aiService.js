const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeClothingImage = async (imageBuffer, mimeType = "image/jpeg") => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert fashion analyst for a secondhand clothing marketplace called Threadly.
    Analyze this clothing image and return a JSON object with exactly these fields:
    
    {
      "title": "short catchy listing title (max 60 chars)",
      "description": "detailed product description mentioning fabric, style, fit (max 200 chars)",
      "brand": "brand name if visible, else 'Unbranded'",
      "category": "one of: tops, bottoms, dresses, outerwear, shoes, accessories, ethnic, activewear, other",
      "size": "one of: XS, S, M, L, XL, XXL, Free Size, Custom",
      "condition": "one of: new_with_tags, like_new, good, fair, worn",
      "suggestedPrice": "suggested resale price in INR as a number only",
      "tags": "comma separated relevant tags like casual, summer, vintage etc"
    }

    Return ONLY the raw JSON object. No markdown, no explanation, no backticks.
  `;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  // clean response just in case
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

const suggestPrice = async (brand, category, condition) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are a pricing expert for a secondhand clothing marketplace in India.
    Given this clothing item:
    - Brand: ${brand}
    - Category: ${category}
    - Condition: ${condition}

    Suggest a fair resale price in INR.
    Return ONLY a JSON object like this:
    {
      "minPrice": 300,
      "maxPrice": 700,
      "suggestedPrice": 500,
      "reasoning": "one line explanation"
    }
    No markdown, no backticks, raw JSON only.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

module.exports = { analyzeClothingImage, suggestPrice };