export const sendAuthResponse = (res, user, token, statusCode = 200) => {
  res.status(statusCode).json({
    data: {
      user,
      token,
    },
  });
};
