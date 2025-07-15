import axios from 'axios';
require('dotenv').config();


const auth_token = process.env.CARDTRADER_TOKEN;
const API_URL = 'https://www.cardtrader.com/api/v2';

export const fetchBP = async (cardName, expansion = 'all') => {
    try {
        const params = {
            expansion_id: expansion,
        };

        const response = await axios.get(`${API_URL}/blueprints/export`, {
            params,
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            }
        });
        const containsStringIgnoreCase = (mainString, searchString) => {
            if (!mainString || !searchString) return false;
            return mainString.toLowerCase().includes(searchString.toLowerCase());
        };

        const blueprints = response.data
        .filter(exp => containsStringIgnoreCase(exp.name, cardName))
        .map(exp => ({
            name: exp.name,
            id: exp.id,
            image_url: exp.image_url,
            cardmarket_ids: exp.card_market_ids,
            tcgplayer_id: exp.tcg_player_id,
        }));
        console.log('blueprints:', blueprints);
        console.log('tcgplayerId:', blueprints[0].tcgplayer_id);
        const tcgpBpId = await axios.get(`https://tcgcsv.com/tcgplayer/68/groups`, {
            headers: {
                accept : 'application/json',
            }
        });
        console.log('tcgpBpId:', tcgpBpId.data);

        
        const tcgGpId = tcgpBpId.data.results.filter(exp => exp.productId === blueprints[0].tcgplayer_id).map(exp => ({
            groupId: exp.groupId,

            }));     
      
        return {
            name: blueprints.name,
            id: blueprints.id,
            image_url: blueprints.image_url,
            cardmarket_ids: blueprints.cardmarket_ids,
            tcgplayer_id: blueprints.tcgplayer_id,
            tcg_groupId: tcgGpId.groupId,
        };
    } catch (error) {
        console.error('Error fetching prices:', error);
        throw error;
    }
};

export const convertCTtoTCG = async (CTexp) => { 
    try {
        const response = await axios.get(`${API_URL}/blueprints/export`, {
            params,
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            } 
        });

    } catch (error) {
        console.error('Error fetching prices:', error);
        throw error;
    }
};
        

export const fetchTCGPlayerPrices = async (blueprints) => {
    try {
        console.log('fetchTCGPlayerPrices  Blueprints:', blueprints);
        // Get group IDs from blueprints
        const groupIds = blueprints.tcgplayer_group_id;
        console.log('groupIds:', groupIds);

        if (groupIds.length === 0) {
            return [];
        }

        // Batch request for all cards
        const response = await axios.get(`https://tcgcsv.com/tcgplayer/68/${blueprints.groupId}/prices`
            , {
            headers: {
                //'Authorization': `Bearer ${API_CONFIG.token}`
            },
            params: {
                group_ids: groupIds.join(',')
            }
        });

        // Match prices with blueprints
        return blueprints.map(card => {
            const priceData = response.data.find(price => 
                price.group_id === card.tcgplayer_group_id
            );

            return {
                id: card.id,
                name: card.name,
                tcgplayer_id: card.tcgplayer_id,
                tcgplayer_group_id: card.tcgplayer_group_id,
                price: priceData ? {
                    market: priceData.market_price,
                    low: priceData.low_price,
                    mid: priceData.mid_price,
                    high: priceData.high_price
                } : null
            };
        });
    } catch (error) {
        console.error('Error fetching TCGPlayer prices:', error);
        throw error;
    }
};

export const fetchExpansions = async () => {
    const expansions_table = [

    ];
    try {
        const response = await axios.get(`${API_URL}/expansions`, {
            headers: {
                'Authorization': `Bearer ${auth_token}`
            }
        });
        
        // Filter for optcg (game_id: 15) and transform data
        const opExpansions = response.data
            .filter(exp => exp.game_id === 15)
            .map(exp => ({
                code: exp.code,
                name: exp.name,
                gamei_id: exp.game_id,
                id: exp.id,
            }))
            //.sort((a, b) => a.label.localeCompare(b.label))
            ;
            console.log(opExpansions);
        return opExpansions;
    } catch (error) {
        console.error('Error fetching expansions:', error);
        throw error;
    }
};

export const fetchCard = async (card, expansion) => {
    const cardId = card.id;
    const tcgplayerId = card.tcgplayer_id;
    const cardmarketIds = card.cardmarket_ids;
    const groupId = card.tcg_groupId;
    console.log('tcg_groupId:', groupId);
    try {
        const params = {
            blueprint_id: cardId,
        };

        const CTresponse = await axios.get(`${API_URL}/marketplace/products`, {
            params,
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            }
        });
        const TCGPresponse = await axios.get(`https://tcgcsv.com/tcgplayer/68/${groupId}/prices`, {
            headers: {
              //  'Authorization': `Bearer ${auth_token}`,
                accept : 'application/json',
            }
        });
        const CMKresponse = await axios.get(`https://api.cardmarket.com/ws/v2.0/products/${cardmarketIds[0]}`, {
            headers: {

            }
        });

        const CTprice = CTresponse.data[cardId].map(exp => ({
            price: exp.price,
        }));
        const TCGPprice = TCGPresponse.data.results.map(exp => ({
            price: exp.marketPrice,
        })).filter(exp => exp.productId === tcgplayerId);
        const CMKprice = CMKresponse.data.product.map(exp => ({
            price: exp.priceGuide.TREND,
        }));
        const price = CTprice.concat(TCGPprice, CMKprice);

        return price;
    } catch (error) {
        console.error('Error fetching card:', error);
        console.log('Request Config:', error.config); // Isso vai mostrar a configuração da requisição
        throw error;
    }
};

