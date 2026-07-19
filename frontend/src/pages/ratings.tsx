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
    },[]);

    async function updateRating(storeId: string) {

        const rating = Number(prompt("Enter rating (1-5)"));

        if (!rating || rating < 1 || rating > 5) return;

        await api.post(
            "/rate-store",
            {
                storeId,
                rating
            },
            {
                headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`
                }
            }
        );

        window.location.reload();
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {PassBox && 
                <div className="fixed inset-0 flex items-center justify-center">
                    <ChangePasswordBox onClose={()=>setPassBox(false)}/>
                </div>
            }

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
                                            onClick={() => updateRating(r.store.id)}
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
                    <table className="min-w-full">

                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3">Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Rating</th>
                            </tr>
                        </thead>

                        <tbody>

                            {ratings.map((r) => (

                                <tr key={r.user.id} className="border-b">

                                    <td className="p-3">{r.user.name}</td>

                                    <td>{r.user.email}</td>

                                    <td>{r.user.address}</td>

                                    <td className="text-center">
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

                                <th>User</th>
                                <th>Store</th>
                                <th>Rating</th>

                            </tr>
                        </thead>

                        <tbody>

                            {ratings.filter((r) =>
                                r.user.id.toLowerCase().includes(userFilter.toLowerCase()) &&
                                r.store.name.toLowerCase().includes(storeFilter.toLowerCase())
                            ).map((r) => (

                                <tr key={r.id} className="border-b">

                                    <td className="p-3">
                                        <div>{r.user.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {r.user.email}
                                        </div>
                                    </td>

                                    <td>
                                        <div>{r.store.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {r.store.email}
                                        </div>
                                    </td>

                                    <td className="text-center">
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