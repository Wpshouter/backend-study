const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { configDotenv } = require("dotenv");
const express = require("express");
const app = express();
const port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
configDotenv();
const cors = require("cors");
const uri = process.env.MONGO_URI;
// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db(process.env.DATABASE_NAME);
    const roomCollection = db.collection("rooms");
    const bookingCollection = db.collection("bookings");
    app.post("/rooms", async (req, res) => {
      const room = req.body;
      console.log(room);
      const result = await roomCollection.insertOne(room);
      console.log(result);
      res.json(result);
    });
    app.patch("/rooms/:room_id/edit/", async (req, res) => {
      const room_id = req.params.room_id;
      const updatedRoom = req.body;
      // Find existing room
      const existingRoom = await roomCollection.findOne({
        _id: new ObjectId(room_id),
      });

      // Room not found
      if (!existingRoom) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      // Verify owner
      if (existingRoom.user_id !== updatedRoom.user_id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized action",
        });
      }
      const result = await roomCollection.updateOne(
            {
                _id: new ObjectId(room_id)
            },
            {
                $set: {
                    room_name: updatedRoom.room_name,
                    description: updatedRoom.description,
                    image: updatedRoom.image,
                    floor: updatedRoom.floor,
                    capacity: updatedRoom.capacity,
                    hourly_rate: updatedRoom.hourly_rate,
                    amenities: updatedRoom.amenities
                }
            }
        );

      res.json({
            success: true,
            message: "Room updated successfully",
            result
      });

    });
    app.delete("/rooms/:id", async (req, res) => {
    const roomId = req.params.id;
    const { user_id } = req.body;
    // Find room
    console.log(user_id);
    const room = await roomCollection.findOne({
        _id: new ObjectId(roomId)
    });
    if (!room) {
        return res.status(404).json({
            success: false,
            message: "Room not found"
        });

    }
    if (room.user_id !== user_id) {

        return res.status(403).json({
            success: false,
            message: "Unauthorized action"
        });

    }

    // Optional:
    // Remove room related bookings first
    await bookingCollection.deleteMany({
        room_id: roomId
    });

    // Delete room
    const result = await roomCollection.deleteOne({
        _id: new ObjectId(roomId)
    });

    res.json({
        success: true,
        message: "Room deleted successfully",
        result
    });

});
    app.get("/rooms/:user_id", async (req, res) => {
      const user_id = req.params.user_id;
      console.log(user_id);
      const result = await roomCollection.find({ user_id: user_id }).toArray();
      console.log(result);
      res.json(result);
    });
    app.get("/rooms", async (req, res) => {
      const result = await roomCollection.find().toArray();
      console.log(result);
      res.json(result);
    });

    app.get("/room/:room_id", async (req, res) => {
      const room_id = req.params.room_id;
      const result = await roomCollection.findOne({
        _id: new ObjectId(room_id),
      });
      //console.log(result);
      res.json(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const existingBooking = await bookingCollection.findOne({
        room_id: booking.room_id,
        booking_date: booking.booking_date,
        $and: [
          {
            start_time: {
              $lt: booking.end_time,
            },
          },
          {
            end_time: {
              $gt: booking.start_time,
            },
          },
        ],
      });
      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: "This room is already booked for the selected time slot.",
        });
      }

      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.json(result);
    });
    app.get("/bookings/:user_id", async (req, res) => {
      const user_id = req.params.user_id;
      const result = await bookingCollection
        .find({
          user_id,
        })
        .toArray();
      //console.log(result);
      res.json(result);
    });

    app.patch("/bookings/:id/cancel", async (req, res) => {
      const bookingId = req.params.id;
      const { user_id } = req.body;

      const booking = await bookingCollection.findOne({
        _id: new ObjectId(bookingId),
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }
      // Verify booking owner
      if (booking.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized action",
        });
      }
      if (booking.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Booking already cancelled",
        });
      }

      const result = await bookingCollection.updateOne(
        {
          _id: new ObjectId(bookingId),
        },
        {
          $set: {
            status: "cancelled",
          },
        },
      );

      res.json({
        success: true,
        message: "Booking cancelled",
        result,
      });
    });

    // Send a ping to confirm a successful connection
    await client.db(process.env.DATABASE_NAME).command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

// Basic GET route
app.get("/", (req, res) => {
  res.send("Backend is live");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
