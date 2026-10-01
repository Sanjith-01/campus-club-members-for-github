const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const Member = require("../models/Member");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });


// 1. Add Member
app.post("/members", async (req, res) => {
    try {
        const member = new Member(req.body);
        const savedMember = await member.save();

        res.status(201).json(savedMember);
    } catch (error) {
        res.status(500).json({
            message: "Error adding member",
            error: error.message
        });
    }
});


// 2. Display members of a club with points greater than specified value
app.get("/members/club/:clubName/:points", async (req, res) => {
    try {
        const members = await Member.find({
            clubName: req.params.clubName,
            points: {
                $gt: Number(req.params.points)
            }
        });

        res.json(members);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 3. Search member using Member ID
app.get("/members/id/:memberId", async (req, res) => {
    try {
        const member = await Member.findOne({
            memberId: req.params.memberId
        });

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 4. Display only Name, Club Name, Role and Points
app.get("/members/details/:memberId", async (req, res) => {
    try {
        const member = await Member.findOne(
            {
                memberId: req.params.memberId
            },
            {
                _id: 0,
                name: 1,
                clubName: 1,
                role: 1,
                points: 1
            }
        );

        res.json(member);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 5. Update role and points
app.put("/members/:memberId", async (req, res) => {
    try {
        const member = await Member.findOneAndUpdate(
            {
                memberId: req.params.memberId
            },
            {
                role: req.body.role,
                points: req.body.points
            },
            {
                new: true
            }
        );

        res.json(member);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 6. Increase points of all members in a club
app.put("/members/club/:clubName/increase/:points", async (req, res) => {
    try {
        const result = await Member.updateMany(
            {
                clubName: req.params.clubName
            },
            {
                $inc: {
                    points: Number(req.params.points)
                }
            }
        );

        res.json({
            message: "Points increased successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 7. Search members within points range
app.get("/members/points/:min/:max", async (req, res) => {
    try {
        const members = await Member.find({
            points: {
                $gte: Number(req.params.min),
                $lte: Number(req.params.max)
            }
        });

        res.json(members);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 8. Delete member using Member ID
app.delete("/members/:memberId", async (req, res) => {
    try {
        const member = await Member.findOneAndDelete({
            memberId: req.params.memberId
        });

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.json({
            message: "Member deleted successfully",
            member: member
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// 9. Display all members in descending order of points
app.get("/members", async (req, res) => {
    try {
        const members = await Member.find()
            .sort({
                points: -1
            });

        res.json(members);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Campus Club running on port ${PORT}`);
});