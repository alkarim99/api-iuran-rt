const bcrypt = require("bcrypt");
const saltRounds = 10;
const { idSchema, updateSchema } = require("../dto/users/request");
const usersRepository = require("../repositories/users.repository");
const { createLog } = require("../helpers/audit.helper");
const { UsersResponse } = require("../dto/users/response");

const getAll = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await usersRepository.getAll(page, limit);
    const responseData = result.data.map((data) => new UsersResponse(data));
    res.send({
      status: true,
      message: "Get data success",
      data: responseData,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
      perPage: result.perPage,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const getByID = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const data = await usersRepository.getByID(value?.id);
    const responseData = new UsersResponse(data);
    res.send({
      status: true,
      message: "Get data success",
      data: responseData,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

// create users using singup endpoint

const update = async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req?.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const checkData = await usersRepository.getByID(value?.id);
    const payload = {
      id: value?.id,
      name: value?.name ?? checkData?.name,
      email: value?.email ?? checkData?.email,
      password: value?.password ?? checkData?.password,
      role: value?.role ?? checkData?.role,
    };

    const isEmailUnique = await usersRepository.isEmailUnique(
      payload?.email,
      value?.id,
    );
    if (isEmailUnique) {
      return res.status(400).send({
        status: false,
        message: "Email already in use!",
      });
    }

    if (value?.password) {
      const salt = await bcrypt.genSalt(saltRounds);
      payload.password = await bcrypt.hash(value.password, salt);
    }

    const oldData = await usersRepository.getByID(value.id);
    const isUpdated = await usersRepository.update(payload);

    const responseData = new UsersResponse(value);

    await createLog(
      req,
      "UPDATE",
      "USER",
      `Mengubah profil User ID ${value.id}`,
      oldData,
      payload,
      "user",
    );
    res.send({
      status: true,
      message: "User updated successfully",
      data: responseData,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error updating data",
      error: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const oldData = await usersRepository.getByID(value.id);
    const isDeleted = await usersRepository.deleteUser(value?.id);
    if (isDeleted) {
      await createLog(
        req,
        "DELETE",
        "USER",
        `Menghapus User ID ${value.id}`,
        oldData,
        null,
        "user",
      );
      res.send({
        status: true,
        message: "User deleted successfully",
      });
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to delete user. Data not found.",
      });
    }
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error deleting data",
      error: err.message,
    });
  }
};

module.exports = {
  getAll,
  getByID,
  update,
  deleteUser,
};
