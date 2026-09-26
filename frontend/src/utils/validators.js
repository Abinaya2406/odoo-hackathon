/**
 * Form field validation helpers
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required.`;
  }
  return null;
};

export const validateNumber = (value, fieldName = 'Value', min = 0) => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required.`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}.`;
  }
  return null;
};
