import React from "react";
import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";

const PublishForm = () => {
  return (
    <nav className="navbar">
      <Link className="flex-none w-10" to="/">
        <img className="w-full" src={logo}></img>
      </Link>
      <p className="max-md:hidden text-black line-clamp-1 w-full">new blog</p>
      <div className="flex gap-4 ml-auto">
        <button className="btn-dark py-2">Publish</button>
        <button className="btn-dark py-2">save drapft</button>
      </div>
    </nav>
  );
};

export default PublishForm;
