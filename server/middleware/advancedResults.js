const advancedResults = (model, populate = '') => async (req, res, next) => {
  let query = model.find();

  // Filtering
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Convert query operators to MongoDB format ($gt, $lte, etc.)
  let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  query = model.find(JSON.parse(queryStr));

  // Populate if needed
  if (populate) query = query.populate(populate);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await model.countDocuments(JSON.parse(queryStr));
  query = query.skip(startIndex).limit(limit);

  // Execute query
  const results = await query;

  res.advancedResults = {
    success: true,
    count: results.length,
    page,
    total,
    pages: Math.ceil(total / limit),
    data: results
  };

  next();
};

export default advancedResults;
