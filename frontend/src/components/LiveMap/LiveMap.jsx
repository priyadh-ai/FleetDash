import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";


import "leaflet/dist/leaflet.css";

import "./LiveMap.css";



function LiveMap({vehicles}){


    return(

        <MapContainer

            center={[11.0168,76.9558]}

            zoom={13}

            className="map"

        >


            <TileLayer

                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

            />



            {
                vehicles.map((vehicle)=>(


                    <Marker

                        key={vehicle._id}

                        position={[
                            vehicle.location.latitude,
                            vehicle.location.longitude
                        ]}

                    >


                        <Popup>

                            <b>
                                {vehicle.vehicleId}
                            </b>

                            <br/>


                            Driver:
                            {vehicle.driverName}


                            <br/>


                            Speed:
                            {vehicle.speed} km/h


                            <br/>


                            Fuel:
                            {vehicle.fuel}%


                        </Popup>


                    </Marker>


                ))
            }


        </MapContainer>


    )


}



export default LiveMap;