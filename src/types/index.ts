// Define the common types used throughout the application

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  imageUrl: string;
  tags: string[];
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface DisplaySettings {
  cardSize: "small" | "medium" | "large";
  categoryLayout: "grid" | "flex" | "horizontal";
}