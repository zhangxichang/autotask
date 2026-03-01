import type { Task, TaskRelation } from "../types/task";

/**
 * 假数据 - 任务列表
 */
export const mockTasks: Task[] = [
  {
    id: "1",
    name: "修复登录页面的样式问题",
    description:
      "登录表单在移动设备上显示不正确，需要调整响应式布局。特别是在小屏幕设备上，输入框和按钮的间距需要优化。",
    image: "node:18-alpine",
    prerequisites: [],
    script: `#!/bin/bash
echo "修复登录页面样式..."
cd /src/components/login
npm run fix:style
npm run test:visual`,
  },
  {
    id: "2",
    name: "实现用户注册功能",
    description:
      "添加用户注册页面，包括邮箱验证、密码强度检查等功能。需要集成邮件发送服务。",
    image: "node:18-alpine",
    prerequisites: ["1"],
    script: `#!/bin/bash
echo "开始用户注册功能开发..."
cd /src/auth
npm install nodemailer
npm run dev`,
  },
  {
    id: "3",
    name: "优化数据库查询性能",
    description: "用户列表查询响应时间过长，需要添加索引并优化 SQL 查询语句。",
    image: "mysql:8.0",
    prerequisites: [],
    script: `#!/bin/bash
echo "优化数据库查询..."
mysql -u root -p < optimize_queries.sql
echo "添加索引完成"`,
  },
  {
    id: "4",
    name: "更新项目文档",
    description: "补充 API 接口文档，更新部署指南。",
    image: "node:18-alpine",
    prerequisites: ["3"],
    script: `#!/bin/bash
echo "生成文档..."
npm run docs:build
scp -r docs/dist server:/var/www/docs/`,
  },
  {
    id: "5",
    name: "集成支付网关",
    description:
      "接入支付宝和微信支付，实现订单支付功能。需要处理支付回调和订单状态同步。",
    image: "node:18-alpine",
    prerequisites: ["2", "3"],
    script: `#!/bin/bash
echo "配置支付网关..."
npm install @alipay/sdk @wechat/pay
node scripts/setup-payment.js`,
  },
  {
    id: "6",
    name: "添加单元测试",
    description: "为核心业务逻辑模块编写单元测试，目标覆盖率 80% 以上。",
    image: "node:18-alpine",
    prerequisites: ["5"],
    script: `#!/bin/bash
echo "运行单元测试..."
npm run test:unit -- --coverage
if [ $? -eq 0 ]; then
  echo "测试通过"
else
  echo "测试失败"
  exit 1
fi`,
  },
  {
    id: "7",
    name: "修复内存泄漏问题",
    description:
      "用户反馈长时间运行后系统变慢，经排查发现存在内存泄漏，需要修复。",
    image: "node:18-alpine",
    prerequisites: [],
    script: `#!/bin/bash
echo "分析内存泄漏..."
node --inspect scripts/memory-profile.js
npm run test:memory`,
  },
  {
    id: "8",
    name: "设计新的首页布局",
    description: "根据产品需求重新设计首页，增加数据概览面板和快捷操作入口。",
    image: "nginx:alpine",
    prerequisites: ["1"],
    script: `#!/bin/bash
echo "构建首页..."
npm run build:home
echo "部署到预览环境..."
./deploy-preview.sh home`,
  },
  {
    id: "9",
    name: "实现文件上传功能",
    description:
      "支持图片、文档等多种格式的文件上传，需要实现文件类型检查和大文件分片上传。",
    image: "node:18-alpine",
    prerequisites: ["8"],
    script: `#!/bin/bash
echo "配置文件上传..."
mkdir -p /uploads/{images,documents}
npm install multer sharp
node scripts/setup-upload.js`,
  },
  {
    id: "10",
    name: "配置 CI/CD 流水线",
    description: "设置 GitHub Actions 实现自动化测试和部署。",
    image: "docker:latest",
    prerequisites: ["6", "7"],
    script: `#!/bin/bash
echo "部署到生产环境..."
docker build -t app:latest .
docker push registry/app:latest
kubectl rollout restart deployment/app`,
  },
  {
    id: "11",
    name: "优化首屏加载速度",
    description: "通过代码分割、懒加载等技术手段减少首屏加载时间。",
    image: "node:18-alpine",
    prerequisites: ["8"],
    script: `#!/bin/bash
echo "分析打包体积..."
npm run analyze
npm run build:prod
echo "优化完成"`,
  },
  {
    id: "12",
    name: "添加数据导出功能",
    description: "支持将报表数据导出为 Excel 和 PDF 格式。",
    image: "node:18-alpine",
    prerequisites: ["9"],
    script: `#!/bin/bash
echo "安装导出依赖..."
npm install xlsx pdfkit
npm run test:export
npm run build`,
  },
];

/**
 * 假数据 - 任务关系
 * 描述任务之间的依赖、并行、条件依赖关系
 */
export const mockTaskRelations: TaskRelation[] = [
  // 用户注册功能依赖于登录页面修复
  { from: "2", to: "1", type: "depends_on" },

  // 文档更新依赖于数据库优化
  { from: "4", to: "3", type: "depends_on" },

  // 支付网关依赖于用户注册和数据库优化（并行依赖）
  { from: "5", to: "2", type: "depends_on" },
  { from: "5", to: "3", type: "depends_on" },

  // 单元测试依赖于支付网关，且需要测试通过（条件依赖示例）
  { from: "6", to: "5", type: "depends_on" },
  { from: "6", to: "5", type: "condition", condition: "exit_code == 0" },

  // 首页布局依赖于登录页面修复
  { from: "8", to: "1", type: "depends_on" },

  // 文件上传与首页布局可以并行开发
  { from: "9", to: "8", type: "depends_on" },
  { from: "9", to: "8", type: "parallel" },

  // CI/CD 流水线依赖于单元测试和内存修复
  { from: "10", to: "6", type: "depends_on" },
  { from: "10", to: "7", type: "depends_on" },

  // 首屏加载优化与首页布局并行
  { from: "11", to: "8", type: "depends_on" },
  { from: "11", to: "8", type: "parallel" },

  // 数据导出依赖于文件上传
  { from: "12", to: "9", type: "depends_on" },
  { from: "12", to: "9", type: "condition", condition: "upload_size > 0" },
];

/**
 * 获取目标任务的完整前置依赖链（所有上游任务）
 * @param targetTaskId - 目标任务ID
 * @returns 相关任务ID集合（包括目标任务本身和所有前置任务）
 */
export function getRelatedTaskIds(targetTaskId: string): Set<string> {
  const relatedIds = new Set<string>([targetTaskId]);
  const visited = new Set<string>();
  const queue: string[] = [targetTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // 只查找当前任务依赖的上游任务（前置任务）
    // 关系格式: { from: "依赖方", to: "被依赖方", type: "depends_on" }
    // 即 "from" depends_on "to"，"to" 是 "from" 的前置任务
    for (const relation of mockTaskRelations) {
      if (relation.from === currentId && relation.type === "depends_on") {
        // relation.to 是当前任务依赖的前置任务
        if (!relatedIds.has(relation.to)) {
          relatedIds.add(relation.to);
          queue.push(relation.to);
        }
      }
    }
  }

  return relatedIds;
}

/**
 * 获取指定任务的关系列表
 * @param taskId - 任务ID
 * @returns 与该任务相关的关系列表
 */
export function getTaskRelations(taskId: string): TaskRelation[] {
  return mockTaskRelations.filter((r) => r.from === taskId || r.to === taskId);
}
