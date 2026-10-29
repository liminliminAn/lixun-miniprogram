
## 2026-10-28 09:46–10:10 (Asia/Shanghai): product review redraw (6 files, ≤5 KB each)
- warmup_legs_05 青蛙趴: bird's-eye view, knees wide, shins parallel pointing back; generated arrow pointed the wrong way, so it was repainted with PIL to point backward (hips sit back). Hands on floor instead of forearms (imperfect).
- posture_anterior_pelvic_tilt_01 死虫: supine, both arms vertical, hips/knees 90° tabletop, arrow on one leg extending.
- posture_shoulder_impingement_02 跪姿死虫: posture.json has only name + cue "肩胛下肌离心控制" (no steps). Drawn as quadruped, one hand pressing down (teal down arrow), the other arm slowly reaching forward (arrow forward). Legs stay on the floor, unlike bird-dog, which extends the opposite leg.
- posture_forward_head_01 收下巴: side profile facing left, horizontal arrow pointing backward at the chin, head level.
- posture_rounded_shoulders_03 胸椎伸展: roller under upper back/shoulder blades, hands behind head; arrow drawn with PIL arcing backward/down over the head.
- warmup_legs_06 单腿站立: static stand, other knee raised to hip height, hands on hips.
Subpkg webp total now 296564 B (289.6 KB). Sources: design/exercise-art/sources/<id>.jpg.

## 2026-10-29 (Asia/Shanghai): arrow clarity fix (user feedback)
Old arrows painted out of sources/<id>.jpg; redrawn with /workspace/it2build/arrowfix.py: 11px teal #2EE6C5 stroke, dark outline, solid triangular head.
- warmup_legs_05: straight arrow from hips down toward heels (sit back). 4652 B
- posture_rounded_shoulders_03: arc over head, back/down. 4878 B
- posture_anterior_pelvic_tilt_01: leg-extension arrow out/down + arm arc back overhead (opposite limbs). 4864 B
- posture_shoulder_impingement_02: thicker forward-reach + press-down arrows. 3922 B
Subpkg total: 299326 B.

## 2026-10-29 (Asia/Shanghai): arrow clarity pass 2 (46 files)
Same style (10px #2EE6C5, dark edge, solid head; 8px/6px for tight spots). Drawn on top of the old thin arrow along the same path, so the old one is covered. No masters existed except sources/*.jpg, so input = current 480 WebP (pre-fix copies in /workspace/it2build/pre-arrowfix2-webp/).
- back_extension: 4668 B
- bench_press: 4922 B
- bulgarian_split_squat: 4958 B
- cable_curl: 4662 B
- front_goblet_squat: 4972 B
- incline_db_press: 4936 B
- posture_forward_head_01: 2912 B
- posture_forward_head_02: 3716 B
- posture_forward_head_03: 4696 B
- posture_low_back_01: 4958 B
- posture_low_back_02: 4290 B
- posture_low_back_03: 4450 B
- posture_rounded_shoulders_01: 4578 B
- posture_rounded_shoulders_02: 4958 B
- posture_shoulder_impingement_01: 4928 B
- posture_shoulder_impingement_03: 4646 B
- rdl: 4936 B
- selfcheck_anterior_pelvic_tilt: 3952 B
- selfcheck_forward_head: 3892 B
- selfcheck_low_back: 4668 B
- selfcheck_rounded_shoulders: 4010 B
- selfcheck_shoulder_impingement: 4982 B
- single_leg_rdl: 4658 B
- skull_crusher: 4848 B
- warmup_legs_01: 4952 B
- warmup_legs_02: 4896 B
- warmup_legs_04: 4926 B
- warmup_legs_06: 3896 B
- warmup_legs_07: 4356 B
- warmup_pull_01: 3582 B
- warmup_pull_02: 4960 B
- warmup_pull_03: 4822 B
- warmup_pull_06: 4256 B
- warmup_pull_08: 4826 B
- warmup_pull_09: 4402 B
- warmup_pull_10: 4888 B
- warmup_push_01: 4880 B
- warmup_push_02: 4844 B
- warmup_push_04: 4960 B
- warmup_push_05: 4888 B
- warmup_push_06: 3540 B
- warmup_push_07: 4988 B
- warmup_push_08: 4640 B
- warmup_shoulder_02: 4916 B
- warmup_shoulder_03: 4972 B
- wide_row: 4926 B
Fixed direction: posture_low_back_02 arm arrow now points forward (bird-dog reach). No arrow added to: dips, machine_row, neutral_pulldown, y_raise, warmup_legs_03, warmup_pull_04, warmup_pull_05, warmup_push_03, warmup_shoulder_01.
Subpkg total: 294650 B.

## 2026-10-29 (Asia/Shanghai): arrow pass 3, directions checked against posture.json text
- wide_row 4886 B: arrows reversed, from hands up along the arms to the shoulders/torso (the pull).
- posture_low_back_03 侧桥 3836 B: cue「肘在肩正下方，身体成直线」, dose 20–30 秒 = static hold; hip arrow removed.
- selfcheck_low_back 4302 B: how「记录久坐、弯腰或训练后腰背酸痛的程度和持续时间」= observation, no movement; arrow removed.
- selfcheck_anterior_pelvic_tilt 4046 B: how「仰卧屈膝，用手伸进腰下与地面的空隙」; arrow = hand sliding into the gap under the waist.
- selfcheck_shoulder_impingement 4912 B: how「上臂外展约 90°、屈肘 90°，前臂向上外旋」; arrow reversed, now sweeping up to the vertical forearm (old one pointed down).
Subpkg total: 293654 B.
