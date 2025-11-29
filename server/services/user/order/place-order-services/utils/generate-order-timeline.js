export const generateOrderTimeline = () => {
  const now = new Date();
  return {
    placedAt: now,
    confirmedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    shippedAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
  };
};
