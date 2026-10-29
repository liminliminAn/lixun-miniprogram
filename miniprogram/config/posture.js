/* 本地内容配置（由产品 posture.json 转为 CommonJS，兼容基础库 2.32 require） */
module.exports = {
  "_meta": {
    "version": "it2-v6",
    "sourceNote": "仅肩部条目来自谭成义视频的自动章节与配文（未观看视频）；其余为通用康复建议，不标注作者",
    "disclaimer": "非医疗建议。出现麻木、放射痛、夜间痛、外伤后疼痛，或持续 2 周不缓解，请就医。",
    "doseNote": "剂量为通用建议，因人而异",
    "displayRules": "全部条目已写全，均可显示；generic 条目不署名"
  },
  "issues": [
    {
      "id": "shoulder_impingement",
      "priority": 1,
      "title": "肩部不适 / 弹响（肩峰撞击、肱骨前移）",
      "attribution": "tan",
      "source": {
        "title": "ep.21",
        "url": "https://www.douyin.com/video/7576101176707364537"
      },
      "selfCheck": {
        "name": "招财猫外旋测试",
        "how": "上臂外展约 90°、屈肘 90°，前臂向上外旋",
        "flag": "外旋时疼痛或弹响，提示可能存在肩峰撞击风险，建议就医确认",
        "image": "/subpkg/exercises/selfcheck_shoulder_impingement.jpg"
      },
      "precheck": "肩痛可能来自骨盆或颈椎，先排查",
      "pre": [
        {
          "name": "训练前放松小圆肌",
          "dose": "30–60 秒",
          "cue": "泡沫轴或按摩球压在腋后侧肩胛骨外缘，找到酸胀点缓慢滚动，避开骨头和放射痛",
          "image": "/subpkg/exercises/posture_shoulder_impingement_01.jpg"
        }
      ],
      "drills": [
        {
          "name": "跪姿死虫",
          "cue": "四点跪姿，一手掌下压地面稳住肩胛，另一臂缓慢前伸再收回；双膝着地不动，骨盆不晃，肩胛下肌离心控制",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_shoulder_impingement_02.jpg"
        },
        {
          "name": "弹力带肩胛后倾",
          "cue": "肩胛后倾，动作缓慢可控",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_shoulder_impingement_03.jpg"
        }
      ],
      "frequency": "放在上肢训练日热身中，每周 3–5 次",
      "placement": "warmup.push,warmup.pull",
      "visible": true
    },
    {
      "id": "rounded_shoulders",
      "priority": 2,
      "title": "圆肩驼背",
      "attribution": "generic",
      "selfCheck": {
        "name": "靠墙站立测试",
        "how": "脚跟、臀部、肩胛靠墙站立，观察后脑和肩后侧能否自然贴墙",
        "flag": "肩后侧明显离墙，或后脑要用力才能贴墙，提示可能存在圆肩驼背",
        "image": "/subpkg/exercises/selfcheck_rounded_shoulders.jpg"
      },
      "drills": [
        {
          "name": "靠墙天使",
          "cue": "背部贴墙，手臂沿墙上下滑动",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_rounded_shoulders_01.jpg"
        },
        {
          "name": "弹力带面拉",
          "cue": "拉向脸部，肘高于手，肩胛内收",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_rounded_shoulders_02.jpg"
        },
        {
          "name": "泡沫轴胸椎伸展",
          "cue": "泡沫轴横放在上背，抱头向后伸展",
          "dose": "每段 30–60 秒",
          "image": "/subpkg/exercises/posture_rounded_shoulders_03.jpg"
        }
      ],
      "frequency": "每周 3–5 次，可放在上肢或休息日的热身里",
      "visible": true,
      "medicalNote": "出现麻木、放射痛、夜间痛、外伤后疼痛，或坚持 2 周仍不缓解，请就医。"
    },
    {
      "id": "forward_head",
      "priority": 3,
      "title": "头前伸",
      "attribution": "generic",
      "selfCheck": {
        "name": "侧面观察",
        "how": "自然站立，请人从侧面拍照，看耳垂是否在肩峰正上方",
        "flag": "耳垂明显在肩峰前方，提示可能存在头前伸",
        "image": "/subpkg/exercises/selfcheck_forward_head.jpg"
      },
      "drills": [
        {
          "name": "收下巴",
          "cue": "下巴水平向后收，像做双下巴，后颈拉长",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_forward_head_01.jpg"
        },
        {
          "name": "仰卧收下巴抬头",
          "cue": "仰卧收下巴，把头抬离地面 1–2 cm",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "image": "/subpkg/exercises/posture_forward_head_02.jpg"
        },
        {
          "name": "胸小肌拉伸",
          "cue": "前臂贴门框，身体向前转",
          "dose": "每侧 30–60 秒",
          "image": "/subpkg/exercises/posture_forward_head_03.jpg"
        }
      ],
      "frequency": "每周 3–5 次，可放在上肢或休息日的热身里",
      "visible": true,
      "medicalNote": "出现麻木、放射痛、夜间痛、外伤后疼痛，或坚持 2 周仍不缓解，请就医。"
    },
    {
      "id": "anterior_pelvic_tilt",
      "priority": 3,
      "title": "骨盆前倾",
      "attribution": "generic",
      "selfCheck": {
        "name": "靠墙平躺测试",
        "how": "仰卧屈膝，用手伸进腰下与地面的空隙",
        "flag": "空隙明显大于一掌厚，提示可能存在骨盆前倾",
        "image": "/subpkg/exercises/selfcheck_anterior_pelvic_tilt.jpg"
      },
      "drills": [
        {
          "name": "死虫",
          "cue": "下背贴地，对侧手脚缓慢伸出",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_anterior_pelvic_tilt_01.jpg"
        },
        {
          "name": "臀桥",
          "cue": "后倾骨盆再抬臀，顶端夹臀，不挺腰",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_anterior_pelvic_tilt_02.jpg"
        },
        {
          "name": "弓步髋屈肌拉伸",
          "cue": "后腿膝盖跪地，夹紧臀部，骨盆后倾",
          "dose": "每侧 30–60 秒",
          "image": "/subpkg/exercises/posture_anterior_pelvic_tilt_03.jpg"
        }
      ],
      "frequency": "每周 3–5 次，可放在上肢或休息日的热身里",
      "visible": true,
      "medicalNote": "出现麻木、放射痛、夜间痛、外伤后疼痛，或坚持 2 周仍不缓解，请就医。"
    },
    {
      "id": "low_back",
      "priority": 3,
      "title": "腰背不适",
      "attribution": "generic",
      "selfCheck": {
        "name": "日常疼痛观察",
        "how": "记录久坐、弯腰或训练后腰背酸痛的程度和持续时间",
        "flag": "疼痛反复出现、腿部放射痛或麻木，提示需要就医评估",
        "image": "/subpkg/exercises/selfcheck_low_back.jpg"
      },
      "drills": [
        {
          "name": "猫牛式",
          "cue": "四点跪，缓慢交替弓背和塌腰，配合呼吸",
          "dose": "2–3 组 × 8–10 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_low_back_01.jpg"
        },
        {
          "name": "鸟狗式",
          "cue": "四点跪，对侧手脚伸直，骨盆保持水平",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "image": "/subpkg/exercises/posture_low_back_02.jpg"
        },
        {
          "name": "侧桥",
          "cue": "肘在肩正下方，身体成直线",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "image": "/subpkg/exercises/posture_low_back_03.jpg"
        }
      ],
      "frequency": "每周 3–5 次，可放在上肢或休息日的热身里",
      "visible": true,
      "medicalNote": "出现麻木、放射痛、夜间痛、外伤后疼痛，或坚持 2 周仍不缓解，请就医。"
    }
  ]
};
