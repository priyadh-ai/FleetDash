import {Link} from "react-router-dom";

import "./Sidebar.css";


function Sidebar(){


return(

<div className="sidebar">


<h2>
🚚 FleetDash
</h2>


<ul>

<li>
<Link to="/dashboard">
Dashboard
</Link>
</li>


<li>
<Link to="/dashboard">
Vehicles
</Link>
</li>


<li>
<Link to="/dashboard">
Live Map
</Link>
</li>


<li>
<Link to="/dashboard">
Alerts
</Link>
</li>


</ul>


</div>


)

}


export default Sidebar;