import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiCheckCircle } from "react-icons/fi";

function OrderSuccess(){

return(

<>
<Navbar/>

<div className="min-h-screen flex items-center justify-center bg-gray-50">

<div className="bg-white p-10 rounded-xl shadow text-center">

<FiCheckCircle size={60} className="text-green-500 mx-auto mb-4"/>

<h1 className="text-2xl font-bold">
Order Placed Successfully 🎉
</h1>

<p className="text-gray-500 mt-2 mb-6">
Your order has been successfully placed.
</p>

<div className="flex gap-4 justify-center">

<a href="/shop" className="bg-gray-100 px-4 py-2 rounded">
Shop More
</a>

<a href="/profile" className="bg-green-500 text-white px-4 py-2 rounded">
View Orders
</a>

</div>

</div>

</div>

<Footer/>
</>

);

}

export default OrderSuccess;