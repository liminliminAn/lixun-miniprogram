# 力训（lixun-miniprogram）

微信原生小程序：推/拉/腿三分化本地训练助手。一期无云开发、无自建后端，数据全部走 `wx.setStorageSync`。

## 如何打开

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本项目根目录（含 `project.config.json`）
3. AppID 可先用测试号 / `touristappid`（见 `project.config.json`）
4. 详情 → 本地设置：勾选「将 JS 编译成 ES5」等按需；**调试基础库选 3.5.5（推荐）**
5. 编译预览。首次进入会进入问卷（onboarding）

## 基础库

| 项 | 版本 |
| --- | --- |
| **最低** | **2.32.0** |
| **推荐（project.config.json libVersion）** | **3.5.5** |

## Storage keys（收敛后）

命名空间前缀 `lixun:v1:`。旧概念（onboardingDone / weekPlan / trainDates / settings）已并入下列键，**不要再散落多余 key**。

| Key | 说明 |
| --- | --- |
| `lixun:v1:profile` | 问卷档案：身高体重、性别、bfBand、goal、trainYears、daysPerWeek、jointLimit、**crowd**（classify 结果）、onboardingDone |
| `lixun:v1:plan` | 周课表：daysPerWeek + week[7]（周一→周日） |
| `lixun:v1:sessions` | 训练详单：`{ [YYYY-MM-DD]: SessionRecord }` |
| `lixun:v1:lastSets` | 上次重量预填：`{ [exerciseId]: { reps, weight } }`（与 sessions 并列） |
| `lixun:v1:bodyweight` | 体重列表：`{ date, kg }[]` |
| `lixun:v1:prefs` | 偏好：默认 `{ restSoftWarnDays: 3 }` |

常量与封装：`miniprogram/services/storage.ts` 的 `KEYS` / `get` / `set` / `remove`。

## 周历规则

- **4 练**：推, 拉, 腿, 休, 拉, 休, 休（去掉第二次推；周内第二次训练日类型为拉）
- **5 练**：推, 拉, 腿, 休, 推, 拉, 休

见 `miniprogram/constants/templates.ts`。

## 人群 classify

纯函数：`miniprogram/utils/classify.ts`（`services/profile.ts` 再导出）。

单测（Node）：

```bash
node tests/classify.test.js
```

规则顺序：jointLimit / 训练不到半年 / goal=beginner → beginner；goal=cut → cut；goal=bulk 且体脂很低/较低 → bulk，否则 recomp；goal=recomp → recomp；其它 → recomp。

## 主路径怎么点（一期 US）

1. **US-01** 首次打开 → 问卷（性别/身高体重/体脂区间/目标/年限/每周天数/关节限制）→ 写入 profile+plan → 跳「今日」
2. **US-02** 「今日」按 plan 显示推/拉/腿课表与「开练」（休息日无开练）
3. **US-03** 「开练」进 session：记组（组/次/重量），完成写入 sessions，并更新 lastSets 供下次预填
4. **US-04** 动作卡片可展开要点（tips + 占位图 + 禁忌占位）
5. **US-05** 「记录」：体重录入/列表；连练 **>3** 天软提示（`prefs.restSoftWarnDays`），**不拦截开练**

五 Tab：**今日 / 计划 / 记录 / 饮食 / 我的**。饮食一期只读：文案「第二期开放宏量目标」+ 按 `profile.crowd` 展示 `crowds` 饮食原则。

## 第一期范围 / 不做

- 做：问卷分人群、推拉腿课表、今日开练记组、上次重量预填、动作要点卡、体重与连练休息提示、饮食只读原则
- 不做：自建后端、云开发、社交、搬运抖音视频、宏量追踪（二期）

## 目录摘要

```
lixun-miniprogram/
├── miniprogram/          # 小程序源码
│   ├── constants/        # crowds / exercises / templates
│   ├── services/         # storage / profile / workout / body
│   ├── utils/            # date / classify
│   ├── components/       # set-logger / exercise-card / weight-chart / rest-tip
│   └── pages/            # today plan log diet me onboarding session
├── tests/classify.test.js
├── typings/
├── project.config.json
├── tsconfig.json
└── README.md
```




## UI · Ink & Ember

- 设计系统：**Ink & Ember**（亮色默认 + `@media (prefers-color-scheme: dark)`）
- 主色 accent：`#E4572E`（dark `#FF6B45`）
- Token 源：`miniprogram/app.wxss`
- tabBar `selectedColor` / 主 CTA 均用 accent

### App 图标（正式）

| 路径 | 用途 |
| --- | --- |
| `miniprogram/assets/icon/tan-app-icon-1024.png` | **正式上传原图**（微信公众平台小程序图标） |
| `miniprogram/assets/icon/tan-app-icon-512.png` | 备用高清 |
| `miniprogram/assets/icon/tan-app-icon-144.png` | 本地预览 / 小边长 |

`project.config.json` 字段 `appIconPath` 指向 1024 路径（团队约定；后台上传仍在微信公众平台完成）。

预览对照图：`miniprogram/assets/previews/01-onboarding.jpg` … `05-mine.jpg`（不嵌入运行时）。

## 连练统计

`listTrainDates` **仅统计带 `completedAt` 的完成日**；一点「开练」写入的草稿 session 不计入连练软提示。

## cut + very_low

问卷 `goal=cut` 且 `bfBand=very_low` 时人群仍为 cut，提交后弹软提示（不改档）。
