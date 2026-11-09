import type { Article, CaseStudy, Classmate, Faq, Post } from "../types";

export const ARTICLES: Article[] = [
  {
    id: "gross-vs-true",
    title: { zh: "为什么选品卡片上的利润率不能直接拿来下单", en: "Why the margin on a selection card is not an order" },
    summary: { zh: "毛利率用来比较，真实利润用来决定是否放大。", en: "Gross margin compares products. True profit decides whether you scale." },
    minutes: 6,
    termIds: ["gross", "true-profit", "referral", "opportunity"],
    body: [
      { zh: "选品列表把需求、竞争和毛利率放在一起，是为了让你快速排除明显不合适的商品。毛利率只扣了采购、平台佣金和 FBA 配送，广告、退货、头程分摊、资金占用都还没进账。", en: "The selection list puts demand, competition, and gross margin side by side so you can drop obvious misses. Gross margin only removes procurement, the referral fee, and FBA fulfillment. Ads, returns, inbound freight, and capital are still outside it." },
      { zh: "课程 2.2 的公式把销售额定义成已经扣除佣金的到手收入，再依次减去采购、运营、物流、退货、资金成本和机会成本。打开任意商品详情，瀑布图就是这张公式。", en: "Lesson 2.2 defines revenue as cash after the referral fee, then subtracts procurement, operating cost, logistics, returns, capital, and opportunity cost. The waterfall on any product is that formula." },
      { zh: "如果真实利润为负，月销量越高，模拟店铺亏得越快。这种商品可以留在清单里做对照，不应该进入采购。", en: "If true profit is negative, higher monthly sales make the simulated store lose money faster. Keep the product on the shortlist as a contrast, and do not purchase it." },
    ],
  },
  {
    id: "supplier-risk",
    title: { zh: "供应商风险不是一句“便宜”能概括的", en: "Supplier risk is not the word cheap" },
    summary: { zh: "质量、交期、合规、资金和物流五维合成一个风险分。", en: "Quality, delivery, compliance, capital, and logistics fold into one score." },
    minutes: 5,
    termIds: ["moq", "ip-risk", "inbound"],
    body: [
      { zh: "每个选品会遇到三类供应商：稳健、迅达、低价。低价工贸把单价打下来，合规分却高到足以在上架环节被抑制。", en: "Every shortlisted product meets three suppliers: steady, rapid, and bargain. The bargain trader cuts the unit cost and carries a compliance score high enough to suppress the listing." },
      { zh: "风险分是加权结果。管理员可以调整权重，例如在考试周把合规权重调高，观察同一家供应商如何从“可接受”变成“必须确认”。", en: "The score is weighted. An admin can raise the compliance weight and watch the same supplier move from acceptable to needs-confirmation." },
      { zh: "下单前看起订量和交期。起订量覆盖超过两个月的销量时，就算单价漂亮，资金成本也会在真实利润里出现。", en: "Read MOQ and lead time before the purchase order. If the MOQ covers more than two months of sales, capital cost shows up in true profit even when the unit price looks good." },
    ],
  },
  {
    id: "acos-tacos",
    title: { zh: "ACoS 好看，不代表广告健康", en: "A healthy ACoS does not mean healthy ads" },
    summary: { zh: "ACoS 看广告订单，TACoS 看整店。", en: "ACoS watches ad orders. TACoS watches the whole store." },
    minutes: 5,
    termIds: ["acos", "tacos", "roas", "cpc"],
    body: [
      { zh: "广告活动表上的 ACoS 只用该活动归因的销售做分母。品牌活动 ACoS 16% 可能很漂亮，但如果自然单没长出来，总销售额里广告花费的占比会在看板上以 TACoS 的方式变重。", en: "ACoS on a campaign uses only that campaign's attributed sales. A brand campaign at 16% can look tidy while organic orders never grow, and the dashboard shows the weight of ad spend against total sales." },
      { zh: "推进模拟日之后，开启的活动会增加曝光、点击、花费和归因销售，同时让对应链接的销量抬升。暂停活动会立刻停止新增花费。", en: "After you advance a simulated day, enabled campaigns add impressions, clicks, spend, and attributed sales, and they lift units on the targeted listings. Pausing stops new spend immediately." },
      { zh: "新建活动时先给一个你算得起的日预算。预算不是目标，可承受 CPC 和转化率才是。", en: "Set a daily budget you can afford. The budget is not the goal. The CPC you can pay, and the conversion rate, are." },
    ],
  },
  {
    id: "listing-suppress",
    title: { zh: "批量上架之后为什么链接会消失", en: "Why a listing disappears after a batch publish" },
    summary: { zh: "库存、价格和供应商合规都会让链接停留在草稿或变成抑制。", en: "Stock, price, and supplier compliance keep a listing in draft or move it to suppressed." },
    minutes: 4,
    termIds: ["listing", "ip-risk", "sku", "buybox"],
    body: [
      { zh: "批量上架用目标毛利率反推标价，并套用标题模板。没有入库库存时只能存草稿，避免空链接吃广告。", en: "Batch listing backs into a price from a target gross margin and applies a title template. Without received stock you can only save a draft, so an empty listing does not eat ads." },
      { zh: "如果这批货来自合规风险很高的供应商，发布后状态会是抑制，原因写在行上。处理办法是换供应商重新采购，而不是把广告预算加大。", en: "If the batch came from a high compliance-risk supplier, publishing sets the status to suppressed and writes the reason on the row. Switch suppliers and repurchase. Do not raise the ad budget." },
    ],
  },
  {
    id: "dashboard-read",
    title: { zh: "看板四张卡分别在回答什么", en: "What the four dashboard cards are asking" },
    summary: { zh: "销售额、订单、客单价、转化率必须能对上同一段流水。", en: "Revenue, orders, AOV, and conversion have to agree with the same ledger." },
    minutes: 5,
    termIds: ["aov", "cvr", "turnover"],
    body: [
      { zh: "本系统的看板不使用写死的示范数字。销售额是时间范围内销售流水的合计，订单数是销售笔数，客单价是两者相除，转化率是订单除以模拟访客。", en: "The dashboard does not use pasted demo numbers. Revenue is the sum of sales in the range, orders are the count of those sales, AOV divides the two, and conversion divides orders by simulated visitors." },
      { zh: "成本环拆成采购、广告、支付、物流和其他运营。广告成本来自活动花费，不是再从每笔订单里重复扣一次。口径不同的广告归因销售额会在活动表里单独出现。", en: "The cost ring splits procurement, ads, payment, logistics, and other operations. Ad cost comes from campaign spend and is not deducted again on every order. Attributed ad sales stay on the campaign table because the definition is different." },
      { zh: "切换日期范围或推进模拟日，四张卡、折线和流水一起变。下载的 CSV 就是你屏幕上的那段流水。", en: "Change the date range or advance the clock and the cards, the line, and the ledger move together. The CSV is the ledger you are looking at." },
    ],
  },
  {
    id: "marketplace",
    title: { zh: "换站点不是把美元换成另一种符号", en: "Changing marketplace is not a currency symbol" },
    summary: { zh: "需求系数会改月利润，汇率只负责展示。", en: "A demand factor changes monthly profit. The exchange rate only changes the display." },
    minutes: 4,
    termIds: ["vat", "fba"],
    body: [
      { zh: "美国、英国、德国、日本用不同的需求系数。同一个商品在美国的需求分，换到英国会下降，月利润按需求而不是按汇率缩小。", en: "The US, UK, Germany, and Japan use different demand factors. A product's US demand score falls in the UK, and monthly profit shrinks with demand, not with the exchange rate." },
      { zh: "流水始终以美元记账，页面按站点汇率显示。这样切换站点不会改写历史订单，只改变你正在比较的价格语言。德国站还要记得增值税没有进这套简化费率，知识库把这件事单独标出来。", en: "The ledger stays in US dollars and the screen converts it. Switching marketplace does not rewrite history. It changes the price language you are comparing. Germany's VAT is not inside this simplified rate, and the knowledge base calls that out." },
    ],
  },
];

export const CASES: CaseStudy[] = [
  {
    id: "colander-win",
    title: { zh: "沥水篮：毛利 42% 之后还剩多少", en: "The colander: what is left after a 42% gross margin" },
    tag: { zh: "选品", en: "Selection" },
    result: "win",
    summary: { zh: "家居爆款看起来利润很厚，扣完广告和退货后仍然为正，才进入采购。", en: "A home bestseller looks thick on gross margin. It is purchased only after ads and returns still leave a profit." },
    context: { zh: "可折叠硅胶沥水篮在选品卡上是 92 分，毛利率约 42%，预估月毛利约 $1,245。团队几乎要按卡片直接下 2,000 件。", en: "The collapsible colander scores 92 with about 42% gross margin and roughly $1,245 of estimated monthly gross profit. The team nearly ordered 2,000 units from the card." },
    steps: [
      { zh: "打开详情，用默认参数走真实利润瀑布。单件真实利润仍为正，但远低于毛利。", en: "Open the detail and run the true-profit waterfall with default parameters. Unit true profit stays positive, and it is far below gross profit." },
      { zh: "对比三家供应商。迅达交期 2 天，适合试销；低价工贸单价更低，但合规风险会在上架时抑制链接。", en: "Compare three suppliers. Rapid ships in 2 days and fits a test. The bargain trader is cheaper and will suppress the listing on publish." },
      { zh: "按试销数量下单，入库后再批量上架，并用小预算商品推广验证点击和转化。", en: "Order a test quantity, batch-list after it is received, and verify clicks and conversion with a small Sponsored Products budget." },
    ],
    lesson: { zh: "高分商品的正确动作是验算，不是直接放大。", en: "The right move on a high score is to check the math, not to scale." },
    simHref: "/sim/selection",
  },
  {
    id: "acos-loss",
    title: { zh: "竞品定投把 ACoS 做到 30% 以后", en: "After competitor targeting reaches a 30% ACoS" },
    tag: { zh: "广告", en: "Ads" },
    result: "loss",
    summary: { zh: "活动没关，预算还在烧，总销售额却没有跟着涨。", en: "The campaign stayed on, the budget kept burning, and total sales did not follow." },
    context: { zh: "ACME 竞品定投活动处于暂停前的样本里，ACoS 超过 30%，ROAS 只有 3 倍出头。运营只看了点击还在涨。", en: "In the seeded account, ACME competitor targeting sits above a 30% ACoS with ROAS just over 3x. The operator only watched clicks grow." },
    steps: [
      { zh: "先看活动表的花费和归因销售，再看看板里广告成本占总成本的比例。", en: "Read spend and attributed sales on the campaign table, then the share of ad cost in the dashboard ring." },
      { zh: "暂停高 ACoS 活动，推进一天，确认花费不再增加。", en: "Pause the high-ACoS campaign, advance one day, and confirm spend stops growing." },
      { zh: "把预算挪到已经有成交的畅销商品推广，而不是新建一个更宽的词。", en: "Move the budget to Sponsored Products on a product that already sells, instead of opening a broader keyword set." },
    ],
    lesson: { zh: "点击是成本的入口，不是成果。", en: "A click is where cost enters. It is not the result." },
    simHref: "/sim/ads",
  },
  {
    id: "bargain-suppress",
    title: { zh: "低价采购单进了库存，链接却上不去", en: "The cheap purchase arrived and the listing could not go live" },
    tag: { zh: "合规", en: "Compliance" },
    result: "mixed",
    summary: { zh: "单价优势在上架环节被知识产权风险抵消。", en: "The unit-price advantage is cancelled when intellectual property risk suppresses the listing." },
    context: { zh: "为了把毛利率再抬高 8 个点，采购选择了不接受验货、合规风险 80 分以上的工贸商，并按最小起订量打了全款定金的大部分。", en: "To lift gross margin another 8 points, procurement picked a trader that refuses inspection and scores above 80 on compliance risk, then placed most of the deposit at MOQ." },
    steps: [
      { zh: "风险确认框被勾上，订单仍然可以创建。系统不会替你拒绝，但会留下高风险标记。", en: "The risk acknowledgement can be checked and the order still goes through. The simulator does not refuse it. It keeps the high-risk flag." },
      { zh: "到货后批量发布，链接状态变为抑制，原因指向供应商合规。", en: "After receipt, batch publish sets the listing to suppressed and points the reason at supplier compliance." },
      { zh: "库存变成滞销。资金成本和仓储开始在后续模拟日里体现为告警。", en: "The stock becomes hard to sell. Capital cost and storage show up as alerts on later simulated days." },
    ],
    lesson: { zh: "不能上架的货，成本再低也没有销售收入。", en: "Inventory you cannot list has no sales, however low the cost." },
    simHref: "/sim/procurement",
  },
];

export const FAQS: Faq[] = [
  {
    id: "what",
    q: { zh: "这套系统和真实店铺是什么关系？", en: "How does this relate to a real store?" },
    a: { zh: "它是教学模拟。商品、订单、广告和供应商都是按规则生成的，不会连接亚马逊账号，也不会产生真实扣款。规则和课程里的真实利润公式一致，用来练习判断。", en: "It is a teaching simulator. Products, orders, ads, and suppliers are generated by rules. It does not connect to an Amazon account and it does not charge anyone. The rules match the true-profit formula in the course so you can practice the judgment." },
  },
  {
    id: "chain",
    q: { zh: "全链路要按什么顺序走？", en: "What order does the chain follow?" },
    a: { zh: "选品加入清单，比较供应商并下采购单，推进模拟日直到入库，再批量上架，然后为在售链接创建广告，最后在看板核对销售额、成本和流水。期初已经有一家演示店，方便你先看广告和看板。", en: "Shortlist a product, compare suppliers, place a purchase, advance days until it is received, batch-list it, create ads for the live listing, then check sales, cost, and the ledger. A demo store is already open so ads and the dashboard are readable on day one." },
  },
  {
    id: "day",
    q: { zh: "推进一天会发生什么？", en: "What happens when a day advances?" },
    a: { zh: "到达交期的采购单入库；在售且有库存的链接按需求和广告预算产生订单；开启的广告累计曝光、点击、花费和归因销售；低库存和被抑制的链接写入告警。暂停的广告不再烧钱。", en: "Purchase orders that have reached their lead time are received. Live listings with stock create orders from demand and ad budget. Enabled ads accumulate impressions, clicks, spend, and attributed sales. Low stock and suppressed listings raise alerts. Paused ads stop spending." },
  },
  {
    id: "money",
    q: { zh: "为什么换了站点，历史订单的数字变了？", en: "Why do historical orders change when I switch marketplace?" },
    a: { zh: "订单始终以美元保存。页面按当前站点汇率换算显示，所以符号和金额会变，订单本身没有被改写。需求分和预估月利润会按站点系数变化。", en: "Orders are stored in US dollars. The screen converts them at the current marketplace rate, so the symbol and amount change without rewriting the order. Demand score and estimated monthly profit use the marketplace factor." },
  },
  {
    id: "admin",
    q: { zh: "管理员和学员有什么区别？", en: "How is an admin different from a learner?" },
    a: { zh: "这是模拟里的角色，不是真实登录。管理员可以改佣金、退货率、广告占比和风险权重，上下架课程，维护术语。学员看到的选品利润会跟着参数变。角色在左下角账号菜单里切换。", en: "The role is part of the simulation, not a real login. Admins change the referral fee, return rate, ad ratio, and risk weights, publish courses, and edit glossary terms. Learners then see selection profit move with those parameters. Switch roles from the account menu at the lower left." },
  },
  {
    id: "data",
    q: { zh: "我的进度存在哪里？", en: "Where is my progress stored?" },
    a: { zh: "存在这台浏览器的本地存储里。清除站点数据会回到演示店的期初。没有账号服务器，也不会把练习记录上传。", en: "In this browser's local storage. Clearing site data returns you to the opening demo store. There is no account server and practice records are not uploaded." },
  },
  {
    id: "formula",
    q: { zh: "卡片利润和详情利润为什么对不上？", en: "Why do the card and the detail disagree?" },
    a: { zh: "卡片是毛利，详情是真实利润。课程 2.2 专门解释这两者。毛利用于排序，真实利润用于决定是否采购。", en: "The card is gross profit. The detail is true profit. Lesson 2.2 is about that gap. Gross profit sorts the list. True profit decides the purchase." },
  },
  {
    id: "lang",
    q: { zh: "语言和主题存在哪里？", en: "Where are language and theme kept?" },
    a: { zh: "语言跟学习进度一起存在本地。主题跟浏览器的主题设置走，可以选浅色、深色或跟随系统。", en: "Language is stored locally with your learning progress. Theme follows the browser theme setting: light, dark, or system." },
  },
];

export const CLASSMATES: Classmate[] = [
  { handle: "北欧仓小周", xp: 2480, lessons: 102, lastActive: "2026-11-08" },
  { handle: "选品笔记", xp: 1860, lessons: 77, lastActive: "2026-11-07" },
  { handle: "ACOS观察员", xp: 1640, lessons: 64, lastActive: "2026-11-06" },
  { handle: "头程计算器", xp: 1420, lessons: 58, lastActive: "2026-11-05" },
  { handle: "合规先看", xp: 1210, lessons: 49, lastActive: "2026-11-04" },
  { handle: "日本站学徒", xp: 980, lessons: 36, lastActive: "2026-11-03" },
];

export const SEED_POSTS: Post[] = [
  {
    id: "post-1",
    author: "选品笔记",
    title: "沥水篮的毛利率和真实利润差了多少？",
    body: "卡片上大概 42%。我按默认参数打开瀑布，广告和退货吃掉一大块。有人用更低的广告占比试过吗？",
    tag: "选品",
    createdAt: "2026-11-06T09:30:00+08:00",
    replies: [
      {
        id: "post-1-r1",
        author: "头程计算器",
        body: "把广告占比降到 8% 之前，先看你的链接有没有自然单。否则只是把 TACoS 藏起来。",
        createdAt: "2026-11-06T11:10:00+08:00",
      },
    ],
  },
  {
    id: "post-2",
    author: "合规先看",
    title: "低价工贸的货到了，上架直接被抑制",
    body: "我为了单价勾了高风险确认。发布之后状态是抑制，库存还在。下一步是不是只能换供应商？",
    tag: "合规",
    createdAt: "2026-11-07T14:20:00+08:00",
    replies: [
      {
        id: "post-2-r1",
        author: "北欧仓小周",
        body: "对。抑制链接上加广告没有意义。案例库里有一条一模一样的路径。",
        createdAt: "2026-11-07T15:02:00+08:00",
      },
    ],
  },
  {
    id: "post-3",
    author: "ACOS观察员",
    title: "竞品定投要不要直接暂停？",
    body: "样本活动 ACoS 超过 30%。我暂停之后推进了一天，花费没有再涨。想确认这是预期行为。",
    tag: "广告",
    createdAt: "2026-11-08T08:05:00+08:00",
    replies: [],
  },
  {
    id: "post-4",
    author: "日本站学徒",
    title: "切到日本站以后月利润为什么变小？",
    body: "不只是日元符号的问题。需求分也掉了。是站点系数吗？",
    tag: "站点",
    createdAt: "2026-11-08T16:40:00+08:00",
    replies: [
      {
        id: "post-4-r1",
        author: "选品笔记",
        body: "是。汇率只影响展示，需求系数影响月销假设。知识库有一篇专门写这个。",
        createdAt: "2026-11-08T17:05:00+08:00",
      },
    ],
  },
];
