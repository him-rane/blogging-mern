import express, { json } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import "dotenv/config";

import { getAuth } from "firebase-admin/auth";

import User from "./Schema/User.js";
import { nanoid } from "nanoid";
import cors from "cors";

import admin from "firebase-admin";
import serviceAccountKey from "./blogging-website-49f02-firebase-adminsdk-vcog9-74d9a2c62c.json" assert { type: "json" };

const server = express();
let PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose
  .connect(process.env.DB_URL, {
    autoIndex: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  });

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
  return await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageName,
    Expires: 3600,
    ContentType: "image/jpeg",
  });
};

const formatDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
  return {
    access_token,
    profile: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    email: user.personal_info.email,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

server.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/signup", async (req, res) => {
  try {
    let { fullname, email, password } = req.body;

    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "fullname must be at least 3 characters" });
    }
    if (!emailRegex.test(email)) {
      return res.status(403).json({ error: "Invalid Email" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(403).json({ error: "Use Strong Password" });
    }

    bcrypt.hash(password, 8, async (err, hash_password) => {
      let username = await generateUsername(email);
      let user = new User({
        personal_info: {
          fullname,
          email,
          password: hash_password,
          username,
        },
      });

      await user
        .save()
        .then((u) => {
          return res.status(200).json(formatDataToSend(u));
        })
        .catch((err) => {
          if (err.code === 11000) {
            return res.status(500).json({ error: "Email already exists" });
          }
          res.status(500).json({ error: err.message });
        });
    });

    // return res.status(200).json({ status: "true" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "Account was created by Google. Try logging in again with your Google account",
        });
      }
      if (!user) {
        return res.status(403).json({ error: "Invalid Credential" });
      }
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result) {
          return res.status(200).json(formatDataToSend(user));
        } else {
          return res.status(403).json({ error: "Invalid Credential" });
        }
      });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");
      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.full_name personal_info.username personal_info.profile_img google_auth "
        )
        .then((u) => {
          return u || null;
        })
        .catch((e) => {
          return res.status(500).json({ error: e.message });
        });

      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without google please log in with password to access the account",
          });
        }
      } else {
        let username = await generateUsername(email);

        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
            // return res.status(200).json(formatDataToSend(u));
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      }

      return res.status(200).json(formatDataToSend(user));
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to long with google auth" });
    });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
