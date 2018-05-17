const router = require('express').Router();
const validation = require('../../lib/validation');

let reviews = require('./reviews');

exports.router = router;
exports.reviews = reviews;

//-------------------------SQL-----------------------------
const mysql = require('mysql');


const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDB = process.env.MYSQL_DATABASE;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;

const maxMySQLConnections = 10;
const mysqlPool = mysql.createPool({
  connectionLimit: maxMySQLConnections,
  host: mysqlHost,
  port: mysqlPort,
  database: mysqlDB,
  user: mysqlUser,
  password: mysqlPassword
});


//--------------------------SQL end----------------------------------


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
//----------------------------------------------------------------------
 function insertNewReviews(reviews) {
      return new Promise((resolve, reject) => {
            const lodgingValues = {
      id: null,
      userID: reviews.userID,
      businessID: reviews.businessID,
      dollars: reviews.dollars,
      stars: reviews.stars,
      review: reviews.review
         };

         mysqlPool.query(
            'INSERT INTO reviews SET ?',
            lodgingValues,
            function (err, result) {
                 if (err) {
              reject(err);
            } else {
              resolve(result.insertId);
            }

            });

          });
         }


    router.post('/', function (req, res, next) {

    //--docker endpont ---------------------------------------------

    if (req.body && req.body.userID && req.body.businessID && req.body.dollars && req.body.stars) {
          insertNewReviews(req.body)
            .then((id) => {
                 res.status(201).json({ id: id,
                     links: {
                    reviews: '/reviews/' + id
               }});
            })
            .catch((err) => {
               res.status(500).json({
               error: "Error inserting reviews into DB."
          });
     });
    } else {
       res.status(400).json({
         error: "Request needs a JSON body with a businessID,stars,dollars etc."
       });
    }


    // -- end ----------------------------------------------------------------
  });

  // For validation if the inputted data is valid
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
//----------------------------------------------------------------------

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

/*
* Route to update a review.
*/
//-----------------------------------------------------------------
function updatedReview(reviewID, businesses) {
   return new Promise((resolve, reject) => {
        const lodgingValues = {
             id: businesses.id,
        userID: businesses.userID,
        businessID: businesses.businessID,
        dollars: businesses.dollars,
        stars: businesses.stars,
        review: businesses.review
          };

     mysqlPool.query(
       'UPDATE reviews SET ? WHERE id = ?',
       [ lodgingValues, reviewID ],
       function (err, result) {
         if (err) {
          reject(err);
         } else {
          resolve(result.affectedRows > 0);
         }
       }
     );
   });
 }


 router.put('/:reviewID', function (req, res, next) {
 const reviewID = parseInt(req.params.reviewID);

 if (req.body && req.body.userID && req.body.businessID  && req.body.dollars && req.body.stars ) {
     updatedReview(reviewID, req.body)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
               links: {
              reviews: `/reviews/${reviewID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
          console.error(err);
        res.status(500).json({
          error: "Unable to update reviews."
        });
      });
 } else {
      console.log(err);
    res.status(400).json({
      err: "Request needs a JSON body with a userID,businessID, etc."
    });
 }
 });
//-----------------------------------------------------------------

/*
* Route to delete a review.
*/
//-----------------------------------------------------------------
function deletereviewID(reviewID, callback) {
    return new Promise((resolve, reject) => {
      mysqlPool.query(
        'DELETE FROM reviews WHERE id = ?',
        [ reviewID ],
        function (err, result) {
          if (err) {
           reject(err);
          } else {
           resolve(result.affectedRows > 0);
          }
        }
      );
    });
   }


   router.delete('/:reviewID', function (req, res, next) {
   const reviewID = parseInt(req.params.reviewID);
   deletereviewID(reviewID)
   .then((deleteSuccessful) => {
     if (deleteSuccessful) {
          console.log("DELETED THE SPECIFIED REVIEW");
       res.status(204).end();
     } else {
       next();
     }
  })
  .catch((err) => {
     res.status(500).json({
       error: "Unable to delete review info."
     });
  });

  });
//-----------------------------------------------------------------
