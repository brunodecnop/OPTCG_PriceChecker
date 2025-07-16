import React, { useState, useEffect } from 'react';
import { fetchExpansions } from '../api/index';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [expansion, setExpansion] = useState('all');
    const [expansions, setExpansions] = useState([
        { value: 'all', label: 'All Expansions' }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadExpansions = async () => {
            try {
                const data = await fetchExpansions();
                setExpansions(prevExpansions => [
                    prevExpansions[0], // Keep 'All Expansions'
                    ...data
                ]);
            } catch (error) {
                console.error('Failed to load expansions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadExpansions();
    }, []);

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleExpansionChange = (event) => {
        setExpansion(event.target.value);
    };

    const handleSearch = () => {
        onSearch(query, expansion);
    };

    return (
        <div className="search-container">
            <div className="search-bar">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Enter card name..."
                    disabled={loading}
                />
                <select 
                    value={expansion}
                    onChange={handleExpansionChange}
                    className="expansion-select"
                    disabled={loading}
                >
                    {expansions.map(exp => (
                        <option key={exp.id} value={exp.id}>
                            {exp.label}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default SearchBar;