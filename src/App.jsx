import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/sign_in";
import Signup from "./pages/signup";
import DriverDashboard from "./pages/DriverDashboard";
import DriverSignup from "./pages/DriverSignup";
import DriverLogin from "./pages/DriverLogin";
import Riderlayout from "./layout/riderlayout";
import DriverLayout from "./layout/driverlayout";
import PaymentPage from "./components/PaymentPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/rider/dashboard" element={<Riderlayout />} />

      <Route path="/driver/signup" element={<DriverSignup />} />
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver/dashboard" element={<DriverLayout />} />
      <Route path="/payment"element={<PaymentPage/>}/>
    </Routes>
  );
}

export default App;