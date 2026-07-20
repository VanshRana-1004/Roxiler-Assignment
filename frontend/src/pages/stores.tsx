import { useState, useEffect } from "react"
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { ChangePasswordBox } from "../components/changePasswordBox";
import { CreateStoreBox } from "../components/createStoreBox";

import { api } from "../api";

export function Stores(){
    
    const navigate=useNavigate();

    const [ role, setRole]=useState<string>("");
    const [ PassBox,setPassBox] = useState<boolean>(false);
    const [ createStoreBox, setCreateStoreBox] = useState<boolean>(false);

    const [ stores, setStores] = useState<any[]>([]);
    const [ emailFilter, setEmailFilter] = useState<string>("");
    const [ idFilter, setIdFilter]= useState<string>("");
    
    const [ratingBox, setRatingBox] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [rating, setRating] = useState(1);
    
    function logout(){
        Cookies.remove('token')
        Cookies.remove('address')
        Cookies.remove('userId')
        Cookies.remove('role')
        Cookies.remove('email')
        navigate('/login')
        return
    }

    useEffect(()=>{
        
        const token=Cookies.get('token');
        const userRole=Cookies.get('role');

        if(userRole==undefined || token==undefined){
            logout();
            return;
        }   
        
        setRole(userRole);

        async function getStores(){
            try{
                const result=await api.get("/all-stores",{
                    headers : {
                        Authorization : `Bearer ${token}`,
                    } 
                });

                setStores(result.data.stores);
            }catch(e : any){
                alert(e.response?.data?.message || "Internal server error")
                logout();
            }
        }

        getStores();
    },[createStoreBox]);

    async function submitRating() {
        try {
            const token = Cookies.get("token");

            await api.post(
                "/rate-store",
                {
                    storeId: selectedStore.id,
                    rating,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Rating submitted");

            setRatingBox(false);

            // Refresh stores to get updated average
            const result = await api.get("/all-stores", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStores(result.data.stores);
        } catch (e: any) {
            alert(e.response?.data?.message || "Internal Server Error");
        }
    }
        
    return <div className="min-h-screen bg-gray-100 p-6">

        {PassBox && 
            <div className="fixed inset-0 flex items-center justify-center">
                <ChangePasswordBox onClose={()=>setPassBox(false)}/>
            </div>
        }
        {createStoreBox &&
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                <CreateStoreBox
                    onClose={() => setCreateStoreBox(false)}
                />
            </div>
        }
        {ratingBox && selectedStore && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
                <div className="bg-white rounded-lg p-6 w-96">

                    <h2 className="text-xl font-bold mb-4">
                        Rate {selectedStore.name}
                    </h2>

                    <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="border w-full p-2 rounded mb-4"
                    >
                        {[1,2,3,4,5].map((r)=>(
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setRatingBox(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={submitRating}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Submit
                        </button>
                    </div>

                </div>
            </div>
        )}
        

        <div className="w-full flex justify-between ">
            <h1 className="text-3xl font-bold mb-8">
                Stores Dashboard
            </h1>
            <div className="w-auto flex gap-3 ">
                {role=='ADMIN' && <button onClick={()=>navigate('/users')} className="bg-gray-600 text-white px-5 rounded-md h-10">Users</button>}
                <button onClick={()=>navigate('/ratings')} className="bg-gray-600 text-white px-5 rounded-md h-10">Ratings</button>
                {role=='ADMIN' && <button onClick={()=>{setPassBox(false),setCreateStoreBox(true)}} className="bg-blue-600 text-white px-5 rounded-md h-10">Create Store</button>}
                <button onClick={() => {setCreateStoreBox(false),setPassBox(true)}} className="px-5 h-10 bg-blue-600 text-white rounded-md">Change Password</button>
                <button onClick={()=>{logout()}} className="px-5 h-10 bg-red-600 text-white rounded-md">Logout</button>
            </div>
        </div>

        <div className="flex gap-4 mb-5">
            <input
                type="text"
                placeholder="Search by Store ID"
                value={idFilter}
                onChange={(e) => setIdFilter(e.target.value)}
                className="border rounded p-2 w-1/2"
            />

            <input
                type="text"
                placeholder="Search by Store Email"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="border rounded p-2 w-1/2"
            />
        </div>
        
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">

                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-3 text-left">Store</th>
                        <th className="p-3">Address</th>
                        <th className="p-3">Average Rating</th>
                    </tr>
                </thead>

                <tbody>

                    {stores
                        .filter(
                            (store) =>
                                store.id.toLowerCase().includes(idFilter.toLowerCase()) &&
                                store.email.toLowerCase().includes(emailFilter.toLowerCase())
                        )
                        .map((store) => (

                            <tr key={store.id} className={`border-b ${role === "USER" ? "cursor-pointer hover:bg-gray-100" : ""}`}
                                onClick={() => {
                                    if (role === "USER") {
                                        setSelectedStore(store);
                                        setRatingBox(true);
                                    }
                                }}
                            >

                                <td className="p-3">

                                    <div className="font-medium">
                                        {store.name}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {store.email}
                                    </div>

                                    <div className="text-xs text-gray-400">
                                        {store.id}
                                    </div>

                                </td>

                                <td className="text-center">
                                    {store.address}
                                </td>

                                <td className="text-center">
                                    {store.averageRating.toFixed(2)}
                                </td>

                            </tr>

                        ))}

                </tbody>

            </table>
        </div>
    </div>
}