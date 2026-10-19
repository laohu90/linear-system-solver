export interface PresetProblem {
  id: string;
  category: '基础练习' | '中考常考' | '变式去括号与去分母' | '特殊解判定' | '经典实际应用题';
  title: string;
  difficulty: '基础' | '中等' | '拔高';
  eq1Str: string;
  eq2Str: string;
  desc?: string;
  applicationContext?: {
    story: string;
    letVars: string; // 设未知数
    equationsSetup: string; // 依题意列出方程组
    answerConclusion: string; // 答语
  };
}

export const PRESET_PROBLEMS: PresetProblem[] = [
  {
    id: 'basic-1',
    category: '基础练习',
    title: '代入法入门：系数为 1 的典型方程组',
    difficulty: '基础',
    eq1Str: 'x - y = 3',
    eq2Str: '3x - 8y = 14',
    desc: '初一课本基础例题。由①得 x = y + 3，再代入②中即可迅速消去 x。',
  },
  {
    id: 'basic-2',
    category: '基础练习',
    title: '加减法入门：系数互为相反数',
    difficulty: '基础',
    eq1Str: '2x + 3y = 12',
    eq2Str: '5x - 3y = 9',
    desc: '未知数 y 的系数分别为 +3 和 -3，互为相反数。只需两式相加 ① + ② 即可秒杀消去 y！',
  },
  {
    id: 'basic-3',
    category: '基础练习',
    title: '加减法基础：系数相同相减消元',
    difficulty: '基础',
    eq1Str: '3x + 2y = 13',
    eq2Str: '3x - 2y = 5',
    desc: '未知数 x 的系数都是 3，相减 ① - ② 可以直接消去 x，解得 4y = 8。',
  },
  {
    id: 'exam-1',
    category: '中考常考',
    title: '中考高频：一般整系数加减消元',
    difficulty: '中等',
    eq1Str: '2x + 3y = 7',
    eq2Str: '3x - 2y = 4',
    desc: '各未知数系数均不为 1。消去 y 时，①×2 + ②×3 异号相加，计算简捷不易出错。',
  },
  {
    id: 'exam-2',
    category: '中考常考',
    title: '运算陷阱：减法去括号变号易错题',
    difficulty: '中等',
    eq1Str: '4x - 3y = 11',
    eq2Str: '2x - 5y = 9',
    desc: '由 ②×2 得 4x - 10y = 18。再用 ① - ③ 时注意 -3y - (-10y) = +7y 的符号变号。',
  },
  {
    id: 'exam-3',
    category: '中考常考',
    title: '分数解强化：结果为既约分数的经典计算',
    difficulty: '中等',
    eq1Str: '3x + 5y = 8',
    eq2Str: '4x - 2y = 5',
    desc: '运算结果包含规范中考常见分数解，锻炼初中学生分数四则混合运算基本功。',
  },
  {
    id: 'complex-1',
    category: '变式去括号与去分母',
    title: '综合化简：含括号的二元一次方程组',
    difficulty: '拔高',
    eq1Str: '2(x - 1) = 3y + 4',
    eq2Str: '3(x + y) - 2(x - y) = 15',
    desc: '先去括号并整理为标准 ax + by = c 形式，再选择消元法求解。',
  },
  {
    id: 'complex-2',
    category: '变式去括号与去分母',
    title: '综合化简：含分数系数的方程组',
    difficulty: '拔高',
    eq1Str: 'x/2 + y/3 = 5',
    eq2Str: 'x/3 - y/4 = 1',
    desc: '方程①两边同乘6去分母得 3x + 2y = 30；方程②两边同乘12得 4x - 3y = 12。',
  },
  {
    id: 'special-1',
    category: '特殊解判定',
    title: '两直线平行：无解情形',
    difficulty: '中等',
    eq1Str: '2x - 4y = 6',
    eq2Str: 'x - 2y = 5',
    desc: '两方程未知数系数成比例 (2:1 = -4:-2 = 2)，但常数项比为 6:5 ≠ 2。两直线平行，无公共解！',
  },
  {
    id: 'special-2',
    category: '特殊解判定',
    title: '两直线重合：无穷多组解',
    difficulty: '中等',
    eq1Str: '3x - 6y = 9',
    eq2Str: 'x - 2y = 3',
    desc: '方程①两边同除以3与方程②完全相同，在平面直角坐标系中表示同一条直线，有无穷多组解。',
  },
  {
    id: 'app-1',
    category: '经典实际应用题',
    title: '《孙子算经》经典：鸡兔同笼问题',
    difficulty: '基础',
    eq1Str: 'x + y = 35',
    eq2Str: '2x + 4y = 94',
    desc: '笼子里有鸡和兔若干只，从上面数有 35 个头，从下面数有 94 只脚。问鸡和兔各有多少只？',
    applicationContext: {
      story: '笼子里有鸡和兔若干只，从上面数有 35 个头，从下面数有 94 只脚。问笼中鸡、兔各有多少只？',
      letVars: '设鸡有 x 只，兔有 y 只。',
      equationsSetup: '根据“共有35个头”得 x + y = 35；根据“共有94只脚（鸡2只脚，兔4只脚）”得 2x + 4y = 94。',
      answerConclusion: '答：笼中有鸡 23 只，兔 12 只。',
    },
  },
  {
    id: 'app-2',
    category: '经典实际应用题',
    title: '工程配套问题：螺栓与螺母配套',
    difficulty: '中等',
    eq1Str: 'x + y = 22',
    eq2Str: '2 * 12x = 20y',
    desc: '某车间 22 名工人生产螺栓和螺母，每人每天平均生产螺栓 12 个或螺母 20 个。一个螺栓配两个螺母，如何分配工人才能刚好配套？',
    applicationContext: {
      story: '某机械厂车间有 22 名工人生产螺栓和螺母。每人每天平均生产螺栓 12 个或螺母 20 个。一个螺栓需配两个螺母。应分配多少人生产螺栓，多少人生产螺母，才能使每天生产的产品刚好配套？',
      letVars: '设安排 x 名工人生产螺栓，y 名工人生产螺母。',
      equationsSetup: '根据工人总数得 x + y = 22；根据一个螺栓配两个螺母（即螺母数 = 2 × 螺栓数）得 20y = 2 × 12x。',
      answerConclusion: '答：应安排 10 名工人生产螺栓，12 名工人生产螺母。',
    },
  },
  {
    id: 'app-3',
    category: '经典实际应用题',
    title: '行程与流水航行：顺水与逆水航行问题',
    difficulty: '拔高',
    eq1Str: '2x + 2y = 80',
    eq2Str: '2.5x - 2.5y = 80',
    desc: '一艘轮船在两个码头之间航行，顺水航行需 2 小时，逆水航行需 2.5 小时。两码头间距离为 80 千米。求轮船在静水中的速度和水流速度。',
    applicationContext: {
      story: '一艘轮船在 A、B 两个码头之间航行。顺水航行需 2 小时，逆水航行需 2.5 小时。已知 A、B 两码头间的航程为 80 千米。求轮船在静水中的速度和水流的速度。',
      letVars: '设轮船在静水中的航速为 x 千米/时，水流速度为 y 千米/时。',
      equationsSetup: '顺水速度为 (x+y)，航程等式：2(x + y) = 80；逆水速度为 (x-y)，航程等式：2.5(x - y) = 80。',
      answerConclusion: '答：轮船在静水中的航行速度为 36 千米/时，水流速度为 4 千米/时。',
    },
  },
];
