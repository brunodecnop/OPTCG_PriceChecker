import React from 'react';

const PriceList = ({ prices }) => {
    const cardTraderBaseUrl = 'https://www.cardtrader.com';

    return (
        <div className="price-list">
            {prices.map((card) => (
                <div key={card.id} className="price-item">
                    <img 
                        src={`${cardTraderBaseUrl}${card.image?.show?.url}`} 
                        alt={card.name} 
                        className="card-image"
                    />
                    <div className="card-content">
                        <h3>{card.name}</h3>
                        <p className="expansion-name">
                           Expansão: {card.expansion_name}
                        </p>
                        <div className="price-data">
                            <div className="price-entry">
                                <span>CardTrader:</span>
                                <strong>{card.priceCT ? `€ ${card.priceCT}` : 'N/A'}</strong>
                            </div>
                            <div className="price-entry">
                                <span>TCGPlayer:</span>
                                <strong>{card.priceTCG ? `$ ${card.priceTCG}` : 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PriceList;