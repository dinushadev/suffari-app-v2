export const validationRegex = {
  name: /^[a-zA-Z\s]*$/,
  countryCode: /^\+[1-9]\d{0,3}$/, // New regex for country codes, e.g., +1, +91
  localPhoneNumber: /^[0-9]{7,15}$/, // New regex for local phone numbers (7-15 digits)
};

export const validationMessages = {
  name: {
    empty: 'Name cannot be empty.',
    invalid: 'Name can only contain letters and spaces.',
  },
  countryCode: {
    empty: 'Country code cannot be empty.',
    invalid: 'Please enter a valid country code (e.g., +1, +91).',
  },
  phoneNumber: {
    empty: 'Phone number cannot be empty.',
    invalid: 'Please enter a valid phone number (7-15 digits).',
  },
};

