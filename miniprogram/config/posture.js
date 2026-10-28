/* 本地内容配置（由产品 posture.json 转为 CommonJS，兼容基础库 2.32 require） */
module.exports = {
  "_meta": {
    "version": "it2-v3",
    "sourceNote": "仅肩部条目来自谭成义视频的自动章节与配文（未观看视频）；其余为通用占位，不标注作者",
    "disclaimer": "非医疗建议。出现麻木、放射痛、夜间痛、外伤后疼痛，或持续 2 周不缓解，请就医。",
    "doseNote": "剂量为通用建议，因人而异"
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
        "flag": "外旋时疼痛或弹响，提示可能存在肩峰撞击风险，建议就医确认"
      },
      "precheck": "肩痛可能来自骨盆或颈椎，先排查",
      "pre": [
        {
          "name": "训练前放松小圆肌",
          "dose": "30–60 秒",
          "cue": "泡沫轴或按摩球压在腋后侧肩胛骨外缘，找到酸胀点缓慢滚动，避开骨头和放射痛"
        }
      ],
      "drills": [
        {
          "name": "跪姿死虫",
          "cue": "肩胛下肌离心控制",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "弹力带肩胛后倾",
          "cue": "肩胛后倾，动作缓慢可控",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        }
      ],
      "frequency": "放在上肢训练日热身中，每周 3–5 次",
      "placement": "warmup.push,warmup.pull"
    },
    {
      "id": "rounded_shoulders",
      "priority": 2,
      "title": "圆肩驼背",
      "attribution": "generic",
      "placeholder": true,
      "selfCheck": null,
      "drills": [],
      "frequency": "待补"
    },
    {
      "id": "forward_head",
      "priority": 3,
      "title": "头前伸",
      "attribution": "generic",
      "placeholder": true,
      "selfCheck": null,
      "drills": [],
      "frequency": "待补"
    },
    {
      "id": "anterior_pelvic_tilt",
      "priority": 3,
      "title": "骨盆前倾",
      "attribution": "generic",
      "placeholder": true,
      "selfCheck": null,
      "drills": [],
      "frequency": "待补"
    },
    {
      "id": "low_back",
      "priority": 3,
      "title": "腰背不适",
      "attribution": "generic",
      "placeholder": true,
      "selfCheck": null,
      "drills": [],
      "frequency": "待补"
    }
  ]
};
