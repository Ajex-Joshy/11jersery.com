import React from "react";
import FormInput from "../../../../components/FormInput";

const CouponForm = ({ formData, onChange }) => {
  return (
    <form>
      <FormInput
        label="Discount Value"
        name="discountValue"
        type="number"
        value={formData.discountValue}
        onChange={onChange}
        min="0"
        max="100"
      />
      <FormInput
        label="Minimum Purchase Amount"
        name="minPurchaseAmount"
        type="number"
        value={formData.minPurchaseAmount}
        onChange={onChange}
        min="0"
      />
      {formData.maxDiscountAmount !== undefined && (
        <FormInput
          label="Maximum Discount Amount"
          name="maxDiscountAmount"
          type="number"
          value={formData.maxDiscountAmount}
          onChange={onChange}
          min="0"
        />
      )}
      <FormInput
        label="Usage Limit"
        name="usageLimit"
        type="number"
        value={formData.usageLimit}
        onChange={onChange}
        min="0"
      />
      <FormInput
        label="Per User Limit"
        name="perUserLimit"
        type="number"
        value={formData.perUserLimit}
        onChange={onChange}
        min="1"
      />
    </form>
  );
};

export default CouponForm;
