const router = require('express').Router();
const validation = require('../../lib/validation');

let reviews = require('./reviews');

exports.router = router;
exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userID: { required: true },
  businessID: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};


/*
 * Route to create a new review.
 */
router.post('/', function (req, res, next) {
  if (validation.validateAgainstSchema(req.body, reviewSchema)) {

    let review = validation.extractValidFields(req.body, reviewSchema);

    /*
     * Make sure the user is not trying to review the same business twice.
     */
    let userReviewedThisBusinessAlready = reviews.some(
      existingReview => existingReview.ownerID === review.ownerID && existingReview.businessID === review.businessID
    );

    if (userReviewedThisBusinessAlready) {
      res.status(403).json({
        error: "User has already posted a review of this business"
      });
    } else {
      review.id = reviews.length;
      reviews.push(review);
      res.status(201).json({
        id: review.id,
        links: {
          review: `/reviews/${review.id}`,
          business: `/businesses/${review.businessID}`
        }
      });
    }

  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
//--------------------------------------------------
 function getreviewID(reviewID, callback) {
        return new Promise((resolve, reject) => {
            mysqlPool.query(
       'SELECT * FROM reviews WHERE id = ?',
       [ reviewID ],
       function (err, results) {
         if (err) {
          reject(null);
         } else {
          resolve(results[0]);
         }
       }
     );

        });
      }


     router.get('/:reviewID', function (req, res, next) {
       const reviewID = parseInt(req.params.reviewID);
       getreviewID(reviewID)
       .then((lodging) => {
          if (lodging) {
            res.status(200).json(lodging);
          } else {
            next();
          }

      })
       .catch((err) => {
            res.status(500).json({
  error: "Unable to fetch reviews."
     });
       });
     });
//--------------------------------------------------


//
// router.get('/:reviewID', function (req, res, next) {
//   const reviewID = parseInt(req.params.reviewID);
//   if (reviews[reviewID]) {
//     res.status(200).json(reviews[reviewID]);
//   } else {
//     next();
//   }
// });

/*
 * Route to update a review.
 */
router.put('/:reviewID', function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID);
  if (reviews[reviewID]) {

    if (validation.validateAgainstSchema(req.body, reviewSchema)) {
      /*
       * Make sure the updated review has the same businessID and userID as
       * the existing review.
       */
      let updatedReview = validation.extractValidFields(req.body, reviewSchema);
      let existingReview = reviews[reviewID];
      if (updatedReview.businessID === existingReview.businessID && updatedReview.userID === existingReview.userID) {
        reviews[reviewID] = updatedReview;
        reviews[reviewID].id = reviewID;
        res.status(200).json({
          links: {
            review: `/reviews/${reviewID}`,
            business: `/businesses/${updatedReview.businessID}`
          }
        });
      } else {
        res.status(403).json({
          error: "Updated review must have the same businessID and userID"
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid review object"
      });
    }

  } else {
    next();
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID);
  if (reviews[reviewID]) {
    reviews[reviewID] = null;
    res.status(204).end();
  } else {
    next();
  }
});
