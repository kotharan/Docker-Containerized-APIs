const router = require('express').Router();
const validation = require('../../lib/validation');

let photos = require('./photos');

exports.router = router;
exports.photos = photos;

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
router.post('/', function (req, res, next) {
  if (validation.validateAgainstSchema(req.body, photoSchema)) {
    let photo = validation.extractValidFields(req.body, photoSchema);
    photo.id = photos.length;
    photos.push(photo);
    res.status(201).json({
      id: photo.id,
      links: {
        photo: `/photos/${photo.id}`,
        business: `/businesses/${photo.businessID}`
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  if (photos[photoID]) {
    res.status(200).json(photos[photoID]);
  } else {
    next();
  }
});

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
router.delete('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  if (photos[photoID]) {
    photos[photoID] = null;
    res.status(204).end();
  } else {
    next();
  }
});
