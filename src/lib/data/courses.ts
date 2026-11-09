import type { Bi, Course, Lesson } from "../types";

const bi = (zh: string, en: string): Bi => ({ zh, en });

function lesson(
  id: string,
  zh: string,
  en: string,
  points: [Bi, Bi, Bi],
  sim: string,
  label?: Bi,
): Lesson {
  return {
    id,
    title: bi(zh, en),
    minutes: 6 + (id.charCodeAt(id.length - 1) % 6),
    summary: bi(
      `${points[0].zh} 本节留下可以带回模拟器的检查项。`,
      `${points[0].en} This lesson leaves checks you can take back to the simulator.`,
    ),
    points,
    simHref: sim,
    simLabel: label ?? bi("跳转到对应模拟", "Open the matching simulator"),
  };
}

const P = bi;

const formulaLesson: Lesson = {
  id: "src-22",
  title: bi("2.2 真实利润核算公式", "2.2 The true-profit formula"),
  minutes: 12,
  summary: bi(
    "理解真实利润的构成，掌握从毛利到净利的完整核算逻辑，避免利润虚高的常见误区。",
    "See what true profit is made of, and walk from gross profit to the full net so you do not scale an inflated margin.",
  ),
  points: [
    bi("毛利 ≠ 真实利润，扣除所有成本后才接近真实结果。", "Gross profit is not true profit. Only the result after every cost is close to the real outcome."),
    bi("隐性成本和机会成本是利润被高估的主要原因。", "Hidden cost and opportunity cost are the main reasons profit gets overstated."),
    bi("真实利润为负的商品，长期无放大价值。", "A product with negative true profit is not worth scaling."),
  ],
  formula: {
    title: bi("真实利润核算公式", "True-profit formula"),
    expression: "真实利润 = 销售额 − 所有成本 − 隐性成本 − 资金成本 − 机会成本",
    expanded: "真实利润 = 销售额 − 采购成本 − 运营费用 − 物流与 fulfillment 费用 − 退货/纠纷成本 − 资金成本 − 机会成本",
    note: bi(
      "该公式适用于电商全渠道（站内 / 站外 / 批发 / 定制等）利润评估。本模拟里的销售额是已经扣除平台佣金的到手收入。",
      "Use it for marketplace, off-site, wholesale, and custom orders. In this simulator, revenue is cash after the referral fee.",
    ),
    highlights: [
      bi("毛利 ≠ 真实利润，扣除所有成本后才接近真实结果。", "Gross profit is not true profit. Subtract every cost before you trust the number."),
      bi("隐性成本和机会成本是利润被低估风险的主要来源，也是毛利被高估的原因。", "Hidden cost and opportunity cost are why gross margin overstates the result."),
      bi("不同平台、不同品类、不同运营阶段，成本结构差异很大。", "Platform, category, and stage of the listing all change the cost structure."),
      bi("真实利润为负的商品，长期无放大价值。", "Do not scale a product whose true profit is negative."),
    ],
    parts: [
      { title: bi("销售额", "Revenue"), detail: bi("实际到手收入（已扣平台佣金）", "Cash collected after the referral fee") },
      { title: bi("采购成本", "Procurement"), detail: bi("商品进价 + 关税 + 运杂费", "Unit price + duty + freight extras") },
      { title: bi("运营费用", "Operating"), detail: bi("广告费 + 推广费 + 人工 + 工具", "Ads + promotions + labor + tools") },
      { title: bi("物流与 fulfillment", "Logistics"), detail: bi("头程运费 + 仓储费 + 发货费 + 尾程费", "Inbound freight + storage + pick/pack + last mile") },
      { title: bi("退货/纠纷成本", "Returns"), detail: bi("退货率 × 退货成本 + 纠纷赔付", "Return rate × return cost + claim payouts") },
      { title: bi("资金成本 + 机会成本", "Capital + opportunity"), detail: bi("资金占用成本 + 库存贬值 + 错失收益", "Cost of cash tied up + aging stock + the return you skipped") },
    ],
  },
  simHref: "/sim/selection?focus=profit",
  simLabel: bi("跳转到选品模拟", "Go to product selection"),
};

export const COURSES: Course[] = [
  {
    id: "market",
    title: bi("市场选择与调研", "Market selection and research"),
    summary: bi("学习如何评估目标市场，分析需求与竞争。", "Judge a target market and separate demand from competition."),
    level: "foundation",
    icon: "market",
    chapters: [
      {
        id: "market-a",
        title: bi("看懂一个站点", "Read a marketplace"),
        lessons: [
          lesson("mkt-01", "先选站点，再选商品", "Pick the marketplace before the product", [
            P("同一个商品在美国、德国、日本的搜索意图可以完全不同。", "The same item can have different search intent in the US, Germany, and Japan."),
            P("汇率、税率和履约时效会改写利润，翻译不能代替这个判断。", "Currency, tax, and delivery speed rewrite profit. Translation does not."),
            P("在选品页切换站点，只观察需求分和月利润，先别改筛选。", "Switch marketplace on the selection page and watch demand and monthly profit before you touch filters."),
          ], "/sim/selection"),
          lesson("mkt-02", "搜索量要看趋势", "Read search trend, not a single number", [
            P("一周的搜索飙升可能只是节日或达人视频。", "A one-week spike may be a holiday or a creator video."),
            P("用近 90 天的方向判断要不要备两个月库存。", "Use 90 days of direction before you buy two months of stock."),
            P("趋势向下的高搜索词，不值得为它提高起订量。", "A falling high-volume term is a poor reason to raise MOQ."),
          ], "/sim/selection"),
          lesson("mkt-03", "BSR 是速度，不是累计销量", "BSR is velocity, not lifetime sales", [
            P("大类排名反映最近卖得有多快。", "Best Sellers Rank reflects how fast it sold recently."),
            P("一天的排名跳动不能作为采购依据。", "One day's jump is not a purchase order."),
            P("用一周走势对照需求分，而不是对照愿望。", "Compare a week of rank with the demand score, not with hope."),
          ], "/glossary?term=bsr"),
          lesson("mkt-04", "评价增速比评价总数诚实", "Review velocity is more honest than review count", [
            P("老链接评价很多，不代表这个月还有需求。", "A large review count does not mean this month still has demand."),
            P("新品评价增速快，才说明当前流量能转化。", "Fast review growth on a new listing means current traffic converts."),
            P("评价停更的链接，谨慎把它当成竞品基准。", "Be careful using a listing that stopped collecting reviews as your benchmark."),
          ], "/sim/selection"),
          lesson("mkt-05", "季节性要写进备货日历", "Put seasonality on the buying calendar", [
            P("厨具、户外和节日装饰的旺季不在同一个月。", "Kitchen, outdoor, and holiday goods do not peak in the same month."),
            P("旺季前 45 天还没入库，广告也帮不上忙。", "If stock is not in the warehouse 45 days before peak, ads cannot help."),
            P("淡季的高毛利，经常是卖不掉的库存。", "A high off-season margin is often inventory that will not move."),
          ], "/sim/procurement"),
        ],
      },
      {
        id: "market-b",
        title: bi("需求旁边就是约束", "Constraints sit next to demand"),
        lessons: [
          lesson("mkt-06", "价格带决定你跟谁竞争", "The price band decides who you compete with", [
            P("同一用途在 $15 和 $40 是两场不同的比赛。", "The same job at $15 and at $40 is two different contests."),
            P("筛选时先锁价格带，再看评分。", "Lock the price band before you sort by score."),
            P("你的成本进不了这个价格带，就换商品，而不是压供应商到不合规。", "If your cost cannot enter the band, change products. Do not push a supplier into non-compliance."),
          ], "/sim/selection"),
          lesson("mkt-07", "竞争分高不是不能做", "A high competition score is not an automatic no", [
            P("竞争分描述拥挤程度，不直接等于没利润。", "Competition describes crowding. It is not the same as no profit."),
            P("拥挤市场里，只有差异化能解释你的点击。", "In a crowded market, only a difference explains your click."),
            P("竞争分低且需求分也低，叫做没有比赛也没有观众。", "Low competition and low demand means no race and no audience."),
          ], "/sim/selection"),
          lesson("mkt-08", "新品窗口很短", "The window for a new listing is short", [
            P("评价还少的时候，主图和价格决定能不能留下。", "While reviews are scarce, the main image and price decide whether you stay."),
            P("窗口期的广告是买样本，不是买规模。", "Ads in the window buy a sample, not scale."),
            P("样本没转化就停，不要用预算证明自己没错。", "If the sample does not convert, stop. Do not spend to prove you were right."),
          ], "/sim/ads"),
          lesson("mkt-09", "差评是下一版的说明书", "Negative reviews are the spec for the next version", [
            P("把差评按原因归类：尺寸、材质、说明书、物流。", "Group negative reviews: size, material, instructions, shipping."),
            P("你能改的原因才是差异化，不能改的是品类税。", "The causes you can change are differentiation. The ones you cannot are a category tax."),
            P("物流差评不会因为你换标题而消失。", "Shipping complaints do not disappear because you rewrote the title."),
          ], "/sim/selection"),
          lesson("mkt-10", "合规在打样之前", "Compliance comes before samples", [
            P("食品接触、儿童用品、电子和化妆品有不同的准入。", "Food contact, children's products, electronics, and cosmetics have different gates."),
            P("供应商说大家都在卖，不是授权。", "A supplier saying everyone sells it is not an authorization."),
            P("先看术语里的知识产权风险，再谈单价。", "Read intellectual property risk in the glossary before you discuss unit price."),
          ], "/glossary?term=ip-risk"),
        ],
      },
      {
        id: "market-c",
        title: bi("把调研收成决定", "Turn research into a decision"),
        lessons: [
          lesson("mkt-11", "体积和重量会改写 FBA", "Size and weight rewrite FBA", [
            P("轻小件和超尺寸不是一个物流成本级别。", "Small and light is not the same cost tier as oversized."),
            P("折叠和拆装能改变计费尺寸，也会带来退货。", "Folding and assembly can change the billed size, and they can cause returns."),
            P("在真实利润里看物流一行，而不是只看工厂报价。", "Read the logistics line in true profit, not only the factory quote."),
          ], "/tools"),
          lesson("mkt-12", "利润先于热情", "Profit before enthusiasm", [
            P("你喜欢的品类，不等于买家正在搜索。", "A category you like is not a category people are searching."),
            P("热情可以做内容，不能代替毛利筛选。", "Enthusiasm can make content. It cannot replace the margin filter."),
            P("用利润率滑块先砍掉不成立的商品。", "Use the margin slider to drop products that do not clear the bar."),
          ], "/sim/selection"),
          lesson("mkt-13", "小心幸存者样本", "Watch survivor bias", [
            P("榜单上全是还活着的链接，死掉的你看不见。", "Rankings show listings that survived. The dead ones are invisible."),
            P("用差评和退货率给榜单降温。", "Cool the ranking down with negative reviews and the return rate."),
            P("模拟器里的分数是样本，不是承诺。", "Scores in the simulator are a sample, not a promise."),
          ], "/sim/selection"),
          lesson("mkt-14", "汇率负责展示，需求系数负责销量", "Exchange rates display, demand factors sell", [
            P("切换站点后金额变了，是因为展示汇率。", "Amounts change after a marketplace switch because the display rate changed."),
            P("月利润变小，还因为需求系数把月销假设调低了。", "Monthly profit also shrinks because the demand factor lowers the sales assumption."),
            P("历史流水仍以美元保存，不会被站点切换改写。", "History stays in US dollars and is not rewritten by the switch."),
          ], "/sim/dashboard"),
          lesson("mkt-15", "用一页备忘录结束调研", "End research with a one-page memo", [
            P("写下站点、价格带、需求证据、竞争证据、否决条件。", "Write the marketplace, price band, demand evidence, competition evidence, and the kill criteria."),
            P("没有否决条件的调研，最后会变成舍不得放弃。", "Research without kill criteria becomes a product you cannot drop."),
            P("备忘录通过之后，才进入选品清单。", "The shortlist starts after the memo, not before."),
          ], "/sim/selection"),
        ],
      },
    ],
  },
  {
    id: "sourcing",
    title: bi("选品与供应链", "Selection and supply"),
    summary: bi("掌握选品方法，打造稳定供应链体系。", "Select products and build a supply chain you can reorder."),
    level: "foundation",
    icon: "sourcing",
    chapters: [
      {
        id: "src-1",
        title: bi("1. 选品思维与利润认知", "1. Selection judgment and profit"),
        lessons: [
          lesson("src-01", "选品不是追昨天的爆款", "Selection is not chasing yesterday's hit", [
            P("爆款证明需求存在过，不证明你还能挤进去。", "A hit proves demand existed. It does not prove you can enter."),
            P("先看你能否在同一价格带做出一个可以被说清的差别。", "First ask if you can explain one difference inside the same price band."),
            P("说不清差别，就不要为它备货。", "If you cannot say the difference, do not buy stock."),
          ], "/sim/selection"),
          lesson("src-02", "需求、竞争、利润是一张三角", "Demand, competition, and profit are one triangle", [
            P("只看需求会买到红海，只看利润会买到没人搜的商品。", "Demand alone buys a red ocean. Profit alone buys something nobody searches."),
            P("综合分把三者放在一起，方便排序，不代替核算。", "The overall score sorts the three. It does not replace the formula."),
            P("排序之后打开前三个，而不是只收藏第一名。", "Open the top three after sorting. Do not bookmark only the first."),
          ], "/sim/selection"),
          lesson("src-03", "毛利幻觉", "The gross-margin illusion", [
            P("卡片上的利润率没有扣广告、退货、头程分摊和资金成本。", "The card margin does not include ads, returns, inbound allocation, or capital."),
            P("毛利高的商品更要打开瀑布图。", "A high gross margin is exactly when you should open the waterfall."),
            P("用术语「毛利」和「真实利润」对照着读。", "Read the glossary entries for gross profit and true profit side by side."),
          ], "/glossary?term=gross"),
          lesson("src-04", "跟卖和品牌不是同一条路", "Reselling and a brand are different roads", [
            P("跟卖共享评价，也共享别人的投诉。", "A shared listing shares reviews and shares the other seller's complaints."),
            P("品牌备案之前，不要在包装上使用你没有权利的标识。", "Do not print a mark you do not own before the brand is filed."),
            P("模拟器不连接真实品牌库，但合规风险会抑制链接。", "The simulator is not a real brand registry. Compliance risk still suppresses listings."),
          ], "/sim/listings"),
          lesson("src-05", "差异化要从差评里长出来", "Differentiation should grow out of negative reviews", [
            P("改颜色不叫差异化，改掉退货原因才叫。", "A new color is not differentiation. Removing a return reason is."),
            P("把要改的点写进采购备注，而不是只写进广告语。", "Put the change on the purchase note, not only in the ad copy."),
            P("供应商做不到的差别，就不要写上链接。", "If the supplier cannot build the difference, do not write it on the listing."),
          ], "/sim/procurement"),
          lesson("src-06", "选品清单要有字段", "A shortlist needs fields", [
            P("至少留下价格带、毛利、真实利润、供应商和否决原因。", "Keep the price band, gross margin, true profit, supplier, and the reason you would kill it."),
            P("加入清单是开始核算，不是结束决策。", "Adding to the shortlist starts the math. It does not end the decision."),
            P("清单为空时，采购页会明确告诉你回到选品。", "An empty shortlist makes the procurement page send you back to selection."),
          ], "/sim/selection"),
        ],
      },
      {
        id: "src-2",
        title: bi("2. 真实利润核算体系", "2. True-profit accounting"),
        lessons: [
          lesson("src-21", "2.1 利润的本质与误区", "2.1 What profit is, and the usual mistakes", [
            P("利润是现金和注意力在一段时间后的剩余，不是标价减进价。", "Profit is what remains of cash and attention after a period of time, not price minus factory cost."),
            P("常见误区是把平台结算当成利润。", "A common mistake is to treat the marketplace payout as profit."),
            P("结算单还没扣你自己的人工、资金和退货损耗。", "The settlement has not removed your labor, capital, or return loss."),
          ], "/tools"),
          formulaLesson,
          lesson("src-23", "2.3 成本构成拆解", "2.3 Take the cost apart", [
            P("把每一行成本对应到公式的一项，避免重复扣或漏扣。", "Map every cost line to one term in the formula so you do not double-count or skip."),
            P("佣金在本模拟里已经从销售额扣除，不要在运营费里再减一次。", "This simulator already removes the referral fee from revenue. Do not subtract it again inside operating cost."),
            P("头程放在物流，不放在采购单价里口算。", "Keep inbound freight in logistics. Do not hide it inside a mental unit cost."),
          ], "/tools"),
          lesson("src-24", "2.4 隐性成本识别", "2.4 Find the hidden costs", [
            P("工具订阅、拍摄、客服和样品都是运营费。", "Tool subscriptions, photos, support, and samples are operating cost."),
            P("它们不出现在供应商报价上。", "They do not appear on the supplier quote."),
            P("管理员参数里的单件人工，就是给这些成本留的位置。", "The per-unit labor parameter is where these costs live."),
          ], "/admin"),
          lesson("src-25", "2.5 退货与纠纷成本", "2.5 Returns and claims", [
            P("退货成本 = 退货率 ×（货值损失 + 处理费）+ 纠纷赔付。", "Return cost = return rate × (lost value + handling) + claim payouts."),
            P("尺寸敏感和易碎品要把退货率调高再看真实利润。", "Raise the return rate for size-sensitive and fragile goods before you trust true profit."),
            P("退货率在管理员参数里，改完回到选品详情看瀑布。", "The return rate is an admin parameter. Change it, then reopen the product waterfall."),
          ], "/sim/selection?focus=profit"),
          lesson("src-26", "2.6 资金成本与机会成本", "2.6 Capital cost and opportunity cost", [
            P("资金成本看的是钱被库存占用了多少天。", "Capital cost is how many days cash sits in inventory."),
            P("机会成本是这条链接占用你时，没做的另一条链接。", "Opportunity cost is the other listing you did not build while this one held you."),
            P("起订量越大，这两项越不应该被忽略。", "The larger the MOQ, the less you can ignore either term."),
          ], "/glossary?term=opportunity"),
          lesson("src-27", "2.7 利润敏感性分析", "2.7 Sensitivity", [
            P("每次只改一个参数：佣金、退货率或广告占比。", "Change one parameter at a time: referral fee, return rate, or ad ratio."),
            P("看真实利润变号的那个点，就是这条链接的死线。", "The point where true profit changes sign is the listing's kill line."),
            P("死线离默认值很近的商品，不要放大。", "Do not scale a product whose kill line sits next to the default."),
          ], "/tools"),
          lesson("src-28", "2.8 案例：从毛利到真实利润", "2.8 Case: from gross profit to true profit", [
            P("用沥水篮走一遍案例库里的路径。", "Walk the colander path in the case library."),
            P("先看卡片，再看瀑布，再决定供应商。", "Read the card, then the waterfall, then choose the supplier."),
            P("不要在没看瀑布之前填写采购数量。", "Do not type a purchase quantity before the waterfall."),
          ], "/cases/colander-win"),
        ],
      },
      {
        id: "src-3",
        title: bi("3. 从核算到采购", "3. From the formula to a purchase"),
        lessons: [
          lesson("src-31", "核算通过才允许进入采购", "A purchase starts only after the formula passes", [
            P("真实利润为正，只是门槛，不是下大单的理由。", "Positive true profit is a gate, not a reason for a large order."),
            P("第一单用能在两天到货的供应商做试销。", "The first order uses the supplier that can arrive in two days."),
            P("试销数量不要超过你愿意报废的金额。", "The test quantity should not exceed the amount you can afford to scrap."),
          ], "/sim/procurement"),
        ],
      },
    ],
  },
  {
    id: "store",
    title: bi("店铺搭建与优化", "Store setup and listing quality"),
    summary: bi("搭建专业店铺，优化 Listing 与转化率。", "Set up the store and improve the listing that has to convert."),
    level: "practice",
    icon: "store",
    chapters: [
      {
        id: "store-a",
        title: bi("链接基本功", "Listing basics"),
        lessons: [
          lesson("sto-01", "标题写买家会搜的词", "Titles use words shoppers search", [
            P("标题是检索和点击的入口，不是品牌故事。", "The title is how people find and click. It is not the brand story."),
            P("批量上架的模板要把品名和用途放在前面。", "The batch-listing template should lead with the product and the job it does."),
            P("堆砌无关词会伤害点击率。", "Unrelated words hurt click-through."),
          ], "/sim/listings"),
          lesson("sto-02", "五点对应差评，而不是形容词", "Bullets answer complaints, not adjectives", [
            P("每一条要点解决一个购买顾虑。", "Each bullet removes one reason not to buy."),
            P("材质、尺寸、使用场景比“高端品质”有用。", "Material, size, and use beat “premium quality”."),
            P("做不到的承诺会变成退货。", "A promise you cannot keep becomes a return."),
          ], "/sim/listings"),
          lesson("sto-03", "主图在价格带里比较", "The main image competes inside the price band", [
            P("买家先比较缩略图，再比较文案。", "Shoppers compare thumbnails before they compare copy."),
            P("主图要在这个价格带里看起来值这个价钱。", "The image has to look worth the price inside the band."),
            P("点击率低时先换主图，而不是先加预算。", "When click-through is low, change the image before the budget."),
          ], "/sim/ads"),
          lesson("sto-04", "价格和购物车", "Price and the Buy Box", [
            P("没有购物车时，广告点击可能成交在别人的报价上。", "Without the Buy Box, an ad click can check out on someone else's offer."),
            P("标价低于成本会在看板上留下告警。", "A price below cost raises an alert on the dashboard."),
            P("目标毛利率是定价起点，真实利润才是能否保留这个价格的依据。", "Target gross margin starts the price. True profit decides whether you keep it."),
          ], "/glossary?term=buybox"),
          lesson("sto-05", "SKU 要能追溯供应商", "SKUs should trace the supplier", [
            P("编码里留下站点、商品和供应商。", "Encode marketplace, product, and supplier."),
            P("质量问题才能回到某一张采购单。", "A quality issue can then be traced to one purchase order."),
            P("批量上架会生成这样的 SKU，不要改成无意义的流水号。", "Batch listing generates this kind of SKU. Do not replace it with a meaningless sequence."),
          ], "/sim/listings"),
        ],
      },
      {
        id: "store-b",
        title: bi("上架纪律", "Publishing discipline"),
        lessons: [
          lesson("sto-06", "没有库存不要发布", "Do not publish without stock", [
            P("空链接会吃掉你以后的广告判断。", "An empty listing contaminates later ad judgments."),
            P("本模拟允许草稿，发布要求已经入库。", "This simulator allows drafts. Publishing requires received stock."),
            P("期初演示店的库存是为了让看板可读，不代表新商品可以跳过采购。", "Opening stock exists so the dashboard is readable. New products still go through procurement."),
          ], "/sim/listings"),
          lesson("sto-07", "抑制不是广告问题", "Suppression is not an ads problem", [
            P("合规风险高的货发布后会变成抑制。", "Goods with high compliance risk publish as suppressed."),
            P("原因写在链接行上，也写进告警。", "The reason is on the row and in the alerts."),
            P("处理顺序是换供应商，不是加预算。", "The fix is a different supplier, not a larger budget."),
          ], "/sim/listings"),
          lesson("sto-08", "图片、文案、价格一次只改一个", "Change image, copy, or price one at a time", [
            P("同时改三项，你不知道转化是谁带来的。", "Change all three and you will not know what moved conversion."),
            P("模拟日推进之后再看订单，而不是改完立刻下结论。", "Advance a simulated day before you judge orders."),
            P("记录你改了什么，写在社区或自己的笔记里。", "Write down what you changed."),
          ], "/sim/dashboard"),
          lesson("sto-09", "变体不要用来逃避差评", "Variations are not a way to hide reviews", [
            P("强行合并不相关的变体会伤害转化。", "Forcing unrelated variations together hurts conversion."),
            P("尺寸变体要保证库存都买得到。", "Size variations need every size actually in stock."),
            P("断码会制造差评和退货。", "Missing sizes create complaints and returns."),
          ], "/sim/listings"),
          lesson("sto-10", "A+ 和品牌故事排在转化之后", "A+ content comes after conversion works", [
            P("基础链接还不转化时，品牌故事帮不上忙。", "A brand story does not fix a listing that does not convert."),
            P("先让五点回答顾虑。", "Make the bullets answer objections first."),
            P("有了稳定转化，再补充品牌内容。", "Add brand content after conversion is stable."),
          ], "/knowledge/listing-suppress"),
        ],
      },
      {
        id: "store-c",
        title: bi("店铺健康", "Store health"),
        lessons: [
          lesson("sto-11", "库存健康分在说什么", "What inventory health is saying", [
            P("它看的是还能卖多少天，以及有没有低库存 SKU。", "It looks at days of cover and at SKUs that are almost gone."),
            P("演示店里有意留下几条低库存，用来认识告警。", "The demo store keeps a few low-stock SKUs so you can see the alerts."),
            P("健康分好，不代表每个 SKU 都安全。", "A good score does not mean every SKU is safe."),
          ], "/sim/dashboard"),
          lesson("sto-12", "账号绩效的模拟边界", "What this simulator will not pretend", [
            P("这里没有真实的订单缺陷率。", "There is no live order-defect rate."),
            P("退货和抑制会以告警出现，够你练习优先级。", "Returns and suppression show up as alerts, which is enough to practice priority."),
            P("不要把模拟告警截图当成平台通知。", "Do not treat a simulated alert as a marketplace notice."),
          ], "/help"),
          lesson("sto-13", "定价实验要有下限", "Price tests need a floor", [
            P("下限是真实利润不为负。", "The floor is true profit that is not negative."),
            P("用工具箱把价格改到下限附近看敏感度。", "Use the calculator and move price near the floor."),
            P("低于下限的实验不叫促销，叫亏损。", "A test below the floor is not a promotion. It is a loss."),
          ], "/tools"),
          lesson("sto-14", "批量操作前先看勾选", "Read the selection before a batch action", [
            P("批量发布只处理你勾选的草稿。", "Batch publish only touches the drafts you checked."),
            P("先预览标题和价格，再发布。", "Preview titles and prices, then publish."),
            P("发布后立刻到广告页，不要给抑制链接建活动。", "Go to ads after publishing, and do not build a campaign for a suppressed listing."),
          ], "/sim/listings"),
          lesson("sto-15", "优化的节奏是一周，不是一小时", "Optimize on a weekly cadence", [
            P("一天的订单波动说明不了改动。", "One day of orders does not explain a change."),
            P("用看板的 7 天范围做复盘。", "Review with the 7-day range on the dashboard."),
            P("复盘时同时看销售额、退货和广告花费。", "Look at revenue, returns, and ad spend in the same review."),
          ], "/sim/dashboard"),
        ],
      },
    ],
  },
  {
    id: "growth",
    title: bi("营销推广与流量", "Marketing and traffic"),
    summary: bi("学习付费与免费流量获取实战技巧。", "Practice paid and organic traffic without confusing the two."),
    level: "practice",
    icon: "growth",
    chapters: [
      {
        id: "growth-a",
        title: bi("广告结构", "Ad structure"),
        lessons: [
          lesson("gro-01", "三种活动不是同一种任务", "Three campaign types are three jobs", [
            P("商品推广（SP）推具体 SKU。", "Sponsored Products pushes a specific SKU."),
            P("品牌推广（SB）推店铺和品牌词。", "Sponsored Brands pushes the store and brand terms."),
            P("展示推广（SD）做再营销，不负责从零创造需求。", "Sponsored Display remarkets. It does not create demand from nothing."),
          ], "/sim/ads"),
          lesson("gro-02", "日预算是上限，不是目标", "Daily budget is a ceiling, not a goal", [
            P("花不完说明点击不够或竞价太低。", "Underspending means not enough clicks or a bid that is too low."),
            P("每天花满不一定是好事。", "Spending the full budget is not automatically good."),
            P("新建活动时先用你算得起的数。", "Start a new campaign with a number you can afford."),
          ], "/sim/ads"),
          lesson("gro-03", "ACoS 的分母是广告销售", "ACoS uses ad sales as the denominator", [
            P("不要用总销售额去除广告花费来声称 ACoS。", "Do not divide ad spend by total sales and call it ACoS."),
            P("那个比值是 TACoS。", "That ratio is TACoS."),
            P("活动表上每一行都能展开看公式。", "Every campaign row can be read against the formula."),
          ], "/glossary?term=acos"),
          lesson("gro-04", "ROAS 是 ACoS 的倒数", "ROAS is the inverse of ACoS", [
            P("6 倍 ROAS 约等于 16.7% ACoS。", "A 6x ROAS is about a 16.7% ACoS."),
            P("报倍数之前先确认归因窗口。", "Confirm the attribution window before you quote the multiple."),
            P("样本活动里暂停的竞品定投，ROAS 看起来还能看，ACoS 已经不健康。", "The paused competitor campaign in the sample still has a readable ROAS and an unhealthy ACoS."),
          ], "/sim/ads"),
        ],
      },
      {
        id: "growth-b",
        title: bi("投放判断", "Judging spend"),
        lessons: [
          lesson("gro-05", "CPC 要倒推", "Work backward to CPC", [
            P("可承受 CPC ≈ 客单价 × 转化率 × 目标广告占比。", "Affordable CPC ≈ order value × conversion × target ad ratio."),
            P("市场 CPC 高于这个数，就换词或换商品。", "If the market CPC is higher, change the term or the product."),
            P("工具箱可以帮你把广告占比放进真实利润。", "The calculator puts the ad ratio into true profit."),
          ], "/tools"),
          lesson("gro-06", "点击率低先改主图", "Low click-through means the image", [
            P("曝光上来了、点击没有，是素材问题。", "Impressions without clicks are a creative problem."),
            P("加预算会买来更多不被点的曝光。", "More budget buys more ignored impressions."),
            P("暂停活动不会修复主图，但能止血。", "Pausing does not fix the image, but it stops the bleed."),
          ], "/glossary?term=ctr"),
          lesson("gro-07", "转化差时不要放大", "Do not scale a page that does not convert", [
            P("页面转化和广告转化要分开看。", "Separate page conversion from ad conversion."),
            P("页面不行，广告只是在为同一个漏洞付费。", "A weak page means ads pay for the same leak."),
            P("先回链接，再回竞价。", "Return to the listing before you return to the bid."),
          ], "/sim/listings"),
          lesson("gro-08", "否定和降价是操作，不是失败", "Negatives and lower bids are actions, not failure", [
            P("不相关的搜索词要停。", "Irrelevant queries should stop."),
            P("本模拟用暂停整条活动来练习止血。", "This simulator practices the stop by pausing a whole campaign."),
            P("推进一天，确认花费不再增加。", "Advance one day and confirm spend does not grow."),
          ], "/sim/ads"),
          lesson("gro-09", "新品广告买的是样本", "Launch ads buy a sample", [
            P("样本的目的是知道转化，不是冲排名。", "The sample exists to learn conversion, not to buy rank."),
            P("样本期间允许 ACoS 高于稳态。", "ACoS may sit above the steady-state target during the sample."),
            P("样本结束没有转化，就停止，而不是换一个更大的预算。", "If the sample ends without conversion, stop. Do not raise the budget."),
          ], "/sim/ads"),
          lesson("gro-10", "品牌活动不要背全部销量", "Brand campaigns should not carry all sales", [
            P("品牌词的自然单应该慢慢出现。", "Organic orders on brand terms should appear over time."),
            P("如果关掉品牌活动销量就没了，说明没有品牌需求。", "If sales vanish when the brand campaign pauses, there is no brand demand."),
            P("用 TACoS 看这件事，而不是只用 ACoS。", "Read it with TACoS, not only ACoS."),
          ], "/glossary?term=tacos"),
        ],
      },
      {
        id: "growth-c",
        title: bi("和自然流量相处", "Living with organic traffic"),
        lessons: [
          lesson("gro-11", "广告销售不等于总销售", "Ad sales are not total sales", [
            P("活动表是归因口径，看板是订单口径。", "The campaign table is attributed. The dashboard is orders."),
            P("两者故意不完全相等，用来练习读口径。", "They are intentionally not identical, so you practice reading definitions."),
            P("复盘时写清楚你引用的是哪一个。", "Write down which one you are quoting."),
          ], "/knowledge/acos-tacos"),
          lesson("gro-12", "免费流量来自转化和库存", "Organic traffic needs conversion and stock", [
            P("断货会把你用广告买来的位置还回去。", "A stockout gives back the position ads paid for."),
            P("库存健康告警出现时，先补货或降预算。", "When inventory health alerts, restock or cut budget."),
            P("给抑制链接买的流量没有自然单可言。", "Traffic to a suppressed listing cannot become organic orders."),
          ], "/sim/dashboard"),
          lesson("gro-13", "促销要算进运营费", "Promotions belong in operating cost", [
            P("优惠券不是平台送的，是你的利润。", "A coupon is not a gift from the marketplace. It is your profit."),
            P("把折扣后的价格放进工具箱再看真实利润。", "Put the discounted price into the calculator and reread true profit."),
            P("真实利润为负的促销，时长就是亏损时长。", "A promotion with negative true profit loses money for as long as it runs."),
          ], "/tools"),
          lesson("gro-14", "站外流量更要看落地页", "Off-site traffic depends on the landing page", [
            P("站外点击更贵，页面不匹配时浪费更快。", "Off-site clicks cost more, and a mismatched page wastes them faster."),
            P("落地页必须就是你有库存的那条链接。", "The landing page has to be the listing that has stock."),
            P("本模拟不接真实社媒，只用广告活动代表付费流量。", "This simulator does not connect to social networks. Campaigns stand in for paid traffic."),
          ], "/sim/ads"),
          lesson("gro-15", "预算挪移要有对象", "Move budget toward a specific target", [
            P("停掉高 ACoS 活动之后，预算要给已经能转化的 SKU。", "After pausing a high-ACoS campaign, give the budget to a SKU that already converts."),
            P("不要立刻开一个更宽的自动活动。", "Do not immediately open a broader automatic campaign."),
            P("案例库里的竞品定投就是这个练习。", "The competitor-targeting case is this exercise."),
          ], "/cases/acos-loss"),
          lesson("gro-16", "一周复盘广告的四列", "The weekly ad review has four columns", [
            P("花费、归因销售、ACoS、状态。", "Spend, attributed sales, ACoS, status."),
            P("状态是暂停的，花费在新的一天不应该增加。", "A paused campaign should not add spend on a new day."),
            P("把复盘结论写进社区，方便以后的自己看。", "Write the conclusion in the community so your later self can read it."),
          ], "/community"),
        ],
      },
    ],
  },
  {
    id: "logistics",
    title: bi("物流与订单履约", "Logistics and fulfillment"),
    summary: bi("理解跨境物流，优化订单交付流程。", "Understand cross-border logistics and the path an order takes."),
    level: "practice",
    icon: "logistics",
    chapters: [
      {
        id: "log-a",
        title: bi("头程与入库", "Inbound and receiving"),
        lessons: [
          lesson("log-01", "头程要分摊到每一件", "Spread inbound freight across every unit", [
            P("工厂价不含到仓成本。", "Factory price does not include the trip to the warehouse."),
            P("真实利润的物流行包含头程和 FBA。", "The logistics line in true profit includes inbound freight and FBA."),
            P("只比较工厂价，会选出运不起的商品。", "Comparing factory prices alone selects products you cannot afford to ship."),
          ], "/glossary?term=inbound"),
          lesson("log-02", "交期决定你能不能赶上", "Lead time decides whether you arrive", [
            P("迅达供应商用 2 天交期换一个稍高的单价，适合试销。", "The rapid supplier trades a 2-day lead for a slightly higher price. It fits a test."),
            P("低价供应商交期更长，还叠加合规风险。", "The bargain supplier is slower and adds compliance risk."),
            P("采购单上的预计入库日会随模拟时钟走到。", "The expected receipt date arrives with the simulated clock."),
          ], "/sim/procurement"),
          lesson("log-03", "入库之后才有可售库存", "Sellable stock exists only after receipt", [
            P("在途不是可售。", "In transit is not sellable."),
            P("批量上架读取的是已入库数量。", "Batch listing reads received quantity."),
            P("推进模拟日是让采购单入库的方式。", "Advancing days is how a purchase order is received."),
          ], "/sim/listings"),
          lesson("log-04", "最小起订量和现金流", "MOQ and cash", [
            P("起订量大于两个月销量时，资金成本上升。", "When MOQ covers more than two months of sales, capital cost rises."),
            P("第一单可以询问是否允许低于 MOQ 的试单，本模拟按标出的 MOQ 校验。", "A real supplier might allow a test below MOQ. This simulator enforces the stated MOQ."),
            P("校验失败时不会创建订单。", "A failed check does not create an order."),
          ], "/sim/procurement"),
          lesson("log-05", "包装影响运费和退货", "Packaging changes freight and returns", [
            P("过度包装提高头程和 FBA。", "Overpacking raises inbound freight and FBA."),
            P("保护不足提高破损退货。", "Underpacking raises damage returns."),
            P("改包装之后要重算物流行。", "Recalculate the logistics line after a packaging change."),
          ], "/tools"),
        ],
      },
      {
        id: "log-b",
        title: bi("履约方式", "Fulfillment choices"),
        lessons: [
          lesson("log-06", "FBA 买的是时效和转化", "FBA buys speed and conversion", [
            P("配送和客服交给平台，费用写进单件物流。", "Delivery and support move to the marketplace, and the fee sits in unit logistics."),
            P("库龄变长之后，仓储会继续增加。", "Storage keeps growing as inventory ages."),
            P("卖得慢的货不适合大数量入仓。", "Slow goods do not belong in a large inbound shipment."),
          ], "/glossary?term=fba"),
          lesson("log-07", "FBM 把时效留在自己账上", "FBM keeps speed on your books", [
            P("自发货能避免一部分仓储，但转化通常更低。", "Merchant fulfillment avoids some storage and usually converts worse."),
            P("本模拟的演示店按 FBA 计费。", "The demo store is priced as FBA."),
            P("如果你在工具箱里把 FBA 费改成自发货成本，要同时假设转化下降。", "If you replace the FBA fee with a self-ship cost in the calculator, also assume conversion falls."),
          ], "/glossary?term=fbm"),
          lesson("log-08", "断货的代价大于广告", "A stockout costs more than the ad", [
            P("广告还在跑、库存没有，是在给以后的自己挖坑。", "Ads running with no stock dig a hole for your later self."),
            P("低库存告警出现时，先看采购在途。", "When a low-stock alert appears, look at inbound purchase orders first."),
            P("在途赶不上日销，就暂停对应广告。", "If inbound stock will miss the daily sales rate, pause the ads."),
          ], "/sim/ads"),
          lesson("log-09", "退货也是物流", "Returns are logistics too", [
            P("退回的货不一定能二次销售。", "A returned unit is not always sellable again."),
            P("公式里用退货率估计这笔损失。", "The formula estimates that loss with the return rate."),
            P("不要把退货商品默默加回可售库存而不打折。", "Do not silently add returns back to sellable stock at full value."),
          ], "/glossary?term=return-rate"),
          lesson("log-10", "多站点不是复制头程", "Another marketplace is not a copy of the freight", [
            P("日本和欧洲的入仓条件不同。", "Inbound rules differ for Japan and Europe."),
            P("本模拟用需求系数和汇率表达差异，不模拟每条航线。", "This simulator expresses the difference with a demand factor and an exchange rate. It does not model every lane."),
            P("真正发货前还要核对当地标签和税务。", "Before a real shipment, check local labels and tax."),
          ], "/sim/selection"),
        ],
      },
      {
        id: "log-c",
        title: bi("履约异常", "When fulfillment breaks"),
        lessons: [
          lesson("log-11", "延误要改销售预期", "Delays should change the sales forecast", [
            P("交期变长，资金成本变高，广告窗口也会错过。", "A longer lead time raises capital cost and can miss the ad window."),
            P("推进模拟日之前，先看采购单状态。", "Read purchase-order status before you advance the clock."),
            P("在途订单不会产生销售。", "In-transit orders do not create sales."),
          ], "/sim/procurement"),
          lesson("log-12", "破损和错货是质量风险", "Damage and wrong goods are quality risk", [
            P("质量风险高的供应商，退货率假设也要上调。", "Raise the return-rate assumption for a high quality-risk supplier."),
            P("不要只看单价节省。", "Do not look only at the unit-price saving."),
            P("稳健供应商的意义是让退货假设站得住。", "The steady supplier exists so the return assumption can stay honest."),
          ], "/sim/procurement"),
          lesson("log-13", "仓储上限和冗余库存", "Storage limits and excess stock", [
            P("IPI 一类的指标在真实平台会限制补货。", "Metrics such as IPI limit restock on a real marketplace."),
            P("模拟里用库存健康和低库存告警代替这个压力。", "The simulator uses inventory health and low-stock alerts for that pressure."),
            P("卖不动的库存，停止补货先于继续广告。", "For stock that will not sell, stop replenishment before you continue ads."),
          ], "/glossary?term=ipi"),
          lesson("log-14", "订单履约时效写进客服预期", "Delivery speed sets support expectations", [
            P("页面承诺的时效做不到，就会变成差评。", "A delivery promise you miss becomes a negative review."),
            P("客服话术不能快过物流。", "Support scripts cannot be faster than the carrier."),
            P("履约和客服课要连着看。", "Read this course next to customer service."),
          ], "/learn/service/svc-01"),
          lesson("log-15", "一批货的成本到齐再复盘", "Review a batch only when all costs have arrived", [
            P("头程账单晚到，是隐性成本的常见来源。", "A late freight invoice is a common hidden cost."),
            P("复盘时把实际头程填回工具箱。", "Put the actual inbound cost back into the calculator."),
            P("和预算差一截，下一单就要改数量或改渠道。", "If it misses the budget, the next order changes quantity or lane."),
          ], "/tools"),
          lesson("log-16", "履约清单", "The fulfillment checklist", [
            P("下单前：MOQ、交期、合规、头程估算。", "Before the order: MOQ, lead time, compliance, inbound estimate."),
            P("在途：广告不要提前大开。", "While in transit: do not open a large ad budget early."),
            P("入库：发布链接，小预算验证，再决定是否补货。", "After receipt: publish, test with a small budget, then decide on a replenishment."),
          ], "/sim/listings"),
        ],
      },
    ],
  },
  {
    id: "finance",
    title: bi("支付、税务与合规", "Payments, tax, and compliance"),
    summary: bi("掌握合规支付与税务基础知识。", "Learn the payment and tax basics that change profit."),
    level: "foundation",
    icon: "finance",
    chapters: [
      {
        id: "fin-a",
        title: bi("钱怎么进来", "How money comes in"),
        lessons: [
          lesson("fin-01", "结算不是利润", "A payout is not profit", [
            P("平台打款已经扣了佣金和部分配送费。", "The payout already removed the referral fee and part of fulfillment."),
            P("你的采购、头程、广告和人工还在账外。", "Procurement, inbound freight, ads, and labor are still outside that number."),
            P("用真实利润公式把它们加回去。", "Put them back with the true-profit formula."),
          ], "/learn/sourcing/src-22"),
          lesson("fin-02", "佣金按类目变化", "Referral fees change by category", [
            P("默认 15% 是教学起点，不是所有类目。", "The default 15% is a teaching start, not every category."),
            P("管理员可以改佣金，选品页的毛利会跟着变。", "An admin can change the fee, and gross margin on the selection page follows."),
            P("改之前先看当前商品的真实利润，改之后再看一次。", "Read true profit before the change and again after it."),
          ], "/admin"),
          lesson("fin-03", "支付手续费进成本环", "Payment fees sit in the cost ring", [
            P("看板上的支付处理是订单金额的一部分。", "Payment processing on the dashboard is a slice of order value."),
            P("它和广告花费分开，避免重复计算。", "It is separate from ad spend so it is not counted twice."),
            P("导出流水可以自己加总核对。", "Export the ledger and add it up yourself."),
          ], "/sim/dashboard"),
          lesson("fin-04", "回款周期是资金成本", "Payout delay is a capital cost", [
            P("货卖出去到钱回来，现金仍然被占用。", "Between the sale and the payout, cash is still tied up."),
            P("覆盖天数参数里已经留了这部分时间。", "The days-of-cover parameter includes time for this."),
            P("账期越长，越不应该加大起订量。", "The longer the delay, the less you should raise MOQ."),
          ], "/tools"),
          lesson("fin-05", "多币种展示不改变记账货币", "Display currency does not change the book", [
            P("流水以美元保存。", "The ledger is stored in US dollars."),
            P("站点切换只换展示。", "The marketplace switch only changes the display."),
            P("比较两个站点时，看需求系数，不要只看符号。", "When comparing marketplaces, read the demand factor, not only the symbol."),
          ], "/sim/dashboard"),
        ],
      },
      {
        id: "fin-b",
        title: bi("税和合规", "Tax and compliance"),
        lessons: [
          lesson("fin-06", "增值税不是利润税", "VAT is not a tax on profit", [
            P("欧洲站点的标价常常含税。", "European prices are often tax-inclusive."),
            P("把含税价当成到手，会高估利润。", "Treating a tax-inclusive price as net cash overstates profit."),
            P("本模拟没有把德国增值税写进默认费率，知识库把这个边界写明了。", "This simulator does not put German VAT into the default rate. The knowledge base states that boundary."),
          ], "/glossary?term=vat"),
          lesson("fin-07", "所得税不在单件公式里", "Income tax is outside the unit formula", [
            P("真实利润公式服务的是商品决策。", "The true-profit formula serves the product decision."),
            P("公司所得税发生在利润之后，不用来筛链接。", "Corporate income tax happens after profit. It does not screen listings."),
            P("不要把税率塞进单件成本后再和别人比毛利。", "Do not stuff an income-tax rate into unit cost and then compare gross margin."),
          ], "/tools"),
          lesson("fin-08", "发票和采购必须对得上", "Invoices have to match the purchase", [
            P("没有发票的低价，常常伴随合规风险。", "A low price without an invoice often travels with compliance risk."),
            P("低价工贸在模拟里不提供验货，风险分表达了这件事。", "The bargain trader refuses inspection. The risk score says so."),
            P("对不上的货，不要上架。", "Do not list goods you cannot reconcile."),
          ], "/sim/procurement"),
          lesson("fin-09", "收款账户要和站点匹配", "The payout account should match the marketplace", [
            P("真实业务里，账户主体影响税务和提现。", "In a real business, the legal entity affects tax and withdrawals."),
            P("本模拟不收集银行信息。", "This simulator does not collect bank details."),
            P("练习时只需要记住：钱回来的路径也是成本。", "For practice, remember that the path money takes is also a cost."),
          ], "/help"),
          lesson("fin-10", "合规成本进第一单", "Compliance cost belongs in the first order", [
            P("检测、认证和标签是采购的一部分。", "Testing, certificates, and labels are part of procurement."),
            P("把它们摊进单价再看真实利润。", "Spread them into the unit cost and reread true profit."),
            P("摊完为负，就不要为了证书去备货。", "If the result is negative, do not buy stock just to use the certificate."),
          ], "/tools"),
        ],
      },
      {
        id: "fin-c",
        title: bi("把账看懂", "Reading the books"),
        lessons: [
          lesson("fin-11", "成本环的五个桶", "The five buckets in the cost ring", [
            P("采购、广告、支付、物流、其他运营。", "Procurement, ads, payment, logistics, other operations."),
            P("广告来自活动花费，不从每笔订单再扣一次。", "Ads come from campaign spend and are not deducted again per order."),
            P("比例会随你的操作变化，不是贴上去的示意图。", "The shares move with your actions. They are not a pasted diagram."),
          ], "/sim/dashboard"),
          lesson("fin-12", "退款把利润打回负数", "Refunds push profit negative", [
            P("流水里的退款金额为负。", "Refund rows in the ledger have a negative amount."),
            P("货不一定全额回到可售成本。", "The goods do not fully return to sellable cost."),
            P("近期退货数显示在广告页的平台动态里。", "Recent returns show in platform activity on the ads page."),
          ], "/sim/ads"),
          lesson("fin-13", "导出后再信", "Trust it after you export", [
            P("CSV 和屏幕上的流水是同一份。", "The CSV and the on-screen ledger are the same rows."),
            P("用电子表格加总销售额，对照看板卡片。", "Sum sales in a spreadsheet and compare with the dashboard card."),
            P("对不上就视为缺陷，而不是四舍五入的借口。", "If they disagree, treat it as a defect, not as a rounding excuse."),
          ], "/sim/dashboard"),
          lesson("fin-14", "参数是假设，要写下来", "Parameters are assumptions, so write them down", [
            P("默认退货率 8%、广告占比 12%、佣金 15%。", "Defaults: 8% returns, 12% ads, 15% referral fee."),
            P("你改了假设，结论只在这个假设下成立。", "After you change an assumption, the conclusion holds only under it."),
            P("管理员页能看到当前假设。", "The admin page shows the current assumptions."),
          ], "/admin"),
          lesson("fin-15", "现金够不够付下一单", "Is there cash for the next order", [
            P("利润为正也可能现金不够，因为库存还没卖掉。", "Profit can be positive while cash is short, because stock has not sold."),
            P("看在途采购和库存覆盖天数。", "Read inbound purchases and days of cover."),
            P("覆盖天数过长时，停止新品，先消化。", "When cover is too long, stop new products and sell through."),
          ], "/sim/procurement"),
          lesson("fin-16", "财务复核清单", "The finance checklist", [
            P("佣金、广告、头程、退货、资金、机会成本都有归宿。", "Referral fee, ads, inbound, returns, capital, and opportunity cost each have a home."),
            P("任何说“这个不用算”的成本，都要能指出它被包含在哪一项。", "Any cost someone calls irrelevant must be pointed to the line that already contains it."),
            P("指不出来，就补进工具箱再算一次。", "If you cannot point to it, add it in the calculator and run the formula again."),
          ], "/tools"),
        ],
      },
    ],
  },
  {
    id: "data",
    title: bi("数据分析与决策", "Analysis and decisions"),
    summary: bi("用数据驱动决策，优化业务表现。", "Use the numbers you can trace to change a decision."),
    level: "practice",
    icon: "data",
    chapters: [
      {
        id: "data-a",
        title: bi("口径", "Definitions"),
        lessons: [
          lesson("dat-01", "每张卡片都要能指回流水", "Every card should point at the ledger", [
            P("销售额、订单、客单价、转化率来自同一段时间。", "Revenue, orders, AOV, and conversion share one time range."),
            P("改时间范围，四张卡一起变。", "Change the range and all four cards move."),
            P("对不上的仪表盘不要拿来做决定。", "Do not decide from a dashboard that does not reconcile."),
          ], "/sim/dashboard"),
          lesson("dat-02", "转化率的分母是访客", "Conversion uses visitors as the denominator", [
            P("演示店按约 3.68% 的转化假设生成访客数。", "The demo store generates visitors from about a 3.68% conversion assumption."),
            P("订单变了，访客和转化率的关系仍然成立。", "When orders change, the relationship with visitors still holds."),
            P("不要用点击数代替访客来汇报转化。", "Do not report conversion with clicks in place of visitors."),
          ], "/sim/dashboard"),
          lesson("dat-03", "客单价要和退货一起看", "Read AOV next to returns", [
            P("退款会把净销售额拉低。", "Refunds pull net sales down."),
            P("只看成交价会高估客单。", "Sticker price alone overstates the order value you keep."),
            P("流水里把销售和退款分行写清。", "The ledger keeps sales and refunds on separate rows."),
          ], "/glossary?term=aov"),
          lesson("dat-04", "广告口径单独存放", "Keep the ad definition in its own place", [
            P("归因销售可以大于或小于你对“广告带来的”的直觉。", "Attributed sales can be higher or lower than your intuition about what ads caused."),
            P("总销售以订单为准。", "Total sales follow orders."),
            P("引用数字时带上口径。", "Name the definition when you quote a number."),
          ], "/knowledge/dashboard-read"),
        ],
      },
      {
        id: "data-b",
        title: bi("比较", "Comparisons"),
        lessons: [
          lesson("dat-05", "和上一周比，而不是和感觉比", "Compare with last week, not with a feeling", [
            P("折线展示每天的销售额。", "The line shows revenue by day."),
            P("单日下跌先看是不是断货或暂停了广告。", "A one-day drop: check stockout or a paused campaign first."),
            P("没有原因的下跌，再看是不是随机波动。", "If there is no cause, then consider noise."),
          ], "/sim/dashboard"),
          lesson("dat-06", "结构比总额更早报警", "Mix warns you earlier than the total", [
            P("销售额还在涨，广告占比已经变重，是危险的涨。", "Revenue can rise while ads become a heavier share. That rise is dangerous."),
            P("看成本环，不只看左上角的销售额。", "Read the cost ring, not only revenue in the corner."),
            P("结构恶化时，停止放大。", "When the mix gets worse, stop scaling."),
          ], "/sim/dashboard"),
          lesson("dat-07", "商品之间比真实利润", "Compare products on true profit", [
            P("综合分用于找候选。", "The overall score finds candidates."),
            P("候选之间用真实利润和资金占用比较。", "Compare candidates on true profit and cash tied up."),
            P("月毛利高、真实利润薄的商品，排序会骗人。", "High monthly gross profit and thin true profit is how a sort lies."),
          ], "/sim/selection?focus=profit"),
          lesson("dat-08", "供应商之间比风险，不比一句口头承诺", "Compare suppliers on risk, not on a verbal promise", [
            P("五维风险和证照放在同一张卡片上。", "Five risk bars and the certificates sit on one card."),
            P("单价最低往往合规最差。", "The lowest unit cost is often the worst compliance."),
            P("高风险可以下单，但必须显式确认，系统不会替你忘记。", "A high-risk order is allowed only with an explicit confirmation. The system will not forget it for you."),
          ], "/sim/procurement"),
          lesson("dat-09", "活动之间比可行动的差异", "Compare campaigns on a difference you can act on", [
            P("同样 ACoS，花费更大的活动影响现金更多。", "At the same ACoS, the campaign with more spend moves cash more."),
            P("暂停状态的活动不再累积。", "Paused campaigns stop accumulating."),
            P("新建活动先和现有活动比，而不是和理想比。", "Compare a new campaign with the ones you have, not with an ideal."),
          ], "/sim/ads"),
          lesson("dat-10", "时间范围要写在结论里", "Write the time range into the conclusion", [
            P("近 7 天和全部历史可以讲出相反的故事。", "The last 7 days and all history can tell opposite stories."),
            P("看板的范围选择器决定卡片和流水。", "The dashboard range drives both the cards and the ledger."),
            P("导出文件名里带上范围。", "Put the range in the export filename."),
          ], "/sim/dashboard"),
        ],
      },
      {
        id: "data-c",
        title: bi("做决定", "Decisions"),
        lessons: [
          lesson("dat-11", "一个决定只改一个杠杆", "One decision moves one lever", [
            P("同时改价格、广告和供应商，就无法复盘。", "Change price, ads, and supplier together and you cannot review."),
            P("模拟里最清楚的杠杆是：采购、发布、暂停广告、推进日期。", "The clearest levers here are purchasing, publishing, pausing ads, and advancing the date."),
            P("每次推进后只回答一个问题。", "After each advance, answer one question."),
          ], "/sim/dashboard"),
          lesson("dat-12", "样本太小就不要放大", "Do not scale a tiny sample", [
            P("几个订单不能证明转化稳定。", "A handful of orders does not prove stable conversion."),
            P("演示店的历史是为了让你有东西可看，不是你的成绩。", "The demo history exists so you have something to read. It is not your result."),
            P("你自己的新链接，要等模拟日积累订单。", "Your own new listing has to accumulate orders across simulated days."),
          ], "/sim/ads"),
          lesson("dat-13", "异常先查口径", "Check the definition before the story", [
            P("数字奇怪时，先问它是订单、归因还是展示汇率。", "When a number looks strange, ask if it is orders, attribution, or the display rate."),
            P("然后才找业务原因。", "Then look for a business cause."),
            P("知识库的看板文章按这个顺序写。", "The dashboard article in the knowledge base follows that order."),
          ], "/knowledge/dashboard-read"),
          lesson("dat-14", "把决定写成如果—就", "Write the decision as if-then", [
            P("如果真实利润为负，就不采购。", "If true profit is negative, do not purchase."),
            P("如果链接被抑制，就不创建广告。", "If the listing is suppressed, do not create an ad."),
            P("如果 ACoS 高于你的死线，就暂停并复盘词。", "If ACoS is above your kill line, pause and review the terms."),
          ], "/sim/selection"),
          lesson("dat-15", "可视化是为了比较", "Charts exist for comparison", [
            P("折线看趋势，环图看结构，表格看明细。", "The line is trend, the ring is mix, the table is detail."),
            P("三者缺一，结论容易被一张图带走。", "Drop one of them and a single chart can kidnap the conclusion."),
            P("看板把三样放在同一页。", "The dashboard keeps all three on one page."),
          ], "/sim/dashboard"),
          lesson("dat-16", "复盘模板", "A review template", [
            P("范围、销售额、成本结构、一个异常、一个下一步。", "Range, revenue, cost mix, one exception, one next step."),
            P("下一步必须落到采购、链接或广告的一个动作。", "The next step has to be one action in procurement, the listing, or ads."),
            P("没有下一步的复盘只是朗读数字。", "A review without a next step is reading numbers aloud."),
          ], "/sim/dashboard"),
        ],
      },
    ],
  },
  {
    id: "service",
    title: bi("客户服务与留存", "Service and retention"),
    summary: bi("提升客户体验，增强复购与口碑。", "Improve the experience that drives repeat purchase and reviews."),
    level: "practice",
    icon: "service",
    chapters: [
      {
        id: "svc-a",
        title: bi("差评从哪里来", "Where negative reviews come from"),
        lessons: [
          lesson("svc-01", "客服补不上履约的洞", "Support cannot patch a fulfillment hole", [
            P("承诺了做不到的时效，话术没有用。", "A delivery promise you cannot keep makes the script useless."),
            P("先改链接上的承诺，再练回复。", "Change the promise on the listing before you practice replies."),
            P("物流课和这节是一对。", "This lesson pairs with the logistics course."),
          ], "/learn/logistics/log-14"),
          lesson("svc-02", "退货原因要回写到选品", "Return reasons go back to selection", [
            P("反复出现的尺寸问题，不是客服问题。", "A repeated size complaint is not a support problem."),
            P("它应该变成下一版的差异化或直接淘汰。", "It should become the next version's difference, or a reason to drop the product."),
            P("在选品详情里调高退货率，看利润还在不在。", "Raise the return rate on the product and see if profit survives."),
          ], "/tools"),
          lesson("svc-03", "回复速度解决不了商品缺陷", "Reply speed does not fix a defect", [
            P("缺陷商品回复得越快，差评来得越整齐。", "A defective product with fast replies just collects negative reviews neatly."),
            P("先停广告，再处理库存。", "Pause ads, then deal with the stock."),
            P("不要用优惠券掩盖质量问题。", "Do not cover a quality issue with a coupon."),
          ], "/sim/ads"),
          lesson("svc-04", "问答区是廉价的说明书", "Questions are a cheap manual", [
            P("重复的问题应该写进五点。", "A repeated question belongs in the bullets."),
            P("写进五点可以减少客服，也可以减少退货。", "Putting it in the bullets cuts support and returns."),
            P("批量上架后检查标题是否回答了用途。", "After batch listing, check whether the title says what the product is for."),
          ], "/sim/listings"),
          lesson("svc-05", "差评分类表", "A table for negative reviews", [
            P("物流、描述不符、质量、买家误用，四列就够。", "Shipping, not as described, quality, buyer misuse. Four columns are enough."),
            P("只有描述不符和质量应该回到产品和供应商。", "Only “not as described” and quality should go back to the product and the supplier."),
            P("买家误用要改说明书，而不是改价格。", "Buyer misuse needs better instructions, not a new price."),
          ], "/cases/colander-win"),
        ],
      },
      {
        id: "svc-b",
        title: bi("留存", "Retention"),
        lessons: [
          lesson("svc-06", "复购来自消耗品和配件", "Repeat purchase comes from consumables and parts", [
            P("耐用品不要用复购故事包装。", "Do not wrap a durable good in a repeat-purchase story."),
            P("配件链接要真的有库存。", "A parts listing needs real stock."),
            P("没有配件就不要在广告里承诺。", "If you do not have the part, do not promise it in ads."),
          ], "/sim/listings"),
          lesson("svc-07", "包装体验是退货率的一部分", "Unboxing is part of the return rate", [
            P("打开就破损，会同时伤害物流和质量两列。", "Arriving broken hits both the shipping column and the quality column."),
            P("包装成本进采购或物流，不要假装没有。", "Packaging cost goes into procurement or logistics. Do not pretend it is free."),
            P("用工具箱加上这笔再看利润。", "Add it in the calculator and reread profit."),
          ], "/tools"),
          lesson("svc-08", "索评不能代替好产品", "Review requests do not replace a good product", [
            P("真实平台对索评有规则。", "Real marketplaces have rules about review requests."),
            P("本模拟不提供索评按钮，避免练成违规习惯。", "This simulator has no review-request button, so you do not practice a violation."),
            P("评价增速课说过：增速反映的是体验，不是话术。", "The review-velocity lesson said it: velocity reflects the experience, not the script."),
          ], "/learn/market/mkt-04"),
          lesson("svc-09", "纠纷赔付写进退货成本", "Claim payouts belong in return cost", [
            P("公式里的纠纷赔付不是客服心情。", "Claim payouts in the formula are not a support mood."),
            P("它是钱。", "They are money."),
            P("赔付变多时，先看是不是描述不符。", "When payouts rise, check “not as described” first."),
          ], "/learn/sourcing/src-25"),
          lesson("svc-10", "客户原话进选品备忘录", "Customer words go into the selection memo", [
            P("备忘录里留一句真实差评。", "Keep one real negative sentence in the memo."),
            P("它比形容词更适合做下一版需求。", "It is a better requirement for the next version than an adjective."),
            P("没有差评样本的新品，用竞品差评代替。", "A new product without reviews borrows competitor complaints."),
          ], "/sim/selection"),
        ],
      },
      {
        id: "svc-c",
        title: bi("服务边界", "The edge of support"),
        lessons: [
          lesson("svc-11", "不承诺你控制不了的事", "Do not promise what you do not control", [
            P("海关和承运商不在你的话术管辖内。", "Customs and the carrier are outside your script."),
            P("页面上写清楚配送范围。", "State the delivery scope on the page."),
            P("含糊的全球包邮会变成纠纷。", "A vague worldwide-free-shipping line becomes a claim."),
          ], "/sim/listings"),
          lesson("svc-12", "补偿有上限", "Compensation has a ceiling", [
            P("上限是这件商品的真实利润，不是标价。", "The ceiling is the product's true profit, not the sticker price."),
            P("用补偿换好评是违规，也是亏钱。", "Trading compensation for a review is a violation and a loss."),
            P("本模拟不提供这种操作。", "This simulator does not offer that action."),
          ], "/help"),
          lesson("svc-13", "服务数据看退货，不看态度", "Service data is the return rate, not the tone", [
            P("态度无法在看板上下载。", "Tone cannot be downloaded from the dashboard."),
            P("退货可以。", "Returns can."),
            P("用退货数决定要不要继续卖。", "Use the return count to decide whether to keep selling."),
          ], "/sim/dashboard"),
          lesson("svc-14", "把常见问题写成文章", "Turn repeated questions into an article", [
            P("知识库适合放稳定的解释。", "The knowledge base is for explanations that stay true."),
            P("社区适合放这次模拟里发生的事。", "The community is for what happened in this simulation."),
            P("不要把一次性的订单问题写进课程。", "Do not write a one-off order problem into the course."),
          ], "/community"),
          lesson("svc-15", "服务复盘三问", "Three service questions", [
            P("这个差评能不能在下一单采购前修掉？", "Can this complaint be fixed before the next purchase order?"),
            P("修不掉，是否停止补货？", "If it cannot, do you stop replenishment?"),
            P("页面上还有没有在承诺它？", "Does the listing still promise it?"),
          ], "/sim/procurement"),
        ],
      },
    ],
  },
  {
    id: "ip",
    title: bi("知识产权与品牌保护", "Intellectual property and brand"),
    summary: bi("保护品牌资产，规避知识产权风险。", "Protect a brand and avoid intellectual property risk."),
    level: "foundation",
    icon: "ip",
    chapters: [
      {
        id: "ip-a",
        title: bi("别碰别人的权利", "Do not touch someone else's rights"),
        lessons: [
          lesson("ip-01", "大家都在卖不是授权", "Everyone sells it is not a license", [
            P("供应商的口头禅不能当授权书。", "A supplier's catchphrase is not a license."),
            P("合规风险一栏就是为这句话准备的。", "The compliance bar exists for that sentence."),
            P("高风险采购在发布时会被抑制。", "A high-risk purchase is suppressed when you publish."),
          ], "/sim/procurement"),
          lesson("ip-02", "商标、专利、版权是三件事", "Trademark, patent, and copyright are three things", [
            P("名字、结构、图片分别对应不同权利。", "The name, the structure, and the picture are different rights."),
            P("改一个字不等于避开商标。", "Changing one letter does not avoid a trademark."),
            P("本课不提供规避技巧，只提供停止的条件。", "This lesson does not teach evasion. It teaches when to stop."),
          ], "/glossary?term=ip-risk"),
          lesson("ip-03", "图片和文案也有权利人", "Images and copy have owners", [
            P("不要使用说不清来源的主图。", "Do not use a main image whose source you cannot explain."),
            P("批量标题模板只用你自己的品名和用途。", "The batch title template should use your own product name and use case."),
            P("案例库的抑制故事从采购开始，不是从文案开始。", "The suppression case starts at procurement, not at copy."),
          ], "/cases/bargain-suppress"),
          lesson("ip-04", "品牌备案之前不要印标", "Do not print a brand before it is filed", [
            P("包装上的标识会变成证据。", "A mark on the package becomes evidence."),
            P("先卖无品牌的合规商品，也可以。", "Selling a compliant unbranded product is allowed."),
            P("模拟器不会帮你生成商标证书。", "The simulator will not generate a trademark certificate."),
          ], "/help"),
          lesson("ip-05", "跟卖之前确认你有权利", "Confirm you have the right to sell on that listing", [
            P("共享 ASIN 共享评价，也共享投诉。", "A shared ASIN shares reviews and complaints."),
            P("没有授权的跟卖，不在本模拟的推荐路径里。", "Selling on a listing without authorization is not a recommended path here."),
            P("自建链接，用自己的 SKU。", "Build your own listing and your own SKU."),
          ], "/glossary?term=asin"),
        ],
      },
      {
        id: "ip-b",
        title: bi("保护自己", "Protect your own"),
        lessons: [
          lesson("ip-06", "把权利文件和采购单放在一起", "Keep rights documents with the purchase order", [
            P("检测报告、授权、发票应该能按 SKU 找到。", "Test reports, licenses, and invoices should be findable by SKU."),
            P("SKU 规则课已经要求编码追溯供应商。", "The SKU lesson already asked the code to trace the supplier."),
            P("找不到文件的库存，视为不可上架。", "Stock without documents is not listable."),
          ], "/sim/listings"),
          lesson("ip-07", "收到投诉先下架再申辩", "Take it down before you argue", [
            P("真实平台的投诉有时限。", "Real marketplace complaints have deadlines."),
            P("模拟里的抑制就是强制下架。", "Suppression in the simulator is the forced takedown."),
            P("申辩期间不要继续广告。", "Do not keep advertising while you appeal."),
          ], "/sim/ads"),
          lesson("ip-08", "品牌的价值是自然单，不是标志", "A brand's value is organic orders, not a logo", [
            P("关掉品牌广告后还有没有单，是检验。", "Orders that remain after the brand campaign pauses are the test."),
            P("没有自然单的标志，只是成本。", "A logo without organic orders is only a cost."),
            P("回到 TACoS 那一课看这个检验。", "Use the TACoS lesson for this test."),
          ], "/learn/growth/gro-10"),
          lesson("ip-09", "不要把竞品的名字写进标题", "Do not put a competitor's name in the title", [
            P("这是常见的投诉来源。", "It is a common source of complaints."),
            P("批量模板没有这个字段，不要手加。", "The batch template has no such field. Do not add one by hand."),
            P("比较可以放在自己的笔记里，不放在链接上。", "Comparisons can live in your notes, not on the listing."),
          ], "/sim/listings"),
          lesson("ip-10", "设计专利看结构，不看名字", "Design rights look at the structure, not the name", [
            P("外观几乎一样，改名没有用。", "If the appearance matches, a new name does nothing."),
            P("做不到结构差异，就换商品。", "If you cannot change the structure, change products."),
            P("选品清单的否决原因可以写成“权利不清”。", "The shortlist kill reason can be “rights are unclear”."),
          ], "/sim/selection"),
        ],
      },
      {
        id: "ip-c",
        title: bi("团队习惯", "Team habits"),
        lessons: [
          lesson("ip-11", "采购有否决权", "Procurement can veto", [
            P("单价优势不能压过合规否决。", "A unit-price advantage does not overrule a compliance veto."),
            P("高风险确认框是留痕，不是鼓励。", "The high-risk checkbox is a record, not encouragement."),
            P("管理员把合规权重调高后，更多供应商会跨过阈值。", "After an admin raises the compliance weight, more suppliers cross the threshold."),
          ], "/admin"),
          lesson("ip-12", "上架有第二道门槛", "Publishing is a second gate", [
            P("即使货已经入库，抑制仍然发生。", "Suppression still happens after the goods are received."),
            P("库存因此变成资金占用。", "The stock then becomes tied-up cash."),
            P("这是案例要你记住的成本。", "That cost is what the case asks you to remember."),
          ], "/cases/bargain-suppress"),
          lesson("ip-13", "外部素材先问来源", "Ask where external assets came from", [
            P("社区里也不要粘贴说不清来源的图片。", "Do not paste images of unclear origin into the community either."),
            P("本系统的商品图是生成的色块，不是实拍素材。", "Product art in this system is generated color, not a photograph you can reuse."),
            P("真实业务使用实拍或有授权的图。", "A real business uses its own photos or licensed ones."),
          ], "/community"),
          lesson("ip-14", "知识产权复核清单", "The intellectual property checklist", [
            P("名称、图片、结构、授权、发票，五件套齐全才发布。", "Name, images, structure, license, invoice. Publish when all five are present."),
            P("缺任何一件，保持草稿。", "If any one is missing, keep the draft."),
            P("草稿不会烧广告。", "A draft does not spend ad budget."),
          ], "/sim/listings"),
        ],
      },
    ],
  },
  {
    id: "capstone",
    title: bi("进阶实战项目", "Capstone"),
    summary: bi("综合应用所学，完成真实项目挑战。", "Use the whole chain on one product and write down the decision."),
    level: "advanced",
    icon: "capstone",
    chapters: [
      {
        id: "cap-a",
        title: bi("选择对象", "Choose the product"),
        lessons: [
          lesson("cap-01", "从家居厨房开始，或说明为什么不", "Start in Home & Kitchen, or say why not", [
            P("默认筛选就是这个类目，方便和演示店对照。", "The default filter is this category so you can compare with the demo store."),
            P("换类目可以，但要在笔记里写原因。", "You may switch categories. Write the reason."),
            P("不要同时做五个项目。", "Do not run five projects at once."),
          ], "/sim/selection"),
          lesson("cap-02", "锁定价格带", "Lock a price band", [
            P("用价格滑块而不是感觉。", "Use the price slider, not a feeling."),
            P("记下你锁定的区间。", "Write down the band you locked."),
            P("后面的供应商如果进不了这个区间，就换商品。", "If a later supplier cannot fit the band, change products."),
          ], "/sim/selection"),
          lesson("cap-03", "读综合分，但打开瀑布", "Read the score, then open the waterfall", [
            P("综合分负责排序。", "The overall score sorts."),
            P("瀑布负责否决。", "The waterfall vetoes."),
            P("把否决的商品也留在笔记里，避免下周又捡回来。", "Keep rejected products in your notes so you do not pick them up next week."),
          ], "/sim/selection?focus=profit"),
          lesson("cap-04", "只把通过的放进清单", "Shortlist only what passed", [
            P("清单不是收藏夹。", "The shortlist is not a wishlist."),
            P("通过的标准是真实利润为正，且你能说清差别。", "The bar is positive true profit and a difference you can explain."),
            P("说不清就移出清单。", "If you cannot explain it, remove it."),
          ], "/sim/selection"),
        ],
      },
      {
        id: "cap-b",
        title: bi("买到能上架的货", "Buy goods you can list"),
        lessons: [
          lesson("cap-05", "三家供应商都要看完", "Read all three suppliers", [
            P("不要只点单价最低的那张卡。", "Do not click only the cheapest card."),
            P("证照、交期、起订量、风险分一起看。", "Read certificates, lead time, MOQ, and the risk score together."),
            P("写下一句你选它的原因。", "Write one sentence on why you chose it."),
          ], "/sim/procurement"),
          lesson("cap-06", "试销单用短交期", "The test order uses the short lead time", [
            P("两天交期的供应商适合第一单。", "The two-day supplier fits the first order."),
            P("数量不要超过起订量太多。", "Do not go far beyond the MOQ."),
            P("高风险必须确认，不建议用于试销。", "High risk requires confirmation and is a poor test."),
          ], "/sim/procurement"),
          lesson("cap-07", "推进时钟直到入库", "Advance the clock until it is received", [
            P("在途时去看广告页，确认你还没有空烧预算。", "While it is in transit, check ads and confirm you are not spending on nothing."),
            P("入库状态变成已收货后才能发布。", "Publish only after the status is received."),
            P("如果交期比你想的长，回来改数量假设。", "If the lead time is longer than you hoped, go back and change the quantity assumption."),
          ], "/sim/procurement"),
          lesson("cap-08", "核对这一单的真实成本", "Check this order's real cost", [
            P("用成交单价替换商品默认成本，再看瀑布。", "Replace the default unit cost with the price you actually got, then reread the waterfall."),
            P("节省的单价如果来自高风险，不算节省。", "A lower price from high risk does not count as a saving."),
            P("工具箱可以临时改成本而不影响全店参数。", "The calculator can change cost for one exercise without changing store parameters."),
          ], "/tools"),
        ],
      },
      {
        id: "cap-c",
        title: bi("上架和流量", "List and advertise"),
        lessons: [
          lesson("cap-09", "用模板生成，然后读一遍标题", "Generate from the template, then read the title", [
            P("模板会把品名放在前面。", "The template leads with the product name."),
            P("读起来像广告法风险或竞品名，就改草稿。", "If it reads like a claim risk or a competitor name, edit the draft."),
            P("不要发布没读过的行。", "Do not publish a row you have not read."),
          ], "/sim/listings"),
          lesson("cap-10", "只发布有库存且未抑制的", "Publish only what is in stock and not suppressed", [
            P("抑制行留在表上当教训。", "Leave suppressed rows on the table as the lesson."),
            P("草稿可以留到货齐。", "Drafts can wait until stock is complete."),
            P("发布后回到清单，确认状态是在售。", "After publishing, confirm the status is live."),
          ], "/sim/listings"),
          lesson("cap-11", "用小预算建一条商品推广", "Create one Sponsored Products campaign with a small budget", [
            P("只选你刚刚发布的 SKU。", "Select only the SKU you just published."),
            P("日预算用你算得起的数。", "Use a daily budget you can afford."),
            P("不要第一天就开品牌活动和展示活动。", "Do not open Sponsored Brands and Sponsored Display on day one."),
          ], "/sim/ads"),
          lesson("cap-12", "推进七天再看", "Advance seven days, then look", [
            P("一天不够判断。", "One day is not a judgment."),
            P("看花费是否增加、是否有订单、库存是否下降。", "See whether spend grew, whether orders exist, and whether stock fell."),
            P("七天按钮在模拟页的链路条上。", "The seven-day control sits on the chain bar."),
          ], "/sim/dashboard"),
        ],
      },
      {
        id: "cap-d",
        title: bi("决定放大还是停止", "Scale or stop"),
        lessons: [
          lesson("cap-13", "用四张卡做复盘", "Review with the four cards", [
            P("销售额、订单、客单价、转化率。", "Revenue, orders, AOV, conversion."),
            P("说出它们和七天前有什么不同。", "Say what changed versus seven days earlier."),
            P("说不出不同，就不要放大。", "If you cannot say what changed, do not scale."),
          ], "/sim/dashboard"),
          lesson("cap-14", "看成本环里广告有没有变重", "See whether ads got heavier in the ring", [
            P("销售额上涨但广告占比更重，先暂停放大。", "If revenue rose and ads became a heavier share, pause scaling."),
            P("打开活动表对一下花费。", "Check spend on the campaign table."),
            P("口径不同就在笔记里写明。", "If the definitions differ, write that down."),
          ], "/sim/ads"),
          lesson("cap-15", "库存还够不够下一个七天", "Does stock cover the next seven days", [
            P("不够就先补货或停广告。", "If not, replenish or pause ads."),
            P("补货回到同一家通过复核的供应商。", "Replenish from the same supplier that passed review."),
            P("不要在补货时临时改成低价工贸。", "Do not switch to the bargain trader at replenishment time."),
          ], "/sim/procurement"),
          lesson("cap-16", "写出如果—就", "Write the if-then", [
            P("如果真实利润仍为正且转化稳定，就按七天销量补一轮。", "If true profit is still positive and conversion is stable, replenish one week of sales."),
            P("如果为负或链接被抑制，就停止并记录原因。", "If it is negative or the listing is suppressed, stop and record why."),
            P("把这句话发到社区。", "Post that sentence in the community."),
          ], "/community"),
        ],
      },
      {
        id: "cap-e",
        title: bi("收尾", "Close the project"),
        lessons: [
          lesson("cap-17", "导出流水和术语表", "Export the ledger and the glossary", [
            P("流水证明你的看板。", "The ledger proves the dashboard."),
            P("术语表留给以后的自己。", "The glossary is for your later self."),
            P("两个导出都在对应页面的页脚。", "Both exports sit in the footer of their pages."),
          ], "/sim/dashboard"),
          lesson("cap-18", "回到公式，换一个参数", "Return to the formula and change one parameter", [
            P("只改退货率或广告占比。", "Change only the return rate or the ad ratio."),
            P("看决定有没有翻转。", "See whether the decision flips."),
            P("翻转了，说明这条链接太脆，不要当作成绩。", "If it flips, the listing is fragile. Do not treat it as a result."),
          ], "/tools"),
          lesson("cap-19", "整理一页项目说明", "Write a one-page project note", [
            P("商品、供应商、数量、真实利润、广告结果、下一步。", "Product, supplier, quantity, true profit, ad result, next step."),
            P("一页写不下，说明你还没决定。", "If it does not fit on one page, you have not decided."),
            P("可以贴在社区，不要贴上别人的图片。", "You may post it in the community. Do not attach someone else's images."),
          ], "/community"),
          lesson("cap-20", "完成之后再领证书", "The certificate comes after the work", [
            P("证书只表示课时都被标记完成。", "The certificate only means every lesson was marked complete."),
            P("它不表示真实平台的业绩。", "It does not represent performance on a real marketplace."),
            P("到证书中心查看。", "See it in the certificate center."),
          ], "/certificates"),
        ],
      },
    ],
  },
];

export const COURSE_DONE: Record<string, number> = {
  market: 12,
  sourcing: 9,
  store: 6,
  growth: 4,
  logistics: 11,
  finance: 5,
  data: 8,
  service: 3,
  ip: 2,
  capstone: 0,
};

export function courseLessons(course: Course) {
  return course.chapters.flatMap((chapter) => chapter.lessons);
}

export function courseById(id: string) {
  return COURSES.find((course) => course.id === id);
}

export function findLesson(courseId: string, lessonId: string) {
  const course = courseById(courseId);
  if (!course) return undefined;
  const lessons = courseLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) return undefined;
  return { course, lessons, index, lesson: lessons[index] };
}

for (const course of COURSES) {
  const count = courseLessons(course).length;
  const ids = new Set<string>();
  for (const lesson of courseLessons(course)) {
    if (ids.has(lesson.id)) throw new Error(`Duplicate lesson ${lesson.id}`);
    ids.add(lesson.id);
  }
  const expected: Record<string, number> = {
    market: 15,
    sourcing: 15,
    store: 15,
    growth: 16,
    logistics: 16,
    finance: 16,
    data: 16,
    service: 15,
    ip: 14,
    capstone: 20,
  };
  if (count !== expected[course.id]) {
    throw new Error(`Course ${course.id} has ${count} lessons, expected ${expected[course.id]}`);
  }
  if (COURSE_DONE[course.id] > count) throw new Error(`Progress overflow ${course.id}`);
}
