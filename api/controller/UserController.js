const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
var User = require("../model/User");
const knex = require("../../db/knex");
const bcrypt = require("bcrypt");
exports.get = async function (req, res) {
  try {
    let users = await User.query();
    if (users.length > 0) {
      res.status(200).json({
        success: true,
        data: users,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Data tidak detmukan!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.getById = async function (req, res) {
  try {
    let users = await User.query().where("id", "=", req.params.id);
    if (users.length > 0) {
      res.status(200).json({
        success: true,
        data: users,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Data tidak detmukan!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.create = async function (req, res) {
  try {
    const errors = validationResult(req);
    console.log("ERROR", errors);
    if (!errors.isEmpty())
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    const data = req.body;
    bcrypt.hash(data.password, 10).then(async (hashedPassword) => {
      await User.query()
        .insert({
          nama: data.nama,
          username: data.username,
          telp: data.telp,
          email: data.email,
          alamat: data.alamat,
          gender: data.gender,
          password: hashedPassword,
        })
        .returning([
          "id",
          "username",
          "nama",
          "email",
          "telp",
          "alamat",
          "gender",
        ])
        .then(async (users) => {
          res.status(200).json({
            success: true,
            message: "Anda Berhasil Terdaftar di Sistem Praktikum! ",
            data: {
              username: users.username,
              nama: users.nama,
              email: users.email,
              telp: users.telp,
              alamat: users.alamat,
              gender: users.gender,
            },
          });
        })
        .catch((error) => {
          console.log("ERR:", error);
          res.json({
            success: false,
            message: `Registrasi Gagal, ${error.nativeError.detail} `,
          });
        });
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Registrasi Gagal, Internal server error !",
    });
  }
};
exports.update = async function (req, res) {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: "Endpoint Update User",
    id: id,
  });
};
exports.delete = async function (req, res) {
  try {
    let users = await User.query().deleteById(req.params.id);
    console.log("USERS DELETE", users);
    if (users == 1) {
      res.status(200).json({
        success: true,
        message: "Data berhasil dihapus!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Data tidak detmukan!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.login = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  try {
    const data = req.body;
    const identity = data.identity;
    const password = data.password;
    const cek_user = await User.query().where((builder) => {
      builder.where("username", identity).orWhere("email", identity);
    });
    // Akan menghasilkan query yg sama seperti select * from users where (username = 'identity'  or email = 'identity'
    console.log("USER:", cek_user.length);
    if (cek_user.length > 0) {
      const data_user = cek_user[0];
      bcrypt
        .compare(password, data_user.password)
        .then(async (isAuthenticated) => {
          if (!isAuthenticated) {
            res.json({
              success: false,
              message: "Password yang Anda masukkan, salah !",
            });
          } else {
            const data_jwt = {
              username: data_user.username,
              email: data_user.email,
            };
            const jwt_token = jwt.sign(data_jwt, process.env.API_SECRET, {
              expiresIn: "10m",
            });
            res.status(200).json({
              success: true,
              data: data_jwt,
              jwt_token,
            });
          }
        });
    } else {
      res.status(400).json({
        success: false,
        message: "Username atau Email tidak terdaftar !",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};