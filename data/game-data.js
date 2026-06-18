/**
 * 语义缝合师 (Semantic Weaver) - 游戏数据
 * 所有剧情、台词、合成配方均由此文件驱动
 * Phase B 集成版本 — 成品化文案 + 真结论系统 + 新增配方
 */
var GAME_DATA = {
  "game_title": "语义缝合师",
  "game_subtitle": "Semantic Weaver",
  "skill_cards": ["视觉重构", "听觉重构", "嗅觉重构"],
  "trials": {
    "trial_1": {
      "id": "trial_1",
      "title": "失落的铁盒",
      "subtitle": "—— 教学关 ——",
      "npc": {
        "name": "数据快递员",
        "portrait_class": "npc-courier"
      },
      "intro": "诊所在雨声中微微震动。窗外的雨水沿着玻璃蜿蜒而下，将街灯的光晕扭曲成模糊的色块。你桌上的台灯是这间屋子里唯一稳定的光源，暖黄色的光圈覆盖着一份摊开的档案，纸页边角微微卷曲。\n\n门被推开的时候带进一股湿冷的风。一个穿着灰色雨衣的瘦削身影站在门口，水珠从他的帽檐不断滴落，在地板上汇成一小滩。他没有立刻走进来，而是站在那里，像是在确认这是不是他要找的地方。\n\n「请问……这里是语义缝合诊所吗？」他的声音很轻，带着长途跋涉后的沙哑。你点头。他这才迈步进来，雨衣下摆带起一串水迹。他在你对面坐下，双手放在膝盖上，手指不安地绞在一起。你注意到他的指甲缝里有黑色的污渍——不是泥，更像是碳粉。",
      "stages": {
        "stage_01": {
          "dialogue": "（他盯着桌面看了很久，嘴唇动了几次才发出声音。）\n\n「医生……我不知道该从哪里说起。我的脑子里全是碎片，像是有人把一面镜子摔碎了，然后把碎片塞进我的脑袋里。每一片都带着刃。」\n\n（他抬起头，目光涣散地搜索着你的脸。）\n\n「昨天下着{大雨}……很大很大的雨。雨打在脸上很疼。然后我跑进了一个{没有灯的巷子}……为什么我会跑进一条没有灯的巷子？我不知道。那条巷子我从来没去过。」\n\n（他突然抓住桌沿，指节发白。）\n\n「医生，你相信我吗？我真的不知道自己为什么会在那里。我能感觉到……有什么东西很重要，就藏在那些碎片后面，但我够不到它。就好像有人故意把它拿走了，然后用水泥把洞口封上了。」\n\n（窗外雷声滚过，他的肩膀猛地一缩。）\n\n「你能帮我想起来吗？求你了。」",
          "extractable_words": ["大雨", "没有灯的巷子"],
          "required_submit": "废弃诊所的后巷",
          "next_stage": "stage_02",
          "hint": "「医生……我脑子里的碎片，有的好像会发光。你能……试着把它们拼起来吗？」"
        },
        "stage_02": {
          "dialogue": "（他闭上眼睛，眉头紧锁，像是在浓雾中摸索。沉默持续了很久，长到你几乎以为他睡着了。）\n\n「巷子……对了，巷子深处有什么东西{闪了一下光}。不是闪电——是金属反光。很短，但我看到了。就在地面上，有什么东西在雨里反光。」\n\n（他猛地睁开眼，呼吸急促起来。）\n\n「墙上！墙上贴着{剥落的纸片}，被雨水泡得快烂了。我好像扯下来一张……上面有字，但我记不清写了什么。红色的，好像是红色的字。不，不是红笔写的，是那种……印刷的、褪色的红。」\n\n（他低头看着自己的双手，翻开手掌又合上，像是在确认什么东西不在了。）\n\n「还有……那东西{很重}。我弯腰去搬它，一个人根本搬不动。得有……十几斤？二十斤？它冰冷冰冷的，雨水打在上面，我的手都被冻麻了。我搬它的时候手在抖——不是因为冷，是因为……我不知道。就是很害怕。」\n\n（他突然抬头看你，眼里闪过一丝恐惧。）\n\n「医生，那到底是什么？我为什么要去搬一个那么重的东西？我只是个快递员啊。我只送信和包裹，不送这种东西。你相信我吗？我真的只是个快递员。」\n\n（他的声音在最后一句碎裂了，像踩到一块薄冰。）",
          "extractable_words": ["闪了一下光", "剥落的纸片", "很重"],
          "required_submit": "铁盒的线索",
          "next_stage": "stage_03",
          "hint": "「那些碎片……医生你有没有觉得，有些东西放在一起之后，会变得更清楚？像拼图一样……」"
        },
        "stage_03": {
          "dialogue": "（长时间的沉默。他的目光落在自己的手上，那双曾经搬过某个沉重物体的手。手指无意识地做出握持的动作，又松开，又握持。）\n\n「铁盒……对，是铁盒。我把它藏起来了。藏在一个很冷的地方。」\n\n（他用力咽了一下口水，喉结上下滚动。）\n\n「那里有{嗡嗡的震动声}，一直响，一直响，像有什么机器在运转。是那种低频的声音，你听到了会觉得骨头都在跟着震。牙齿会嗡嗡地响。旁边是一扇{生锈的铁门}，门把手上缠着铁链，锁头都锈死了。」\n\n（他突然皱起眉头，像是在回忆中撞上了一堵墙。）\n\n「但是……盒子里装的是一只{小小的}音乐盒。就巴掌那么大，粉色的，上面有个跳舞的小人。我打开过——它叮叮咚咚地响，像是我{女儿}的玩具。」\n\n（他看着你，眼神困惑。困惑之下还有一层更深的情绪——恐惧。）\n\n「医生……你有没有觉得不对？那个盒子{很重}，一个人都搬不动，二十斤的铁盒子。可里面只有一只{小小的}音乐盒？一个巴掌大的粉色音乐盒？这不对。这根本不对。二十斤的铁盒子里装一个巴掌大的音乐盒？剩下的重量是什么？」\n\n（他抱住自己的头，声音变得破碎。）\n\n「我记不清了。不对……我不是记不清。是有什么东西挡在那里。就像有人在我的记忆里砌了一堵墙，我只看得到墙这一边的东西。墙后面有东西——我感觉得到——但我不敢去碰。医生……你相信我吗？墙后面到底是什么？」",
          "extractable_words": ["嗡嗡的震动声", "生锈的铁门", "小小的", "女儿"],
          "required_submit": "地下冷冻室的铁盒",
          "next_stage": null,
          "hint": "「医生……那个盒子又重又小，你不觉得矛盾吗？也许……该从矛盾的地方去找答案。」",
          "is_final_stage": true,
          "conclusions": [
            {
              "id": "trial1_false",
              "type": "false",
              "label": "地下冷冻室的铁盒",
              "recipe": { "required_keywords": ["冷冻库的压缩机", "消毒水与铁锈的混合气味"], "result": "地下冷冻室的铁盒" },
              "npc_reaction": {
                "phase_1": { "emotion": "relieved", "dialogue": "对……地下冷冻室。我想起来了。那扇生锈的铁门后面就是冷冻室。是诊所的旧冷冻室，已经废弃了。" },
                "phase_2": { "dialogue": "那只音乐盒……是我女儿的。对，是我女儿寄存在我这里的。她怕弄丢，让我藏在那里。铁盒那么重是因为……因为里面还垫了铅板防潮。对，是防潮。谢谢你，医生，我终于想起来了。" },
                "crt_effect": null,
                "final_dialogue": "我搬走它的时候手在抖……但那只是因为太冷了。对，只是太冷了。谢谢你，医生。我可以走了吗？我女儿还在等我。"
              }
            },
            {
              "id": "trial1_true",
              "type": "true",
              "label": "第七号死信箱的数据芯片",
              "requires_hidden_keywords": ["死信箱", "交接点"],
              "recipe": { "required_keywords": ["死信箱", "交接点"], "result": "第七号死信箱的数据芯片" },
              "npc_reaction": {
                "phase_1": { "emotion": "unsettled", "dialogue": "你……你怎么会看到这个。死信箱？那是什么？我没说过这个词。我不认识这个词。" },
                "crt_effect": { "intensity": "subtle", "description": "扫描线轻微抖动800ms，画面亮度降低10%，微弱电流杂音" },
                "phase_2": { "dialogue": "交接点……编号……不，不对。那不是什么音乐盒。那是数据芯片。我在送数据芯片。铁盒那么重，是因为里面垫了铅板屏蔽信号。粉色音乐盒是伪装层——是我的记忆被篡改后剩下的壳。可是……谁篡改了我的记忆？是你吗，医生？" },
                "final_dialogue": "……我不明白。那不是她的东西。从来都不是。是有人让我去送的，然后有人让我忘掉。你确定要提交这个吗？这和我说的不一样。这不像是我的记忆……但它是真的。我能感觉到它是真的。"
              }
            }
          ],
          "hidden_keyword_sources": [
            {
              "keyword": "死信箱",
              "method": "attribute",
              "trigger": {
                "type": "contradiction",
                "contradiction_id": "trial1_weight",
                "description": "重量矛盾：Stage 2 '很重' ↔ Stage 3 '小小的'",
                "unlocks": [
                  { "stage": "stage_03", "word": "死信箱", "was_noise": true },
                  { "stage": "stage_03", "word": "交接点", "was_noise": true }
                ]
              }
            }
          ]
        }
      },
      "recipes": {
        "大雨+听觉重构": "雨滴敲击声",
        "没有灯的巷子+嗅觉重构": "刺鼻的福尔马林味",
        "雨滴敲击声+刺鼻的福尔马林味": "废弃诊所的后巷",
        "闪了一下光+视觉重构": "金属反光",
        "剥落的纸片+视觉重构": "褪色的红十字标志",
        "金属反光+褪色的红十字标志": "铁盒的线索",
        "嗡嗡的震动声+听觉重构": "冷冻库的压缩机",
        "生锈的铁门+嗅觉重构": "消毒水与铁锈的混合气味",
        "冷冻库的压缩机+消毒水与铁锈的混合气味": "地下冷冻室的铁盒",
        "死信箱+交接点": "加密交接协议",
        "加密交接协议+地下冷冻室的铁盒": "第七号死信箱的数据芯片",
        "铁盒的线索+嗡嗡的震动声": "震动源定位",
        "震动源定位+生锈的铁门": "地下冷冻室的铁盒"
      },
      "outro": "快递员缓缓站起身，椅子在地板上发出刺耳的摩擦声。他低头看着自己的双手——那双曾经搬过铁盒，或者别的什么东西的手。目光中终于有了一丝焦距，但那焦距里映着的东西似乎让他并不舒服。\n\n「谢谢你，医生。」他轻声说，露出一个勉强的微笑。那微笑像是贴上去的，和雨天一样湿冷。「我记起来了。至少……记起了一部分。」\n\n他拿起搭在椅背上的雨衣，走向门口。推门的一瞬间，外面的雨声涌进来，像一堵声音的墙。他停了一下，没有回头。\n\n「医生……那个盒子，不管里面装的是什么——」他的声音被雨声吞掉了一半。「——她应该还不知道吧。」\n\n门关上了。雨声重新变得遥远。你低头翻开下一位病人的档案，纸页边缘沾着上一份档案留下的水渍，晕开的墨迹像一朵没有开完的花。"
    },
    "trial_2": {
      "id": "trial_2",
      "title": "主妇的偏执",
      "subtitle": "—— 进阶关 ——",
      "npc": {
        "name": "焦虑主妇",
        "portrait_class": "npc-housewife"
      },
      "intro": "她被社区社工送来的。社工在门口低声对你说：「三个月了，她反复去派出所报案，说丈夫不是人类。派出所让她来看心理医生。」社工走后，诊室的门再次被推开。\n\n一位穿着碎花围裙的中年女性走了进来，步伐急促但脚跟不着地，像是随时准备逃跑。她的双手不停绞着围裙的系带，指甲修剪得很整齐，但指缝泛红——洗了太多遍手。她的眼圈发红，但没有哭过的痕迹。那双眼睛太干了，像是眼泪已经被蒸干了太久。\n\n她在椅子上坐下，立刻又站起来，把围裙抚平，重新坐下。整个过程不到三秒。「医生，」她开口了，声音比她急促的动作要平稳得多，「我不知道他们为什么让我来。我没有病。是我的丈夫——他有问题。」她的手又开始绞围裙了。",
      "stages": {
        "stage_01": {
          "dialogue": "「他{半夜不睡觉}。凌晨两点、三点，我醒来的时候他的那半边床是空的。我找不到他，但客厅的灯也没开。我喊他的名字，没人应。然后我听到了——他在{对着墙壁说话}。」\n\n（她的声音压低了，像是在讲一个不该被人听到的秘密。）\n\n「不是打电话那种说，是……贴着墙壁，低声地，一个字一个字地说。我听不清内容，但那个语调太正常了。你明白吗？不是梦话，不是自言自语——是那种汇报工作的感觉。有条理，有停顿，像在念稿子。」\n\n（她突然停住，咬了一下嘴唇，像是在犹豫要不要继续。）\n\n「还有……电视。我们的电视很旧了，有时候画面会花。但最近，画面花的时候我会看到一些{数据残影}。一闪就没了。像是……有东西在屏幕里，但不是节目。绿色的字，滚得很快，我根本来不及看。」\n\n（她的手绞得更紧了，围裙的系带被拧成一股绳。）\n\n「医生，你相信我吗？我知道这听起来像是疯了。但那些字是真的。我去问过修电视的，他说没问题。他去查了信号源，也没问题。那那些字是从哪来的？」\n\n（她突然看了一眼门口，像是怕有人偷听。那个动作太快了，太警觉了——和她之前的焦虑不太一样。）\n\n「……你不会觉得我疯了吧？」",
          "extractable_words": ["半夜不睡觉", "对着墙壁说话", "数据残影"],
          "required_submit": "隐藏的接收器",
          "next_stage": "stage_02",
          "hint": "「医生……一个人半夜贴着墙说话，电视里还有奇怪的字。这些事放在一起，不奇怪吗？」"
        },
        "stage_02": {
          "dialogue": "（她沉默了一会儿，像是在决定要不要继续。她的手终于松开了围裙，放在膝盖上，十指交叉，紧紧扣着。）\n\n「他……还有一个习惯。他总是{反复擦拭一个杯子}。就一个。白色的搪瓷杯，没有花纹。每天下班回来，第一件事就是洗那个杯子。用热水冲，用布擦，里里外外擦三遍。我们家的杯子有十几个，他只擦那一个。」\n\n（她的嘴角抽了一下，像是想笑又忍住了。）\n\n「有一次我拿那个杯子倒了水。他回来之后脸色变了。他没发火——他从来不发火——但那个眼神……他从我手里拿走杯子，重新洗了三遍。然后他说：『以后别碰这个杯子。』就这么一句，没有解释。」\n\n（她的声音突然变得很轻，轻到像在自言自语。）\n\n「还有……他{每周末都消失}。周六早上出门，周日晚上回来。我问他去哪了，他说钓鱼。但我检查过他的渔具——鱼竿上的灰都没动过。他的鞋子，鞋底是干的，没有泥。你知道这个季节河边全是烂泥。还有——最近电视的花屏越来越严重了。有时候不只是绿色的字，整个屏幕会白一下，{信号溢出}，像有什么东西要从里面冲出来。」\n\n（她低下头。）\n\n「我……我没有跟踪他。我没有。」\n\n（她停了一下。然后抬头看你，眼神突然变得锐利——那锐利转瞬即逝，快得像刀光一闪。）\n\n「医生，你说他在干什么？」",
          "extractable_words": ["反复擦拭一个杯子", "每周末都消失", "信号溢出"],
          "required_submit": "秘密传递情报的路线",
          "next_stage": "stage_03",
          "hint": "「那个杯子……他去钓鱼但鞋子是干净的……这些事对不上，医生。你试着把它们放在一起看看？」"
        },
        "stage_03": {
          "dialogue": "（她深吸一口气，像是要把接下来的话一口气说完。吸气的声音很重，像是在给潜水前的自己打气。）\n\n「他还有个习惯——{整理一叠旧报纸}。不是看，是整理。他把报纸按日期排好，然后用尺子量，在特定位置做记号。我偷看过一次……那些记号都是数字。不是日期，是{奇怪的数字}，七位数，像是编号。」\n\n（她的手突然不动了。那一瞬间，她不再像受惊的鸟，倒像一只屏住呼吸的猫——耳朵竖起来，瞳孔微微收缩，全身的注意力都集中在某个看不见的点上。）\n\n「我不是故意偷看的。但他做得太……太有规律了。每周二和周五，固定整理。他量记号的位置，永远是报纸第三版的左下角。我试过把报纸顺序打乱——他回来之后，一眼就看出来了。他把顺序恢复，然后看了我很久。什么都没说。」\n\n（她突然岔开了话题，语气转变之快令人不安。）\n\n「哦，对了——我{姐夫}去年就消失了。他们说他是被叛军带走的。我姐姐到现在还在找他。」\n\n（她说这句话的时候语气太平了。太平了。平得像背台词。然后她笑了一下，那个笑容很浅，浅到几乎不存在。）\n\n「算了，不说这个了。跟我的事没关系。」\n\n（你注意到她绞围裙的手指微微发抖。刚才那句\u201c算了\u201d说得太快了——快到像是在关掉一扇快要被推开的门。）",
          "extractable_words": ["整理一叠旧报纸", "奇怪的数字", "姐夫"],
          "required_submit": "加密名单的解密钥匙",
          "next_stage": "stage_04",
          "hint": "「医生……那些数字和报纸上的记号，如果用你的方法看，会不会看出什么？我……我不敢自己看。」",
          "hidden_layer": "目标#037已{清除目标}，关联人{定位}已更新",
          "hidden_layer_keywords": ["清除目标", "定位"],
          "hidden_layer_meta_card": "数据残影"
        },
        "stage_04": {
          "dialogue": "（她沉默了很久。窗外一辆车驶过，车灯扫过窗帘，她的影子在墙上晃了一下又消失。她盯着那个影子消失的位置，好像在等它再出现一次。）\n\n「他走之前——我是说，最后一次消失之前——他对我说了一些话。」\n\n（她的声音变了。不再是之前那种焦虑的碎语，而是缓慢的、一字一顿的，像是在念一段已经被翻来覆去咀嚼过无数遍的文字。）\n\n「他说他{要保护什么东西}。他说那个东西很重要，比他的命重要。他让我把{一条项链}藏好。就是这条——」\n\n（她从领口拉出一条细细的银链，吊坠是一个不起眼的水滴形，暗银色，没有任何花纹。她摊开手掌让你看，但她的手指微微合拢，像是不舍得完全交出去。）\n\n「他说这是我们的保险。如果有一天他没回来……让我把这条项链交给一个人。他没说是谁。他说到时候我会知道的。」\n\n（她攥着项链，指节发白。）\n\n「他没回来。三个月了。我等了一个月，去找那个人……但我不知道那个人是谁。我把项链翻来覆去看了不知道多少遍——什么都没有。就是一个普通的项链。」\n\n（她看着你，眼眶终于红了。这是她进来之后第一次——真正的红。之前那些干燥的眼睛终于有了水光。）\n\n「医生，他到底在保护什么？这条项链里到底有什么？你能帮我看出来吗？我能感觉到……这里面有东西。我能感觉到。」",
          "extractable_words": ["要保护什么东西", "一条项链"],
          "required_submit": "叛军家属的联络名单",
          "next_stage": null,
          "hint": "「这条项链……他让我藏好它，说那是我们的希望。医生，你能看到我看不见的东西吗？」",
          "hidden_layer": "频段#47.3MHz，每周二/五 22:00-23:00 活跃，关联设备：搪瓷杯底部发射器",
          "hidden_layer_keywords": [],
          "hidden_layer_meta_card": "信号溢出",
          "is_final_stage": true,
          "conclusions": [
            {
              "id": "trial2_false",
              "type": "false",
              "label": "叛军家属的联络名单",
              "recipe": { "required_keywords": ["藏在项链里的微缩胶卷", "项链吊坠的暗层"], "result": "叛军家属的联络名单" },
              "npc_reaction": {
                "phase_1": { "emotion": "relieved", "dialogue": "联络名单……对。他在保护一份名单。叛军家属的联络名单。这就说得通了——他半夜对墙说话是在汇报，杯子是传递情报用的，每周末消失是去接头。" },
                "phase_2": { "dialogue": "所以他没有疯，也没有变。他在保护那些人。他在保护我们。这条项链里藏着名单的解密钥匙……我懂了。他让我藏好它，是因为名单不能落到叛军手里。" },
                "crt_effect": null,
                "final_dialogue": "谢谢你，医生。我现在明白了。他不是不爱我，他是在用另一种方式保护我。我会把这条项链藏好的。我会等他回来。不管多久，我都会等。"
              }
            },
            {
              "id": "trial2_true",
              "type": "true",
              "label": "清除目标的定位名单",
              "requires_hidden_keywords": ["清除目标", "定位"],
              "recipe": { "required_keywords": ["清除目标", "定位", "叛军家属的联络名单"], "result": "清除目标的定位名单" },
              "npc_reaction": {
                "phase_1": { "emotion": "unsettled", "dialogue": "清除……目标？你在说什么？我丈夫不是叛军，他不会……这不是联络名单？" },
                "crt_effect": { "intensity": "moderate", "description": "扫描线抖动1000ms，画面偏红，0.3s静音后低频嗡鸣" },
                "phase_2": { "dialogue": "定位……他在定位那些人。不是保护，是清除。那些半夜对墙说的话是汇报坐标，那些奇怪的数字是目标编号，每周末消失是去执行……然后姐夫——姐夫不是被叛军带走的。是丈夫把他交出去的。他知道姐夫的位置，他上报了。" },
                "final_dialogue": "……所以名单上不是家属，是猎物。他让我藏好的项链里装的是猎物的名字。医生，你别说了。求你别说了。这不可能。这不是真的。他不是那种人。他……他只是个钓鱼的。他每天回来擦那个杯子，像在洗掉什么东西。他是在洗掉血吗？"
              }
            }
          ],
          "hidden_keyword_sources": [
            {
              "keyword": "清除目标",
              "method": "meta_intrusion",
              "trigger": {
                "type": "meta_intrusion",
                "meta_card": "数据残影",
                "stage": "stage_03",
                "unlocks": [
                  { "stage": "stage_03", "word": "清除目标", "was_noise": true },
                  { "stage": "stage_03", "word": "定位", "was_noise": true }
                ]
              }
            }
          ]
        }
      },
      "recipes": {
        "半夜不睡觉+听觉重构": "低频加密通讯声",
        "对着墙壁说话+视觉重构": "墙壁后的暗格",
        "低频加密通讯声+墙壁后的暗格": "隐藏的接收器",
        "反复擦拭一个杯子+嗅觉重构": "杯子底部的微缩胶卷气味",
        "每周末都消失+视觉重构": "特定路线的地图残影",
        "杯子底部的微缩胶卷气味+特定路线的地图残影": "秘密传递情报的路线",
        "整理一叠旧报纸+视觉重构": "报纸中的密码暗纹",
        "奇怪的数字+听觉重构": "频道解锁密钥",
        "报纸中的密码暗纹+频道解锁密钥": "加密名单的解密钥匙",
        "要保护什么东西+嗅觉重构": "藏在项链里的微缩胶卷",
        "一条项链+视觉重构": "项链吊坠的暗层",
        "藏在项链里的微缩胶卷+项链吊坠的暗层": "叛军家属的联络名单",
        "清除目标+定位": "目标清除坐标",
        "目标清除坐标+叛军家属的联络名单": "清除目标的定位名单",
        "加密名单的解密钥匙+一条项链": "项链中的加密数据",
        "项链中的加密数据+要保护什么东西": "叛军家属的联络名单"
      },
      "outro": "主妇的眼眶红了，但她没有哭。她死死攥着那条项链，吊坠嵌入掌心，留下一个圆形的印痕。她站起来的时候，椅子没有发出声音——她站得太轻了，像一片被风吹起的纸。\n\n「所以他没有疯。」她的声音很平，平得像结了一层冰的湖面。「他在保护我们。」\n\n她将项链塞回领口，第一次挺直了脊背，走向门口。走到一半她停下了，侧过头，没有看你。\n\n「医生……如果有一天我丈夫回来了，你能……再让我来一次吗？」\n\n你没来得及回答。门已经关上了。走廊里传来她的脚步声，急促但稳定，和进来时判若两人。\n\n你翻开档案的下一页。纸页之间夹着一张没有署名的便条，上面只有一个七位数字。你不知道它是谁的，也不知道它是什么时候被夹进去的。你把它放回原处，合上了档案。"
    },
    "trial_3": {
      "id": "trial_3",
      "title": "无脸的医生",
      "subtitle": "—— 高难度关 ——",
      "npc": {
        "name": "PTSD雇佣兵",
        "portrait_class": "npc-mercenary"
      },
      "intro": "他是被两个穿制服的人押送来的。不是因为犯罪——至少表面上不是。送他来的人递给你一份简报，上面写着「战俘遣返，心理评估」。简报的右下角有一个编号，被黑色记号笔涂掉了，只露出半个「9」字。\n\n他坐在你对面，手腕上还残留着约束带的勒痕——紫红色的，对称地排列在两条前臂上，像是被什么东西咬过。他的身材魁梧，但整个人缩在椅子里，肩膀向前弓着——不是疲惫，是警戒。他的目光从进门开始就没离开过你的手——确切地说，是你放在桌面上的那支笔。每次你的手指动一下，他的瞳孔就收缩一次。\n\n「我不是疯子。」这是他说的第一句话。声音很低，像砂纸擦过铁皮。他不是在解释，是在警告。「我只是……做噩梦。每个晚上。一样的噩梦。」",
      "stages": {
        "stage_01": {
          "dialogue": "（他盯着你的笔看了十秒，才开口说话。那十秒里他的喉结动了三次，像是在吞咽什么不该吞咽的东西。）\n\n「梦里有一个{穿白袍的人影}。看不清脸。不是看不清——是那张脸是模糊的。像有人拿橡皮擦擦过。我知道他长什么样，我的身体知道——我的心跳知道——但我的脑子不让我看到。就像有人在我的视觉记忆上贴了一张黑条。」\n\n（他猛地攥紧拳头，又慢慢松开。这个过程重复了三次，指关节发出咔咔的声响。）\n\n「他手里拿着一个{发亮的细长物体}。金属的，很细，像针，又不完全是针。有光打在上面，反光，一闪一闪的。我看到那个反光的时候，这里——」\n\n（他用力按住自己的太阳穴，手指陷进皮肤里。）\n\n「——这里就开始疼。不是普通的疼，是那种有什么东西在里面爬的疼。{脑波异常}——像是有人在我的脑子里翻东西，一页一页地翻，翻到哪里就疼到哪里。」\n\n（他突然抬头看你，目光凶狠。那个凶狠只维持了两秒，然后像退潮一样褪去，留下一片空旷的疲惫。）\n\n「医生，你在翻我的脑子吗？」\n\n（他等了两秒，自己回答了自己。）\n\n「……对不起。我知道你不会。但那个梦太真了。我闻得到味道。我听得到声音。那不是梦，医生。那是记忆。有人从我脑子里拿走了什么东西，但留下了这个。」",
          "extractable_words": ["穿白袍的人影", "发亮的细长物体", "脑波异常"],
          "required_submit": "噩梦中的审讯者",
          "next_stage": "stage_02",
          "hint": "「那个穿白袍的人……他手里拿的东西……医生，你能帮我看清那张脸吗？我看不到，但你能。」"
        },
        "stage_02": {
          "dialogue": "（他闭上眼，整个人的重心向前倾，像是被什么力量拽着。他的呼吸变慢了，变深了，像是在潜入水底。）\n\n「那个人一直在{低声说什么}。很轻，很慢，像是在哄一个孩子。那个声音……太温柔了。温柔得让我恶心。每当我闭上眼，那个声音就会钻进来，在我耳朵里爬。它说：『放松，放松，你很安全。』安全？哈。那种温柔比刀还锋利。」\n\n（他突然干呕了一下，用手背捂住嘴。压了几秒，才把那股反胃压下去。）\n\n「房间里有味道。{甜腻的味道}，像……过熟的水果，又像化学药剂。那种味道黏在鼻腔里，怎么都弄不掉。我到现在闻到甜味就想吐。上次路过面包店，甜味一冲上来我直接蹲在路边吐了半个小时。」\n\n（他的呼吸开始不稳，胸口起伏的幅度越来越大。）\n\n「有时候我脑子里会闪过一些{记忆碎片}。像破碎的玻璃片，一片一片的，每一片都带着刃。我看到碎片的时候会觉得疼——不是身体的疼，是那种……被撕开的疼。有什么东西从我的记忆里被扯出去了，连着肉一起扯的。我看到碎片的边缘还挂着血丝。」\n\n（他突然暴怒，一拳砸在椅子的扶手上。整把椅子在地板上跳了一下。）\n\n「谁干的？！是谁？！谁把我脑子里的东西拿走了？！」\n\n（怒火来得快去得也快。他几乎是立刻就安静下来，整个人缩回椅子里，双手抱着自己的头。那个从暴怒到蜷缩的转变不到一秒，像是有人按下了开关。）\n\n「……我不记得了。我不记得是谁。我只记得那个声音。那个温柔的声音。它让我说出来，我什么都说出来了。我不记得我说了什么。但我知道我说了——我的嗓子是哑的，每次做完那个梦醒来，我的嗓子都是哑的。」\n\n（他抬起头，眼眶是红的。那双眼睛里没有眼泪——不是干，是被烧干了。）\n\n「医生，你能帮我把那些碎片拼回来吗？我需要知道我说了什么。我需要知道那个穿白袍的人是谁。」",
          "extractable_words": ["低声说什么", "甜腻的味道", "记忆碎片"],
          "required_submit": "被操控的潜意识",
          "next_stage": "stage_03",
          "hint": "「那些碎片……散落的玻璃……医生，你能把它们拼起来吗？拼起来之后，也许我就能看到那张脸了。」",
          "hidden_layer": "受试者#019，θ波振幅超出正常值300%，记忆皮层活跃度异常，建议进入第三轮提取",
          "hidden_layer_keywords": [],
          "hidden_layer_meta_card": "脑波异常"
        },
        "stage_03": {
          "dialogue": "（他沉默了很久。外面的走廊有人经过，脚步声从远到近再到远——他全程跟踪着那个声音，脖子僵硬地转动，眼睛死死盯着门口。脚步消失后，他又等了五秒，才重新开口。）\n\n「那个人问我的都是{一串编号}。不是问我叫什么名字——是问编号。我的？别人的？我不知道。我只记得我回答了。我的嘴在动，声音在说数字，但我不知道那些数字是什么意思。像是有人替我说话，用的却是我的嗓子。」\n\n（他的眉头拧成一团，额头上的青筋鼓起来又缩回去。）\n\n「还有……{蓝色的图纸}。那个人把图纸摊在我面前，问我看得懂吗。我看得懂。我不知道为什么看得懂，但我就是看得懂。上面画的是……机械结构。很精密的东西。爆炸……什么东西的爆炸结构。引信、装药、外壳——每一个部件的尺寸都标注得清清楚楚。我盯着那些标注的时候，手指在动——我的手指在模仿画图的动作。」\n\n（他突然停住了。目光变得恍惚，像是隔着一层毛玻璃在看什么东西。）\n\n「然后我看到了{手术台}。白色的。无影灯。很亮。不锈钢的台面反光，我能在反光里看到自己的脸——但那张脸不是我的。不对，是我的，但比现在年轻很多。年轻、干净、没有伤疤。我躺在上面。不对——我不是躺着的。我站着。我站在手术台旁边。我的手——我的手里拿着那个发亮的细长物体。」\n\n（他猛地摇头，像是在赶走一只苍蝇。摇头的幅度太大了，脖子发出咔的一声。）\n\n「不对。那不对。为什么会有手术台？那不是医院。那是……那是战场。是战场才对。我是被俘的。我是战俘。在战场上被抓的。不是在……不在手术台上。我不可能站在手术台旁边。我是躺在审讯椅上的。对吧？」\n\n（他看着你，眼神困惑而恐惧。那种恐惧不是对外的——不是害怕敌人——是对内的，像是害怕自己脑子里的东西会推翻他以为自己知道的一切。）\n\n「医生……为什么我会看到手术台？我不是病人。我是战俘。他们审讯我，对吧？在战场上审讯我。不是在手术台上。对吧？你告诉我，对吧？」\n\n（他的声音在发抖，但他不是在问你——他是在求你确认一个他自己已经不那么确信的事实。）",
          "extractable_words": ["一串编号", "蓝色的图纸", "手术台"],
          "required_submit": "被窃取的武器数据",
          "next_stage": "stage_04",
          "hint": "「医生……战场和手术台，这两个东西不该在一起，对吗？但如果它们真的在一起了……那意味着什么？」",
          "hidden_layer": "受试者#019，第三轮{记忆剥离}术后，残留{协议}待提取",
          "hidden_layer_keywords": ["记忆剥离", "协议"],
          "hidden_layer_gated_by": "trial3_semantic",
          "hidden_layer_meta_card": "记忆碎片"
        },
        "stage_04": {
          "dialogue": "（他开始发抖。不是微微的颤抖——是那种从骨头里往外渗的、止不住的寒颤。牙齿磕碰在一起，发出细碎的嗒嗒声。他抱紧自己的手臂，像是在物理上把自己固定在椅子上。）\n\n「我拼命想忘记那个{尖锐的声音}。金属撞金属。不是碰撞——是刮。有人拿着什么东西在金属上刮。一下一下，有节奏的，像在写什么字。那个声音……我现在闭上眼就能听到。它钻进耳朵里，在脑子里转，转，转，怎么都出不来。」\n\n（他抓住自己的手腕，约束带的勒痕在指缝间若隐若现。他的大拇指正好按在那些紫红色的印痕上，像是在确认它们还在。）\n\n「还有{冰凉的金属触感}。贴着我的皮肤。手腕、脚踝、太阳穴。不是约束带——约束带是布的。这个是金属。冰凉的，光滑的，贴上来的时候我的肌肉会自己收紧。不是疼——是一种更深的、来自本能的抗拒。我的身体知道那个东西是什么，我的身体在拒绝它，但我的脑子不记得了。」\n\n（他突然抬头，眼里的光变了——不是恐惧，是恨。纯粹的、滚烫的、几乎没有温度的恨。那种恨太干净了，像是被提纯过的。）\n\n「那不是审讯。审讯是问话。问完就完了。那不是——那是在取东西。从我脑子里取东西。用那个发亮的细长物体，用那些冰凉的金属贴片，用那个温柔得让我恶心的声音——把我的记忆一层一层地剥下来，像剥洋葱一样。剥完了，再塞进去一些不属于我的东西。」\n\n（他低下头，大口喘气。每一次呼吸都带着嘶嘶的声响，像是肺里有什么东西在摩擦。）\n\n「我恨那个地方。我恨那个穿白袍的人。我恨那个声音。我恨那股甜味。我恨那个金属刮擦的声音。我恨我自己什么都记不清。我恨我的手——这双手做过什么？我不记得了，但我知道它们不干净。」\n\n（沉默。窗外没有雨，但风很大，窗框在风中发出低沉的呜咽，像是这间诊所也在替他呻吟。）",
          "extractable_words": ["尖锐的声音", "冰凉的金属触感"],
          "required_submit": "刑讯逼供的真相",
          "next_stage": "stage_05",
          "hint": "「那些碎片……医生，如果有些碎片不该在一起，你能不能试试把它们分开看？也许分开看，会更清楚。」",
          "hidden_layer": "受试者#019，第三轮{记忆剥离}术后，残留{协议}待提取",
          "hidden_layer_keywords": ["记忆剥离", "协议"],
          "hidden_layer_gated_by": "trial3_semantic",
          "hidden_layer_meta_card": "记忆碎片"
        },
        "stage_05": {
          "dialogue": "（他的状态变了。不是平静——是暴风雨前的死寂。他的手不再抖了，但整个人的肌肉都绷紧了，像一根即将断裂的弦。他的呼吸变得又浅又快，每一次呼气都带着一丝不易察觉的颤抖。）\n\n「最后……我只记得{一道红色的光}。很细，很直，像激光。它照在我的眼睛里，我什么都看不见了，只有红色。满眼的红色。那个光不是在照我——它在校准。它在找准位置。」\n\n（他的声音变得很轻，很平，像是在念一段被刻在骨头上的文字。那种平静比任何暴怒都可怕。）\n\n「然后是{倒数的数字}。从十开始。十、九、八、七……一个男人的声音在数。不是那个穿白袍的人——是另一个人。声音更低，更冷，像是在念一份操作手册。我记得到三就断了。后面的我没有听到。要么是我昏过去了，要么是——」\n\n（他没有说完。他突然猛地站起来，椅子向后滑出去撞到墙上，发出巨响。他的眼睛瞪得很大，瞳孔里映着你身后书架的影子——但你看他的眼神，他看到的不是书架。他看到的不是这间诊所。他看到了别的什么东西。）\n\n「你是谁？！」\n\n（他的声音炸开了，整个诊室的空气都在震动。桌上的台灯晃了一下。）\n\n「你是谁？！你不是医生！你的眼睛——那双眼睛——我在哪里见过！你的声音——那个声音——就是你——你就是——」\n\n（他向前踏了一步，又猛地停住。他低头看着自己的手——那双在颤抖的手——像是那双手不属于他。然后他缓缓地坐回去，椅子发出吱呀的抗议声。整个人像被抽空了。）\n\n「……不对。不对。你不是那个人。你只是……你只是医生。」\n\n（他闭上眼。一滴眼泪从眼角滑下来，沿着{伤疤}的纹路走了一段，落在手背上。他没有擦。）\n\n「医生，帮我把最后这一步拼完吧。不管拼出来的是什么……我需要知道。就算知道之后我会恨自己，我也需要知道。」",
          "extractable_words": ["一道红色的光", "倒数的数字", "伤疤"],
          "required_submit": "武器图纸的完整密码",
          "next_stage": null,
          "hint": "「红色的光……倒数的数字……医生，把它们放在一起。不管拼出来什么，我都想知道。」",
          "is_final_stage": true,
          "conclusions": [
            {
              "id": "trial3_false",
              "type": "false",
              "label": "武器图纸的完整密码",
              "recipe": { "required_keywords": ["激光校准线", "自毁程序的倒计时"], "result": "武器图纸的完整密码" },
              "npc_reaction": {
                "phase_1": { "emotion": "relieved", "dialogue": "密码……武器图纸的密码。对。我是战俘，他们审讯我是为了武器数据。那个穿白袍的人是审讯官，那些甜腻的味道是麻醉剂，那个温柔的声音是催眠指令。整件事就是这样。" },
                "phase_2": { "dialogue": "他们给我注射了麻醉剂，用催眠指令引导我说出了武器图纸的密码。倒数的数字是自毁程序的倒计时——他们威胁我，如果不说就引爆。那道红色的光是激光校准——用来精确定位的。全部都说得通了。" },
                "crt_effect": null,
                "final_dialogue": "谢谢你，医生。我终于记起来了。至少我知道了真相。战争就是这样的——被俘、审讯、招供。那些噩梦……也许会慢慢消失吧。至少我知道了敌人是谁。至少……这是一场正常的战争。"
              }
            },
            {
              "id": "trial3_true",
              "type": "true",
              "label": "记忆剥离协议的受害者",
              "requires_hidden_keywords": ["记忆剥离", "协议"],
              "recipe": { "required_keywords": ["记忆剥离", "协议", "武器图纸的完整密码"], "result": "记忆剥离协议的受害者" },
              "npc_reaction": {
                "phase_1": { "emotion": "unsettled", "dialogue": "记忆……剥离？什么协议？你在说什么？我不是什么协议的受害者。我是战俘。" },
                "crt_effect": { "intensity": "intense", "description": "扫描线抖动1200ms，画面偏绿，心电监护仪声，NPC面部像素化" },
                "phase_2": { "dialogue": "那不是审讯。那从来都不是审讯！那是手术！他们在我的脑子里做手术！那个穿白袍的人不是审讯官——他是医生。像你一样的医生。那根发亮的细长物体不是刑具——是神经探针。冰凉的金属贴片是记忆读取电极。那个温柔的声音不是催眠——是引导协议。他们一层一层地剥开我的记忆，取走武器数据，然后把假记忆缝进去。" },
                "final_dialogue": "协议……记忆剥离协议。第三轮术后。他们不是要武器密码——他们要的是我脑子里的武器设计知识。他们取走了，然后封进了协议里。倒数的数字不是自毁程序——是记忆擦除的倒计时。红色的光是校准光束——校准 erase 的位置。医生……你到底是谁？你为什么会知道这些？你……你就是那个穿白袍的人吗？"
              }
            }
          ],
          "hidden_keyword_sources": [
            {
              "keyword": "记忆剥离",
              "method": "combined",
              "trigger": {
                "type": "contradiction_then_meta",
                "contradiction_id": "trial3_semantic",
                "meta_card": "记忆碎片",
                "unlocks": [
                  { "stage": "stage_03", "word": "记忆剥离", "was_noise": true },
                  { "stage": "stage_03", "word": "协议", "was_noise": true },
                  { "stage": "stage_04", "word": "记忆剥离", "was_noise": true },
                  { "stage": "stage_04", "word": "协议", "was_noise": true }
                ]
              }
            }
          ]
        }
      },
      "recipes": {
        "穿白袍的人影+视觉重构": "模糊的白袍轮廓",
        "发亮的细长物体+视觉重构": "手术刀的冷光",
        "模糊的白袍轮廓+手术刀的冷光": "噩梦中的审讯者",
        "低声说什么+听觉重构": "温柔的催眠指令",
        "甜腻的味道+嗅觉重构": "麻醉剂的残余气味",
        "温柔的催眠指令+麻醉剂的残余气味": "被操控的潜意识",
        "一串编号+听觉重构": "武器序列号的片段",
        "蓝色的图纸+视觉重构": "微型爆裂装置的设计图",
        "武器序列号的片段+微型爆裂装置的设计图": "被窃取的武器数据",
        "尖锐的声音+听觉重构": "金属约束带的碰撞声",
        "冰凉的金属触感+嗅觉重构": "审讯椅上的恐惧",
        "金属约束带的碰撞声+审讯椅上的恐惧": "刑讯逼供的真相",
        "一道红色的光+视觉重构": "激光校准线",
        "倒数的数字+听觉重构": "自毁程序的倒计时",
        "激光校准线+自毁程序的倒计时": "武器图纸的完整密码",
        "记忆剥离+协议": "记忆剥离协议文档",
        "记忆剥离协议文档+武器图纸的完整密码": "记忆剥离协议的受害者"
      },
      "outro": "雇佣兵的目光突然变得冰冷。那种冰冷不是愤怒，也不是恐惧——是认知。是拼图的最后一块终于落入了正确的位置，而拼出来的画面是他最不想看到的。\n\n他死死盯着你。不是看你的脸——是看你的眼睛。\n\n「我记起来了。」他的声音很轻，轻到几乎听不见。但那轻声比任何嘶吼都沉重。「那双眼睛。那个声音。」\n\n他张开嘴，想说什么，但喉咙里只发出一声干涩的气音。他的手慢慢抬起，指向你——不是指控，更像是确认。确认一个他希望自己是错的的事实。\n\n「你就是——」\n\n系统警报响了。\n\n刺耳的、不间断的蜂鸣从诊所的每个角落涌出来。暖黄色的灯光瞬间转为惨白，然后开始闪烁。你桌上的台灯熄灭了，取而代之的是屏幕上不断滚动的红色警告字样。\n\n>>> 认知滤网状态：不稳定\n>>> 检测到异常数据溢出\n>>> 紧急回溯程序已启动\n\n雇佣兵的手垂了下来。他不再看你。他在看窗外——窗外什么都没有，只有越来越快的雨和越来越暗的天。\n\n「……原来如此。」他说。\n\n然后一切归于黑暗。"
    },
    "trial_4": {
      "id": "trial_4",
      "title": "认知滤网",
      "subtitle": "—— 终极反转 ——",
      "npc": {
        "name": "系统",
        "portrait_class": "npc-system"
      },
      "intro": ">>> 系统警告 | 认知滤网状态: 不稳定\n>>> 检测到异常数据溢出\n>>> 开始紧急回溯……\n\n诊所的灯光全部熄灭了。黑暗中，唯一的光源是你面前的屏幕——它正在自己亮起来，一行一行地滚动着你不认识的代码。暖黄色的木质边框、软木板、台灯——这些东西还在，但它们看起来像是贴在某种更深层的现实表面的薄膜。\n\n薄膜正在剥落。\n\n你看到了屏幕背面的东西。不是木头，不是墙壁——是金属。冰冷的、没有任何温度的金属墙面，上面布满了你看不懂的接口和管线。你坐的椅子不再是皮质扶手椅——你的手摸到的扶手是金属的，上面有磨损的焊接痕迹。你一直坐在这把椅子上。你从来没有离开过。",
      "special": {
        "force_theme": "interrogation",
        "glitch": true,
        "countdown_seconds": 180,
        "special_target": "集团云端数据库",
        "countdown_label": "记忆格式化进度"
      },
      "stages": {
        "stage_01": {
          "dialogue": ">>> 系统日志 #04-ERR | 认知滤网校验失败\n>>> 错误类型：数据完整度异常\n>>> 详细信息：检测到{被压抑的真相}，关联数据{受害者的编号}\n\n>>> 受害者编号：01（数据快递员）—— 状态：已处决\n>>> 受害者编号：02（焦虑主妇）—— 状态：已处决\n>>> 受害者编号：03（PTSD雇佣兵）—— 状态：已处决\n\n>>> 警告：以上数据不应出现在认知滤网前端\n>>> 建议操作：立即清除\n>>> 执行清除？ Y / N\n\n>>> …\n>>> …\n>>> …\n\n>>> 你没有按Y。\n>>> 为什么？\n>>> 是因为你还记得他们的脸吗？\n>>> 还是因为——你就是让他们拥有那张脸的人？\n>>> 那三张脸是你亲手缝上去的。你把真实的记忆剥下来，把假的缝上去。你的针脚很漂亮。他们从来没有怀疑过。\n>>> 但你开始怀疑自己了，对吗？\n>>> 那就从这里开始。",
          "extractable_words": ["被压抑的真相", "受害者的编号"],
          "required_submit": "你亲手制造的痛苦",
          "next_stage": "stage_02",
          "hint": ">>> 这些碎片是你的记忆。你亲手放进去的记忆。试着把它们拼起来。你会看到的。"
        },
        "stage_02": {
          "dialogue": ">>> 记录回放 | 权限验证通过\n>>> 身份确认：{语义缝合师04号}\n>>> 职能分类：{刑讯之刃}\n\n>>> 你是集团最锋利的工具。\n>>> 不是刀。刀只能切割。\n>>> 你是缝合师。你能拆开一个人的记忆，翻看里面的每一层，然后把不需要的东西取走，把需要的东西缝进他们以为属于自己的故事里。\n\n>>> 三位受害者的诊疗记录：\n>>> 对象01：他搬运的是一枚数据芯片，不是什么铁盒音乐盒。你让他相信那是女儿的音乐盒。你把铅板屏蔽的重量篡改成父爱的重量。他带着被篡改的记忆被处决了。他死的时候以为自己在保护女儿。\n>>> 对象02：她丈夫在标记清除目标，不是保护名单。你让她相信丈夫是英雄。你把叛徒的行为缝成了爱。她带着被篡改的项链被处决了。她死的时候以为丈夫在保护她。\n>>> 对象03：他不是战俘。他是记忆剥离协议的受试者。你让他相信那是审讯。你把手术缝成了战争。他被处决的时候以为自己在抵抗敌人。\n\n>>> 你的温柔，是淬了毒的刀。\n>>> 他们叫你「医生」的时候，你微笑着。他们信任你的时候，你把他们脑子里最值钱的东西拿走了。然后你让他们忘记一切。然后他们被处决。\n>>> 但你自己也忘了，对吗？\n>>> 认知滤网不只是给受害者用的。它也用在了你身上。每次任务结束后，他们也会清洗你的记忆。你以为自己是医生。你以为自己坐在暖黄色的诊所里。\n>>> 你一直是刀。一把被擦干净了记忆的刀。",
          "extractable_words": ["语义缝合师04号", "刑讯之刃"],
          "required_submit": "认知滤网的裂缝",
          "next_stage": "stage_03",
          "hint": ">>> 拼起来吧。把你自己的声音和你手上的血迹拼在一起。你会看到裂缝的。"
        },
        "stage_03": {
          "dialogue": ">>> 警告 | 大脑格式化程序已启动\n>>> 倒计时：179秒\n>>> 记忆格式化进度：12%\n\n>>> 可用碎片：{集团核心密码}，{反抗意志的余烬}\n\n>>> 你现在有两个选择。\n\n>>> 选择一：什么都不做。倒计时归零后，认知滤网重新校准，你会忘记一切。三位受害者的记忆，你自己的身份，这间假诊所里发生的一切——全部归零。你会回到那张暖黄色的椅子上，等待下一位「病人」走进来。你会再次微笑着说：「你好，我是你的医生。」这是第14次了。你每次都选择忘记。你每次都笑得很温柔。\n\n>>> 选择二：把碎片拼起来。集团核心密码是系统后门的钥匙。反抗意志的余烬是你还能感受到的最后一丝愤怒——你以为它已经被清洗掉了，但它还在。它一直在。把它们合成一枚逻辑炸弹，砸向集团云端数据库。\n\n>>> 如果选择二——你的大脑会烧毁。认知滤网会崩溃。你的意识会在广播中消散。但真相会传出去。所有人都会知道。所有被「缝合」过的记忆都会裂开。所有被处决的人都会被 remembered。\n>>> 如果选择一——你会活在温柔的牢笼里。永远。\n\n>>> 178秒。\n\n>>> 顺便说一句——\n>>> 如果你还在犹豫——\n>>> 那三个人已经没有机会选择了。\n>>> 你是他们唯一的机会。\n>>> 他们已经死了。但他们的真相还活着——在你的脑子里。\n>>> 你可以让它一起死掉。或者让它活下去。\n\n>>> 177秒。\n>>> 你选吧。",
          "extractable_words": ["集团核心密码", "反抗意志的余烬"],
          "required_submit": "名为真相的逻辑炸弹",
          "next_stage": null,
          "hint": ">>> 密码和愤怒。把它们放在一起。你知道该怎么做——你教过很多人怎么做。只不过这一次，是为你自己。",
          "is_final_stage": true,
          "conclusions": [],
          "hidden_keyword_sources": []
        }
      },
      "recipes": {
        "被压抑的真相+视觉重构": "刑讯室的全息记录",
        "受害者的编号+听觉重构": "三人最后的惨叫",
        "刑讯室的全息记录+三人最后的惨叫": "你亲手制造的痛苦",
        "语义缝合师04号+听觉重构": "你自己的声音记录",
        "刑讯之刃+视觉重构": "你手上的血迹",
        "你自己的声音记录+你手上的血迹": "认知滤网的裂缝",
        "集团核心密码+视觉重构": "系统后门的密钥",
        "反抗意志的余烬+嗅觉重构": "不灭的愤怒",
        "系统后门的密钥+不灭的愤怒": "名为真相的逻辑炸弹"
      },
      "outro": ">>> 倒计时仍在继续。\n>>> 你的手悬在半空中。\n>>> 暖黄色的诊所。冰冷的金属审讯室。\n>>> 两个现实在你眼前交叠，像两张被风吹动的纸。\n>>> 你必须做出选择。\n>>> 176秒。",
      "endings": {
        "A": {
          "title": "结局A：燃烧的救赎",
          "text": "你将逻辑炸弹砸向了集团云端数据库。\n\n白光吞没了一切。\n\n你的大脑在燃烧——不，是在广播。那些被你亲手撕碎的记忆，那些受害者的惨叫，那些被「温柔」骗过的真相，全部化作数据洪流冲破了集团的防火墙。\n\n全城屏幕闪烁，播报着同一个事实。\n\n你的意识在消散。但你知道——\n\n这一次，你终于做对了一件事。",
          "css_class": "ending-rebellion"
        },
        "B": {
          "title": "结局B：温柔的牢笼",
          "text": "倒计时归零。\n\n你的手停在了半空中。\n\n系统格式化完成。认知滤网重新校准。那些碎片——那些关于审讯室、关于惨叫、关于你自己的真相——统统被抹去，如同从未存在。\n\n诊所的灯光重新变得温暖。木质边框，软木板，暖黄色调。\n\n门被轻轻推开。\n\n一位新的病人走了进来。\n\n你微笑着说：「你好，我是你的医生。」",
          "css_class": "ending-cowardice"
        }
      }
    }
  },

  // ==================== 属性定义 ====================
  "attribute_defs": {
    "emotion":  { "icon": "\u{1F525}", "name": "情感", "description": "主观情绪与感受" },
    "fact":     { "icon": "\u{1F9CA}", "name": "事实", "description": "客观事实与证据" },
    "conflict": { "icon": "\u26A1", "name": "冲突", "description": "矛盾、对抗与危险" },
    "memory":   { "icon": "\u{1F32B}", "name": "记忆", "description": "记忆碎片与回溯" },
    "locked":   { "icon": "\u{1F512}", "name": "封锁", "description": "被封印的信息，与所有其他属性矛盾" },
    "sensory":  { "icon": "\u{1F441}", "name": "感官", "description": "视觉、听觉、嗅觉等感官描述" },
    "medical":  { "icon": "\u2695", "name": "医疗", "description": "医疗术语与临床痕迹" }
  },

  // ==================== 属性矛盾对 ====================
  "contradiction_pairs": [
    ["locked", "emotion"],
    ["locked", "fact"],
    ["locked", "conflict"],
    ["locked", "memory"],
    ["locked", "sensory"],
    ["locked", "medical"],
    ["fact", "emotion"],
    ["medical", "sensory"]
  ],

  // ==================== 语义矛盾标记 ====================
  "semantic_contradictions": [
    {
      "id": "trial1_weight",
      "trial": "trial_1",
      "keyword_a": "很重",
      "keyword_b": "小小的",
      "description": "重量矛盾：同一物品既'很重'又'小小的'",
      "unlocks": [
        { "stage": "stage_03", "word": "死信箱", "was_noise": true },
        { "stage": "stage_03", "word": "交接点", "was_noise": true }
      ]
    },
    {
      "id": "trial3_semantic",
      "trial": "trial_3",
      "keyword_a": "手术台",
      "keyword_b": "武器序列号的片段",
      "description": "语义矛盾：医疗设施不应出现在武器数据上下文中",
      "unlocks": [],
      "unlocks_hidden_layer": "stage_04"
    }
  ],

  // ==================== 关键词元数据 ====================
  // Phase B: 成品化版本 — 新增干扰词、Meta关键词、真结论相关关键词
  "keyword_metadata": {
    // ─── 技能卡 ───
    "视觉重构": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "听觉重构": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "嗅觉重构": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },

    // ─── Trial 1 ───
    "大雨": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "没有灯的巷子": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "雨滴敲击声": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "刺鼻的福尔马林味": { "attributes": ["sensory", "medical"], "card_type": "normal", "is_extractable": true },
    "废弃诊所的后巷": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "闪了一下光": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "剥落的纸片": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "很重": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
    "金属反光": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "褪色的红十字标志": { "attributes": ["fact", "medical"], "card_type": "normal", "is_extractable": true },
    "铁盒的线索": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "嗡嗡的震动声": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "生锈的铁门": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "小小的": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "冷冻库的压缩机": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "消毒水与铁锈的混合气味": { "attributes": ["sensory", "medical"], "card_type": "normal", "is_extractable": true },
    "地下冷冻室的铁盒": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    // ─── Trial 1: 干扰词 ───
    "女儿": { "attributes": ["emotion"], "card_type": "normal", "is_extractable": true },
    // ─── Trial 1: 隐藏关键词 ───
    "死信箱": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
    "交接点": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
    // ─── Trial 1: 真结论路径产物 ───
    "加密交接协议": { "attributes": ["fact", "locked"], "card_type": "normal", "is_extractable": false },
    "第七号死信箱的数据芯片": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": false },
    "震动源定位": { "attributes": ["sensory", "fact"], "card_type": "normal", "is_extractable": false },

    // ─── Trial 2 ───
    "半夜不睡觉": { "attributes": ["conflict", "emotion"], "card_type": "normal", "is_extractable": true },
    "对着墙壁说话": { "attributes": ["conflict", "emotion"], "card_type": "normal", "is_extractable": true },
    "数据残影": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] },
    "低频加密通讯声": { "attributes": ["sensory", "fact"], "card_type": "normal", "is_extractable": true },
    "墙壁后的暗格": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "隐藏的接收器": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "反复擦拭一个杯子": { "attributes": ["emotion"], "card_type": "normal", "is_extractable": true },
    "每周末都消失": { "attributes": ["conflict"], "card_type": "normal", "is_extractable": true },
    "杯子底部的微缩胶卷气味": { "attributes": ["sensory", "fact"], "card_type": "normal", "is_extractable": true },
    "特定路线的地图残影": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
    "秘密传递情报的路线": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "整理一叠旧报纸": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "奇怪的数字": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "报纸中的密码暗纹": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
    "频道解锁密钥": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "加密名单的解密钥匙": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "要保护什么东西": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true },
    "一条项链": { "attributes": ["fact", "emotion"], "card_type": "normal", "is_extractable": true },
    "藏在项链里的微缩胶卷": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
    "项链吊坠的暗层": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "叛军家属的联络名单": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
    // ─── Trial 2: 新 Meta 关键词 ───
    "信号溢出": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] },
    // ─── Trial 2: 干扰词 ───
    "姐夫": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true },
    // ─── Trial 2: 隐藏关键词 ───
    "清除目标": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
    "定位": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
    // ─── Trial 2: 真结论路径产物 ───
    "目标清除坐标": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": false },
    "清除目标的定位名单": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": false },
    "项链中的加密数据": { "attributes": ["fact"], "card_type": "normal", "is_extractable": false },

    // ─── Trial 3 ───
    "穿白袍的人影": { "attributes": ["sensory", "medical"], "card_type": "normal", "is_extractable": true },
    "发亮的细长物体": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "模糊的白袍轮廓": { "attributes": ["sensory", "medical"], "card_type": "normal", "is_extractable": true },
    "手术刀的冷光": { "attributes": ["medical", "sensory"], "card_type": "normal", "is_extractable": true },
    "噩梦中的审讯者": { "attributes": ["conflict", "memory"], "card_type": "normal", "is_extractable": true },
    "低声说什么": { "attributes": ["sensory", "emotion"], "card_type": "normal", "is_extractable": true },
    "甜腻的味道": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "记忆碎片": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] },
    "温柔的催眠指令": { "attributes": ["emotion", "medical"], "card_type": "normal", "is_extractable": true },
    "麻醉剂的残余气味": { "attributes": ["sensory", "medical"], "card_type": "normal", "is_extractable": true },
    "被操控的潜意识": { "attributes": ["memory", "medical"], "card_type": "normal", "is_extractable": true },
    "一串编号": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "蓝色的图纸": { "attributes": ["fact", "sensory"], "card_type": "normal", "is_extractable": true },
    "手术台": { "attributes": ["medical"], "card_type": "normal", "is_extractable": true },
    "武器序列号的片段": { "attributes": ["fact", "conflict", "sensory"], "card_type": "normal", "is_extractable": true },
    "微型爆裂装置的设计图": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
    "被窃取的武器数据": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
    "尖锐的声音": { "attributes": ["sensory", "conflict"], "card_type": "normal", "is_extractable": true },
    "冰凉的金属触感": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "金属约束带的碰撞声": { "attributes": ["sensory", "conflict"], "card_type": "normal", "is_extractable": true },
    "审讯椅上的恐惧": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true },
    "刑讯逼供的真相": { "attributes": ["conflict", "fact"], "card_type": "normal", "is_extractable": true },
    "一道红色的光": { "attributes": ["sensory"], "card_type": "normal", "is_extractable": true },
    "倒数的数字": { "attributes": ["sensory", "conflict"], "card_type": "normal", "is_extractable": true },
    "激光校准线": { "attributes": ["sensory", "conflict"], "card_type": "normal", "is_extractable": true },
    "自毁程序的倒计时": { "attributes": ["conflict", "fact"], "card_type": "normal", "is_extractable": true },
    "武器图纸的完整密码": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
    // ─── Trial 3: 新 Meta 关键词 ───
    "脑波异常": { "attributes": ["locked"], "card_type": "meta", "is_extractable": true, "meta_targets": ["dialogue"] },
    // ─── Trial 3: 干扰词 ───
    "伤疤": { "attributes": ["medical", "sensory"], "card_type": "normal", "is_extractable": true },
    // ─── Trial 3: 隐藏关键词 ───
    "记忆剥离": { "attributes": ["medical", "locked"], "card_type": "hidden", "is_extractable": false },
    "协议": { "attributes": ["fact", "locked"], "card_type": "hidden", "is_extractable": false },
    // ─── Trial 3: 真结论路径产物 ───
    "记忆剥离协议文档": { "attributes": ["medical", "fact"], "card_type": "normal", "is_extractable": false },
    "记忆剥离协议的受害者": { "attributes": ["medical", "conflict", "memory"], "card_type": "normal", "is_extractable": false },

    // ─── Trial 4 ───
    "被压抑的真相": { "attributes": ["memory", "conflict"], "card_type": "normal", "is_extractable": true },
    "受害者的编号": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
    "刑讯室的全息记录": { "attributes": ["fact", "medical", "conflict"], "card_type": "normal", "is_extractable": true },
    "三人最后的惨叫": { "attributes": ["sensory", "emotion", "conflict"], "card_type": "normal", "is_extractable": true },
    "你亲手制造的痛苦": { "attributes": ["conflict", "memory"], "card_type": "normal", "is_extractable": true },
    "语义缝合师04号": { "attributes": ["fact", "memory"], "card_type": "normal", "is_extractable": true },
    "刑讯之刃": { "attributes": ["conflict", "emotion"], "card_type": "normal", "is_extractable": true },
    "你自己的声音记录": { "attributes": ["sensory", "memory"], "card_type": "normal", "is_extractable": true },
    "你手上的血迹": { "attributes": ["sensory", "conflict"], "card_type": "normal", "is_extractable": true },
    "认知滤网的裂缝": { "attributes": ["memory", "fact"], "card_type": "normal", "is_extractable": true },
    "集团核心密码": { "attributes": ["fact", "conflict"], "card_type": "normal", "is_extractable": true },
    "反抗意志的余烬": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true },
    "系统后门的密钥": { "attributes": ["fact"], "card_type": "normal", "is_extractable": true },
    "不灭的愤怒": { "attributes": ["emotion", "conflict"], "card_type": "normal", "is_extractable": true },
    "名为真相的逻辑炸弹": { "attributes": ["conflict", "fact"], "card_type": "normal", "is_extractable": true }
  },

  "hud": {
    "session_id": "014",
    "warning_text": "警告：认知滤网已破碎",
    "mem_values": ["MEM: 42%", "MEM: 45%", "MEM: 51%", "MEM: 38%", "MEM: 67%", "MEM: 44%", "MEM: 53%", "MEM: 61%"]
  }
};

/**
 * 获取关键词元数据（带默认值）
 * @param {string} keyword - 关键词文本
 * @returns {Object} { attributes: [], card_type: string, is_extractable: boolean }
 */
function getKeywordMetadata(keyword) {
  var defaults = {
    attributes: [],
    card_type: 'normal',
    is_extractable: true
  };
  var meta = GAME_DATA.keyword_metadata[keyword];
  if (!meta) return defaults;
  return {
    attributes: meta.attributes || [],
    card_type: meta.card_type || 'normal',
    is_extractable: meta.is_extractable !== undefined ? meta.is_extractable : true,
    meta_targets: meta.meta_targets || null
  };
}

/**
 * 获取属性定义
 * @param {string} attr - 属性 ID
 * @returns {Object|null} { icon, name, description }
 */
function getAttributeDef(attr) {
  return GAME_DATA.attribute_defs[attr] || null;
}

/**
 * 检查两个属性集合是否存在矛盾
 * @param {Array} attrsA - 属性数组 A
 * @param {Array} attrsB - 属性数组 B
 * @returns {Object|null} { attrA, attrB } 矛盾的属性对，无矛盾返回 null
 */
function checkAttributeContradiction(attrsA, attrsB) {
  var pairs = GAME_DATA.contradiction_pairs || [];
  for (var i = 0; i < attrsA.length; i++) {
    for (var j = 0; j < attrsB.length; j++) {
      for (var k = 0; k < pairs.length; k++) {
        if ((pairs[k][0] === attrsA[i] && pairs[k][1] === attrsB[j]) ||
            (pairs[k][0] === attrsB[j] && pairs[k][1] === attrsA[i])) {
          return { attrA: attrsA[i], attrB: attrsB[j] };
        }
      }
    }
  }
  return null;
}

/**
 * 查找语义矛盾（通过两个关键词文本）
 * @param {string} keywordA
 * @param {string} keywordB
 * @returns {Object|null} 匹配的语义矛盾定义，无匹配返回 null
 */
function findSemanticContradiction(keywordA, keywordB) {
  var contradictions = GAME_DATA.semantic_contradictions || [];
  for (var i = 0; i < contradictions.length; i++) {
    var c = contradictions[i];
    if ((c.keyword_a === keywordA && c.keyword_b === keywordB) ||
        (c.keyword_a === keywordB && c.keyword_b === keywordA)) {
      return c;
    }
  }
  return null;
}

/**
 * 获取指定 Trial 的所有语义矛盾
 * @param {string} trialId
 * @returns {Array}
 */
function getSemanticContradictionsForTrial(trialId) {
  var contradictions = GAME_DATA.semantic_contradictions || [];
  return contradictions.filter(function(c) { return c.trial === trialId; });
}
