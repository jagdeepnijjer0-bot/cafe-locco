// Cafe Locco menu — extracted verbatim from the genuine Figma design
// Source of truth: figma-reference/src/app/components/MenuPage.tsx

export interface MenuItem {
  name: string;
  description?: string;
  price: string;
}

export const categories = [
    { id: 'breakfast', label: 'BREAKFAST' },
    { id: 'classics', label: 'CLASSICS' },
    { id: 'appetisers', label: 'APPETISERS' },
    { id: 'bowls', label: 'BOWLS' },
    { id: 'favourites', label: 'FAVOURITES' },
    { id: 'burgers', label: 'BURGERS' },
    { id: 'wraps', label: 'WRAPS' },
    { id: 'kids', label: 'LOCCO KIDS' },
    { id: 'sides', label: 'SIDES' },
    { id: 'sweets', label: 'SWEET PLATES' },
    { id: 'drinks', label: 'DRINK EDIT' },
    { id: 'soft-drinks', label: 'SOFT DRINKS' },
    { id: 'mocktails', label: 'MOCKTAILS' },
  ];

export const menuItems: Record<string, MenuItem[]> = {
    breakfast: [
      {
        name: 'LOCCO BREAKFAST',
        description: 'Two free-range eggs any style, two turkey rashers, lamb sausage, baked beans, garlic mushrooms, roasted tomato, hash brown, and choice of toast.',
        price: '13.49'
      },
      {
        name: 'TRADITIONAL DESI BREAKFAST',
        description: 'Two free-range eggs any style, house keema, masala chaats, spiced beans, roasted tomato, and choice of paratha or puri.',
        price: '13.49'
      },
      {
        name: 'VEGGIE BREAKFAST',
        description: 'Two free-range eggs any style, veggie sausages, baked beans, garlic mushrooms, roasted tomato, hash brown, and choice of toast.',
        price: '13.49'
      },
      {
        name: 'VEGAN BREAKFAST',
        description: 'Vegan scrambled eggs, veggie sausages, smashed avocado, baked beans, garlic mushrooms, roasted tomato, hash brown, and choice of toast.',
        price: '13.49'
      },
      {
        name: 'GLUTEN-FREE BREAKFAST',
        description: 'Two free-range eggs any style, two turkey rashers, lamb sausage, baked beans, garlic mushrooms, roasted tomato, and hash brown.',
        price: '13.49'
      },
    ],
    classics: [
      {
        name: 'AVO TOAST',
        description: 'Smashed avocado, two poached eggs, chilli flakes, edamame beans, on choice of toast.',
        price: '12.99'
      },
      {
        name: 'TUNACADO',
        description: 'Tuna mixed with spices, smashed avocado, two poached eggs, on choice of toast.',
        price: '13.49'
      },
      {
        name: 'MUSHROOM AVO',
        description: 'Smashed avocado, sautéed garlic mushrooms, two poached eggs, on choice of toast.',
        price: '13.49'
      },
      {
        name: 'THE ROYALE',
        description: 'Two poached eggs, turkey rashers, hollandaise sauce, on an English muffin.',
        price: '13.99'
      },
      {
        name: 'CHILLI-GARLIC FLORENTINE',
        description: 'Two poached eggs, garlic and chilli spinach, hollandaise sauce, on an English muffin.',
        price: '13.99'
      },
      {
        name: 'SWEET & SOUR CRISPY CHICKEN',
        description: 'Buttermilk marinated crispy chicken strips, topped with our house sweet and sour sauce on choice of toast.',
        price: '13.99'
      },
      {
        name: 'SPICE ME UP SCRAMBLED',
        description: 'Chilli scrambled eggs, topped with spiced masala sauce on choice of toast.',
        price: '12.49'
      },
      {
        name: 'NUTTY SHAKSHUKA',
        description: 'Two eggs poached in a tomato and pepper stew with a hint of peanut butter, served with choice of toast.',
        price: '13.49'
      },
      {
        name: 'HUEVOS RANCHEROS',
        description: 'Two fried eggs, black beans, avocado, salsa, sour cream, on corn tortillas.',
        price: '13.99'
      },
    ],
    appetisers: [
      {
        name: 'BUFFALO WINGS',
        description: 'Marinated chicken wings tossed in buffalo sauce, served with sour cream.',
        price: '9.49'
      },
      {
        name: 'HALLOUMI FRIES',
        description: 'Deep fried halloumi strips served with sweet chilli sauce.',
        price: '8.99'
      },
      {
        name: 'DYNAMITE PRAWNS',
        description: 'Panko breaded prawns tossed in dynamite sauce.',
        price: '9.99'
      },
      {
        name: 'POPPIN POPPERS',
        description: 'Jalapeño peppers stuffed with cream cheese, deep fried and served with sour cream.',
        price: '8.49'
      },
      {
        name: 'CALAMARI',
        description: 'Deep fried squid rings served with sweet chilli sauce and lemon wedge.',
        price: '9.49'
      },
      {
        name: 'LOADED FRIES',
        description: 'Crispy fries loaded with melted cheese, jalapeños, and sour cream.',
        price: '7.99'
      },
    ],
    bowls: [
      {
        name: 'KOREAN BBQ BOWL',
        description: 'Korean BBQ chicken, edamame beans, red cabbage, sweetcorn, crispy onions, sesame seeds, on a bed of rice.',
        price: '14.49'
      },
      {
        name: 'TERIYAKI SALMON BOWL',
        description: 'Teriyaki glazed salmon, edamame beans, red cabbage, sweetcorn, sesame seeds, on a bed of rice.',
        price: '15.99'
      },
      {
        name: 'FALAFEL BOWL',
        description: 'Falafels, hummus, mixed leaves, red cabbage, sweetcorn, red onion, on a bed of quinoa.',
        price: '13.49'
      },
      {
        name: 'PERI PERI CHICKEN BOWL',
        description: 'Peri peri chicken, mixed peppers, red onion, sweetcorn, on a bed of rice.',
        price: '14.49'
      },
    ],
    favourites: [
      {
        name: 'FISH & CHIPS',
        description: 'Beer battered cod served with chips, mushy peas, and tartar sauce.',
        price: '16.99'
      },
      {
        name: 'CHICKEN & WAFFLES',
        description: 'Crispy chicken strips on Belgian waffles, drizzled with maple syrup.',
        price: '15.49'
      },
      {
        name: 'MAC & CHEESE',
        description: 'Creamy macaroni cheese topped with breadcrumbs.',
        price: '12.99'
      },
      {
        name: 'STEAK & FRIES',
        description: 'Grilled ribeye steak served with chips and peppercorn sauce.',
        price: '22.99'
      },
    ],
    burgers: [
      {
        name: 'LOCCO BURGER',
        description: 'Beef patty, cheese, lettuce, tomato, pickles, LOCCO sauce, in a brioche bun.',
        price: '14.99'
      },
      {
        name: 'BUTTERMILK CHICKEN BURGER',
        description: 'Buttermilk fried chicken, lettuce, tomato, mayo, in a brioche bun.',
        price: '14.49'
      },
      {
        name: 'HALLOUMI BURGER',
        description: 'Grilled halloumi, roasted peppers, lettuce, pesto mayo, in a brioche bun.',
        price: '13.99'
      },
      {
        name: 'BEYOND BURGER',
        description: 'Plant-based patty, vegan cheese, lettuce, tomato, vegan mayo, in a vegan bun.',
        price: '14.99'
      },
      {
        name: 'BBQ BACON BURGER',
        description: 'Beef patty, turkey bacon, cheese, onion rings, BBQ sauce, in a brioche bun.',
        price: '15.99'
      },
    ],
    wraps: [
      {
        name: 'CHICKEN CAESAR WRAP',
        description: 'Grilled chicken, lettuce, parmesan, Caesar dressing, in a tortilla wrap.',
        price: '11.99'
      },
      {
        name: 'FALAFEL WRAP',
        description: 'Falafels, hummus, lettuce, tomato, red onion, in a tortilla wrap.',
        price: '10.99'
      },
      {
        name: 'PERI PERI CHICKEN WRAP',
        description: 'Peri peri chicken, lettuce, tomato, mayo, in a tortilla wrap.',
        price: '11.99'
      },
      {
        name: 'HALLOUMI WRAP',
        description: 'Grilled halloumi, roasted peppers, lettuce, pesto mayo, in a tortilla wrap.',
        price: '10.99'
      },
    ],
    kids: [
      {
        name: 'KIDS PANCAKES',
        description: 'Fluffy pancakes with maple syrup and berries.',
        price: '6.99'
      },
      {
        name: 'KIDS CHICKEN NUGGETS',
        description: 'Crispy chicken nuggets with chips.',
        price: '7.99'
      },
      {
        name: 'KIDS FISH FINGERS',
        description: 'Fish fingers with chips.',
        price: '7.99'
      },
      {
        name: 'KIDS MAC & CHEESE',
        description: 'Creamy macaroni cheese.',
        price: '6.99'
      },
      {
        name: 'KIDS BURGER',
        description: 'Mini beef burger with chips.',
        price: '8.49'
      },
    ],
    sides: [
      {
        name: 'CHIPS',
        price: '4.49'
      },
      {
        name: 'SWEET POTATO FRIES',
        price: '4.99'
      },
      {
        name: 'ONION RINGS',
        price: '4.49'
      },
      {
        name: 'GARLIC BREAD',
        price: '3.99'
      },
      {
        name: 'SIDE SALAD',
        price: '3.99'
      },
      {
        name: 'COLESLAW',
        price: '2.99'
      },
    ],
    sweets: [
      {
        name: 'PANCAKE STACK',
        description: 'Fluffy pancakes with maple syrup, berries, and whipped cream.',
        price: '10.99'
      },
      {
        name: 'FRENCH TOAST',
        description: 'Brioche French toast with caramelized bananas and maple syrup.',
        price: '10.99'
      },
      {
        name: 'WAFFLES',
        description: 'Belgian waffles with Nutella, strawberries, and ice cream.',
        price: '11.49'
      },
      {
        name: 'BROWNIE SUNDAE',
        description: 'Warm chocolate brownie with vanilla ice cream and chocolate sauce.',
        price: '8.99'
      },
      {
        name: 'CHEESECAKE',
        description: 'Baked vanilla cheesecake with berry compote.',
        price: '7.99'
      },
    ],
    drinks: [
      {
        name: 'ESPRESSO',
        price: '2.99'
      },
      {
        name: 'AMERICANO',
        price: '3.49'
      },
      {
        name: 'CAPPUCCINO',
        price: '3.99'
      },
      {
        name: 'LATTE',
        price: '3.99'
      },
      {
        name: 'FLAT WHITE',
        price: '3.99'
      },
      {
        name: 'MOCHA',
        price: '4.49'
      },
      {
        name: 'HOT CHOCOLATE',
        price: '3.99'
      },
      {
        name: 'TEA',
        price: '2.99'
      },
      {
        name: 'ICED LATTE',
        price: '4.49'
      },
      {
        name: 'ICED AMERICANO',
        price: '3.99'
      },
    ],
    'soft-drinks': [
      {
        name: 'COCA-COLA',
        price: '3.49'
      },
      {
        name: 'DIET COKE',
        price: '3.49'
      },
      {
        name: 'SPRITE',
        price: '3.49'
      },
      {
        name: 'FANTA',
        price: '3.49'
      },
      {
        name: 'ORANGE JUICE',
        price: '3.99'
      },
      {
        name: 'APPLE JUICE',
        price: '3.99'
      },
      {
        name: 'STILL WATER',
        price: '2.49'
      },
      {
        name: 'SPARKLING WATER',
        price: '2.49'
      },
    ],
    mocktails: [
      {
        name: 'VIRGIN MOJITO',
        price: '10'
      },
      {
        name: 'STRAWBERRY DAIQUIRI',
        price: '10'
      },
      {
        name: 'PINA COLADA',
        price: '10'
      },
      {
        name: 'COCO COLADA',
        price: '10'
      },
      {
        name: 'MANGO LASSI',
        price: '10'
      },
      {
        name: 'MANGO, GINGER AND LYCHEE COOLER',
        price: '10'
      },
      {
        name: 'OCEAN WAVE',
        price: '10'
      },
      {
        name: 'WHITE WHISPER',
        price: '10'
      },
      {
        name: 'KIWI SPRITZ',
        price: '10'
      },
      {
        name: 'LOCCO PUNCH',
        price: '12'
      },
    ],
  };
