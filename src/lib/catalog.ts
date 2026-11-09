import type { Bi, CategoryId, Product } from "./types";

export const CATEGORIES: { id: CategoryId; zh: string; en: string; market: number }[] = [
  { id: "home", zh: "家居与厨房", en: "Home & Kitchen", market: 32845 },
  { id: "sports", zh: "运动户外", en: "Sports & Outdoors", market: 18420 },
  { id: "beauty", zh: "美妆个护", en: "Beauty & Personal Care", market: 22110 },
  { id: "pet", zh: "宠物用品", en: "Pet Supplies", market: 9640 },
  { id: "electronics", zh: "电子产品", en: "Electronics", market: 15330 },
  { id: "office", zh: "办公用品", en: "Office Products", market: 7420 },
  { id: "baby", zh: "母婴", en: "Baby", market: 11180 },
  { id: "tools", zh: "家装工具", en: "Tools & Home Improvement", market: 13950 },
];

const HEROES: Product[] = [
  {
    id: "p-colander",
    name: { zh: "可折叠硅胶沥水篮", en: "Collapsible Silicone Colander" },
    category: "home",
    subcategory: { zh: "厨房工具", en: "Kitchen Tools" },
    price: 18.99,
    rating: 4.6,
    reviews: 4288,
    demand: 88,
    competition: 35,
    monthlySales: 156,
    unitCost: 5.02,
    fbaFee: 3.15,
    inbound: 1.1,
    leadDays: 32,
    badge: "bestseller",
    overallScore: 92,
    featured: true,
  },
  {
    id: "p-grinder",
    name: { zh: "电动香料研磨机", en: "Electric Spice Grinder" },
    category: "home",
    subcategory: { zh: "厨房电器", en: "Kitchen Appliances" },
    price: 34.99,
    rating: 4.4,
    reviews: 2140,
    demand: 82,
    competition: 40,
    monthlySales: 74,
    unitCost: 12.05,
    fbaFee: 4.4,
    inbound: 1.6,
    leadDays: 35,
    badge: "trending",
    overallScore: 87,
    featured: true,
  },
  {
    id: "p-thermo",
    name: { zh: "探针式食品温度计", en: "Digital Meat Thermometer" },
    category: "home",
    subcategory: { zh: "温度计", en: "Thermometers" },
    price: 25.99,
    rating: 4.7,
    reviews: 8620,
    demand: 90,
    competition: 45,
    monthlySales: 96,
    unitCost: 9.5,
    fbaFee: 3.5,
    inbound: 0.9,
    leadDays: 28,
    badge: "highDemand",
    overallScore: 85,
    featured: true,
  },
  {
    id: "p-plant",
    name: { zh: "中古风植物架", en: "Mid Century Plant Stand" },
    category: "home",
    subcategory: { zh: "花架", en: "Plant Stands" },
    price: 49.99,
    rating: 4.5,
    reviews: 980,
    demand: 65,
    competition: 30,
    monthlySales: 34,
    unitCost: 11.8,
    fbaFee: 8.2,
    inbound: 2.4,
    leadDays: 40,
    badge: "niche",
    overallScore: 78,
    featured: true,
  },
  {
    id: "p-soap",
    name: { zh: "琥珀玻璃皂液器", en: "Amber Glass Soap Dispenser" },
    category: "home",
    subcategory: { zh: "浴室配件", en: "Bath Accessories" },
    price: 15.99,
    rating: 4.3,
    reviews: 3412,
    demand: 78,
    competition: 38,
    monthlySales: 105,
    unitCost: 4.15,
    fbaFee: 3.05,
    inbound: 0.85,
    leadDays: 30,
    badge: "bestseller",
    overallScore: 83,
    featured: true,
  },
  {
    id: "p-blanket",
    name: { zh: "针织盖毯", en: "Knitted Throw Blanket" },
    category: "home",
    subcategory: { zh: "床品", en: "Bedding" },
    price: 32.99,
    rating: 4.6,
    reviews: 1566,
    demand: 72,
    competition: 33,
    monthlySales: 50,
    unitCost: 9.74,
    fbaFee: 6.1,
    inbound: 1.8,
    leadDays: 36,
    badge: "niche",
    overallScore: 81,
    featured: true,
  },
  {
    id: "p-jar",
    name: { zh: "保温焖烧罐", en: "Insulated Food Jar" },
    category: "home",
    subcategory: { zh: "收纳储藏", en: "Storage" },
    price: 21.99,
    rating: 4.2,
    reviews: 2788,
    demand: 75,
    competition: 42,
    monthlySales: 77,
    unitCost: 7.64,
    fbaFee: 3.8,
    inbound: 1.15,
    leadDays: 33,
    badge: "highDemand",
    overallScore: 79,
    featured: true,
  },
  {
    id: "p-cable",
    name: { zh: "理线收纳盒", en: "Cable Management Box" },
    category: "home",
    subcategory: { zh: "桌面整理", en: "Organization" },
    price: 18.49,
    rating: 4.4,
    reviews: 4104,
    demand: 60,
    competition: 28,
    monthlySales: 57,
    unitCost: 3.83,
    fbaFee: 3.2,
    inbound: 0.7,
    leadDays: 26,
    badge: "niche",
    overallScore: 74,
    featured: true,
  },
];

type Pool = { zh: string; en: string; subZh: string; subEn: string };

const POOLS: Record<CategoryId, Pool[]> = {
  home: [
    { zh: "竹盖玻璃密封罐", en: "Glass Pantry Canister", subZh: "储物", subEn: "Pantry" },
    { zh: "硅胶锅铲五件套", en: "Silicone Utensil Set", subZh: "厨房工具", subEn: "Kitchen Tools" },
    { zh: "壁挂式锅盖架", en: "Wall Mount Lid Rack", subZh: "收纳", subEn: "Organization" },
    { zh: "可叠放冰箱收纳盒", en: "Stackable Fridge Bins", subZh: "收纳", subEn: "Storage" },
    { zh: "陶瓷油醋瓶", en: "Ceramic Oil Cruet", subZh: "餐桌", subEn: "Tabletop" },
    { zh: "微纤维厨房巾", en: "Microfiber Kitchen Towels", subZh: "清洁", subEn: "Cleaning" },
    { zh: "折叠砧板", en: "Folding Cutting Board", subZh: "厨房工具", subEn: "Kitchen Tools" },
    { zh: "香薰石膏托盘", en: "Stoneware Incense Tray", subZh: "家居装饰", subEn: "Decor" },
  ],
  sports: [
    { zh: "阻力带训练组", en: "Resistance Band Set", subZh: "力量训练", subEn: "Strength" },
    { zh: "瑜伽砖两只装", en: "Yoga Block Pair", subZh: "瑜伽", subEn: "Yoga" },
    { zh: "跳绳计数手柄", en: "Counting Jump Rope", subZh: "有氧", subEn: "Cardio" },
    { zh: "运动水壶摇摇杯", en: "Shaker Bottle", subZh: "补水", subEn: "Hydration" },
    { zh: "筋膜球", en: "Massage Ball", subZh: "恢复", subEn: "Recovery" },
    { zh: "折叠瑜伽垫", en: "Foldable Yoga Mat", subZh: "瑜伽", subEn: "Yoga" },
    { zh: "引体向上助力带", en: "Pull Up Assist Band", subZh: "力量训练", subEn: "Strength" },
    { zh: "夜跑反光臂带", en: "Reflective Armband", subZh: "跑步", subEn: "Running" },
  ],
  beauty: [
    { zh: "玉石滚轮", en: "Jade Facial Roller", subZh: "护肤工具", subEn: "Skincare Tools" },
    { zh: "硅胶洁面刷", en: "Silicone Face Brush", subZh: "洁面", subEn: "Cleansing" },
    { zh: "化妆刷收纳筒", en: "Brush Holder", subZh: "收纳", subEn: "Organization" },
    { zh: "蒸汽眼罩", en: "Heated Eye Mask", subZh: "个护", subEn: "Personal Care" },
    { zh: "分装瓶套装", en: "Travel Bottle Set", subZh: "旅行", subEn: "Travel" },
    { zh: "头皮按摩梳", en: "Scalp Massager", subZh: "头发护理", subEn: "Hair" },
    { zh: "指甲护理套装", en: "Manicure Kit", subZh: "美甲", subEn: "Nails" },
    { zh: "丝绒发带", en: "Velvet Spa Headband", subZh: "护肤工具", subEn: "Skincare Tools" },
  ],
  pet: [
    { zh: "慢食碗", en: "Slow Feeder Bowl", subZh: "喂食", subEn: "Feeding" },
    { zh: "猫咪隧道", en: "Cat Tunnel", subZh: "玩具", subEn: "Toys" },
    { zh: "拾便袋分配器", en: "Waste Bag Dispenser", subZh: "外出", subEn: "Outdoor" },
    { zh: "宠物毛梳", en: "Deshedding Brush", subZh: "美容", subEn: "Grooming" },
    { zh: "升高宠物碗架", en: "Elevated Pet Feeder", subZh: "喂食", subEn: "Feeding" },
    { zh: "猫抓垫", en: "Sisal Scratch Mat", subZh: "猫用品", subEn: "Cats" },
    { zh: "便携折叠水碗", en: "Collapsible Travel Bowl", subZh: "外出", subEn: "Travel" },
    { zh: "宠物烘干手套", en: "Pet Drying Mitt", subZh: "清洁", subEn: "Grooming" },
  ],
  electronics: [
    { zh: "编织充电线三件套", en: "Braided Cable 3-Pack", subZh: "配件", subEn: "Accessories" },
    { zh: "桌面手机支架", en: "Adjustable Phone Stand", subZh: "支架", subEn: "Stands" },
    { zh: "理线魔术贴", en: "Cable Tie Set", subZh: "理线", subEn: "Cable Management" },
    { zh: "USB 集线器", en: "4-Port USB Hub", subZh: "扩展", subEn: "Hubs" },
    { zh: "屏幕清洁套装", en: "Screen Cleaning Kit", subZh: "清洁", subEn: "Cleaning" },
    { zh: "笔记本立式支架", en: "Laptop Stand", subZh: "支架", subEn: "Stands" },
    { zh: "机械键盘掌托", en: "Keyboard Wrist Rest", subZh: "桌面", subEn: "Desk" },
    { zh: "摄像头遮挡贴", en: "Webcam Cover 6-Pack", subZh: "配件", subEn: "Accessories" },
  ],
  office: [
    { zh: "亚克力文件架", en: "Acrylic File Organizer", subZh: "桌面", subEn: "Desk" },
    { zh: "可擦写周计划板", en: "Weekly Planner Board", subZh: "计划", subEn: "Planning" },
    { zh: "书立一对", en: "Metal Bookends", subZh: "收纳", subEn: "Organization" },
    { zh: "便签盒", en: "Sticky Note Holder", subZh: "文具", subEn: "Stationery" },
    { zh: "显示器增高架", en: "Monitor Riser", subZh: "桌面", subEn: "Desk" },
    { zh: "印章收纳盒", en: "Stamp Organizer", subZh: "收纳", subEn: "Organization" },
    { zh: "桌面垃圾桶", en: "Desktop Waste Bin", subZh: "桌面", subEn: "Desk" },
    { zh: "索引标签贴", en: "Index Tabs", subZh: "文具", subEn: "Stationery" },
  ],
  baby: [
    { zh: "硅胶围兜", en: "Silicone Baby Bib", subZh: "喂养", subEn: "Feeding" },
    { zh: "奶瓶晾干架", en: "Bottle Drying Rack", subZh: "喂养", subEn: "Feeding" },
    { zh: "安抚咬胶", en: "Teething Toy", subZh: "玩具", subEn: "Toys" },
    { zh: "尿布收纳袋", en: "Diaper Caddy", subZh: "收纳", subEn: "Organization" },
    { zh: "婴儿指甲锉", en: "Baby Nail File", subZh: "护理", subEn: "Care" },
    { zh: "推车挂钩", en: "Stroller Hooks", subZh: "出行", subEn: "Travel" },
    { zh: "沐浴水温计", en: "Bath Thermometer", subZh: "洗浴", subEn: "Bath" },
    { zh: "防撞角八只装", en: "Corner Guards 8-Pack", subZh: "安全", subEn: "Safety" },
  ],
  tools: [
    { zh: "精密螺丝刀套装", en: "Precision Screwdriver Set", subZh: "手动工具", subEn: "Hand Tools" },
    { zh: "可调扳手", en: "Adjustable Wrench", subZh: "手动工具", subEn: "Hand Tools" },
    { zh: "电工胶带十卷", en: "Electrical Tape 10-Pack", subZh: "电工", subEn: "Electrical" },
    { zh: "水平尺", en: "Torpedo Level", subZh: "测量", subEn: "Measuring" },
    { zh: "磁吸零件盘", en: "Magnetic Parts Tray", subZh: "收纳", subEn: "Organization" },
    { zh: "门挡两只装", en: "Door Stoppers", subZh: "五金", subEn: "Hardware" },
    { zh: "墙面修补膏", en: "Wall Repair Putty", subZh: "修补", subEn: "Repair" },
    { zh: "折叠梯子踏步凳", en: "Folding Step Stool", subZh: "梯子", subEn: "Ladders" },
  ],
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatedProducts(): Product[] {
  const rng = mulberry32(0x61a7c0de);
  const items: Product[] = [];
  (Object.keys(POOLS) as CategoryId[]).forEach((category) => {
    POOLS[category].forEach((pool, index) => {
      const price = Math.round((8 + rng() * 86) * 100) / 100;
      const unitCost = Math.round(price * (0.16 + rng() * 0.28) * 100) / 100;
      const fbaFee = Math.round((2.2 + rng() * 6.5) * 100) / 100;
      const ratingRoll = rng();
      const rating = ratingRoll < 0.08 ? 0 : ratingRoll < 0.16 ? 2.4 : ratingRoll < 0.28 ? 3.4 : Math.round((4 + rng() * 0.9) * 10) / 10;
      const demand = Math.round(28 + rng() * 70);
      const competition = Math.round(12 + rng() * 80);
      const name: Bi = { zh: pool.zh, en: pool.en };
      items.push({
        id: `g-${category}-${index}`,
        name,
        category,
        subcategory: { zh: pool.subZh, en: pool.subEn },
        price,
        rating,
        reviews: rating === 0 ? 0 : Math.round(40 + rng() * 9000),
        demand,
        competition,
        monthlySales: Math.round(12 + rng() * 180),
        unitCost,
        fbaFee,
        inbound: Math.round((0.4 + rng() * 2.2) * 100) / 100,
        leadDays: 24 + Math.floor(rng() * 20),
        lowStock: category === "office" && index < 3,
      });
    });
  });
  return items;
}

export const PRODUCTS: Product[] = [...HEROES, ...generatedProducts()];

export function productById(id: string) {
  return PRODUCTS.find((product) => product.id === id);
}
