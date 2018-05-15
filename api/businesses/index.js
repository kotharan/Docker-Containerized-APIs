const router = require('express').Router();
const validation = require('../../lib/validation');
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
//----------Added funtioned need to be called in the endpoint---------------------------------------

/*
* Route to return a list of businesses.
*/

function getLodgingsCount() {
  return new Promise((resolve, reject) => {
     mysqlPool.query(
          'SELECT COUNT(*) AS count FROM businesses',
          function (err, results) {
          if (err) {
          reject(err);
          } else {
          resolve(results[0].count);
   }
   }
 );

 });
     }
      function getLodgingsPage(page, totalCount) {
       return new Promise((resolve, reject) => {
            const numPerPage = 10;
     const lastPage = Math.ceil(totalCount / numPerPage);
     page = page < 1 ? 1 : page;
     page = page > lastPage ? lastPage : page;
     const offset = (page - 1) * numPerPage;
     mysqlPool.query(
       'SELECT * FROM businesses ORDER BY id LIMIT ?,?',
       [offset, numPerPage],
       function (err, results) {
            if (err) {
              reject(err);
            } else {
              resolve({
                businesses: results,
                pageNumber: page,
                totalPages: lastPage,
                pageSize: numPerPage,
                totalCount: totalCount
              });
            }

       }
     );



 });
 }


 //-------------------end----------------------------------------

 /*
 * Route to return a list of businesses.
 */
 router.get('/', function (req, res) {

     //-----calling funtion in route endpoint-------------------------------------------------

     getLodgingsCount()
       .then((count) => {
            return getLodgingsPage(parseInt(req.query.page) || 1, count);
      })
      .then((lodgingsPageInfo) => {
       res.status(200).json(lodgingsPageInfo);
     })

       .catch((err) => {
            console.error(err);
            res.status(500).json({
       error: "Error fetching businesses list.  Try again later."
     });

      });
      });
     //--------------end-------------------------------------


/*
* Route to create a new business.
*/
//----------------------------------------------------------------------
 function insertNewLodging(businesses) {
  return new Promise((resolve, reject) => {
       const lodgingValues = {
  id: null,
  name: businesses.name,
  address: businesses.address,
  city: businesses.city,
  state: businesses.state,
  zip: businesses.zip,
  phone: businesses.phone,
  category: businesses.category,
  subcategory: businesses.subcategory,
  website: businesses.website,
  ownerid: businesses.ownerID
     };

     mysqlPool.query(
       'INSERT INTO businesses SET ?',
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

     if (req.body && req.body.ownerID && req.body.name && req.body.address  && req.body.city && req.body.state && req.body.zip && req.body.phone) {
          insertNewLodging(req.body)
            .then((id) => {
                 res.status(201).json({ id: id,
                      links: {
                    businesses: '/businesses/' + id
               }});
            })
            .catch((err) => {
               res.status(500).json({
               error: "Error inserting business into DB."
          });
      });
     } else {
       res.status(400).json({
         error: "Request needs a JSON body with a name, etc."
       });
     }


     // -- end ----------------------------------------------------------------
 });
//----------------------------------------------------------------------



/*
* Route to fetch info about a specific business.
*/
 function getLodgingByID(businessID, callback) {
        return new Promise((resolve, reject) => {
             mysqlPool.query(
       'SELECT * FROM businesses WHERE id = ?',
       [ businessID ],
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


     router.get('/:businessID', function (req, res, next) {
       const businessID = parseInt(req.params.businessID);
       getLodgingByID(businessID)
       .then((lodging) => {
          if (lodging) {
            res.status(200).json(lodging);
          } else {
            next();
          }

      })
       .catch((err) => {
            res.status(500).json({
  error: "Unable to fetch business."
     });
       });
     });


/*
 * Route to replace data for a business.
 */

function updateLodgingByID(businessID, businesses) {
   return new Promise((resolve, reject) => {
        const lodgingValues = {
        id: null,
        name: businesses.name,
        address: businesses.address,
        city: businesses.city,
        state: businesses.state,
        zip: businesses.zip,
        phone: businesses.phone,
        category: businesses.category,
        subcategory: businesses.subcategory,
        website: businesses.website,
        ownerid: businesses.ownerID
           };

     mysqlPool.query(
       'UPDATE businesses SET ? WHERE id = ?',
       [ lodgingValues, businessID ],
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


 router.put('/:businessID', function (req, res, next) {
  const businessID = parseInt(req.params.businessID);

 if (req.body && req.body.ownerID && req.body.name && req.body.address  && req.body.city && req.body.state && req.body.zip && req.body.phone) {
     updateLodgingByID(businessID, req.body)
      .then((updateSuccessful) => {
        if (updated) {
          res.status(200).json({
               links: {
              business: `/businesses/${businessID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "Unable to update business."
        });
      });
  } else {
    res.status(400).json({
      err: "Request needs a JSON body with a name, etc."
    });
  }
 });

/*
 * Route to delete a business.
 */
//-----------------------------------------------------------------
 function deleteLodgingByID(businessID, callback) {
   return new Promise((resolve, reject) => {
     mysqlPool.query(
       'DELETE FROM businesses WHERE id = ?',
       [ businessID ],
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


  router.delete('/:businessID', function (req, res, next) {
  const businessID = parseInt(req.params.businessID);
  deleteLodgingByID(businessID)
  .then((deleteSuccessful) => {
    if (deleteSuccessful) {
         console.log("DELETED THE SPECIFIED BUSINESS");
      res.status(204).end();
    } else {
      next();
    }
  })
  .catch((err) => {
    res.status(500).json({
      error: "Unable to delete business info."
    });
  });

 });
//-----------------------------------------------------------------

// router.get('/help',function(req,res)
// {
//      res.status(200).send("HELLLOoo");
// });
