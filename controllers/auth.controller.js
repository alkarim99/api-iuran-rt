const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const { signUpSchema, signInSchema } = require("../dto/auth/request");
const { SignUpResponse, SignInResponse } = require("../dto/auth/response");
const { UserEntity } = require("../entities/user.entity");
const usersRepository = require("../repositories/users.repository");

const signUp = async (req, res) => {
  try {
    const { error, value } = signUpSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }
    if (await usersRepository.isEmailUnique(value.email)) {
      return res.status(400).send({
        status: false,
        message: "Email already exists.",
      });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    value.password = await bcrypt.hash(value.password, salt);

    const user = new UserEntity(value);
    const insertedId = await usersRepository.create(user);

    if (insertedId) {
      const responseData = new SignUpResponse(user);
      return res.send({
        status: true,
        message: "User created successfully",
        data: responseData,
      });
    }

    res.status(400).send({
      status: false,
      message: "Failed to create user.",
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error Sign Up",
      error: err.message,
    });
  }
};

const signIn = async (req, res) => {
  try {
    console.time("signIn:total");

    console.time("signIn:validate");
    const { error, value } = signInSchema.validate(req.body);
    if (error) {
      console.timeEnd("signIn:validate");
      console.timeEnd("signIn:total");
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }
    console.timeEnd("signIn:validate");

    const { email, password } = value;

    console.time("signIn:dbLookup");
    const checkUser = await usersRepository.getByEmail(email);
    console.timeEnd("signIn:dbLookup");
    if (!checkUser) {
      console.timeEnd("signIn:total");
      return res.status(400).json({
        status: false,
        message: "Account not registered!",
      });
    }

    console.time("signIn:bcryptCompare");
    const isPasswordValid = await bcrypt.compare(password, checkUser?.password);
    console.timeEnd("signIn:bcryptCompare");
    if (!isPasswordValid) {
      console.timeEnd("signIn:total");
      return res.status(400).json({
        status: false,
        message: "Wrong email and password combination!",
      });
    }

    console.time("signIn:jwtSign");
    const { password: _, ...userPayload } = checkUser;
    const token = jwt.sign(userPayload, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "7d",
    });
    console.timeEnd("signIn:jwtSign");

    const dataResponse = new SignInResponse(checkUser);
    console.timeEnd("signIn:total");
    return res.send({
      status: true,
      message: "Sign In Success!",
      data: dataResponse,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error Sign In",
      error: err.message,
    });
  }
};

module.exports = { signUp, signIn };
