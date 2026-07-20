import { useState, useEffect } from "react"
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { ChangePasswordBox } from "../components/changePasswordBox";

import { api } from "../api";
import { CreateUserBox } from "../components/createUserBox";

export function Users(){

    const navigate=useNavigate();

    const [ role, setRole]=useState<string>("");
    const [ PassBox,setPassBox] = useState<boolean>(false);
    const [ createUserBox, setCreateUserBox] = useState<boolean>(false);

    const [ users, setUsers] = useState<any[]>([]);
    const [emailFilter, setEmailFilter] = useState<string>("");
    const [idFilter, setIdFilter] = useState<string>(""); 

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

        async function getUsers(){


            if(role == 'USER'){
                // user can't see other user
                alert("User Can't access other users info");
                logout();
                return;
            }
            else if(role == 'OWNER'){
                // store owner can't see all the users just their store ratings
                alert("Owner can't access Users info")
                logout();
                return;
            }

            // admin can see all the ratings by all the users
            try{
                const result = await api.get("/all-users",{
                    headers : {
                        Authorization: `Bearer ${token}`,
                    }
                });   
    
                setUsers(result?.data.users);

            }catch(e : any){
                if(e.result.status==500) alert("Internal server error");
                if(e.result.status==403) alert('Unauthorized request or invalid user.');
                logout();
            }
            
        }
        
        getUsers();
        
    },[createUserBox]);

    return <div className="min-h-screen bg-gray-100 p-6">

            {PassBox && 
                <div className="fixed inset-0 flex items-center justify-center">
                    <ChangePasswordBox onClose={()=>setPassBox(false)}/>
                </div>
            }
            {createUserBox && 
                <div className="fixed inset-0 flex items-center justify-center">
                    <CreateUserBox onClose={()=>setCreateUserBox(false)}/>
                </div>
            }


            <div className="w-full flex justify-between ">
                <h1 className="text-3xl font-bold mb-8">
                    Users Dashboard
                </h1>
                <div className="w-auto flex gap-3 ">
                    <button onClick={()=>navigate('/stores')} className="bg-gray-600 text-white px-5 rounded-md h-10">Stores</button>
                    <button onClick={()=>navigate('/ratings')} className="bg-gray-600 text-white px-5 rounded-md h-10">Ratings</button>
                    <button onClick={()=>{setPassBox(false),setCreateUserBox(true)}} className="bg-blue-600 text-white px-5 rounded-md h-10">Create User</button>
                    <button onClick={() => {setCreateUserBox(false),setPassBox(true)}} className="px-5 h-10 bg-blue-600 text-white rounded-md">Change Password</button>
                    <button onClick={()=>{logout()}} className="px-5 h-10 bg-red-600 text-white rounded-md">Logout</button>
                </div>
            </div>

            <div className="flex gap-4 mb-5">
                <input
                    type="text"
                    placeholder="Search by User ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                    className="border rounded p-2 w-1/2"
                />

                <input
                    type="text"
                    placeholder="Search by Email"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="border rounded p-2 w-1/2"
                />
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">

                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 text-left">User</th>
                            <th className="p-3">Address</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Average Rating</th>
                        </tr>
                    </thead>

                    <tbody>

                        {users
                            .filter(
                                (user) =>
                                    user.id.toLowerCase().includes(idFilter.toLowerCase()) &&
                                    user.email.toLowerCase().includes(emailFilter.toLowerCase())
                            )
                            .map((user) => (

                                <tr key={user.id} className="border-b">

                                    <td className="p-3">

                                        <div className="font-medium">
                                            {user.name}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>

                                        <div className="text-xs text-gray-400">
                                            {user.id}
                                        </div>

                                    </td>

                                    <td className="text-center">
                                        {user.address}
                                    </td>

                                    <td className="text-center">

                                        <span
                                            className={`px-3 py-1 rounded text-white text-sm
                                                ${
                                                    user.role === "ADMIN"
                                                        ? "bg-red-500"
                                                        : user.role === "OWNER"
                                                        ? "bg-blue-500"
                                                        : "bg-green-500"
                                                }`}
                                        >
                                            {user.role}
                                        </span>

                                    </td>

                                    <td className="text-center">

                                        {user.role === "OWNER"
                                            ? (user.averageRating ?? 0).toFixed(2)
                                            : "-"}

                                    </td>

                                </tr>

                            ))}

                    </tbody>

                </table>
            </div>
    </div>
}