import {useState} from "react";

import "./Login.css";


function Login(){


const [email,setEmail] = useState("");

const [password,setPassword] = useState("");



function handleLogin(e){

e.preventDefault();


if(email && password){

localStorage.setItem(
"isLoggedIn",
"true"
);


window.location.href="/dashboard";


}

}



return(

<div className="login-container">


<form 
className="login-box"
onSubmit={handleLogin}
>


<h2>
FleetDash Login
</h2>



<input

type="email"

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>



<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



<button>

Login

</button>



</form>


</div>

)


}


export default Login;