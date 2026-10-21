export const authTestData = {
  signupEmail: process.env.SIGNUP_TEST_EMAIL || `automation_test_${Date.now()}@yopmail.invalid`,
  invalidLoginEmail: 'nonexistent_account_sflow@yopmail.invalid',
  invalidLoginPassword: 'WrongPasswordXYZ99'
};