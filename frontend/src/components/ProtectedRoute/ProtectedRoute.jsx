import { Navigate } from "react-router-dom";


function ProtectedRoute({children}){


const login =
localStorage.getItem("isLoggedIn");


if(login !== "true"){

return <Navigate to="/" />;

}


return children;


}


export default ProtectedRoute;