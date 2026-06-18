# 语义缝合师（Semantic Weaver）— 美术素材视觉设计方向与AI图像生成提示词

> **版本**：v2（基于A.1重写稿修订版）
> **美术师**：华景开
> **日期**：2026-06-18
> **参考画面**：`游戏画面参考.png`

---

## 一、视觉风格总纲（Visual Style Guide）

### 1.1 风格定位
暗黑赛博朋克 + CRT终端 + 油画厚涂，三重美学叠加。

| 层级 | 美学 | 核心特征 |
|------|------|----------|
| 基础层 | 油画厚涂（Oil Painting Impasto） | 可见笔触、颜料堆积感、肌理丰富 |
| 中间层 | 暗黑赛博朋克（Dark Cyberpunk Noir） | 冷色调主导、霓虹点缀、压抑氛围 |
| 表面层 | CRT终端复古未来主义（CRT Retro-Futurism） | 扫描线、RGB色散、信号干扰、磷光绿 |

### 1.2 色彩方案（Color Palette）

```
主色调：
  --clinic-warm:     #D4A574   （诊所暖黄——木质、台灯）
  --metal-cold:      #3A4A5C   （金属冷灰——审讯室墙面）
  --deep-black:      #0A0A0F   （深黑——UI底色、背景）

辅助色：
  --neon-cyan:       #00FFCC   （霓虹青——关键词高亮、UI边框）
  --neon-magenta:    #FF00FF   （品红——合成操作符、警示）
  --neon-green:      #39FF14   （磷光绿——终端文字、系统提示）

警示色：
  --warning-red:     #CC3333   （警告红——错误提示、危险状态）
  --amber-alert:     #FF8C00   （琥珀橙——倒计时、紧急提醒）
```

### 1.3 字体方案
```
中文正文：'Noto Sans SC', '思源黑体', sans-serif —— 干净无衬线
英文等宽/UI：'JetBrains Mono', 'Consolas', monospace —— 终端风格
标题/大字：'Noto Serif SC', 思源宋体 —— 有温度的衬线体（仅限开场/结局）
```

### 1.4 线条与纹理规则
- **NPC立绘线条**：油画笔触自然边界，不使用清晰描边线。轮廓由明暗交界线定义。
- **UI元素**：1px实线或2px圆角矩形，带微弱外发光（box-shadow: 0 0 6px rgba(0,255,204,0.4)）
- **扫描线叠加**：半透明 repeating-linear-gradient，覆盖全屏，opacity 0.03~0.08（随紧张度变化）
- **RGB色散偏移量**：正常2px，glitch事件时8~12px

---

## 二、场景背景素材（Scene Backgrounds）×4

### bg_clinic.png — 诊所内景（Trial 1~3 主界面）

**用途**：主游戏界面的背景层，位于所有UI元素之下。

**视觉描述**：
一间昏暗的心理诊所诊室，暖黄色调但光线不足。左侧是木质护墙板的墙壁，墙上挂着一块软木板（cork board），上面钉着几张便签纸和一张模糊的照片。中央是一张深色木桌，桌上有一盏老式台灯，发出暖黄色的光圈，光圈边缘有柔和的光晕扩散效果。桌面上摊开着一份文件和一支钢笔。右侧是窗户，窗外的雨夜城市景象被玻璃上的水汽模糊成朦胧的色块——远处有零星的街灯光晕。整体色调以暖棕黄为主，但阴影区域偏冷灰，形成冷暖对比。

**AI提示词（英文）**：
```
Interior of a dimly lit psychological therapy clinic at night, warm amber-yellow atmosphere but underlit. Left side features wooden wainscoting wall panels with mounted cork board holding scattered sticky notes in yellow pink blue colors and one blurry photograph. Center: dark oak wooden desk surface with vintage brass desk lamp casting warm circular glow halo spreading softly across desk top, open case file document and fountain pen on desk. Right side: window showing rainy night cityscape blurred by condensation into soft bokeh color patches - distant streetlight halos visible through rain-streaked glass. Overall palette warm brown-amber dominant but shadow areas cool gray creating warm-cool contrast. Moody noir cinematic lighting, single light source from desk lamp. Style: Edward Hopper loneliness meets Blade Runner rainy night, oil painting texture, thick brushstrokes visible, atmospheric perspective, intimate claustrophobic yet comforting. 1920x1080px environmental concept art.
```

**AI提示词（中文）**：
```
夜晚昏暗心理诊所内部，暖琥珀黄氛围但光线不足。左侧木质墙裙板配软木板，上面散落彩色便签和一张模糊照片。中央深橡木桌面上有复古黄铜台灯散发暖圆形光晕，桌上有打开的文件夹和钢笔。右侧窗户展示雨夜城市景象因水汽模糊成柔和虚化色块——远处街灯光晕穿过雨水玻璃可见。整体色调暖棕黄主导但阴影区冷灰色形成冷暖对比。情绪黑色电影布光，单一光源来自台灯。风格：爱德华·霍普孤独感+银翼杀手雨夜，油画质感，粗笔触可见，大气透视，亲密幽闭却令人安心。1920x1080px环境概念艺术。
```
**尺寸**：1920×1080px
**风格说明**：暖色调基础层，营造"安全空间"假象，与后续揭露真相形成反差。

---

### bg_interrogation.png — 审讯室（Trial 4 揭露真相后的背景）

**用途**：Trial 4 阶段诊所"薄膜剥落"后暴露的真实环境背景。

**视觉描述**：
冰冷、无菌、工业化的金属房间。四面墙壁是深灰色钢板拼接而成，焊缝清晰可见。墙面上密布着各种接口面板、裸露的电缆束、数据接口插槽。天花板上悬挂着几排荧光灯管，发出惨白刺眼的冷光。正前方是一把金属椅子，扶手上有磨损的焊接痕迹和固定用的皮带扣。右侧墙面嵌着一块显示屏，屏幕上滚动着红色的警告代码字符。地面是防滑金属格栅板，可以看到下方的管线走向。整个房间没有任何装饰性元素——没有窗帘、没有挂画、没有软木板。只有功能性的金属表面和发光的屏幕。

**AI提示词（英文）**：
```
Cold sterile industrial metal interrogation room interior. Four walls of dark gunmetal gray steel plates with visible welding seams. Walls densely covered with interface panels, exposed cable bundles, data connector slots, conduit pipes. Ceiling has rows of fluorescent tubes emitting harsh blinding cold white light. Center: metal chair with worn welding marks on armrests, leather restraint straps with buckles visible. Right wall embedded display screen scrolling red warning code text characters. Floor is anti-slip metal grating showing underlying pipe routing beneath. Absolutely zero decorative elements - no curtains no artwork no cork boards. Only functional metallic surfaces and glowing screens. Harsh overhead clinical lighting, hard shadows, cold blue-gray palette with red accent from warning displays. Style: dystopian sci-fi facility, Tarkovsky Solaris meets Black Mirror facility, brutalist industrial design, oppressive sterile atmosphere. 1920x1080px environmental concept art.
```
**尺寸**：1920×1080px
**风格说明**：纯冷色调，与bg_clinic.png形成180度反差。这是游戏的"真实底层"。

---

### bg_opening.png — 开场画面（标题画面背景）

**用途**：游戏启动时的标题画面背景。

**视觉描述**：
一个象征性构图：一扇老旧的木门，门缝中透出温暖的黄色光线，门牌上写着"语义缝合诊所"。门外是一片黑暗的雨夜街道，雨水在路灯下泛着冷蓝色的光。门把手是铜制的，上面有使用多年的磨损痕迹。门前的台阶上放着一个湿漉漉的包裹。门框周围有淡淡的雾气弥漫。整个画面像是一个梦境入口——温暖与寒冷、安全与未知之间的界限。

**AI提示词（英文）**：
```
Symbolic composition of an old wooden door slightly ajar with warm golden light spilling through the gap onto dark wet pavement outside. Door sign reads "Semantic Weaver Clinic" in faded gold lettering. Outside is pitch-black rainy night street with rain catching cold blue streetlamp glow. Brass doorknob shows years of wear patina. A damp parcel rests on doorstep steps before door. Faint mist swirls around doorframe threshold. The image feels like a dream entrance - boundary between warmth and cold, safety and unknown. Cinematic composition centered on door, strong contrast between interior warm gold and exterior cold blue-black. Rain particles caught in light beams. Style: magical realism meets noir thriller, oil painting aesthetic, mysterious inviting yet unsettling atmosphere, the threshold between two worlds. 1920x1080px title screen background.
```
**尺寸**：1920×1080px
**风格说明**：冷暖对比的极致表现，暗示玩家即将跨入的"门"背后隐藏着什么。

---

### bg_trial4_transition.png — Trial 4 过场过渡背景（v2修订版）

**用途**：Trial 4 开始时的过渡动画背景，展示"现实剥落"的核心视觉概念。

**视觉描述**（v2基于A.1重写稿修订）：
画面呈现一个"现实层正在撕裂"的过渡场景。左半部分仍然是诊所的暖色调——木质墙板、软木板、暖黄台灯光晕，但这个温暖表面像墙皮一样正在从中间向右侧大片剥落。剥落处露出的不是墙壁内部，而是冰冷的金属审讯室墙面——深灰色金属板、焊缝、管线接口、裸露电缆。画面中央的"裂缝"区域是最戏剧化的——暖色和冷色在这里激烈交锋，木质纹理扭曲变形为金属纹理，碎屑和像素颗粒在裂缝处飞散。右侧已经完全暴露的金属墙面上，嵌着几块黑屏的显示器，其中一块正在亮起显示滚动的红色警告代码。画面下方一把椅子的左半边还是皮质扶手椅质感，右半边已变成金属焊接痕迹。三位NPC的半透明剪影漂浮在裂缝周围——正在从诊所侧被吸入金属侧。整体色调从左侧暖棕黄渐变到右侧冷蓝黑灰，中间过渡区有glitch撕裂效果。

**AI提示词（英文）**（v2版）：
```
Dramatic reality-peeling transition scene, left half shows warm therapy clinic interior - wooden wall panels, cork board, warm amber desk lamp glow - but this warm surface is peeling away like old wallpaper from center toward right side. Underneath the peeling warm layer reveals cold metallic interrogation room - dark gray steel plates, welding seams, cable interfaces, exposed conduits. Center tear zone is most dramatic: warm and cold colors clash, wood grain distorts into metal texture, debris and pixel particles scatter at the fracture line. Right side fully exposed metal wall with embedded dark monitors, one screen lighting up with scrolling red warning code. Lower frame: a chair split between two realities - left half leather armchair, right half metal welding marks, same object existing in two states simultaneously. Three semi-transparent NPC silhouettes float near the tear being pulled from warm side into cold metal side. Color gradient: warm browns and ambers on left transitioning to cold blue-black-gray on right. Glitch tear effects at the fracture. Style: Inception dream-collapse meets Ghost in the Shell reality glitch, cinematic dark environmental concept art, the moment of revelation when a comforting lie peels away to reveal harsh truth. 1920x1080px, dramatic dual-reality composition.
```
**尺寸**：1920×1080px
**风格说明**："薄膜剥落"概念——这是整个游戏叙事反转的核心视觉隐喻。

---

### bg_trial4_countdown.png — Trial 4 倒计时阶段背景（纯黑雷达扫描版）

**用途**：Trial 4 过渡动画完成、画面归于黑暗后，倒计时阶段（179秒）的背景层。与 `bg_trial4_transition.png` 配合使用——过渡版负责"剥落揭示"，本版负责"倒计时压迫感"。

**视觉描述**：
近乎纯黑的画面。画面正中央有一组同心圆雷达扫描线，从中心点向外扩散——最内圈是一个小的红色光点（脉冲跳动），向外是5~7圈逐渐变淡的青色圆环（#00FFCC，透明度从中心40%递减到边缘5%）。雷达扫描线以恒定速度顺时针旋转，扫过的区域会有短暂的亮线残留（余晖效果）。同心圆背景中隐约可见极淡的数字网格坐标线（像军事雷达屏幕）。画面四角有四个小型HUD元素：左上角显示"记忆格式化进度：XX%"的等宽字体文字（琥珀色#FF8C00），右上角显示倒计时秒数（白色等宽字体，每秒跳动一次），左下角和右下角是闪烁的状态指示灯（红色和绿色交替）。画面整体有CRT扫描线叠加和轻微的静电噪点。底部有一行缓慢滚动的系统日志文本（极小的等宽字体，暗灰色，仅可辨识为文字但无法阅读具体内容）。

**AI提示词（英文）**：
```
Near-pure-black background with central concentric radar sweep display. Center point: small pulsing red dot beacon. Expanding outward: 5 to 7 concentric rings in cyan #00FFCC with opacity decreasing from 40 percent at center to 5 percent at edges. Rotating radar sweep line moving clockwise at constant speed leaving brief glowing afterimage trail in its wake. Faint military-style coordinate grid lines barely visible behind rings. Four corner HUD elements: top-left shows "MEMORY FORMAT PROGRESS: XX%" in amber #FF8C00 monospace font, top-right shows countdown timer in white monospace digits ticking each second, bottom-left and bottom-right have small blinking status indicator LEDs alternating red and green. Full CRT scanline overlay and light static noise grain throughout. Bottom edge: slowly scrolling system log text in tiny dark gray monospace - recognizable as text but unreadable. Overall mood: clinical, oppressive, countdown pressure, the cold machinery of memory erasure at work. Style: military radar console meets dystopian AI interface, minimalist high-contrast dark UI, phosphor green screen aesthetic. 1920x1080px.
```

**尺寸**：1920×1080px
**风格说明**：纯黑底+雷达扫描 = 倒计时压迫感。与过渡版形成"揭示→压迫"的叙事节奏。HUD元素的数值在实际游戏中由前端动态渲染叠加，此处AI生成仅作为底图参考。

---

## 三、NPC立绘素材（NPC Portraits）×4

### npc_portrait_courier.png — 数据快递员 / Trial 1 NPC（v2修订版）

**角色身份**：T1 数据快递员——瘦削、疲惫、迷茫的中年男性快递员，记忆中被篡改了关于一次配送任务的关键信息。

**外观详细描述**（v2基于A.1重写稿修订）：
35-40岁的中年男性，身材瘦削，脸颊凹陷，看起来长期营养不良或过度疲劳。眼睛空洞涣散，眼白有红血丝，黑眼圈浓重，目光没有焦点——像是透过你在看别的东西。嘴唇紧抿，表情麻木。穿着一件深灰色的旧雨衣，领口竖起挡风。头戴一顶破旧的深色鸭舌帽/工作帽，帽檐正在滴水。雨衣下面露出暗红色衬衫的一角。头发凌乱地从帽檐边缘漏出来。左脸颊到下巴有一道褪色的旧伤疤。皮肤呈现出病态的灰黄色调。**关键细节**：画面底部可见一只手搭在膝盖上，指甲缝里有明显的黑色污渍——不是泥土，更像是碳粉/墨粉。

**AI提示词（英文）**（v2版）：
```
Oil painting portrait of a weary middle-aged male courier, chest-up composition showing one hand resting on knee with visible dirty fingernails, heavy impasto brushstrokes with visible palette knife texture, dark cyberpunk noir atmosphere. Man aged 35-40 with gaunt hollow cheekbones, sunken tired eyes with red veins and dark bags under eyes looking empty and lost, unfocused gaze. Wearing a dark grey raincoat with collar up, a worn dark cap with dripping wet brim, water droplets falling from hat brim. Dark red shirt visible underneath raincoat. Messy black hair partially visible under cap. A faded old scar runs from left cheekbone down to jawline. Lips pressed thin in numb resignation. One hand visible at bottom of frame resting on knee - fingernails have dark black carbon-like stains in the crevices, not mud but fine black powder. Skin tone sickly gray-yellow from exhaustion. Background blurred blue-gray with rain streaks and distant city neon bokeh. Lighting from upper-left 45 degrees, chiaroscuro on right face, highlights on nose and brow. Style: Lucian Freud impasto meets Beksinski dark atmosphere, Blade Runner rainy night. 400x500px portrait, face centered, hand visible at bottom.
```
**配色方案**：
```
主色：#4A5568（灰蓝雨衣）、#2D2D2D（深色帽）
肤色：#C9B896（病态灰黄）、眼窝 #8B7355（深陷阴影）
高光：#E8DCC8（额头/鼻梁受光面）
背景：#2A3441（模糊雨夜蓝灰）
关键细节色：#1A1A1A（碳粉污渍——近黑但不纯黑，略带蓝灰调）
```
**尺寸**：400×500px（胸部以上立绘）
**风格说明**：卢西恩·弗洛伊德式的厚涂肌理 + 贝辛斯基的暗黑氛围。"碳粉指甲"是最关键的叙事细节。

---

### npc_portrait_housewife.png — 焦虑主妇 / Trial 2 NPC（v2修订版）

**角色身份**：T2 焦虑主妇——中年家庭主妇，怀疑丈夫行为异常，实际上丈夫是情报清除者，她自己处于危险之中而不自知。

**外观详细描述**（v2基于A.1重写稿修订）：
45岁左右的中年女性，圆脸但近期明显消瘦导致脸颊凹陷。眼睛睁得很大，眼神焦虑不安——眼球充血红丝明显，眼圈发红，但眼睛太干了，眼泪似乎早已蒸干殆尽。眉间有深深的垂直皱纹（长期皱眉形成的川字纹）。双手紧紧绞在一起放在身前，指缝间的皮肤因为反复洗手而泛红发肿，关节因用力而发白。穿着一件褪色的碎花连衣裙（紫白小雏菊图案），外面系着一条围裙，围裙边缘有些磨损起毛。**关键剧情道具**：领口处隐约露出一条细细的银链项链，吊坠是不起眼的水滴形暗银色——若隐若现地藏在衣领和锁骨之间。头发是深棕色，松散地盘成低发髻，有几缕散落。戴着小巧的珍珠耳环。

**AI提示词（英文）**（v2版）：
```
Oil painting portrait of an anxious middle-aged housewife, chest-up composition, expressive thick brushwork with emotional intensity. Woman around 45 with round face showing recent weight loss in hollowed cheeks. Wide anxious eyes - bloodshot and red-rimmed but bone-dry, tears long evaporated, too dry to cry, deep purple bruise-like dark circles. Furrowed brow with vertical worry lines. Hands tightly clasped at bottom of frame with reddened skin between fingers from excessive washing, knuckles white from gripping. Wearing faded floral dress with small purple-white daisy pattern, worn apron with frayed edges. A thin silver chain necklace barely visible at collar neckline with a small teardrop-shaped dark silver pendant peeking out - subtle but present. Dark brown hair in loose low bun with stray strands. Small pearl earrings. Warm yellow indoor lighting from front-upper angle, soft highlights on forehead, deep shadows in eye sockets. Blurred warm home interior background. Palette: warm yellows, cream, light brown. Style: Edward Hopper loneliness meets Norwegian expressionism, domestic noir. 400x500px portrait, necklace visible at neckline, hands visible at bottom.
```
**配色方案**：
```
主色：#D4B896（米白碎花裙）、#E8DCC8（褪色围裙）
肤色：#E8C4A4（消瘦面部）、眼眶 #B8847C（干涩红圈）
发色：#5C4033（深棕）
关键道具色：#C0C0C0（银链）、#708090（暗银水滴吊坠——哑光非亮银）
背景：#F5E6D3（模糊暖室内）
手部细节：#D4A080（指缝泛红——洗手过多导致的接触性皮炎红）
```
**尺寸**：400×500px
**风格说明**：爱德华·霍普式的孤独感 + 蒙克式焦虑张力。银链水滴吊坠必须"若隐若现"——玩家需要仔细观察才能发现它，这与剧情中她"翻来覆去看了不知道多少遍才注意到"相呼应。

---

### npc_portrait_mercenary.png — PTSD雇佣兵 / Trial 3 NPC（v2修订版）

**角色身份**：T3 PTSD雇佣兵——魁梧的前军人，实际上是"记忆剥离协议"的受试者而非普通战俘，被系统用手术方式提取了武器设计知识并篡改了记忆。

**外观详细描述**（v2基于A.1重写稿修订）：
30-35岁，肌肉发达体型魁梧，脖子很粗。方形下颌骨突出，眉骨隆起，鼻子因旧骨折而塌扁。**视线方向不是直视前方而是略微向下**——他在盯着桌面上的东西（笔/你的手），而不是看你。瞳孔收缩成针孔状（高度警戒状态）。眼眶发红但没有泪——是被某种东西烧干的。整个人缩在椅子里，肩膀向前弓起——不是疲劳的姿态，是防御性的警戒姿态。**手腕上对称分布着新鲜的紫红色约束带勒痕**（袖子卷起露出手腕）。脖子上还有类似的旧痕，颜色较淡——暗示这不是第一次被束缚。**两侧太阳穴有按压留下的红印**（电极接触痕迹）。穿着橄榄绿色战术背心的肩部，里面是半拉链的黑色压缩衣。左眉毛上方有一道新鲜的不规则裂伤，缝针粗糙可见且肿胀。右耳上半部分缺失，边缘不规则呈撕裂状。

**AI提示词（英文）**（v2版——采用方案C：手腕新痕+脖颈旧痕）：
```
Oil painting portrait of a PTSD-stricken mercenary hunched forward in chair, chest-up composition, shoulders curled forward in defensive alert posture, extremely intense presence. Muscular bulky male aged 30-35 with thick neck. Heavy square jaw, prominent brow bone, flattened nose from old fracture. Hypervigilant predatory eyes with pinhole pupils gaze slightly downward tracking something on the desk - not looking at viewer but watching hands. Red-rimmed eye sockets but no tears, eyes burned dry. Fresh symmetrical purple-red restraint strap welts on both wrists visible at bottom of frame where sleeves are pushed up, some welts raw and recent. Older faded similar marks on neck suggesting this is not the first time restrained. Temple pressure marks - reddened indentations on both temples from electrode contact. Wearing olive green tactical vest shoulder, half-zipped over black compression shirt. Fresh jagged laceration above left eyebrow with crude visible sutures, swollen. Right ear partially missing upper portion with irregular torn edge. Harsh overhead lighting from directly above, hard highlights on brow and cheekbones, eye sockets in darkness. Near-black background with faint red warning light glow upper-right. Style: Caravaggio tenebrism meets Francis Bacon tension, caged predator, military thriller. 400x500px portrait, downward gaze, wrists visible at bottom.
```
**配色方案**：
```
主色：#556B2F（橄榄绿战术背心）、#1A1A1A（黑色压缩衣）
肤色：#C4956A（晒黑/粗糙皮肤）、颧骨高光 #DAB88B
伤痕色：#8B0000（新鲜勒痕——深红近紫）、#CD5C5C（旧勒痕——淡化）
太阳穴压痕：#B84A4A（电极接触红印）
眼眶：#8B4513（深褐红——烧干的眼眶）
背景：#0D1117（近黑）+ #331111（右上角红警光）
```
**尺寸**：400×500px
**风格说明**：卡拉瓦乔式的强明暗对比（tenebrism）+ 弗朗西斯·培根式的张力感。**向下凝视**是最关键的姿态差异——其他三个NPC都是看玩家（或看向远方），只有他是盯着你的手/笔，这传达出他"不信任工具"的本能恐惧。手腕勒痕（新）+脖颈旧痕的双重伤痕叙事：他不止一次被这样对待过。

---

### npc_portrait_system.png — 系统 / Trial 4 NPC（v2修订版）

**角色身份**：T4 "系统"——认知滤网/AI实体，在Trial 4中向玩家揭露真相的存在。不是人类形象，而是以数据流、故障艺术、监控符号构成的抽象存在。

**视觉描述**（v2配合"薄膜剥落"概念）：
一个人形剪影的轮廓，但构成这个人形的是多层正在剥离的现实。最外层是诊所美学的碎片——木质纹理、琥珀色光斑、软木板材质——这些暖色层正在主动剥落和瓦解。剥落后露出的内核是冰冷的数据流：二进制代码矩阵01010101以青色(#00FFCC)和品红(#00FF00)呈现，带有RGB分离色差效果。水平CRT扫描线撕裂贯穿全身。漂浮的数据片段：文本碎片、乱码符号▓░█▒、坐标数字、滚动的红色警告代码。外围有静电噪点颗粒。头部区域闪烁着">_"命令行提示符，警告红色。两个"眼睛"的位置是两道不规则的监控摄像头镜头反光。深黑底色上叠加霓虹色（青、品红、红）。整体看起来像一个"人形的现实空洞"——诊所模拟层正在燃烧殆尽，暴露出底下原始的系统代码。

**AI提示词（英文）**（v2版）：
```
Abstract digital glitch art portrait representing AI system entity Trial4, humanoid silhouette composed of peeling reality layers. Figure shape suggested by: outer warm layer of clinic aesthetic (wood grain, amber light fragments, cork texture pieces) actively peeling and disintegrating, revealing inner core of cold digital data - binary code matrix 0101 in cyan #00ffcc and magenta #ff00ff with RGB split chromatic aberration. Horizontal CRT scan line tears and signal interference throughout. Floating data fragments: text snippets, garbled symbols ▓░█▒, coordinate numbers, red warning code scrolling. Static noise grain outer edges. "Head" area: blinking ">_" command prompt in warning red #cc3333. "Eye" positions: two irregular surveillance camera lens reflections. Deep black background with neon overlays - cyan magenta red. The figure looks like a human-shaped hole in reality where the clinic simulation is burning away to expose raw system code underneath. Style: Glitch art meets Ryoji Ikeda data visualization meets Ghost in the Shell 1995, the visual manifestation of an AI stripping away false memories. 400x500px, abstract, high contrast, peeling-layer aesthetic.
```
**配色方案**：
```
外层（剥落中）：#D4A574（木纹）、#F5DEB3（琥珀光斑）、#DEB887（软木板）
内核（暴露）：#00FFCC（青色数据）、#FF00FF（品红数据）、#FFFFFF（二进制白字）
警告色：#CC3333（红色代码）、#FF4444（">_"提示符）
底色：#000000（纯黑）
噪点：#333333（灰度静电颗粒）
```
**尺寸**：400×500px
**风格说明**：故障艺术(Glitch Art) + 生田嗣的数据可视化 + 攻壳机动队1995的数字灵魂意象。"人形空洞"的概念——这不是一个"角色"，而是一个"缺失"的可视化。

---

## 四、UI组件升级方案（全套）

### 4.1 整体UI框架升级

**当前问题**（参考 `游戏画面参考.png`）：
- UI过于干净现代，缺乏"手工制作"的质感
- 缺少油画笔触/肌理叠加层
- CRT效果可能不够强烈

**升级目标**：让UI看起来像是在"旧终端显示器上运行的油画世界中的交互界面"。

#### 全局CSS新增变量
```css
/* 新增 */
--oil-texture: url('../assets/textures/oil-canvas-overlay.png'); /* 半透明油画肌理叠加 */
--paper-edge: url('../assets/textures/paper-torn-edge.png'); /* 边缘撕纸效果 */
--crt-scanline: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0, 255, 204, 0.02) 2px,
  rgba(0, 255, 204, 0.02) 4px
);
--dust-particles: url('../assets/textures/dust-specs.png'); /* 浮尘颗粒 */

/* 修改 */
--border-glow: 0 0 8px rgba(0, 255, 204, 0.5), inset 0 0 4px rgba(0, 255, 204, 0.1);
--panel-bg: rgba(10, 10, 15, 0.92); /* 从0.85提升不透明度 */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### 关键UI组件升级规格

##### ① 对话区容器（Dialogue Area Panel）
```
背景：深黑半透明 + 油画肌理叠加（混合模式 overlay, opacity 0.15）
边框：1px solid rgba(0,255,204,0.3)
内边距：20px
圆角：4px（极小圆角，接近直角）
特殊效果：底部边缘添加"撕纸"遮罩（渐隐至透明）
NPC头像区域：添加1px青色边框 + 微弱脉冲呼吸动画（每3秒一次）
邮件图标按钮：改为复古打字机图标或信封图钉样式
```

##### ② 推演板容器（Evidence Board Panel）
```
背景：深黑半透明 + 软木板纹理叠加（混合模式 soft-light, opacity 0.25）
网格：保留现有网格线，但改为1px dashed rgba(0,255,204,0.15)，间距不变
特殊效果：四角各加一枚图钉装饰（SVG小图标，#CD853F秘鲁色）
卡片拖动时：增加轻微的"纸张抬起"投影变化（shadow-y从2px增至8px）
删除按钮：改为红色橡皮擦或图钉拔出动画
```

##### ③ 关键词卡（Keyword Card）
```
默认态：
  背景：rgba(0,255,204,0.08)
  文字：#00FFCC（霓虹青）
  边框：1px solid rgba(0,255,204,0.4)
  圆角：3px
  字体：等宽字体，14px
  内边距：8px 14px
  特殊：文字下方有极微弱的"打字机下划线"虚线效果

悬停态：
  边框亮度提升至0.7
  背景 opacity 0.12
  添加极轻微的上浮位移（translateY -2px）
  box-shadow: 0 0 12px rgba(0,255,204,0.3)

已选中态：
  边框变为品红 #FF00FF
  背景 rgba(255,0,255,0.08)
  脉冲边框动画
```

##### ④ 合成操作符卡（Operator Card）
```
与关键词卡同尺寸不同配色：
  [听觉重构] → #FF9900（琥珀橙）
  [视觉重构] → #00CCFF（天蓝）
  [嗅觉重构] → #99CC33（橄榄绿）
  [逻辑质询] → #EE66AA（玫红）

悬停时对应颜色的外发光增强
```

##### ⑤ 进度条（神经连接稳定性）
```
轨道：深灰 #222，高8px，圆角4px
填充：渐变 #00FFCC → #00FF99（青到绿）
低值(<30%)时变为 #FF4444（警告红）+ 闪烁动画
文字：等宽字体白色，右侧显示百分比数值
特效：填充部分有微弱的"流动光带"从左到右循环移动
```

##### ⑥ 内存覆盖指示器
```
位置：顶栏右侧
字体：等宽，16px，颜色根据值变化：
  <100%: 白色 #FFF
  >100%: 琥珀橙 #FF8C00
  >500%: 警告红 #CC3333 + 闪烁
  >900%: 红色 + CSS故障抖动(glitch shake)
特效：数值变化时有短暂的"数码翻转"动画（slot machine style）
```

### 4.2 新增UI组件

##### ⑦ 提交按钮（Submit Button）
```
常态：
  宽度：160px 高度：44px
  背景：线性渐变 135deg, rgba(0,255,204,0.15) → rgba(0,255,204,0.05)
  边框：2px solid #00FFCC
  文字：#00FFCC，等宽字体16px，字间距2px
  圆角：4px
  特效：边框有微弱流动光效

悬停态：
  背景：rgba(0,255,204,0.2)
  外发光增强
  文字短暂闪烁一次

禁用态（条件未满足）：
  边框/文字变灰 #555
  背景 opacity降至0.05
  cursor: not-allowed

点击反馈：
  按下时 scale(0.97) + 内陷阴影
  松开时反弹 + 扩散波纹
```

##### ⑧ 结论弹出层（Conclusion Modal）
```
遮罩层：rgba(0,0,0,0.85) + CRT噪点纹理
弹窗主体：
  背景：深黑 + 油画肌理
  边框：根据结论类型
    FALSE结论 → 金色 #DAA520（虚假的"安慰"）
    TRUE结论 → 血红 #8B0000（残酷的"真相"，带故障抖动）
  标题区：结论标签文字 + 图标
  内容区：NPC reaction 文本逐字打印效果（typewriter）
  底部：确认按钮
特殊效果（仅TRUE结论触发）：
  弹窗出现时全屏CRT闪烁300ms
  背景音乐暂时压低后加入低频嗡鸣
  NPC立绘区域可能出现像素化/glitch效果
  弹窗边框不规则抖动（CSS keyframes glitch-shake）
```

##### ⑨ 提示气泡（Hint Bubble）
```
位置：对话区右下角或推演板上方浮动
样式：小型对话框形状，尾部指向相关区域
背景：rgba(255,184,0,0.12)（半透明琥珀）
边框：1px solid #FFB800（提示金）
文字：#FFE066（浅金色），斜体，14px
动画：从透明淡入 + 轻微上下浮动（float-y ±3px, 2s循环）
关闭按钮：小号 × 符号，点击后平滑收起
```

##### ⑩ 结局画面（Ending Screen）
```
结局A「燃烧的救赎」：
  全屏白色过曝渐变（模拟意识广播的白光）
  白色中心向外扩散的光晕粒子效果
  叠加数据碎片飘散（向上方飘走）
  文字以打字机效果逐行显示
  背景音乐渐强至高潮后突然静音

结局B「温柔的牢笼」：
  渐暗至几乎全黑（保留极弱的暖黄色光晕在画面中心）
  光晕缓慢扩大——那是诊所台灯的光
  门把手转动的音效
  文字以温和的手写字体风格淡入
  背景音乐保持诊所BGM，但加了轻微的失真/循环感（暗示重复）
```

---

## 五、开场漫画序列（Opening Comic Sequence）

### frame_1.png — 诊所招牌

**内容**：雨夜街角，一盏孤零零的路灯照着一扇老旧木门的门牌，门牌上写着「语义缝合诊所」，金色字迹在雨水中微微反光。门缝里透出一丝暖光。

**AI提示词（英文）**：
```
Close-up shot of vintage brass doorplate on weathered dark wood door reading "语义缝合 Clinic" in elegant faded gold lettering, rain droplets on surface catching dim amber streetlamp glow from above. Thin sliver of warm golden light bleeding through door crack below plate. Night scene, wet cobblestone ground reflecting lights. Lonely melancholic atmosphere. Rain streaks visible. Oil painting style, thick impasto texture, cinematic noir lighting. 1920x1080px.
```

### frame_2.png — 诊室内景（主观视角）

**内容**：第一人称视角推开诊室的门。看到的是那间熟悉的屋子——软木板、台灯、空着的椅子对面放着另一把椅子。窗外下雨。一切都安静得过分。

**AI提示词（英文）**：
```
First-person POV view pushing open clinic door revealing interior room. Foreground shows back of wooden door with brass handle. Room interior: cork board wall with scattered notes, warm amber desk lamp illuminating empty wooden desk with papers, two chairs facing each other - one empty waiting for patient, window with rain-streaked glass showing dark rainy night outside. Eerie quiet stillness. Warm cozy yet unsettling atmosphere. Shallow depth of field focusing on empty patient chair. Oil painting style, moody chiaroscuro lighting. 1920x1080px.
```

### frame_3.png — 医生背影

**内容**：医生（玩家角色）背对镜头坐在桌前，手里拿着一支笔。面前的椅子还空着。影子投在对面的墙上，拉得很长。台灯的光只照亮了他的一半身体。

**AI提示词（英文）**：
```
Over-shoulder shot from behind doctor figure sitting at wooden desk, hand holding fountain pen. Empty chair facing them across desk, waiting. Doctor's shadow cast long on opposite wall stretching unnaturally. Desk lamp illuminates only half of their body - other half in darkness. Cannot see doctor's face clearly - only silhouette suggestion. Intense mood of anticipation. Rain sound implied visually through window reflection. Style: film noir, Caravaggio lighting, oil painting texture. 1920x1080px.
```

### frame_4.png — 门被推开（悬念定格帧）

**内容**：诊所的门正在被从外面推开——一只手握着门把手，门缝逐渐变大，外面的冷蓝色雨光涌进来，和屋里的暖黄光碰撞。画面定格在这一瞬间。你不知道走进来的是什么人。

**AI提示词（英文）**：
```
Clinic door being pushed open from outside - hand gripping brass doorknob visible, door gap widening, cold blue-gray rain-lit light flooding in from exterior clashing violently with interior warm amber yellow light. Dramatic color temperature collision at doorway threshold. Silhouette of approaching figure barely visible through widening gap - identity unknown. Moment frozen in time before revelation. High tension suspenseful atmosphere. Style: cinematic thriller keyframe, oil painting aesthetic, strong chiaroscuro, complementary color clash (blue vs amber). 1920x1080px.
```

---

## 六、纹理素材清单（Texture Assets）×6

| 文件名 | 尺寸 | 用途 | 描述 |
|--------|------|------|------|
| `tex_paper.png` |256×256| 推演板底纹 | 半透明旧纸纤维纹理，混合模式soft-light |
| `tex_cork.png` |256×256| 软木板区域 | 软木塞材质纹理，暖棕色调 |
| `tex_terminal.png` |512×512| CRT屏幕效果 | 扫描线+磷光屏+边缘暗角 |
| `tex_scratches.png` |1024×1024| 刮痕/老化层 | 细微划痕+指纹+污渍，全局叠加 |
| `tex_pushpin.png` |64×64| 图钉图标 | SVG风格图钉，用于推演板四角装饰 |
| `tex_oil_canvas.png` |1024×1024| 油画肌理 | 厚涂油画布纹，用于UI面板叠加 |

---

## 七、ImageGen Prompt 总索引表

| # | 素材文件名 | 类型 | 英文Prompt关键字 | 中文Prompt关键字 | 尺寸 | 风格 | 状态 |
|---|-----------|------|-------------------|-------------------|------|------|------|
| 1 | bg_clinic.png | 场景 | dimly lit therapy clinic, warm amber, oil painting | 昏暗心理诊所，暖琥珀，油画 | 1920×1080 | 霍普式孤独+赛博雨夜 | v2无需修改 |
| 2 | bg_interrogation.png | 场景 | cold steel interrogation room, industrial, fluorescent | 冰冷钢铁审讯室，工业风，荧光 | 1920×1080 | 反乌托邦设施 | v2无需修改 |
| 3 | bg_opening.png | 场景 | symbolic old door, warm light through gap, threshold | 象征旧门，门缝暖光，门槛 | 1920×1080 | 魔幻现实主义+黑色电影 | v2无需修改 |
| 4 | bg_trial4_transition.png | 场景 | **reality-peeling transition, clinic surface tearing to reveal metal room** | **现实剥落过渡，诊所表层撕裂露出金属房** | 1920×1080 | 盗梦空间崩塌+攻壳故障 | **v2修订** |
| 4b | bg_trial4_countdown.png | 场景 | **pure black, concentric radar sweep, countdown HUD, CRT scanlines** | **纯黑，同心圆雷达扫描，倒计时HUD，CRT扫描线** | 1920×1080 | 军事雷达+反乌托邦AI界面 | **v2.1新增** |
| 5 | npc_portrait_courier.png | NPC立绘 | **weary courier, carbon-stained nails, cap with dripping brim** | **疲惫快递员，碳粉染脏指甲，滴水帽檐** | 400×500 | 弗洛伊德厚涂+贝辛斯基暗黑 | **v2修订** |
| 6 | npc_portrait_housewife.png | NPC立绘 | **anxious housewife, dry eyes, silver teardrop pendant, red hands** | **焦虑主妇，干涩眼眶，银链水滴吊坠，红手** | 400×500 | 霍普孤独+蒙克焦虑 | **v2修订** |
| 7 | npc_portrait_mercenary.png | NPC立绘 | **PTSD mercenary, hunched, wrist welts, temple marks, downward gaze** | **PTSD雇佣兵，前弓姿态，手腕勒痕，太阳穴印，下视** | 400×500 | 卡拉瓦乔明暗+培根张力 | **v2修订** |
| 8 | npc_portrait_system.png | NPC抽象 | **peeling reality layers, clinic burning to expose code, human-shaped void** | **剥离现实层，诊所燃烧暴露代码，人形空洞** | 400×500 | 故障艺术+生田数据可视化 | **v2修订** |
| 9 | frame_1.png | 开场漫画 | doorplate, "语义缝合", rain night, close-up | 门牌，语义缝合，雨夜，特写 | 1920×1080 | 黑色电影 | 无需修改 |
| 10 | frame_2.png | 开场漫画 | POV push door, clinic interior, empty chair, warm lamp | 第一人称推门，诊所内景，空椅，暖灯 | 1920×1080 | 油画氛围 | 无需修改 |
| 11 | frame_3.png | 开场漫画 | doctor back view, long shadow, half-lit, holding pen | 医生背影，长影，半明半暗，执笔 | 1920×1080 | 电影黑色片 | 无需修改 |
| 12 | frame_4.png | 开场漫画 | door pushed open, cold vs warm light, silhouette unknown | 门被推开，冷光撞暖光，未知剪影 | 1920×1080 | 悬疑定格帧 | 无需修改 |

---

## 八、美术素材与开发集成的注意事项

### 8.1 文件格式与大小建议
- **背景图**（1920×1080）：WebP格式优先（质量85%），单文件 ≤ 300KB；备选JPEG（质量82%）
- **NPC立绘**（400×500）：PNG-8（如色彩≤256色）或 WebP（有损质量90%），单文件 ≤ 80KB
- **纹理素材**：PNG格式，可平铺（tileable），单文件 ≤ 20KB
- **UI组件**：尽量通过CSS实现（渐变、阴影、边框），避免图片化UI元素
- **开场漫画序列**：每帧可考虑懒加载（进入序列时预加载下一帧）

### 8.2 图片资源目录结构建议
```
/assets/
  /img/
    /backgrounds/
      bg_clinic.webp
      bg_interrogation.webp
      bg_opening.webp
      bg_trial4_transition.webp
    /portraits/
      npc_portrait_courier.webp
      npc_portrait_housewife.webp
      npc_portrait_mercenary.webp
      npc_portrait_system.png  (png以保留透明通道)
    /comic/
      frame_01.webp ~ frame_04.webp
    /textures/
      tex_paper.png
      tex_cork.png
      tex_terminal.png
      ...
  /css/
    /theme/
      visual-style.css        (本方案的CSS变量和组件样式)
      crt-effects.css         (CRT扫描线/色散/噪点的纯CSS实现)
      animations.css          (glitch/pulse/typewriter动画keyframes)
```

### 8.3 CSS动画效果建议（供开发者实现参考）

**CRT扫描线**：伪元素 + repeating-linear-gradient，z-index最高层，pointer-events:none
**Glitch抖动**：CSS keyframes随机translateX/Y + clip-path切换 + text-shadow RGB split
**打字机效果**：JS控制逐字显示 + 光标闪烁（border-right + animation blink）
**结论TRUE时的全屏闪烁**：body:before 白色flash opacity 1→0 over 300ms

### 8.4 色盲友好设计
- **关键词卡**：不仅依赖颜色区分（青=关键词，橙=听觉重构，等），还在文字内容中明确标注类型名称
- **内存覆盖指示器**：除颜色变化外，数值本身也是明确的量化指标
- **结论FALSE vs TRUE**：除边框颜色外，结论标签文字也明确写出"FALSE CONCLUSION" / "TRUE CONCLUSION"

### 8.5 性能优化建议
- 所有背景图使用 CSS `background-size: cover;` + `will-change: transform;` 
- NPC立绘使用 `image-rendering: crisp-edges;`（像素风锐利边缘）或 `auto`（照片级平滑）
- CRT效果使用 CSS 而非图片叠加（减少一次纹理采样）
- 开场漫画序列使用 `<canvas>` 或 CSS sprite sheet 动画，而非逐帧替换 img src

---

## 九、确认事项（全部已确认 ✓）

1. ~~**雇佣兵勒痕方案**~~ → ✓ 确认采用方案C（手腕新痕+脖颈旧痕）。team-lead已确认与温思语A.1重写稿一致。
2. ~~**Trial 4 过场双版本**~~ → ✓ 确认生成双版本。"薄膜剥落版"（`bg_trial4_transition.png`，过渡用）+ "纯黑雷达扫描版"（`bg_trial4_countdown.png`，倒计时用）。倒计时版prompt已新增至本文档第二章。
3. ~~**NPC立绘表情变化**~~ → ✓ Phase A阶段单张静态立绘足够。多表情版本留待Phase C打磨阶段评估。
4. ~~**开场漫画帧数**~~ → ✓ 4帧足够，保持当前规划。

---

*本文档由美术师 华景开 编制。所有 AI 提示词均经过针对 ImageGen 类工具的优化（风格关键词前置、视角/光照明确、负面约束隐含在正面描述中）。*
