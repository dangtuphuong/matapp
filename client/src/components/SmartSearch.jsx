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
            setSearchResult(response.data);
        } else {
            const response = await llmSearch(query);
            const result = response.data.result.replace(/ObjectId\('([^']+)'\)/g, '"$1"').replace(/'/g, '"');
            const arr = JSON.parse(result);
            setSearchResult(arr.map(obj => ({ material: obj })));
        }
    }

    const handleClick = (matID) => {
        navigate(`/material/${matID}`)
    }

    const handleNextPage = () => {
        setSkip(skip => skip + limit)
        handleSearch()
    }

    const handlePreviousPage = () => {
        setSkip(skip => Math.max(0, skip - limit))
        handleSearch()
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
            <div className={`py-2`}>
                <div className={`px-6 space-y-5`}>
                    { searchResult.map((material, id) => 
                        <div>
                            <div key={id} className={`p-2 w-full round-md border border-zinc-500 justify-self-center rounded-md hover:bg-zinc-200 hover:cursor-pointer`} onClick={() => handleClick(material.material.matGUID)}>
                                <div className={`px-1 self-end truncate space-y-0.5`}>
                                    <p className={`text-lg`}><strong>Name:</strong> {material.material["Material Name"]}</p>
                                    <span className={`flex gap-2`}><strong>Categories:</strong> 
                                        { material.material["Categories"].map(category => 
                                            <p>{category};</p>
                                        )}  
                                    </span>
                                    <p className={`truncate`}><strong>Note: </strong>{material.material["Material Notes"]}</p>
                                    <p className={`${material.score ? "" : "hidden"} text-sm`}><strong>Similar score: </strong>{material.score}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    { searchResult && model === "vector" && 
                        <div className={`flex justify-center gap-2`}>
                            <button className={`${skip > 0 ? '' : 'hidden'} hover:cursor-pointer hover:bg-zinc-100`} onClick={handlePreviousPage} >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <input className={`px-2 py-1 w-10 border border-zinc-500 rounded-md`} value={skip / limit + 1}/>
                            <button className={`hover:cursor-pointer hover:bg-zinc-100`} onClick={handleNextPage}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default SmartSearch