const slugify = (text) => {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-") // replace spaces and non-word chars with -
      .replace(/^-+|-+$/g, "") + // remove leading/trailing -
    "-" +
    Date.now()
  );
};

module.exports = slugify;