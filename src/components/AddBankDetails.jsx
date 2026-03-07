import { useEffect, useState } from "react";
import { saveBankDetails, getBankDetails } from "../api/driverbankapi";

export default function AddBankDetails() {
  const [form, setForm] = useState({
    bank_account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    vpa: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const data = await getBankDetails();
      if (data) {
        setForm(data);
      }
    } catch (err) {
      console.log("No existing bank details");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!form.bank_account_number && !form.vpa) {
      setMessage("Provide bank details or UPI ID");
      setLoading(false);
      return;
    }

    try {
      await saveBankDetails(form);
      setMessage("Bank details saved successfully ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Add Bank Details
        </h2>

        {message && (
          <div className="mb-4 text-sm text-center bg-green-100 text-green-700 p-2 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="account_holder_name"
            placeholder="Account Holder Name"
            value={form.account_holder_name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            name="bank_account_number"
            placeholder="Bank Account Number"
            value={form.bank_account_number}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            name="ifsc_code"
            placeholder="IFSC Code"
            value={form.ifsc_code}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <div className="text-center text-gray-400 text-sm">OR</div>

          <input
            type="text"
            name="vpa"
            placeholder="UPI ID (optional)"
            value={form.vpa}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Saving..." : "Save Details"}
          </button>

        </form>
      </div>

    </div>
  );
}