const express = require('express');
const vehicleController = require('../controllers/VehicleController');

const router = express.Router();

router.get('/vehicle', vehicleController.getAllVehicles);
router.post('/vehicle', vehicleController.addVehicle);
router.get('/vehicle/:id', vehicleController.getVehicleById);
router.delete('/vehicle/:id', vehicleController.deleteVehicleById);
router.patch('/vehicle/:id', vehicleController.updateVehicleById);

module.exports = router;