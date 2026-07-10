import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import "./Layout.css";


function Layout({children}){

return(

<div className="layout">

<Sidebar/>


<div className="main">

<Navbar/>


<div className="content">

{children}

</div>


</div>


</div>

)

}


export default Layout;