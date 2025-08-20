import { combineReducers } from "redux";
import authReducer from "./authSlice";
import usersReducer from "./usersSlice";
import donationReducer from "./donationSlice";

export default combineReducers({
  auth: authReducer,
  users: usersReducer,
  donation: donationReducer,
});
