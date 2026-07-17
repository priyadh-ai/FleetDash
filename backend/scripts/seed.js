require("dotenv").config({ path: __dirname + "/../.env" });

const mongoose = require("mongoose");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding");

    // Clear old data
    await User.deleteMany({});
    await Vehicle.deleteMany({});

    // Create Admin User
    await User.create({
      name: "Admin User",
      email: "admin@fleetdash.com",
      password: "123456",
      role: "Admin"
    });
    console.log("Admin user created");

    // Create Manager User
    await User.create({
      name: "Fleet Manager",
      email: "manager@fleetdash.com",
      password: "123456",
      role: "Manager"
    });
    console.log("Manager user created");

    // Create Driver User
    await User.create({
      name: "Driver User",
      email: "driver@fleetdash.com",
      password: "123456",
      role: "Driver"
    });
    console.log("Driver user created");

    // Sample Vehicles with diverse types
    const vehicles = [
      {
        vehicleId: "TRUCK-001",
        driver: "Arun Kumar",
        phone: "+91-9876543210",
        status: "Active",
        type: "Truck",
        speed: 62,
        heading: 45,
        location: { lat: 11.0168, lng: 76.9558 },
        fuel: 78,
        distance: 12500,
        engineTemp: 92,
        batteryLevel: 100,
        tirePressure: 36
      },
      {
        vehicleId: "TRUCK-002",
        driver: "Rajesh Singh",
        phone: "+91-9876543211",
        status: "Active",
        type: "Truck",
        speed: 85,
        heading: 180,
        location: { lat: 12.9716, lng: 77.5946 },
        fuel: 45,
        distance: 8900,
        engineTemp: 98,
        batteryLevel: 100,
        tirePressure: 34
      },
      {
        vehicleId: "TRUCK-003",
        driver: "Suresh Reddy",
        phone: "+91-9876543212",
        status: "Active",
        type: "Truck",
        speed: 45,
        heading: 90,
        location: { lat: 13.0827, lng: 80.2707 },
        fuel: 92,
        distance: 15200,
        engineTemp: 88,
        batteryLevel: 100,
        tirePressure: 37
      },
      {
        vehicleId: "TRUCK-004",
        driver: "Priya Sharma",
        phone: "+91-9876543213",
        status: "Active",
        type: "Truck",
        speed: 72,
        heading: 270,
        location: { lat: 19.0760, lng: 72.8777 },
        fuel: 55,
        distance: 6700,
        engineTemp: 95,
        batteryLevel: 100,
        tirePressure: 35
      },
      {
        vehicleId: "CAR-001",
        driver: "Vikram Patel",
        phone: "+91-9876543214",
        status: "Active",
        type: "Car",
        speed: 55,
        heading: 135,
        location: { lat: 17.3850, lng: 78.4867 },
        fuel: 70,
        distance: 3400,
        engineTemp: 90,
        batteryLevel: 85,
        tirePressure: 32
      },
      {
        vehicleId: "BUS-001",
        driver: "Manoj Verma",
        phone: "+91-9876543215",
        status: "Active",
        type: "Bus",
        speed: 38,
        heading: 225,
        location: { lat: 28.6139, lng: 77.2090 },
        fuel: 65,
        distance: 45000,
        engineTemp: 96,
        batteryLevel: 100,
        tirePressure: 38
      },
      {
        vehicleId: "VAN-001",
        driver: "Anita Gupta",
        phone: "+91-9876543216",
        status: "Active",
        type: "Van",
        speed: 40,
        heading: 315,
        location: { lat: 22.5726, lng: 88.3639 },
        fuel: 82,
        distance: 2100,
        engineTemp: 87,
        batteryLevel: 90,
        tirePressure: 34
      },
      {
        vehicleId: "TRUCK-005",
        driver: "Deepak Joshi",
        phone: "+91-9876543217",
        status: "Offline",
        type: "Truck",
        speed: 0,
        heading: 0,
        location: { lat: 11.0200, lng: 76.9600 },
        fuel: 12,
        distance: 9800,
        engineTemp: 45,
        batteryLevel: 60,
        tirePressure: 30
      },
      {
        vehicleId: "BIKE-001",
        driver: "Ravi Kumar",
        phone: "+91-9876543218",
        status: "Active",
        type: "Bike",
        speed: 30,
        heading: 60,
        location: { lat: 23.0225, lng: 72.5714 },
        fuel: 88,
        distance: 800,
        engineTemp: 82,
        batteryLevel: 100,
        tirePressure: 28
      },
      {
        vehicleId: "TRUCK-006",
        driver: "Sunil Mehta",
        phone: "+91-9876543219",
        status: "Offline",
        type: "Truck",
        speed: 0,
        heading: 0,
        location: { lat: 11.0300, lng: 76.9700 },
        fuel: 8,
        distance: 18000,
        engineTemp: 35,
        batteryLevel: 45,
        tirePressure: 29
      },
      {
        vehicleId: "CAR-002",
        driver: "Neha Kapoor",
        phone: "+91-9876543220",
        status: "Active",
        type: "Car",
        speed: 48,
        heading: 10,
        location: { lat: 15.2993, lng: 74.1240 },
        fuel: 73,
        distance: 5200,
        engineTemp: 89,
        batteryLevel: 95,
        tirePressure: 33
      },
      {
        vehicleId: "BUS-002",
        driver: "Rahul Jain",
        phone: "+91-9876543221",
        status: "Active",
        type: "Bus",
        speed: 35,
        heading: 200,
        location: { lat: 26.8467, lng: 80.9462 },
        fuel: 60,
        distance: 32000,
        engineTemp: 94,
        batteryLevel: 100,
        tirePressure: 37
      }
    ];

    await Vehicle.insertMany(vehicles);
    console.log(`${vehicles.length} vehicles inserted`);
    console.log("Seed completed successfully");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();