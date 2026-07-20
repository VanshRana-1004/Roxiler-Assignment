import { useState, useEffect } from "react"
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { ChangePasswordBox } from "../components/changePasswordBox";

import { api } from "../api";

export function Ratings(){

    const navigate=useNavigate();

    const [ ratings, setRatings] = useState<any[]>([]);
    const [ role, setRole]=useState<string>("");
    const [ userFilter, setUserFilter] = useState<string>("");
    const [ storeFilter, setStoreFilter] = useState<string>("");
    const [ PassBox,setPassBox] = useState<boolean>(false);

    const [ratingBox, setRatingBox] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [rating, setRating] = useState(1);
    const [ refresh, setRefresh ] = useState<boolean>(false);

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

        async function getRatings(){

            let result;

            if(userRole == 'USER'){
                // user can only see the ratings given by them
                result = await api.get("/user-ratings",{
                    headers : {
                        Authorization: `Bearer ${token}`,
                    }
                });
            }
            else if(userRole == 'ADMIN'){
                // admin can see all the ratings by all the users
                result = await api.get("/all-ratings",{
                    headers : {
                        Authorization: `Bearer ${token}`,
                    }
                });   
            }
            else if(userRole == 'OWNER'){
                // store owner can only see ratings for his store
                result = await api.get("/store-ratings",{
                    headers : {
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            // console.log(result?.data);

            if(result?.status==403 || result?.status==500){
                
                if(result.status==500) alert("Internal server error");
                if(result.status==403) alert('Unauthorized request or invalid user.');
                logout();
                return;
            }
            
            setRatings(result?.data.ratings);
        }
        
        getRatings();
    },[refresh]);

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
            setSelectedStore(null);
            setRating(1);
            setRefresh(prev=>!prev);
        } catch (e: any) {
            alert(e.response?.data?.message || "Internal Server Error");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {PassBox && 
                <div className="fixed inset-0 flex items-center justify-center">
                    <ChangePasswordBox onClose={()=>setPassBox(false)}/>
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
                    Ratings Dashboard
                </h1>
                <div className="w-auto flex gap-3 ">
                    <button onClick={()=>{navigate('/stores')}} className="px-5 h-10 bg-gray-600 text-white rounded-md">Stores</button>
                    {role=='ADMIN' && 
                        <button onClick={()=>{navigate('/users')}} className="px-5 h-10 bg-gray-600 text-white rounded-md">Users</button>
                    }
                    <button onClick={() => setPassBox(true)} className="px-5 h-10 bg-blue-600 text-white rounded-md">Change Password</button>
                    <button onClick={()=>{logout()}} className="px-5 h-10 bg-red-600 text-white rounded-md">Logout</button>
                </div>
            </div>

            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by User ID"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="border p-2 rounded w-1/2"
                />

                <input
                    type="text"
                    placeholder="Search by Store Name"
                    value={storeFilter}
                    onChange={(e) => setStoreFilter(e.target.value)}
                    className="border p-2 rounded w-1/2"
                />
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">

                {role === "USER" && (
                    <table className="min-w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 text-left">Store</th>
                                <th className="p-3">My Rating</th>
                                <th className="p-3">Average</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ratings.map((r) => (
                                <tr key={r.store.id} className="border-b">

                                    <td className="p-3">
                                        <div>{r.store.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {r.store.email}
                                        </div>
                                    </td>

                                    <td className="text-center">
                                        {r.myRating}
                                    </td>

                                    <td className="text-center">
                                        {r.avgRating}
                                    </td>

                                    <td className="text-center">

                                        <button
                                            onClick={() => {
                                                if(role=='USER'){
                                                    setSelectedStore(r.store);
                                                    setRatingBox(true);
                                                }
                                            }
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                        >
                                            Update
                                        </button>

                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}

                {role === "OWNER" && (
                    <table className="min-w-full table-fixed ">

                        <thead className="bg-gray-200">
                            <tr>
                                <th className="w-1/4 p-3 text-start">Name</th>
                                <th className="w-1/4  text-start">Email</th>
                                <th className="w-1/4  text-start">Address</th>
                                <th className="w-1/4  text-start">Rating</th>
                            </tr>
                        </thead>

                        <tbody>

                            {ratings.map((r) => (

                                <tr key={r.user.id} className="border-b ">

                                    <td className="p-3 w-1/4 text-start">{r.user.name}</td>

                                    <td className="w-1/4 text-start">{r.user.email}</td>

                                    <td className="w-1/4 text-start">{r.user.address}</td>

                                    <td className="w-1/4 text-start">
                                        {r.rating}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                )}

                {role === "ADMIN" && (
                    <table className="min-w-full">

                        <thead className="bg-gray-200">
                            <tr>

                                <th className="w-1/4 p-3 text-start">User</th>
                                <th className="w-1/4 text-start">Store</th>
                                <th className="w-1/4 text-start">Rating</th>

                            </tr>
                        </thead>

                        <tbody>

                            {ratings.filter((r) =>
                                r.user.id.toLowerCase().includes(userFilter.toLowerCase()) &&
                                r.store.name.toLowerCase().includes(storeFilter.toLowerCase())
                            ).map((r) => (

                                <tr key={r.id} className="border-b">

                                    <td className="w-1/4 p-3 text-start">
                                        <div>{r.user.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {r.user.email}
                                        </div>
                                    </td>

                                    <td className="w-1/4 text-start">
                                        <div>{r.store.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {r.store.email}
                                        </div>
                                    </td>

                                    <td className="w-1/4 text-start">
                                        {r.rating}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                )}

            </div>

        </div>
    );
}