/**
 * 黄帝内经五行饮食知识库
 * 基于《黄帝内经》五行理论：木火土金水 → 春夏长夏秋冬 → 青赤黄白黑 → 酸苦甘辛咸 → 肝心脾肺肾
 */

export interface FiveElement {
  id: number
  elementName: string  // 五行名
  season: string       // 对应季节
  seasonCn: string     // 季节中文
  monthRange: string   // 大致月份
  color: string        // 五色
  colorHex: string     // 颜色代码
  taste: string        // 五味
  organ: string        // 五脏
  organDesc: string    // 养护说明
  elementEmoji: string
}

export interface WuxingFood {
  id: string
  name: string
  elementId: number
  nature: string       // 性味
  meridians: string    // 归经
  effect: string       // 功效
  seasonMonths: string // 应季月份
  recipes: {
    chinese: { name: string; method: string }
    western: { name: string; method: string }
    fusion: { name: string; method: string }
  }
}

// 五行基础数据
export const fiveElements: FiveElement[] = [
  {
    id: 1, elementName: '木', season: 'spring', seasonCn: '春季',
    monthRange: '2月-4月', color: '青', colorHex: '#4ADE80',
    taste: '酸', organ: '肝', organDesc: '春季主肝，宜食青色、微酸食材以助阳气生发',
    elementEmoji: '🌱'
  },
  {
    id: 2, elementName: '火', season: 'summer', seasonCn: '夏季',
    monthRange: '5月-7月', color: '赤', colorHex: '#EF4444',
    taste: '苦', organ: '心', organDesc: '夏季主心，宜食红色、微苦食材以清心火、补心血',
    elementEmoji: '🔥'
  },
  {
    id: 3, elementName: '土', season: 'late_summer', seasonCn: '长夏',
    monthRange: '7月-8月', color: '黄', colorHex: '#F59E0B',
    taste: '甘', organ: '脾', organDesc: '长夏主脾，湿热交蒸，宜食黄色、甘味食材以健脾祛湿',
    elementEmoji: '🌾'
  },
  {
    id: 4, elementName: '金', season: 'autumn', seasonCn: '秋季',
    monthRange: '8月-10月', color: '白', colorHex: '#E5E7EB',
    taste: '辛', organ: '肺', organDesc: '秋季主肺，气候干燥，宜食白色、微辛食材以润肺生津',
    elementEmoji: '🍂'
  },
  {
    id: 5, elementName: '水', season: 'winter', seasonCn: '冬季',
    monthRange: '11月-1月', color: '黑', colorHex: '#6B7280',
    taste: '咸', organ: '肾', organDesc: '冬季主肾，天寒地冻，宜食黑色、微咸食材以藏精固肾',
    elementEmoji: '❄️'
  }
]

// 根据当前日期获取应季元素
export function getCurrentSeasonElement(): FiveElement {
  const month = new Date().getMonth() + 1
  if (month >= 2 && month <= 4) return fiveElements[0]  // 春
  if (month >= 5 && month <= 7) return fiveElements[1]  // 夏
  if (month === 8) return fiveElements[2]               // 长夏
  if (month >= 9 && month <= 10) return fiveElements[3] // 秋
  return fiveElements[4]                                 // 冬
}

// ============ 春季食材（15种）============
const springFoods: WuxingFood[] = [
  { id: 'spring_01', name: '韭菜', elementId: 1, nature: '辛、温', meridians: '肝、胃、肾', effect: '温中行气，散瘀解毒', seasonMonths: '2-4月',
    recipes: { chinese: { name: '韭菜炒鸡蛋', method: '韭菜切段，鸡蛋打散炒熟盛出；炒韭菜至软加盐，混入鸡蛋炒匀' }, western: { name: '韭菜芝士焗蛋', method: '韭菜切碎与鸡蛋、牛奶、奶酪碎混合，烤碗180℃焗15分钟' }, fusion: { name: '韭菜盒子', method: '烫面包韭菜鸡蛋粉丝馅，平底锅少油烙至两面金黄' } }
  },
  { id: 'spring_02', name: '菠菜', elementId: 1, nature: '甘、凉', meridians: '肝、胃、大肠', effect: '养血滋阴，润燥', seasonMonths: '2-4月',
    recipes: { chinese: { name: '蒜蓉炒菠菜', method: '热油爆蒜末，下菠菜快炒加盐出锅' }, western: { name: '奶油焗菠菜', method: '菠菜焯水挤干，白酱拌匀撒马苏里拉，200℃焗10分钟' }, fusion: { name: '菠菜鸡蛋烘饼', method: '菠菜焯水切碎与蛋液、面粉拌匀，平底锅摊饼烘熟' } }
  },
  { id: 'spring_03', name: '荠菜', elementId: 1, nature: '甘、平', meridians: '肝、脾、膀胱', effect: '清肝明目，利尿止血', seasonMonths: '2-4月',
    recipes: { chinese: { name: '荠菜猪肉饺子', method: '荠菜焯水挤干切碎，与肉末调馅包饺子煮熟' }, western: { name: '荠菜乳酪烘蛋', method: '荠菜切碎与乳清干酪、鸡蛋混合，烤碗焗烤' }, fusion: { name: '荠菜豆腐羹', method: '嫩豆腐切丁，清汤煮开加荠菜碎勾芡，淋蛋花' } }
  },
  { id: 'spring_04', name: '香椿', elementId: 1, nature: '辛、温', meridians: '肝、胃、肾', effect: '健脾开胃，养肝', seasonMonths: '3-4月',
    recipes: { chinese: { name: '香椿炒鸡蛋', method: '香椿焯水切末，与鸡蛋同炒' }, western: { name: '香椿香蒜酱抹法棍', method: '香椿+大蒜+橄榄油打酱，抹法棍片烤热' }, fusion: { name: '香椿豆腐丸子', method: '老豆腐捏碎加香椿末、盐、面粉，搓丸蒸10分钟' } }
  },
  { id: 'spring_05', name: '豌豆苗', elementId: 1, nature: '甘、微寒', meridians: '肝、胃', effect: '清肝明目，利水', seasonMonths: '3-4月',
    recipes: { chinese: { name: '清炒豌豆苗', method: '热油快炒加盐' }, western: { name: '豌豆苗培根浓汤', method: '煎培根出油，炒洋葱土豆加鸡汤煮软打泥' }, fusion: { name: '豌豆苗鸡蛋饼', method: '蛋液+豌豆苗碎+盐，平底锅摊饼' } }
  },
  { id: 'spring_06', name: '春笋', elementId: 1, nature: '甘、寒', meridians: '肝、胃、肺', effect: '清热化痰，消食', seasonMonths: '3-4月',
    recipes: { chinese: { name: '油焖春笋', method: '春笋切块焯水去涩，少油加酱油焖煮' }, western: { name: '春笋奶油浓汤', method: '春笋+土豆+洋葱炒香加鸡汤煮软打泥' }, fusion: { name: '春笋鸡肉焖饭', method: '鸡腿肉炒香加春笋丁、生米、鸡汤焖熟' } }
  },
  { id: 'spring_07', name: '芦笋', elementId: 1, nature: '甘、微寒', meridians: '肝、肺、膀胱', effect: '清热解毒，利尿', seasonMonths: '3-5月',
    recipes: { chinese: { name: '清炒芦笋', method: '芦笋切段热油快炒加盐' }, western: { name: '烤芦笋配蒜香黄油', method: '芦笋淋蒜香黄油200℃烤10分钟' }, fusion: { name: '芦笋鸡肉烩饭', method: '鸡腿肉煎香加生米、鸡汤、芦笋丁炖煮至饭熟' } }
  },
  { id: 'spring_08', name: '芹菜', elementId: 1, nature: '甘、凉', meridians: '肝、胃、肺', effect: '平肝清热，祛风', seasonMonths: '3-5月',
    recipes: { chinese: { name: '芹菜香干炒肉丝', method: '芹菜切段，香干切条，瘦肉丝同炒' }, western: { name: '烤芹菜核桃温沙拉', method: '芹菜焯水与烤核桃混合，淋温热油醋汁' }, fusion: { name: '芹菜小米粥', method: '小米煮稠粥加芹菜碎、少许盐' } }
  },
  { id: 'spring_09', name: '茼蒿', elementId: 1, nature: '甘、辛、凉', meridians: '肝、心、胃', effect: '安神养肝，消食', seasonMonths: '2-4月',
    recipes: { chinese: { name: '蒜蓉炒茼蒿', method: '同菠菜做法' }, western: { name: '茼蒿芝士焗蛋', method: '茼蒿+蛋液+奶酪焗' }, fusion: { name: '茼蒿豆腐汤', method: '豆腐切块清汤煮开加茼蒿、盐、麻油' } }
  },
  { id: 'spring_10', name: '马兰头', elementId: 1, nature: '辛、凉', meridians: '肝、胃、肺', effect: '清热解毒，凉血', seasonMonths: '3-4月',
    recipes: { chinese: { name: '马兰头拌香干', method: '焯水挤干切碎拌香干，麻油盐' }, western: { name: '马兰头乳酪意饺', method: '马兰头+乳清干酪做馅包饺，配热黄油酱' }, fusion: { name: '马兰头蛋花汤', method: '清汤煮开撒马兰头碎淋蛋花' } }
  },
  { id: 'spring_11', name: '蒜苗', elementId: 1, nature: '辛、温', meridians: '脾、胃、肺', effect: '温中下气，杀菌', seasonMonths: '3-5月',
    recipes: { chinese: { name: '蒜苗炒腊肉', method: '腊肉切片蒜苗切段同炒' }, western: { name: '蒜苗烤鸡腿', method: '烤盘铺蒜苗段放鸡腿200℃烤25分钟' }, fusion: { name: '蒜苗鸡蛋煎饼', method: '蛋液+蒜苗碎烙饼' } }
  },
  { id: 'spring_12', name: '蚕豆', elementId: 1, nature: '甘、平', meridians: '脾、胃', effect: '健脾利湿', seasonMonths: '4-5月（春末）',
    recipes: { chinese: { name: '葱油蚕豆', method: '蚕豆煮熟热油爆葱花淋上' }, western: { name: '蚕豆泥配烤羊排', method: '蚕豆煮软打泥加奶油配煎羊排' }, fusion: { name: '蚕豆焖饭', method: '大米+蚕豆+咸肉丁电饭煲焖' } }
  },
  { id: 'spring_13', name: '豌豆', elementId: 1, nature: '甘、平', meridians: '脾、胃', effect: '和中下气，利水', seasonMonths: '4-5月（春末）',
    recipes: { chinese: { name: '豌豆炒肉末', method: '肉末炒香加豌豆盐炒熟' }, western: { name: '豌豆泥配煎三文鱼', method: '豌豆打泥配煎三文鱼' }, fusion: { name: '豌豆胡萝卜焖饭', method: '大米+豌豆+胡萝卜焖熟' } }
  },
  { id: 'spring_14', name: '草莓', elementId: 1, nature: '甘、酸、凉', meridians: '肺、脾', effect: '润肺生津，消食', seasonMonths: '4-5月（春末）',
    recipes: { chinese: { name: '草莓银耳羹', method: '银耳煮出胶加草莓块稍煮1分钟' }, western: { name: '草莓烤鸡胸', method: '草莓泥+蜂蜜腌鸡胸200℃烤20分钟' }, fusion: { name: '草莓荞麦粥', method: '荞麦煮粥关火前拌入草莓丁' } }
  },
  { id: 'spring_15', name: '桑葚', elementId: 1, nature: '甘、酸、寒', meridians: '肝、肾', effect: '滋阴补血，乌发', seasonMonths: '4-5月（春末）',
    recipes: { chinese: { name: '桑葚红枣粥', method: '大米+红枣煮粥最后加鲜桑葚稍煮' }, western: { name: '桑葚酱烤鸭', method: '桑葚熬浓酱抹鸭胸烤' }, fusion: { name: '桑葚核桃糕', method: '面粉+桑葚泥+核桃碎蒸糕' } }
  },
]

// ============ 夏季食材（15种）============
const summerFoods: WuxingFood[] = [
  { id: 'summer_01', name: '红豆', elementId: 2, nature: '甘、酸、平', meridians: '心、小肠', effect: '利水消肿，补血养心', seasonMonths: '5-7月',
    recipes: { chinese: { name: '红豆薏米粥', method: '红豆+薏米浸泡2小时煮至开花，加少量冰糖' }, western: { name: '红豆南瓜浓汤', method: '南瓜+红豆+鸡汤煮软打泥' }, fusion: { name: '红豆莲子羹', method: '红豆+莲子+红枣煮至软糯' } }
  },
  { id: 'summer_02', name: '番茄', elementId: 2, nature: '甘、酸、微寒', meridians: '肝、脾、胃', effect: '生津止渴，健胃消食', seasonMonths: '5-8月',
    recipes: { chinese: { name: '番茄炒蛋', method: '经典家常' }, western: { name: '番茄罗勒烤鸡腿', method: '番茄块+罗勒+鸡腿200℃烤25分钟' }, fusion: { name: '番茄土豆浓汤', method: '番茄+土豆+洋葱打泥加热' } }
  },
  { id: 'summer_03', name: '红苋菜', elementId: 2, nature: '甘、凉', meridians: '肝、大肠', effect: '清热解毒，补血', seasonMonths: '5-8月',
    recipes: { chinese: { name: '蒜蓉炒红苋菜', method: '热油爆蒜末下苋菜快炒加盐' }, western: { name: '红苋菜芝士焗蛋', method: '苋菜+蛋液+奶酪焗' }, fusion: { name: '红苋菜豆腐汤', method: '苋菜+嫩豆腐煮汤' } }
  },
  { id: 'summer_04', name: '樱桃', elementId: 2, nature: '甘、温', meridians: '脾、肝', effect: '补血益肾，健脾开胃', seasonMonths: '5-6月',
    recipes: { chinese: { name: '樱桃银耳羹', method: '银耳煮软加樱桃稍煮' }, western: { name: '樱桃烤鸡胸', method: '樱桃泥+蜂蜜腌鸡胸烤' }, fusion: { name: '樱桃荞麦粥', method: '荞麦粥拌入樱桃丁' } }
  },
  { id: 'summer_05', name: '甜红椒', elementId: 2, nature: '甘、温', meridians: '心、脾', effect: '温中散寒，开胃消食', seasonMonths: '6-8月',
    recipes: { chinese: { name: '红椒炒肉片', method: '红椒切块与肉片同炒' }, western: { name: '烤红椒配羊奶酪', method: '红椒烤软去皮塞羊奶酪' }, fusion: { name: '红椒鸡蛋饼', method: '蛋液+红椒丁烙饼' } }
  },
  { id: 'summer_06', name: '苦瓜', elementId: 2, nature: '苦、寒', meridians: '心、脾、肺', effect: '清暑解热，明目', seasonMonths: '6-8月',
    recipes: { chinese: { name: '苦瓜炒蛋', method: '苦瓜切片焯水去苦与鸡蛋同炒' }, western: { name: '苦瓜酿肉', method: '苦瓜圈塞肉末蒸熟' }, fusion: { name: '苦瓜黄豆排骨汤', method: '苦瓜+黄豆+排骨炖汤' } }
  },
  { id: 'summer_07', name: '莲子', elementId: 2, nature: '甘、涩、平', meridians: '心、脾、肾', effect: '养心安神，健脾止泻', seasonMonths: '7-9月',
    recipes: { chinese: { name: '莲子百合粥', method: '莲子+百合+大米煮粥' }, western: { name: '莲子南瓜浓汤', method: '莲子+南瓜+鸡汤打泥' }, fusion: { name: '莲子红枣糕', method: '莲子泥+红枣+糯米粉蒸糕' } }
  },
  { id: 'summer_08', name: '冬瓜', elementId: 2, nature: '甘、淡、凉', meridians: '肺、小肠、膀胱', effect: '清热利水，消暑', seasonMonths: '6-8月',
    recipes: { chinese: { name: '冬瓜排骨汤', method: '排骨焯水加冬瓜块姜片炖1小时' }, western: { name: '冬瓜奶油浓汤', method: '冬瓜+土豆+鸡汤打泥' }, fusion: { name: '冬瓜蒸肉丸', method: '冬瓜片包裹肉丸蒸熟' } }
  },
  { id: 'summer_09', name: '黄瓜', elementId: 2, nature: '甘、凉', meridians: '肺、胃、大肠', effect: '清热利水，解毒', seasonMonths: '5-8月',
    recipes: { chinese: { name: '黄瓜炒鸡蛋', method: '黄瓜切片快炒' }, western: { name: '烤黄瓜配酸奶酱', method: '黄瓜烤软淋希腊酸奶酱' }, fusion: { name: '黄瓜紫菜汤', method: '黄瓜片+紫菜+蛋花' } }
  },
  { id: 'summer_10', name: '丝瓜', elementId: 2, nature: '甘、凉', meridians: '肺、肝、胃', effect: '清热化痰，凉血', seasonMonths: '6-8月',
    recipes: { chinese: { name: '蒜蓉炒丝瓜', method: '热油爆蒜末下丝瓜炒软加盐' }, western: { name: '丝瓜奶酪烘蛋', method: '丝瓜片+蛋液+奶酪焗' }, fusion: { name: '丝瓜豆腐汤', method: '丝瓜+豆腐+姜丝煮汤' } }
  },
  { id: 'summer_11', name: '空心菜', elementId: 2, nature: '甘、寒', meridians: '肝、心、大肠', effect: '清热解毒，利尿', seasonMonths: '5-8月',
    recipes: { chinese: { name: '蒜蓉炒空心菜', method: '大火快炒加盐' }, western: { name: '空心菜芝士焗意面', method: '空心菜焯水拌意面撒奶酪烤' }, fusion: { name: '空心菜蛋花汤', method: '水煮开加空心菜淋蛋花' } }
  },
  { id: 'summer_12', name: '玉米', elementId: 2, nature: '甘、平', meridians: '胃、大肠', effect: '调中开胃，利尿', seasonMonths: '6-8月',
    recipes: { chinese: { name: '玉米排骨汤', method: '排骨+玉米段+胡萝卜炖1小时' }, western: { name: '玉米浓汤', method: '玉米粒+土豆+鸡汤打泥' }, fusion: { name: '玉米胡萝卜焖饭', method: '大米+玉米粒+胡萝卜焖熟' } }
  },
  { id: 'summer_13', name: '毛豆', elementId: 2, nature: '甘、平', meridians: '脾、胃', effect: '健脾宽中，润燥', seasonMonths: '6-8月',
    recipes: { chinese: { name: '盐水毛豆', method: '毛豆剪两端水加盐八角煮10分钟' }, western: { name: '毛豆泥配煎鱼', method: '毛豆煮软打泥配煎鱼' }, fusion: { name: '毛豆炒肉末', method: '毛豆焯水与肉末同炒' } }
  },
  { id: 'summer_14', name: '桃子', elementId: 2, nature: '甘、酸、温', meridians: '肺、大肠', effect: '生津润肠，活血', seasonMonths: '6-8月',
    recipes: { chinese: { name: '桃子银耳羹', method: '银耳煮软加桃块稍煮' }, western: { name: '桃子烤鸡', method: '桃泥腌鸡腿烤' }, fusion: { name: '桃子小米粥', method: '小米煮粥加桃丁' } }
  },
  { id: 'summer_15', name: '杏', elementId: 2, nature: '酸、温', meridians: '肝、心', effect: '生津止渴，润肺', seasonMonths: '6-7月',
    recipes: { chinese: { name: '杏干红枣粥', method: '杏干+红枣+大米煮粥' }, western: { name: '杏酱烤鸭', method: '杏熬酱抹鸭胸烤' }, fusion: { name: '杏仁露（南杏仁）', method: '南杏仁+糯米浸泡打浆煮沸，温热饮用' } }
  },
]

// 由于内容很长，其他季节用紧凑格式...
const lateSummerFoods: WuxingFood[] = [
  { id: 'ls_01', name: '小米', elementId: 3, nature: '甘、凉', meridians: '脾、胃、肾', effect: '健脾和胃，安眠', seasonMonths: '7-8月', recipes: { chinese: { name: '小米红枣粥', method: '小米+红枣煮粥' }, western: { name: '小米南瓜浓汤', method: '小米+南瓜+鸡汤打泥' }, fusion: { name: '小米蒸糕', method: '小米粉+鸡蛋调糊蒸20分钟' } } },
  { id: 'ls_02', name: '南瓜', elementId: 3, nature: '甘、温', meridians: '脾、胃', effect: '补中益气，解毒', seasonMonths: '7-10月', recipes: { chinese: { name: '清炒南瓜', method: '蒜末爆香炒软加盐' }, western: { name: '南瓜烤鸡腿', method: '南瓜块垫底放鸡腿烤' }, fusion: { name: '南瓜小米饭', method: '南瓜丁与小米焖煮' } } },
  { id: 'ls_03', name: '山药', elementId: 3, nature: '甘、平', meridians: '脾、肺、肾', effect: '健脾固肾，润肺', seasonMonths: '8-11月', recipes: { chinese: { name: '山药排骨汤', method: '排骨+山药块炖1小时' }, western: { name: '山药泥配牛排', method: '山药蒸熟压泥配煎牛排' }, fusion: { name: '山药红枣糕', method: '山药泥+红枣+糯米粉蒸糕' } } },
  { id: 'ls_04', name: '薏米', elementId: 3, nature: '甘、淡、凉', meridians: '脾、胃、肺', effect: '健脾渗湿，清热', seasonMonths: '7-8月', recipes: { chinese: { name: '薏米红豆粥', method: '薏米+红豆煮粥' }, western: { name: '薏米蔬菜浓汤', method: '薏米+蔬菜+鸡汤打泥' }, fusion: { name: '薏米冬瓜排骨汤', method: '排骨+薏米+冬瓜炖1.5小时' } } },
  { id: 'ls_05', name: '黄豆', elementId: 3, nature: '甘、平', meridians: '脾、胃', effect: '健脾宽中，润燥', seasonMonths: '7-9月', recipes: { chinese: { name: '黄豆炖猪蹄', method: '猪蹄+黄豆炖2小时' }, western: { name: '黄豆泥配烤面包', method: '黄豆煮软打泥抹烤面包' }, fusion: { name: '黄豆小米粥', method: '黄豆泡发与小米同煮' } } },
  { id: 'ls_06', name: '土豆', elementId: 3, nature: '甘、平', meridians: '脾、胃', effect: '补气健脾，消肿', seasonMonths: '6-9月', recipes: { chinese: { name: '土豆炖牛肉', method: '牛肉+土豆块炖1.5小时' }, western: { name: '土豆泥', method: '土豆蒸熟压泥加黄油牛奶' }, fusion: { name: '土豆胡萝卜焖饭', method: '大米+土豆丁+胡萝卜焖' } } },
  { id: 'ls_07', name: '胡萝卜', elementId: 3, nature: '甘、平', meridians: '肺、脾', effect: '健脾化滞，明目', seasonMonths: '8-11月', recipes: { chinese: { name: '胡萝卜炒肉丝', method: '胡萝卜切丝与肉丝同炒' }, western: { name: '烤胡萝卜配蜂蜜', method: '胡萝卜条刷蜂蜜烤15分钟' }, fusion: { name: '胡萝卜小米粥', method: '小米+胡萝卜丁煮粥' } } },
  { id: 'ls_08', name: '黄椒', elementId: 3, nature: '甘、温', meridians: '脾、胃', effect: '温中开胃', seasonMonths: '7-9月', recipes: { chinese: { name: '黄椒炒肉片', method: '黄椒块与肉片同炒' }, western: { name: '烤黄椒塞奶酪', method: '黄椒烤软塞奶酪' }, fusion: { name: '黄椒鸡蛋饼', method: '蛋液+黄椒丁摊饼' } } },
  { id: 'ls_09', name: '红薯', elementId: 3, nature: '甘、平', meridians: '脾、胃、大肠', effect: '补脾益气，通便', seasonMonths: '8-11月', recipes: { chinese: { name: '蒸红薯', method: '红薯洗净蒸30分钟' }, western: { name: '烤红薯', method: '红薯包锡纸200℃烤45分钟' }, fusion: { name: '红薯小米粥', method: '红薯切块与小米同煮' } } },
  { id: 'ls_10', name: '板栗', elementId: 3, nature: '甘、温', meridians: '脾、胃、肾', effect: '健脾养胃，补肾', seasonMonths: '9-10月', recipes: { chinese: { name: '板栗烧鸡', method: '鸡肉+板栗炖30分钟' }, western: { name: '板栗南瓜浓汤', method: '板栗+南瓜+鸡汤打泥' }, fusion: { name: '板栗小米粥', method: '板栗去壳与小米同煮' } } },
  { id: 'ls_11', name: '白扁豆', elementId: 3, nature: '甘、微温', meridians: '脾、胃', effect: '健脾化湿', seasonMonths: '7-8月', recipes: { chinese: { name: '白扁豆山药粥', method: '白扁豆+山药+大米煮粥' }, western: { name: '白扁豆蔬菜浓汤', method: '白扁豆+蔬菜+鸡汤打泥' }, fusion: { name: '白扁豆炖排骨', method: '排骨+白扁豆炖1.5小时' } } },
  { id: 'ls_12', name: '芡实', elementId: 3, nature: '甘、涩、平', meridians: '脾、肾', effect: '健脾止泻，固肾', seasonMonths: '8-9月', recipes: { chinese: { name: '芡实薏米粥', method: '芡实+薏米+大米煮粥' }, western: { name: '芡实南瓜浓汤', method: '芡实+南瓜+鸡汤打泥' }, fusion: { name: '芡实莲子羹', method: '芡实+莲子+红枣煮软' } } },
  { id: 'ls_13', name: '莲藕', elementId: 3, nature: '甘、寒（熟甘温）', meridians: '心、脾、胃', effect: '清热生津，健脾', seasonMonths: '8-10月', recipes: { chinese: { name: '莲藕排骨汤', method: '排骨+莲藕块炖1.5小时' }, western: { name: '烤莲藕片', method: '莲藕切薄片刷橄榄油烤脆' }, fusion: { name: '莲藕糯米糕', method: '糯米塞入莲藕孔蒸熟切片' } } },
  { id: 'ls_14', name: '黄花菜', elementId: 3, nature: '甘、凉', meridians: '心、肝、脾', effect: '养血平肝，利湿', seasonMonths: '6-8月', recipes: { chinese: { name: '黄花菜炒蛋', method: '泡发焯水切段与鸡蛋同炒' }, western: { name: '黄花菜鸡肉浓汤', method: '泡发黄花菜+鸡肉打泥' }, fusion: { name: '黄花菜排骨汤', method: '排骨+黄花菜炖1小时' } } },
  { id: 'ls_15', name: '玉米', elementId: 3, nature: '甘、平', meridians: '胃、大肠', effect: '调中开胃', seasonMonths: '7-8月', recipes: { chinese: { name: '玉米糊', method: '玉米面煮糊' }, western: { name: '玉米浓汤', method: '玉米粒打泥煮汤' }, fusion: { name: '玉米粒炒蛋', method: '玉米粒+蛋液炒' } } },
]

// 秋季和冬季由于篇幅，用关键食材
const autumnFoods: WuxingFood[] = [
  { id: 'aut_01', name: '银耳', elementId: 4, nature: '甘、平', meridians: '肺、胃、肾', effect: '滋阴润肺，养胃', seasonMonths: '8-11月', recipes: { chinese: { name: '银耳莲子羹', method: '银耳泡发+莲子+红枣煮1小时' }, western: { name: '银耳杏仁浓汤', method: '银耳+杏仁+鸡汤打泥' }, fusion: { name: '银耳雪梨汤', method: '银耳+雪梨块同煮30分钟' } } },
  { id: 'aut_02', name: '百合', elementId: 4, nature: '甘、微寒', meridians: '心、肺', effect: '润肺止咳，清心安神', seasonMonths: '8-10月', recipes: { chinese: { name: '百合炒西芹', method: '鲜百合掰片+西芹焯水快炒' }, western: { name: '百合南瓜浓汤', method: '百合+南瓜打泥' }, fusion: { name: '百合莲子粥', method: '大米+百合+莲子煮粥' } } },
  { id: 'aut_03', name: '白萝卜', elementId: 4, nature: '辛、甘、凉', meridians: '肺、脾、胃', effect: '顺气化痰，消食', seasonMonths: '9-11月', recipes: { chinese: { name: '白萝卜炖排骨', method: '排骨+白萝卜炖1小时' }, western: { name: '白萝卜奶油浓汤', method: '白萝卜+土豆打泥' }, fusion: { name: '白萝卜蜂蜜盅', method: '白萝卜挖洞加少量蜂蜜蒸40分钟' } } },
  { id: 'aut_04', name: '梨', elementId: 4, nature: '甘、酸、凉', meridians: '肺、胃', effect: '润肺生津，清热', seasonMonths: '8-10月', recipes: { chinese: { name: '冰糖炖梨', method: '梨去核加少量冰糖蒸40分钟' }, western: { name: '梨烤鸡腿', method: '梨泥腌鸡腿烤' }, fusion: { name: '梨小米粥', method: '小米煮粥加梨丁' } } },
  { id: 'aut_05', name: '南杏仁', elementId: 4, nature: '甘、平', meridians: '肺、大肠', effect: '润肺止咳，通便', seasonMonths: '8-10月', recipes: { chinese: { name: '杏仁露', method: '南杏仁+糯米浸泡打浆煮沸' }, western: { name: '杏仁烤鱼', method: '鱼排裹杏仁碎烤' }, fusion: { name: '杏仁小米粥', method: '小米粥加杏仁粉' } } },
  { id: 'aut_06', name: '花椰菜', elementId: 4, nature: '甘、凉', meridians: '肺、胃', effect: '润肺生津', seasonMonths: '9-11月', recipes: { chinese: { name: '蒜蓉炒花菜', method: '花菜焯水蒜蓉爆香炒' }, western: { name: '芝士焗花菜', method: '花菜拌白酱撒奶酪焗' }, fusion: { name: '花菜浓汤', method: '花菜+土豆打泥' } } },
  { id: 'aut_07', name: '口蘑', elementId: 4, nature: '甘、平', meridians: '肺、胃', effect: '宣肺解表，益气', seasonMonths: '9-11月', recipes: { chinese: { name: '口蘑炒肉片', method: '口蘑切片与肉片同炒' }, western: { name: '烤口蘑', method: '口蘑塞蒜末黄油200℃烤10分钟' }, fusion: { name: '口蘑浓汤', method: '口蘑+土豆打泥' } } },
  { id: 'aut_08', name: '豆腐', elementId: 4, nature: '甘、凉', meridians: '脾、胃、大肠', effect: '益气和中，生津', seasonMonths: '全年', recipes: { chinese: { name: '家常豆腐', method: '豆腐煎金黄加酱油焖煮' }, western: { name: '烤豆腐', method: '豆腐刷酱200℃烤15分钟' }, fusion: { name: '豆腐味噌汤', method: '豆腐丁+海带汤+味噌' } } },
  { id: 'aut_09', name: '茭白', elementId: 4, nature: '甘、寒', meridians: '肺、胃、肝', effect: '清热解毒，利尿', seasonMonths: '9-10月', recipes: { chinese: { name: '茭白炒肉丝', method: '茭白切丝与肉丝同炒' }, western: { name: '茭白奶酪焗', method: '茭白片+白酱焗' }, fusion: { name: '茭白蛋花汤', method: '茭白片煮开淋蛋花' } } },
  { id: 'aut_10', name: '荸荠', elementId: 4, nature: '甘、寒', meridians: '肺、胃', effect: '清热生津，化痰', seasonMonths: '10-12月', recipes: { chinese: { name: '荸荠炒肉片', method: '荸荠去皮切片与肉片同炒' }, western: { name: '荸荠烤鸡', method: '荸荠碎+鸡肉做饼烤' }, fusion: { name: '荸荠银耳汤', method: '银耳+荸荠片煮3分钟' } } },
  { id: 'aut_11', name: '柚子', elementId: 4, nature: '甘、酸、寒', meridians: '肺、脾', effect: '理气化痰，消食', seasonMonths: '10-12月', recipes: { chinese: { name: '柚子皮炖肉', method: '柚子皮焯水去苦与五花肉炖' }, western: { name: '柚子烤鸭', method: '柚子汁腌鸭胸烤' }, fusion: { name: '柚子蜂蜜茶（温热）', method: '柚子皮丝+果肉熬酱冲饮' } } },
  { id: 'aut_12', name: '无花果', elementId: 4, nature: '甘、平', meridians: '肺、胃、大肠', effect: '润肺止咳，健胃', seasonMonths: '8-10月', recipes: { chinese: { name: '无花果瘦肉汤', method: '瘦肉+无花果炖1小时' }, western: { name: '无花果烤鸡腿', method: '无花果切半+鸡腿烤' }, fusion: { name: '无花果小米粥', method: '小米粥加无花果块' } } },
  { id: 'aut_13', name: '白芝麻', elementId: 4, nature: '甘、平', meridians: '肺、肝、肾', effect: '润肺生津，补血', seasonMonths: '8-9月', recipes: { chinese: { name: '芝麻糊', method: '芝麻炒熟磨粉+糯米粉煮糊' }, western: { name: '芝麻烤饼', method: '面团撒芝麻烤金黄' }, fusion: { name: '芝麻拌菠菜', method: '菠菜焯水拌芝麻酱撒熟芝麻' } } },
  { id: 'aut_14', name: '山药', elementId: 4, nature: '甘、平', meridians: '脾、肺、肾', effect: '健脾润肺', seasonMonths: '9-11月', recipes: { chinese: { name: '山药炒木耳', method: '山药+木耳同炒' }, western: { name: '山药泥配三文鱼', method: '山药泥配煎三文鱼' }, fusion: { name: '山药排骨汤', method: '排骨+山药炖1小时' } } },
  { id: 'aut_15', name: '莲藕', elementId: 4, nature: '甘、寒（熟甘温）', meridians: '心、脾、胃', effect: '润肺健脾', seasonMonths: '9-11月', recipes: { chinese: { name: '莲藕排骨汤', method: '排骨+莲藕炖1.5小时' }, western: { name: '烤莲藕片', method: '莲藕片烤脆' }, fusion: { name: '莲藕糯米丸', method: '糯米+莲藕末蒸丸' } } },
]

const winterFoods: WuxingFood[] = [
  { id: 'win_01', name: '黑豆', elementId: 5, nature: '甘、平', meridians: '脾、肾', effect: '补肾利水，活血', seasonMonths: '11-1月', recipes: { chinese: { name: '黑豆排骨汤', method: '黑豆浸泡4小时+排骨炖1.5小时' }, western: { name: '黑豆泥配烤牛肉', method: '黑豆打泥配煎牛肉' }, fusion: { name: '黑豆小米粥', method: '黑豆泡发与小米同煮' } } },
  { id: 'win_02', name: '黑芝麻', elementId: 5, nature: '甘、平', meridians: '肝、肾', effect: '补肝肾，益精血', seasonMonths: '9-11月（采收）', recipes: { chinese: { name: '黑芝麻糊', method: '芝麻炒熟磨粉煮糊' }, western: { name: '黑芝麻烤饼', method: '面团撒黑芝麻烤' }, fusion: { name: '黑芝麻核桃粥', method: '大米粥+黑芝麻粉+核桃碎' } } },
  { id: 'win_03', name: '黑米', elementId: 5, nature: '甘、温', meridians: '脾、肾', effect: '滋阴补肾，健脾', seasonMonths: '10-11月（收获）', recipes: { chinese: { name: '黑米红枣粥', method: '黑米+红枣煮粥' }, western: { name: '黑米南瓜浓汤', method: '黑米+南瓜打泥' }, fusion: { name: '黑米糕', method: '黑米粉+鸡蛋调糊蒸20分钟' } } },
  { id: 'win_04', name: '黑木耳', elementId: 5, nature: '甘、平', meridians: '肺、脾、肾', effect: '活血补肾，润肺', seasonMonths: '全年（干品）', recipes: { chinese: { name: '木耳炒鸡蛋', method: '木耳泡发撕小朵与鸡蛋同炒' }, western: { name: '木耳烤鸡', method: '泡发木耳垫底放鸡腿烤' }, fusion: { name: '木耳红枣汤', method: '木耳+红枣煮30分钟' } } },
  { id: 'win_05', name: '海带', elementId: 5, nature: '咸、寒', meridians: '肝、肾', effect: '软坚散结，利水', seasonMonths: '全年（干品）', recipes: { chinese: { name: '海带排骨汤', method: '海带泡发+排骨同炖' }, western: { name: '海带烤三文鱼', method: '海带卷三文鱼烤' }, fusion: { name: '海带豆腐汤', method: '豆腐+海带丝煮汤' } } },
  { id: 'win_06', name: '紫菜', elementId: 5, nature: '甘、咸、寒', meridians: '肺、肾', effect: '化痰软坚，利水', seasonMonths: '全年', recipes: { chinese: { name: '紫菜蛋花汤', method: '紫菜撕碎水煮开淋蛋花' }, western: { name: '紫菜烤饭团', method: '饭团包紫菜刷酱油烤微焦' }, fusion: { name: '紫菜芝麻拌饭', method: '热饭拌紫菜碎+熟芝麻+盐' } } },
  { id: 'win_07', name: '核桃', elementId: 5, nature: '甘、温', meridians: '肾、肺、大肠', effect: '补肾固精，温肺', seasonMonths: '9-10月（采收）', recipes: { chinese: { name: '核桃炒西芹', method: '核桃仁炒香+西芹同炒' }, western: { name: '核桃烤鸡', method: '核桃碎裹鸡胸烤' }, fusion: { name: '核桃小米粥', method: '小米粥+核桃碎' } } },
  { id: 'win_08', name: '桑葚（干）', elementId: 5, nature: '甘、酸、寒', meridians: '肝、肾', effect: '滋阴补血，乌发', seasonMonths: '全年（干品）', recipes: { chinese: { name: '桑葚红枣粥', method: '干桑葚+红枣+大米煮粥' }, western: { name: '桑葚酱烤鸭', method: '桑葚熬酱抹鸭胸烤' }, fusion: { name: '桑葚核桃糕', method: '桑葚干+核桃+糯米粉蒸糕' } } },
  { id: 'win_09', name: '乌鸡', elementId: 5, nature: '甘、平', meridians: '肝、肾', effect: '补肝肾，益气血', seasonMonths: '全年', recipes: { chinese: { name: '乌鸡汤', method: '乌鸡+当归+黄芪+红枣炖2小时' }, western: { name: '乌鸡烤', method: '乌鸡用迷迭香盐腌整只烤' }, fusion: { name: '乌鸡粥', method: '乌鸡炖汤取汤煮粥加鸡肉丝' } } },
  { id: 'win_10', name: '羊肉', elementId: 5, nature: '甘、温', meridians: '脾、肾', effect: '温中补虚，补肾', seasonMonths: '11-1月（冬季最佳）', recipes: { chinese: { name: '当归生姜羊肉汤', method: '羊肉焯水+当归+生姜炖2小时' }, western: { name: '烤羊排', method: '迷迭香+大蒜+盐腌煎烤' }, fusion: { name: '羊肉小米粥', method: '羊肉末+小米+姜丝煮粥' } } },
  { id: 'win_11', name: '韭菜', elementId: 5, nature: '辛、温', meridians: '肝、胃、肾', effect: '温肾助阳', seasonMonths: '11-3月（冬春）', recipes: { chinese: { name: '韭菜炒核桃', method: '核桃仁炒香+韭菜炒' }, western: { name: '韭菜烤羊肉', method: '韭菜垫底烤羊肉' }, fusion: { name: '韭菜盒子', method: '烙' } } },
  { id: 'win_12', name: '山药', elementId: 5, nature: '甘、平', meridians: '脾、肺、肾', effect: '补肾固精', seasonMonths: '11-2月', recipes: { chinese: { name: '山药炖羊肉', method: '羊肉+山药炖' }, western: { name: '山药泥配牛排', method: '山药泥配牛排' }, fusion: { name: '山药红枣糕', method: '蒸糕' } } },
  { id: 'win_13', name: '芡实', elementId: 5, nature: '甘、涩、平', meridians: '脾、肾', effect: '固肾涩精', seasonMonths: '8-9月（采收，干品全年）', recipes: { chinese: { name: '芡实薏米粥', method: '芡实+薏米煮粥' }, western: { name: '芡实南瓜浓汤', method: '芡实+南瓜打泥' }, fusion: { name: '芡实莲子羹', method: '芡实+莲子+红枣煮软' } } },
  { id: 'win_14', name: '枸杞', elementId: 5, nature: '甘、平', meridians: '肝、肾', effect: '滋补肝肾', seasonMonths: '全年（干品）', recipes: { chinese: { name: '枸杞羊肉汤', method: '羊肉+枸杞炖' }, western: { name: '枸杞烤鸡腿', method: '鸡腿+枸杞烤' }, fusion: { name: '枸杞小米粥', method: '小米粥+枸杞' } } },
  { id: 'win_15', name: '板栗', elementId: 5, nature: '甘、温', meridians: '脾、胃、肾', effect: '补肾强腰，健脾', seasonMonths: '9-11月（冬季储存）', recipes: { chinese: { name: '板栗烧鸡', method: '鸡肉+板栗炖' }, western: { name: '板栗南瓜浓汤', method: '板栗+南瓜打泥' }, fusion: { name: '板栗小米粥', method: '板栗+小米煮粥' } } },
]

// 所有食材合集
export const allWuxingFoods: Record<string, WuxingFood[]> = {
  spring: springFoods,
  summer: summerFoods,
  late_summer: lateSummerFoods,
  autumn: autumnFoods,
  winter: winterFoods,
}

// 五行与食材映射
export function getFoodsByElement(elementId: number): WuxingFood[] {
  const seasonMap: Record<number, string> = { 1: 'spring', 2: 'summer', 3: 'late_summer', 4: 'autumn', 5: 'winter' }
  return allWuxingFoods[seasonMap[elementId]] || []
}

// 根据季节获取食材
export function getSeasonalFoods(season: string): WuxingFood[] {
  return allWuxingFoods[season] || []
}

// 五脏倾向自测题
export const organTendencyQuestions = [
  { id: 'liver', organ: '肝', label: '眼睛干涩、视物模糊、易怒', element: '木', elementId: 1 },
  { id: 'heart', organ: '心', label: '口舌生疮、心烦失眠、小便黄', element: '火', elementId: 2 },
  { id: 'spleen', organ: '脾', label: '食欲不振、饭后腹胀、大便不成形', element: '土', elementId: 3 },
  { id: 'lung', organ: '肺', label: '干咳、皮肤干燥、容易感冒', element: '金', elementId: 4 },
  { id: 'kidney', organ: '肾', label: '腰膝酸软、怕冷、夜尿多', element: '水', elementId: 5 },
]

// 免责声明
export const wuxingDisclaimer = '本内容基于《黄帝内经》五行养生理论，作为饮食辅助建议，不能替代医疗诊断。孕妇及严重慢性病患者，部分食材可能不适用，请遵医嘱。所有食谱均为温热烹饪，无生冷冰镇。'
