const express = require("express");
const mongoose = require('mongoose');
const { db } = require('./db.config');
const { hallData } = require("./hallSchema");

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to HallBookingAPI-DB")
    })
    .catch((err) => {
        console.log(err)
    });

const PORT = 8000;

const app = express();

app.use(express.json());

app.get('/get', async (req, res) => {

    try {
        const hall = await hallData.find()
        const { ifBooked } = req.query;
        if (ifBooked) {
            const bookedHall = hall.filter((hall) => hall.ifBooked === ifBooked)
            res.status(200).send({
                bookedHall
            })
        } else {
            res.status(202).send({
                message: "All Rooms here!",
                hall
            })
        }
    } catch (error) {
        res.status(500).send({
            message: 'Internal Server error',
            error
        })
    }
})

app.post('/newHall', async (req, res) => {
    try {
        let newhall = await hallData.findOne({ roomNo: req.body.roomNo })

        if (!newhall) {
            let newRoom = await hallData.create(req.body)
            res.status(200).send({
                message: "Welcome! Created new room.",
                newRoom
            })
        } else {
            res.status(400).send({
                message: "Hall Already Exists!"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error
        })
    }
})

function generateBookingID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let bookingID = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        bookingID += characters[randomIndex];
    }

    return bookingID;
};

app.put("/hallbooking", async (req, res) => {
    try {
        const freeHall = await hallData.findOne({ roomNo: req.body.roomNo })
        console.log(freeHall)
        if (freeHall.ifBooked === 'true') {
            res.status(400).send({
                message: "Hall is already booked!"
            })
        } else {
            freeHall.customerName = req.body.customerName;
            freeHall.startTime = req.body.startTime;
            freeHall.endTime = req.body.endTime;
            freeHall.date = req.body.date;
            freeHall.ifBooked = req.body.ifBooked;
            freeHall.bookingID = generateBookingID();
            freeHall.bookingDate = new Date();
            freeHall.bookingStatus = "Booking Confirmed";
            freeHall.save();
            res.status(200).send({
                message: "Hall Booked Successfully!"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server error",
            error
        })
    }
})

app.get('/listRooms', async (req, res) => {
    try {
        const rooms = await hallData.find();
        const bookedRooms = rooms.filter(room => room.ifBooked === 'true');

        const bookedRoomDetails = bookedRooms.map(room => {
            return {
                roomName: room.roomName,
                bookedStatus: room.ifBooked,
                customerName: room.customerName,
                date: room.date,
                startTime: room.startTime,
                endTime: room.endTime
            };
        });

        res.status(200).send({
            bookedRoomDetails
        });
    } catch (error) {
        res.status(500).send({
            message: 'Internal Server error',
            error
        });
    }
});

app.get('/listCustomers', async (req, res) => {
    try {
        const bookedRooms = await hallData.find({ ifBooked: 'true' });

        const customerDetails = bookedRooms.map(room => {
            return {
                customerName: room.customerName,
                roomName: room.roomName,
                date: room.date,
                startTime: room.startTime,
                endTime: room.endTime
            };
        });

        res.status(200).send({
            customerDetails
        });
    } catch (error) {
        res.status(500).send({
            message: 'Internal Server error',
            error
        });
    }
});

app.get('/customerBookings', async (req, res) => {
    try {
        const { customerName } = req.query;

        const customerBookings = await hallData.find({ customerName });

        const bookingDetails = customerBookings.map(booking => {
            return {
                customerName: booking.customerName,
                roomName: booking.roomName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                bookingID: booking.bookingID,
                bookingDate: booking.bookingDate,
                bookingStatus: booking.bookingStatus
            };
        });

        res.status(200).send({
            bookingDetails
        });
    } catch (error) {
        res.status(500).send({
            message: 'Internal Server error',
            error
        });
    }
});

app.listen(PORT, () => console.log("Server Listening in PORT:8000"));