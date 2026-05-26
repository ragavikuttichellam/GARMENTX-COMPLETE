# WhatsApp Integration - API Reference

## Complete API Documentation

### 📚 Table of Contents
1. [Utility Functions](#utility-functions)
2. [React Components](#react-components)
3. [Props & Parameters](#props--parameters)
4. [Usage Examples](#usage-examples)
5. [Return Values](#return-values)
6. [Error Handling](#error-handling)

---

## Utility Functions

### `generateProductMessage(product, quantity, productUrl)`

Generates a professional WhatsApp message with product details.

**Parameters:**
```javascript
{
  product: {
    name: string,           // Product name
    price: number,          // Product price in rupees
    description?: string,   // Product description (optional)
    colors?: string[],      // Available colors (optional)
    sizes?: string[],       // Available sizes (optional)
    images?: string[],      // Product images (optional)
  },
  quantity: number,         // Quantity (default: 1)
  productUrl: string        // Full product URL
}
```

**Returns:**
```javascript
string // Formatted WhatsApp message
```

**Example:**
```javascript
import { generateProductMessage } from './utils/whatsappUtils';

const product = {
  name: 'Premium Cotton T-Shirt',
  price: 499,
  description: 'Ultra-soft premium cotton',
  colors: ['Black', 'White'],
  sizes: ['S', 'M', 'L'],
  images: ['https://...jpg']
};

const message = generateProductMessage(
  product,
  1,
  'https://garmentx.com/product/123'
);

console.log(message);
// Output: Professional formatted message with all details
```

---

### `generateWhatsAppURL(product, quantity, productUrl)`

Creates a WhatsApp share URL ready for opening.

**Parameters:**
```javascript
// Same as generateProductMessage
```

**Returns:**
```javascript
string // WhatsApp API URL with encoded message
```

**Example:**
```javascript
const url = generateWhatsAppURL(product, 1, window.location.href);
window.open(url, '_blank', 'noopener,noreferrer');
```

---

### `openWhatsAppChat(product, quantity, productUrl)`

Directly opens WhatsApp chat with pre-filled message.

**Parameters:**
```javascript
// Same as generateProductMessage
```

**Returns:**
```javascript
void // Opens new window/tab
```

**Example:**
```javascript
import { openWhatsAppChat } from './utils/whatsappUtils';

const handleOrderClick = () => {
  openWhatsAppChat(product, 1, window.location.href);
};
```

---

### `generateCustomWhatsAppURL(message)`

Creates a WhatsApp URL with custom message.

**Parameters:**
```javascript
{
  message: string  // Custom message to send
}
```

**Returns:**
```javascript
string // WhatsApp API URL
```

**Example:**
```javascript
const message = 'Hi! I need size S in black color. Can you help?';
const url = generateCustomWhatsAppURL(message);
window.open(url, '_blank');
```

---

### `generateGeneralInquiryURL()`

Creates a URL for general inquiry without product details.

**Parameters:**
```javascript
// None
```

**Returns:**
```javascript
string // WhatsApp API URL for general inquiry
```

**Example:**
```javascript
import { generateGeneralInquiryURL } from './utils/whatsappUtils';

const inquiryUrl = generateGeneralInquiryURL();
window.open(inquiryUrl, '_blank');
```

---

### `shareProductOnWhatsApp(product, quantity, productUrl)`

Advanced sharing using native share API when available.

**Parameters:**
```javascript
// Same as generateProductMessage
```

**Returns:**
```javascript
void // Promise-based, uses native share or WhatsApp fallback
```

**Example:**
```javascript
import { shareProductOnWhatsApp } from './utils/whatsappUtils';

const handleShare = async () => {
  shareProductOnWhatsApp(product, 1, window.location.href);
};
```

---

### `formatPrice(price)`

Formats price with Indian rupee symbol.

**Parameters:**
```javascript
{
  price: number  // Price in rupees
}
```

**Returns:**
```javascript
string // Formatted price (e.g., "₹499")
```

**Example:**
```javascript
import { formatPrice } from './utils/whatsappUtils';

const displayPrice = formatPrice(499);
console.log(displayPrice); // "₹499"
```

---

### `getWhatsAppInfo()`

Returns WhatsApp business information.

**Parameters:**
```javascript
// None
```

**Returns:**
```javascript
{
  number: string,      // WhatsApp business number
  company: string,     // Company name
  message: string      // Default greeting message
}
```

**Example:**
```javascript
import { getWhatsAppInfo } from './utils/whatsappUtils';

const info = getWhatsAppInfo();
console.log(info.number);   // "+919999999999"
console.log(info.company);  // "GarmentX"
```

---

## React Components

### `<WhatsAppButton />`

Reusable WhatsApp button component.

**Props:**
```javascript
{
  product: object,              // Product data (REQUIRED)
  quantity?: number,            // Quantity (default: 1)
  buttonText?: string,          // Button label (default: "Order on WhatsApp")
  variant?: string,             // Style variant (gradient|primary|outline|ghost, default: gradient)
  size?: string,                // Button size (small|medium|large, default: medium)
  fullWidth?: boolean,          // Full width button (default: false)
  showIcon?: boolean,           // Show WhatsApp icon (default: true)
  onBeforeClick?: function,     // Callback before opening WhatsApp
  onAfterClick?: function,      // Callback after opening WhatsApp
  disabled?: boolean,           // Disable button (default: false)
  className?: string,           // Additional CSS class
  style?: object                // Inline styles
}
```

**Returns:**
```javascript
JSX Element
```

**Example:**
```jsx
import WhatsAppButton from './components/WhatsApp/WhatsAppButton';

<WhatsAppButton
  product={product}
  quantity={1}
  buttonText="Order on WhatsApp"
  variant="gradient"
  size="large"
  fullWidth={true}
  onBeforeClick={() => console.log('Opening...')}
/>
```

---

### `<FloatingWhatsApp />`

Floating WhatsApp widget for all pages.

**Props:**
```javascript
// No props required - uses configuration from utils
```

**Returns:**
```javascript
JSX Element
```

**Example:**
```jsx
import FloatingWhatsApp from './components/WhatsApp/FloatingWhatsApp';

function App() {
  return (
    <>
      {/* Your app */}
      <FloatingWhatsApp />
    </>
  );
}
```

**Features:**
- Floating button on bottom-right
- Auto-dismissing tooltip
- Expandable chat window
- Mobile responsive
- Animations

---

### `<ProductCardWithWhatsApp />`

Product card with integrated WhatsApp button.

**Props:**
```javascript
{
  product: object,              // Product data (REQUIRED)
  onViewDetails?: function,     // Callback for view details button
  showWhatsAppButton?: boolean, // Show WhatsApp button (default: true)
  onAddToCart?: function        // Callback for add to cart
}
```

**Returns:**
```javascript
JSX Element
```

**Example:**
```jsx
import ProductCardWithWhatsApp from './components/ProductCardWithWhatsApp/ProductCardWithWhatsApp';

<ProductCardWithWhatsApp
  product={product}
  onViewDetails={(id) => navigate(`/product/${id}`)}
  showWhatsAppButton={true}
/>
```

---

### `<WhatsAppProductDemo />`

Complete demo page with all examples.

**Props:**
```javascript
// No props
```

**Returns:**
```javascript
JSX Element - Full demo page
```

**Usage:**
Add route in App.js:
```jsx
<Route path="/whatsapp-demo" element={<WhatsAppProductDemo />} />
```

---

## Props & Parameters

### Product Object Structure

```javascript
{
  // Required
  name: string,              // Product name
  price: number,             // Current price in rupees
  
  // Optional but recommended
  originalPrice?: number,    // Original price (shows discount)
  description?: string,      // Product description
  brand?: string,            // Brand name
  rating?: number,           // Rating 0-5
  numReviews?: number,       // Number of reviews
  stock?: number,            // Available quantity
  
  // Image & media
  images?: string[],         // Array of image URLs
  
  // Attributes
  colors?: string[],         // Available colors
  sizes?: string[],          // Available sizes
  
  // IDs
  id?: string,               // Product ID
  _id?: string               // MongoDB ID
}
```

### Button Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `gradient` | Green gradient with shadow | Primary CTA (recommended) |
| `primary` | Solid green button | Secondary CTA |
| `outline` | Green border, white background | Tertiary action |
| `ghost` | Transparent, text only | Less prominent actions |

### Button Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| `small` | 8px 16px | 13px |
| `medium` | 12px 24px | 14px |
| `large` | 16px 32px | 16px |

---

## Usage Examples

### Basic Usage
```jsx
import WhatsAppButton from './components/WhatsApp/WhatsAppButton';

function ProductPage() {
  const product = { name: 'T-Shirt', price: 499 };
  
  return (
    <WhatsAppButton
      product={product}
      buttonText="Order Now"
    />
  );
}
```

### With Callbacks
```jsx
<WhatsAppButton
  product={product}
  onBeforeClick={() => {
    console.log('User clicked WhatsApp');
    trackEvent('whatsapp_click', { productId: product.id });
  }}
  onAfterClick={() => {
    console.log('WhatsApp opened');
  }}
/>
```

### Conditional Rendering
```jsx
<WhatsAppButton
  product={product}
  disabled={product.stock === 0}
  buttonText={product.stock > 0 ? 'Order on WhatsApp' : 'Out of Stock'}
/>
```

### Multiple Variants
```jsx
<div style={{ display: 'flex', gap: '10px' }}>
  <WhatsAppButton product={product} variant="gradient" size="large" />
  <WhatsAppButton product={product} variant="outline" size="large" />
  <WhatsAppButton product={product} variant="ghost" size="large" />
</div>
```

### Utility Function Usage
```jsx
import { openWhatsAppChat, generateWhatsAppURL } from './utils/whatsappUtils';

// Direct open
const handleClick = () => {
  openWhatsAppChat(product, 1, window.location.href);
};

// Or get URL for custom handling
const url = generateWhatsAppURL(product, 1, window.location.href);
fetch('/api/track', { 
  method: 'POST',
  body: JSON.stringify({ event: 'whatsapp_click', url })
}).then(() => {
  window.open(url, '_blank');
});
```

---

## Return Values

### Message Format

Generated messages follow this structure:

```
Hello! 👋 I'm interested in ordering the following product from [COMPANY]:

📦 Product Details
━━━━━━━━━━━━━━━━━
🏷️  Name: [Product Name]
💰 Price: ₹[Price]
📊 Quantity: [Qty]
💵 Total: ₹[Total]

📝 Details: [Description - first 100 chars]

🔗 Product Link: [URL]

✅ Shipping Available
🚚 Free delivery on orders above ₹999
📍 Pan India Delivery

💳 Payment Options
✓ Online Payment
✓ Cash on Delivery (COD)
✓ UPI

Please confirm availability and proceed with the order. Thank you! 🙏
```

### URL Format

WhatsApp URLs follow this pattern:
```
https://wa.me/[PHONE_NUMBER]?text=[ENCODED_MESSAGE]
```

Example:
```
https://wa.me/919999999999?text=Hello%21%20I%20want%20to%20order...
```

---

## Error Handling

### Common Issues

**1. WhatsApp not opening**
```javascript
try {
  openWhatsAppChat(product, 1, productUrl);
} catch (error) {
  console.error('WhatsApp error:', error);
  // Fallback: show copy-to-clipboard option
  copyToClipboard(generateProductMessage(product, 1, productUrl));
}
```

**2. Invalid phone number**
```javascript
// Always validate format
const isValidPhone = /^\+\d{1,15}$/.test(phoneNumber);
if (!isValidPhone) {
  console.error('Invalid phone format');
}
```

**3. Message too long**
```javascript
// WhatsApp limit is 4096 characters
const message = generateProductMessage(product, 1, url);
if (message.length > 4096) {
  console.warn('Message truncated', message.substring(0, 4096));
}
```

---

## Performance Optimization

### Lazy Load Components
```jsx
const FloatingWhatsApp = React.lazy(() => 
  import('./components/WhatsApp/FloatingWhatsApp')
);

<Suspense fallback={null}>
  <FloatingWhatsApp />
</Suspense>
```

### Memoize Components
```jsx
const MemoizedButton = React.memo(WhatsAppButton);
```

### Cache URLs
```javascript
const whatsappUrlCache = new Map();

export const getWhatsAppURL = (productId) => {
  if (whatsappUrlCache.has(productId)) {
    return whatsappUrlCache.get(productId);
  }
  const url = generateWhatsAppURL(product);
  whatsappUrlCache.set(productId, url);
  return url;
};
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| IE 11 | ❌ Not supported |
| Mobile Safari | ✅ Full |
| Chrome Mobile | ✅ Full |

---

## TypeScript Support

```typescript
interface Product {
  name: string;
  price: number;
  description?: string;
  originalPrice?: number;
  stock?: number;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  rating?: number;
  numReviews?: number;
  brand?: string;
  id?: string;
  _id?: string;
}

interface WhatsAppButtonProps {
  product: Product;
  quantity?: number;
  buttonText?: string;
  variant?: 'gradient' | 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showIcon?: boolean;
  onBeforeClick?: () => void;
  onAfterClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

import WhatsAppButton from './components/WhatsApp/WhatsAppButton';

const button: React.FC<WhatsAppButtonProps> = (props) => {
  // Implementation
};
```

---

## Configuration Reference

### In `whatsappUtils.js`:

```javascript
// Company Info
const WHATSAPP_NUMBER = "+919999999999";
const COMPANY_NAME = "GarmentX";

// Modify these to customize all components
```

---

## Migration Guide

### From Old System (if any)

```javascript
// Old way
onClick={() => window.open('https://wa.me/...', '_blank')}

// New way
<WhatsAppButton product={product} />

// Benefits:
// - Reusable component
// - Consistent styling
// - Auto message generation
// - Better accessibility
// - Mobile optimized
```

---

## Testing Guide

### Unit Tests
```javascript
import { generateProductMessage, generateWhatsAppURL } from './whatsappUtils';

test('generateProductMessage creates proper format', () => {
  const message = generateProductMessage(mockProduct, 1, 'http://test');
  expect(message).toContain(mockProduct.name);
  expect(message).toContain(mockProduct.price);
});

test('generateWhatsAppURL encodes message properly', () => {
  const url = generateWhatsAppURL(mockProduct, 1, 'http://test');
  expect(url).toContain('https://wa.me/');
  expect(url).toContain('?text=');
});
```

### Integration Tests
```javascript
test('WhatsAppButton opens WhatsApp', () => {
  render(<WhatsAppButton product={mockProduct} />);
  const button = screen.getByRole('button');
  window.open = jest.fn();
  
  fireEvent.click(button);
  
  expect(window.open).toHaveBeenCalledWith(
    expect.stringContaining('wa.me'),
    expect.anything()
  );
});
```

---

## Troubleshooting API Issues

| Issue | Solution |
|-------|----------|
| Message not encoding | Check encodeURIComponent usage |
| WhatsApp not opening | Verify browser supports window.open |
| Button not responding | Check product object structure |
| URL too long | Trim product description |
| Mobile not working | Test on actual device |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | May 24, 2026 | Initial release |

---

**API Reference Version:** 1.0.0
**Last Updated:** May 24, 2026
**Status:** Production Ready ✅
