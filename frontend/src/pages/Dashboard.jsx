import Layout from "../components/Layout/Layout";

import useVehicles from "../hooks/useVehicles";

import DashboardCards from "../components/DashboardCards/DashboardCards";

import LiveMap from "../components/LiveMap/LiveMap";

import VehicleTable from "../components/VehicleTable/VehicleTable";

import LiveAlerts from "../components/LiveAlerts/LiveAlerts";



function Dashboard(){


    const vehicles = useVehicles();



    return(


        <Layout>


            <h1 style={{color:"white"}}>
                FleetDash Dashboard
            </h1>



            <DashboardCards

                vehicles={vehicles}

            />



            <h2 style={{color:"white"}}>
                Live Map
            </h2>



            <LiveMap

                vehicles={vehicles}

            />



            <h2 style={{color:"white"}}>
                Vehicle Details
            </h2>



            <VehicleTable

                vehicles={vehicles}

            />



            <h2 style={{color:"white"}}>
                Live Alerts
            </h2>



            <LiveAlerts

                vehicles={vehicles}

            />



        </Layout>


    )


}


export default Dashboard;