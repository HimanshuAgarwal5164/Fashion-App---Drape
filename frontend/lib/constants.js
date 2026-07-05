export const ITEM_TYPES = [
  { value: "kurta", label: "Kurta", genders: ["men", "unisex", "non-binary"] },
  { value: "kurti", label: "Kurti", genders: ["women", "non-binary"] },
  { value: "shirt", label: "Shirt", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "tshirt", label: "T-Shirt", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "trousers", label: "Trousers / Pants", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "saree", label: "Saree", genders: ["women"] },
  { value: "lehenga", label: "Lehenga", genders: ["women", "non-binary"] },
  { value: "anarkali", label: "Anarkali", genders: ["women", "non-binary"] },
  { value: "sharara", label: "Sharara", genders: ["women", "non-binary"] },
  { value: "salwar_suit", label: "Salwar Suit", genders: ["women", "non-binary"] },
  { value: "dress", label: "Dress", genders: ["women", "non-binary"] },
  { value: "gown", label: "Gown", genders: ["women"] },
  { value: "skirt", label: "Skirt", genders: ["women", "non-binary"] },
  { value: "blazer", label: "Blazer", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "suit", label: "Suit", genders: ["men", "women", "non-binary"] },
  { value: "sherwani", label: "Sherwani", genders: ["men"] },
  { value: "jacket", label: "Jacket / Coat", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "hoodie", label: "Hoodie / Sweatshirt", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "co_ord", label: "Co-ord Set", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "jumpsuit", label: "Jumpsuit", genders: ["women", "non-binary"] },
  { value: "activewear", label: "Activewear", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "loungewear", label: "Loungewear", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "top", label: "Top", genders: ["women", "non-binary"] },
  { value: "kaftan", label: "Kaftan", genders: ["women", "non-binary"] },
  { value: "dungaree", label: "Dungaree", genders: ["women", "non-binary", "unisex"] },
  { value: "waistcoat", label: "Waistcoat", genders: ["men", "women", "non-binary", "unisex"] },
];

export const PRICE_OPTIONS = [
  { value: "all", label: "All Budgets" },
  { value: "budget", label: "Budget (Rs 500-2000)" },
  { value: "mid", label: "Mid (Rs 2000-8000)" },
  { value: "premium", label: "Premium (Rs 8000+)" },
];

export const GENDER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "non-binary", label: "Non-Binary" },
  { value: "unisex", label: "Unisex" },
];

export const DEFAULT_API_URL = "http://localhost:8000";
