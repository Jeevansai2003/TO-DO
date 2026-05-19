const express = require("express");
const router = express.Router();
const db = require("../db");


// =======================
// GET ACTIVE TASKS
// =======================
router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM tasks WHERE deleted=0",
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        }
    );
});


// =======================
// GET RECYCLE BIN TASKS
// =======================
router.get("/recycle-bin", (req, res) => {
    db.query(
        "SELECT * FROM tasks WHERE deleted=1",
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        }
    );
});


// =======================
// CREATE TASK
// =======================
router.post("/", (req, res) => {

    let { title, description, priority, due_date } = req.body;

    if (!priority) {
        priority = "Medium";
    }

    // SAFE DATE CONVERSION
    let safeDueDate = due_date
        ? new Date(due_date).toISOString().split("T")[0]
        : null;

    db.query(
        "INSERT INTO tasks (title, description, priority, due_date, deleted) VALUES (?, ?, ?, ?, 0)",
        [title, description, priority, safeDueDate],
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

    const { title, description, status, priority, due_date } = req.body;

    db.query(
        "SELECT status FROM tasks WHERE id=? AND deleted=0",
        [req.params.id],
        (err, result) => {

            if (err) return res.status(500).send(err);

            if (!result || result.length === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            // BLOCK IF COMPLETED
            if (result[0].status == 1) {
                return res.status(403).json({
                    message: "Completed tasks cannot be edited"
                });
            }

            let safePriority = priority || "Medium";

            let safeDueDate = due_date
                ? new Date(due_date).toISOString().split("T")[0]
                : null;

            db.query(
                `UPDATE tasks 
                 SET title=?, description=?, status=?, priority=?, due_date=? 
                 WHERE id=?`,
                [title, description, status, safePriority, safeDueDate, req.params.id],
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
// SOFT DELETE (MOVE TO RECYCLE BIN)
// =======================
router.delete("/:id", (req, res) => {

    db.query(
        "UPDATE tasks SET deleted=1 WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send(err);

            res.json({
                message: "Moved to recycle bin"
            });
        }
    );
});


// =======================
// RESTORE TASK FROM RECYCLE BIN
// =======================
router.put("/restore/:id", (req, res) => {

    db.query(
        "UPDATE tasks SET deleted=0 WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send(err);

            res.json({
                message: "Task restored successfully"
            });
        }
    );
});


module.exports = router;