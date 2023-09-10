const express = require('express');
const viewsController = require('./../controllers/viewsController');
const router = express.Router();

// router.get('/', (req, res) => {
//   //INSTEAD OF JSON - USE RENDER() - to render the template with the name I passed
//   //CREATE 'LCOALS' TO THE PUG TEMPLATE
//   res.status(200).render('base', { tour: 'The Forest Hicker', user: 'Nir' });
// });

router.get('/', viewsController.getOverview);

router.get('/tour', viewsController.getTour);

module.exports = router;
