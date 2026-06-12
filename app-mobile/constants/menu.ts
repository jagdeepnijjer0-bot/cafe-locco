// Cafe Locco menu — imported from the approved MENU_DRAFT_FOR_VERIFICATION.md
// (transcribed from the official cafelocco.com menu PDF).
import { Ionicons } from '@expo/vector-icons';

export type Diet = 'V' | 'VG' | 'GF';

export interface MenuItem {
  name: string;
  description?: string;
  price: string; // numeric string, shown with a £ prefix
  diet?: Diet[];
  note?: string; // e.g. "GF option available", "+£2.50 chicken"
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  note?: string;
  items: MenuItem[];
}

export const DIET_LABELS: Record<Diet, string> = {
  V: 'Vegetarian',
  VG: 'Vegan',
  GF: 'Gluten-Free',
};

export const menu: MenuCategory[] = [
  {
    id: 'breakfast',
    label: 'BREAKFAST',
    icon: 'sunny-outline',
    items: [
      { name: 'LOCCO BREAKFAST', price: '14', description: 'Scrambled egg, chicken rashers, spicy lamb sausage, baby buttered mushrooms, crispy hashbrown bites, grilled tomatoes, toasted shokupan and LOCCO beans.' },
      { name: 'GLUTEN-FREE BREAKFAST', price: '14', diet: ['V', 'GF'], description: 'Scrambled eggs, smashed avocado, baby buttered mushrooms, grilled tomatoes, hash browns, LOCCO beans, gluten-free bread & spread.' },
      { name: 'VEGAN BREAKFAST', price: '14', diet: ['VG'], description: 'Veggie sausage, falafel, crispy hash brown bites, baby buttered mushrooms, grilled tomatoes, garlic chilli spinach, smashed avocado, LOCCO beans, toasted sourdough & vegan spread.' },
      { name: 'TRADITIONAL DESI BREAKFAST', price: '14', description: 'Paratha or fried puris with spiced omelette (onions, peppers, tomatoes), creamy cheese masala, crispy potato bites, sausage, zesty pickle, balsamic halwa toast.' },
      { name: 'SPICE ME UP SCRAMBLED', price: '13.49', diet: ['V'], description: 'Hot chilli scrambled eggs, cream cheese, masala, creamy smashed avocado, LOCCO beans, toasted sourdough. Drizzled with house sauce & sriracha.' },
      { name: 'AVO TOAST', price: '12.99', diet: ['V'], note: 'GF option available', description: 'Toasted shokupan, avocado, poached eggs, onions & tomatoes. Garnished with purple pickles, feta and salad.' },
      { name: 'BURRATA BRUSCHETTA', price: '14.99', diet: ['V'], description: 'Toasted sourdough with garlic olive oil, smashed burrata, char-grilled vine tomatoes, balsamic glaze.' },
      { name: 'THE DELICATE ROYALE', price: '15', diet: ['V'], description: 'Toasted muffin with spinach, chilli, cream cheese, and poached eggs, topped with hollandaise, paprika, edible petals.' },
      { name: 'THE CHEESY ONE', price: '13.49', description: 'Toasted croissant with cream cheese, avocado, crispy chicken parmesan, chicken rashers, and poached eggs, cheese sauce and a sprinkle of parmesan.' },
      { name: 'LAMB FRITTER STACK', price: '15.49', description: 'Crisp lamb-minced fritters layered with smashed avo, poached eggs, side of house sauce.' },
      { name: 'GOLDEN CORN FRITTERS', price: '14.99', diet: ['V'], description: 'Corn fritters topped with poached eggs, cream cheese, smashed avocado, pickled cucumber and a house salsa of tomato, red onion, jalapeño and coriander.' },
      { name: 'BLUSH AÇAÍ BOWL', price: '16.95', diet: ['V'], description: 'Açai base blended with protein and oat milk, topped with granola, strawberries, raspberries, blueberries, white chocolate shavings, coconut flakes, peanut butter.' },
      { name: 'FRUITFUL GRANOLA', price: '16.95', diet: ['V'], description: 'Golden granola layered with caramelised yoghurt and peanut butter, banana, mango, strawberries and blueberries, biscoff crumbs, honey and chia seeds.' },
    ],
  },
  {
    id: 'sharers',
    label: 'SHARERS',
    icon: 'nutrition-outline',
    note: 'All served with house sauce',
    items: [
      { name: 'PANEER POCKETS', price: '10', diet: ['V'], description: "Crispy dumplings filled with paneer, fresh vegetables, aromatic spices, drizzle of Locco's chilli sauce." },
      { name: 'LAMB GYOZAS', price: '10', description: 'Crispy fried lamb dumplings stuffed with seasoned lamb and mixed vegetables, topped with sriracha mayo.' },
      { name: 'SAMOSA CHAAT', price: '10', diet: ['V'], description: 'Crispy samosa with chickpea curry, cooling yoghurt and tangy spiced chutneys.' },
      { name: 'SALMON & CREAM CHEESE CANAPÉ', price: '10', description: 'Delicate bites topped with smoked salmon and smooth cream cheese.' },
      { name: 'BANG BANG PRAWNS', price: '10', description: 'Prawns deep-fried in a crispy batter, served with our secret locco sauce.' },
    ],
  },
  {
    id: 'burgers',
    label: 'BURGERS',
    icon: 'fast-food-outline',
    note: 'With seasoned rustic fries & house sauce',
    items: [
      { name: 'THE WAGYU', price: '21', description: 'Double wagyu smashed beef, cheese, fried onions, salad, relish, Locco drip sauce in toasted brioche.' },
      { name: 'VEGGIE CRUNCH', price: '17', diet: ['V'], description: 'Sesame brioche bun, grilled halloumi, smashed avocado, lettuce, mayo, sweet chilli, crunchy Heatwave Doritos.' },
      { name: 'THE INFERNO', price: '20', description: 'Southern fried chicken breast, tikka hash brown, grilled halloumi, lettuce, mayo, sweet chilli in a sesame brioche bun.' },
      { name: 'PRAWN ROYALE', price: '19', description: 'Golden, juicy prawn burger stacked with all the trimmings.' },
    ],
  },
  {
    id: 'favourites',
    label: 'FAVOURITES',
    icon: 'star-outline',
    items: [
      { name: 'GOLDEN YOLK BULGOGI TOAST', price: '20', description: 'Ribeye steak and golden yolk, melted cheese; cheesy rustic fries, signature house sauce.' },
      { name: 'LASAGNA LOADED FRIES', price: '17.49', description: 'Rustic fries loaded with minced meat, creamy béchamel, grilled cheddar; side of garlic ciabatta.' },
      { name: 'CHICKEN PARM', price: '22', description: 'Chicken Parmigiana, Napoli sauce, mozzarella, burrata; fresh spaghetti and basil pesto.' },
      { name: 'JERK CHICKEN PRESSED BREAD', price: '17.49', description: 'Slow-marinated chicken, smoky island spices, melted cheese pressed in golden bread; rustic fries and slaw.' },
      { name: 'CREAMY RIGATONI', price: '16.49', diet: ['V'], note: '+£2.50 chicken / +£3.00 prawns', description: 'Creamy rigatoni, aubergine, sweetcorn, aromatic spices, burrata and parmesan.' },
      { name: 'THE VIRAL CAESAR CRUNCH WRAP', price: '20', description: 'Southern fried chicken, lettuce, caesar dressing, parmesan, crouton crumbs in a toasted tortilla; rustic fries, house sauce.' },
    ],
  },
  {
    id: 'mains',
    label: 'MAINS',
    icon: 'restaurant-outline',
    items: [
      { name: 'PHILLY-PHULLY LOADED', price: '23', description: 'Philly steak, cheese sauce, crispy onions, portobello mushrooms, creamy garlic sauce, in a bowl with cheesy rustic fries.' },
      { name: 'JOLLOF LAMB CHOPS', price: '23', description: 'Smoky, spice-glazed lamb chops, with tender broccoli, baby corn, carrots and green beans.' },
      { name: 'THE CHICKEN DELI', price: '18.49', description: 'Tandoori chicken, stir-fried onions and peppers, LOCCO house sauce, melted cheese on toasted shokupan, masala rustic fries.' },
      { name: 'THE BOMBAY MELT', price: '16.49', diet: ['V'], description: 'Golden fried sourdough filled with paneer, spiced onions, peppers, tomato and melted cheese, seasoned rustic fries, mint yoghurt.' },
      { name: 'MASALA COD TACOS', price: '17.99', description: 'Tacos with white cod, beetroot slaw, fresh lime, mint yoghurt, feta crumble, seasoned rustic fries, house sauce.' },
      { name: 'ROASTED ROOTS', price: '16.95', diet: ['V'], description: 'Roasted beetroot, peppery rocket, feta, pomegranate, lemon dressing, cucumber, gherkins, red and spring onions, croutons, house crumble.' },
    ],
  },
  {
    id: 'street-bowls',
    label: 'LOCCO STREET BOWLS',
    icon: 'flame-outline',
    note: 'Fragrant biryani rice, rustic fries, salad & house raita',
    items: [
      { name: 'CHICKEN BUTTER BE NICE', price: '20', description: 'Rich butter chicken with fragrant biryani rice and rustic fries.' },
      { name: 'LOCCO LAMB KARAHI', price: '22', description: 'Bold LOCCO lamb karahi with fragrant biryani rice and rustic fries.' },
    ],
  },
  {
    id: 'kids',
    label: 'LOCCO KIDS',
    icon: 'happy-outline',
    note: 'Offer only eligible for Locco kids',
    items: [
      { name: 'CHICKEN NUGGETS AND RUSTIC FRIES', price: '10' },
      { name: 'BEEF BURGER AND RUSTIC FRIES', price: '10' },
      { name: 'PIZZA BREAD AND RUSTIC FRIES – CHEESE AND TOMATO', price: '10', diet: ['V'] },
    ],
  },
  {
    id: 'sides',
    label: 'SIDES',
    icon: 'pizza-outline',
    items: [
      { name: 'Waffle Fries', price: '5', diet: ['V'] },
      { name: 'Crispy Potato Bites', price: '5', diet: ['V'] },
      { name: 'Seasoned Rustic Fries', price: '5', diet: ['VG'] },
      { name: 'Masala Rustic Fries', price: '6', diet: ['VG'] },
      { name: 'Shokupan Toast', price: '2', diet: ['V'] },
      { name: 'Smashed Croissant', price: '2', diet: ['V'] },
      { name: 'Smashed Avocado', price: '3', diet: ['VG'] },
    ],
  },
  {
    id: 'addons',
    label: 'ADD-ONS',
    icon: 'add-circle-outline',
    items: [
      { name: 'Paratha or Puri', price: '2', diet: ['V'] },
      { name: 'Masala Chana', price: '3', diet: ['VG'] },
      { name: 'House Keema', price: '6' },
      { name: 'Locco Beans', price: '3', diet: ['VG'] },
      { name: 'Garlic & Chilli Spinach', price: '3', diet: ['VG'] },
      { name: 'Baby Buttered Mushrooms', price: '3', diet: ['V'] },
      { name: 'Badam Halwa', price: '3', diet: ['V'] },
    ],
  },
  {
    id: 'sweets',
    label: 'SWEET PLATES',
    icon: 'ice-cream-outline',
    items: [
      { name: 'TILDA CAKE', price: '13', diet: ['V'], description: 'Our signature Tilda cake — soft, indulgent, rich silky ganache, vanilla pod ice cream.' },
      { name: 'FERRERO TIRAMISU', price: '15', diet: ['V'], description: 'Espresso sponge, Ferrero Rocher mascarpone, cocoa dust, golden Ferrero Rocher.' },
      { name: 'DUBAI KNAFEH', price: '15', diet: ['V'], description: 'Pistachio knafeh brownie inspired by Dubai chocolate, vanilla pod ice cream.' },
      { name: 'KINDER BUENO BITES', price: '15', diet: ['V'], description: 'Warm mini doughnuts with Kinder Bueno, vanilla pod ice cream.' },
      { name: 'CAPPUCCINO GLUTEN-FREE CAKE', price: '12', diet: ['V', 'GF'], description: 'Vanilla sponge with cappuccino cream and cocoa dusting, vanilla ice cream.' },
      { name: 'PISTACHIO CRÈME LECHE CAKE', price: '12', diet: ['V'], description: 'Milk-soaked sponge, white chocolate, pistachio, cream.' },
      { name: 'CARROT CAKE', price: '13', diet: ['V'], description: 'Fresh carrot cake, cream cheese icing, white chocolate drizzle, vanilla pod ice cream.' },
      { name: 'RASPBERRY & WHITE CHOCOLATE', price: '12', diet: ['V'], description: 'Creamy white chocolate cheesecake, raspberry swirl, buttery biscuit base, vanilla pod ice cream.' },
      { name: "LE DOUCE FOLIE 'SWEET MADNESS'", price: '18', diet: ['V'], description: 'Golden French toast with Nutella sauce, strawberries, banana, vanilla ice cream.' },
      { name: 'BISCOFF VEGAN CHEESECAKE', price: '12', diet: ['VG'], description: 'Creamy vegan cheesecake, spiced biscuit base, vegan vanilla ice cream.' },
    ],
  },
  {
    id: 'indulgence',
    label: 'THE INDULGENCE BAR',
    icon: 'sparkles-outline',
    note: 'Lattes & matchas, hot or iced',
    items: [
      { name: 'KINDER BUENO SILK LATTE', price: '10' },
      { name: 'STRAWBERRIES & CREAM MATCHA', price: '10' },
      { name: 'FRESH COCONUT MATCHA', price: '11' },
      { name: 'JAMMY DODGER MILKSHAKE', price: '10' },
      { name: 'PISTACHIO CREAM SPANISH', price: '10' },
      { name: 'MANGO CREAM MATCHA', price: '11' },
      { name: "TERRY'S CHOCOLATE ORANGE WARM COCO", price: '10' },
    ],
  },
  {
    id: 'brew',
    label: 'BREW BAR',
    icon: 'leaf-outline',
    note: 'Teas',
    items: [
      { name: 'ENGLISH BREAKFAST', price: '4' },
      { name: 'MOROCCAN MINT TEA', price: '4' },
      { name: 'KARAK CHAI', price: '5.49' },
      { name: 'POMEGRANATE GREEN TEA', price: '4' },
      { name: 'SPICED APPLE CINNAMON', price: '4' },
    ],
  },
  {
    id: 'coffee',
    label: 'HOUSE COFFEE',
    icon: 'cafe-outline',
    items: [
      { name: 'FLAT WHITE', price: '4' },
      { name: 'MOCHA', price: '5' },
      { name: 'DOUBLE ESPRESSO', price: '3.50' },
      { name: 'CAPPUCCINO', price: '4' },
      { name: 'AMERICANO – WHITE OR BLACK', price: '4' },
      { name: 'MACCHIATO', price: '4' },
    ],
  },
  {
    id: 'soft-drinks',
    label: 'SOFT DRINKS',
    icon: 'water-outline',
    items: [
      { name: 'STILL WATER', price: '4' },
      { name: 'ZANTI COLA – NORMAL OR ZERO', price: '4' },
      { name: 'ZANTI ZEST OR ORANGE', price: '4' },
      { name: 'REDBULL', price: '4' },
      { name: 'SPARKLING WATER', price: '4' },
      { name: 'ZANTI ORANGE', price: '4' },
      { name: 'GINGER ALE', price: '4' },
      { name: 'FRUIT SHOOT', price: '2' },
    ],
  },
  {
    id: 'mocktails',
    label: 'MOCKTAILS',
    icon: 'wine-outline',
    items: [
      { name: 'LOCCO PUNCH', price: '11', description: 'Fresh orange, pear, apple and a kick of ginger.' },
      { name: 'STRAWBERRY MOJITO', price: '11' },
      { name: 'COCO COLADA', price: '11' },
      { name: 'FRESH COCONUT', price: '8' },
      { name: 'GUAVA, COCONUT AND MANGO SMOOTHIE', price: '11' },
      { name: 'PASSION MANGO DAIQUIRI', price: '11' },
      { name: 'WHITE WHISPER', price: '11' },
    ],
  },
];

// Convenience lookups
export const categories = menu.map((c) => ({ id: c.id, label: c.label, icon: c.icon }));
