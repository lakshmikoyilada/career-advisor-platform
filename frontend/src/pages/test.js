import React, { useState } from "react";

function Test() {
  const [formData, setFormData] = useState({
    name: "",
    interests: "",
    strengths: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("Form submitted! (Next step: send to backend)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Career Test
        </h2>

        <label className="block mb-3">
          <span className="text-gray-700">Your Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded-lg"
            required
          />
        </label>

        <label className="block mb-3">
          <span className="text-gray-700">Your Interests</span>
          <textarea
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded-lg"
            required
          ></textarea>
        </label>

        <label className="block mb-3">
          <span className="text-gray-700">Your Strengths</span>
          <textarea
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded-lg"
            required
          ></textarea>
        </label>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Submit Test
        </button>
      </form>
    </div>
  );
}

export default Test;
