import { combineReducers } from "redux";
import authReducer from "./authSlice";
import usersReducer from "./usersSlice";

export default combineReducers({
  auth: authReducer,
  users: usersReducer,
});
