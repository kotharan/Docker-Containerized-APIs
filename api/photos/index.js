const router = require('express').Router();
const validation = require('../../lib/validation');

let photos = require('./photos');

exports.router = router;
exports.photos = photos;

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
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userID: { required: true },
  businessID: { required: true },
  caption: { required: false },
  data: { required: true }
};


/*
 * Route to create a new photo.
 */

 //----------------------------------------------------------------------
  function insertNewPhotos(photos) {
   return new Promise((resolve, reject) => {
        const lodgingValues = {
   id: null,
   userID: photos.userID,
   businessID: photos.businessID,
   caption: photos.caption,
   data: photos.data
      };

      mysqlPool.query(
        'INSERT INTO photos SET ?',
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

      if (req.body && req.body.userID && req.body.businessID && req.body.data) {
           insertNewPhotos(req.body)
             .then((id) => {
                  res.status(201).json({ id: id,
                       links: {
                     photos: '/photos/' + id
                }});
             })
             .catch((err) => {
                res.status(500).json({
                error: "Error inserting photos into DB."
           });
       });
      } else {
        res.status(400).json({
          error: "Request needs a JSON body with a businessID, etc."
        });
      }


      // -- end ----------------------------------------------------------------
  });
//----------------------------------------------------------------------

/*
 * Route to fetch info about a specific photo.
 */
 //------------------------------------------------------
  function getphotoID(photoID, callback) {
         return new Promise((resolve, reject) => {
              mysqlPool.query(
        'SELECT * FROM photos WHERE id = ?',
        [ photoID ],
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


      router.get('/:photoID', function (req, res, next) {
        const photoID = parseInt(req.params.photoID);
        getphotoID(photoID)
        .then((lodging) => {
           if (lodging) {
             res.status(200).json(lodging);
           } else {
             next();
           }

       })
        .catch((err) => {
             res.status(500).json({
   error: "Unable to fetch photos."
      });
        });
      });
 //--------------------------------------------------


/*
 * Route to update a photo.
 */
router.put('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  if (photos[photoID]) {

    if (validation.validateAgainstSchema(req.body, photoSchema)) {
      /*
       * Make sure the updated photo has the same businessID and userID as
       * the existing photo.
       */
      let updatedPhoto = validation.extractValidFields(req.body, photoSchema);
      let existingPhoto = photos[photoID];
      if (updatedPhoto.businessID === existingPhoto.businessID && updatedPhoto.userID === existingPhoto.userID) {
        photos[photoID] = updatedPhoto;
        photos[photoID].id = photoID;
        res.status(200).json({
          links: {
            photo: `/photos/${photoID}`,
            business: `/businesses/${updatedPhoto.businessID}`
          }
        });
      } else {
        res.status(403).json({
          error: "Updated photo must have the same businessID and userID"
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid photo object"
      });
    }

  } else {
    next();
  }
});

/*
 * Route to delete a photo.
 */

 //-----------------------------------------------------------------
  function deletePhotoByID(photoID, callback) {
    return new Promise((resolve, reject) => {
      mysqlPool.query(
        'DELETE FROM photos WHERE id = ?',
        [ photoID ],
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


   router.delete('/:photoID', function (req, res, next) {
   const photoID = parseInt(req.params.photoID);
   deletePhotoByID(photoID)
   .then((deleteSuccessful) => {
     if (deleteSuccessful) {
          console.log("DELETED THE SPECIFIED Photo");
       res.status(204).end();
     } else {
       next();
     }
   })
   .catch((err) => {
     res.status(500).json({
       error: "Unable to delete photo info."
     });
   });

  });
 //-----------------------------------------------------------------
