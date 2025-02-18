import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  handleCategoryChange: (category: string) => void;
  onAddCategory?: (newCategory: string) => void;
}

export const BasicInfoSection = ({
    title,
    setTitle,
    description,
    setDescription,
    categories,
    selectedCategory,
    handleCategoryChange,
    onAddCategory
  }: BasicInfoSectionProps) => {
    const [newCategory, setNewCategory] = useState('');
    
    const handleAddNewCategory = () => {
        if (newCategory && onAddCategory) {
            onAddCategory(newCategory);
            setNewCategory('');
        }
    };

    return (
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 space-y-4 transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                <span className="bg-blue-200 p-2 rounded-lg">📝</span>
                Quiz Information
            </h3>

            <div className="space-y-4">
                {/* Title Input */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-blue-500">
                        Quiz Title
                    </Label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        placeholder="Enter an exciting quiz title..."
                        required
                    />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-blue-500 flex items-center gap-2">
                        Quiz Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        placeholder="Describe your quiz adventure..."
                        required
                    />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <select
                        title="Category"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                        ))}
                    </select>
                </div>

                {/* Add New Category */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Add New Category</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter new category"
                        />
                        <Button 
                            type="button" 
                            onClick={handleAddNewCategory} 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        >
                        Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
  };