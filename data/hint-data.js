/**
 * 语义缝合师 — 提示系统攻略路径数据
 * 每个 Stage 定义一组有序的 hint_steps，系统根据玩家已完成的操作选择下一步提示
 *
 * step 结构：
 *   id          {string}  步骤唯一标识
 *   type        {string}  'extract'（提取关键词）| 'combine'（合成）| 'sensory'（感官重构合成）
 *                         | 'submit'（提交）| 'contradiction'（矛盾标记）| 'meta'（Meta入侵）
 *   description {string}  用于调试/日志
 *   npc_hint    {string}  NPC 台词提示（气泡显示）
 *
 *   对话关键词高亮（type='extract'）：
 *     target_words  {Array<string>}  在当前对话中高亮闪烁的词
 *
 *   推演板卡片高亮（type='combine'|'sensory'|'submit'|'contradiction'|'meta'）：
 *     target_cards  {Array<string>}  推演板上需要高亮的卡片文本
 *     target_skills {Array<string>}  技能卡栏需要高亮的技能名（用于感官重构）
 *
 *   完成条件（满足后跳到下一步）：
 *     done_when     {Object}  { type: 'card_extracted'|'card_on_board'|'card_submitted'
 *                                     |'contradiction_flagged'|'meta_used', value: string }
 */
var HINT_DATA = {

  // ===================== Trial 1：快递员的秘密 =====================

  "trial_1": {

    "stage_01": {
      "hint_steps": [
        {
          "id": "t1s1_extract_rain",
          "type": "extract",
          "description": "提取「大雨」「没有灯的巷子」",
          "target_words": ["大雨", "没有灯的巷子"],
          "npc_hint": "「……这些字，好像会发光。你能不能……先把它们拿出来？」",
          "done_when": { "type": "card_on_board", "value": "大雨" }
        },
        {
          "id": "t1s1_extract_alley",
          "type": "extract",
          "description": "提取「没有灯的巷子」",
          "target_words": ["没有灯的巷子"],
          "npc_hint": "「还有那个……没有灯的巷子。那里也有什么东西。」",
          "done_when": { "type": "card_on_board", "value": "没有灯的巷子" }
        },
        {
          "id": "t1s1_sensory_rain",
          "type": "sensory",
          "description": "大雨 + 听觉重构 → 雨滴敲击声",
          "target_cards": ["大雨"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那场雨……你能帮我把声音找回来吗？试试那个听觉的方法。」",
          "done_when": { "type": "card_on_board", "value": "雨滴敲击声" }
        },
        {
          "id": "t1s1_sensory_alley",
          "type": "sensory",
          "description": "没有灯的巷子 + 嗅觉重构 → 刺鼻的福尔马林味",
          "target_cards": ["没有灯的巷子"],
          "target_skills": ["嗅觉重构"],
          "npc_hint": "「那条巷子里有股味道……用嗅觉去重构它？」",
          "done_when": { "type": "card_on_board", "value": "刺鼻的福尔马林味" }
        },
        {
          "id": "t1s1_combine",
          "type": "combine",
          "description": "雨滴敲击声 + 刺鼻的福尔马林味 → 废弃诊所的后巷",
          "target_cards": ["雨滴敲击声", "刺鼻的福尔马林味"],
          "npc_hint": "「声音和气味……把它们放在一起，也许能看到那个地方。」",
          "done_when": { "type": "card_on_board", "value": "废弃诊所的后巷" }
        },
        {
          "id": "t1s1_submit",
          "type": "submit",
          "description": "提交「废弃诊所的后巷」",
          "target_cards": ["废弃诊所的后巷"],
          "npc_hint": "「这个……就是那个地方。我觉得你可以把它交出去了。」",
          "done_when": { "type": "card_submitted", "value": "废弃诊所的后巷" }
        }
      ]
    },

    "stage_02": {
      "hint_steps": [
        {
          "id": "t1s2_extract_flash",
          "type": "extract",
          "description": "提取「闪了一下光」「剥落的纸片」",
          "target_words": ["闪了一下光", "剥落的纸片"],
          "npc_hint": "「那道光……还有墙上的东西，好像很重要。」",
          "done_when": { "type": "card_on_board", "value": "闪了一下光" }
        },
        {
          "id": "t1s2_extract_paper",
          "type": "extract",
          "description": "提取「剥落的纸片」",
          "target_words": ["剥落的纸片"],
          "npc_hint": "「墙上那张纸……你能不能也把它拿出来？」",
          "done_when": { "type": "card_on_board", "value": "剥落的纸片" }
        },
        {
          "id": "t1s2_sensory_flash",
          "type": "sensory",
          "description": "闪了一下光 + 视觉重构 → 金属反光",
          "target_cards": ["闪了一下光"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那道光是金属的反光……用视觉重构看清楚它。」",
          "done_when": { "type": "card_on_board", "value": "金属反光" }
        },
        {
          "id": "t1s2_sensory_paper",
          "type": "sensory",
          "description": "剥落的纸片 + 视觉重构 → 褪色的红十字标志",
          "target_cards": ["剥落的纸片"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那张纸上有标志……用视觉去看清楚它是什么。」",
          "done_when": { "type": "card_on_board", "value": "褪色的红十字标志" }
        },
        {
          "id": "t1s2_combine",
          "type": "combine",
          "description": "金属反光 + 褪色的红十字标志 → 铁盒的线索",
          "target_cards": ["金属反光", "褪色的红十字标志"],
          "npc_hint": "「金属反光和那个标志……放在一起，也许能告诉我铁盒是什么。」",
          "done_when": { "type": "card_on_board", "value": "铁盒的线索" }
        },
        {
          "id": "t1s2_submit",
          "type": "submit",
          "description": "提交「铁盒的线索」",
          "target_cards": ["铁盒的线索"],
          "npc_hint": "「这个线索……应该交出去了。」",
          "done_when": { "type": "card_submitted", "value": "铁盒的线索" }
        }
      ]
    },

    "stage_03": {
      "hint_steps": [
        {
          "id": "t1s3_extract_vibration",
          "type": "extract",
          "description": "提取「嗡嗡的震动声」「生锈的铁门」「小小的」",
          "target_words": ["嗡嗡的震动声", "生锈的铁门", "小小的"],
          "npc_hint": "「那里有声音……还有铁门。你先把这些都拿出来看看？」",
          "done_when": { "type": "card_on_board", "value": "嗡嗡的震动声" }
        },
        {
          "id": "t1s3_extract_door",
          "type": "extract",
          "description": "提取「生锈的铁门」",
          "target_words": ["生锈的铁门"],
          "npc_hint": "「那扇铁门……也很重要，把它拿出来。」",
          "done_when": { "type": "card_on_board", "value": "生锈的铁门" }
        },
        {
          "id": "t1s3_extract_small",
          "type": "extract",
          "description": "提取「小小的」",
          "target_words": ["小小的"],
          "npc_hint": "「还有那个……小小的，这个词很奇怪，一起拿出来看看。」",
          "done_when": { "type": "card_on_board", "value": "小小的" }
        },
        {
          "id": "t1s3_sensory_vibration",
          "type": "sensory",
          "description": "嗡嗡的震动声 + 听觉重构 → 冷冻库的压缩机",
          "target_cards": ["嗡嗡的震动声"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那个震动声……用听觉去重构，看看是什么机器在转。」",
          "done_when": { "type": "card_on_board", "value": "冷冻库的压缩机" }
        },
        {
          "id": "t1s3_sensory_door",
          "type": "sensory",
          "description": "生锈的铁门 + 嗅觉重构 → 消毒水与铁锈的混合气味",
          "target_cards": ["生锈的铁门"],
          "target_skills": ["嗅觉重构"],
          "npc_hint": "「那扇门上有气味……试试嗅觉重构。」",
          "done_when": { "type": "card_on_board", "value": "消毒水与铁锈的混合气味" }
        },
        {
          "id": "t1s3_contradiction",
          "type": "contradiction",
          "description": "标记矛盾：铁盒的线索 ↔ 小小的",
          "target_cards": ["铁盒的线索", "小小的"],
          "npc_hint": "「医生……你不觉得哪里很奇怪吗？⚡ 把那两张卡片标记一下，看看它们之间有什么矛盾。」",
          "done_when": { "type": "contradiction_flagged", "value": "trial1_weight" }
        },
        {
          "id": "t1s3_extract_hidden",
          "type": "extract",
          "description": "提取「死信箱」「交接点」（矛盾解锁后）",
          "target_words": ["死信箱", "交接点"],
          "npc_hint": "「有什么东西出现了……那两个发光的词，你能把它们拿出来吗？」",
          "done_when": { "type": "card_on_board", "value": "死信箱" }
        },
        {
          "id": "t1s3_extract_hidden2",
          "type": "extract",
          "description": "提取「交接点」",
          "target_words": ["交接点"],
          "npc_hint": "「还有「交接点」……也一起拿出来。」",
          "done_when": { "type": "card_on_board", "value": "交接点" }
        },
        {
          "id": "t1s3_combine_false",
          "type": "combine",
          "description": "冷冻库的压缩机 + 消毒水与铁锈的混合气味 → 地下冷冻室的铁盒",
          "target_cards": ["冷冻库的压缩机", "消毒水与铁锈的混合气味"],
          "npc_hint": "「那个声音和气味……合在一起，应该能找到铁盒藏的地方。」",
          "done_when": { "type": "card_on_board", "value": "地下冷冻室的铁盒" }
        },
        {
          "id": "t1s3_combine_true1",
          "type": "combine",
          "description": "死信箱 + 交接点 → 加密交接协议",
          "target_cards": ["死信箱", "交接点"],
          "npc_hint": "「死信箱和交接点……把它们放在一起，看看背后是什么协议。」",
          "done_when": { "type": "card_on_board", "value": "加密交接协议" }
        },
        {
          "id": "t1s3_combine_true2",
          "type": "combine",
          "description": "加密交接协议 + 地下冷冻室的铁盒 → 第七号死信箱的数据芯片",
          "target_cards": ["加密交接协议", "地下冷冻室的铁盒"],
          "npc_hint": "「把协议和铁盒放在一起……这里面装的根本不是音乐盒。」",
          "done_when": { "type": "card_on_board", "value": "第七号死信箱的数据芯片" }
        },
        {
          "id": "t1s3_submit",
          "type": "submit",
          "description": "提交真结论",
          "target_cards": ["第七号死信箱的数据芯片"],
          "npc_hint": "「这个……才是真相。你准备好提交了吗？」",
          "done_when": { "type": "card_submitted", "value": "第七号死信箱的数据芯片" }
        }
      ]
    }
  },

  // ===================== Trial 2：主妇的偏执 =====================

  "trial_2": {

    "stage_01": {
      "hint_steps": [
        {
          "id": "t2s1_extract",
          "type": "extract",
          "description": "提取「半夜不睡觉」「对着墙壁说话」「数据残影」",
          "target_words": ["半夜不睡觉", "对着墙壁说话", "数据残影"],
          "npc_hint": "「这几个词……好像很重要，你能不能先把它们拿出来？」",
          "done_when": { "type": "card_on_board", "value": "半夜不睡觉" }
        },
        {
          "id": "t2s1_extract_wall",
          "type": "extract",
          "description": "提取「对着墙壁说话」",
          "target_words": ["对着墙壁说话"],
          "npc_hint": "「对着墙壁说话……这个也很重要，拿出来。」",
          "done_when": { "type": "card_on_board", "value": "对着墙壁说话" }
        },
        {
          "id": "t2s1_extract_meta",
          "type": "extract",
          "description": "提取「数据残影」（Meta卡，请保留）",
          "target_words": ["数据残影"],
          "npc_hint": "「那个金边的词……「数据残影」，记得把它也拿出来，先放在板上别用掉。」",
          "done_when": { "type": "card_on_board", "value": "数据残影" }
        },
        {
          "id": "t2s1_sensory_night",
          "type": "sensory",
          "description": "半夜不睡觉 + 听觉重构",
          "target_cards": ["半夜不睡觉"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「半夜不睡觉……那时候有什么声音？试试听觉重构。」",
          "done_when": { "type": "card_on_board", "value": "低频加密通讯声" }
        },
        {
          "id": "t2s1_sensory_wall",
          "type": "sensory",
          "description": "对着墙壁说话 + 视觉重构",
          "target_cards": ["对着墙壁说话"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那面墙……用视觉重构看看墙后面有什么。」",
          "done_when": { "type": "card_on_board", "value": "墙壁后的暗格" }
        },
        {
          "id": "t2s1_combine",
          "type": "combine",
          "description": "低频加密通讯声 + 墙壁后的暗格 → 隐藏的接收器",
          "target_cards": ["低频加密通讯声", "墙壁后的暗格"],
          "npc_hint": "「声音从墙里来……把这两个放在一起，找到那个接收器。」",
          "done_when": { "type": "card_on_board", "value": "隐藏的接收器" }
        },
        {
          "id": "t2s1_submit",
          "type": "submit",
          "description": "提交「隐藏的接收器」",
          "target_cards": ["隐藏的接收器"],
          "npc_hint": "「这个接收器……交出去吧。」",
          "done_when": { "type": "card_submitted", "value": "隐藏的接收器" }
        }
      ]
    },

    "stage_02": {
      "hint_steps": [
        {
          "id": "t2s2_extract",
          "type": "extract",
          "description": "提取「反复擦拭一个杯子」「每周末都消失」「信号溢出」",
          "target_words": ["反复擦拭一个杯子", "每周末都消失", "信号溢出"],
          "npc_hint": "「那个杯子……还有她每周末的行踪，这些都有问题。」",
          "done_when": { "type": "card_on_board", "value": "反复擦拭一个杯子" }
        },
        {
          "id": "t2s2_extract_weekend",
          "type": "extract",
          "description": "提取「每周末都消失」",
          "target_words": ["每周末都消失"],
          "npc_hint": "「她每个周末都消失……这个规律很重要，拿出来。」",
          "done_when": { "type": "card_on_board", "value": "每周末都消失" }
        },
        {
          "id": "t2s2_extract_meta",
          "type": "extract",
          "description": "提取「信号溢出」（Meta卡）",
          "target_words": ["信号溢出"],
          "npc_hint": "「「信号溢出」……金边的卡，先拿出来放着别用。」",
          "done_when": { "type": "card_on_board", "value": "信号溢出" }
        },
        {
          "id": "t2s2_sensory_cup",
          "type": "sensory",
          "description": "反复擦拭一个杯子 + 视觉重构",
          "target_cards": ["反复擦拭一个杯子"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那个杯子……用视觉重构仔细看看底部有什么。」",
          "done_when": { "type": "card_on_board", "value": "杯子底部的暗格" }
        },
        {
          "id": "t2s2_sensory_weekend",
          "type": "sensory",
          "description": "每周末都消失 + 视觉重构",
          "target_cards": ["每周末都消失"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「每个周末她去哪里……用视觉重构追踪她的路线。」",
          "done_when": { "type": "card_on_board", "value": "特定路线的地图残影" }
        },
        {
          "id": "t2s2_combine",
          "type": "combine",
          "description": "杯子底部的暗格 + 特定路线的地图残影 → 秘密传递情报的路线",
          "target_cards": ["杯子底部的暗格", "特定路线的地图残影"],
          "npc_hint": "「杯子底部的暗格和那条路线……把它们合在一起，看看这条路通向哪里。」",
          "done_when": { "type": "card_on_board", "value": "秘密传递情报的路线" }
        },
        {
          "id": "t2s2_submit",
          "type": "submit",
          "description": "提交「秘密传递情报的路线」",
          "target_cards": ["秘密传递情报的路线"],
          "npc_hint": "「这条路线……交出去吧。」",
          "done_when": { "type": "card_submitted", "value": "秘密传递情报的路线" }
        }
      ]
    },

    "stage_03": {
      "hint_steps": [
        {
          "id": "t2s3_extract",
          "type": "extract",
          "description": "提取「整理一叠旧报纸」「奇怪的数字」",
          "target_words": ["整理一叠旧报纸", "奇怪的数字"],
          "npc_hint": "「那叠旧报纸……还有那些数字，一起拿出来看看。」",
          "done_when": { "type": "card_on_board", "value": "整理一叠旧报纸" }
        },
        {
          "id": "t2s3_extract_number",
          "type": "extract",
          "description": "提取「奇怪的数字」",
          "target_words": ["奇怪的数字"],
          "npc_hint": "「那些奇怪的数字……拿出来。」",
          "done_when": { "type": "card_on_board", "value": "奇怪的数字" }
        },
        {
          "id": "t2s3_meta_intrusion",
          "type": "meta",
          "description": "数据残影 入侵对话框 → 解锁「清除目标」「定位」",
          "target_cards": ["数据残影"],
          "npc_hint": "「那张金边的卡……「数据残影」，试试把它拖到对话框上去，也许它能看到我看不到的东西。」",
          "done_when": { "type": "meta_used", "value": "数据残影" }
        },
        {
          "id": "t2s3_extract_hidden",
          "type": "extract",
          "description": "提取「清除目标」「定位」（Meta入侵后）",
          "target_words": ["清除目标", "定位"],
          "npc_hint": "「那段隐藏的文字里……有两个词发光了，快把它们拿出来。」",
          "done_when": { "type": "card_on_board", "value": "清除目标" }
        },
        {
          "id": "t2s3_extract_hidden2",
          "type": "extract",
          "description": "提取「定位」",
          "target_words": ["定位"],
          "npc_hint": "「「定位」……也拿出来。」",
          "done_when": { "type": "card_on_board", "value": "定位" }
        },
        {
          "id": "t2s3_sensory_paper",
          "type": "sensory",
          "description": "整理一叠旧报纸 + 视觉重构",
          "target_cards": ["整理一叠旧报纸"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那叠报纸……用视觉重构看看上面藏了什么。」",
          "done_when": { "type": "card_on_board", "value": "报纸中的密码暗纹" }
        },
        {
          "id": "t2s3_sensory_number",
          "type": "sensory",
          "description": "奇怪的数字 + 听觉重构",
          "target_cards": ["奇怪的数字"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那些数字……用听觉去解读，它们应该是某种频率或密钥。」",
          "done_when": { "type": "card_on_board", "value": "频道解锁密钥" }
        },
        {
          "id": "t2s3_combine",
          "type": "combine",
          "description": "报纸中的密码暗纹 + 频道解锁密钥 → 加密名单的解密钥匙",
          "target_cards": ["报纸中的密码暗纹", "频道解锁密钥"],
          "npc_hint": "「密码暗纹和密钥……合在一起，应该能解开那份名单。」",
          "done_when": { "type": "card_on_board", "value": "加密名单的解密钥匙" }
        },
        {
          "id": "t2s3_submit",
          "type": "submit",
          "description": "提交「加密名单的解密钥匙」",
          "target_cards": ["加密名单的解密钥匙"],
          "npc_hint": "「这把钥匙……交出去吧。」",
          "done_when": { "type": "card_submitted", "value": "加密名单的解密钥匙" }
        }
      ]
    },

    "stage_04": {
      "hint_steps": [
        {
          "id": "t2s4_extract",
          "type": "extract",
          "description": "提取「要保护什么东西」「一条项链」",
          "target_words": ["要保护什么东西", "一条项链"],
          "npc_hint": "「她要保护什么……还有那条项链，把它们拿出来。」",
          "done_when": { "type": "card_on_board", "value": "要保护什么东西" }
        },
        {
          "id": "t2s4_extract_necklace",
          "type": "extract",
          "description": "提取「一条项链」",
          "target_words": ["一条项链"],
          "npc_hint": "「那条项链……也拿出来。」",
          "done_when": { "type": "card_on_board", "value": "一条项链" }
        },
        {
          "id": "t2s4_sensory_protect",
          "type": "sensory",
          "description": "要保护什么东西 + 视觉重构",
          "target_cards": ["要保护什么东西"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「她要保护的东西……用视觉重构看清楚它的真实面目。」",
          "done_when": { "type": "card_on_board", "value": "项链中的隐藏物" }
        },
        {
          "id": "t2s4_sensory_necklace",
          "type": "sensory",
          "description": "一条项链 + 视觉重构",
          "target_cards": ["一条项链"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那条项链……用视觉重构仔细看看里面有什么。」",
          "done_when": { "type": "card_on_board", "value": "项链吊坠的暗层" }
        },
        {
          "id": "t2s4_combine_false",
          "type": "combine",
          "description": "项链中的隐藏物 + 项链吊坠的暗层 → 叛军家属的联络名单",
          "target_cards": ["项链中的隐藏物", "项链吊坠的暗层"],
          "npc_hint": "「项链里的隐藏物和暗层……合在一起，看看这份名单是什么。」",
          "done_when": { "type": "card_on_board", "value": "叛军家属的联络名单" }
        },
        {
          "id": "t2s4_combine_true1",
          "type": "combine",
          "description": "清除目标 + 定位 → 目标清除坐标",
          "target_cards": ["清除目标", "定位"],
          "npc_hint": "「清除目标和定位……把它们合在一起，找到真正的坐标。」",
          "done_when": { "type": "card_on_board", "value": "目标清除坐标" }
        },
        {
          "id": "t2s4_combine_true2",
          "type": "combine",
          "description": "目标清除坐标 + 叛军家属的联络名单 → 清除目标的定位名单",
          "target_cards": ["目标清除坐标", "叛军家属的联络名单"],
          "npc_hint": "「坐标和联络名单……这才是真相，把它们合在一起。」",
          "done_when": { "type": "card_on_board", "value": "清除目标的定位名单" }
        },
        {
          "id": "t2s4_submit",
          "type": "submit",
          "description": "提交真结论",
          "target_cards": ["清除目标的定位名单"],
          "npc_hint": "「这份名单……才是这一切的真相。提交吧。」",
          "done_when": { "type": "card_submitted", "value": "清除目标的定位名单" }
        }
      ]
    }
  },

  // ===================== Trial 3：无脸的医生 =====================

  "trial_3": {

    "stage_01": {
      "hint_steps": [
        {
          "id": "t3s1_extract",
          "type": "extract",
          "description": "提取「穿白袍的人影」「发亮的细长物体」「脑波异常」",
          "target_words": ["穿白袍的人影", "发亮的细长物体", "脑波异常"],
          "npc_hint": "「那个白袍人影……还有那个发光的东西，先把它们拿出来。」",
          "done_when": { "type": "card_on_board", "value": "穿白袍的人影" }
        },
        {
          "id": "t3s1_extract_object",
          "type": "extract",
          "description": "提取「发亮的细长物体」",
          "target_words": ["发亮的细长物体"],
          "npc_hint": "「那个发亮的细长物体……拿出来。」",
          "done_when": { "type": "card_on_board", "value": "发亮的细长物体" }
        },
        {
          "id": "t3s1_extract_meta",
          "type": "extract",
          "description": "提取「脑波异常」（Meta卡，请保留）",
          "target_words": ["脑波异常"],
          "npc_hint": "「「脑波异常」……金边的卡，先拿出来放着，后面会用到。」",
          "done_when": { "type": "card_on_board", "value": "脑波异常" }
        },
        {
          "id": "t3s1_sensory_figure",
          "type": "sensory",
          "description": "穿白袍的人影 + 视觉重构",
          "target_cards": ["穿白袍的人影"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那个人影……用视觉重构把他看清楚。」",
          "done_when": { "type": "card_on_board", "value": "模糊的白袍轮廓" }
        },
        {
          "id": "t3s1_sensory_object",
          "type": "sensory",
          "description": "发亮的细长物体 + 视觉重构",
          "target_cards": ["发亮的细长物体"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那个细长物体……用视觉重构看清楚它是什么。」",
          "done_when": { "type": "card_on_board", "value": "手术刀的冷光" }
        },
        {
          "id": "t3s1_combine",
          "type": "combine",
          "description": "模糊的白袍轮廓 + 手术刀的冷光 → 噩梦中的审讯者",
          "target_cards": ["模糊的白袍轮廓", "手术刀的冷光"],
          "npc_hint": "「白袍轮廓和手术刀……把它们合在一起，那个人究竟是谁。」",
          "done_when": { "type": "card_on_board", "value": "噩梦中的审讯者" }
        },
        {
          "id": "t3s1_submit",
          "type": "submit",
          "description": "提交「噩梦中的审讯者」",
          "target_cards": ["噩梦中的审讯者"],
          "npc_hint": "「这个人……交出去。」",
          "done_when": { "type": "card_submitted", "value": "噩梦中的审讯者" }
        }
      ]
    },

    "stage_02": {
      "hint_steps": [
        {
          "id": "t3s2_extract",
          "type": "extract",
          "description": "提取「低声说什么」「甜腻的味道」「记忆碎片」",
          "target_words": ["低声说什么", "甜腻的味道", "记忆碎片"],
          "npc_hint": "「那个低语……还有那股甜味，把它们都拿出来。」",
          "done_when": { "type": "card_on_board", "value": "低声说什么" }
        },
        {
          "id": "t3s2_extract_smell",
          "type": "extract",
          "description": "提取「甜腻的味道」",
          "target_words": ["甜腻的味道"],
          "npc_hint": "「甜腻的味道……拿出来。」",
          "done_when": { "type": "card_on_board", "value": "甜腻的味道" }
        },
        {
          "id": "t3s2_extract_meta",
          "type": "extract",
          "description": "提取「记忆碎片」（Meta卡，请保留）",
          "target_words": ["记忆碎片"],
          "npc_hint": "「「记忆碎片」……金边的卡，这个很重要，拿出来保留。」",
          "done_when": { "type": "card_on_board", "value": "记忆碎片" }
        },
        {
          "id": "t3s2_sensory_whisper",
          "type": "sensory",
          "description": "低声说什么 + 听觉重构",
          "target_cards": ["低声说什么"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那段低语……用听觉重构放大它，看看说了什么。」",
          "done_when": { "type": "card_on_board", "value": "温柔的催眠指令" }
        },
        {
          "id": "t3s2_sensory_smell",
          "type": "sensory",
          "description": "甜腻的味道 + 嗅觉重构",
          "target_cards": ["甜腻的味道"],
          "target_skills": ["嗅觉重构"],
          "npc_hint": "「那股甜味……用嗅觉重构识别它是什么物质。」",
          "done_when": { "type": "card_on_board", "value": "麻醉剂的残余气味" }
        },
        {
          "id": "t3s2_combine",
          "type": "combine",
          "description": "温柔的催眠指令 + 麻醉剂的残余气味 → 被操控的潜意识",
          "target_cards": ["温柔的催眠指令", "麻醉剂的残余气味"],
          "npc_hint": "「催眠和麻醉……合在一起，看看我的潜意识被做了什么。」",
          "done_when": { "type": "card_on_board", "value": "被操控的潜意识" }
        },
        {
          "id": "t3s2_submit",
          "type": "submit",
          "description": "提交「被操控的潜意识」",
          "target_cards": ["被操控的潜意识"],
          "npc_hint": "「这个……交出去。」",
          "done_when": { "type": "card_submitted", "value": "被操控的潜意识" }
        }
      ]
    },

    "stage_03": {
      "hint_steps": [
        {
          "id": "t3s3_extract",
          "type": "extract",
          "description": "提取「一串编号」「蓝色的图纸」「手术台」",
          "target_words": ["一串编号", "蓝色的图纸", "手术台"],
          "npc_hint": "「那串编号……还有那张图纸，把它们拿出来。」",
          "done_when": { "type": "card_on_board", "value": "一串编号" }
        },
        {
          "id": "t3s3_extract_blueprint",
          "type": "extract",
          "description": "提取「蓝色的图纸」",
          "target_words": ["蓝色的图纸"],
          "npc_hint": "「那张蓝色图纸……拿出来。」",
          "done_when": { "type": "card_on_board", "value": "蓝色的图纸" }
        },
        {
          "id": "t3s3_extract_table",
          "type": "extract",
          "description": "提取「手术台」",
          "target_words": ["手术台"],
          "npc_hint": "「手术台……也拿出来，这个词很重要。」",
          "done_when": { "type": "card_on_board", "value": "手术台" }
        },
        {
          "id": "t3s3_sensory_number",
          "type": "sensory",
          "description": "一串编号 + 听觉重构",
          "target_cards": ["一串编号"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那串编号……用听觉重构，那应该是武器序列号。」",
          "done_when": { "type": "card_on_board", "value": "武器序列号的片段" }
        },
        {
          "id": "t3s3_contradiction",
          "type": "contradiction",
          "description": "标记矛盾：手术台 ↔ 武器序列号的片段",
          "target_cards": ["手术台", "武器序列号的片段"],
          "npc_hint": "「手术台和武器序列号……这不对劲。⚡ 用矛盾标记把它们标出来，看看背后是什么。」",
          "done_when": { "type": "contradiction_flagged", "value": "trial3_semantic" }
        },
        {
          "id": "t3s3_meta_intrusion",
          "type": "meta",
          "description": "记忆碎片 入侵对话框 → 解锁「记忆剥离」「协议」",
          "target_cards": ["记忆碎片"],
          "npc_hint": "「「记忆碎片」……在完成矛盾标记之后，把它拖到对话框上去，看看能不能找到被压制的记忆。」",
          "done_when": { "type": "meta_used", "value": "记忆碎片" }
        },
        {
          "id": "t3s3_extract_hidden",
          "type": "extract",
          "description": "提取「记忆剥离」「协议」",
          "target_words": ["记忆剥离", "协议"],
          "npc_hint": "「隐藏层里出现了……「记忆剥离」和「协议」，快拿出来。」",
          "done_when": { "type": "card_on_board", "value": "记忆剥离" }
        },
        {
          "id": "t3s3_extract_hidden2",
          "type": "extract",
          "description": "提取「协议」",
          "target_words": ["协议"],
          "npc_hint": "「「协议」……也拿出来。」",
          "done_when": { "type": "card_on_board", "value": "协议" }
        },
        {
          "id": "t3s3_sensory_blueprint",
          "type": "sensory",
          "description": "蓝色的图纸 + 视觉重构",
          "target_cards": ["蓝色的图纸"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那张图纸……用视觉重构看清楚是什么设计图。」",
          "done_when": { "type": "card_on_board", "value": "微型爆裂装置的设计图" }
        },
        {
          "id": "t3s3_combine",
          "type": "combine",
          "description": "武器序列号的片段 + 微型爆裂装置的设计图 → 被窃取的武器数据",
          "target_cards": ["武器序列号的片段", "微型爆裂装置的设计图"],
          "npc_hint": "「序列号和设计图……合在一起，就是被窃取的武器数据。」",
          "done_when": { "type": "card_on_board", "value": "被窃取的武器数据" }
        },
        {
          "id": "t3s3_submit",
          "type": "submit",
          "description": "提交「被窃取的武器数据」",
          "target_cards": ["被窃取的武器数据"],
          "npc_hint": "「这份武器数据……交出去。」",
          "done_when": { "type": "card_submitted", "value": "被窃取的武器数据" }
        }
      ]
    },

    "stage_04": {
      "hint_steps": [
        {
          "id": "t3s4_extract",
          "type": "extract",
          "description": "提取「尖锐的声音」「冰凉的金属触感」",
          "target_words": ["尖锐的声音", "冰凉的金属触感"],
          "npc_hint": "「那个尖锐的声音……还有那种金属触感，把它们拿出来。」",
          "done_when": { "type": "card_on_board", "value": "尖锐的声音" }
        },
        {
          "id": "t3s4_extract_cold",
          "type": "extract",
          "description": "提取「冰凉的金属触感」",
          "target_words": ["冰凉的金属触感"],
          "npc_hint": "「那种冰凉的金属……拿出来。」",
          "done_when": { "type": "card_on_board", "value": "冰凉的金属触感" }
        },
        {
          "id": "t3s4_sensory_sound",
          "type": "sensory",
          "description": "尖锐的声音 + 听觉重构",
          "target_cards": ["尖锐的声音"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那个声音……用听觉重构识别它是什么。」",
          "done_when": { "type": "card_on_board", "value": "金属约束带的碰撞声" }
        },
        {
          "id": "t3s4_sensory_cold",
          "type": "sensory",
          "description": "冰凉的金属触感 + 视觉重构",
          "target_cards": ["冰凉的金属触感"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那种冰凉的金属装置……用视觉重构看清楚它是什么。」",
          "done_when": { "type": "card_on_board", "value": "冰冷的金属装置" }
        },
        {
          "id": "t3s4_combine",
          "type": "combine",
          "description": "金属约束带的碰撞声 + 冰冷的金属装置 → 刑讯逼供的真相",
          "target_cards": ["金属约束带的碰撞声", "冰冷的金属装置"],
          "npc_hint": "「约束带的声音和那个冰冷装置……合在一起，这是刑讯逼供的现场。」",
          "done_when": { "type": "card_on_board", "value": "刑讯逼供的真相" }
        },
        {
          "id": "t3s4_submit",
          "type": "submit",
          "description": "提交「刑讯逼供的真相」",
          "target_cards": ["刑讯逼供的真相"],
          "npc_hint": "「这个真相……交出去。」",
          "done_when": { "type": "card_submitted", "value": "刑讯逼供的真相" }
        }
      ]
    },

    "stage_05": {
      "hint_steps": [
        {
          "id": "t3s5_extract",
          "type": "extract",
          "description": "提取「一道红色的光」「倒数的数字」",
          "target_words": ["一道红色的光", "倒数的数字"],
          "npc_hint": "「那道红光……还有倒计时的数字，拿出来。」",
          "done_when": { "type": "card_on_board", "value": "一道红色的光" }
        },
        {
          "id": "t3s5_extract_countdown",
          "type": "extract",
          "description": "提取「倒数的数字」",
          "target_words": ["倒数的数字"],
          "npc_hint": "「倒数的数字……拿出来。」",
          "done_when": { "type": "card_on_board", "value": "倒数的数字" }
        },
        {
          "id": "t3s5_sensory_light",
          "type": "sensory",
          "description": "一道红色的光 + 视觉重构",
          "target_cards": ["一道红色的光"],
          "target_skills": ["视觉重构"],
          "npc_hint": "「那道红光……用视觉重构识别它是什么。」",
          "done_when": { "type": "card_on_board", "value": "激光校准线" }
        },
        {
          "id": "t3s5_sensory_countdown",
          "type": "sensory",
          "description": "倒数的数字 + 听觉重构",
          "target_cards": ["倒数的数字"],
          "target_skills": ["听觉重构"],
          "npc_hint": "「那段倒计时……用听觉重构解读它的含义。」",
          "done_when": { "type": "card_on_board", "value": "自毁程序的倒计时" }
        },
        {
          "id": "t3s5_combine_false",
          "type": "combine",
          "description": "激光校准线 + 自毁程序的倒计时 → 武器图纸的完整密码",
          "target_cards": ["激光校准线", "自毁程序的倒计时"],
          "npc_hint": "「校准线和倒计时……合在一起，那是武器图纸的密码。」",
          "done_when": { "type": "card_on_board", "value": "武器图纸的完整密码" }
        },
        {
          "id": "t3s5_combine_true1",
          "type": "combine",
          "description": "记忆剥离 + 协议 → 记忆剥离协议文档",
          "target_cards": ["记忆剥离", "协议"],
          "npc_hint": "「记忆剥离和协议……把它们合在一起，找到那份文件。」",
          "done_when": { "type": "card_on_board", "value": "记忆剥离协议文档" }
        },
        {
          "id": "t3s5_combine_true2",
          "type": "combine",
          "description": "记忆剥离协议文档 + 武器图纸的完整密码 → 记忆剥离协议的受害者",
          "target_cards": ["记忆剥离协议文档", "武器图纸的完整密码"],
          "npc_hint": "「协议文档和武器密码……这才是真相的全部，合在一起。」",
          "done_when": { "type": "card_on_board", "value": "记忆剥离协议的受害者" }
        },
        {
          "id": "t3s5_submit",
          "type": "submit",
          "description": "提交真结论",
          "target_cards": ["记忆剥离协议的受害者"],
          "npc_hint": "「这就是真相……提交吧。」",
          "done_when": { "type": "card_submitted", "value": "记忆剥离协议的受害者" }
        }
      ]
    }
  }
};
