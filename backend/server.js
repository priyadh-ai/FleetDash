const express = require("express");
const cors = require("cors");
const http = require("http");

require("dotenv").config();

const connectDB = require("./config/db");

const vehicleRoutes = require("./routes/vehicleRoutes");


const { Server } = require("socket.io");


const app = express();


app.use(cors());

app.use(express.json());


connectDB();



app.use(
    "/api/vehicles",
    vehicleRoutes
);



app.get("/", (req,res)=>{

    res.send("FleetDash Backend Running");

});



const server = http.createServer(app);



const io = new Server(server,{

    cors:{
        origin:"http://localhost:5173"
    }

});



io.on("connection",(socket)=>{


    console.log(
        "Client Connected:",
        socket.id
    );



    socket.on("disconnect",()=>{

        console.log(
            "Client Disconnected"
        );

    });


});



const PORT = process.env.PORT || 5000;



server.listen(PORT,()=>{


    console.log(
        `Server running on ${PORT}`
    );


});