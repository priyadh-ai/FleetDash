import {useEffect,useState} from "react";
import axios from "axios";


function useVehicles(){

    const [vehicles,setVehicles] = useState([]);


    useEffect(()=>{


        axios
        .get("http://localhost:5000/api/vehicles")

        .then((res)=>{

            setVehicles(res.data);

        })

        .catch((err)=>{

            console.log(
                "Vehicle Fetch Error:",
                err
            );

        });


    },[]);



    return vehicles;

}


export default useVehicles;