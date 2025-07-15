import React from 'react';

const PriceList = ({ prices }) => {
    console.log('Prices data:', prices); // Debug log

    return (
        <div className="price-list">
            {prices.map((card, index) => {
                // Debug log for each card
                console.log('Card:', card.name);
                console.log('Price Data CT:', card.priceCT);
                console.log('Price Data TCG:', card.priceTCG);
                console.log('Price Data CMK:', card.priceCMK);
                return (
                    <div key={index} className="price-item">
                        <div className="card-info">
                            <img src={card.image_url} alt={card.name} />
                            <h3>{card.name}</h3>
                            <p>CardTrader Price: {card.priceCT}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PriceList;