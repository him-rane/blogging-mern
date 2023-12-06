import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { UserContext } from "../App";
import { useContext } from "react";
import { removeFromSession } from "../common/session";

const UserNevigationPanel = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };
  return (
    <AnimationWrapper
      transition={{ duration: 0.2 }}
      className="absolute right-0 z-50"
    >
      <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
        <Link to="/editor" className="felx gap-2 link md:hidden pl-8 py-4">
          <i className="fi fi-rr-file-edit"></i>
          <p>Write</p>
        </Link>
        <Link to={`/user/${userAuth?.username}`} className="link  pl-8 py-4">
          Profile
        </Link>
        <Link to={"/dashboard/blogs"} className="link  pl-8 py-4">
          DaseBoard
        </Link>
        <Link to={"/settiings/edit-profile"} className="link  pl-8 py-4">
          Settings
        </Link>

        <span className="absolute border-t border-grey w-[100%]"></span>
        <button
          onClick={signOutUser}
          className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
        >
          <h1 className="font-bold text-xl mg-1 "> Sign Out</h1>
          <p className="text-dark-grey">@{userAuth?.username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};
export default UserNevigationPanel;
