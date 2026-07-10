import "./Navbar.css";


function Navbar(){


function logout(){

localStorage.removeItem("isLoggedIn");

window.location.href="/";

}


return(

<nav className="navbar">


<h2>
Dashboard
</h2>


<div>

<span>
Admin
</span>


<button onClick={logout}>
Logout
</button>


</div>


</nav>


)

}


export default Navbar;