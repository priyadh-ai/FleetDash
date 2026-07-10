import "./DashboardCards.css";


function DashboardCards({vehicles}){


    const totalVehicles = vehicles.length;


    const activeVehicles = vehicles.filter(
        (vehicle)=>vehicle.status === "Active"
    ).length;


    const offlineVehicles = totalVehicles - activeVehicles;


    const averageSpeed = vehicles.length > 0
    ?
    Math.round(
        vehicles.reduce(
            (sum, vehicle)=> sum + vehicle.speed,
            0
        ) / vehicles.length
    )
    :
    0;



    return(

        <div className="cards">


            <div className="card">

                <h3>
                    Total Vehicles
                </h3>

                <h1>
                    {totalVehicles}
                </h1>

            </div>



            <div className="card">

                <h3>
                    Active Vehicles
                </h3>

                <h1>
                    {activeVehicles}
                </h1>

            </div>




            <div className="card">

                <h3>
                    Offline Vehicles
                </h3>

                <h1>
                    {offlineVehicles}
                </h1>

            </div>




            <div className="card">

                <h3>
                    Average Speed
                </h3>

                <h1>
                    {averageSpeed} km/h
                </h1>

            </div>


        </div>

    )


}


export default DashboardCards;