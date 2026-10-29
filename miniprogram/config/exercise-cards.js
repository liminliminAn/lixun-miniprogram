/* 本地内容配置（由产品 exercises.json it2-v3 转为 CommonJS，兼容基础库 2.32 require）；配图在分包 subpkg/exercises/，_meta.images 为已入库配图 contentId */
module.exports = {
  "_meta": {
    "version": "it2-v3",
    "doseNote": "剂量为通用建议，因人而异",
    "imageNote": "配图为 UI 写实 JPEG（原 WebP 转换），放分包",
    "displayRules": {
      "image": "有图才显示图片区，无图时整块隐藏，不用占位图",
      "medicalNote": "出现明显疼痛、麻木或放射痛时停止，并就医确认"
    },
    "source": "lixun-pm/exercises.json",
    "idMap": "按名称映射到 constants/exercises.ts 的 id；contentId 为产品 id（配图文件名）",
    "doseScope": "仅指正式组（working sets）",
    "images": [
      "back_extension",
      "bench_press",
      "bulgarian_split_squat",
      "cable_curl",
      "dips",
      "front_goblet_squat",
      "incline_db_press",
      "machine_row",
      "neutral_pulldown",
      "rdl",
      "single_arm_pulldown",
      "single_leg_rdl",
      "skull_crusher",
      "wide_row",
      "y_raise"
    ]
  },
  "exercises": {
    "barbell_bench": {
      "contentId": "bench_press",
      "name": "杠铃卧推",
      "day": "push",
      "type": "compound",
      "image": "/subpkg/exercises/bench_press.jpg",
      "steps": [
        "躺稳后肩胛后缩下沉，双脚踩实",
        "握距略宽于肩，杠铃下放到胸骨中下部",
        "推起时杠铃略向头侧走弧线，顶端不锁死肘"
      ],
      "cues": [
        "肩胛后缩下沉、胸廓挺起",
        "小臂在杠下保持竖直",
        "下放 2 秒控制，触胸不弹"
      ],
      "mistakes": [
        "肩胛松开、肩膀前顶",
        "臀部离凳",
        "手腕后折"
      ],
      "contraindications": [
        "肩前侧疼痛时改用哑铃或对握，并缩小下放幅度",
        "大重量必须有保护人或使用安全杠"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "db_incline_press": {
      "contentId": "incline_db_press",
      "name": "哑铃上斜卧推",
      "day": "push",
      "type": "compound",
      "image": "/subpkg/exercises/incline_db_press.jpg",
      "steps": [
        "凳面调 30°左右，哑铃放到大腿上借力躺下",
        "肩胛收紧，哑铃推至胸上方",
        "下放到大臂略低于凳面后推回"
      ],
      "cues": [
        "肩胛下沉，胸廓保持打开",
        "大臂与躯干约 45–60°，不要完全外展",
        "可用对握，减轻肩部压力"
      ],
      "mistakes": [
        "角度太高变成推肩",
        "哑铃顶端互撞、卸掉张力",
        "耸肩"
      ],
      "contraindications": [
        "肩部不适时降低凳面角度或改用对握",
        "放下哑铃时先回到大腿再坐起，不要直接从肩上丢下"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "dip": {
      "contentId": "dips",
      "name": "双杠臂屈伸",
      "day": "push",
      "type": "compound",
      "image": "/subpkg/exercises/dips.jpg",
      "steps": [
        "撑起后肩下沉，身体略前倾",
        "屈肘下放到肩略低于肘",
        "撑起至手臂接近伸直"
      ],
      "cues": [
        "全程肩胛下沉，脖子拉长",
        "肘部向后，不向外张",
        "肩前侧不适时减小幅度"
      ],
      "mistakes": [
        "下放过深、肩前顶",
        "耸肩缩脖",
        "借身体摆动"
      ],
      "contraindications": [
        "肩前侧疼痛或肩不稳时不做，改为器械或窄距推",
        "下放时肩不低于肘太多，避免肩关节过度伸展"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "skull_crusher": {
      "contentId": "skull_crusher",
      "name": "仰卧臂屈伸",
      "day": "push",
      "type": "iso",
      "image": "/subpkg/exercises/skull_crusher.jpg",
      "steps": [
        "仰卧，双手持杠或哑铃于胸上方",
        "只屈肘，把重量下放到额头后方",
        "伸肘推回"
      ],
      "cues": [
        "大臂固定并略向头侧倾",
        "手肘指向天花板，不外张",
        "下放慢、伸肘时挤压三头"
      ],
      "mistakes": [
        "大臂前后摆动",
        "手肘外开",
        "重量过大导致肘痛"
      ],
      "contraindications": [
        "肘关节疼痛时改用钢线下压或减重",
        "重量过大时要有人保护，避免杠铃砸到头部"
      ],
      "dose": {
        "text": "3 组 × 10–15 次，可接近力竭，组间 60–90 秒",
        "repMin": 10,
        "repMax": 15
      }
    },
    "y_lateral_raise": {
      "contentId": "y_raise",
      "name": "Y 字侧平举",
      "day": "push",
      "type": "iso",
      "image": "/subpkg/exercises/y_raise.jpg",
      "steps": [
        "站姿或俯身，手持轻哑铃",
        "手臂沿身体斜前方举成 Y 字",
        "举到与肩同高后慢放"
      ],
      "cues": [
        "肩胛下沉，不耸肩",
        "用三角肌中束发力，小指略向上",
        "动作慢、全程张力"
      ],
      "mistakes": [
        "耸肩用斜方肌代偿",
        "身体摇晃借力",
        "举得过高"
      ],
      "contraindications": [
        "肩部撞击感或弹响时降低高度或停止",
        "用轻重量，不要甩"
      ],
      "dose": {
        "text": "3 组 × 10–15 次，可接近力竭，组间 60–90 秒",
        "repMin": 10,
        "repMax": 15
      }
    },
    "single_cable_pulldown": {
      "contentId": "single_arm_pulldown",
      "name": "单手钢线下拉",
      "day": "pull",
      "type": "lat",
      "image": "/subpkg/exercises/single_arm_pulldown.jpg",
      "steps": [
        "坐或跪于钢线前，单手握把",
        "先沉肩胛，再屈肘下拉到肋旁",
        "慢慢放回到手臂伸直"
      ],
      "cues": [
        "先下沉肩胛再拉，感受背阔",
        "手肘朝向髋部走",
        "顶端充分拉伸背部"
      ],
      "mistakes": [
        "只用手臂拉",
        "躯干大幅侧倾",
        "肩膀在顶端耸起"
      ],
      "contraindications": [
        "肩部疼痛时缩小顶端拉伸幅度",
        "不要用颈部代偿发力"
      ],
      "dose": {
        "text": "3 组 × 8–12 次，RPE≈8，组间 90 秒",
        "repMin": 8,
        "repMax": 12
      }
    },
    "neutral_lat_pulldown": {
      "contentId": "neutral_pulldown",
      "name": "对握高位下拉",
      "day": "pull",
      "type": "lat",
      "image": "/subpkg/exercises/neutral_pulldown.jpg",
      "steps": [
        "用对握把手，膝盖固定",
        "挺胸，肩胛下沉",
        "把手柄拉到上胸位置"
      ],
      "cues": [
        "胸部迎向把手",
        "手肘向下向后",
        "放回时控制，拉伸背部"
      ],
      "mistakes": [
        "身体后仰过多",
        "拉到颈后",
        "离心太快"
      ],
      "contraindications": [
        "禁止拉到颈后",
        "肩部疼痛时缩小行程"
      ],
      "dose": {
        "text": "3 组 × 8–12 次，RPE≈8，组间 90 秒",
        "repMin": 8,
        "repMax": 12
      }
    },
    "single_machine_row": {
      "contentId": "machine_row",
      "name": "单手器械划船",
      "day": "pull",
      "type": "compound",
      "image": "/subpkg/exercises/machine_row.jpg",
      "steps": [
        "胸贴靠垫，单手握把",
        "肩胛先后缩，再屈肘拉向髋部",
        "慢放到手臂伸直、肩胛前伸"
      ],
      "cues": [
        "手肘贴身向髋部走",
        "核心收紧，躯干不扭转",
        "顶端停顿 1 秒"
      ],
      "mistakes": [
        "躯干转动借力",
        "耸肩",
        "只做半程"
      ],
      "contraindications": [
        "腰部不适时保持胸贴靠垫，不离垫",
        "不要猛拉，避免肘和腰部受伤"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "flared_row": {
      "contentId": "wide_row",
      "name": "开肘划船",
      "day": "pull",
      "type": "compound",
      "image": "/subpkg/exercises/wide_row.jpg",
      "steps": [
        "胸贴靠垫或俯身，宽握",
        "手肘向外张约 60–90°",
        "拉到上腹或下胸，肩胛内收"
      ],
      "cues": [
        "感受上背和三角肌后束",
        "大臂内旋向前，顶端挤压肩胛",
        "下背贴平、核心收紧"
      ],
      "mistakes": [
        "耸肩",
        "下背弓起",
        "重量太大变成甩动"
      ],
      "contraindications": [
        "肩部不适时缩小肘外展角度",
        "腰背痛时改用有胸垫支撑的版本"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "cable_curl": {
      "contentId": "cable_curl",
      "name": "钢线弯举",
      "day": "pull",
      "type": "iso",
      "image": "/subpkg/exercises/cable_curl.jpg",
      "steps": [
        "面向钢线站立，反握把手",
        "大臂贴身，只屈肘",
        "弯举到顶端后慢放"
      ],
      "cues": [
        "手肘固定在身体两侧",
        "顶端挤压二头肌",
        "下放全程控制"
      ],
      "mistakes": [
        "身体后仰借力",
        "手肘前移",
        "下放过快"
      ],
      "contraindications": [
        "肘部或前臂疼痛时减重或换握法",
        "不要借腰部后仰起重"
      ],
      "dose": {
        "text": "3 组 × 10–15 次，可接近力竭，组间 60–90 秒",
        "repMin": 10,
        "repMax": 15
      }
    },
    "single_rdl": {
      "contentId": "single_leg_rdl",
      "name": "单腿硬拉",
      "day": "legs",
      "type": "compound",
      "image": "/subpkg/exercises/single_leg_rdl.jpg",
      "steps": [
        "单腿站立，膝盖微屈",
        "以髋为轴前倾，后腿向后伸",
        "躯干接近水平后回到站立"
      ],
      "cues": [
        "骨盆保持水平，不外翻",
        "背部平直，感受腘绳肌拉伸",
        "可扶物保持平衡"
      ],
      "mistakes": [
        "弓背",
        "骨盆旋开",
        "支撑腿膝盖锁死"
      ],
      "contraindications": [
        "平衡差时先扶物，避免摔倒",
        "腰部疼痛时停止，改用双腿 RDL 并减重"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "bulgarian_split_squat": {
      "contentId": "bulgarian_split_squat",
      "name": "保加利亚蹲",
      "day": "legs",
      "type": "compound",
      "image": "/subpkg/exercises/bulgarian_split_squat.jpg",
      "steps": [
        "后脚放凳上，前脚踩实",
        "垂直下蹲到前腿大腿接近水平",
        "前脚发力站起"
      ],
      "cues": [
        "前膝对准脚尖方向",
        "躯干略前倾，更多臀部参与",
        "重心在前脚中部"
      ],
      "mistakes": [
        "膝盖内扣",
        "前脚太近导致脚跟离地",
        "弹起借力"
      ],
      "contraindications": [
        "膝盖疼痛时缩小下蹲深度或调整前脚位置",
        "平衡差时先徒手或扶物"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "goblet_squat": {
      "contentId": "front_goblet_squat",
      "name": "颈前/高脚杯深蹲",
      "day": "legs",
      "type": "compound",
      "image": "/subpkg/exercises/front_goblet_squat.jpg",
      "steps": [
        "重量放在胸前，双脚与肩同宽",
        "吸气收紧核心后下蹲",
        "蹲到最低后站起"
      ],
      "cues": [
        "躯干保持挺直",
        "膝盖沿脚尖方向推出",
        "脚掌全脚着地"
      ],
      "mistakes": [
        "膝盖内扣",
        "脚跟离地",
        "低位腰背塌陷"
      ],
      "contraindications": [
        "膝盖或髋部疼痛时缩小深度",
        "腰部无法保持中立时减重"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "rdl": {
      "contentId": "rdl",
      "name": "罗马尼亚硬拉 RDL",
      "day": "legs",
      "type": "compound",
      "image": "/subpkg/exercises/rdl.jpg",
      "steps": [
        "双脚与髋同宽，膝盖微屈",
        "以髋为轴推臀向后，杠贴腿下滑",
        "感到腘绳肌拉伸后伸髋站直"
      ],
      "cues": [
        "背部平直、核心收紧",
        "杠铃贴近腿部",
        "顶端伸髋夹臀，不后仰"
      ],
      "mistakes": [
        "弓背",
        "屈膝过多变成深蹲",
        "杠铃离腿太远"
      ],
      "contraindications": [
        "腰椎间盘问题或下背痛发作期不做",
        "全程保持背部中立，出现弓背立即减重"
      ],
      "dose": {
        "text": "3–4 组 × 6–10 次，留 2 次余量（RPE≈8），组间 2–3 分钟",
        "repMin": 6,
        "repMax": 10
      }
    },
    "back_extension": {
      "contentId": "back_extension",
      "name": "山羊挺身",
      "day": "legs",
      "type": "lat",
      "image": "/subpkg/exercises/back_extension.jpg",
      "steps": [
        "髋部卡在垫子边缘，双脚固定",
        "以髋为轴前倾下放",
        "起身到身体成直线"
      ],
      "cues": [
        "用臀和腘绳肌发力",
        "背部保持中立",
        "顶端不过度后仰"
      ],
      "mistakes": [
        "腰部代偿过伸",
        "下放过快",
        "耸肩"
      ],
      "contraindications": [
        "腰椎间盘问题或下背痛发作期不做",
        "不要在顶端过度后仰"
      ],
      "dose": {
        "text": "3 组 × 8–12 次，RPE≈8，组间 90 秒",
        "repMin": 8,
        "repMax": 12
      }
    }
  }
};
