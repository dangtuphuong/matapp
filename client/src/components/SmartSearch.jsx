import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./NavbarPrivate";

import { vectorSearch, llmSearch } from "../services/smart-search-service";

const SmartSearch = () => {
    const navigate = useNavigate();

    const [model, setModel] = useState(JSON.parse(sessionStorage.getItem("SmartSearchParams"))?.model || "vector");
    const [skip, setSkip] = useState(JSON.parse(sessionStorage.getItem("SmartSearchParams"))?.skip || 0);
    const [limit, setLimit] = useState(JSON.parse(sessionStorage.getItem("SmartSearchParams"))?.limit || 10);
    const [query, setQuery] = useState(JSON.parse(sessionStorage.getItem("SmartSearchParams"))?.query || "");
    const [searchResult, setSearchResult] = useState(JSON.parse(sessionStorage.getItem("SmartSearchParams"))?.searchResult || []);
    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );

    useEffect(() => {
        sessionStorage.setItem("SmartSearchParams", JSON.stringify({
            model,
            skip,
            limit,
            query,
            searchResult
        }));
    }, [model, skip, limit, query, searchResult])

    const handleSearch = async () => {
        if (model === "vector") {
            const response = await vectorSearch(query, limit, skip);
            setSearchResult(response.data.result);
        } else {
            const response = await llmSearch(query);
            setSearchResult(response.data.result);
        }
    }

    const handleClick = (matID) => {
        navigate(`/material/detail/${matID}`)
    }

    return (
        <div className={`space-y-4`}>
            <Navbar username={username}></Navbar>
            <p className={`text-3xl font-bold justify-self-center`}>Smart Search</p>
            <div className={`pt-4 w-1/2 justify-self-center flex gap-3 justify-center`}>
                <select className={`px-2 border border-zinc-500 rounded-md hover:cursor-pointer`} onChange={e => setModel(e.target.value)}>
                    <option value={`vector`}>Vector Search</option>
                    <option value={`llm`}>OpenAI</option>
                </select>
                <input className={`w-96 h-10 pl-2 border border-zinc-500 rounded-md`} placeholder={`Enter what you want to search for here`} value={query} onChange={e => setQuery(e.target.value)}/>
                <button className={`px-4 py-2 border border-zinc-600 rounded-full hover:bg-zinc-400 hover:cursor-pointer`} onClick={() => handleSearch()}>
                    Search
                </button>
            </div>
            <div className={``}>
                <div className={`px-4 grid grid-cols-5 gap-4 space-y-2`}>
                    { searchResult.map((material, id) => 
                        <div key={id} className={`flex w-40 h-40 bg-zinc-200 justify-self-center rounded-md`} onClick={() => handleClick(material.matGUID)}>
                            <div className={`px-1 self-end truncate`}>
                                <p className={`text-xs`}>ID: {material.matGUID}</p>
                                <p className={`text-xs`}>Score: {parseFloat(material.score).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SmartSearch