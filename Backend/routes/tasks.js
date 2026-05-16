const express = require("express");
const router = express.Router();
const db = require("../db");


// =======================
// GET ALL TASKS
// =======================
router.get("/", (req, res) => {
    db.query("SELECT * FROM tasks", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


// =======================
// CREATE TASK
// =======================
router.post("/", (req, res) => {

    let { title, description, priority } = req.body;

    // DEFAULT PRIORITY SAFETY
    if (!priority) {
        priority = "Medium";
    }

    db.query(
        "INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)",
        [title, description, priority],
        (err, result) => {
            if (err) return res.status(500).send(err);

            res.json({
                message: "Task added",
                id: result.insertId
            });
        }
    );
});


// =======================
// UPDATE TASK (WITH LOCK)
// =======================
router.put("/:id", (req, res) => {

    const { title, description, status, priority } = req.body;

    // Step 1: check if task exists + status
    db.query(
        "SELECT status FROM tasks WHERE id=?",
        [req.params.id],
        (err, result) => {

            if (err) return res.status(500).send(err);

            if (!result || result.length === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            // Step 2: block update if completed
            if (result[0].status == 1) {
                return res.status(403).json({
                    message: "Completed tasks cannot be edited"
                });
            }

            // Step 3: safe update
            let safePriority = priority || "Medium";

            db.query(
                "UPDATE tasks SET title=?, description=?, status=?, priority=? WHERE id=?",
                [title, description, status, safePriority, req.params.id],
                (err) => {
                    if (err) return res.status(500).send(err);

                    res.json({
                        message: "Task updated successfully"
                    });
                }
            );
        }
    );
});


// =======================
// DELETE TASK
// =======================
router.delete("/:id", (req, res) => {

    db.query(
        "DELETE FROM tasks WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send(err);

            res.json({
                message: "Task deleted"
            });
        }
    );
});


module.exports = router;