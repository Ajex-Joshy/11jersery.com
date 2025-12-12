import React from "react";
import { Wallet, Plus } from "lucide-react";
import { formatRupee } from "../../../../../utils/currency";

const WalletBalanceCard = ({ balance }) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-black text-white p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
          <Wallet size={32} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">
            Available Balance
          </p>
          <h2 className="text-3xl font-bold">{formatRupee(balance)}</h2>
        </div>
      </div>

      {/* <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md active:scale-95 transform duration-100">
        <Plus size={18} />
        Add Money
      </button> */}
    </div>
  );
};

export default WalletBalanceCard;
