import PropTypes from "prop-types";

const PaymentMethodOption = ({
  id,
  title,
  description,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  selected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`
        relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
        ${
          selected
            ? "border-black bg-gray-50 ring-1 ring-black"
            : "border-gray-200 hover:border-gray-300 bg-white"
        }
      `}
    >
      <div
        className={`p-3 rounded-full ${
          selected ? "bg-black text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3
          className={`font-bold ${selected ? "text-black" : "text-gray-900"}`}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-black" : "border-gray-300"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
      </div>
    </div>
  );
};

PaymentMethodOption.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PaymentMethodOption;
