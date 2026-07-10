import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";


import "./DashboardCharts.css";



function DashboardCharts({vehicles}){


const data = vehicles.map((vehicle)=>({

name:vehicle.id,

speed:vehicle.speed

}));



return(


<div className="chart-card">


<h2>
Vehicle Speed Chart
</h2>



<ResponsiveContainer width="100%" height={300}>


<BarChart data={data}>


<CartesianGrid strokeDasharray="3 3"/>


<XAxis dataKey="name"/>


<YAxis/>


<Tooltip/>


<Bar
dataKey="speed"
fill="#2563eb"
/>


</BarChart>


</ResponsiveContainer>



</div>


)


}


export default DashboardCharts;