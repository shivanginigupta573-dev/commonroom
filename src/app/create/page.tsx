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
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const existingListings = JSON.parse(
      localStorage.getItem("listings") || "[]"
    );

    const newListing = {
      id: Date.now(),
      title: formData.title,
      price: Number(formData.price),
      campus: "NIT Durgapur",
      seller: "Current User",
      category: formData.category,
      program: formData.program,
      year: formData.year,
      image: preview,
    };

    localStorage.setItem(
      "listings",
      JSON.stringify([
        ...existingListings,
        newListing,
      ])
    );

    alert("Listing Created!");

    setFormData({
      title: "",
      price: "",
      category: "",
      program: "",
      year: "",
    });

    setImage(null);
    setPreview("");
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">
        Post New Item
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          name="title"
          placeholder="Item Title"
          value={formData.title}
          onChange={handleChange}
        />

        <Input
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
        />

        {/* Category */}
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value,
            })
          }
          className="w-full border p-3 rounded-lg"
        >
          <option value="">
            Select Category
          </option>

          <option value="Books">
            Books
          </option>

          <option value="Hostel Essentials">
            Hostel Essentials
          </option>

          <option value="Cycles">
            Cycles
          </option>

          <option value="Study Material">
            Study Material
          </option>
        </select>

        {/* Program */}
        <select
          value={formData.program}
          onChange={(e) =>
            setFormData({
              ...formData,
              program: e.target.value,
            })
          }
          className="w-full border p-3 rounded-lg"
        >
          <option value="">
            Select Program
          </option>

          <option value="BTech CSE">
            BTech CSE
          </option>

          <option value="BTech ECE">
            BTech ECE
          </option>

          <option value="BTech EE">
            BTech EE
          </option>

          <option value="BTech ME">
            BTech ME
          </option>

          <option value="MTech">
            MTech
          </option>

          <option value="PhD">
            PhD
          </option>
        </select>

        {/* Year */}
        <select
          value={formData.year}
          onChange={(e) =>
            setFormData({
              ...formData,
              year: e.target.value,
            })
          }
          className="w-full border p-3 rounded-lg"
        >
          <option value="">
            Select Year
          </option>

          <option value="1st Year">
            1st Year
          </option>

          <option value="2nd Year">
            2nd Year
          </option>

          <option value="3rd Year">
            3rd Year
          </option>

          <option value="4th Year">
            4th Year
          </option>

          <option value="MTech">
            MTech
          </option>

          <option value="PhD">
            PhD
          </option>
        </select>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-3 rounded-lg"
        />

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-60 object-cover rounded-lg"
          />
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Create Listing
        </button>
      </form>
    </div>
  );
}