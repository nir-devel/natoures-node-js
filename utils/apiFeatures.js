class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // const queryObj = { ...req.query };//BEFORE REFACTORING -THIS CODE WAS IN THE CONTROLLER //IMPORTANT !!  THIS IS BEFORE REFACTORING ! NOW THIS APIFeatures class has no access to req.query //Basic Filttering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // let queryStr = JSON.stringify(queryObj);

    /**IMPORTANT
     * In this class - I am not depend on the Tour Resource - The Model is set already in the query property
     *
     * Remove this - this was before the refactoring - Now I am not depend on the Tour Resource
     */
    //BEFORE REFACTORING TO THIS CLASS
    // let query = Tour.find(JSON.parse(queryStr));

    //AFTER REFACTORING: update the this.query - add the find query
    this.query = this.query.find(JSON.parse(queryStr));

    //DONT RETURN THE QUERY !
    //return this.query;
    return this;
  }

  //Will be chain after the filter
  sort() {
    // if (req.query.sort) {
    if (this.queryString.sort) {
      //console.log(req.query.sort); //OK price,duration
      console.log(this.queryString.sort)
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy); // //OK price duration

      //CHAIN the sort functionality into the query
      this.query = this.query.sort(sortBy);
    }
    //Provide default sorting on the createdAt field in descending order - newest on top
    else {
      this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // if (req.query.fields) {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      //update the query - add the select option
      console.log(fields);
      //query = query.select(fields);
      this.query = this.query.select(fields);

      //query =query.select('name duration ')
    }
    //exclude the __v of MONGOOSE - if the user did not specify it in the url
    else {
      // query = query.select('-__v');
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    //Calclulate the skip value
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
    //Dont need this! I dont need to throw when the there are no results
    // if (req.query.page) {
    //   const count = await Tour.countDocuments();
    //   console.log(`count = ${count}`);
    //   console.log(`skip = $${skip}`);

    //   if (skip >= count) throw new Error('Page does not exists');
  }
}

module.exports = APIFeatures;
