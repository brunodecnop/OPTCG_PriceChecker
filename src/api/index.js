import axios from 'axios';

const auth_token = import.meta.env.VITE_CARDTRADER_TOKEN;
const API_URL = 'https://api.cardtrader.com/api/v2';
const ONE_PIECE_GAME_ID = 15;

if (!auth_token) {
    throw new Error("ERRO CRÍTICO: A variável de ambiente VITE_CARDTRADER_TOKEN não foi encontrada.");
}

/**
 * Passo 1: Busca os blueprints (versões da carta) na CardTrader.
 */
export const findBlueprints = async (cardName, expansionId = 'all') => {
    try {
        const params = {
            name: cardName,
            game_id: ONE_PIECE_GAME_ID,
            expansion_id: expansionId === 'all' ? null : expansionId
        };
        console.log("Buscando blueprints com os parâmetros:", params);
        
        // Usa o endpoint de pesquisa /blueprints
        const response = await axios.get(`${API_URL}/blueprints`, {
            headers: { 'Authorization': `Bearer ${auth_token}` },
            params: params,
        });

        console.log(`Encontrados ${response.data.length} blueprints.`);
        return response.data; // Retorna a lista de blueprints encontrados

    } catch (error) {
        console.error("Erro ao buscar blueprints:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Passo 2: Para UM blueprint, busca os seus preços em diferentes APIs.
 */
export const getPricesForBlueprint = async (blueprint) => {
    const prices = {
        cardtrader: null,
        tcgplayer: null,
    };

    // --- Buscar preço na TCGPlayer ---
    if (blueprint.tcg_player_id) {
        try {
            // A API da TCGPlayer precisa de um 'groupId', que obtemos a partir do 'productId'
            const groupsResponse = await axios.get('https://tcgcsv.com/tcgplayer/68/groups');
            const matchingGroup = groupsResponse.data.results.find(group => group.productId === blueprint.tcg_player_id);

            if (matchingGroup) {
                const priceResponse = await axios.get(`https://tcgcsv.com/tcgplayer/68/${matchingGroup.groupId}/prices`);
                const priceData = priceResponse.data.results[0];
                if (priceData && priceData.marketPrice) {
                    prices.tcgplayer = priceData.marketPrice.toFixed(2);
                }
            }
        } catch (e) {
            console.warn(`Não foi possível obter o preço da TCGPlayer para ${blueprint.name}:`, e.message);
        }
    }

    // --- Buscar preço na CardTrader ---
    try {
        const ctResponse = await axios.get(`${API_URL}/marketplace/products`, {
            params: { blueprint_id: blueprint.id },
            headers: { 'Authorization': `Bearer ${auth_token}` }
        });

        const products = ctResponse.data[blueprint.id] || [];
        if (products.length > 0) {
            const minPrice = Math.min(...products.map(p => p.price.cents)) / 100;
            prices.cardtrader = minPrice.toFixed(2);
        }
    } catch (e) {
        console.warn(`Não foi possível obter o preço da CardTrader para ${blueprint.name}:`, e.message);
    }

    return prices;
};

export const fetchExpansions = async () => {
    try {
        const response = await axios.get(`${API_URL}/expansions`, {
            headers: { 'Authorization': `Bearer ${auth_token}` }
        });
        const onePieceExpansions = response.data.filter(exp => exp.game_id === ONE_PIECE_GAME_ID);
        return onePieceExpansions.map(exp => ({
            id: exp.id,
            name: exp.name,
            label: exp.name,
            value: exp.id,
        }));
    } catch (error) {
        console.error('Error fetching expansions:', error.response?.data || error.message);
        return [];
    }
};