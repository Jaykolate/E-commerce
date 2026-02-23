class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this._filterConditions = { status: "active" }; // base filter always applied
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // price range filter e.g. price[gte]=100&price[lte]=500
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // merge into base conditions (keeps status:"active" always)
    Object.assign(this._filterConditions, JSON.parse(queryStr));
    this.query = this.query.find(this._filterConditions);
    return this;
  }

  search() {
    if (this.queryStr.search) {
      // merge $text into the base conditions so only ONE .find() is issued
      this._filterConditions.$text = { $search: this.queryStr.search };
    }
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryStr.page) || 1;
    const limit = parseInt(this.queryStr.limit) || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Returns the filter conditions built so far — used for countDocuments
  getFilterConditions() {
    return this._filterConditions;
  }
}

module.exports = APIFeatures;
