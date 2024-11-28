import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiTrash,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Common/AdminSideBar";
import { FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  setCategories,
} from "../../Redux/Slices/categorySlice";
import { toast } from "sonner";
import axios from "axios";

const CategoryManager = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => {
    console.log("Current Redux state:", state.category);
    return state.category.categoryDatas;
  });
  console.log("total", categories);
  // Add this useEffect for monitoring changes
  useEffect(() => {
    console.log("Categories updated in component:", categories);
  }, [categories]);

  // Modified setCurrentCategory usage
  const handleEditClick = (category) => {
    setCurrentCategory({
      _id: category._id, // Ensure we're using _id
      id: category._id,  // Keep id for compatibility
      title: category.title,
      description: category.description,
      status: category.status,
      isVisible: category.isVisible,
    });
    setShowEditModal(true);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    title: "",
    description: "",
    status: "active",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/admin";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            const fetchedCategories = response.data.map((category) => ({
                ...category,
                id: category._id || category.id,
                _id: category._id || category.id,
                isVisible: category.isVisible || false,
                visible: category.isVisible || false,
                createdDate: category.createdAt || new Date().toISOString(),
            }));

            // Retrieve visibility states from local storage
            const storedVisibilityStates = JSON.parse(
                localStorage.getItem("categoryVisibility") || "{}"
            );

            // Merge fetched data with stored visibility states
            const mergedCategories = fetchedCategories.map((category) => ({
                ...category,
                isVisible: storedVisibilityStates[category._id] !== undefined
                    ? storedVisibilityStates[category._id]
                    : category.isVisible,
                visible: storedVisibilityStates[category._id] !== undefined
                    ? storedVisibilityStates[category._id]
                    : category.isVisible,
            }));

            dispatch(setCategories(mergedCategories));
        } catch (error) {
            toast.error("Failed to fetch categories");
        }
    };

    fetchCategories();
}, [dispatch]);

  const handleAddCategory = async () => {
    if (!newCategory.title || !newCategory.description) {
      toast.error("Title and Description are Required");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/addcategory`, {
        ...newCategory,
        createdDate: new Date().toISOString(),
      });

      const categoryWithDate = {
        ...response.data.category,
        createdDate: new Date().toISOString(), // Ensure createdAt is present
      };

      dispatch(addCategory(response.data.category));
      toast.success("Category Added Successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }

    setNewCategory({ title: "", description: "", status: "active" });
    setShowAddModal(false);
  };

  const handleEditCategory = async () => {
    if (!currentCategory.title || !currentCategory.description) {
      toast.error("Title and Description are Required");
      return;
    }

    try {
      // Create the update payload
      const updatePayload = {
        title: currentCategory.title,
        description: currentCategory.description,
      };

      console.log("Sending update payload:", updatePayload);

      const response = await axios.put(
        `${API_BASE_URL}/categories/${currentCategory.id}`,
        updatePayload
      );

      console.log("Response from server:", response.data);

      if (response.data && response.data.category) {
        // Create updated category object
        const updatedCategory = {
          ...response.data.category,
          id: currentCategory.id, // Ensure ID is preserved
        };

        console.log("Updated category object:", updatedCategory);

        // Update Redux store directly with the new category
        const updatedCategories = categories.map((cat) =>
          cat.id === currentCategory.id ? updatedCategory : cat
        );

        console.log("Updated categories array:", updatedCategories);

        // Dispatch the updated categories array
        dispatch(setCategories(updatedCategories));

        toast.success("Category Updated Successfully");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setShowEditModal(false);
      setCurrentCategory(null);
    }
  };

  // Add this useEffect to monitor changes
  useEffect(() => {
    if (currentCategory) {
      console.log("Current category state:", currentCategory);
    }
  }, [currentCategory]);

  const handleDeleteCategory = async () => {
    try {
        const categoryId = currentCategory._id;
        
        if (!categoryId) {
            console.error('Invalid category ID');
            toast.error("Invalid category ID");
            return;
        }

        const response = await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);

        if (response.data) {
            // Update the Redux store with the filtered categories
            const updatedCategories = categories.filter(cat => cat._id !== categoryId);
            dispatch(setCategories(updatedCategories));
            
            toast.success("Category Deleted Successfully");
            setCurrentCategory(null);
            setShowDeleteModal(false);
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(error.response?.data?.message || "Failed to delete category");
    }
};


  const toggleVisibility = async (categoryId) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/categories/${categoryId}/toggle-visibility`
        );

        if (response.data) {
            // Create a new array with the updated visibility
            const updatedCategories = categories.map(cat => {
                if (cat._id === categoryId) {
                    return {
                        ...cat,
                        isVisible: !cat.isVisible,
                        visible: !cat.isVisible // Update both visibility fields
                    };
                }
                return cat;
            });

            // Update Redux store with the new array
            dispatch(setCategories(updatedCategories));

            // Update local storage
            const storedVisibilityStates = JSON.parse(
                localStorage.getItem("categoryVisibility") || "{}"
            );
            storedVisibilityStates[categoryId] = !categories.find(
                (cat) => cat._id === categoryId
            )?.isVisible;
            localStorage.setItem(
                "categoryVisibility",
                JSON.stringify(storedVisibilityStates)
            );

            toast.success("Category visibility updated");
        }
    } catch (error) {
        console.error("Error toggling visibility:", error);
        toast.error("Failed to update visibility");
    }
};

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50"
      }`}
    >
      <div
        className={`fixed lg:relative sidebar z-20 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64`}
      >
        <Sidebar isDarkMode={isDarkMode} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 lg:hidden z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="flex-1 p-4 lg:p-6 lg:pl-34">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden mr-4 text-gray-600 dark:text-gray-300"
            >
              <FaBars size={24} />
            </button>
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Category
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDarkMode
                ? "bg-gray-700 text-yellow-400"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>

        <motion.div
          className={`rounded-lg p-6 mb-8 ${
            isDarkMode
              ? "bg-gray-800 text-gray-100 shadow-lg"
              : "bg-white shadow"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            List of Category
          </h2>
          <ul className="space-y-4">
            <AnimatePresence>
              {[...categories]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((category) => (
                  <motion.li
                    key={category._id}
                    className={`flex justify-between items-center p-4 rounded-lg shadow ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                        : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <span className="font-bold">{category.title}</span>
                      <p className="text-sm text-gray-500">
                        {category.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        Visibility: {category.isVisible ? "Visible" : "Hidden"}{" "}
                        | Created:{" "}
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditClick(category)}
                        className={`flex items-center px-3 py-1 rounded hover:bg-opacity-80 ${
                          isDarkMode
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <FiEdit className="mr-1" /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentCategory(category);
                          setShowDeleteModal(true);
                        }}
                        className={`flex items-center px-3 py-1 rounded hover:bg-opacity-80 ${
                          isDarkMode
                            ? "bg-red-900 text-red-300"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <FiTrash className="mr-1" /> Delete
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          toggleVisibility(category._id || category.id)
                        }
                        className={`flex items-center px-3 py-1 rounded ${
                          category.isVisible
                            ? isDarkMode
                              ? "bg-green-900 text-green-300"
                              : "bg-green-100 text-green-700"
                            : isDarkMode
                            ? "bg-red-900 text-red-300"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.isVisible ? (
                          <FiEye className="mr-1" />
                        ) : (
                          <FiEyeOff className="mr-1" />
                        )}
                        {category.isVisible ? "Visible" : "Hidden"}
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
            </AnimatePresence>
          </ul>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className={`flex items-center justify-center w-full max-w-xs mx-auto py-2 px-4 rounded hover:bg-opacity-90 ${
            isDarkMode ? "bg-blue-800 text-blue-200" : "bg-blue-600 text-white"
          }`}
        >
          <FiPlus className="mr-2" /> ADD CATEGORY
        </motion.button>

        <AnimatePresence>
          {showAddModal && (
            <Modal
              title="Add Category"
              onClose={() => setShowAddModal(false)}
              isDarkMode={isDarkMode}
            >
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.title}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, title: e.target.value })
                }
                className={`w-full mb-3 p-2 rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className={`w-full mb-3 p-2 rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  isDarkMode={isDarkMode}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCategory}
                  variant="primary"
                  isDarkMode={isDarkMode}
                >
                  OK
                </Button>
              </div>
            </Modal>
          )}

          {showEditModal && currentCategory && (
            <Modal
              title="Edit Category"
              onClose={() => {
                setShowEditModal(false);
                setCurrentCategory(null);
              }}
              isDarkMode={isDarkMode}
            >
              <div className="space-y-4">
                <div>
                  <label
                    className={`block mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={currentCategory.title}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        title: e.target.value,
                      })
                    }
                    className={`w-full p-2 rounded border ${
                      isDarkMode
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={currentCategory.description}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        description: e.target.value,
                      })
                    }
                    className={`w-full p-2 rounded border ${
                      isDarkMode
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentCategory(null);
                  }}
                  variant="secondary"
                  isDarkMode={isDarkMode}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditCategory}
                  variant="primary"
                  isDarkMode={isDarkMode}
                >
                  Save Changes
                </Button>
              </div>
            </Modal>
          )}

          {showDeleteModal && (
            <Modal
              title="Delete Category"
              onClose={() => setShowDeleteModal(false)}
              isDarkMode={isDarkMode}
            >
              <p className={`mb-4 ${isDarkMode ? "text-gray-200" : ""}`}>
                Are you sure you want to delete this category?
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="secondary"
                  isDarkMode={isDarkMode}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteCategory}
                  variant="danger"
                  isDarkMode={isDarkMode}
                >
                  Delete
                </Button>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Modal = ({ children, title, onClose, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className={`${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white"
      } p-6 rounded-lg shadow-lg w-96`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : ""
        }`}
      >
        {title}
      </h3>
      {children}
    </motion.div>
  </motion.div>
);

const Button = ({ children, onClick, variant = "primary", isDarkMode }) => {
  const baseStyle = "px-4 py-2 rounded transition-colors duration-200";
  const variants = isDarkMode
    ? {
        primary: "bg-blue-800 text-blue-200 hover:bg-blue-700",
        secondary: "bg-gray-700 text-gray-300 hover:bg-gray-600",
        danger: "bg-red-900 text-red-300 hover:bg-red-800",
      }
    : {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400",
        danger: "bg-red-500 text-white hover:bg-red-600",
      };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyle} ${variants[variant]}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export default CategoryManager;
