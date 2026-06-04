"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    program: "",
    year: "",
    image: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    console.log(formData);

    alert("Listing Created!");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        Post New Item
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <Input
          name="price"
          placeholder="Price"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <Input
          name="category"
          placeholder="Category"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <Input
          name="program"
          placeholder="Program"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <Input
          name="year"
          placeholder="Year"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <Input
          name="image"
          placeholder="Image URL"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
        >
          Create Listing
        </button>
      </form>
    </div>
  );
}