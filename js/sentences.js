/* 英语听写句库 —— 按难度与场景分类
   level: 1 初级 / 2 中级 / 3 高级 */
const SENTENCE_LIB = [
  // ===== 初级 · 日常问候 =====
  { text: "Good morning, everyone.", zh: "大家早上好。", level: 1, cat: "日常问候" },
  { text: "How are you doing today?", zh: "你今天过得怎么样？", level: 1, cat: "日常问候" },
  { text: "Nice to meet you.", zh: "很高兴认识你。", level: 1, cat: "日常问候" },
  { text: "Long time no see.", zh: "好久不见。", level: 1, cat: "日常问候" },
  { text: "Have a nice day.", zh: "祝你今天愉快。", level: 1, cat: "日常问候" },
  { text: "See you tomorrow.", zh: "明天见。", level: 1, cat: "日常问候" },
  { text: "What's your name?", zh: "你叫什么名字？", level: 1, cat: "日常问候" },
  { text: "Where are you from?", zh: "你来自哪里？", level: 1, cat: "日常问候" },

  // ===== 初级 · 生活场景 =====
  { text: "I get up at seven every morning.", zh: "我每天早上七点起床。", level: 1, cat: "生活场景" },
  { text: "I like apples and bananas.", zh: "我喜欢苹果和香蕉。", level: 1, cat: "生活场景" },
  { text: "The weather is nice today.", zh: "今天天气很好。", level: 1, cat: "生活场景" },
  { text: "This is my best friend.", zh: "这是我最好的朋友。", level: 1, cat: "生活场景" },
  { text: "My birthday is in June.", zh: "我的生日在六月。", level: 1, cat: "生活场景" },
  { text: "She has two cats and a dog.", zh: "她有两只猫和一只狗。", level: 1, cat: "生活场景" },
  { text: "We go to school by bus.", zh: "我们坐公交车上学。", level: 1, cat: "生活场景" },
  { text: "I usually drink milk for breakfast.", zh: "我早餐通常喝牛奶。", level: 1, cat: "生活场景" },

  // ===== 初级 · 学习教育 =====
  { text: "Open your books, please.", zh: "请打开你们的书。", level: 1, cat: "学习教育" },
  { text: "I don't understand this word.", zh: "我不明白这个单词。", level: 1, cat: "学习教育" },
  { text: "Can you say that again, please?", zh: "请你再说一遍好吗？", level: 1, cat: "学习教育" },
  { text: "English is my favorite subject.", zh: "英语是我最喜欢的科目。", level: 1, cat: "学习教育" },
  { text: "We have an English class on Monday.", zh: "我们周一有一节英语课。", level: 1, cat: "学习教育" },
  { text: "How do you spell this word?", zh: "这个单词怎么拼？", level: 1, cat: "学习教育" },

  // ===== 中级 · 生活场景 =====
  { text: "Could you tell me where the nearest bank is?", zh: "你能告诉我最近的银行在哪里吗？", level: 2, cat: "生活场景" },
  { text: "I'd like to book a table for two.", zh: "我想预订一张两人桌。", level: 2, cat: "生活场景" },
  { text: "It takes about twenty minutes to walk there.", zh: "步行到那里大约需要二十分钟。", level: 2, cat: "生活场景" },
  { text: "I'm looking for a gift for my mother.", zh: "我在给我妈妈找一份礼物。", level: 2, cat: "生活场景" },
  { text: "The meeting has been put off until Friday.", zh: "会议被推迟到周五了。", level: 2, cat: "生活场景" },
  { text: "Remember to take your umbrella with you.", zh: "记得随身带上雨伞。", level: 2, cat: "生活场景" },
  { text: "I usually do some exercise after work.", zh: "我下班后通常会做些运动。", level: 2, cat: "生活场景" },
  { text: "Would you mind opening the window?", zh: "你介意打开窗户吗？", level: 2, cat: "生活场景" },

  // ===== 中级 · 职场沟通 =====
  { text: "I'll send you an email this afternoon.", zh: "我今天下午会给你发邮件。", level: 2, cat: "职场沟通" },
  { text: "Let's discuss the details in the meeting.", zh: "我们在会上讨论细节吧。", level: 2, cat: "职场沟通" },
  { text: "Sorry, I didn't catch what you said.", zh: "抱歉，我没听清你说的话。", level: 2, cat: "职场沟通" },
  { text: "The report is due at the end of this month.", zh: "报告要在本月底前交。", level: 2, cat: "职场沟通" },
  { text: "I'm afraid I have to disagree with you.", zh: "恐怕我不同意你的看法。", level: 2, cat: "职场沟通" },
  { text: "Could we reschedule our appointment?", zh: "我们能改约时间吗？", level: 2, cat: "职场沟通" },
  { text: "Thanks for your hard work on this project.", zh: "感谢你在这个项目上的努力。", level: 2, cat: "职场沟通" },
  { text: "Please let me know if you have any questions.", zh: "有任何问题请告诉我。", level: 2, cat: "职场沟通" },

  // ===== 中级 · 旅行出行 =====
  { text: "Excuse me, how can I get to the train station?", zh: "打扰一下，请问火车站怎么走？", level: 2, cat: "旅行出行" },
  { text: "I'd like a one-way ticket to Shanghai.", zh: "我想要一张去上海的单程票。", level: 2, cat: "旅行出行" },
  { text: "What time does the flight take off?", zh: "航班几点起飞？", level: 2, cat: "旅行出行" },
  { text: "Is breakfast included in the room rate?", zh: "房费里包含早餐吗？", level: 2, cat: "旅行出行" },
  { text: "I missed my connecting flight.", zh: "我错过了转机航班。", level: 2, cat: "旅行出行" },
  { text: "The museum is worth visiting.", zh: "这个博物馆值得参观。", level: 2, cat: "旅行出行" },
  { text: "Do you accept credit cards?", zh: "你们接受信用卡吗？", level: 2, cat: "旅行出行" },

  // ===== 中级 · 情感表达 =====
  { text: "I'm so proud of you.", zh: "我为你感到骄傲。", level: 2, cat: "情感表达" },
  { text: "Don't worry, everything will be fine.", zh: "别担心，一切都会好起来的。", level: 2, cat: "情感表达" },
  { text: "I really appreciate your help.", zh: "我非常感谢你的帮助。", level: 2, cat: "情感表达" },
  { text: "That sounds like a great idea.", zh: "那听起来是个好主意。", level: 2, cat: "情感表达" },
  { text: "I couldn't agree more.", zh: "我完全同意。", level: 2, cat: "情感表达" },
  { text: "It's kind of you to say that.", zh: "你这么说真好。", level: 2, cat: "情感表达" },

  // ===== 高级 · 职场沟通 =====
  { text: "We need to come up with a more practical solution.", zh: "我们需要想出一个更切实可行的方案。", level: 3, cat: "职场沟通" },
  { text: "The deadline has been moved forward to next Wednesday.", zh: "截止日期提前到了下周三。", level: 3, cat: "职场沟通" },
  { text: "I was wondering if you could give me some feedback.", zh: "我在想你是否能给我一些反馈。", level: 3, cat: "职场沟通" },
  { text: "Our team has made significant progress this quarter.", zh: "我们团队本季度取得了显著进展。", level: 3, cat: "职场沟通" },
  { text: "Let me double-check the figures before we publish them.", zh: "发布之前让我再核实一下数据。", level: 3, cat: "职场沟通" },
  { text: "It would be better if we could reach a compromise.", zh: "如果我们能达成妥协会更好。", level: 3, cat: "职场沟通" },

  // ===== 高级 · 生活场景 =====
  { text: "The earlier you start, the more time you will have.", zh: "你开始得越早，拥有的时间就越多。", level: 3, cat: "生活场景" },
  { text: "There is no point in arguing about such a small thing.", zh: "为这么小的事争论毫无意义。", level: 3, cat: "生活场景" },
  { text: "She has been learning English for more than ten years.", zh: "她学英语已经十多年了。", level: 3, cat: "生活场景" },
  { text: "It never occurred to me that he might be lying.", zh: "我从没想到他可能在撒谎。", level: 3, cat: "生活场景" },
  { text: "The more I think about it, the less I like the idea.", zh: "我越想越不喜欢这个主意。", level: 3, cat: "生活场景" },
  { text: "Nobody knows what will happen in the future.", zh: "没有人知道将来会发生什么。", level: 3, cat: "生活场景" },

  // ===== 高级 · 情感表达 =====
  { text: "Actions speak louder than words.", zh: "行动胜于言语。", level: 3, cat: "情感表达" },
  { text: "Where there is a will, there is a way.", zh: "有志者事竟成。", level: 3, cat: "情感表达" },
  { text: "I would rather stay at home than go shopping.", zh: "我宁愿待在家里也不想去购物。", level: 3, cat: "情感表达" },
  { text: "Practice makes perfect, so keep working on it.", zh: "熟能生巧，所以继续努力吧。", level: 3, cat: "情感表达" },
  { text: "Never put off till tomorrow what you can do today.", zh: "今日事今日毕。", level: 3, cat: "情感表达" },
  { text: "The best way to learn a language is to use it every day.", zh: "学语言最好的方法就是每天使用它。", level: 3, cat: "情感表达" },
];
