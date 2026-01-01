const Vehicle = require('../models/Vehicle');

//Get all vehicle
exports.getAllVehicles = async (req, res) => {
    try{
        const vehicles = await Vehicle.find();

        return res.status(200).json({
            status: 'success',
            data: vehicles
        })
    } catch (err){
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get vehicles',
            error: err?.message,
        })
    }
};

//Add new vehicle
exports.addVehicle = async (req, res) => {
    try{
        const {type, brand, model, year, colorVariants, engine, powerOutput, transmission, fuelConsumption, fuelType, img} = req.body;

        if (!type || !brand || !model || !year || !colorVariants || !engine || !powerOutput || !transmission || !fuelConsumption || !fuelType || !img){
            return res.status(404).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        //Check code existence
        const existingVehi = await Vehicle.findOne({ model });

        if(existingVehi){
            return res.status(409).json({
                status: 'error',
                message: 'Vehicle model is already in use'
            })
        }

        //Create vehicle
        const newVehicle = await Vehicle.create({
            type,
            brand,
            model,
            year,
            colorVariants,
            img,
            engine,
            powerOutput,
            transmission,
            fuelConsumption,
            fuelType
        });

        await newVehicle.save();

        res.status(201).json({
            status: 'success',
            data: newVehicle
        })
    } catch (err){
        return res.status(500).json({
            status: 'error',
            message: 'Failed to add new vehicle',
            error: err?.message,
        })
    }
};

//Get vehicle by ID
exports.getVehicleById = async (req, res) => {
    try{
        const {id} = req.params;

        //Get vehi
        const vehicle = await Vehicle.findById(id);

        if (!vehicle){
            return res.status(404).json({
                status: 'error',
                message: 'Vehicle not found'
            })
        };

        return res.status(200).json({
            status: 'success',
            message: vehicle
        })
    } catch (err){
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get vehicle',
            error: err?.message,
        })
    }
};

//Delete vehicle
exports.deleteVehicleById = async (req, res) => {
    try{
        const {id} = req.params;


        const deletedVehicle = await Vehicle.findByIdAndDelete(id);

        if (!deletedVehicle){
            return res.status(404).json({
                status: 'error',
                message: 'Vehicle not found'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Vehicle deleted successfully'
        });
    } catch (err){
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete vehicle',
            error: err?.message,
        });
    }
}

//Update vehicle
exports.updateVehicleById = async (req, res) => {
    try{
        const { id } = req.params;

        // Ensure request body is a valid object
        const body = req.body;
        if (!body || typeof body !== 'object') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body'
            });
        }

        // Whitelist allowed updatable fields
        const allowedFields = [
            'type',
            'brand',
            'model',
            'year',
            'colorVariants',
            'engine',
            'powerOutput',
            'transmission',
            'fuelConsumption',
            'fuelType',
            'img'
        ];

        // Build update object only from allowed fields present in body
        const updateData = {};
        for (const key of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                const value = body[key];
                if (value !== undefined) {
                    updateData[key] = value;
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No valid fields provided to update'
            });
        }

        // Ensure `model` remains unique if changed
        if (updateData.model) {
            const duplicate = await Vehicle.findOne({ model: updateData.model, _id: { $ne: id } });
            if (duplicate) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Vehicle model is already in use'
                });
            }
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({
                status: 'error',
                message: 'Vehicle not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: updatedVehicle
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update vehicle',
            error: err?.message,
        });
    }
}