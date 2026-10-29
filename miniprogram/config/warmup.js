/* 本地内容配置（由产品 warmup.json 转为 CommonJS，兼容基础库 2.32 require） */
module.exports = {
  "_meta": {
    "version": "it2-v5",
    "sourceNote": "动作来自抖音章节与配文；作者未给剂量，剂量按常规康复逻辑设定（用户已同意）",
    "disclaimer": "非医疗建议。如有麻木、放射痛、夜间痛或持续 2 周不缓解，请就医。",
    "doseNote": "剂量为通用建议，因人而异",
    "pickNote": "热身动作按需挑选，不必全做",
    "videoRule": "点按复制链接和时间点，不内嵌视频",
    "imageRule": "image 为空时不显示图片区"
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
    "label": "剂量为通用建议，因人而异"
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
          "dose": "每部位 30–60 秒",
          "steps": [
            "俯卧，把泡沫轴或按摩球放在锁骨下方靠近肩前侧",
            "缓慢小范围滚动找到酸胀点",
            "在酸胀点停留并深呼吸"
          ],
          "cues": [
            "力度中等，可以忍受",
            "避开锁骨和腋下的神经血管区",
            "出现麻木时立即停止"
          ],
          "image": "/subpkg/exercises/warmup_push_01.jpg"
        },
        {
          "name": "泡沫轴放松胸大肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "俯卧，泡沫轴斜放在胸前外侧",
            "手臂外展，身体小幅左右滚动",
            "找到紧张点后停留呼吸"
          ],
          "cues": [
            "从胸骨侧慢慢滚向肩前",
            "不要压到肩关节",
            "呼气时放松胸部"
          ],
          "image": "/subpkg/exercises/warmup_push_02.jpg"
        },
        {
          "name": "泡沫轴放松二头肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "坐或跪姿，把上臂内侧放在泡沫轴上",
            "前后缓慢滚动上臂",
            "停留在紧张点"
          ],
          "cues": [
            "不压肘窝",
            "速度慢",
            "手臂放松"
          ],
          "image": "/subpkg/exercises/warmup_push_03.jpg"
        }
      ],
      "activate": [
        {
          "name": "胸廓扩张激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "四点跪或侧卧，一只手放在脑后",
            "吸气时打开胸口、向上旋转",
            "呼气回到起始位"
          ],
          "cues": [
            "动作来自胸椎，不扭腰",
            "配合深呼吸",
            "转到最大幅度停 1–2 秒"
          ],
          "image": "/subpkg/exercises/warmup_push_04.jpg"
        },
        {
          "name": "前锯肌激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "四点跪或俯撑，双手撑地",
            "手臂伸直，把地面推远，让肩胛前伸",
            "慢慢回到肩胛中立"
          ],
          "cues": [
            "肘部保持伸直",
            "不要塌腰或耸肩",
            "感受腋下肋骨侧发力"
          ],
          "image": "/subpkg/exercises/warmup_push_05.jpg",
          "video": {
            "url": "https://www.douyin.com/video/7638569547629063665",
            "time": "5:17"
          }
        },
        {
          "name": "下斜方肌激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "俯卧或靠墙，手臂举成 Y 字",
            "肩胛向下向后收，把手臂抬离地面",
            "停 1–2 秒后慢放"
          ],
          "cues": [
            "不要耸肩",
            "重量用徒手或极轻",
            "感受肩胛下角附近发力"
          ],
          "image": "/subpkg/exercises/warmup_push_06.jpg",
          "video": {
            "url": "https://www.douyin.com/video/7638569547629063665",
            "time": "4:30"
          }
        },
        {
          "name": "手腕激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "双手十指交握或撑在地面",
            "绕环、屈伸手腕",
            "撑地时慢慢把重心前移"
          ],
          "cues": [
            "幅度由小到大",
            "不要压到疼痛",
            "卧推、推肩前必做"
          ],
          "image": "/subpkg/exercises/warmup_push_07.jpg",
          "video": {
            "url": "https://www.douyin.com/video/7638569547629063665",
            "time": "6:42"
          }
        },
        {
          "name": "肩袖激活（上肢训练前必做）",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "source": {
            "title": "ep.20",
            "url": "https://www.douyin.com/video/7574247205529647205"
          },
          "steps": [
            "弹力带固定在肘高，肘贴身屈 90°",
            "向外旋转前臂（外旋），再慢慢回",
            "换内旋方向重复"
          ],
          "cues": [
            "肘部始终贴在身侧",
            "慢速控制，不甩",
            "弹力带阻力轻"
          ],
          "image": "/subpkg/exercises/warmup_push_08.jpg"
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
          "dose": "每部位 30–60 秒",
          "steps": [
            "仰卧，把按摩球放在两侧肩胛骨之间",
            "小范围移动找到紧张点",
            "停留并深呼吸"
          ],
          "cues": [
            "避开脊柱",
            "双臂交叉抱胸可加大压力",
            "力度可以忍受"
          ],
          "image": "/subpkg/exercises/warmup_pull_01.jpg"
        },
        {
          "name": "放松菱形肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "仰卧，按摩球放在肩胛骨内缘",
            "手臂向对侧伸，拉开肩胛",
            "缓慢移动停留"
          ],
          "cues": [
            "避开脊柱",
            "呼气时放松",
            "不要压到疼痛"
          ],
          "image": "/subpkg/exercises/warmup_pull_02.jpg"
        },
        {
          "name": "放松大圆肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "侧卧，泡沫轴放在腋后侧",
            "手臂举过头",
            "小幅上下滚动"
          ],
          "cues": [
            "位置在肩胛骨外下缘",
            "速度慢",
            "避开腋窝正中"
          ],
          "image": "/subpkg/exercises/warmup_pull_03.jpg"
        },
        {
          "name": "放松冈下肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "仰卧或靠墙，按摩球放在肩胛骨中部",
            "找到酸胀点后停留",
            "可配合手臂缓慢内外旋"
          ],
          "cues": [
            "力度中等",
            "不压肩峰",
            "出现麻木时停止"
          ],
          "image": "/subpkg/exercises/warmup_pull_04.jpg"
        },
        {
          "name": "放松三头肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "侧卧或坐姿，把上臂后侧放在泡沫轴上",
            "前后缓慢滚动",
            "停留在紧张点"
          ],
          "cues": [
            "不压肘尖",
            "手臂放松",
            "速度慢"
          ],
          "image": "/subpkg/exercises/warmup_pull_05.jpg"
        }
      ],
      "activate": [
        {
          "name": "弹力带热身",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "双手握弹力带，与肩同宽，手臂前平举",
            "向两侧拉开到胸前",
            "慢慢回位"
          ],
          "cues": [
            "肩胛内收",
            "不耸肩",
            "控制回程"
          ],
          "image": "/subpkg/exercises/warmup_pull_06.jpg"
        },
        {
          "name": "前锯肌激活",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "四点跪或俯撑，双手撑地",
            "手臂伸直，把地面推远，让肩胛前伸",
            "慢慢回到肩胛中立"
          ],
          "cues": [
            "肘部保持伸直",
            "不要塌腰或耸肩",
            "感受腋下肋骨侧发力"
          ],
          "image": "/subpkg/exercises/warmup_push_05.jpg"
        },
        {
          "name": "肩胛下肌训练",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "弹力带固定在体侧，肘贴身屈 90°",
            "向内旋转前臂拉向腹部",
            "慢慢回到起始位"
          ],
          "cues": [
            "肘不离身",
            "动作缓慢",
            "阻力轻"
          ],
          "image": "/subpkg/exercises/warmup_pull_08.jpg"
        },
        {
          "name": "蜘蛛式",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "俯撑，一只脚迈到同侧手外侧",
            "髋向下沉，保持 2–3 秒",
            "同侧手向上打开胸椎旋转"
          ],
          "cues": [
            "后腿伸直",
            "核心收紧",
            "左右交替"
          ],
          "image": "/subpkg/exercises/warmup_pull_09.jpg"
        },
        {
          "name": "手肘搭平板凳",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "steps": [
            "跪在平板凳前，双肘搭在凳面上",
            "臀部向后坐，胸口向下沉",
            "在拉伸位停留呼吸"
          ],
          "cues": [
            "感受背阔和腋下拉伸",
            "可以手持木棒",
            "不要塌腰"
          ],
          "image": "/subpkg/exercises/warmup_pull_10.jpg"
        },
        {
          "name": "肩袖激活（上肢训练前必做）",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "source": {
            "title": "ep.20",
            "url": "https://www.douyin.com/video/7574247205529647205"
          },
          "steps": [
            "弹力带固定在肘高，肘贴身屈 90°",
            "向外旋转前臂（外旋），再慢慢回",
            "换内旋方向重复"
          ],
          "cues": [
            "肘部始终贴在身侧",
            "慢速控制，不甩",
            "弹力带阻力轻"
          ],
          "image": "/subpkg/exercises/warmup_push_08.jpg"
        }
      ],
      "video": {
        "url": "https://www.douyin.com/video/7638569547629063665",
        "time": "7:38",
        "note": "背部热身开始"
      }
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
          "dose": "每部位 30–60 秒",
          "steps": [
            "坐地，把小腿放在泡沫轴上",
            "另一条腿叠加增加压力",
            "前后缓慢滚动并转动脚尖"
          ],
          "cues": [
            "避开跟腱",
            "速度慢",
            "停在紧张点"
          ],
          "image": "/subpkg/exercises/warmup_legs_01.jpg"
        },
        {
          "name": "放松腘绳肌",
          "dose": "每部位 30–60 秒",
          "steps": [
            "坐地，大腿后侧放在泡沫轴上",
            "双手撑地抬臀",
            "从膝上方滚到坐骨下方"
          ],
          "cues": [
            "不压膝窝",
            "可单腿进行",
            "速度慢"
          ],
          "image": "/subpkg/exercises/warmup_legs_02.jpg"
        },
        {
          "name": "放松臀部",
          "dose": "每部位 30–60 秒",
          "steps": [
            "坐在泡沫轴或按摩球上，一侧脚踝搭在对侧膝上",
            "身体偏向搭腿一侧",
            "小幅滚动找紧张点"
          ],
          "cues": [
            "力度可忍受",
            "出现腿麻立即停止",
            "呼气时放松"
          ],
          "image": "/subpkg/exercises/warmup_legs_03.jpg"
        },
        {
          "name": "放松大腿内外侧",
          "dose": "每部位 30–60 秒",
          "steps": [
            "侧卧或俯卧，把大腿外侧或内侧放在泡沫轴上",
            "上方腿撑地控制压力",
            "缓慢滚动"
          ],
          "cues": [
            "外侧可能很酸，压力要适度",
            "不压膝关节",
            "速度慢"
          ],
          "image": "/subpkg/exercises/warmup_legs_04.jpg"
        }
      ],
      "activate": [
        {
          "name": "青蛙趴（髋）",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "steps": [
            "俯撑，双膝分开，小腿和脚内侧贴地",
            "臀部缓慢向后推",
            "在拉伸位停留"
          ],
          "cues": [
            "脊柱保持中立",
            "膝部疼痛时缩小幅度",
            "深呼吸放松"
          ],
          "image": "/subpkg/exercises/warmup_legs_05.jpg"
        },
        {
          "name": "单腿站立（踝）",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "steps": [
            "单脚站立，膝盖微屈",
            "保持身体稳定",
            "可闭眼或站在软垫上加难度"
          ],
          "cues": [
            "足弓保持立起",
            "骨盆水平",
            "可扶墙开始"
          ],
          "image": "/subpkg/exercises/warmup_legs_06.jpg"
        },
        {
          "name": "飞机转圈",
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "单腿站立，身体前倾，双臂打开",
            "骨盆向外打开再向内关闭",
            "慢慢回到中立位"
          ],
          "cues": [
            "支撑腿稳定",
            "动作慢",
            "可扶物"
          ],
          "image": "/subpkg/exercises/warmup_legs_07.jpg"
        }
      ],
      "video": {
        "url": "https://www.douyin.com/video/7638569547629063665",
        "time": "13:30",
        "note": "下肢热身开始"
      }
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
          "dose": "2–3 组 × 10–15 次，不疲劳为度",
          "steps": [
            "弹力带或轻哑铃，肘屈 90°、前臂外旋竖直",
            "从外旋位向上推起",
            "慢慢回到外旋位"
          ],
          "cues": [
            "负荷很轻",
            "肩胛下沉",
            "不要耸肩"
          ],
          "image": "/subpkg/exercises/warmup_shoulder_01.jpg"
        },
        {
          "name": "头枕地对抗地面",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "steps": [
            "四点跪，额头或头顶轻抵地面",
            "用颈部轻轻对抗地面，保持几秒",
            "放松后重复"
          ],
          "cues": [
            "力度轻",
            "颈部疼痛时停止",
            "不憋气"
          ],
          "image": "/subpkg/exercises/warmup_shoulder_02.jpg"
        },
        {
          "name": "泡沫轴支撑",
          "dose": "2–3 组 × 20–30 秒，不疲劳为度",
          "steps": [
            "跪姿或俯撑，前臂压在泡沫轴上",
            "把泡沫轴向前推出，再拉回",
            "保持肩胛稳定"
          ],
          "cues": [
            "核心收紧",
            "不塌腰",
            "幅度从小开始"
          ],
          "image": "/subpkg/exercises/warmup_shoulder_03.jpg"
        }
      ]
    }
  }
};
