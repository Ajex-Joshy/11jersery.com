import Address from "../../models/address.model.js";

export const addAddress = async (userId, addressData) => {
  if (addressData.isDefault) {
    await Address.updateMany(
      { userId, isDeleted: false },
      { $set: { isDefault: false } }
    );
  }
  const newAddress = await Address.create({
    userId,
    ...addressData,
  });
  return newAddress;
};

export const getAllAddresses = async (userId) => {
  const addresses = await Address.find({ userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -isDeleted");
  return addresses;
};

export const editAddress = async (addressId, updateData) => {
  console.log(addressId, updateData);
  if (updateData.isDefault) {
    const address = await Address.findById(addressId);
    if (address) {
      await Address.updateMany(
        { userId: address.userId, isDeleted: false },
        { $set: { isDefault: false } }
      );
    }
  }
  const updated = await Address.findByIdAndUpdate(addressId, updateData, {
    new: true,
  });
  return updated;
};

export const deleteAddress = async (addressId) => {
  const deleted = await Address.findByIdAndUpdate(
    addressId,
    { isDeleted: true },
    { new: true }
  );
  return deleted;
};

export const getAddressById = async (addressId) => {
  const address = await Address.findOne({
    _id: addressId,
    isDeleted: false,
  }).select("-__v -createdAt -updatedAt -isDeleted");
  return address;
};
