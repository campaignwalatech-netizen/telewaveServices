import React from "react";
import credit from "../assets/credit-card.png";
import bajaj from "../assets/loan.png";
import demat from "../assets/demat.png";
import savings from "../assets/savings.png";

const offers = [
  { img: credit, name: "IndusInd Bank Credit Card", reward: "Earn ₹1500 per successful activation" },
  { img: bajaj, name: "Bajaj EMI Card", reward: "Earn ₹800 per successful activation" },
  { img: demat, name: "Demat Account", reward: "Earn ₹750 per successful opening" },
  { img: savings, name: "Savings Account", reward: "Earn ₹750 per successful opening" },
];

const OffersGrid = () => {
  return (
    <div className="px-6 mt-8">
      <h2 className="text-lg font-semibold mb-4">Available Offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {offers.map((offer, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100 cursor-pointer overflow-hidden"
          >
            <img src={offer.img} alt={offer.name} className="w-full h-32 object-cover" />
            <div className="p-4">
              <h3 className="font-medium">{offer.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{offer.reward}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersGrid;