import { postFakeRegister } from "../../../helpers/fakebackend_helper";
import {
  registerUserSuccessful,
  registerUserFailed,
  resetRegisterFlagChange,
} from "./reducer";

// Is user register successful then direct plot user in redux.
export const registerUser = (user: any) => async (dispatch: any) => {
  try {
    // Map first_name (form field) → name (backend field name)
    const payload = {
      name: user.first_name || user.name || "",
      email: user.email,
      password: user.password,
    };

    const data: any = await postFakeRegister(payload);

    if (data && data.status === "success") {
      dispatch(registerUserSuccessful(data));
    } else {
      dispatch(registerUserFailed(data?.message || "Registration failed"));
    }
  } catch (error: any) {
    // Extract the most useful error message from Laravel validation errors
    const message =
      error?.response?.data?.errors?.email?.[0] ||
      error?.response?.data?.errors?.name?.[0] ||
      error?.response?.data?.errors?.password?.[0] ||
      error?.response?.data?.message ||
      "Registration failed. Please try again.";
    dispatch(registerUserFailed(message));
  }
};

export const resetRegisterFlag = () => {
  try {
    const response = resetRegisterFlagChange();
    return response;
  } catch (error) {
    return error;
  }
};