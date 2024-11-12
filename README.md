# YouTube-Clone-Fullstack

Cloning Youtube with Vanilla and NodeJS

## Pages:

- [x] Home
- [x] Join
- [x] Login
- [x] Search
- [x] User Detail
- [x] Eidt Profile
- [x] Change Password
- [x] Upload
- [x] Video Detail
- [x] Edit Video
- [x] Multer Upload to AWS S3

---

## Table of contents

- [Built with](#built-with)

## Built with


| Front-end                          | Back-end                           | Deploy        |
| ---------------------------------- | ---------------------------------- | ------------- |
| - `HTML`                           | - `NodeJS`                         | - `AWS S3`    |
| - `CSS`                            | - `Express`                        | - `Heroku`    |
| - `Typescript`                     | - `MongoDB`                        |               |
| - `Pug`                            | - `Mongoose`                       |               |
| - `SCSS`                           | - `Bcrypt`                         |               |
| - `Webpack`                        | - `Multer`                         |               |
|                                    | - `FFmpeg`                         |               |

---

# youtube Reladed

Root Router
/ -> Home
/join -> Join
/login -> Login
/search -> Search

User Router

/users/:id -> See User
/users/logout -> Log Out
/users/edit/ -> Edit My Profile
/users/remove -> Delete My Profile

Video Router
/videos/:id -> See Video
/videos/:id/edit -> Edit Video
/videos/:id/delete -> Delete Video
/video/upload -> Upload Video

/videos/comments -> Comment on a Video
/videos/comments/delete -> Delete a Comment of a Video

/edit-user (x)
/delete-user (x)
/watch-video (x)
/edit-video (x)
/delete-video (x)
/videos/watch (x) -> /videos/:id
