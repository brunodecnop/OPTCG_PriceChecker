import React, { useState } from 'react';
import { findBlueprints, getPricesForBlueprint } from '../api/index';
import SearchBar from '../components/SearchBar';
import PriceList from '../components/PriceList';

const HomePage = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (cardName, expansion) => {
        if (!cardName.trim()) return;

        setLoading(true);
        setSearched(true);
        setError(null);
        setCards([]);

        try {
            // Passo 1: Encontrar todas as versões da carta (blueprints)
            const blueprints = await findBlueprints(cardName, expansion);

            if (blueprints.length === 0) {
                setLoading(false);
                return;
            }

            // Passo 2: Para cada blueprint, buscar os preços
            const cardsWithPrices = await Promise.all(
                blueprints.map(async (blueprint) => {
                    const prices = await getPricesForBlueprint(blueprint);
                    return {
                        ...blueprint, // id, name, image_url, etc.
                        priceCT: prices.cardtrader,
                        priceTCG: prices.tcgplayer,
                    };
                })
            );

            setCards(cardsWithPrices);

        } catch (err) {
            setError(err.message);
            console.error('Ocorreu um erro na pesquisa:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="loading">A pesquisar cartas e preços...</div>;
        }
        if (error) {
            return <div className="error">Ocorreu um erro: {error}</div>;
        }
        if (cards.length > 0) {
            return <PriceList prices={cards} />;
        }
        if (searched) {
            return <div className="no-results">Nenhuma carta encontrada. Tente outro nome.</div>;
        }
        return <div className="no-results">Pesquise por uma carta para ver os preços.</div>;
    };

    return (
        <div className="container">
            <h1>Card Price Search</h1>
            <SearchBar onSearch={handleSearch} />
            <div className="content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default HomePage;