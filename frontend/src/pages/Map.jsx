import LiveMap from "../components/LiveMap/LiveMap";


function Map(){


const vehicles=[
{
id:"V001",
speed:45,
fuel:80,
status:"Moving",
location:{
lat:11.0168,
lng:76.9558
}
},

{
id:"V002",
speed:30,
fuel:60,
status:"Stopped",
location:{
lat:11.0200,
lng:76.9600
}
}

];


return(

<div>

<h1>
Live Map
</h1>


<LiveMap vehicles={vehicles}/>


</div>

)


}


export default Map;