import { Link, Navigate } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { useState, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInsessions } from "../common/session";
import { UserContext } from "../App";
import { authWtihGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  const [formData, setFormData] = useState({});
  let { userAuth, setUserAuth } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInsessions("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handlesSubmit = (e) => {
    e.preventDefault();
    let serverRoute = type == "sign-in" ? "/signin" : "/signup";
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    let { fullname, email, password } = formData;

    if (fullname && fullname.length < 3) {
      return toast.error("fullname must be at least 3 characters");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Invalid Email");
    }

    if (!passwordRegex.test(password)) {
      return toast.error("Use Strong Password");
    }
    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWtihGoogle()
      .then((user) => {
        console.log(user);
        let serverRoute = "/google-auth";
        let formData = {
          access_token: user.accessToken,
        };
        userAuthThroughServer(serverRoute, formData);
      })
      .catch((err) => {
        toast.error("Trouble login through Google Auth");
        return console.log(err);
      });
  };
  return userAuth?.access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form onSubmit={handlesSubmit} className="w-[80%] max-w-[400px]">
          <h1 className="text-3xl font-gelasio capitalize text-center mb-10">
            {type === "sign-in" ? "Welcome back" : "join us today"}
          </h1>
          {type === "sign-up" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              id="fullname"
              icon="fi-rr-user"
              handleChange={handleChange}
            />
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            id="email"
            icon="fi-rr-envelope"
            handleChange={handleChange}
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            id="password"
            icon="fi-rr-key"
            handleChange={handleChange}
          />
          <button className="btn-dark center mt-5">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </button>
          <div className="relative w-full flex items-center gap-2 my-5 opacity-30 uppercase text-black font-bold">
            <hr className="w-1/2 border-black"></hr>
            <p>or</p>
            <hr className="w-1/2 border-black"></hr>
          </div>
          <button
            onClick={handleGoogleAuth}
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
          >
            <img className="w-5 " src={googleIcon} />
            continue with google
          </button>
          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account{" "}
              <Link to="/signup" className="undlerline text-black text-xl ml-1">
                {" "}
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member ?{" "}
              <Link to="/signin" className="undlerline text-black text-xl ml-1">
                {" "}
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
