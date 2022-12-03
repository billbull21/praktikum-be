var express = require("express");
const {
  createUserValidation,
  loginValidation,
} = require("../../middleware/input-validation");
var router = express.Router();
router.get("/", (req, res) => {
  return res.send({
    project: "API v1 Web Service Praktikum Back-ENd",
  });
});
var userApi = require("../../api/controller/UserController");
// User
router.get("/user", userApi.get);
router.get("/user/:id", userApi.getById);
router.post("/user", createUserValidation, userApi.create);
router.put("/user/:id", userApi.update);
router.delete("/user/:id", userApi.delete);
router.post("/user/login", loginValidation, userApi.login);
module.exports = router;
