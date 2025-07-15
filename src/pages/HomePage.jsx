import React, { useState, useEffect } from 'react';
import { fetchBP, fetchCard, fetchTCGPlayerPrices } from '../api/index';
import SearchBar from '../components/SearchBar';
import PriceList from '../components/PriceList';

const HomePage = () => {
    const [prices, setPrices] = useState([]);
    const [filteredPrices, setFilteredPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (cardName, expansion) => {
        try {
            setLoading(true);
            // Get array of cards
            const cardsBP = await fetchBP(cardName, expansion);
            console.log('Cards BP:', cardsBP);
            const cardsData = await fetchTCGPlayerPrices(cardsBP.data);
            
            // Fetch prices for each card
            const cardsWithPrices = await Promise.all(
                cardsData.map(async (card) => {
                    const priceData = await fetchCard(card, expansion);
                    console.log('Price Data Print:', priceData);
                    return {
                        ...card,
                        priceCT: priceData[0].price.formatted || [],
                        priceTCG: card.price.market || [],
                        priceCMK: priceData[2].price.formatted || [],
                        
                    };
                })
            );

            setPrices(cardsWithPrices);
            setFilteredPrices(cardsWithPrices);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Searching cards...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="container">
            <h1>Card Price Search</h1>
            <SearchBar onSearch={handleSearch} />
            {filteredPrices.length > 0 ? (
                <PriceList prices={filteredPrices} />
            ) : (
                <div className="no-results">
                    Search for a card to see prices
                </div>
            )}
        </div>
    );
};

export default HomePage;