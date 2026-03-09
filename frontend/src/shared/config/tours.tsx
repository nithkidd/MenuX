import type { Step } from "react-joyride";

/**
 * Tour step configurations for different user journeys
 * Each tour guides users through a specific feature or workflow
 */

// Dashboard Tour - First-time user experience
export const dashboardTourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-lg font-semibold mb-2">Welcome to MenuX! 🎉</h2>
        <p>
          Let's take a quick tour to help you get started with creating and
          managing your digital menus.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="search-businesses"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Search Your Businesses</h3>
        <p>
          As you create more businesses, use this search to quickly find the one
          you need.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="business-grid"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Your Businesses</h3>
        <p>
          All your businesses will appear here as cards. Each card shows the
          business name, type, and status.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="create-business-btn"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Create Your First Business</h3>
        <p>
          Click this button to get started. You can create multiple businesses
          for different restaurants, cafes, or stores.
        </p>
      </div>
    ),
    placement: "bottom",
  },
];

// Business Creation Tour
export const businessCreateTourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-lg font-semibold mb-2">Create Your Business</h2>
        <p>
          Fill out these details to set up your business. Don't worry, you can
          edit everything later!
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="business-name-input"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Business Name</h3>
        <p>
          Enter your business name. This will be displayed on your digital menu
          and shared with customers.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="business-type-select"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Business Type</h3>
        <p>
          Select the type of business. This helps customize the menu features
          for your specific needs.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="business-description"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Description (Optional)</h3>
        <p>
          Add a brief description of your business. This helps customers know
          what to expect.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="create-business-submit"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Create Business</h3>
        <p>
          Once you're ready, click here to create your business. You'll be taken
          to your business dashboard next.
        </p>
      </div>
    ),
    placement: "top",
  },
];

// Business Overview Tour
export const businessOverviewTourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-lg font-semibold mb-2">
          Your Business Dashboard 📊
        </h2>
        <p>
          This is your business control center. Let's explore the key features.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="business-status"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Business Status</h3>
        <p>
          These badges show if your menu is Published (live) or Draft, and if
          your business is Active or Inactive.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="menu-url-card"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Share Your Menu</h3>
        <p>
          Copy this URL to share your digital menu with customers. You can also
          generate a QR code for easy access.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="metrics-cards"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Quick Metrics</h3>
        <p>
          See at a glance how many categories and items you have in your menu.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="menu-editor-tab"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Menu Editor</h3>
        <p>
          Click this tab to start adding categories and items to your menu. This
          is where the magic happens!
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="settings-link"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Business Settings</h3>
        <p>
          Update your business info, upload logos, add social media links, and
          customize your menu appearance here.
        </p>
      </div>
    ),
    placement: "bottom",
  },
];

// Menu Editor Tour
export const menuEditorTourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-lg font-semibold mb-2">Menu Editor 📝</h2>
        <p>
          This is where you build your menu. Let's learn how to organize your
          items.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="add-category-btn"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Add Categories</h3>
        <p>
          Start by creating categories (e.g., "Appetizers", "Main Dishes",
          "Drinks"). This helps organize your menu items.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="category-section"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Category Sections</h3>
        <p>
          Each category can hold multiple items. You can rename, reorder, or
          delete categories anytime.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="drag-handle"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Drag to Reorder</h3>
        <p>
          Use these handles to drag and drop categories or items to change their
          order on your menu.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="add-item-btn"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Add Items</h3>
        <p>
          Click here to add menu items to this category. Each item can have
          images, prices, and descriptions.
        </p>
      </div>
    ),
    placement: "bottom",
  },
];

// Item Creation Tour
export const itemCreateTourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-lg font-semibold mb-2">Add Menu Item 🍽️</h2>
        <p>
          Fill in your item details. The more information you provide, the
          better your menu looks!
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="item-image-upload"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Upload Images</h3>
        <p>
          Add up to 5 images of your item. Great photos make your menu more
          appealing!
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="item-name-input"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Item Name</h3>
        <p>
          Give your item a clear, descriptive name. You can also add a Khmer
          name for bilingual menus.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="item-price-input"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Pricing</h3>
        <p>
          Set the sale price (required). You can also add an original price to
          show discounts.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="item-category-select"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Select Category</h3>
        <p>
          Choose which category this item belongs to. You can always move it
          later.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="item-description"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Description</h3>
        <p>
          Describe your item, including ingredients, preparation, or anything
          customers should know.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="item-availability"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Availability & Tags</h3>
        <p>
          Toggle "In Stock" to control item availability. Use "Set as Hot" to
          feature popular items.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="save-item-btn"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Save Your Item</h3>
        <p>
          Once everything looks good, click here to save your item to the menu.
        </p>
      </div>
    ),
    placement: "top",
  },
];

// Export all tour configurations
export const tourConfigs = {
  "dashboard-first-visit": dashboardTourSteps,
  "business-create": businessCreateTourSteps,
  "business-overview": businessOverviewTourSteps,
  "menu-editor": menuEditorTourSteps,
  "item-create": itemCreateTourSteps,
};
