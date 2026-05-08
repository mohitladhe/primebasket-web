import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheck
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

function Addresses() {

  const { user } = useAuth();

  const [addresses,setAddresses] = useState([]);
  const [showModal,setShowModal] = useState(false);
  const [editing,setEditing] = useState(null);

  const [form,setForm] = useState({
    label:"",
    full_name:"",
    phone:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:""
  });

  // ---------------- FETCH ----------------

  const fetchAddresses = async () => {

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setAddresses(data.addresses || []);

    } catch (err) {
      console.error("Fetch addresses error:", err);
    }
  };

  useEffect(()=>{
    if(user) fetchAddresses();
  },[user]);

  // ---------------- HANDLE INPUT ----------------

  const handleChange = (e)=>{

    setForm({
      ...form,
      [e.target.name]:e.target.value
    });

  };

  // ---------------- ADD ADDRESS ----------------

  const addAddress = async ()=>{

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch(`${API}/api/addresses`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${session.access_token}`,
        },
        body:JSON.stringify(form)
      });

      setShowModal(false);

      setForm({
        label:"",
        full_name:"",
        phone:"",
        street:"",
        city:"",
        state:"",
        zipcode:"",
        country:""
      });

      fetchAddresses();

    } catch(err){
      console.error("Add address error:",err);
    }
  };

  // ---------------- UPDATE ADDRESS ----------------

  const updateAddress = async ()=>{

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch(`${API}/api/addresses/${editing.id}`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${session.access_token}`,
        },
        body:JSON.stringify(form)
      });

      setEditing(null);
      setShowModal(false);

      fetchAddresses();

    } catch(err){
      console.error("Update address error:",err);
    }
  };

  // ---------------- DELETE ----------------

  const deleteAddress = async(id)=>{

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch(`${API}/api/addresses/${id}`,{
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${session.access_token}`,
        }
      });

      fetchAddresses();

    } catch(err){
      console.error("Delete address error:",err);
    }
  };

  // ---------------- SET DEFAULT ----------------

  const setDefault = async(id)=>{

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch(`${API}/api/addresses/default/${id}`,{
        method:"PUT",
        headers:{
          Authorization:`Bearer ${session.access_token}`,
        }
      });

      fetchAddresses();

    } catch(err){
      console.error("Set default error:",err);
    }
  };

  // ---------------- OPEN EDIT ----------------

  const openEdit = (address)=>{

    setEditing(address);
    setForm(address);
    setShowModal(true);
  };

  return (

    <div className="space-y-6">

      {/* ADDRESS LIST */}

      {addresses.map(addr=>(

        <div
          key={addr.id}
          className={`border rounded-xl p-6 bg-white flex justify-between ${
            addr.is_default ? "border-green-400" : ""
          }`}
        >

          <div className="flex gap-4">

            <FiMapPin size={22}/>

            <div>

              <h3 className="font-semibold">{addr.label}</h3>

              <p className="text-gray-500 text-sm">
                {addr.full_name}
              </p>

              <p className="text-gray-500 text-sm">
                {addr.street}
              </p>

              <p className="text-gray-500 text-sm">
                {addr.city}, {addr.state} {addr.zipcode}
              </p>

              <p className="text-gray-500 text-sm">
                {addr.country}
              </p>

              {!addr.is_default && (

                <button
                  onClick={()=>setDefault(addr.id)}
                  className="text-green-600 text-sm mt-2 flex items-center gap-1"
                >
                  <FiCheck/>
                  Set as default
                </button>

              )}

            </div>

          </div>

          <div className="flex flex-col items-end gap-3">

            {addr.is_default && (

              <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                DEFAULT
              </span>

            )}

            <div className="flex gap-3 text-gray-500">

              <button onClick={()=>openEdit(addr)}>
                <FiEdit2/>
              </button>

              <button onClick={()=>deleteAddress(addr.id)}>
                <FiTrash2/>
              </button>

            </div>

          </div>

        </div>

      ))}

      {/* ADD BUTTON */}

      <div
        onClick={()=>{
          setEditing(null);

          setForm({
            label:"",
            full_name:"",
            phone:"",
            street:"",
            city:"",
            state:"",
            zipcode:"",
            country:""
          });

          setShowModal(true);
        }}
        className="border-dashed border-2 rounded-xl p-6 text-center text-gray-500 cursor-pointer hover:bg-gray-50 flex justify-center items-center gap-2"
      >
        <FiPlus/>
        Add New Address
      </div>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">

            <div className="flex justify-between">

              <h2 className="font-semibold text-lg">
                {editing ? "Edit Address" : "Add Address"}
              </h2>

              <button onClick={()=>setShowModal(false)}>
                <FiX/>
              </button>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <input
                name="label"
                placeholder="Label (Home/Office)"
                onChange={handleChange}
                value={form.label || ""}
                className="border p-2 rounded-lg"
              />

              <input
                name="full_name"
                placeholder="Full Name"
                onChange={handleChange}
                value={form.full_name || ""}
                className="border p-2 rounded-lg"
              />

              <input
                name="phone"
                placeholder="Phone"
                onChange={handleChange}
                value={form.phone || ""}
                className="border p-2 rounded-lg"
              />

              <input
                name="street"
                placeholder="Street"
                onChange={handleChange}
                value={form.street || ""}
                className="border p-2 rounded-lg col-span-2"
              />

              <input
                name="city"
                placeholder="City"
                onChange={handleChange}
                value={form.city || ""}
                className="border p-2 rounded-lg"
              />

              <input
                name="state"
                placeholder="State"
                onChange={handleChange}
                value={form.state || ""}
                className="border p-2 rounded-lg"
              />

              <input
                name="zipcode"
                placeholder="Zip Code"
                onChange={handleChange}
                value={form.zipcode || ""}
                className="border p-2 rounded-lg"
              />

              <input
                name="country"
                placeholder="Country"
                onChange={handleChange}
                value={form.country || ""}
                className="border p-2 rounded-lg"
              />

            </div>

            <button
              onClick={editing ? updateAddress : addAddress}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              {editing ? "Update Address" : "Save Address"}
            </button>

          </div>

        </div>

      )}

    </div>

  );
}

export default Addresses;