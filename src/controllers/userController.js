import e from "express";
import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

//==============================================================
//==============================================================
export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });
//--------------------------------------------------------------
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }

  //   const exists = await User.exists({ $or: [{ username }, { email }] });
  const usernameExists = await User.exists({ username });
  const emailExists = await User.exists({ email });
  if (usernameExists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This username is already taken.",
    });
  }
  if (emailExists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};
//==============================================================
//==============================================================
export const getLogin = (req, res) =>
  res.render("users/login", { pageTitle: "Login" });
//--------------------------------------------------------------
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  //check if account exists
  //   const exists = await User.exists({ username });
  const user = await User.findOne({ username, githubLoginOnly: false });
  // to make sure it's only for someone who created account without github
  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  //check if password correct
  const okPassword = await bcrypt.compare(password, user.password);
  if (!okPassword) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }
  //   console.log("LOG USER IN! COMMING SOON!");
  req.session.loggedIn = true; // session wiill be different in different browser
  req.session.user = user;
  return res.redirect("/");
};
//==============================================================
//==============================================================
//user router
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
//--------------------------------------------------------------
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code, //github gives us this code
  };

  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json(); //etch gives us data first -> extract it to json

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(emailData);
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    ); //obj format
    // console.log(emailObj);
    //if there is already created email same as github email -> then let it login
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        githubLoginOnly: true,
        password: "",
        location: userData.locaion,
      });
    }
    //if there is no github matched account, create an account
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
//==============================================================
//==============================================================
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
//==============================================================
//==============================================================
export const getEditProfile = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};
export const postEditProfile = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  // === const user = req.session.user.id;

  console.log(file);

  const pageTitle = "Edit Profile";
  try {
    // Check if the username already exists and belongs to a different user
    const findUsername = await User.findOne({ username });
    if (findUsername && String(findUsername._id) !== String(_id)) {
      return res.status(400).render("users/edit-profile", {
        pageTitle,
        errorMessage: "This username is already taken.",
      });
    }

    // Check if the email already exists and belongs to a different user
    const findEmail = await User.findOne({ email });
    // if (findEmail): if this already exists in DB
    // && findEmail._id !== _id : DB_id that is same as session_id should be excluded
    // so that it can help only different DB_id username and email are checked
    if (findEmail && String(findEmail._id) !== String(_id)) {
      return res.status(400).render("users/edit-profile", {
        pageTitle,
        errorMessage: "This email is already taken.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        avatarUrl: file ? file.path : avatarUrl, // if uploaded avatar file exists then give file path, if it doesn't, use old avatar
        name,
        email,
        username,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    // req.session.user = { ...req.session.user, name, email, username, location }; //also have to update on session for frontend
    //...req.session.user is to put original info first so that it can cover other info that was not offered by Edit-profile page
    return res.redirect("/users/edit");
  } catch (error) {
    return res.status(400).render("users/edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "An error occurred while updating your profile.",
    });
  }
};
//==============================================================
//==============================================================
export const getChangePassword = (req, res) => {
  if (req.session.user.githubLoginOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPassword2 },
  } = req;
  //send notification : you changed password

  const okPassword = await bcrypt.compare(oldPassword, password);
  if (!okPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }

  if (newPassword !== newPassword2) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The new password confirmation does not match",
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save(); //await: so that you wait until the hashed password updated in User then move to next step
  req.session.user.password = user.password;

  return res.redirect("/users/edit");
};
//==============================================================
//==============================================================

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await (await User.findById(id)).populate({
    path:"videos",
    populate:{
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }

  // const videos = await Video.find({ owner: user._id });

  return res.render("users/profile", {
    pageTitle: `${user.name}'s Profile`,
    user,
  });
};
// export const remove = (req, res) => res.send("remove User");
export const userHome = (req, res) => res.send("User Home");
