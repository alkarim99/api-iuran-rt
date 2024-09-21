const model = require("../repositories/expense.repository")
const {
  idSchema,
  createSchema,
  updateSchema,
  filterSchema,
} = require("../dto/expense/request")
const { expenseEntity } = require("../entities/expense.entity")

const getAll = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req?.query)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = await model.getAll(
      value?.keyword,
      value?.sort_by,
      value?.order,
      value?.page,
      value?.limit
    )
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    })
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: error.message,
    })
  }
}

const getByID = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = await model.getByID(value?.id)
    res.send({
      status: true,
      message: "Get data success",
      data,
    })
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: error.message,
    })
  }
}

const create = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req?.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const expense = new expenseEntity(value)
    const insertedId = await model.create(expense)
    if (insertedId) {
      res.send({
        status: true,
        message: "Expense created successfully",
        insertedId,
      })
    } else {
      res.status(400).send({
        status: false,
        message: "Error creating data",
      })
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error creating data",
      error: error.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req?.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const isUpdated = await model.update(value)
    if (isUpdated) {
      res.send({
        status: true,
        message: "Expense updated successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to update expense. Data not found.",
      })
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error updating data",
      error: error.message,
    })
  }
}

const deleteExpense = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }
    const isDeleted = await model.deleteExpense(value?.id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "Expense deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to delete expense. Data not found.",
      })
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error deleting data",
      error: error.message,
    })
  }
}

module.exports = {
  getAll,
  getByID,
  create,
  update,
  deleteExpense,
}
