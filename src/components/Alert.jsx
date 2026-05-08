import { useEffect } from "react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function Alert({ message, type = "success", onClose }) {

useEffect(() => {
const timer = setTimeout(() => {
onClose();
}, 3000);

return () => clearTimeout(timer);

}, []);

const colors = {
success: "bg-green-500",
error: "bg-red-500"
};

const icons = {
success: <FiCheckCircle />,
error: <FiAlertCircle />
};

return (

<div className="fixed top-6 right-6 z-50">

<div className={`${colors[type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn`}>

{icons[type]}

<span>{message}</span>

</div>

</div>

);

}

export default Alert;
