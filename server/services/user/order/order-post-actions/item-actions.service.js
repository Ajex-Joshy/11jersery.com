export const markAsCanceled = (item, reason) => {
  item.status = "Cancelled";
  item.cancelReason = reason;
  item.timeline = {
    ...item.timeline,
    cancelledAt: new Date(),
  };
};

export const requestItemReturn = (item, reason) => {
  item.status = "Return Requested";
  item.returnReason = reason;
  item.timeline = {
    ...item.timeline,
    returnRequestedAt: new Date(),
  };
};
