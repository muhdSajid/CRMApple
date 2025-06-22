export const validateSignup = (values) => {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
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
