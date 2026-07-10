import "./VehicleTable.css";


function VehicleTable({vehicles}){


    return(

        <div className="table-container">


            <table>


                <thead>

                    <tr>

                        <th>
                            Vehicle ID
                        </th>

                        <th>
                            Driver
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Speed
                        </th>

                        <th>
                            Fuel
                        </th>


                    </tr>

                </thead>



                <tbody>


                {
                    vehicles.map((vehicle)=>(


                        <tr key={vehicle._id}>


                            <td>
                                {vehicle.vehicleId}
                            </td>


                            <td>
                                {vehicle.driverName}
                            </td>


                            <td>
                                {vehicle.status}
                            </td>


                            <td>
                                {vehicle.speed} km/h
                            </td>


                            <td>
                                {vehicle.fuel} %
                            </td>


                        </tr>


                    ))
                }


                </tbody>


            </table>


        </div>

    )


}


export default VehicleTable;