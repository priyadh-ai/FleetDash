import "./LiveAlerts.css";


function LiveAlerts({vehicles}){


    const alerts = [];


    vehicles.forEach((vehicle)=>{


        if(vehicle.fuel < 20){

            alerts.push({

                id:vehicle._id,

                message:
                `${vehicle.vehicleId} Low Fuel Alert`

            });

        }



        if(vehicle.speed > 100){

            alerts.push({

                id:vehicle._id,

                message:
                `${vehicle.vehicleId} Overspeed Alert`

            });

        }



        if(vehicle.status === "Offline"){

            alerts.push({

                id:vehicle._id,

                message:
                `${vehicle.vehicleId} Vehicle Offline`

            });

        }


    });



    return(


        <div className="alerts">


            <h2>
                Live Alerts
            </h2>



            {
                alerts.length === 0 ?

                <p>
                    No Alerts ✅
                </p>


                :


                alerts.map((alert)=>(

                    <div

                    className="alert-card"

                    key={alert.id}

                    >

                        🚨 {alert.message}

                    </div>


                ))

            }



        </div>


    )


}


export default LiveAlerts;