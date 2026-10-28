/* 本地内容配置（由产品 JSON it2-v2 转为 CommonJS，兼容基础库 2.32 require） */
module.exports = {
  "_meta": {
    "version": "it2-v2",
    "sourceNote": "动作来自抖音章节与配文；作者未给剂量，剂量按常规康复逻辑设定（用户已同意）",
    "disclaimer": "非医疗建议。如有麻木、放射痛、夜间痛或持续 2 周不缓解，请就医。",
    "doseNote": "通用建议，因人而异",
    "pickNote": "热身动作按需挑选，不必全做"
  },
  "general": {
    "name": "一般热身",
    "detail": "低强度有氧 2–3 分钟",
    "dose": "2–3 分钟",
    "doseVerified": true
  },
  "rampSets": {
    "note": "首个复合动作递增热身组，按工作重量计算，取整到 2.5kg；不计入正式容量",
    "steps": [
      {
        "load": "空杠",
        "reps": 10
      },
      {
        "loadPct": 40,
        "reps": 8
      },
      {
        "loadPct": 60,
        "reps": 5
      },
      {
        "loadPct": 80,
        "reps": 3
      }
    ],
    "verified": true,
    "label": "通用建议，因人而异"
  },
  "days": {
    "push": {
      "label": "推 / 胸",
      "source": {
        "title": "一次性看完三分化热身整套流程",
        "url": "https://www.douyin.com/video/7638569547629063665"
      },
      "release": [
        {
          "name": "泡沫轴放松胸小肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "泡沫轴放松胸大肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "泡沫轴放松二头肌",
          "dose": "每部位 30–60 秒"
        }
      ],
      "activate": [
        {
          "name": "胸廓扩张激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "前锯肌激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "下斜方肌激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "手腕激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "肩袖激活（上肢训练前必做）",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "source": {
            "title": "ep.20",
            "url": "https://www.douyin.com/video/7574247205529647205"
          }
        }
      ]
    },
    "pull": {
      "label": "拉 / 背",
      "source": {
        "title": "ep.16",
        "url": "https://www.douyin.com/video/7568344357516073082"
      },
      "release": [
        {
          "name": "放松中斜方肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松菱形肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松大圆肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松冈下肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松三头肌",
          "dose": "每部位 30–60 秒"
        }
      ],
      "activate": [
        {
          "name": "弹力带热身",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "前锯肌激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "肩胛下肌训练",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "蜘蛛式",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "手肘搭平板凳",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度"
        },
        {
          "name": "肩袖激活（上肢训练前必做）",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "source": {
            "title": "ep.20",
            "url": "https://www.douyin.com/video/7574247205529647205"
          }
        }
      ]
    },
    "legs": {
      "label": "腿",
      "source": {
        "title": "一次性看完三分化热身整套流程",
        "url": "https://www.douyin.com/video/7638569547629063665"
      },
      "release": [
        {
          "name": "放松小腿",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松腘绳肌",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松臀部",
          "dose": "每部位 30–60 秒"
        },
        {
          "name": "放松大腿内外侧",
          "dose": "每部位 30–60 秒"
        }
      ],
      "activate": [
        {
          "name": "青蛙趴（髋）",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度"
        },
        {
          "name": "单腿站立（踝）",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度"
        },
        {
          "name": "飞机转圈",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        }
      ]
    },
    "shoulder": {
      "label": "肩日（可选，供推日或后续肩日）",
      "source": {
        "title": "ep.17",
        "url": "https://www.douyin.com/video/7569788930779558053"
      },
      "activate": [
        {
          "name": "外旋位推肩",
          "dose": "2–3 组 × 10–15 次，不疲劳为度"
        },
        {
          "name": "头枕地对抗地面",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度"
        },
        {
          "name": "泡沫轴支撑",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度"
        }
      ]
    }
  }
};
