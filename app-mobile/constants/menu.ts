// Cafe Locco menu — July 2026 Café Locco menu (exact item names, descriptions
// and prices as supplied by the owner).
import { Ionicons } from '@expo/vector-icons';

export type Diet = 'V' | 'VG' | 'GF';

export interface MenuItem {
  name: string;
  description?: string;
  price: string; // numeric string, shown with a £ prefix
  diet?: Diet[];
  note?: string; // e.g. "Served only iced", "+£2.50 chicken"
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
    note: 'How do you take your eggs? Poached, fried, or scrambled – the choice is yours.',
    items: [
      { name: 'LOCCO BREAKFAST', price: '14', description: 'Scrambled eggs, chicken rashers, spicy lamb sausage, baby buttoned mushrooms, crispy hashbrown bites, grilled tomatoes, toasted shokupan and LOCCO beans.' },
      { name: 'VEGGIE BREAKFAST', price: '14', description: 'Scrambled eggs, veggie sausage, crispy hashbrown bites, baby buttoned mushrooms, spicy chickpeas, grilled tomatoes, toasted shokupan and LOCCO beans.' },
      { name: 'GLUTEN-FREE BREAKFAST', price: '14', description: 'Scrambled eggs, smashed avocado, baby buttoned mushrooms, grilled tomatoes, grilled halloumi, hash browns, LOCCO beans, gluten free bread & gluten free spread.' },
      { name: 'TRADITIONAL DESI BREAKFAST', price: '14', description: 'Baked paratha or fried puris served with spiced masala omelette (onions, peppers, tomatoes, cheese), creamy chana masala, crispy potato bites, chicken sausages, zesty pickle, and badam halwa.' },
      { name: 'VEGAN BREAKFAST', price: '14', description: 'Veggie sausage, falafel, crispy hash brown bites, baby buttoned mushrooms, grilled tomatoes, garlic chilli spinach, smashed avocado, LOCCO beans, toasted sourdough & vegan spread.' },
      { name: 'THE HEAVY WEIGHT', price: '23', description: '8oz sirloin steak cooked to your liking, served with two fried eggs, crispy potato hash, grilled tomatoes, and toasted sourdough. Finished with a rich garlic mushroom sauce, this is a hearty, protein-packed breakfast.' },
    ],
  },
  {
    id: 'classics',
    label: 'CLASSICS',
    icon: 'egg-outline',
    note: 'All served with potato bites',
    items: [
      { name: 'LAMB FRITTER STACK', price: '16.95', description: 'Crisp lamb-minced fritters layered with smashed avo, poached egg served with side of house sauce. Bold, savoury and seriously satisfying.' },
      { name: 'THE DELICATE ROYALE', price: '16.95', description: 'Toasted English muffin layered with chilli-garlic cream cheese, slow-sautéed spinach and avocado, crowned with smoked salmon and two poached free-range eggs. Finished with warm hollandaise, Aleppo chilli, micro herbs and delicate edible petals.' },
      { name: 'THE CHEESY ONE', price: '16.95', description: 'Toasted croissant with cream cheese, avocado, crispy chicken parmesan, chicken rashers, and poached eggs, served with cheese sauce and a sprinkle of parmesan.' },
      { name: 'AVO TOAST', price: '13.95', note: '+£1.50 pesto garlic mushrooms   +£1.50 grilled halloumi', description: 'Toasted shokupan, avocado, poached eggs, onions & tomatoes. All garnished with feta. Can be made gluten free.' },
    ],
  },
  {
    id: 'appetisers',
    label: 'APPETISERS',
    icon: 'nutrition-outline',
    items: [
      { name: 'LAMB CHOPS', price: '12', description: 'Four smoky, spice-glazed lamb chops grilled to perfection, delivering tender, juicy meat with rich, aromatic flavours in every bite.' },
      { name: 'LOCCO PANI-PURI', price: '10', description: 'Crisp semolina puris filled with spiced potatoes and chickpeas, served with our signature chilled mint and tamarind pani for a refreshing burst of flavour.' },
      { name: 'JERK CHICKEN CROSTINI', price: '11', description: 'Four crisp crostini topped with slow-marinated chicken, smoky island spices, and melted cheese, creating the perfect bite-sized appetiser.' },
      { name: 'BANG BANG PRAWNS', price: '11', description: 'Prawns deep-fried in a crispy batter and served with our secret LOCCO sauce.' },
    ],
  },
  {
    id: 'signature-plates',
    label: 'SIGNATURE PLATES',
    icon: 'star-outline',
    items: [
      { name: 'PHILLY-PHULLY LOADED', price: '23', description: 'Philly steak with cheese sauce, crispy onions, portobello mushrooms and creamy garlic sauce, served in a bowl. Choose between cheesy rustic fries or sweet potato fries. Can be made gluten free.' },
      { name: 'THE WAGYU', price: '21', description: 'Double wagyu smashed beef, cheese, fried egg, onions, salad, relish, and Locco drip sauce in a toasted sesame brioche bun. Served with rustic fries and house sauce. Can be made gluten free.' },
      { name: 'THE SIRLOIN', price: '25', description: 'Tender 8oz Sirloin Steak, cooked to your liking, served with crispy sweet potato fries, vibrant chimichurri, and a rich garlic mushroom sauce. A perfectly balanced dish combining bold flavours and indulgent comfort.' },
      { name: 'THE CHICKEN', price: '21.95', description: 'Chicken Steak, grilled to perfection, served with truffle parmesan rustic fries, vibrant chimichurri, and a rich garlic mushroom sauce. Finished with layers of rich, savoury flavour in every bite.' },
      { name: 'THE INFERNO', price: '22', description: 'Southern fried chicken breast with tikka hash brown, grilled halloumi, lettuce, mayo, and sweet chilli in a toasted sesame brioche bun. Served with rustic fries and house sauce.' },
      { name: 'CREAMY ALFREDO', price: '16.49', note: '+£2.50 chicken, +£5.00 prawns or +£8.00 philly steak', description: 'Creamy Alfredo pasta with sweetcorn, peppers, and mushrooms in a rich, silky sauce. A comforting, flavour-packed dish with a smooth, indulgent finish.' },
      { name: 'MASALA COD TACOS', price: '17.99', description: 'Toasted tacos filled with crispy cod, topped with fresh beetroot slaw and a squeeze of lime. Finished with cool mint yoghurt and feta crumble, then served with seasoned rustic fries and our signature house sauce.' },
      { name: 'LAMB KARAHI STREET BOWL', price: '22', description: 'Tender lamb cooked in our signature rich, spiced karahi sauce, served with fragrant biryani rice, rustic seasoned fries, fresh house salad, and cooling house raita.' },
    ],
  },
  {
    id: 'locco-bowls',
    label: 'LOCCO BOWLS',
    icon: 'restaurant-outline',
    items: [
      { name: 'HARVEST CRUNCH Salad', price: '16.99', description: 'Roasted beetroot with peppery rocket, feta, and fresh pomegranate, lifted with a bright lemon dressing, cucumber, gherkins, red and spring onion, croutons and finished with a house crumbed, tandoori, and jerk-infused chicken.' },
      { name: 'FRUITFUL GRANOLA', price: '16.95', description: 'Golden granola layered with caramelised yoghurt, banana, mango, strawberries and blueberries, finished with biscoff crumbs, honey and chia seeds.' },
      { name: 'BLUSH AÇAI BOWL', price: '16.95', description: 'Açai base blended with protein and oat milk, topped with granola, strawberries, raspberries, blackberries, white-chocolate shavings, coconut flakes.' },
    ],
  },
  {
    id: 'sandos',
    label: 'THE SANDOS',
    icon: 'fast-food-outline',
    items: [
      { name: 'THE CHICKEN DELI', price: '17.95', description: 'Tender tandoori chicken with stir-fried onions and peppers, topped with LOCCO house sauce and melted cheese on toasted shokupan, served with masala rustic fries and house sauce.' },
      { name: 'CEASAR CRUNCH', price: '17.95', description: 'Crispy southern fried chicken with lettuce, caesar dressing, parmesan, and golden crouton crumbs in a toasted tortilla wrap. Served with rustic fries and house sauce.' },
      { name: 'THE BOMBAY', price: '17.95', description: 'Toasted shokupan with spiced paneer, grilled halloumi, melted cheese, peppers, onion, tomato, smashed avocado, lettuce, and a crunchy Doritos layer. Served with masala fries and mint yoghurt.' },
    ],
  },
  {
    id: 'sides',
    label: 'SIDES',
    icon: 'pizza-outline',
    items: [
      { name: 'Sweet Potato Fries', price: '5' },
      { name: 'Crispy Potato Bites', price: '5' },
      { name: 'Seasoned Rustic Fries', price: '5' },
      { name: 'Masala Rustic Fries', price: '6' },
      { name: 'Shokupan Toast', price: '2' },
      { name: 'Paratha or Puri', price: '2' },
      { name: 'Smashed Avocado', price: '3' },
      { name: 'Truffle Parmesan Rustic Fries', price: '7.50' },
    ],
  },
  {
    id: 'soft-drinks',
    label: 'SOFT DRINKS',
    icon: 'water-outline',
    items: [
      { name: 'Still Water', price: '4' },
      { name: 'Sparkling Water', price: '4' },
      { name: 'Lemonade', price: '4' },
      { name: 'Zanti Orange', price: '4' },
      { name: 'Zanti Cola - Normal or Zero', price: '4' },
      { name: 'Ginger Ale', price: '4' },
      { name: 'Redbull', price: '4' },
      { name: 'Fruit Shoot', price: '2' },
    ],
  },
  {
    id: 'velvet-bar',
    label: 'THE VELVET BAR',
    icon: 'sparkles-outline',
    note: 'Served iced or warm. Alternative milks: Oat, Almond, Coconut, Soya available upon request. Additional syrups: Salted Caramel, Caramel, Hazelnut, Vanilla, Spiced Pumpkin (+£1).',
    items: [
      { name: 'Tiramisu Silk Latte', price: '10' },
      { name: 'Pistachio & White Chocolate Spanish', price: '10' },
      { name: 'Strawberries & Cream Matcha', price: '10' },
      { name: 'Blueberry Ube Bliss', price: '10' },
      { name: 'Fresh Coconut Matcha', price: '11', note: 'Served only iced' },
      { name: 'Kinder Bueno Warm Coco', price: '10', note: 'Served only warm' },
      { name: 'The Jammy One', price: '10', description: 'Creamy milkshake blended with crushed Jammy Dodgers.' },
    ],
  },
  {
    id: 'refined-brews',
    label: 'REFINED BREWS',
    icon: 'cafe-outline',
    note: 'Alternative milks: Oat, Almond, Coconut, Soya available upon request. Additional syrups: Salted Caramel, Caramel, Hazelnut, Vanilla, Spiced Pumpkin (+£1). Make it iced and add whipped cream or cold foam (+£1).',
    items: [
      // BREW BAR
      { name: 'English Breakfast', price: '4' },
      { name: 'Moroccan Mint Tea', price: '4' },
      { name: 'Karak Chai', price: '5.49' },
      { name: 'Kashmiri Pink Tea', price: '5.49' },
      { name: 'Pomegranate Green Tea', price: '4' },
      { name: 'Spiced Apple Cinnamon', price: '4' },
      // HOUSE COFFEE
      { name: 'Flat White', price: '4' },
      { name: 'Caffe Latte', price: '4' },
      { name: 'Cappuccino', price: '4' },
      { name: 'Mocha (white or milk chocolate)', price: '5' },
      { name: 'Americano (white or black)', price: '4' },
      { name: 'Double Espresso', price: '3.50' },
      { name: 'Macchiato', price: '4' },
    ],
  },
  {
    id: 'hydration-bar',
    label: 'THE HYDRATION BAR',
    icon: 'leaf-outline',
    items: [
      { name: 'TROPICAL BLUSH', price: '11', description: 'Guava, Strawberry and Mango Smoothie.' },
      { name: 'LOCCO PUNCH', price: '11', description: 'Fresh orange, pear and apple with a kick of ginger.' },
      { name: 'FRESH COCONUT', price: '8', description: 'Naturally hydrating coconut water with a light tropical refresh.' },
      { name: 'LOCCO LEAN', price: '8', description: 'A smooth protein shake for the perfect balance of flavour and nutrition. Available in Red Velvet or Cookies & Cream.' },
    ],
  },
  {
    id: 'mocktails',
    label: 'MOCKTAILS',
    icon: 'wine-outline',
    items: [
      { name: 'WATERMELON & RASPBERRY MOJITO', price: '11', description: "A refreshing twist on a classic mojito, combining juicy watermelon and tangy raspberry with fresh mint, lime juice, and a splash of soda. Light, vibrant, and perfectly balanced, it's a crisp summer cooler with a fruity, fragrant finish." },
      { name: 'PINEAPPLE DAIQUIRI', price: '11', description: 'A refreshing frozen daiquiri, expertly blended with crushed ice and fresh lime for the perfect balance of sweet and tangy flavours. Smooth, vibrant, and irresistibly refreshing.' },
      { name: 'STRAWBERRY COLADA', price: '11', description: 'Creamy blend of ripe strawberries and smooth coconut, shaken with pineapple juice and ice for a tropical twist on a classic colada. Sweet, velvety, and refreshing, finished with a strawberry garnish for a vibrant island-style escape in every sip.' },
      { name: 'MANGO LYCHEE COOLER', price: '11', description: 'A refreshing fusion of sweet mango and delicate lychee, shaken with lime and ice for a light, fruity cooler. Bright, floral, and perfectly balanced, finished with a crisp citrus lift for a smooth tropical refreshment.' },
      { name: 'WHITE WHISPER', price: '11', description: 'Crisp pear and bright lychee come together in a sharp, clean cooler. Finished with a whisper of sweetness and a bold, refreshing edge.' },
    ],
  },
  {
    id: 'sweet-plates',
    label: 'SWEET PLATES',
    icon: 'ice-cream-outline',
    items: [
      { name: 'TILDA CAKE', price: '13', description: 'Our signature Tilda cake returns. Soft, indulgent and finished with a rich, silky ganache served with vanilla pod ice cream.' },
      { name: 'THE CARROT AFAIR', price: '12', description: 'Fresh carrot cake, cream cheese icing, white chocolate drizzle, vanilla pod ice cream.' },
      { name: 'RASPBERRY & WHITE CHOCOLATE', price: '12', description: 'Creamy white chocolate cheesecake with raspberry swirl, on a buttery biscuit base, served with vanilla pod ice cream.' },
      { name: 'DUBAI KNAFEH', price: '15', description: 'The pistachio knafeh brownie, inspired by the infamous dubai chocolate, served with vanilla pod ice cream.' },
      { name: "LE DOUCE FOLIE 'SWEET MADNESS'", price: '18', description: 'Golden French toast with Nutella sauce, fresh strawberries, banana, and vanilla ice cream.' },
      { name: 'PANCAKES DÉLICE', price: '15', description: 'Stack of four fluffy pancakes with Kinder Bueno-style hazelnut chocolate, mixed berries and vanilla ice cream. Can be made as protein pancakes.' },
      { name: 'HOMEMADE PRALINE CHOCOLATE BROWNIE', price: '12', diet: ['GF', 'VG'], description: 'A rich handmade chocolate brownie with smooth praline flavour and crunchy hazelnuts. Gluten Free and Vegan.' },
    ],
  },
  {
    id: 'kids',
    label: 'LOCCO KIDS',
    icon: 'happy-outline',
    note: 'Kindly note, this offer is only eligible for Locco kids.',
    items: [
      { name: 'Chicken Nuggets and Rustic Fries', price: '10' },
      { name: 'Beef Burger and Rustic Fries', price: '10' },
      { name: 'Pizza Bread and Rustic Fries (Cheese & Tomato)', price: '10' },
    ],
  },
];

// Convenience lookups
export const categories = menu.map((c) => ({ id: c.id, label: c.label, icon: c.icon }));
