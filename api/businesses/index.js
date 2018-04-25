const router = require('express').Router();
const validation = require('../../lib/validation');

let businesses = require('./businesses');
const { reviews } = require('../reviews');
const { photos } = require('../photos');

exports.router = router;
exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerID: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

/*
 * Route to return a list of businesses.
 */
router.get('/', function (req, res) {

  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1;
  const numPerPage = 10;
  const lastPage = Math.ceil(businesses.length / numPerPage);
  page = page < 1 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  /*
   * Calculate starting and ending indices of businesses on requested page and
   * slice out the corresponsing sub-array of busibesses.
   */
  const start = (page - 1) * numPerPage;
  const end = start + numPerPage;
  const pageBusinesses = businesses.slice(start, end);

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  let links = {};
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`;
    links.lastPage = `/businesses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`;
    links.firstPage = '/businesses?page=1';
  }

  /*
   * Construct and send response.
   */
  res.status(200).json({
    businesses: pageBusinesses,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: businesses.length,
    links: links
  });

});

/*
 * Route to create a new business.
 */
router.post('/', function (req, res, next) {
  if (validation.validateAgainstSchema(req.body, businessSchema)) {
    let business = validation.extractValidFields(req.body, businessSchema);
    business.id = businesses.length;
    businesses.push(business);
    res.status(201).json({
      id: business.id,
      links: {
        business: `/businesses/${business.id}`
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessID', function (req, res, next) {
  const businessID = parseInt(req.params.businessID);
  if (businesses[businessID]) {
    /*
     * Find all reviews and photos for the specified business and create a
     * new object containing all of the business data, including reviews and
     * photos.
     */
    let business = {
      reviews: reviews.filter(review => review.businessID === businessID),
      photos: photos.filter(photo => photo.businessID === businessID)
    };
    Object.assign(business, businesses[businessID]);
    res.status(200).json(business);
  } else {
    next();
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessID', function (req, res, next) {
  const businessID = parseInt(req.params.businessID);
  if (businesses[businessID]) {

    if (validation.validateAgainstSchema(req.body, businessSchema)) {
      businesses[businessID] = validation.extractValidFields(req.body, businessSchema);
      businesses[businessID].id = businessID;
      res.status(200).json({
        links: {
          business: `/businesses/${businessID}`
        }
      });
    } else {
      res.status(400).json({
        error: "Request body is not a valid business object"
      });
    }

  } else {
    next();
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessID', function (req, res, next) {
  const businessID = parseInt(req.params.businessID);
  if (businesses[businessID]) {
    businesses[businessID] = null;
    res.status(204).end();
  } else {
    next();
  }
});
