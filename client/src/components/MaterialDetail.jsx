import { useEffect, useState } from "react";
import { getMaterialDetail } from "../services/material-service";
import { useParams } from "react-router-dom";

import Navbar from "./NavbarPrivate";

const MaterialDetail = () => {
    const { matID } = useParams();
    const [material, setMaterial] = useState(null);
    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );

    useEffect(() => {
        getMaterialDetail(matID, setMaterial);
    }, [matID]);

    return (
        <div className={`space-y-4`}>
            <Navbar username={username}></Navbar>
            <p className={`text-3xl font-bold justify-self-center`}>Material Detail</p>
            { material &&
                <div className={`px-3 space-y-4`}>
                    <div className={`space-y-1`}>
                        <p className={`p-1 text-2xl font-medium text-zinc-50 bg-zinc-500`}>{material["Material Name"]}</p>
                        <div className={`space-y-2 grid grid-cols-5 bg-zinc-200`}>
                            <p className={`p-1 text-xl font-bold col-span-1`}>Categories:</p>
                            <div className={`flex gap-1 col-span-4`}>
                                { material["Categories"].map((category, id) => 
                                    <p key={`category_${id}`}>{category};</p>
                                )}
                            </div>
                            <p className={`w-96 p-1 text-xl font-bold col-span-1`}>Material Notes:</p>
                            <p className={`col-span-4`}>{material["Material Notes"]}</p>
                        </div>
                    </div>
                    { Object.entries(material["Properties"]).map(([key, value]) => (
                        <div key={key} className={`space-y-1 bg-zinc-200`}>
                            <div className={`p-1 text-lg font-medium text-zinc-50 bg-zinc-500 grid grid-cols-6`}> 
                                <p className={`col-span-2`}>{key}</p>
                                <p className={`col-span-1 justify-self-center`}>Metric</p>
                                <p className={`col-span-1 justify-self-center`}>English</p>
                                <p className={`px-2 col-span-2 justify-self-end`}>Comment</p>
                            </div>
                            <div className={`space-y-2 text-lg bg-zinc-200`}>
                                { Object.entries(value).map(([subKey, subValue]) => 
                                    <div className={`px-1`}>
                                        { subValue.map((_subValue, _id) => 
                                            <div key={`properties${_id}`} className={`grid grid-cols-6`}>
                                                <p className={`col-span-2`}>{_id === 0 ? subKey : ""}</p>
                                                <p className={`col-span-1 justify-self-center`}>{_subValue.Metric || _subValue}</p>
                                                <p className={`col-span-1 justify-self-center`}>{_subValue.English || _subValue}</p>
                                                <p className={`px-2 col-span-2 justify-self-end`}>{_subValue.Comment}</p>
                                            </div>
                                        )}
                                        
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            }    
        </div>
    )
}

export default MaterialDetail;