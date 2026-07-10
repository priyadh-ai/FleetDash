const vehicles = [

    {
        id: "VH-001",
        driver: "Arun",
        speed: 65,
        fuel: 80,
        status: "Moving",
        location: {
            lat: 11.0168,
            lng: 76.9558
        }
    },


    {
        id: "VH-002",
        driver: "Kumar",
        speed: 0,
        fuel: 45,
        status: "Stopped",
        location: {
            lat: 11.0200,
            lng: 76.9600
        }
    },


    {
        id: "VH-003",
        driver: "Rahul",
        speed: 55,
        fuel: 70,
        status: "Moving",
        location: {
            lat: 11.0300,
            lng: 76.9500
        }
    }

];



function sendVehicleUpdates(io){


    setInterval(()=>{


        vehicles.forEach(vehicle=>{


            if(vehicle.status === "Moving"){


                vehicle.location.lat += 0.0001;

                vehicle.location.lng += 0.0001;


            }


        });



        io.emit(
            "vehicleUpdate",
            vehicles
        );


    },3000);


}



module.exports = sendVehicleUpdates;