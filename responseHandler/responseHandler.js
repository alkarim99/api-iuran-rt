const success = (data) => {
    return {
        status: true,
        message: "Success",
        data,
    }
}

const error = (err) => {
    return {
        status: false,
        message: "Error",
        error: err.message,
    }
}

module.exports = { success, error }