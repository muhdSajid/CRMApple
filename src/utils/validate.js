import { requiredVal, emailVal } from "../constants/validation";

export const validateSignup = (values) => {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = requiredVal;
  }

  if (!values.lastName.trim()) {
    errors.lastName = requiredVal;
  }

  if (!values.email.trim()) {
    errors.email = requiredVal;
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = emailVal;
  }

  if (!values.password) {
    errors.password = requiredVal;
  } else {
    if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (!/[A-Z]/.test(values.password)) {
      errors.password = "Include at least one uppercase letter.";
    }
    if (!/[0-9]/.test(values.password)) {
      errors.password = "Include at least one number.";
    }
    if (!/[!@#$%^&*]/.test(values.password)) {
      errors.password = "Include at least one special character.";
    }
  }

  return errors;
};

export const validateAddMedicine = (values) => {
  const errors = {};

  if (!values.medicineName.trim()) {
    errors.medicineName = requiredVal;
  }

  if (!values.stockThreshold.trim()) {
    errors.stockThreshold = requiredVal;
  } else if (isNaN(values.stockThreshold) || parseFloat(values.stockThreshold) < 0) {
    errors.stockThreshold = "Stock threshold must be a positive number";
  }

  return errors;
};