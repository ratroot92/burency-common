class APIFeature {
    constructor(query, queryString = {}, optional = {}) {
        this.query = query;
        this.queryString = queryString;
        this.optional = optional;
    }

    pagination() {
        if (this.queryString.withoutPagination) {
            this.query = this.query;
        } else {
            const page = this.queryString.page * 1 || 1;
            const limit = this.queryString.limit * 1 || 10;
            const skip = (page - 1) * limit;
            this.query = this.query.skip(skip).limit(limit);
            this.query.paginated = { limit, page, skip };
        }
        return this;
    }

    filter() {
        let queryObj = { ...this.queryString };
        if (this.optional) {
            queryObj[this.optional.key] = this.optional.value;
        }
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((field) => delete queryObj[field]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        queryStr = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
}

module.exports = APIFeature;
