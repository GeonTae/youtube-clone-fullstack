// require("dotenv").config();
// const express = require("express"); //old way
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = express(); //app as name is convention

const loggerMiddleware = morgan("dev");

//view === like html. what user see
app.set("view engine", "pug"); //view engine
app.set("views", process.cwd() + "/src/views"); //setting route that views is in src
//midware
app.use(loggerMiddleware);
app.use(express.urlencoded({ extended: true })); //help understanding to transform form value into JS value
//session midware => remembering everything
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   maxAge: 20000, // 20seconds
    // },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }), //session will be saved in database
  })
);
//session ID will be saved in cookie and send it to browser
app.use(localsMiddleware);
//router
app.use("/uploads", express.static("uploads")); //expose folder
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
