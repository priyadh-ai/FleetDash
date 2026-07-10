const express = require("express");
const router = express.Router();

const Vehicle = require("../models/Vehicle");


router.get("/", async (req, res) => {

    try {

        const vehicles = await Vehicle.find();

        res.json(vehicles);

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


router.post("/", async (req,res)=>{

    try{

        const vehicle = new Vehicle(req.body);

        const savedVehicle = await vehicle.save();

        res.json(savedVehicle);

    }catch(error){

        res.status(400).json({
            message:error.message
        });

    }

});


module.exports = router;