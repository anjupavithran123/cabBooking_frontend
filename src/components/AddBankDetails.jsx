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

  // ✅ Load existing details if available
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
    <div style={styles.container}>
      <h2>Add Bank Details</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="account_holder_name"
          placeholder="Account Holder Name"
          value={form.account_holder_name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="bank_account_number"
          placeholder="Bank Account Number"
          value={form.bank_account_number}
          onChange={handleChange}
        />

        <input
          type="text"
          name="ifsc_code"
          placeholder="IFSC Code"
          value={form.ifsc_code}
          onChange={handleChange}
        />

        <input
          type="text"
          name="vpa"
          placeholder="UPI ID (optional)"
          value={form.vpa}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Details"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};